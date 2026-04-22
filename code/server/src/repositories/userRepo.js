const db = require('../config/db');

// Check if an email is already in the database
const findUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await db.query(query, [email]);
    return result.rows[0];
};

// Insert a new user into the database AND create their profile
const createUser = async (fullName, email, passwordHash, role) => {
    const assignedRole = role || 'tourist'; // Default to tourist if undefined
    
    // 1. Insert into main users table
    const userQuery = `
        INSERT INTO users (email, password_hash, role)
        VALUES ($1, $2, $3)
        RETURNING id, email, role, created_at;
    `;
    const userResult = await db.query(userQuery, [email, passwordHash, assignedRole]);
    const newUser = userResult.rows[0];

    // 2. Create the corresponding empty profile based on the role
    if (assignedRole === 'tourist') {
        const touristQuery = `INSERT INTO tourist_profiles (user_id, full_name) VALUES ($1, $2)`;
        await db.query(touristQuery, [newUser.id]);
    } else if (assignedRole === 'guide') {
        const guideQuery = `INSERT INTO guide_profiles (user_id, full_name) VALUES ($1, $2)`;
        await db.query(guideQuery, [newUser.id]);
    }

    return newUser; // Returns the newly created user to the controller
};

module.exports = { findUserByEmail, createUser };