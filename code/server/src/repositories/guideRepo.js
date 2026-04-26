const db = require('../config/db');

// Update guide profile details
const updateGuideProfile = async (userId, bio, licenseNumber, hourlyRate) => {
    const query = `
        UPDATE guide_profiles 
        SET bio = $1, license_number = $2, hourly_rate = $3, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4
        RETURNING *;
    `;
    const values = [bio, licenseNumber, hourlyRate, userId];
    const result = await db.query(query, values);
    return result.rows[0];
};

// NEW: Fetch all guides and their profile details for tourists to see
const getAllGuides = async () => {
    const query = `
        SELECT u.id AS user_id, u.email, gp.full_name, gp.bio, gp.license_number, gp.hourly_rate
        FROM users u
        JOIN guide_profiles gp ON u.id = gp.user_id
        WHERE u.role = 'guide';
    `;
    const result = await db.query(query);
    return result.rows;
};

module.exports = { 
    updateGuideProfile, 
    getAllGuides 
};