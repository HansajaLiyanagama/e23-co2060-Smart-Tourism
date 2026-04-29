const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');

/**
 * TRAVEL GUIDE ROUTES
 * Public routes to browse and view travel guides
 */

// Get all guides
router.get('/', guideController.getAllGuides);

// Get guide by ID
router.get('/:id', guideController.getGuideById);

module.exports = router;
