const express = require('express');
const router  = express.Router();
const {
  searchJobs, getJob, saveJob, unsaveJob, getSavedJobs, getMatchedJobs
} = require('../controllers/jobController');
const { authMiddleware } = require('../middleware/auth');

router.get('/',            searchJobs);
router.get('/saved',       authMiddleware, getSavedJobs);
router.get('/matches',     authMiddleware, getMatchedJobs);
router.get('/:id',         getJob);
router.post('/:id/save',   authMiddleware, saveJob);
router.delete('/:id/save', authMiddleware, unsaveJob);

module.exports = router;