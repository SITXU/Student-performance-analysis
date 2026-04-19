import { useEffect, useState } from 'react';
import { Radar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useAuth } from '../context/AuthContext';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, ArcElement, Tooltip, Legend);

const CO_COLORS = { CO1:'#00d4ff', CO2:'#7c3aed', CO3:'#10b981', CO4:'#f59e0b', CO5:'#ef4444' };
const CO_MAP = {
  q1a:'CO1', q1b:'CO3', q1c:'CO2', q1d:'CO2', q1e:'CO3',
  q2a:'CO2', q2b:'CO4', q2c:'CO2', q2d:'CO3', q2e:'CO4', q2f:'CO1'
};
const Q_MAX = { q1a:1, q1b:1, q1c:1, q1d:1, q1e:1, q2a:2.5, q2b:2.5, q2c:2.5, q2d:2.5, q2e:2.5, q2f:2.5 };
const Q_LABELS = { q1a:'1(a)', q1b:'1(b)', q1c:'1(c)', q1d:'1(d)', q1e:'1(e)', q2a:'2(a)', q2b:'2(b)', q2c:'2(c)', q2d:'2(d)', q2e:'2(e)', q2f:'2(f)' };

export default function MyProfile() {
  const { user, api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/analytics/student/${user.reg}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [user.reg]);

  if (loading) return <div className="loading">Loading your report...</div>;
  if (!data) return <div className="empty-state"><p>Report not available.</p></div>;

  const { student: s, coScores, rank, totalStudents, classCoAvg } = data;
  const pct = s.total ? Math.round((s.total / 30) * 100) : 0;
  const initials = s.name.split(' ').map(w => w[0]).slice(0, 2).join('');

  const radarData = {
    labels: Object.keys(coScores),
    datasets: [
      {
        label: 'You',
        data: Object.values(coScores),
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0,212,255,0.1)',
        pointBackgroundColor: '#00d4ff',
        borderWidth: 2,
        pointRadius: 5,
      },
      {
        label: 'Class Avg',
        data: Object.values(classCoAvg),
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.05)',
        borderDash: [5, 5],
        pointBackgroundColor: '#7c3aed',
        borderWidth: 1.5,
        pointRadius: 3,
      }
    ]
  };

  const donutData = {
    labels: ['Mid-Sem', 'Quiz', 'Assignment'],
    datasets: [{
      data: [s.midSem || 0, s.quiz || 0, s.assign || 0],
      backgroundColor: ['#00d4ff', '#7c3aed', '#10b981'],
      borderWidth: 0,
      spacing: 3,
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', boxWidth: 12 } } },
    scales: {
      r: {
        grid: { color: 'rgba(255,255,255,0.08)' },
        angleLines: { color: 'rgba(255,255,255,0.08)' },
        pointLabels: { color: '#94a3b8', font: { size: 12 } },
        ticks: { color: '#64748b', backdropColor: 'transparent', stepSize: 25 },
        min: 0,
        max: 100,
      }
    }
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: { legend: { labels: { color: '#94a3b8', boxWidth: 12 } } }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>My Performance Report</h2>
        <p>Cloud Computing (UPECS710) — Semester 5</p>
      </div>

      <div className="student-header card">
        <div className="student-avatar">{initials}</div>
        <div className="student-info">
          <h2>{s.name}</h2>
          <p>Cloud Computing · UPECS710 · Sem 5 CSE</p>
          <div className="student-meta">
            <div className="meta-item">
              <span>Reg. No.</span>
              <code>{s.reg}</code>
            </div>
            <div className="meta-item">
              <span>Total</span>
              <strong>{s.total}/30</strong>
            </div>
            <div className="meta-item">
              <span>Percentage</span>
              <strong>{pct}%</strong>
            </div>
            <div className="meta-item">
              <span>Status</span>
              <span className={`pill ${pct >= 60 ? 'pill-green' : 'pill-red'}`}>
                {pct >= 60 ? 'PASS' : 'AT RISK'}
              </span>
            </div>
            <div className="meta-item">
              <span>Class Rank</span>
              <strong>#{rank} of {totalStudents}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="card">
          <div className="card-title">Your CO Attainment vs Class</div>
          <div style={{ height: 280 }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Marks Breakdown</div>
          <div style={{ height: 280 }}>
            <Doughnut data={donutData} options={donutOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Course Outcome Summary</div>
        <div className="co-summary-grid">
          {Object.entries(coScores).map(([co, p]) => (
            <div key={co} className="co-summary-card">
              <div className="co-summary-name" style={{ color: CO_COLORS[co] }}>{co}</div>
              <div className="co-summary-pct" style={{ color: CO_COLORS[co] }}>{p}%</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${p}%`, background: CO_COLORS[co] }} />
              </div>
              <span
                className={`pill ${p >= 50 ? 'pill-green' : 'pill-red'}`}
                style={{ marginTop: 8, fontSize: 11 }}
              >
                {p >= 50 ? 'Achieved' : 'Not Achieved'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {!s.absent && (
        <div className="card">
          <div className="card-title">Question-wise Marks</div>
          <div className="q-chips">
            {Object.entries(CO_MAP).map(([q, co]) => {
              const mark = (s.q || {})[q] ?? 0;
              const max = Q_MAX[q];
              const mp = Math.round((mark / max) * 100);
              const bg = mp >= 75
                ? 'rgba(16,185,129,0.15)'
                : mp >= 50
                  ? 'rgba(245,158,11,0.15)'
                  : 'rgba(239,68,68,0.15)';
              const color = mp >= 75 ? '#10b981' : mp >= 50 ? '#f59e0b' : '#ef4444';
              return (
                <div key={q} className="q-chip" style={{ background: bg, border: `1px solid ${color}33` }}>
                  <div className="q-chip-label">Q{Q_LABELS[q]}</div>
                  <div className="q-chip-mark" style={{ color }}>{mark}/{max}</div>
                  <div className="q-chip-co">
                    <span className={`co-badge co${co[2]}`}>{co}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}