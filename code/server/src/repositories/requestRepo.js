const db = require('../config/db');

// Existing: Create a new booking request
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

// NEW: Fetch all requests for a specific guide (includes tourist and trip details)
const getRequestsByGuideId = async (guideId) => {
    const query = `
        SELECT gr.id AS request_id, gr.status, gr.created_at,
               i.title AS trip_title, i.start_date, i.end_date,
               tp.full_name AS tourist_name, tp.nationality,
               -- NEW: Fetch places for the guide's map preview
               (
                   SELECT json_agg(json_build_object(
                       'id', p.id,
                       'name', p.name,
                       'latitude', p.latitude,
                       'longitude', p.longitude
                   ))
                   FROM itinerary_items ii
                   JOIN places p ON ii.place_id = p.id
                   WHERE ii.itinerary_id = i.id
               ) AS places
        FROM guide_requests gr
        JOIN itineraries i ON gr.itinerary_id = i.id
        JOIN tourist_profiles tp ON gr.tourist_id = tp.user_id
        WHERE gr.guide_id = $1
        ORDER BY gr.created_at DESC;
    `;
    const result = await db.query(query, [guideId]);
    return result.rows;
};

// NEW: Update the status of a request (Accept or Decline)
const updateRequestStatus = async (requestId, guideId, status) => {
    const query = `
        UPDATE guide_requests
        SET status = $1
        WHERE id = $2 AND guide_id = $3
        RETURNING *;
    `;
    // We include guide_id in the WHERE clause for security, ensuring a guide can only update their own requests
    const result = await db.query(query, [status, requestId, guideId]);
    return result.rows[0];
};

// NEW: Fetch all requests made by a specific tourist
const getRequestsByTouristId = async (touristId) => {
    const query = `
        SELECT gr.id AS request_id, gr.status, gr.created_at,
               i.title AS trip_title, i.start_date, i.end_date,
               gp.full_name AS guide_name, gp.hourly_rate
        FROM guide_requests gr
        JOIN itineraries i ON gr.itinerary_id = i.id
        JOIN guide_profiles gp ON gr.guide_id = gp.user_id
        WHERE gr.tourist_id = $1
        ORDER BY gr.created_at DESC;
    `;
    const result = await db.query(query, [touristId]);
    return result.rows;
};


module.exports = { 
    createRequest, 
    getRequestsByGuideId, 
    updateRequestStatus, 
    getRequestsByTouristId 
};

