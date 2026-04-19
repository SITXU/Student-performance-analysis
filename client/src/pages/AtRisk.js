import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AtRisk() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/at-risk').then(r => setStudents(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>⚠️ At Risk Students</h2>
        <p>Students scoring below 60% who may need additional support — {students.length} identified</p>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 56 }}>🎉</div>
          <p>No at-risk students found. All students are performing well!</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Reg. No.</th><th>Mid-Sem</th><th>Total</th><th>Percentage</th><th>Weak COs</th><th></th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const pct = Math.round((s.total / 30) * 100);
                  return (
                    <tr key={s.reg}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td><code>{s.reg}</code></td>
                      <td><span className="pill pill-red">{s.midSem}/20</span></td>
                      <td><span className="pill pill-red">{s.total}/30</span></td>
                      <td>
                        <div className="progress-wrap">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: '#ef4444' }} />
                          </div>
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>{pct}%</span>
                        </div>
                      </td>
                      <td>
                        {s.weakCOs.length > 0
                          ? s.weakCOs.map(co => (
                            <span key={co} className={`co-badge co${co[2]}`} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', marginRight: 4 }}>{co}</span>
                          ))
                          : <span style={{ color: '#64748b', fontSize: 12 }}>None</span>
                        }
                      </td>
                      <td>
                        <button className="btn btn-xs" onClick={() => navigate(`/students/${s.reg}`)}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
