const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');

// Import middleware as verifyToken
const verifyToken = require('../middleware/authMiddleware');

// Use verifyToken here!
router.put('/profile', verifyToken, guideController.updateProfile);

// New Route: Fetch all guides
router.get('/all', verifyToken, guideController.getGuides);

module.exports = router;