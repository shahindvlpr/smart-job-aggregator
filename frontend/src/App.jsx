import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage     from './pages/JobsPage';
import ProfilePage  from './pages/ProfilePage';
import AdminPage    from './pages/AdminPage';

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav style={styles.nav}>
      <Link to="/jobs" style={styles.logo}>💼 SmartJobs</Link>
      <div style={styles.navLinks}>
        <Link to="/jobs" style={styles.link}>Jobs</Link>
        {user && <Link to="/profile" style={styles.link}>Profile</Link>}
        {user?.role === 'admin' && <Link to="/admin" style={styles.link}>Admin</Link>}
        {user
          ? <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          : <Link to="/login" style={styles.loginBtn}>Login</Link>
        }
      </div>
    </nav>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"         element={<Navigate to="/jobs" />} />
          <Route path="/jobs"     element={<JobsPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/admin"    element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const styles = {
  nav:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '60px', background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 },
  logo:      { fontSize: '18px', fontWeight: '700', textDecoration: 'none', color: '#1e3a8a' },
  navLinks:  { display: 'flex', alignItems: 'center', gap: '16px' },
  link:      { textDecoration: 'none', color: '#374151', fontSize: '14px', fontWeight: '500' },
  loginBtn:  { padding: '7px 16px', background: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  logoutBtn: { padding: '7px 16px', background: 'none', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' },
};