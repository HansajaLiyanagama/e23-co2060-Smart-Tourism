const db = require('../config/db');

/**
 * PLACES REPOSITORY
 * All database queries related to places (travel destinations).
 * Uses parameterized queries to prevent SQL injection.
 */

/**
 * Get all places from database
 * @returns {Promise<Array>} Array of place objects
 */
async function getAllPlaces() {
    try {
        const query = `
            SELECT 
                id, 
                name, 
                description, 
                latitude, 
                longitude, 
                category, 
                image_url,
                created_at
            FROM places
            ORDER BY name ASC
        `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching places:', error);
        throw error;
    }
}

/**
 * Get single place by ID
 * @param {number} placeId - The place ID
 * @returns {Promise<Object>} Place object
 */
async function getPlaceById(placeId) {
    try {
        const query = `
            SELECT 
                id, 
                name, 
                description, 
                latitude, 
                longitude, 
                category, 
                image_url,
                created_at
            FROM places
            WHERE id = $1
        `;
        const result = await db.query(query, [placeId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching place:', error);
        throw error;
    }
}

/**
 * Search places by name or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching places
 */
async function searchPlaces(searchTerm) {
    try {
        const query = `
            SELECT 
                id, 
                name, 
                description, 
                latitude, 
                longitude, 
                category, 
                image_url,
                created_at
            FROM places
            WHERE name ILIKE $1 OR description ILIKE $1
            ORDER BY name ASC
        `;
        const result = await db.query(query, [`%${searchTerm}%`]);
        return result.rows;
    } catch (error) {
        console.error('Error searching places:', error);
        throw error;
    }
}

/**
 * Get places by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of places in category
 */
async function getPlacesByCategory(category) {
    try {
        const query = `
            SELECT 
                id, 
                name, 
                description, 
                latitude, 
                longitude, 
                category, 
                image_url,
                created_at
            FROM places
            WHERE category = $1
            ORDER BY name ASC
        `;
        const result = await db.query(query, [category]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching places by category:', error);
        throw error;
    }
}

module.exports = {
    getAllPlaces,
    getPlaceById,
    searchPlaces,
    getPlacesByCategory
};
