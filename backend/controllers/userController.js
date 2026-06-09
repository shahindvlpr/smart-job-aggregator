const db = require('../config/db');

async function getProfile(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, skills, location, resume_text, notify_email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  const { name, location, skills, notify_email } = req.body;
  try {
    await db.query(
      'UPDATE users SET name = ?, location = ?, skills = ?, notify_email = ? WHERE id = ?',
      [name, location, JSON.stringify(skills || []), notify_email, req.user.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateResume(req, res) {
  const { resume_text } = req.body;
  if (!resume_text)
    return res.status(400).json({ error: 'resume_text is required' });

  try {
    await db.query('UPDATE users SET resume_text = ? WHERE id = ?', [resume_text, req.user.id]);
    res.json({ message: 'Resume saved. AI matching is now enabled!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getProfile, updateProfile, updateResume };