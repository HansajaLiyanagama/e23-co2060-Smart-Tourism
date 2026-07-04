// server/src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

/**
 * A Pool maintains a set of open connections to PostgreSQL. 
 * This prevents the server from crashing under the overhead of opening 
 * and closing a new connection every time a tourist makes a request.
 */
const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = process.env.DATABASE_URL
    ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_URL.includes('neon.tech') || isProduction
              ? { rejectUnauthorized: false }
              : false,
      }
    : {
          user: process.env.DB_USER,
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          password: process.env.DB_PASSWORD,
          port: process.env.DB_PORT,
      };

const pool = new Pool(poolConfig);
pool.on('connect', () => {
    console.log('Connected to PostgreSQL Database successfully!');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};