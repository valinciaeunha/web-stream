const redisClient = require("../config/redis");
const pool = require("../config/db");

// Helper: Resolve short ID (8 chars) to full UUID
const resolveVideoId = async (shortId) => {
  // If already full UUID format, return as-is
  if (shortId && shortId.length === 36 && shortId.includes("-")) {
    return shortId;
  }

  // Remove .mp4 extension if present (for embed URLs)
  const cleanId = shortId.replace(/\.mp4$/i, "");

  // Search by short ID prefix (first 8 characters of UUID)
  const result = await pool.query(
    "SELECT id FROM videos WHERE id::text LIKE $1 LIMIT 1",
    [`${cleanId}%`],
  );

  if (result.rows.length > 0) {
    return result.rows[0].id;
  }

  return null;
};

// Get public video info (thumbnail, name, duration) - no auth required
exports.getVideoInfo = async (req, res) => {
  try {
    const { id: rawId } = req.params;

    // Resolve short ID to full UUID
    const id = await resolveVideoId(rawId);
    if (!id) {
      return res.status(404).json({ error: "Video not found" });
    }

    const result = await pool.query(
      `SELECT
        id,
        original_name,
        status,
        thumbnail,
        thumbnail_grid,
        duration,
        created_at
      FROM videos
      WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    const video = result.rows[0];

    // Only return info if video is completed or processing
    if (video.status === "failed") {
      return res.status(404).json({ error: "Video not available" });
    }

    res.json({
      id: video.id,
      original_name: video.original_name,
      status: video.status,
      thumbnail: video.thumbnail,
      thumbnail_grid: video.thumbnail_grid,
      duration: video.duration,
      created_at: video.created_at,
    });
  } catch (error) {
    console.error("Get Video Info Error:", error);
    res.status(500).json({ error: "Failed to fetch video info" });
  }
};

exports.getManifest = async (req, res) => {
  try {
    const { id: rawId } = req.params;
    const { session_id } = req.query; // Pass session via Query, NOT Cookie (for anonymous simplicity)

    // Resolve short ID to full UUID
    const id = await resolveVideoId(rawId);
    if (!id) {
      return res.status(404).json({ error: "Video not found" });
    }

    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const redisKey = `session:${session_id}`;
    const sessionRaw = await redisClient.get(redisKey);

    if (!sessionRaw) {
      return res.status(403).json({ error: "Invalid Session" });
    }

    const session = JSON.parse(sessionRaw);

    // THE GATE: Check if Ad is Completed
    if (session.ad_status !== "completed") {
      console.log(
        `[Gate] Blocked access for session ${session_id}. Status: ${session.ad_status}`,
      );
      return res.status(403).json({
        error: "Access Denied. Watch Ad first.",
        ad_status: session.ad_status,
      });
    }

    // If 'completed', generate "Signed" URL
    // Real Implementation: Point to CDN/S3
    // Note: For MinIO/S3-Compatible, we might need Presigned URL or just Public URL if bucket is public
    // Assuming Bucket is Public for now as per 'strmp' name (stream public)

    const cdnBase = process.env.CDN_DOMAIN;
    const bucketPublic = process.env.S3_BUCKET_PUBLIC;
    // Construct URL: https://assets.vinzhub.cloud/strmp/hls/{id}/master.m3u8
    // If CDN_DOMAIN already includes bucket, adjust accordingly.
    // Based on user input: https://assets.vinzhub.cloud/ is endpoint.
    // So full url: https://assets.vinzhub.cloud/strmp/hls/{id}/master.m3u8

    const realManifestUrl = `${cdnBase}/${bucketPublic}/hls/${id}/master.m3u8`;

    console.log(`[Gate] Allowed access for session ${session_id}`);

    res.json({
      video_id: id,
      manifest_url: realManifestUrl,
      message: "Access Granted",
    });
  } catch (error) {
    console.error("Manifest Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");

exports.uploadVideo = async (req, res) => {
  try {
    const { filename, filetype, folder_id } = req.body; // Expecting { filename: "video.mp4", filetype: "video/mp4", folder_id?: "uuid" }
    const videoId = uuidv4();
    const key = `raw/${videoId}/${filename}`;

    // Verify folder exists if provided
    if (folder_id) {
      const folderCheck = await pool.query(
        "SELECT id FROM folders WHERE id = $1",
        [folder_id],
      );
      if (folderCheck.rows.length === 0) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }

    const params = {
      Bucket: process.env.S3_BUCKET_RAW,
      Key: key,
      Expires: 300, // 5 minutes
      ContentType: filetype,
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    // Save video metadata to DB with folder_id
    await pool.query(
      "INSERT INTO videos (id, original_name, filename, status, folder_id) VALUES ($1, $2, $3, $4, $5)",
      [videoId, filename, key, "pending", folder_id || null],
    );

    res.json({
      upload_url: uploadUrl,
      video_id: videoId,
      key: key,
      folder_id: folder_id || null,
    });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    res.status(500).json({ error: "Upload Configuration Failed" });
  }
};

exports.completeUpload = async (req, res) => {
  try {
    const { videoId, key } = req.body;

    console.log(
      `[Upload Complete] Received request for videoId: ${videoId}, key: ${key}`,
    );

    // Validate input
    if (!videoId || !key) {
      console.error("[Upload Complete] Missing videoId or key");
      return res.status(400).json({ error: "Missing videoId or key" });
    }

    // Check if video exists in DB
    const videoCheck = await pool.query(
      "SELECT id, status FROM videos WHERE id = $1",
      [videoId],
    );

    if (videoCheck.rows.length === 0) {
      console.error(`[Upload Complete] Video not found: ${videoId}`);
      return res.status(404).json({ error: "Video not found" });
    }

    console.log(
      `[Upload Complete] Video found with status: ${videoCheck.rows[0].status}`,
    );

    // Update DB status to 'processing'
    await pool.query(
      "UPDATE videos SET status = $1, updated_at = NOW() WHERE id = $2",
      ["processing", videoId],
    );
    console.log(`[Upload Complete] Updated video status to 'processing'`);

    // Check Redis connection
    if (!redisClient.isOpen) {
      console.error("[Upload Complete] Redis client is not connected");
      return res.status(500).json({ error: "Queue service unavailable" });
    }

    // Push to Redis Queue
    const jobData = JSON.stringify({ videoId, key });
    const queueLength = await redisClient.lPush("transcode_queue", jobData);
    console.log(
      `[Upload Complete] Job pushed to queue. Queue length: ${queueLength}`,
    );

    res.json({
      status: "processing",
      message: "Transcoding queued",
      videoId: videoId,
      queuePosition: queueLength,
    });
  } catch (error) {
    console.error("[Upload Complete] Error:", error.message);
    console.error("[Upload Complete] Stack:", error.stack);
    res
      .status(500)
      .json({ error: "Transcoding Queue Failed", details: error.message });
  }
};
