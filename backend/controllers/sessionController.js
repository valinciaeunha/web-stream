
const { v4: uuidv4 } = require('uuid');

const redisClient = require('../config/redis');

exports.initSession = async (req, res) => {
    try {
        const sessionId = uuidv4();
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Key: session:{uuid}
        // Value: JSON string with status
        const sessionData = {
            ip: ip,
            ad_status: 'init', // init, started, completed
            created_at: Date.now()
        };

        // Save to Redis with 1 hour TTL
        await redisClient.setEx(`session:${sessionId}`, 3600, JSON.stringify(sessionData));

        // Return Session ID (Frontend will store this)
        res.json({
            session_id: sessionId,
            vast_url: process.env.AD_SERVER_URL
        });
    } catch (error) {
        console.error("Session Init Error:", error);
        res.status(500).json({ error: "Session Init Failed" });
    }
};
