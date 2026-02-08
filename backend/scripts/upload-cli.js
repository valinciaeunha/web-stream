
require('dotenv').config();
const fs = require('fs');
const path = require('path');
// No external dependencies for HTTP requests in Node 20+

const API_URL = process.env.API_URL || 'http://localhost:5000/api/video';

async function uploadVideo(inputPath) {
    // Handle potential URL-encoded paths if user pasted from browser
    let filePath = inputPath;
    try {
        filePath = decodeURIComponent(inputPath);
    } catch (e) {
        // ignore
    }

    if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        console.error("Tip: If your path has spaces, wrap it in quotes.");
        process.exit(1);
    }

    const filename = path.basename(filePath);
    const stats = fs.statSync(filePath);

    console.log(`[1/3] Requesting Upload URL for '${filename}'...`);

    try {
        // 1. Get Presigned URL
        const initRes = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, filetype: 'video/mp4' })
        });

        if (!initRes.ok) throw new Error(`Init failed: ${initRes.statusText}`);
        const { upload_url, video_id, key } = await initRes.json();

        console.log(`      Video ID: ${video_id}`);
        console.log(`[2/3] Uploading to Storage...`);

        // 2. Upload to S3 (PUT)
        const fileBuffer = fs.readFileSync(filePath);
        const uploadRes = await fetch(upload_url, {
            method: 'PUT',
            body: fileBuffer,
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Length': stats.size.toString()
            }
        });

        if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.statusText}`);

        console.log(`[3/3] Triggering Transcoding...`);

        // 3. Complete
        const completeRes = await fetch(`${API_URL}/upload/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: video_id, key })
        });

        if (!completeRes.ok) throw new Error(`Complete failed: ${completeRes.statusText}`);

        console.log(`\nSUCCESS! 🚀`);
        console.log(`Video ID: ${video_id}`);
        console.log(`Test URL: http://localhost:3000/f/${video_id}`); // Assuming port 3000 for frontend (or 3001 if 3000 busy)
        console.log(`\nMake sure 'npm run worker' is running to process this video!`);

    } catch (error) {
        console.error("Error:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
    }
}

const fileArg = process.argv[2];
if (!fileArg) {
    console.log("Usage: node scripts/upload-cli.js <path-to-mp4>");
} else {
    uploadVideo(fileArg);
}
