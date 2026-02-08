
const AWS = require('aws-sdk');

const s3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    endpoint: process.env.S3_ENDPOINT,
    s3ForcePathStyle: true, // Needed for MinIO/Custom S3
    signatureVersion: 'v4'
};
console.log("S3 Config Endpoint:", process.env.S3_ENDPOINT);

const s3 = new AWS.S3(s3Config);

module.exports = s3;
