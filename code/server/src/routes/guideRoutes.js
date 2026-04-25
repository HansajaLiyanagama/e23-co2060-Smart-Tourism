const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');

// Import middleware
const verifyToken = require('../middleware/authMiddleware');
router.put('/profile', authMiddleware, guideController.updateProfile);

module.exports = router;