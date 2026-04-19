import { useEffect, useState } from 'react';
import { Radar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, ArcElement, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../context/AuthContext';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, ArcElement, Tooltip, Legend);

const CO_COLORS = { CO1:'#00d4ff', CO2:'#7c3aed', CO3:'#10b981', CO4:'#f59e0b', CO5:'#ef4444' };
const CO_DESC = {
  CO1:'Understand cloud computing concepts & service models',
  CO2:'Apply virtualization & resource management',
  CO3:'Analyze cloud security & deployment strategies',
  CO4:'Evaluate cloud performance & scalability',
  CO5:'Design cloud-based solutions for real-world problems',
};

export default function COAnalysis() {
  const { api } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/analytics/co').then(r => setData(r.data)); }, []);

  if (!data) return <div className="loading">Loading CO analysis...</div>;

  const radarData = {
    labels: Object.keys(data.coStats),
    datasets: [{
      label: 'Attainment %',
      data: Object.values(data.coStats).map(c => c.passPct),
      borderColor: '#00d4ff',
      backgroundColor: 'rgba(0,212,255,0.1)',
      pointBackgroundColor: '#00d4ff',
      borderWidth: 2, pointRadius: 5,
    }]
  };

  const donutData = {
    labels: Object.keys(data.coStats),
    datasets: [{
      data: Object.values(data.coStats).map(c => c.passing),
      backgroundColor: Object.values(CO_COLORS),
      borderWidth: 0, spacing: 3,
    }]
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Course Outcome Analysis</h2>
        <p>Attainment levels for each Course Outcome</p>
      </div>

      <div className="co-cards">
        {Object.entries(data.coStats).map(([co, stats]) => {
          const level = stats.passPct >= 70 ? 'High' : stats.passPct >= 50 ? 'Medium' : 'Low';
          const levelColor = stats.passPct >= 70 ? '#10b981' : stats.passPct >= 50 ? '#f59e0b' : '#ef4444';
          return (
            <div key={co} className="co-card" style={{ '--co-color': CO_COLORS[co] }}>
              <div className="co-card-top">
                <span className="co-name" style={{ color: CO_COLORS[co] }}>{co}</span>
                <span className="co-level-badge" style={{ color: levelColor, background: levelColor + '22' }}>{level}</span>
              </div>
              <div className="co-desc">{CO_DESC[co]}</div>
              <div className="co-pct" style={{ color: CO_COLORS[co] }}>{stats.passPct}%</div>
              <div className="co-sub">{stats.passing}/{stats.total} students passed</div>
              <div className="progress-bar" style={{ marginTop: 12 }}>
                <div className="progress-fill" style={{ width: `${stats.passPct}%`, background: CO_COLORS[co] }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="charts-row">
        <div className="card">
          <div className="card-title">Attainment Radar</div>
          <div style={{ height: 300 }}>
            <Radar data={radarData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { labels: { color: '#94a3b8' } } },
              scales: { r: {
                grid: { color: 'rgba(255,255,255,0.08)' },
                angleLines: { color: 'rgba(255,255,255,0.08)' },
                pointLabels: { color: '#94a3b8', font: { size: 13 } },
                ticks: { color: '#64748b', backdropColor: 'transparent', stepSize: 25 },
                min: 0, max: 100,
              }}
            }} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Students Passing per CO</div>
          <div style={{ height: 300 }}>
            <Doughnut data={donutData} options={{
              responsive: true, maintainAspectRatio: false, cutout: '65%',
              plugins: { legend: { labels: { color: '#94a3b8', boxWidth: 12 } } }
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
