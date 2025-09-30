// Fetch and process win probability data
async function fetchWinProbabilityData() {
  // This would be replaced by an API call in production
  const response = await fetch('static/win_probability.json');
  return await response.json();
}

function getWeeks(data) {
  // Extract unique weeks from the data
  const weeks = [...new Set(data.map(row => row.week))];
  return weeks.sort((a, b) => a - b);
}

function getMostExcitingWeek(metrics) {
  // Composite excitement score: lead_changes + close_game_play_pct + biggest_win_prob_swing
  let bestWeek = null;
  let bestScore = -Infinity;
  Object.entries(metrics).forEach(([week, vals]) => {
    // You can tweak the weights here
    const score = vals.lead_changes * 2 + vals.close_game_play_pct + vals.biggest_win_prob_swing * 100;
    if (score > bestScore) {
      bestScore = score;
      bestWeek = week;
    }
  });
  return bestWeek;
}

function renderWeekSelector(weeks, onSelect, metrics) {
  const selector = document.getElementById('week-selector');
  selector.innerHTML = '';
  const mostExcitingWeek = metrics ? getMostExcitingWeek(metrics) : null;
  weeks.forEach(week => {
    const btn = document.createElement('button');
    btn.textContent = `Week ${week}`;
    btn.onclick = () => onSelect(week);
    btn.className = 'week-btn';
    if (mostExcitingWeek && String(week) === String(mostExcitingWeek)) {
      btn.classList.add('most-exciting');
      btn.title = 'Most Exciting Week!';
      btn.innerHTML = `<span style="color:#FFD700;font-size:1.2em;">⭐</span> Week ${week}`;
    }
    selector.appendChild(btn);
  });
}

function renderChartsForWeek(data, week) {
  const container = document.getElementById('charts-container');
  container.innerHTML = '';
  const weekData = data.filter(row => row.week === week);
  const teams = [...new Set(weekData.map(row => row.team))];
  teams.forEach(team => {
    const teamData = weekData.filter(row => row.team === team);
    const chartBox = document.createElement('div');
    chartBox.className = 'chart-box';
    const canvas = document.createElement('canvas');
    chartBox.appendChild(document.createElement('h2')).textContent = team;
    chartBox.appendChild(canvas);
    container.appendChild(chartBox);
    // Prepare chart data
    const labels = teamData.map(row => row.play_id);
    const winProb = teamData.map(row => row.win_probability);
    // Wait for Chart.js to load
    function drawChart() {
      new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Win Probability',
            data: winProb,
            borderColor: '#0074D9',
            backgroundColor: 'rgba(0, 116, 217, 0.1)',
            fill: true,
            pointRadius: 0,
            tension: 0.2
          }]
        },
        options: {
          scales: {
            y: {
              min: 0,
              max: 1,
              title: { display: true, text: 'Win Probability', color: '#fff' },
              ticks: { color: '#fff' },
              grid: { color: 'rgba(255,255,255,0.2)' }
            },
            x: {
              title: { display: true, text: 'Play ID', color: '#fff' },
              ticks: { color: '#fff' },
              grid: { color: 'rgba(255,255,255,0.2)' }
            }
          },
          plugins: {
            legend: { display: false, labels: { color: '#fff' } }
          }
        }
      });
    }
    if (window.Chart) drawChart();
    else script.onload = drawChart;
  });
}

// Fetch excitement metrics
async function fetchExcitementMetrics() {
  const response = await fetch('static/excitement_by_week.json');
  return await response.json();
}

function renderExcitementForWeek(metrics, week) {
  const container = document.getElementById('excitement-week-metrics');
  const vals = metrics[week];
  if (!vals) {
    container.innerHTML = '<em>No metrics available for this week.</em>';
    return;
  }
  container.innerHTML = `
    <ul>
      <li><strong>Lead Changes:</strong> ${vals.lead_changes}</li>
      <li><strong>Biggest Win Probability Swing:</strong> ${vals.biggest_win_prob_swing}</li>
      <li><strong>% Close Game Plays:</strong> ${vals.close_game_play_pct}%</li>
    </ul>
  `;
}

// Main
Promise.all([fetchWinProbabilityData(), fetchExcitementMetrics()]).then(([data, metrics]) => {
  const weeks = getWeeks(data);
  function onWeekSelect(week) {
    renderChartsForWeek(data, week);
    renderExcitementForWeek(metrics, week);
  }
  renderWeekSelector(weeks, onWeekSelect, metrics);
  if (weeks.length) {
    onWeekSelect(weeks[0]);
  }
});
