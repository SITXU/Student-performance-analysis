import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  admin:   [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/co-analysis', icon: '🎯', label: 'CO Analysis' },
    { to: '/students', icon: '📋', label: 'All Students' },
    { to: '/toppers', icon: '🏆', label: 'Toppers' },
    { to: '/at-risk', icon: '⚠️', label: 'At Risk' },
  ],
  teacher: [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/co-analysis', icon: '🎯', label: 'CO Analysis' },
    { to: '/students', icon: '📋', label: 'All Students' },
    { to: '/toppers', icon: '🏆', label: 'Toppers' },
    { to: '/at-risk', icon: '⚠️', label: 'At Risk' },
  ],
  student: [
    { to: '/my-profile', icon: '👤', label: 'My Report' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColor = { admin: '#00d4ff', teacher: '#7c3aed', student: '#10b981' };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">☁️</div>
          <div>
            <div className="brand-name">SPARS</div>
            <div className="brand-sub">Student Performance Analysis</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="user-badge" style={{ borderColor: roleColor[user?.role] + '44' }}>
            <span className="user-dot" style={{ background: roleColor[user?.role] }}></span>
            <span>{user?.name} · <strong>{user?.role}</strong></span>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout}>Logout →</button>
        </div>
      </header>
      <div className="body-wrap">
        <nav className="sidebar">
          {(NAV[user?.role] || []).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
