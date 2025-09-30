import pandas as pd
import sqlite3

# Load the new win-probability CSV file
df = pd.read_csv('win-probability')

# Create SQLite database and write DataFrame to it
conn = sqlite3.connect('win_probability.db')
df.to_sql('win_probability', conn, if_exists='replace', index=False)
conn.close()
print("Database 'win_probability.db' created with table 'win_probability'.")
