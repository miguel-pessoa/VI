import pandas as pd

# Read data
radar_df = pd.read_csv('data/final/2020_report.csv', delimiter=',')

continents = radar_df.groupby(by = ["continent"], as_index = False).mean()
continents = continents.rename(columns={"continent": "country"})
print(continents.head())

radar_df = radar_df.append(continents)


radar_df.to_csv('data/final/radar.csv', index=False, header=True)

