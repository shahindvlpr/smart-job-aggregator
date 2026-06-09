const db         = require('../config/db');
const jobFetcher = require('../services/jobFetcher');

async function getStats(req, res) {
  try {
    const [[users]]  = await db.query('SELECT COUNT(*) as count FROM users');
    const [[jobs]]   = await db.query('SELECT COUNT(*) as count FROM jobs');
    const [[saved]]  = await db.query('SELECT COUNT(*) as count FROM saved_jobs');
    const [[emails]] = await db.query('SELECT COUNT(*) as count FROM notifications');

    res.json({
      totalUsers:      users.count,
      totalJobs:       jobs.count,
      totalSavedJobs:  saved.count,
      totalEmailsSent: emails.count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllUsers(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, location, notify_email, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    await db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function triggerFetch(req, res) {
  try {
    res.json({ message: 'Job fetch started in background' });
    jobFetcher.fetchAndStoreJobs();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getStats, getAllUsers, deleteUser, triggerFetch };