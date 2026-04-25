const db = require('../config/db');

// Update the guide profile details
const updateGuideProfile = async (userId, bio, licenseNumber, hourlyRate) => {
    const query = `
        UPDATE guide_profiles
        SET bio = $1, license_number = $2, hourly_rate = $3
        WHERE user_id = $4
        RETURNING *;
    `;
    const values = [bio, licenseNumber, hourlyRate, userId];
    const result = await db.query(query, values);
    
    return result.rows[0]; // Returns the updated row
};

module.exports = { updateGuideProfile };