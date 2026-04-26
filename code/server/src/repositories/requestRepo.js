const db = require('../config/db');

// Create a new booking request
const createRequest = async (itineraryId, touristId, guideId) => {
    const query = `
        INSERT INTO guide_requests (itinerary_id, tourist_id, guide_id)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [itineraryId, touristId, guideId];
    const result = await db.query(query, values);
    return result.rows[0];
};

module.exports = { createRequest };