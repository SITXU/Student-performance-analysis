import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { key: 'admin', icon: '🛡️', label: 'Administrator', hint: 'admin / admin123', color: '#00d4ff' },
  { key: 'teacher', icon: '👩‍🏫', label: 'Teacher', hint: 'teacher / teach123', color: '#7c3aed' },
  { key: 'student', icon: '🎓', label: 'Student', hint: 'Reg No. as both user & pass', color: '#10b981' },
];

export default function Login() {
  const [step, setStep] = useState('roles');
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const selectRole = (r) => { setRole(r); setStep('form'); setError(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(username.trim(), password.trim());
      navigate(user.role === 'student' ? '/my-profile' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">☁️</div>
          <h1>Student Performance<br/>Analysis System</h1>
          <p>Odisha University of Technology and Research</p>
          <div className="login-meta">Cloud Computing · UPECS710 · Sem 5 CSE</div>
        </div>

        {step === 'roles' && (
          <div className="role-grid">
            {ROLES.map(r => (
              <button key={r.key} className="role-card" onClick={() => selectRole(r)} style={{ '--rc': r.color }}>
                <div className="role-icon" style={{ background: r.color + '22' }}>{r.icon}</div>
                <div className="role-label">{r.label}</div>
                <div className="role-hint">{r.hint}</div>
              </button>
            ))}
          </div>
        )}

        {step === 'form' && (
          <form className="login-form" onSubmit={handleLogin}>
            <button type="button" className="back-link" onClick={() => setStep('roles')}>← Back</button>
            <div className="form-role-badge" style={{ background: ROLES.find(r=>r.key===role?.key)?.color + '22', color: ROLES.find(r=>r.key===role?.key)?.color }}>
              {role?.icon} {role?.label} Login
            </div>
            {error && <div className="alert-error">{error}</div>}
            <div className="form-group">
              <label>Username / Registration No.</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username" autoFocus />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
            <div className="cred-hint">Hint: <code>{role?.hint}</code></div>
          </form>
        )}
      </div>
    </div>
  );
}
