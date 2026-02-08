
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
