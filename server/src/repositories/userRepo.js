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

// Get user by ID
const getUserById = async (userId) => {
    const query = `SELECT id, email, role, is_verified, created_at FROM users WHERE id = $1`;
    const result = await db.query(query, [userId]);
    return result.rows[0];
};

// Get user profile (tourist or guide)
const getUserProfile = async (userId) => {
    try {
        const userRole = await db.query(
            'SELECT role FROM users WHERE id = $1',
            [userId]
        );

        if (!userRole.rows[0]) {
            return null;
        }

        const role = userRole.rows[0].role;

        if (role === 'guide') {
            const result = await db.query(
                'SELECT * FROM guide_profiles WHERE user_id = $1',
                [userId]
            );
            return result.rows[0];
        } else {
            const result = await db.query(
                'SELECT * FROM tourist_profiles WHERE user_id = $1',
                [userId]
            );
            return result.rows[0];
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

// Update or create tourist profile
const updateTouristProfile = async (userId, fullName, nationality, contactNumber) => {
    try {
        const result = await db.query(
            `INSERT INTO tourist_profiles (user_id, full_name, nationality, contact_number)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id) DO UPDATE SET full_name = $2, nationality = $3, contact_number = $4
             RETURNING *`,
            [userId, fullName, nationality, contactNumber]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error updating tourist profile:', error);
        throw error;
    }
};

// Update or create guide profile
const updateGuideProfile = async (userId, fullName, bio, licenseNumber, hourlyRate, contactNumber, profileImageUrl, specialization, experienceYears, languages, coveredLocations) => {
    try {
        const result = await db.query(
            `INSERT INTO guide_profiles (user_id, full_name, bio, license_number, hourly_rate, contact_number, profile_image_url, specialization, experience_years, languages, covered_locations)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (user_id) DO UPDATE SET 
                full_name = $2, 
                bio = $3, 
                license_number = $4, 
                hourly_rate = $5,
                contact_number = $6,
                profile_image_url = $7,
                specialization = $8,
                experience_years = $9,
                languages = $10,
                covered_locations = $11
             RETURNING *`,
            [userId, fullName, bio, licenseNumber, hourlyRate, contactNumber, profileImageUrl, specialization, experienceYears, languages, coveredLocations]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error updating guide profile:', error);
        throw error;
    }
};

// Get all guides
const getAllGuides = async () => {
    try {
        const query = `
            SELECT gp.*, u.email 
            FROM guide_profiles gp
            JOIN users u ON gp.user_id = u.id
            WHERE u.role = 'guide'
        `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching all guides:', error);
        throw error;
    }
};

// Find guides by covered locations
const findGuidesByLocations = async (locationNames) => {
    try {
        if (!locationNames || locationNames.length === 0) return [];
        
        const conditions = locationNames.map((_, i) => `gp.covered_locations ILIKE '%' || $${i + 1} || '%'`).join(' OR ');
        
        const query = `
            SELECT gp.*, u.email 
            FROM guide_profiles gp
            JOIN users u ON gp.user_id = u.id
            WHERE u.role = 'guide' AND (${conditions})
        `;
        
        const result = await db.query(query, locationNames);
        return result.rows;
    } catch (error) {
        console.error('Error finding guides by locations:', error);
        throw error;
    }
};

module.exports = { 
    findUserByEmail, 
    createUser,
    getUserById,
    getUserProfile,
    updateTouristProfile,
    updateGuideProfile,
    getAllGuides,
    findGuidesByLocations
};