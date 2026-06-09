import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user }  = useAuth();
  const [profile, setProfile] = useState({ name: '', location: '', skills: [], notify_email: true });
  const [resume,  setResume]  = useState('');
  const [saved,   setSaved]   = useState([]);
  const [matches, setMatches] = useState([]);
  const [tab,     setTab]     = useState('profile');
  const [msg,     setMsg]     = useState('');

  useEffect(() => {
    api.get('/users/profile').then(r => {
      setProfile(r.data);
      setResume(r.data.resume_text || '');
    });
    api.get('/jobs/saved').then(r => setSaved(r.data));
  }, []);

  const saveProfile = async () => {
    await api.put('/users/profile', profile);
    setMsg('Profile updated!');
    setTimeout(() => setMsg(''), 3000);
  };

  const saveResume = async () => {
    await api.put('/users/resume', { resume_text: resume });
    setMsg('Resume saved!');
    setTimeout(() => setMsg(''), 3000);
  };

  const loadMatches = async () => {
    setTab('matches');
    const res = await api.get('/jobs/matches');
    setMatches(res.data);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>My Profile</h1>

      <div style={styles.tabs}>
        {['profile', 'resume', 'saved', 'matches'].map(t => (
          <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }}
            onClick={() => t === 'matches' ? loadMatches() : setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {msg && <div style={styles.success}>{msg}</div>}

      {tab === 'profile' && (
        <div style={styles.section}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} value={profile.name || ''}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />

          <label style={styles.label}>Location</label>
          <input style={styles.input} value={profile.location || ''}
            onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} />

          <label style={styles.label}>Skills (comma separated)</label>
          <input style={styles.input}
            value={Array.isArray(profile.skills) ? profile.skills.join(', ') : ''}
            onChange={e => setProfile(p => ({ ...p, skills: e.target.value.split(',').map(s => s.trim()) }))} />

          <label style={styles.checkLabel}>
            <input type="checkbox" checked={profile.notify_email || false}
              onChange={e => setProfile(p => ({ ...p, notify_email: e.target.checked }))} />
            &nbsp; Email notifications
          </label>

          <button style={styles.btn} onClick={saveProfile}>Save Profile</button>
        </div>
      )}

      {tab === 'resume' && (
        <div style={styles.section}>
          <label style={styles.label}>Paste your resume text (used for AI job matching)</label>
          <textarea style={styles.textarea} rows={14} value={resume}
            onChange={e => setResume(e.target.value)}
            placeholder="Paste your resume here..." />
          <button style={styles.btn} onClick={saveResume}>Save Resume</button>
        </div>
      )}

      {tab === 'saved' && (
        <div style={styles.section}>
          <h3 style={{ marginTop: 0 }}>Saved Jobs ({saved.length})</h3>
          {saved.length === 0 && <p style={{ color: '#6b7280' }}>No saved jobs yet.</p>}
          {saved.map(job => (
            <div key={job.id} style={styles.jobRow}>
              <div>
                <strong>{job.title}</strong>
                <p style={styles.sub}>{job.company} · {job.location}</p>
              </div>
              <a href={job.url} target="_blank" rel="noreferrer" style={styles.applyBtn}>Apply</a>
            </div>
          ))}
        </div>
      )}

      {tab === 'matches' && (
        <div style={styles.section}>
          <h3 style={{ marginTop: 0 }}>AI Matched Jobs</h3>
          {matches.length === 0 && <p style={{ color: '#6b7280' }}>No matches yet. Add your resume or skills first.</p>}
          {matches.map(job => (
            <div key={job.id} style={styles.jobRow}>
              <div>
                <strong>{job.title}</strong>
                <p style={styles.sub}>{job.company} · {job.location}</p>
                <p style={styles.matchReason}>{job.match_reason}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={styles.score}>{job.match_score}%</span>
                <br />
                <a href={job.url} target="_blank" rel="noreferrer" style={styles.applyBtn}>Apply</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page:       { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' },
  heading:    { fontSize: '28px', marginBottom: '1.5rem' },
  tabs:       { display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0' },
  tab:        { padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#6b7280', borderBottom: '2px solid transparent' },
  activeTab:  { color: '#2563eb', borderBottom: '2px solid #2563eb' },
  section:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' },
  label:      { display: 'block', fontWeight: '500', fontSize: '14px', marginBottom: '4px', marginTop: '12px' },
  checkLabel: { display: 'flex', alignItems: 'center', marginTop: '12px', fontSize: '14px', cursor: 'pointer' },
  input:      { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  textarea:   { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'monospace', resize: 'vertical' },
  btn:        { marginTop: '1rem', padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  success:    { background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' },
  jobRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
  sub:        { margin: '2px 0 0', color: '#6b7280', fontSize: '13px' },
  matchReason:{ margin: '4px 0 0', color: '#059669', fontSize: '12px' },
  score:      { background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '13px' },
  applyBtn:   { padding: '6px 14px', background: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px' },
};