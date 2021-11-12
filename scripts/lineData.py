import pandas as pd

years = [2016, 2017, 2018, 2019, 2020]
dfs = []

def dfYear(start_df, year):
    col = f'happiness_score_{year}'
    df = happy_df[['country', col]]
    df = df.rename(columns={col: "happy"})
    df['year'] = year
    print(df.head())

    return df


# Read data
happy_df = pd.read_csv('data/final/happy_gov_continent.csv', delimiter=',')

for i in range(0,len(years)):
    dfs.append(dfYear(happy_df, years[i]))

output = pd.concat(dfs)


output.to_csv('data/final/lineData.csv', index=False, header=True)

# happy2016 = dfYear(happy_df, 2016)
# happy2017 = dfYear(happy_df, 2017)
# happy2018 = dfYear(happy_df, 2018)
# happy2019 = dfYear(happy_df, 2019)
# happy2020 = dfYear(happy_df, 2020)




# out_df.to_csv('data/final/happy_gov_continent.csv', index=False, header=True)