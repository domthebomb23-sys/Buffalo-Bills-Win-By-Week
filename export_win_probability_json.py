import sqlite3
import json

# Connect to the SQLite database
conn = sqlite3.connect('win_probability.db')
cursor = conn.cursor()

# Query relevant columns for frontend visualization
query = '''
SELECT week, home_team, away_team, game_id, play_id, game_date, quarter_seconds_remaining, posteam, defteam, desc, wp, home_wp, away_wp
FROM win_probability
WHERE wp <= 1.0
ORDER BY week, game_id, play_id
'''

rows = cursor.execute(query).fetchall()
columns = [desc[0] for desc in cursor.description]


# Export as flat array with 'team' and 'win_probability' for each play
export_data = []
for row in rows:
    record = dict(zip(columns, row))
    # Home team record
    export_data.append({
        'week': record['week'],
        'team': record['home_team'],
        'opponent': record['away_team'],
        'game_id': record['game_id'],
        'play_id': record['play_id'],
        'game_date': record['game_date'],
        'quarter_seconds_remaining': record['quarter_seconds_remaining'],
        'posteam': record['posteam'],
        'defteam': record['defteam'],
        'desc': record['desc'],
        'win_probability': record['home_wp'],
        'side': 'home'
    })
    # Away team record
    export_data.append({
        'week': record['week'],
        'team': record['away_team'],
        'opponent': record['home_team'],
        'game_id': record['game_id'],
        'play_id': record['play_id'],
        'game_date': record['game_date'],
        'quarter_seconds_remaining': record['quarter_seconds_remaining'],
        'posteam': record['posteam'],
        'defteam': record['defteam'],
        'desc': record['desc'],
        'win_probability': record['away_wp'],
        'side': 'away'
    })

# Write to JSON file for frontend
with open('static/win_probability.json', 'w') as f:
    json.dump(export_data, f)

conn.close()
print("Exported win probability data to static/win_probability.json")
