const redisClient = require('../config/redis');
const pool = require('../config/db');

exports.getManifest = async (req, res) => {
    try {
        const { id } = req.params;
        const { session_id } = req.query; // Pass session via Query, NOT Cookie (for anonymous simplicity)

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
        if (session.ad_status !== 'completed') {
            console.log(`[Gate] Blocked access for session ${session_id}. Status: ${session.ad_status}`);
            return res.status(403).json({
                error: "Access Denied. Watch Ad first.",
                ad_status: session.ad_status
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
            message: "Access Granted"
        });
    } catch (error) {
        console.error("Manifest Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

const s3 = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

exports.uploadVideo = async (req, res) => {
    try {
        const { filename, filetype } = req.body; // Expecting { filename: "video.mp4", filetype: "video/mp4" }
        const videoId = uuidv4();
        const key = `raw/${videoId}/${filename}`;

        const params = {
            Bucket: process.env.S3_BUCKET_RAW,
            Key: key,
            Expires: 300, // 5 minutes
            ContentType: filetype
        };

        const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

        // Save video metadata to DB
        await pool.query(
            'INSERT INTO videos (id, original_name, filename, status) VALUES ($1, $2, $3, $4)',
            [videoId, filename, key, 'pending']
        );

        res.json({
            upload_url: uploadUrl,
            video_id: videoId,
            key: key
        });
    } catch (error) {
        console.error("Presigned URL Error:", error);
        res.status(500).json({ error: "Upload Configuration Failed" });
    }
};



exports.completeUpload = async (req, res) => {
    try {
        const { videoId, key } = req.body;

        // Update DB status to 'processing'
        await pool.query(
            'UPDATE videos SET status = $1, updated_at = NOW() WHERE id = $2',
            ['processing', videoId]
        );

        // Push to Redis Queue
        const jobData = JSON.stringify({ videoId, key });
        await redisClient.lPush('transcode_queue', jobData);

        res.json({ status: "processing", message: "Transcoding queued" });
    } catch (error) {
        console.error("Queue Error:", error);
        res.status(500).json({ error: "Transcoding Queue Failed" });
    }
};
