import pandas as pd

# Read data
happy_df = pd.read_csv('data/final/happy.csv', delimiter=',')
gov_df = pd.read_csv('data/final/gov.csv', delimiter=',')

# # Drop columns
# gdp_df.drop('Info', axis=1, inplace=True)
# country_df = country_df[['name', 'iso_3166-2']]

# # Drop missing values for all columns
# for col in gdp_df.columns : 
#     index_names = gdp_df[ gdp_df[col] == '..' ].index 
#         # drop this rows by index
#     gdp_df.drop(index_names, inplace = True)

# # Convert data to numeric
# cols = gdp_df.columns
# cols = cols.drop('Country')

# TODO Check for outliers

# for col in cols :
#     gdp_df[col] = gdp_df[col].astype(str).astype(int)

# # Sum
# gdp_df['sum'] = gdp_df.sum(numeric_only=True,axis=1)

# # Drop years
# gdp_df = gdp_df[['Country', 'sum']]
print(gov_df.head())
print(happy_df.head())
# Join
out_df = happy_df.merge(gov_df, left_on='country', right_on='country')
# out_df = out_df[['Country','sum','iso_3166-2']]


out_df.to_csv('data/final/happy_gov_continent.csv', index=False, header=True)

