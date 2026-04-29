const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepo');

/**
 * we use bycrypt because if a hacker steals our database, they will only see randomized hash strings, 
 * not our tourists' real passwords. bcrypt also adds a 'salt'—random data added 
 * to the password before hashing—which defends against Rainbow Table cyber attacks."
 */
const register = async (req, res) => {
    try {
        const { email, password, role, full_name, contact_number, covered_locations } = req.body;

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

        // 4. Create initial profile if data provided
        if (full_name) {
            if (role === 'guide') {
                await userRepo.updateGuideProfile(
                    newUser.id, 
                    full_name, 
                    null, // bio
                    null, // license_number (NULL allows multiple entries, unlike '')
                    0, // hourly_rate
                    contact_number || null,
                    null, // profile_image_url
                    null, // specialization
                    0, // experience_years
                    null, // languages
                    covered_locations || null
                );
            } else {
                await userRepo.updateTouristProfile(newUser.id, full_name, '', contact_number || null);
            }
        }

        // 5. Send a success response back to the frontend
        res.status(201).json({
            message: 'User registered successfully!',
            user: newUser
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * LOGIN - Authenticate user and return JWT token
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // 2. Find user by email
        const user = await userRepo.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 3. Compare password with hash
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '24h' }
        );

        // 5. Return success with token
        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { register, login };