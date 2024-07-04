import pandas as pd

# Load the messy DataFrame
df_messy = pd.read_csv('messy_data.csv', dtype=str, keep_default_na=False, header=None)
messy_data = df_messy.values # .to_json(orient='values') 

# Initialize lists to store data
phones = []
prices = []
release_dates = []
heights = []
widths = []
depths = []
weights = []
front_cameras = []
rear_cameras = []
batteries = []

# Initialize variables to hold current device details
current_device = None
current_price = None
current_release_date = None
current_dimensions = {'Height': None, 'Width': None, 'Depth': None}
current_weight = None
current_front_camera = None
current_rear_camera = None
current_battery = None

# Process each row in messy_data
for row in messy_data:
    if row[0]:  # If the first element of the row is not empty (indicating new device or category)
        if row[1].startswith('$'):  # This row contains device name and price
            # Save previous device data if it exists
            if current_device:
                phones.append(current_device)
                prices.append(current_price)
                release_dates.append(current_release_date)
                heights.append(current_dimensions['Height'])
                widths.append(current_dimensions['Width'])
                depths.append(current_dimensions['Depth'])
                weights.append(current_weight)
                front_cameras.append(current_front_camera)
                rear_cameras.append(current_rear_camera)
                batteries.append(current_battery)
            
            # Start new device
            current_device = row[0]
            current_price = row[1]
            current_release_date = None
            current_dimensions = {'Height': None, 'Width': None, 'Depth': None}
            current_weight = None
            current_front_camera = None
            current_rear_camera = None
            current_battery = None
        else:
            category = row[0]
            if category in ['Release Date', 'Announced Date']:
                current_release_date = row[1]
            elif category == 'Dimensions':
                for i in range(1, len(row), 2):
                    if row[i] in current_dimensions:
                        current_dimensions[row[i]] = row[i+1]
            elif category == 'Weight':
                current_weight = row[1]
            elif category == 'Camera':
                # Ensure Front Camera is smaller than Rear Camera
                if int(row[1]) < int(row[2]):
                    current_front_camera = row[1]
                    current_rear_camera = row[2]
                else:
                    current_front_camera = row[2]
                    current_rear_camera = row[1]
            elif category == 'Battery':
                current_battery = row[1]

# Add the last device to the lists (since the loop ends without adding the last device)
if current_device:
    phones.append(current_device)
    prices.append(current_price)
    release_dates.append(current_release_date)
    heights.append(current_dimensions['Height'])
    widths.append(current_dimensions['Width'])
    depths.append(current_dimensions['Depth'])
    weights.append(current_weight)
    front_cameras.append(current_front_camera)
    rear_cameras.append(current_rear_camera)
    batteries.append(current_battery)

# Create a DataFrame
df = pd.DataFrame({
    'Phone': phones,
    'Price': prices,
    'Release Date': release_dates,
    'Height': heights,
    'Width': widths,
    'Depth': depths,
    'Weight': weights,
    'Front Camera': front_cameras,
    'Rear Camera': rear_cameras,
    'Battery': batteries
})