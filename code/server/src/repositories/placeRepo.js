const db = require('../config/db');

const getAllPlaces = async () => {
    // SELECT * automatically grabs our new category and district columns!
    const query = 'SELECT * FROM places ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
};

const createPlace = async (name, description, latitude, longitude, imageUrl, category, district) => {
    const query = `
        INSERT INTO places (name, description, latitude, longitude, image_url, category, district)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [name, description, latitude, longitude, imageUrl, category, district];
    const result = await db.query(query, values);
    return result.rows[0];
};

module.exports = { getAllPlaces, createPlace };