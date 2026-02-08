
require('dotenv').config();
const s3 = require('../config/s3');

const bucket = process.env.S3_BUCKET_PUBLIC;

const params = {
    Bucket: bucket,
    CORSConfiguration: {
        CORSRules: [
            {
                AllowedHeaders: [
                    "*"
                ],
                AllowedMethods: [
                    "GET",
                    "HEAD"
                ],
                AllowedOrigins: [
                    "*" // For production, you might want to restrict this to https://*.vinzhub.cloud
                ],
                ExposeHeaders: [],
                MaxAgeSeconds: 3000
            }
        ]
    }
};

async function setCors() {
    try {
        console.log(`Setting CORS for bucket: ${bucket}...`);
        await s3.putBucketCors(params).promise();
        console.log("Success! CORS policy updated.");
    } catch (e) {
        console.error("Error setting CORS:", e.message);
        if (e.code === 'NotImplemented') {
            console.log("\nTIP: If using Cloudflare R2, you must set CORS via the R2 Dashboard (Bucket -> Settings -> CORS).");
        }
    }
}

setCors();
