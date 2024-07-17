import pandas as pd

# Load the messy DataFrame
df_messy = pd.read_csv("messy_data.csv", dtype=str, keep_default_na=False, header=None)
messy_data = df_messy.values


def transform_messy_data(messy_data):
    # Initialize transformed data with the desired headers
    transformed_data = [
        [
            "Index",
            "Sub Account Name",
            "Sub Account No.",
            "Yesterday Available Credit",
            "Yesterday Reserved Credit",
            "Yesterday Frozen Credit",
            "Total Debit Transactions",
            "Total Debit Amount",
            "Today Net Deposit Amount",
            "Today Available Credit",
            "Today Reserved Credit",
            "Today Frozen Credit",
            "Total Credit Transactions",
            "Total Credit Amount",
        ]
    ]

    # Skip header rows until we reach the data rows
    data_start = False
    current_row = []

    for row in messy_data:
        if row[0] == "Index":
            data_start = True
            continue
        if data_start:
            if row[0]:  # If the row starts with index, it’s a new record
                if current_row:
                    transformed_data.append(current_row)
                current_row = [
                    row[0],
                    row[1],
                    "",
                    row[3],
                    row[4],
                    row[5],
                    row[7],
                    row[8],
                    row[11],
                    "",
                    "",
                    "",
                    "",
                    "",
                ]
            elif (
                current_row
            ):  # If the row doesn't start with index, it contains Today and Total Credit details
                current_row[2] = row[1]
                current_row[9] = row[3]
                current_row[10] = row[4]
                current_row[11] = row[5]
                current_row[12] = row[7]
                current_row[13] = row[8]

    # Do not forget to append the last row
    if current_row:
        transformed_data.append(current_row)

    # Convert to DataFrame for further manipulation if needed
    transformed_df = pd.DataFrame(transformed_data[1:], columns=transformed_data[0])
    return transformed_df


transformed_df = transform_messy_data(messy_data)
