const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const verifyToken = require('../middleware/authMiddleware');

// Existing: Tourist sends a request
router.post('/create', verifyToken, requestController.createBookingRequest);

// NEW: Guide fetches their requests
router.get('/me', verifyToken, requestController.getRequestsForGuide);

// NEW: Tourist fetches their own sent requests
router.get('/tourist', verifyToken, requestController.getRequestsForTourist);

// NEW: Guide accepts or declines a request
router.put('/:id/status', verifyToken, requestController.updateStatus);

module.exports = router;