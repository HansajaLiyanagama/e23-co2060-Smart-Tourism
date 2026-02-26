const jwt = require('jsonwebtoken');

/**
 * THE GATEKEEPER LOGIC
 * This function intercepts the request, looks for the token, 
 * and decides if the user is allowed to proceed.
 */
const verifyToken = (req, res, next) => {
    // 1. Get the token from the Header (Standard: Authorization: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Splits "Bearer" from the actual token

    if (!token) {
        return res.status(401).json({ error: 'Access Denied: No Token Provided' });
    }

    try {
        // 2. Verify the token using our Secret Key from .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the user data (id, role) to the 'req' object
        // This makes the user's info available in the next function (the Controller)
        req.user = verified;
        
        // 4. Move to the next function (the Controller)
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or Expired Token' });
    }
};

module.exports = verifyToken;