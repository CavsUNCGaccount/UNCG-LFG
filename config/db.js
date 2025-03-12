const path = require('path');  // Add this
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });  // Ensure .env loads from root

const { Pool } = require('pg');

// Check if environment variables are loaded
console.log("🔍 DB Config:", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
});

// Create a new pool instance
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Test connection
pool.connect()
    .then(client => {
        console.log('✅ Connected to PostgreSQL');
        client.release();
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.stack);
    });

module.exports = pool;
