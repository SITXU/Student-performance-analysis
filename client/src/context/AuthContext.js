import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spars_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('spars_token'));

  // Axios instance with token
  const api = axios.create({ baseURL: '/api' });
  api.interceptors.request.use(cfg => {
    const t = localStorage.getItem('spars_token');
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
  });
  api.interceptors.response.use(r => r, err => {
    if (err.response?.status === 401) logout();
    return Promise.reject(err);
  });

  const login = useCallback(async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('spars_token', t);
    localStorage.setItem('spars_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('spars_token');
    localStorage.removeItem('spars_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, api, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
