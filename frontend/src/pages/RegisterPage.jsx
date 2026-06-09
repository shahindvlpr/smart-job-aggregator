import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register }   = useAuth();
  const navigate       = useNavigate();
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.sub}>Start finding your dream job today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} type="text" placeholder="John Doe"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />

          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />

          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" placeholder="Min 6 characters"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card:      { background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  title:     { margin: '0 0 4px', fontSize: '24px' },
  sub:       { margin: '0 0 1.5rem', color: '#666' },
  label:     { display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' },
  input:     { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem', fontSize: '14px', boxSizing: 'border-box' },
  btn:       { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' },
  error:     { background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' },
  footer:    { textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#666' },
};