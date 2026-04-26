const db = require('../config/db');

// Create a new itinerary in the database
const createItinerary = async (userId, title, startDate, endDate) => {
    const query = `
        INSERT INTO itineraries (tourist_id, title, start_date, end_date)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    // We still pass 'userId' from the token as the first value ($1)
    const values = [userId, title, startDate, endDate]; 
    const result = await db.query(query, values);
    
    return result.rows[0]; // Returns the newly created trip
};

module.exports = { createItinerary };