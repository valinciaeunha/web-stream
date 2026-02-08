
require('dotenv').config();
const s3 = require('../config/s3');

const videoId = 'f8979c68-9165-4f91-b7b2-5c02ad7e0b16';
const bucket = process.env.S3_BUCKET_PUBLIC;
const prefix = `hls/${videoId}/`;

async function fixAcl() {
    try {
        console.log(`Listing files in ${bucket}/${prefix}...`);

        const data = await s3.listObjectsV2({
            Bucket: bucket,
            Prefix: prefix
        }).promise();

        if (!data.Contents || data.Contents.length === 0) {
            console.log("No files found.");
            return;
        }

        console.log(`Found ${data.Contents.length} files. Updating ACLs...`);

        for (const file of data.Contents) {
            console.log(`Setting public-read for: ${file.Key}`);
            await s3.putObjectAcl({
                Bucket: bucket,
                Key: file.Key,
                ACL: 'public-read'
            }).promise();
        }

        console.log("Done! All files should now be public.");

    } catch (e) {
        console.error("Error:", e.message);
    }
}

fixAcl();
