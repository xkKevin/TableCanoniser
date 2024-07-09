import pandas as pd

# Load the messy DataFrame
# df_messy = pd.read_excel('case1.xlsx', sheet_name='Sheet1', engine='openpyxl', dtype=str, keep_default_na=False, header=None)
df_messy = pd.read_csv('messy_data.csv', dtype=str, keep_default_na=False, header=None)
data = df_messy.values # .to_json(orient='values') 

# Extract categories from the first row
categories = data[0]

# Prepare a list to store rows for the relational table
rows = []

# Process the data starting from the second row
for row in data[1:]:
    # First method and its accuracy
    if row[0] and row[1]:
        rows.append([row[0], row[1], categories[0]])
    # Second method and its accuracy
    if row[2] and row[3]:
        rows.append([row[2], row[3], categories[2]])

# Create a DataFrame
df_clean = pd.DataFrame(rows, columns=["Method", "Accuracy", "Category"])