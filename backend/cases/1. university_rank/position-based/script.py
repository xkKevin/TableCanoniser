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
        level, resources, education = df_messy.iloc[i+2, 1:]
        research, elite, global_score = df_messy.iloc[i+4, 1:]
        
        # Append to cleaned_data
        cleaned_data.append([rank, name, location, total_score, level, resources, education, research, elite, global_score])
        i += 5
    else:
        i += 1

# Create a DataFrame
columns = ['Rank', 'Name', 'Location', 'Total Score', 'Level', 'Resources', 'Education', 'Research', 'Elite', 'Global']
df_clean = pd.DataFrame(cleaned_data, columns=columns)