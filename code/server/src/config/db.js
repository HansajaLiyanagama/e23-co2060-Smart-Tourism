// server/src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

/**
 * A Pool maintains a set of open connections to PostgreSQL. 
 * This prevents the server from crashing under the overhead of opening 
 * and closing a new connection every time a tourist makes a request.
 */
const pool = new Pool({
    // 1. We replace the 5 individual variables with your single Neon connection string
    connectionString: process.env.DATABASE_URL,
    
    // 2. Cloud databases like Neon require SSL. This checks if you are using Neon
    // and applies the correct SSL settings so it doesn't block the connection.
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') 
        ? { rejectUnauthorized: false } 
        : false
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL Database successfully!');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    // Keeping your exact export structure so we don't break your existing API routes!
    query: (text, params) => pool.query(text, params),
    
    // Exporting the pool directly as well, just in case your transaction logic 
    // (like saving itineraries) needs to use pool.connect()
    pool: pool 
};