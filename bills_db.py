import pandas as pd
import sqlite3

# Load the CSV file into a DataFrame
df = pd.read_csv('BUF_Bills_2024.csv')

# Create SQLite database and write DataFrame to it
conn = sqlite3.connect('bills.db')
df.to_sql('bills', conn, if_exists='replace', index=False)
conn.close()
print("Database 'bills.db' created with table 'bills'.")
