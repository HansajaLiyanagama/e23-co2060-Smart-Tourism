const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const verifyToken = require('../middleware/authMiddleware');

// Protect the route so only logged-in users can create trips
router.post('/create', verifyToken, itineraryController.createTrip);

module.exports = router;