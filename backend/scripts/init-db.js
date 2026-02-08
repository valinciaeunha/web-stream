require('dotenv').config();
const pool = require('../config/db');

async function initDB() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY,
        original_name TEXT NOT NULL,
        filename TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;

    try {
        await pool.query(createTableQuery);
        console.log("Database initialized: 'videos' table exists.");
        process.exit(0);
    } catch (err) {
        console.error("Error initializing DB:", err);
        process.exit(1);
    }
}

initDB();
