
require('dotenv').config();
const s3 = require('../config/s3');

(async () => {
    try {
        console.log("Testing S3 Connection...");
        console.log(`Endpoint: ${process.env.S3_ENDPOINT}`);
        console.log(`Raw Bucket: ${process.env.S3_BUCKET_RAW}`);

        // List Buckets
        const data = await s3.listBuckets().promise();
        console.log("Buckets found:", data.Buckets.map(b => b.Name));

        // Check Access to Raw Bucket
        console.log(`Checking access to '${process.env.S3_BUCKET_RAW}'...`);
        await s3.headBucket({ Bucket: process.env.S3_BUCKET_RAW }).promise();
        console.log("Access Configured Correctly!");

    } catch (error) {
        console.error("S3 Connection Error:", error.message);
        if (error.code === 'Forbidden') {
            console.error("Check Access Key / Secret Key.");
        }
    }
})();
