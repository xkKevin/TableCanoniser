import pandas as pd

# Load the messy DataFrame
df_messy = pd.read_csv('messy_data.csv', dtype=str, keep_default_na=False)

# Clean the DataFrame
cleaned_data = []
i = 0
while i < len(df_messy):
    if df_messy.iloc[i, 0]:
        # Extract university info
        rank, name, location, total_score = df_messy.iloc[i]
        
        # Initialize dictionary for clean data row
        row_data = {
            'Rank': rank, 'Name': name, 'Location': location, 'Total Score': total_score,
            'Level': None, 'Resources': None, 'Education': None,
            'Research': None, 'Elite': None, 'Global': None
        }
        
        # Assign values based on the labels
        labels_row = df_messy.iloc[i + 1].dropna().tolist()
        values_row = df_messy.iloc[i + 2].dropna().tolist()
        for label, value in zip(labels_row, values_row):
            row_data[label] = value

        labels_row = df_messy.iloc[i + 3].dropna().tolist()
        values_row = df_messy.iloc[i + 4].dropna().tolist()
        for label, value in zip(labels_row, values_row):
            row_data[label] = value

        # Append to cleaned_data
        cleaned_data.append([
            row_data['Rank'], row_data['Name'], row_data['Location'], row_data['Total Score'],
            row_data['Level'], row_data['Resources'], row_data['Education'],
            row_data['Research'], row_data['Elite'], row_data['Global']
        ])
        
        i += 5
    else:
        i += 1

# Create a DataFrame
columns = ['Rank', 'Name', 'Location', 'Total Score', 'Level', 'Resources', 'Education', 'Research', 'Elite', 'Global']
df_clean = pd.DataFrame(cleaned_data, columns=columns)