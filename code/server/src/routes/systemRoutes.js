const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const verifyToken = require('../middleware/authMiddleware');

// URL: http://localhost:5000/api/system/status
router.get('/status', systemController.getStatus);

// PROTECTED ROUTE: Only people with a valid Token can see this
router.get('/private-data', verifyToken, (req, res) => {
    res.json({
        message: "Welcome to the VIP area!",
        your_id: req.user.id,
        your_role: req.user.role
    });
});

module.exports = router;