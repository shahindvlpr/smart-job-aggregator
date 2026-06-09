import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(new Set());
  const [filters, setFilters] = useState({ q: '', location: '', type: '', page: 1 });

  useEffect(() => { fetchJobs(); }, [filters.page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs', { params: filters });
      setJobs(res.data.jobs);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, page: 1 }));
    fetchJobs();
  };

  const toggleSave = async (jobId) => {
    if (!user) return alert('Please login to save jobs');
    if (saved.has(jobId)) {
      await api.delete(`/jobs/${jobId}/save`);
      setSaved(s => { const n = new Set(s); n.delete(jobId); return n; });
    } else {
      await api.post(`/jobs/${jobId}/save`);
      setSaved(s => new Set(s).add(jobId));
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Find Your Next Job</h1>

      <form onSubmit={handleSearch} style={styles.searchBar}>
        <input style={styles.input} placeholder="Job title, skills..."
          value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} />
        <input style={styles.input} placeholder="Location"
          value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} />
        <select style={styles.input} value={filters.type}
          onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">All types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="remote">Remote</option>
        </select>
        <button style={styles.btn} type="submit">Search</button>
      </form>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Loading jobs...</p>
      ) : (
        <div style={styles.grid}>
          {jobs.map(job => (
            <div key={job.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <p style={styles.company}>{job.company} · {job.location}</p>
                </div>
                <span style={{
                  ...styles.sourceBadge,
                  background: job.source === 'adzuna' ? '#dbeafe' : '#f3e8ff',
                  color: job.source === 'adzuna' ? '#1e40af' : '#7c3aed',
                }}>{job.source}</span>
              </div>

              {job.salary_min && (
                <p style={styles.salary}>
                  ${Number(job.salary_min).toLocaleString()} – ${Number(job.salary_max).toLocaleString()}
                </p>
              )}

              <p style={styles.desc}>
                {job.description?.slice(0, 120)}...
              </p>

              <div style={styles.cardActions}>
                <a href={job.url} target="_blank" rel="noreferrer" style={styles.applyBtn}>
                  Apply Now
                </a>
                <button onClick={() => toggleSave(job.id)} style={{
                  ...styles.saveBtn,
                  background: saved.has(job.id) ? '#fef3c7' : '#f9fafb',
                  color:      saved.has(job.id) ? '#d97706' : '#374151',
                }}>
                  {saved.has(job.id) ? '★ Saved' : '☆ Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.pagination}>
        <button style={styles.pageBtn} disabled={filters.page === 1}
          onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
        <span style={{ padding: '0 12px' }}>Page {filters.page}</span>
        <button style={styles.pageBtn}
          onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
      </div>
    </div>
  );
}

const styles = {
  page:       { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  heading:    { fontSize: '28px', marginBottom: '1.5rem' },
  searchBar:  { display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' },
  input:      { flex: 1, minWidth: '160px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  btn:        { padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
  card:       { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobTitle:   { margin: 0, fontSize: '16px', fontWeight: '600' },
  company:    { margin: '4px 0 0', color: '#6b7280', fontSize: '14px' },
  sourceBadge:{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' },
  salary:     { color: '#059669', fontWeight: '500', fontSize: '14px', margin: 0 },
  desc:       { color: '#6b7280', fontSize: '13px', lineHeight: '1.5', margin: 0 },
  cardActions:{ display: 'flex', gap: '8px', marginTop: '8px' },
  applyBtn:   { flex: 1, textAlign: 'center', padding: '8px', background: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  saveBtn:    { padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2rem' },
  pageBtn:    { padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: '#fff' },
};
