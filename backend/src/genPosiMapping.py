import pandas as pd
import re, os, shutil, json
from pathlib import Path

MESSY_DATA = "messy_data.csv"
OUTPUT_DATA = "output_data.csv"
SCRIPT = "script.py"

def context_based_swap(script, input_tbl, _):
    # Construct context words based on the content within quotes
    strings = re.findall(r'\'(.*?)\'|\"(.*?)\"', script)
    context_words = set([s[0] or s[1] for s in strings])
    
    # Swap non-context words with their coordinates in the new data
    new_data = []
    for row_idx, row in enumerate(input_tbl):
        new_row = []
        for col_idx, cell_value in enumerate(row):
            if cell_value and cell_value not in context_words:
                new_row.append(f'({row_idx},{col_idx})') 
            else:
                new_row.append(cell_value)
        new_data.append(new_row)
    
    # Write the new data to a swapped file
    swapped_file = 'ctx_swap.csv'
    # with open(swapped_file, 'w', encoding='utf-8', newline='') as file:
    #    writer = csv.writer(file)  
    #    writer.writerows(new_data)  
    pd.DataFrame(new_data).to_csv(swapped_file, index=False, header=False)
    
    # Replace the input table file name in the script with the new file name and re-execute
    new_script = script.replace(MESSY_DATA, swapped_file)
    script_namespace = {}
    exec(new_script, None, script_namespace)
    coordinate_mapping = get_output_tbl(script_namespace)
    
    return coordinate_mapping


def target_based_swap(script, input_tbl, output_tbl):
    # Construct target words based on values in the output table
    target_words = set()
    for i in range(output_tbl.shape[0]):
        for j in range(output_tbl.shape[1]):
            target_words.add(output_tbl.iloc[i, j])
    

    # Swap target words with their coordinates in the new data
    new_data = []
    for row_idx, row in enumerate(input_tbl):
        new_row = []
        for col_idx, cell_value in enumerate(row):
            if cell_value and cell_value in target_words:
                new_row.append(f'({row_idx},{col_idx})')
            else:
                new_row.append(cell_value)
        new_data.append(new_row)
    
    # Write the new data to a swapped file
    swapped_file = 'tgt_swap.csv'
    # with open(swapped_file, 'w', encoding='utf-8', newline='') as file:
    #    writer = csv.writer(file)  
    #    writer.writerows(new_data)  
    pd.DataFrame(new_data).to_csv(swapped_file, index=False, header=False)
    
    # Replace the input table file name in the script with the new file name and re-execute
    new_script = script.replace(MESSY_DATA, swapped_file)
    script_namespace = {}
    exec(new_script, None, script_namespace)
    coordinate_mapping = get_output_tbl(script_namespace)
    
    return coordinate_mapping


SWAP_METHODS = {
    "ctx": context_based_swap,
    "tgt": target_based_swap
}



# target2source_mapping
# Use coordinate_mapping.iloc[obs_id, var_id] to access the corresponding cells

def source2target_mapping(df_messy, coordinate_mapping):
    new_output_tbl = pd.DataFrame(columns=coordinate_mapping.columns)
    in2out = dict()
    for i in range(coordinate_mapping.shape[0]):
        row = []
        for j in range(coordinate_mapping.shape[1]):
            in_posi = coordinate_mapping.iloc[i,j]
            if in_posi.startswith('(') and in_posi.endswith(')'):
                numbers_str = in_posi[1:-1].split(',')
                numbers_int = [int(num_str) for num_str in numbers_str]
                value = df_messy.iloc[numbers_int[0], numbers_int[1]]

                if in_posi not in in2out:
                    in2out[in_posi] = []
                in2out[in_posi].append(f'({i+1},{j})')
            else:
                value = in_posi
            row.append(value)
        new_output_tbl.loc[i] = row

    new_output_tbl
                
    return new_output_tbl, in2out


def get_unused_areas(input_tbl, in2out):
    
    unused_cells = []
    for row_idx, row in enumerate(input_tbl):
        for col_idx, cell_value in enumerate(row):
            in_posi = f'({row_idx},{col_idx})'
            if in_posi not in in2out:
                unused_cells.append(in_posi)
                
    return unused_cells


def copy_and_rename_csv(path):
    # Ensure path is a Path object
    path = Path(path).resolve()
    parent_directory = path.parent

    # Find CSV files in the parent directory
    csv_files = list(parent_directory.glob("*.csv"))
    if not csv_files:
        raise FileNotFoundError("No CSV files found in the parent directory")
    
    csv_file = csv_files[0]
    target_file = path / MESSY_DATA
    shutil.copy(csv_file, target_file)


def get_output_tbl(script_namespace):
    # return script_namespace['df_clean']
    dataframes = [var for var in script_namespace.values() if isinstance(var, pd.DataFrame)]
    return dataframes[-1] if dataframes else None


def compare_differences(df1, df2):
    differences = {}
    for row_idx in range(df1.shape[0]):
        for col_idx in range(df1.shape[1]):
            if df1.iloc[row_idx, col_idx] != df2.iloc[row_idx, col_idx]:
                differences[f'({row_idx}, {col_idx})'] = [df1.iloc[row_idx, col_idx], df2.iloc[row_idx, col_idx]]

    return differences


def gen_coordinate_mapping(script_path, save_data=True):
    
    original_directory = os.getcwd()  # Save the current working directory

    path = Path(script_path).resolve()
    copy_and_rename_csv(path)

    os.chdir(path)  # Change to the target directory
    
    with open(SCRIPT, 'r', encoding='utf-8') as file:
        script = file.read()

    # Read input_tbl as a 2D array
    # with open(input_tbl_file, 'r', encoding='utf-8') as file:
    #    reader = csv.reader(file)
    #    data = list(reader) 
    df_messy = pd.read_csv(MESSY_DATA, dtype=str, keep_default_na=False, header=None)
    input_tbl = df_messy.values # .to_json(orient='values') 

    # Execute the given script and retrieve the output table
    script_namespace = {}
    exec(script, None, script_namespace)
    output_tbl = get_output_tbl(script_namespace)
    output_tbl = output_tbl.fillna('').astype(str)

    res_data = {}
    for method in SWAP_METHODS.keys():
         coord_map = SWAP_METHODS[method](script, input_tbl, output_tbl)
         coord_map = coord_map.fillna('').astype(str)
         new_output_tbl, in2out = source2target_mapping(df_messy, coord_map)
         unused = get_unused_areas(input_tbl, in2out)
         res_data[method + "_coord_map"] = coord_map
         res_data[method + "_coord_output"] = new_output_tbl
        #  output_comparison = new_output_tbl.equals(output_tbl) 
         output_differences = compare_differences(output_tbl, new_output_tbl)
         res_data[method + "_coord_info"] = {"in2out": in2out, "unused": unused, "output_differences": output_differences}

    # ctx_coord_map = context_based_swap(script, input_tbl)
    # ctx_in2out = source2target_mapping(ctx_coord_map)
    # ctx_unused = get_unused_areas(input_tbl, ctx_in2out)

    # tgt_coord_map = target_based_swap(script, input_tbl, output_tbl)
    # tgt_in2out = source2target_mapping(ctx_coord_map)
    # tgt_unused = get_unused_areas(input_tbl, ctx_in2out)

    if save_data:
        output_tbl.to_csv(OUTPUT_DATA, index=False)
        for name, data in res_data.items():
            if isinstance(data, dict):
                with open(name + ".json", 'w') as f:
                    json.dump(data, f)
            elif isinstance(data, pd.DataFrame):
                data.to_csv(name + ".csv", index=False)

    os.chdir(original_directory)  # Change back to the original directory
    

if __name__ == '__main__':

    for root, dirs, files in os.walk("."):
        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            if len(dir_path.strip('/').split("/")) == 4:
                gen_coordinate_mapping(dir_path)

    # gen_coordinate_mapping('cases/1. university_rank/context-based')
    # gen_coordinate_mapping('cases/1. university_rank/position-based')
    # gen_coordinate_mapping('cases/2. model_results/1st round')
    # gen_coordinate_mapping('cases/2. model_results/2nd round')
    
