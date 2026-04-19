import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import COAnalysis from './pages/COAnalysis';
import Toppers from './pages/Toppers';
import AtRisk from './pages/AtRisk';
import MyProfile from './pages/MyProfile';
import Layout from './components/Layout';
import './index.css';

function ProtectedRoute({ children, roles }) {
  const { isAuth, user } = useAuth();
  if (!isAuth) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={
          user?.role === 'student'
            ? <Navigate to="/my-profile" replace />
            : <Navigate to="/dashboard" replace />
        } />
        <Route path="dashboard" element={
          <ProtectedRoute roles={['admin','teacher']}><Dashboard /></ProtectedRoute>
        } />
        <Route path="students" element={
          <ProtectedRoute roles={['admin','teacher']}><Students /></ProtectedRoute>
        } />
        <Route path="students/:reg" element={
          <ProtectedRoute><StudentDetail /></ProtectedRoute>
        } />
        <Route path="co-analysis" element={
          <ProtectedRoute roles={['admin','teacher']}><COAnalysis /></ProtectedRoute>
        } />
        <Route path="toppers" element={
          <ProtectedRoute roles={['admin','teacher']}><Toppers /></ProtectedRoute>
        } />
        <Route path="at-risk" element={
          <ProtectedRoute roles={['admin','teacher']}><AtRisk /></ProtectedRoute>
        } />
        <Route path="my-profile" element={
          <ProtectedRoute roles={['student']}><MyProfile /></ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
