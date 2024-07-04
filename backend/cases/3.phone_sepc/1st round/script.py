import pandas as pd

# Load the messy DataFrame
df_messy = pd.read_csv('messy_data.csv', dtype=str, keep_default_na=False, header=None)
messy_data = df_messy.values # .to_json(orient='values') 

# Initialize an empty list to hold the cleaned data
cleaned_data = []

# Initialize a temporary dictionary to hold phone details
phone_details = {}

# Iterate over the messy_data to populate the phone details
for row in messy_data:
    # If the row is empty, it means we've reached the end of a phone's details
    if all(not cell for cell in row):
        if phone_details:
            cleaned_data.append(phone_details)
            phone_details = {}
    # If the first cell is not empty, it indicates the start of a new phone's details
    elif row[0] and not row[1]:
        if phone_details:
            cleaned_data.append(phone_details)
            phone_details = {}
        phone_details['Phone'] = row[0]
        phone_details['Price'] = row[1]
    # Otherwise, it is an attribute of the current phone
    else:
        if row[0] == 'Dimensions':
            phone_details['Height'] = row[2] if 'Height' in row else row[4]
            phone_details['Width'] = row[4] if 'Width' in row else row[2]
            phone_details['Depth'] = row[6] if 'Depth' in row else row[6]
        elif row[0] == 'Camera':
            phone_details['Camera Front (MP)'] = row[1]
            phone_details['Camera Back (MP)'] = row[2]
        else:
            phone_details[row[0]] = row[1]

# Add the last phone's details to the cleaned_data
if phone_details:
    cleaned_data.append(phone_details)

# Convert the cleaned data to a DataFrame
df = pd.DataFrame(cleaned_data)