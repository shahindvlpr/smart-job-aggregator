import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminPage() {
  const [stats,   setStats]   = useState({});
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/users')])
      .then(([s, u]) => { setStats(s.data); setUsers(u.data); })
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(u => u.filter(x => x.id !== id));
  };

  const triggerFetch = async () => {
    await api.post('/admin/fetch-jobs');
    alert('Job fetch started!');
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Admin Dashboard</h1>

      <div style={styles.statsGrid}>
        {[
          { label: 'Total Users',      value: stats.totalUsers },
          { label: 'Total Jobs',       value: stats.totalJobs },
          { label: 'Saved Jobs',       value: stats.totalSavedJobs },
          { label: 'Emails Sent',      value: stats.totalEmailsSent },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statValue}>{s.value ?? 0}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button style={styles.btn} onClick={triggerFetch}>
          🔄 Fetch New Jobs Now
        </button>
      </div>

      <h2 style={styles.subheading}>All Users</h2>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Joined</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={styles.tr}>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.roleBadge, background: u.role === 'admin' ? '#dbeafe' : '#f3f4f6', color: u.role === 'admin' ? '#1e40af' : '#374151' }}>
                    {u.role}
                  </span>
                </td>
                <td style={styles.td}>{u.location || '—'}</td>
                <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  {u.role !== 'admin' && (
                    <button style={styles.deleteBtn} onClick={() => deleteUser(u.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page:       { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  heading:    { fontSize: '28px', marginBottom: '1.5rem' },
  subheading: { fontSize: '20px', margin: '0 0 1rem' },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '2rem' },
  statCard:   { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' },
  statValue:  { fontSize: '32px', fontWeight: '700', color: '#2563eb' },
  statLabel:  { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  btn:        { padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
  tableWrap:  { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  thead:      { background: '#f9fafb' },
  th:         { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' },
  tr:         { borderBottom: '1px solid #f3f4f6' },
  td:         { padding: '12px 16px', fontSize: '14px', color: '#374151' },
  roleBadge:  { padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' },
  deleteBtn:  { padding: '4px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
};