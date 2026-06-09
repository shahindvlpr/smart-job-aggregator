const express = require('express');
const router  = express.Router();
const { getStats, getAllUsers, deleteUser, triggerFetch } = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware, adminOnly);

router.get('/stats',        getStats);
router.get('/users',        getAllUsers);
router.delete('/users/:id', deleteUser);
router.post('/fetch-jobs',  triggerFetch);

module.exports = router;