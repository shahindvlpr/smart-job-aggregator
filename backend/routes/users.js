const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, updateResume } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

router.get('/profile',  authMiddleware, getProfile);
router.put('/profile',  authMiddleware, updateProfile);
router.put('/resume',   authMiddleware, updateResume);

module.exports = router;