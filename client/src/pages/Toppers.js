import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CO_COLORS = { CO1:'#00d4ff', CO2:'#7c3aed', CO3:'#10b981', CO4:'#f59e0b', CO5:'#ef4444' };
const MEDALS = ['🥇','🥈','🥉'];

export default function Toppers() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [toppers, setToppers] = useState([]);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    api.get('/analytics/toppers', { params: { limit } }).then(r => setToppers(r.data));
  }, [limit]);

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2>Top Performers</h2>
          <p>Ranked by total internal marks</p>
        </div>
        <select className="search-input" style={{ width: 140 }} value={limit} onChange={e => setLimit(+e.target.value)}>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th><th>Name</th><th>Reg. No.</th>
                <th>Mid-Sem</th><th>Total</th>
                {['CO1','CO2','CO3','CO4','CO5'].map(co => <th key={co}>{co}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {toppers.map((s, i) => (
                <tr key={s.reg} style={{ background: i < 3 ? 'rgba(245,158,11,0.04)' : undefined }}>
                  <td>
                    <span className={`rank-badge ${i < 3 ? 'rank-top' : ''}`}>
                      {i < 3 ? MEDALS[i] : i + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td><code>{s.reg}</code></td>
                  <td><span className="pill pill-blue">{s.midSem}/20</span></td>
                  <td><span className="pill pill-green">{s.total}/30</span></td>
                  {Object.entries(s.coScores).map(([co, pct]) => (
                    <td key={co}>
                      <span style={{ fontSize: 12, color: pct >= 50 ? CO_COLORS[co] : '#ef4444', fontWeight: 600 }}>{pct}%</span>
                    </td>
                  ))}
                  <td>
                    <button className="btn btn-xs" onClick={() => navigate(`/students/${s.reg}`)}>Report</button>
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
