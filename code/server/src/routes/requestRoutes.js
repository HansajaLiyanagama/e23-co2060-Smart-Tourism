const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const verifyToken = require('../middleware/authMiddleware');

// Route for tourists to send a request to a guide
router.post('/create', verifyToken, requestController.createBookingRequest);

module.exports = router;