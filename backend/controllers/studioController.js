const pool = require('../config/db');

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
