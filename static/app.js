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

function renderWeekSelector(weeks, onSelect) {
  const selector = document.getElementById('week-selector');
  selector.innerHTML = '';
  weeks.forEach(week => {
    const btn = document.createElement('button');
    btn.textContent = `Week ${week}`;
    btn.onclick = () => onSelect(week);
    btn.className = 'week-btn';
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
  renderWeekSelector(weeks, onWeekSelect);
  if (weeks.length) {
    onWeekSelect(weeks[0]);
  }
});
