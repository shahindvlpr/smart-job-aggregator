const axios = require('axios');
const db    = require('../config/db');

async function fetchFromAdzuna(query = 'developer', country = 'gb') {
  try {
    const { data } = await axios.get(
      `${process.env.ADZUNA_BASE_URL}/jobs/${country}/search/1`, {
        params: {
          app_id:           process.env.ADZUNA_APP_ID,
          app_key:          process.env.ADZUNA_APP_KEY,
          results_per_page: 50,
          what:             query,
        }
      }
    );
    return (data.results || []).map(job => ({
      external_id: `adzuna_${job.id}`,
      source:      'adzuna',
      title:       job.title,
      company:     job.company?.display_name || 'Unknown',
      location:    job.location?.display_name || '',
      description: job.description,
      salary_min:  job.salary_min || null,
      salary_max:  job.salary_max || null,
      job_type:    job.contract_time || 'full-time',
      category:    job.category?.label || '',
      url:         job.redirect_url,
      posted_at:   new Date(job.created),
    }));
  } catch (err) {
    console.error('Adzuna fetch error:', err.message);
    return [];
  }
}

async function fetchFromJSearch(query = 'software developer') {
  try {
    const { data } = await axios.get(`${process.env.JSEARCH_BASE_URL}/search`, {
      params: { query, page: '1', num_pages: '2' },
      headers: {
        'X-RapidAPI-Key':  process.env.JSEARCH_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      }
    });
    return (data.data || []).map(job => ({
      external_id: `jsearch_${job.job_id}`,
      source:      'jsearch',
      title:       job.job_title,
      company:     job.employer_name || 'Unknown',
      location:    `${job.job_city || ''}, ${job.job_country || ''}`.trim(),
      description: job.job_description,
      salary_min:  job.job_min_salary || null,
      salary_max:  job.job_max_salary || null,
      job_type:    job.job_employment_type?.toLowerCase() || 'full-time',
      category:    'General',
      url:         job.job_apply_link,
      posted_at:   job.job_posted_at_datetime_utc
                     ? new Date(job.job_posted_at_datetime_utc) : new Date(),
    }));
  } catch (err) {
    console.error('JSearch fetch error:', err.message);
    return [];
  }
}

async function storeJobs(jobs) {
  let inserted = 0;
  for (const job of jobs) {
    try {
      await db.query(
        `INSERT IGNORE INTO jobs
          (external_id, source, title, company, location, description,
           salary_min, salary_max, job_type, category, url, posted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          job.external_id, job.source,    job.title,    job.company,
          job.location,    job.description, job.salary_min, job.salary_max,
          job.job_type,    job.category,  job.url,      job.posted_at
        ]
      );
      inserted++;
    } catch (e) { /* skip duplicates */ }
  }
  console.log(`Stored ${inserted} new jobs`);
}

async function fetchAndStoreJobs() {
  console.log('Fetching jobs from external APIs...');
  const queries = ['developer', 'designer', 'data analyst', 'marketing', 'project manager'];
  for (const q of queries) {
    const [adzunaJobs, jsearchJobs] = await Promise.all([
      fetchFromAdzuna(q),
      fetchFromJSearch(q),
    ]);
    await storeJobs([...adzunaJobs, ...jsearchJobs]);
  }
  console.log('Job fetch complete');
}

module.exports = { fetchAndStoreJobs };