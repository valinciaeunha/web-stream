
require('dotenv').config();
const s3 = require('../config/s3');

const KEEP_BUCKETS = [process.env.S3_BUCKET_RAW, process.env.S3_BUCKET_PUBLIC]; // strmr, strmp

(async () => {
    try {
        console.log(`Keeping Buckets: ${KEEP_BUCKETS.join(', ')}`);

        // 1. List All Buckets
        const data = await s3.listBuckets().promise();
        const allBuckets = data.Buckets.map(b => b.Name);

        console.log(`Found Buckets: ${allBuckets.join(', ')}`);

        const bucketsToDelete = allBuckets.filter(b => !KEEP_BUCKETS.includes(b));

        if (bucketsToDelete.length === 0) {
            console.log("No buckets to delete.");
            return;
        }

        console.log(`Deleting: ${bucketsToDelete.join(', ')}`);

        for (const bucket of bucketsToDelete) {
            console.log(`\nProcessing '${bucket}'...`);

            // 2. Empty Bucket (Delete all objects)
            let continuationToken = null;
            do {
                const objects = await s3.listObjectsV2({
                    Bucket: bucket,
                    ContinuationToken: continuationToken
                }).promise();

                if (objects.Contents.length > 0) {
                    const deleteParams = {
                        Bucket: bucket,
                        Delete: { Objects: objects.Contents.map(o => ({ Key: o.Key })) }
                    };
                    await s3.deleteObjects(deleteParams).promise();
                    console.log(` - Deleted ${objects.Contents.length} objects`);
                }

                continuationToken = objects.NextContinuationToken;
            } while (continuationToken);

            // 3. Delete Bucket
            await s3.deleteBucket({ Bucket: bucket }).promise();
            console.log(`✔ Deleted Bucket: ${bucket}`);
        }

        console.log("\nCleanup Complete.");

    } catch (error) {
        console.error("Cleanup Error:", error);
    }
})();
