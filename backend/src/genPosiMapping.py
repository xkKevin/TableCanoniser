import pandas as pd
import numpy as np
import re, os, shutil, json
from pathlib import Path

MESSY_DATA = "messy_data.csv"
OUTPUT_DATA = "output_data.csv"
SCRIPT = "script.py"


def context_based_swap(script, input_tbl, _):
    # Construct context words based on the content within quotes
    strings = re.findall(r"\'(.*?)\'|\"(.*?)\"", script)
    context_words = set([s[0] or s[1] for s in strings])

    input_tbl = input_tbl.values
    # Swap non-context words with their coordinates in the new data
    new_data = []
    for row_idx, row in enumerate(input_tbl):
        new_row = []
        for col_idx, cell_value in enumerate(row):
            if cell_value and cell_value not in context_words:
                new_row.append(f"[{row_idx},{col_idx}]")
            else:
                new_row.append(cell_value)
        new_data.append(new_row)

    # Write the new data to a swapped file
    swapped_file = "ctx_swap.csv"
    # with open(swapped_file, 'w', encoding='utf-8', newline='') as file:
    #    writer = csv.writer(file)
    #    writer.writerows(new_data)
    pd.DataFrame(new_data).to_csv(swapped_file, index=False, header=False)

    # Replace the input table file name in the script with the new file name and re-execute
    new_script = script.replace(MESSY_DATA, swapped_file)
    script_namespace = {}
    try:
        exec(new_script, None, script_namespace)
    except Exception as e:
        return False, e, None
    else:
        coordinate_mapping = get_output_tbl(script_namespace)
        return True, coordinate_mapping, None


def target_based_swap(script, input_tbl, output_tbl):
    # Construct target words based on values in the output table
    target_words = set()
    for i in range(output_tbl.shape[0]):
        for j in range(output_tbl.shape[1]):
            target_words.add(output_tbl.iloc[i, j])

    input_tbl = input_tbl.values
    # Swap target words with their coordinates in the new data
    new_data = []
    for row_idx, row in enumerate(input_tbl):
        new_row = []
        for col_idx, cell_value in enumerate(row):
            if cell_value and cell_value in target_words:
                new_row.append(f"[{row_idx},{col_idx}]")
            else:
                new_row.append(cell_value)
        new_data.append(new_row)

    # Write the new data to a swapped file
    swapped_file = "tgt_swap.csv"
    # with open(swapped_file, 'w', encoding='utf-8', newline='') as file:
    #    writer = csv.writer(file)
    #    writer.writerows(new_data)
    pd.DataFrame(new_data).to_csv(swapped_file, index=False, header=False)

    # Replace the input table file name in the script with the new file name and re-execute
    new_script = script.replace(MESSY_DATA, swapped_file)
    script_namespace = {}
    try:
        exec(new_script, None, script_namespace)
    except Exception as e:
        return False, e, None
    else:
        coordinate_mapping = get_output_tbl(script_namespace)
        return True, coordinate_mapping, None


def neighbor_based_comparison(_, input_tbl, output_tbl):
    coordinate_mapping = pd.DataFrame(columns=output_tbl.columns)
    output_keys = output_tbl.keys()
    ambiguous_posi = {}
    try:
        for i in range(output_tbl.shape[0]):
            col_map = {}
            ambiguous_map = {}
            rx = []
            cy = []
            for j in range(output_tbl.shape[1]):
                if not output_tbl.iloc[i, j]:
                    col_map[output_keys[j]] = output_tbl.iloc[i, j]
                    continue
                posi_comp = input_tbl.eq(output_tbl.iloc[i, j])
                stacked_posi = posi_comp.stack()
                posi_map = list(stacked_posi[stacked_posi].index)

                if len(posi_map) == 1:
                    rx.append(posi_map[0][0])
                    cy.append(posi_map[0][1])
                    col_map[output_keys[j]] = (
                        f"[{posi_map[0][0]},{posi_map[0][1]}]"  # posi_map[0]
                    )
                elif len(posi_map) == 0:
                    col_map[output_keys[j]] = output_tbl.iloc[i, j]
                else:
                    # col_map[output_keys[j]] = posi_map
                    ambiguous_map[output_keys[j]] = posi_map
                    ambiguous_posi[f"[{i},{j}]"] = posi_map

            if (len(rx) == 0) or (len(cy) == 0):
                rx_mean = 0
                cy_mean = 0
            else:
                rx_mean = sum(rx) / len(rx)
                cy_mean = sum(cy) / len(cy)
            for cn, cp in ambiguous_map.items():
                if isinstance(cp, list):
                    nearest_p = find_nearest_coordinate(cp, rx_mean, cy_mean)
                    col_map[cn] = f"[{nearest_p[0]},{nearest_p[1]}]"

            # ambiguous_posi[i] = ambiguous_map
            # coordinate_mapping = coordinate_mapping.append(col_map, ignore_index=True)
            # As of pandas 2.0, append (previously deprecated) was removed. use concat instead
            # coordinate_mapping = pd.concat(
            #     [coordinate_mapping, pd.DataFrame([col_map])], ignore_index=True
            # )
            coordinate_mapping.loc[len(coordinate_mapping)] = col_map

            # posi_map_tbl.loc[i] = col_map.values()
    except Exception as e:
        return False, e, ambiguous_posi
    else:
        return True, coordinate_mapping, ambiguous_posi


SWAP_METHODS = {
    "ctx": context_based_swap,
    "tgt": target_based_swap,
    "nbr": neighbor_based_comparison,
}


def euclidean_distance(coord1, coord2):
    return np.sqrt((coord1[0] - coord2[0]) ** 2 + (coord1[1] - coord2[1]) ** 2)


def find_nearest_coordinate(posi_arr, x, y):

    target = np.array([x, y])

    min_distance = float("inf")
    nearest_coord = None

    for coord in posi_arr:
        distance = euclidean_distance(coord, target)

        if distance < min_distance:
            min_distance = distance
            nearest_coord = coord

    if nearest_coord is not None:
        nearest_coord = tuple(nearest_coord)

    return nearest_coord


# target2source_mapping
# Use coordinate_mapping.iloc[obs_id, var_id] to access the corresponding cells


def source2target_mapping(df_messy, coordinate_mapping):
    new_output_tbl = pd.DataFrame(columns=coordinate_mapping.columns)
    in2out = dict()
    out2in = {
        "cells": dict(),
        "cols": [
            coordinate_mapping[col].tolist() for col in coordinate_mapping.columns
        ],
        "rows": [],
    }
    for i in range(coordinate_mapping.shape[0]):
        row = []
        out2in["rows"].append(coordinate_mapping.iloc[i].tolist())
        for j in range(coordinate_mapping.shape[1]):
            in_posi = coordinate_mapping.iloc[i, j]
            out_posi = f"[{i},{j}]"
            out2in["cells"][out_posi] = in_posi
            if in_posi.startswith("[") and in_posi.endswith("]"):
                # numbers_str = in_posi[1:-1].split(',')
                numbers_str = json.loads(in_posi)
                numbers_int = [int(num_str) for num_str in numbers_str]
                value = df_messy.iloc[numbers_int[0], numbers_int[1]]

                if in_posi not in in2out:
                    in2out[in_posi] = []
                in2out[in_posi].append(out_posi)
            else:
                value = in_posi
            row.append(value)
        new_output_tbl.loc[i] = row

    new_output_tbl

    return new_output_tbl, in2out, out2in


def get_unused_areas(input_tbl, in2out):

    unused_cells = []
    for row_idx, row in enumerate(input_tbl):
        for col_idx, cell_value in enumerate(row):
            in_posi = f"[{row_idx},{col_idx}]"
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

    csv_files.sort()
    csv_file = csv_files[0]
    target_file = path / MESSY_DATA
    shutil.copy(csv_file, target_file)


def get_output_tbl(script_namespace):
    # return script_namespace['df_clean']
    dataframes = [
        var for var in script_namespace.values() if isinstance(var, pd.DataFrame)
    ]
    return dataframes[-1] if dataframes else None


def compare_differences(df1, df2):
    differences = {}
    for row_idx in range(df1.shape[0]):
        for col_idx in range(df1.shape[1]):
            if df1.iloc[row_idx, col_idx] != df2.iloc[row_idx, col_idx]:
                differences[f"[{row_idx}, {col_idx}]"] = [
                    df1.iloc[row_idx, col_idx],
                    df2.iloc[row_idx, col_idx],
                ]

    return differences


def delete_files(folder_path):
    """
    delete csv and json files
    """
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if filename.endswith(".csv") or filename.endswith(".json"):
            os.remove(file_path)


def save_first_rows(keep_rows=100, save_data=True):
    df_messy = pd.read_csv(
        MESSY_DATA,
        dtype=str,
        keep_default_na=False,
        header=None,
    )
    data = df_messy.values  # .to_json(orient='values')
    keep_name = f"input_tbl_first_{keep_rows}_rows"
    first_rows = {keep_name: data.tolist()[:keep_rows]}
    if save_data:
        with open(keep_name + ".json", "w") as f:
            json.dump(first_rows, f)


def gen_coordinate_mapping(script_path, save_data=True):

    original_directory = os.getcwd()  # Save the current working directory

    path = Path(script_path).resolve()
    copy_and_rename_csv(path)

    os.chdir(path)  # Change to the target directory

    # save_first_rows(200)
    # return None

    with open(SCRIPT, "r", encoding="utf-8") as file:
        script = file.read()

    # Read input_tbl as a 2D array
    # with open(input_tbl_file, 'r', encoding='utf-8') as file:
    #    reader = csv.reader(file)
    #    data = list(reader)
    df_messy = pd.read_csv(MESSY_DATA, dtype=str, keep_default_na=False, header=None)
    input_tbl = df_messy.values  # .to_json(orient='values')

    # Execute the given script and retrieve the output table
    script_namespace = {}
    exec(script, None, script_namespace)
    output_tbl = get_output_tbl(script_namespace)
    output_tbl = output_tbl.fillna("").astype(str)

    # print({"input_tbl": input_tbl, "output_tbl": [list(output_tbl.columns)] + output_tbl.values.tolist()})
    # print({"input_tbl": input_tbl, "output_tbl": output_tbl.values})

    res_data = {}
    for method in SWAP_METHODS.keys():
        res_data[method + "_coord_info"] = {
            "input_tbl": input_tbl.tolist(),
            "output_tbl": output_tbl.values.tolist(),
            "output_col": output_tbl.columns.tolist(),
        }
        errors = []
        res_swap, coord_map, ambiguous_posi = SWAP_METHODS[method](
            script, df_messy, output_tbl
        )
        if not res_swap:
            print(f"An error occurred in the case: {script_path} - {method}.")
            print(f"The error is: {coord_map}.")
            errors.append(str(coord_map))
            res_data[method + "_coord_info"]["errors"] = errors
            continue
        coord_map = coord_map.fillna("").astype(str)
        new_output_tbl, in2out, out2in = source2target_mapping(df_messy, coord_map)
        unused = get_unused_areas(input_tbl, in2out)
        res_data[method + "_coord_map"] = coord_map
        res_data[method + "_coord_output"] = new_output_tbl

        try:
            output_differences = compare_differences(output_tbl, new_output_tbl)
        except Exception as e:
            print(
                f"An error occurred in the case: {script_path} - {method} - output_differences."
            )
            print(f"The error is: {e}.")
            errors.append(str(e))
            output_differences = {}
        #  output_comparison = new_output_tbl.equals(output_tbl)
        res_data[method + "_coord_info"].update(
            {
                "in2out": in2out,
                "out2in": out2in,
                "unused": unused,
                "output_differences": output_differences,
                "errors": errors,
            }
        )
        if ambiguous_posi:
            res_data[method + "_coord_info"]["ambiguous_posi"] = ambiguous_posi

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
                with open(name + ".json", "w") as f:
                    json.dump(data, f)
            elif isinstance(data, pd.DataFrame):
                data.to_csv(name + ".csv", index=False)

    os.chdir(original_directory)  # Change back to the original directory


if __name__ == "__main__":

    # df_messy = pd.read_csv("cases/3.swap_counterexample/data.csv", dtype=str, keep_default_na=False, header=None)
    # data = df_messy.values # .to_json(orient='values')
    # print(str(data))

    for root, dirs, files in os.walk("."):
        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            if len(dir_path.strip("/").split("/")) == 4:
                # pass
                # print(dir_path)
                # gen_coordinate_mapping(dir_path)
                # delete_files(dir_path)
                # if dir_path.startswith("./cases/3") and dir_path.endswith("4th round"):
                if dir_path.startswith("./cases/6") and dir_path.endswith("4th round"):
                    print(dir_path)
                    # delete_files(dir_path)
                    gen_coordinate_mapping(dir_path)
                # delete_files(dir_path)
                # if dir_path.startswith("./cases/3"):
                #     delete_files(dir_path)
                #     gen_coordinate_mapping(dir_path)

    # gen_coordinate_mapping('cases/1. university_rank/context-based')
    # gen_coordinate_mapping('cases/1. university_rank/position-based')
    # gen_coordinate_mapping('cases/2. model_results/1st round')
    # gen_coordinate_mapping('cases/2. model_results/2nd round')
