const db           = require('../config/db');
const matchService = require('../services/matchService');

async function searchJobs(req, res) {
  const { q = '', location = '', category = '', type = '', page = 1 } = req.query;
  const limit  = 20;
  const offset = (page - 1) * limit;

  let sql    = 'SELECT * FROM jobs WHERE 1=1';
  let params = [];

  if (q) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR company LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (location) { sql += ' AND location LIKE ?'; params.push(`%${location}%`); }
  if (category) { sql += ' AND category = ?';    params.push(category); }
  if (type)     { sql += ' AND job_type = ?';    params.push(type); }

  sql += ' ORDER BY posted_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const [jobs]  = await db.query(sql, params);
    const [count] = await db.query(
      sql.replace('SELECT *', 'SELECT COUNT(*) as total').split('ORDER BY')[0],
      params.slice(0, -2)
    );
    res.json({ jobs, total: count[0]?.total || 0, page: Number(page), limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getJob(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function saveJob(req, res) {
  try {
    await db.query(
      'INSERT IGNORE INTO saved_jobs (user_id, job_id) VALUES (?, ?)',
      [req.user.id, req.params.id]
    );
    res.json({ message: 'Job saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function unsaveJob(req, res) {
  try {
    await db.query(
      'DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?',
      [req.user.id, req.params.id]
    );
    res.json({ message: 'Job removed from saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSavedJobs(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT j.*, sj.saved_at
       FROM jobs j
       JOIN saved_jobs sj ON j.id = sj.job_id
       WHERE sj.user_id = ?
       ORDER BY sj.saved_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMatchedJobs(req, res) {
  try {
    const [userRows] = await db.query(
      'SELECT resume_text, skills FROM users WHERE id = ?',
      [req.user.id]
    );
    const user = userRows[0];

    if (!user.resume_text && !user.skills) {
      return res.status(400).json({ error: 'Please add your resume or skills first' });
    }

    const matches = await matchService.getTopMatches(req.user.id, user);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { searchJobs, getJob, saveJob, unsaveJob, getSavedJobs, getMatchedJobs };