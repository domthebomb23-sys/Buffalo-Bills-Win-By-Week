import json
from collections import defaultdict

# Load win probability data
with open('static/win_probability.json', 'r') as f:
    data = json.load(f)

# Organize plays by week and game
weeks = defaultdict(lambda: defaultdict(list))
for play in data:
    weeks[play['week']][play['game_id']].append(play)

summary = {}
for week, games in weeks.items():
    lead_changes = 0
    biggest_swing = 0
    close_game_plays = 0
    total_plays = 0
    for game_id, plays in games.items():
        # Sort plays by play_id
        plays = sorted(plays, key=lambda x: x['play_id'])
        # Only consider home/away pairs
        home_wp = [p['win_probability'] for p in plays if p['side'] == 'home']
        away_wp = [p['win_probability'] for p in plays if p['side'] == 'away']
        # Lead changes
        last_leader = None
        for i in range(len(home_wp)):
            leader = 'home' if home_wp[i] > away_wp[i] else 'away'
            if last_leader is not None and leader != last_leader:
                lead_changes += 1
            last_leader = leader
            # Biggest swing
            if i > 0:
                swing = abs(home_wp[i] - home_wp[i-1])
                swing2 = abs(away_wp[i] - away_wp[i-1])
                biggest_swing = max(biggest_swing, swing, swing2)
            # Close game duration
            if 0.4 <= home_wp[i] <= 0.6:
                close_game_plays += 1
            if 0.4 <= away_wp[i] <= 0.6:
                close_game_plays += 1
            total_plays += 2
    summary[week] = {
        'lead_changes': lead_changes,
        'biggest_win_prob_swing': round(biggest_swing, 3),
        'close_game_play_pct': round(close_game_plays / total_plays * 100, 2) if total_plays else 0
    }

with open('static/excitement_by_week.json', 'w') as f:
    json.dump(summary, f, indent=2)

print('Excitement metrics exported to static/excitement_by_week.json')
