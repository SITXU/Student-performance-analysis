import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', boxWidth: 12, font: { family: 'Space Grotesk' } } } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' }, beginAtZero: true },
  },
};

export default function Dashboard() {
  const { api } = useAuth();
  const [summary, setSummary] = useState(null);
  const [coData, setCoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/summary'), api.get('/analytics/co')])
      .then(([s, c]) => { setSummary(s.data); setCoData(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const distData = {
    labels: summary.distribution.labels,
    datasets: [{ data: summary.distribution.data, backgroundColor: ['#ef4444','#f59e0b','#00d4ff','#7c3aed','#10b981'], borderRadius: 6 }]
  };

  const coBarData = {
    labels: Object.keys(coData.coStats),
    datasets: [{
      label: 'Pass %',
      data: Object.values(coData.coStats).map(c => c.passPct),
      backgroundColor: ['#00d4ff','#7c3aed','#10b981','#f59e0b','#ef4444'],
      borderRadius: 6,
    }]
  };

  const STATS = [
    { label: 'Total Students', value: summary.total, sub: `${summary.absent} absent`, color: 'blue' },
    { label: 'Class Average', value: `${summary.avg}/30`, sub: 'Internal marks', color: 'green' },
    { label: 'Pass Rate', value: `${summary.passRate}%`, sub: `${summary.passing} of ${summary.present} passed`, color: 'purple' },
    { label: 'Top Score', value: `${summary.topScore}/30`, sub: 'Highest achieved', color: 'amber' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Cloud Computing (UPECS710) — Class Overview</p>
      </div>

      <div className="stats-grid">
        {STATS.map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="card">
          <div className="card-title">Score Distribution</div>
          <div style={{ height: 260 }}>
            <Bar data={distData} options={{ ...CHART_OPTS, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">CO-wise Pass Rate</div>
          <div style={{ height: 260 }}>
            <Bar data={coBarData} options={{
              ...CHART_OPTS,
              plugins: { legend: { display: false } },
              scales: { ...CHART_OPTS.scales, y: { ...CHART_OPTS.scales.y, max: 100, ticks: { color: '#94a3b8', callback: v => v + '%' } } }
            }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Question-wise Attainment</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Question</th><th>CO</th><th>Max Marks</th><th>Class Avg</th><th>Attainment %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(coData.qData).map(([q, d]) => (
                <tr key={q}>
                  <td><code>Q{q.replace('q','').replace('a','(a)').replace('b','(b)').replace('c','(c)').replace('d','(d)').replace('e','(e)').replace('f','(f)')}</code></td>
                  <td><span className={`co-badge co${d.co[2]}`}>{d.co}</span></td>
                  <td>{d.max}</td>
                  <td>{d.avg}</td>
                  <td>
                    <div className="progress-wrap">
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${d.pct}%`, background: d.pct >= 70 ? '#10b981' : d.pct >= 50 ? '#f59e0b' : '#ef4444' }} /></div>
                      <span>{d.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
