import pandas as pd

# Load the messy DataFrame
df_messy = pd.read_csv("messy_data.csv", dtype=str, keep_default_na=False, header=None)
messy_data = df_messy.values  # .to_json(orient='values')


# Function to transform the messy data
def transform_messy_data(messy_data):
    result = []
    current_employee = {
        "EmployeeID": None,
        "Employee Name": None,
        "Period End Date": None,
        "Pay Frequency": None,
        "Location": None,
        "Number of": None,
        "Description": None,
        "Hours": None,
        "Amount": None,
    }

    for row in messy_data:
        if len(row) < 2:
            continue

        # Detect new employee
        if row[0] and row[1]:
            current_employee["EmployeeID"] = row[0]
            current_employee["Employee Name"] = row[1]

        # Detect new pay period
        elif row[0] and row[1] != "Period End Date" and not row[1]:
            current_employee["Period End Date"] = row[0]
            current_employee["Pay Frequency"] = row[1]
            current_employee["Location"] = row[3]
            current_employee["Number of"] = row[4]
            current_employee["Description"] = row[5]
            current_employee["Hours"] = row[10]
            current_employee["Amount"] = row[11]

        # Detect detailed pay info
        elif row[5] and current_employee["EmployeeID"]:
            current_employee["Description"] = row[5]
            current_employee["Hours"] = row[10]
            current_employee["Amount"] = row[11]
            result.append(current_employee.copy())

    # Create DataFrame
    df = pd.DataFrame(result)
    return df


df = transform_messy_data(messy_data)
