const pool = require("../config/db");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[Studio Login] Attempt for: ${email}`);

    const validEmail = process.env.ADMIN_EMAIL || "admin@vinzhub.cloud";
    const validPassword = process.env.ADMIN_PASSWORD || "vinzhub123";

    if (email === validEmail && password === validPassword) {
      console.log(`[Studio Login] Success for: ${email}`);
      const token = jwt.sign(
        { role: "admin" },
        process.env.JWT_SECRET || "vinzhub_super_secret_key_123",
        { expiresIn: "7d" },
      );

      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Must be true if sameSite='none'
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' allows cross-site (api.domain -> domain)
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
  res.clearCookie("admin_token");
  res.json({ success: true, message: "Logged out" });
};

exports.getVideos = async (req, res) => {
  try {
    const { folder_id } = req.query;

    let query;
    let params;

    if (folder_id === "null" || folder_id === "" || folder_id === undefined) {
      // Get videos in root (no folder)
      query = `
                SELECT
                    v.id,
                    v.original_name,
                    v.status,
                    v.created_at,
                    v.thumbnail,
                    v.thumbnail_grid,
                    v.duration,
                    v.folder_id,
                    f.name as folder_name
                FROM videos v
                LEFT JOIN folders f ON v.folder_id = f.id
                WHERE v.folder_id IS NULL
                ORDER BY v.created_at DESC
            `;
      params = [];
    } else {
      // Get videos in specific folder
      query = `
                SELECT
                    v.id,
                    v.original_name,
                    v.status,
                    v.created_at,
                    v.thumbnail,
                    v.thumbnail_grid,
                    v.duration,
                    v.folder_id,
                    f.name as folder_name
                FROM videos v
                LEFT JOIN folders f ON v.folder_id = f.id
                WHERE v.folder_id = $1
                ORDER BY v.created_at DESC
            `;
      params = [folder_id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Studio List Error:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                v.id,
                v.original_name,
                v.status,
                v.created_at,
                v.thumbnail,
                v.thumbnail_grid,
                v.duration,
                v.folder_id,
                f.name as folder_name
            FROM videos v
            LEFT JOIN folders f ON v.folder_id = f.id
            ORDER BY v.created_at DESC
        `);
    res.json(result.rows);
  } catch (error) {
    console.error("Studio List All Error:", error);
    res.status(500).json({ error: "Failed to fetch all videos" });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
            SELECT
                v.id,
                v.original_name,
                v.filename,
                v.status,
                v.created_at,
                v.updated_at,
                v.thumbnail,
                v.thumbnail_grid,
                v.duration,
                v.folder_id,
                f.name as folder_name
            FROM videos v
            LEFT JOIN folders f ON v.folder_id = f.id
            WHERE v.id = $1
        `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get Video Error:", error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { original_name, folder_id } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (original_name !== undefined) {
      updates.push(`original_name = $${paramCount}`);
      values.push(original_name);
      paramCount++;
    }

    if (folder_id !== undefined) {
      // Verify folder exists if not null
      if (folder_id !== null) {
        const folderCheck = await pool.query(
          "SELECT id FROM folders WHERE id = $1",
          [folder_id],
        );
        if (folderCheck.rows.length === 0) {
          return res.status(404).json({ error: "Folder not found" });
        }
      }
      updates.push(`folder_id = $${paramCount}`);
      values.push(folder_id);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push("updated_at = NOW()");
    values.push(id);

    const query = `
            UPDATE videos
            SET ${updates.join(", ")}
            WHERE id = $${paramCount}
            RETURNING *
        `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update Video Error:", error);
    res.status(500).json({ error: "Failed to update video" });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // Get video info first
    const videoResult = await pool.query(
      "SELECT id, filename FROM videos WHERE id = $1",
      [id],
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    // TODO: Add S3 deletion for:
    // - Raw video file
    // - HLS files
    // - Thumbnails

    // Delete from database
    await pool.query("DELETE FROM videos WHERE id = $1", [id]);

    res.json({
      message: "Video deleted from database",
      video_id: id,
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete video" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const statsQuery = await pool.query(`
            SELECT
                COUNT(*) as total_videos,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_videos,
                COUNT(*) FILTER (WHERE status = 'processing') as processing_videos,
                COUNT(*) FILTER (WHERE status = 'pending') as pending_videos,
                COUNT(*) FILTER (WHERE status = 'failed') as failed_videos,
                COALESCE(SUM(duration), 0) as total_duration
            FROM videos
        `);

    const folderCountQuery = await pool.query(
      "SELECT COUNT(*) as total_folders FROM folders",
    );

    const stats = statsQuery.rows[0];
    stats.total_folders = parseInt(folderCountQuery.rows[0].total_folders);

    res.json(stats);
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

exports.searchVideos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const result = await pool.query(
      `
            SELECT
                v.id,
                v.original_name,
                v.status,
                v.created_at,
                v.thumbnail,
                v.thumbnail_grid,
                v.duration,
                v.folder_id,
                f.name as folder_name
            FROM videos v
            LEFT JOIN folders f ON v.folder_id = f.id
            WHERE v.original_name ILIKE $1 OR v.id::text ILIKE $1
            ORDER BY v.created_at DESC
            LIMIT 50
        `,
      [`%${q.trim()}%`],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Failed to search videos" });
  }
};
