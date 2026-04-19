import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Students() {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editStudent, setEditStudent] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const LIMIT = 20;

  const fetchStudents = () => {
    setLoading(true);
    api.get('/students', { params: { search, page, limit: LIMIT } })
      .then(r => { setStudents(r.data.students); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [search, page]);

  const openEdit = (s) => {
    setEditStudent(s);
    setEditData({ midSem: s.midSem, quiz: s.quiz, assign: s.assign, attend: s.attend });
    setMsg('');
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/students/${editStudent.reg}`, editData);
      setMsg('✅ Saved!');
      fetchStudents();
      setTimeout(() => { setEditStudent(null); setMsg(''); }, 1000);
    } catch (e) {
      setMsg('❌ Save failed');
    } finally { setSaving(false); }
  };

  const deleteStudent = async (reg) => {
    if (!window.confirm('Delete this student record?')) return;
    await api.delete(`/students/${reg}`);
    fetchStudents();
  };

  const scorePill = (total) => {
    if (total === null) return <span className="pill pill-grey">ABSENT</span>;
    const pct = (total / 30) * 100;
    return <span className={`pill ${pct >= 60 ? 'pill-green' : 'pill-red'}`}>{total}/30</span>;
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="page">
      <div className="page-header">
        <h2>All Students</h2>
        <p>Complete class roster — {total} students</p>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by name or reg. no..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Reg. No.</th>
                  <th>Mid-Sem</th><th>Quiz</th><th>Assign</th><th>Total</th>
                  <th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const pct = s.total ? Math.round((s.total / 30) * 100) : 0;
                  return (
                    <tr key={s.reg}>
                      <td>{s.sl}</td>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td><code>{s.reg}</code></td>
                      <td>{s.absent ? '—' : s.midSem}</td>
                      <td>{s.absent ? '—' : s.quiz}</td>
                      <td>{s.absent ? '—' : s.assign}</td>
                      <td>{scorePill(s.total)}</td>
                      <td>
                        {s.absent
                          ? <span className="pill pill-grey">Absent</span>
                          : <span className={`pill ${pct >= 60 ? 'pill-green' : 'pill-red'}`}>{pct >= 60 ? 'Pass' : 'At Risk'}</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-xs" onClick={() => navigate(`/students/${s.reg}`)}>View</button>
                          {user.role !== 'student' && !s.absent && (
                            <button className="btn btn-xs btn-ghost" onClick={() => openEdit(s)}>Edit</button>
                          )}
                          {user.role === 'admin' && (
                            <button className="btn btn-xs btn-danger" onClick={() => deleteStudent(s.reg)}>Del</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost btn-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {pages}</span>
          <button className="btn btn-ghost btn-xs" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* Edit Modal */}
      {editStudent && (
        <div className="modal-overlay" onClick={() => setEditStudent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Marks — {editStudent.name}</h3>
              <button className="modal-close" onClick={() => setEditStudent(null)}>✕</button>
            </div>
            <div className="modal-body">
              {[['midSem', 'Mid-Sem (/20)', 0, 20], ['quiz', 'Quiz (/5)', 0, 5], ['assign', 'Assignment (/5)', 0, 5], ['attend', 'Attendance', 0, 5]].map(([key, label, min, max]) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input
                    type="number" min={min} max={max} step="0.5"
                    value={editData[key] ?? ''}
                    onChange={e => setEditData(d => ({ ...d, [key]: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              ))}
              <div className="computed-total">
                New Total: <strong>{(editData.midSem || 0) + (editData.quiz || 0) + (editData.assign || 0)}/30</strong>
              </div>
              {msg && <div className={msg.startsWith('✅') ? 'alert-success' : 'alert-error'}>{msg}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditStudent(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
