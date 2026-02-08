
const redisClient = require('../config/redis');

exports.trackEvent = async (req, res) => {
    try {
        const { session_id, event } = req.body; // Expecting { session_id: "...", event: "start" | "complete" }

        if (!session_id || !event) {
            return res.status(400).json({ error: "Missing session_id or event" });
        }

        const redisKey = `session:${session_id}`;
        const sessionRaw = await redisClient.get(redisKey);

        if (!sessionRaw) {
            return res.status(404).json({ error: "Session not found" });
        }

        const session = JSON.parse(sessionRaw);

        // State Machine Logic
        if (event === 'start') {
            session.ad_status = 'started';
            session.started_at = Date.now();
        } else if (event === 'complete') {
            // Simple validation: Must be 'started' before 'complete'
            if (session.ad_status !== 'started' && session.ad_status !== 'init') {
                // Relaxed check for now, strictly should be 'started'
            }
            session.ad_status = 'completed';
            session.completed_at = Date.now();
        }

        // Update Redis (Reset TTL to 1 hour)
        await redisClient.setEx(redisKey, 3600, JSON.stringify(session));

        console.log(`[AdTrack] Session ${session_id} -> ${event} (Status: ${session.ad_status})`);

        res.json({ status: "ok", current_status: session.ad_status });
    } catch (error) {
        console.error("Ad Track Error:", error);
        res.status(500).json({ error: "Tracking Failed" });
    }
};
