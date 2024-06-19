import pandas as pd

# Load the messy DataFrame
# df_messy = pd.read_excel('case1.xlsx', sheet_name='Sheet1', engine='openpyxl', dtype=str, keep_default_na=False, header=None)
df_messy = pd.read_csv('messy_data.csv', dtype=str, keep_default_na=False, header=None)
data = df_messy.values # .to_json(orient='values') 

# Create a DataFrame from the data
df = pd.DataFrame(data)

# Set the first row as the header
df.columns = df.iloc[0]
df = df[1:]

# Reset the index for better readability
df.reset_index(drop=True, inplace=True)

# Rename columns for clarity
df.columns = ["Method 1", "Accuracy 1", "Method 2", "Accuracy 2"]