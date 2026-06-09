require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const cron    = require('node-cron');

const authRoutes   = require('./routes/auth');
const jobRoutes    = require('./routes/jobs');
const userRoutes   = require('./routes/users');
const adminRoutes  = require('./routes/admin');
const jobFetcher   = require('./services/jobFetcher');

const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',  authRoutes);
app.use('/api/jobs',  jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => res.json({ status: 'Smart Job Aggregator API running' }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// Cron: fetch fresh jobs every 6 hours
cron.schedule('0 */6 * * *', () => {
  console.log('Running scheduled job fetch...');
  jobFetcher.fetchAndStoreJobs();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Fetch jobs on startup
  jobFetcher.fetchAndStoreJobs();
});