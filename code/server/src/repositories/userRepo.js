const db = require('../config/db');

// Check if an email is already in the database
const findUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await db.query(query, [email]);
    return result.rows[0];
};

// Insert a new user into the database
const createUser = async (email, passwordHash, role) => {
    const query = `
        INSERT INTO users (email, password_hash, role)
        VALUES ($1, $2, $3)
        RETURNING id, email, role, created_at;
    `;
    // If no role is provided, default to 'tourist'
    const values = [email, passwordHash, role || 'tourist'];
    const result = await db.query(query, values);
    return result.rows[0]; // Returns the newly created user (without the password!)
};

module.exports = { findUserByEmail, createUser };