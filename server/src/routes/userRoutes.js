const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const itineraryController = require('../controllers/itineraryController');

/**
 * USER ROUTES
 * Routes for user profile management
 */

// Get user profile
router.get('/:id/profile', userController.getUserProfile);

// Update tourist profile
router.post('/:id/profile', userController.updateTouristProfile);

// Update guide profile
router.post('/:id/guide-profile', userController.updateGuideProfile);

// Get all itineraries for a tourist
router.get('/:tourist_id/itineraries', itineraryController.getTouristItineraries);

module.exports = router;
