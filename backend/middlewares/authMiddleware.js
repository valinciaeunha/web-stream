const jwt = require('jsonwebtoken');

exports.verifySession = async (req, res, next) => {
    try {
        const sessionToken = req.cookies.session_id || req.headers['x-session-id'];

        if (!sessionToken) {
            return res.status(401).json({ error: "No Session" });
        }

        // TODO: Check Redis for session existence

        req.session = { id: sessionToken };
        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

exports.verifyAdmin = (req, res, next) => {
    const token = req.cookies?.admin_token;

    if (!token) {
        return res.status(401).json({ error: "No admin session. Please login." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vinzhub_super_secret_key_123');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: "Access forbidden" });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        console.error("JWT Verify Error:", err.message);
        return res.status(401).json({ error: "Invalid or expired session" });
    }
};
