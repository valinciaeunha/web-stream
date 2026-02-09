const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Add SSL config for production if needed
    // Disable SSL for internal Docker network connection
    ssl: false
});

module.exports = pool;
