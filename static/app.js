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
              title: { display: true, text: 'Win Probability' }
            },
            x: {
              title: { display: true, text: 'Play ID' }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
    if (window.Chart) drawChart();
    else script.onload = drawChart;
  });
}

// Main
fetchWinProbabilityData().then(data => {
  const weeks = getWeeks(data);
  renderWeekSelector(weeks, week => renderChartsForWeek(data, week));
  // Show first week by default
  if (weeks.length) renderChartsForWeek(data, weeks[0]);
});
