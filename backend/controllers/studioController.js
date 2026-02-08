const pool = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[Studio Login] Attempt for: ${email}`);

        const validEmail = process.env.ADMIN_EMAIL || 'admin@vinzhub.cloud';
        const validPassword = process.env.ADMIN_PASSWORD || 'vinzhub123';

        if (email === validEmail && password === validPassword) {
            console.log(`[Studio Login] Success for: ${email}`);
            const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

            // Set as HttpOnly cookie for security
            res.cookie('admin_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            return res.json({ success: true, message: "Logged in successfully" });
        }

        res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true, message: "Logged out" });
};

exports.getVideos = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, original_name, status, created_at FROM videos ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Studio List Error:", error);
        res.status(500).json({ error: "Failed to fetch videos" });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        // Logic to delete from S3 would go here as well
        await pool.query('DELETE FROM videos WHERE id = $1', [id]);
        res.json({ message: "Video deleted from database" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Failed to delete video" });
    }
};
