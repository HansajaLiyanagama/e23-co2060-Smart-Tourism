const bcrypt = require('bcrypt');
const userRepo = require('../repositories/userRepo');

/**
 * we use bycrypt because if a hacker steals our database, they will only see randomized hash strings, 
 * not our tourists' real passwords. bcrypt also adds a 'salt'—random data added 
 * to the password before hashing—which defends against Rainbow Table cyber attacks."
 */
const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // 1. Check if the user already exists
        const existingUser = await userRepo.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // 2. Hash the password (Security Layer)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Save the new user to the database
        const newUser = await userRepo.createUser(email, passwordHash, role);

        // 4. Send a success response back to the frontend
        res.status(201).json({
            message: 'User registered successfully!',
            user: newUser
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { register };