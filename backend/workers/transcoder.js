require("dotenv").config();
const { createClient } = require("redis");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const s3 = require("../config/s3");
const pool = require("../config/db");

// Set FFmpeg and FFprobe Paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Setup Clients
const redisClient = createClient({ url: process.env.REDIS_URL });

(async () => {
  await redisClient.connect();
  console.log("Transcoder Worker Started. Waiting for jobs...");

  while (true) {
    try {
      // Blocking Pop (Wait for job)
      const result = await redisClient.brPop("transcode_queue", 0);
      const job = JSON.parse(result.element);

      console.log(`Processing Job: ${job.videoId}`);
      await processVideo(job);
    } catch (error) {
      console.error("Worker Error:", error);
    }
  }
})();

// Get video duration using ffprobe
function getVideoDuration(inputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
  });
}

// Extract a single frame at a specific timestamp
function extractFrame(inputPath, outputPath, timestamp) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(timestamp)
      .outputOptions(["-vframes 1", "-q:v 2"])
      .output(outputPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

// Generate 4-frame grid thumbnail
async function generateThumbnailGrid(inputPath, outputPath, duration) {
  const workDir = path.dirname(outputPath);
  const frames = [];

  // Calculate timestamps for 4 frames (at 10%, 30%, 50%, 70% of video)
  const percentages = [0.1, 0.3, 0.5, 0.7];

  for (let i = 0; i < 4; i++) {
    const timestamp = Math.max(0, duration * percentages[i]);
    const framePath = path.join(workDir, `frame_${i}.jpg`);
    frames.push(framePath);

    console.log(`Extracting frame ${i + 1} at ${timestamp.toFixed(2)}s...`);
    await extractFrame(inputPath, framePath, timestamp);
  }

  // Combine 4 frames into 2x2 grid using ffmpeg filter
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(frames[0])
      .input(frames[1])
      .input(frames[2])
      .input(frames[3])
      .complexFilter(
        [
          // Scale each input to same size
          "[0:v]scale=320:180[tl]",
          "[1:v]scale=320:180[tr]",
          "[2:v]scale=320:180[bl]",
          "[3:v]scale=320:180[br]",
          // Stack horizontally (top row)
          "[tl][tr]hstack=inputs=2[top]",
          // Stack horizontally (bottom row)
          "[bl][br]hstack=inputs=2[bottom]",
          // Stack vertically (combine rows)
          "[top][bottom]vstack=inputs=2[out]",
        ],
        "out",
      )
      .outputOptions(["-q:v 2"])
      .output(outputPath)
      .on("end", () => {
        // Cleanup individual frames
        frames.forEach((f) => {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        });
        resolve();
      })
      .on("error", (err) => {
        // Cleanup individual frames
        frames.forEach((f) => {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        });
        reject(err);
      })
      .run();
  });
}

// Generate single thumbnail at middle of video
async function generateSingleThumbnail(inputPath, outputPath, duration) {
  const timestamp = duration * 0.5; // Middle of video
  await extractFrame(inputPath, outputPath, timestamp);
}

async function processVideo(job) {
  const { videoId, key } = job;
  const workDir = path.join(__dirname, "temp", videoId);
  if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

  const localInputPath = path.join(workDir, "input.mp4");
  const hlsOutputPath = path.join(workDir, "master.m3u8");
  const thumbnailPath = path.join(workDir, "thumbnail.jpg");
  const thumbnailGridPath = path.join(workDir, "thumbnail_grid.jpg");

  let duration = 0;

  try {
    // 1. Download
    console.log("Downloading...");
    const s3Params = { Bucket: process.env.S3_BUCKET_RAW, Key: key };
    const fileData = await s3.getObject(s3Params).promise();
    fs.writeFileSync(localInputPath, fileData.Body);

    // 2. Get video duration
    console.log("Getting video duration...");
    duration = await getVideoDuration(localInputPath);
    console.log(`Video duration: ${duration.toFixed(2)}s`);

    // 3. Generate thumbnails
    console.log("Generating thumbnails...");

    // Generate single thumbnail
    await generateSingleThumbnail(localInputPath, thumbnailPath, duration);
    console.log("Single thumbnail generated");

    // Generate 4-frame grid thumbnail
    if (duration > 1) {
      await generateThumbnailGrid(localInputPath, thumbnailGridPath, duration);
      console.log("Grid thumbnail generated");
    }

    // 4. Transcode to HLS
    console.log("Transcoding...");
    await new Promise((resolve, reject) => {
      ffmpeg(localInputPath)
        .outputOptions([
          "-hls_time 10",
          "-hls_list_size 0",
          "-c:v libx264",
          "-c:a aac",
          "-pix_fmt yuv420p",
          "-f hls",
        ])
        .output(hlsOutputPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    // 5. Upload HLS files
    console.log("Uploading HLS...");
    const hlsFiles = fs
      .readdirSync(workDir)
      .filter((f) => f.endsWith(".ts") || f.endsWith(".m3u8"));

    for (const file of hlsFiles) {
      const fileStream = fs.createReadStream(path.join(workDir, file));
      await s3
        .upload({
          Bucket: process.env.S3_BUCKET_PUBLIC,
          Key: `hls/${videoId}/${file}`,
          Body: fileStream,
          ContentType: file.endsWith(".m3u8")
            ? "application/vnd.apple.mpegurl"
            : "video/MP2T",
          ACL: "public-read",
        })
        .promise();
    }

    // 6. Upload thumbnails
    console.log("Uploading thumbnails...");
    const cdnBase = process.env.CDN_DOMAIN;
    const bucketPublic = process.env.S3_BUCKET_PUBLIC;

    let thumbnailUrl = null;
    let thumbnailGridUrl = null;

    // Upload single thumbnail
    if (fs.existsSync(thumbnailPath)) {
      await s3
        .upload({
          Bucket: bucketPublic,
          Key: `thumbnails/${videoId}/thumbnail.jpg`,
          Body: fs.createReadStream(thumbnailPath),
          ContentType: "image/jpeg",
          ACL: "public-read",
        })
        .promise();
      thumbnailUrl = `${cdnBase}/${bucketPublic}/thumbnails/${videoId}/thumbnail.jpg`;
    }

    // Upload grid thumbnail
    if (fs.existsSync(thumbnailGridPath)) {
      await s3
        .upload({
          Bucket: bucketPublic,
          Key: `thumbnails/${videoId}/thumbnail_grid.jpg`,
          Body: fs.createReadStream(thumbnailGridPath),
          ContentType: "image/jpeg",
          ACL: "public-read",
        })
        .promise();
      thumbnailGridUrl = `${cdnBase}/${bucketPublic}/thumbnails/${videoId}/thumbnail_grid.jpg`;
    }

    console.log(`Job ${videoId} Completed.`);

    // 7. Update DB Status with thumbnails and duration
    await pool.query(
      `UPDATE videos
             SET status = $1,
                 thumbnail = $2,
                 thumbnail_grid = $3,
                 duration = $4,
                 updated_at = NOW()
             WHERE id = $5`,
      ["completed", thumbnailUrl, thumbnailGridUrl, duration, videoId],
    );
  } catch (err) {
    console.error(`Job ${videoId} Failed:`, err);
    // Update DB Status to failed
    await pool.query(
      "UPDATE videos SET status = $1, updated_at = NOW() WHERE id = $2",
      ["failed", videoId],
    );
  } finally {
    // Cleanup
    if (fs.existsSync(workDir)) {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }
}
