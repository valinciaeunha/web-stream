
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // TODO: Implement Dynamic CORS here based on DB
        // For now, allow all in development
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database Connection (Example)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const redisClient = require('./config/redis');

const videoRoutes = require('./routes/videoRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const adRoutes = require('./routes/adRoutes');

// Routes
app.use('/api/video', videoRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/ads', adRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, pool, redisClient };
