const db = require('../config/db');

const createItinerary = async (touristId, title, startDate, endDate, placeIds = []) => {
    try {
        // 1. Start the transaction directly on your main db connection
        await db.query('BEGIN'); 

        // 2. Insert the main itinerary
        const itineraryQuery = `
            INSERT INTO itineraries (tourist_id, title, start_date, end_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const itineraryResult = await db.query(itineraryQuery, [touristId, title, startDate, endDate]);
        const newItinerary = itineraryResult.rows[0];

        // 3. Insert the linked places into itinerary_items WITH visit_order
        if (placeIds && placeIds.length > 0) {
            const itemQuery = `
                INSERT INTO itinerary_items (itinerary_id, place_id, visit_order)
                VALUES ($1, $2, $3);
            `;
            
            // Loop through each place ID using a standard for-loop to get the index (i)
            for (let i = 0; i < placeIds.length; i++) {
                const placeId = placeIds[i];
                const visitOrder = i + 1; // Makes the order 1, 2, 3 instead of 0, 1, 2
                
                await db.query(itemQuery, [newItinerary.id, placeId, visitOrder]);
            }
        }

        // 4. Commit the transaction (Save everything!)
        await db.query('COMMIT'); 
        return newItinerary;

    } catch (error) {
        // If anything fails, rollback the transaction
        await db.query('ROLLBACK'); 
        throw error;
    }
};

module.exports = { createItinerary };