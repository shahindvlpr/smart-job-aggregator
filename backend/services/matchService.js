const db = require('../config/db');

function extractKeywords(text) {
  if (!text) return [];
  const techKeywords = [
    'javascript','typescript','react','vue','angular','node','express','python',
    'django','flask','java','spring','php','laravel','mysql','postgresql','mongodb',
    'redis','docker','kubernetes','aws','azure','gcp','git','linux','css','html',
    'graphql','rest','api','agile','scrum','machine learning','data science',
    'figma','photoshop','marketing','seo','analytics','project management',
  ];
  const lower = text.toLowerCase();
  return techKeywords.filter(kw => lower.includes(kw));
}

function computeScore(userKeywords, job) {
  if (userKeywords.length === 0) return { score: 0, reason: 'No keywords' };
  const jobText     = `${job.title} ${job.description} ${job.category}`.toLowerCase();
  const jobKeywords = extractKeywords(jobText);
  const matched     = userKeywords.filter(kw => jobKeywords.includes(kw));
  return {
    score:  Math.min(Math.round((matched.length / userKeywords.length) * 100), 100),
    reason: matched.length > 0
      ? `Matched skills: ${matched.slice(0, 5).join(', ')}`
      : 'No skill match found',
  };
}

async function getTopMatches(userId, user) {
  const userSkills     = Array.isArray(user.skills) ? user.skills.map(s => s.toLowerCase()) : [];
  const resumeKeywords = extractKeywords(user.resume_text || '');
  const allKeywords    = [...new Set([...userSkills, ...resumeKeywords])];

  const [jobs] = await db.query(
    'SELECT id, title, company, location, description, category, url, salary_min, salary_max, posted_at FROM jobs LIMIT 500'
  );

  const scored = jobs
    .map(job => {
      const { score, reason } = computeScore(allKeywords, job);
      return { ...job, match_score: score, match_reason: reason };
    })
    .filter(j => j.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 20);

  for (const job of scored) {
    await db.query(
      `INSERT INTO job_matches (user_id, job_id, match_score, match_reason)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE match_score = ?, match_reason = ?`,
      [userId, job.id, job.match_score, job.match_reason, job.match_score, job.match_reason]
    );
  }

  return scored;
}

module.exports = { getTopMatches };