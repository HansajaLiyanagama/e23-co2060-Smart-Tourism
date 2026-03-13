const db = require('../config/db');

/**
 * BOOKING REPOSITORY
 * Handles database operations for the booking/notification system
 */

async function createBooking(itineraryId, guideId, touristId, notes) {
    try {
        const result = await db.query(
            `INSERT INTO bookings (itinerary_id, guide_id, tourist_id, notes, status)
             VALUES ($1, $2, $3, $4, 'pending')
             RETURNING *`,
            [itineraryId, guideId, touristId, notes]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

async function getGuideBookings(guideId) {
    try {
        const result = await db.query(
            `SELECT b.*, i.title as itinerary_title, i.start_date, i.end_date, u.email as tourist_email, tp.full_name as tourist_name, tp.contact_number as tourist_contact
             FROM bookings b
             JOIN itineraries i ON b.itinerary_id = i.id
             JOIN users u ON b.tourist_id = u.id
             JOIN tourist_profiles tp ON b.tourist_id = tp.user_id
             WHERE b.guide_id = $1
             ORDER BY b.created_at DESC`,
            [guideId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching guide bookings:', error);
        throw error;
    }
}

async function getTouristBookings(touristId) {
    try {
        const result = await db.query(
            `SELECT b.*, i.title as itinerary_title, gp.full_name as guide_name, gp.contact_number as guide_contact, u.email as guide_email
             FROM bookings b
             JOIN itineraries i ON b.itinerary_id = i.id
             JOIN users u ON b.guide_id = u.id
             JOIN guide_profiles gp ON b.guide_id = gp.user_id
             WHERE b.tourist_id = $1
             ORDER BY b.created_at DESC`,
            [touristId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching tourist bookings:', error);
        throw error;
    }
}

async function updateBookingStatus(bookingId, status, price = null) {
    try {
        let query = `UPDATE bookings SET status = $1`;
        let params = [status, bookingId];

        if (price !== null) {
            query += `, quoted_price = $3`;
            params.push(price);
        }

        query += ` WHERE id = $2 RETURNING *`;
        
        const result = await db.query(query, params);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error;
    }
}

async function getPendingGuideNotificationsCount(guideId) {
    try {
        const result = await db.query(
            `SELECT COUNT(*) FROM bookings WHERE guide_id = $1 AND (status = 'pending' OR status = 'accepted')`,
            [guideId]
        );
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error('Error counting guide notifications:', error);
        throw error;
    }
}

module.exports = {
    createBooking,
    getGuideBookings,
    getTouristBookings,
    updateBookingStatus,
    getPendingGuideNotificationsCount
};
