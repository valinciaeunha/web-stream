
require('dotenv').config();
const s3 = require('../config/s3');

const bucket = process.env.S3_BUCKET_PUBLIC;

const policy = {
    Version: "2012-10-17",
    Statement: [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": `arn:aws:s3:::${bucket}/*`
        }
    ]
};

async function setPolicy() {
    try {
        console.log(`Setting public policy for bucket: ${bucket}...`);

        await s3.putBucketPolicy({
            Bucket: bucket,
            Policy: JSON.stringify(policy)
        }).promise();

        console.log("Success! Bucket policy updated.");

        // Verify by getting policy
        /*
        const data = await s3.getBucketPolicy({ Bucket: bucket }).promise();
        console.log("Current Policy:", data.Policy);
        */

    } catch (e) {
        console.error("Error:", e.message);
        if (e.code === 'NotImplemented') {
            console.error("\nCRITICAL: API returned 'NotImplemented'. You must set the bucket to PUBLIC via your Cloud Provider's Console.");
        }
    }
}

setPolicy();
