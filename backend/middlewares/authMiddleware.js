
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
    const adminEmail = req.headers['x-admin-email'];
    const adminPassword = req.headers['x-admin-password'];

    // Check Email & PW from ENV or use safe defaults
    const validEmail = process.env.ADMIN_EMAIL || 'admin@vinzhub.cloud';
    const validPassword = process.env.ADMIN_PASSWORD || 'vinzhub123';

    if (!adminEmail || !adminPassword || adminEmail !== validEmail || adminPassword !== validPassword) {
        return res.status(401).json({ error: "Admin access denied" });
    }
    next();
};
