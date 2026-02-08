
require('dotenv').config();
const { createClient } = require('redis');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const s3 = require('../config/s3'); // Use shared config
const pool = require('../config/db');

// Set FFmpeg Path
ffmpeg.setFfmpegPath(ffmpegPath);

// Setup Clients
const redisClient = createClient({ url: process.env.REDIS_URL });

(async () => {
    await redisClient.connect();
    console.log("Transcoder Worker Started. Waiting for jobs...");

    while (true) {
        try {
            // Blocking Pop (Wait for job)
            const result = await redisClient.brPop('transcode_queue', 0);
            const job = JSON.parse(result.element);

            console.log(`Processing Job: ${job.videoId}`);
            await processVideo(job);

        } catch (error) {
            console.error("Worker Error:", error);
        }
    }
})();

async function processVideo(job) {
    const { videoId, key } = job;
    const workDir = path.join(__dirname, 'temp', videoId);
    if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

    const localInputPath = path.join(workDir, 'input.mp4');
    const hlsOutputPath = path.join(workDir, 'master.m3u8');

    try {
        // 1. Download
        console.log("Downloading...");
        const s3Params = { Bucket: process.env.S3_BUCKET_RAW, Key: key };
        const fileData = await s3.getObject(s3Params).promise();
        fs.writeFileSync(localInputPath, fileData.Body);

        // 2. Transcode
        console.log("Transcoding...");
        await new Promise((resolve, reject) => {
            ffmpeg(localInputPath)
                .outputOptions([
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-c:v libx264',
                    '-c:a aac',
                    '-pix_fmt yuv420p', // Compatibility for some players
                    '-f hls'
                ])
                .output(hlsOutputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        // 3. Upload Output
        console.log("Uploading HLS...");
        const files = fs.readdirSync(workDir).filter(f => f.endsWith('.ts') || f.endsWith('.m3u8'));

        for (const file of files) {
            const fileStream = fs.createReadStream(path.join(workDir, file));
            await s3.upload({
                Bucket: process.env.S3_BUCKET_PUBLIC,
                Key: `hls/${videoId}/${file}`,
                Body: fileStream,
                ContentType: file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T',
                ACL: 'public-read'
            }).promise();
        }

        console.log(`Job ${videoId} Completed.`);
        // Update DB Status to completed
        await pool.query(
            'UPDATE videos SET status = $1, updated_at = NOW() WHERE id = $2',
            ['completed', videoId]
        );

    } catch (err) {
        console.error(`Job ${videoId} Failed:`, err);
        // Update DB Status to failed
        await pool.query(
            'UPDATE videos SET status = $1, updated_at = NOW() WHERE id = $2',
            ['failed', videoId]
        );
    } finally {
        // Cleanup
        fs.rmSync(workDir, { recursive: true, force: true });
    }
}
