const db = require('../config/db');

const createItinerary = async (touristId, title, startDate, endDate, placeIds = []) => {
    // 1. Connect a client specifically for a transaction
    const client = await db.connect(); 
    
    try {
        // 2. Start the transaction
        await client.query('BEGIN'); 

        // 3. Insert the main itinerary
        const itineraryQuery = `
            INSERT INTO itineraries (tourist_id, title, start_date, end_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const itineraryResult = await client.query(itineraryQuery, [touristId, title, startDate, endDate]);
        const newItinerary = itineraryResult.rows[0];

        // 4. Insert the linked places into itinerary_items (if any were selected)
        if (placeIds && placeIds.length > 0) {
            const itemQuery = `
                INSERT INTO itinerary_items (itinerary_id, place_id)
                VALUES ($1, $2);
            `;
            // Loop through each place ID and save it
            for (let placeId of placeIds) {
                await client.query(itemQuery, [newItinerary.id, placeId]);
            }
        }

        // 5. Commit the transaction (Save everything!)
        await client.query('COMMIT'); 
        return newItinerary;

    } catch (error) {
        // If anything fails, rollback the transaction so we don't get partial data
        await client.query('ROLLBACK'); 
        throw error;
    } finally {
        // Release the client back to the pool
        client.release(); 
    }
};

// Make sure to export your functions!
module.exports = { createItinerary };