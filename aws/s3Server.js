const S3 = require("aws-sdk/clients/s3");
require("dotenv").config();
const fs = require("fs");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION; 
const accessKey = process.env.AWS_ACCESS_KEY_S3_USER;
const secretKey = process.env.AWS_SECRET_KEY_S3_USER;

const s3 = new S3({

    region,
    accessKey,
    secretKey

});

exports.uploadImageToS3Bucket = (file) => {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    };

    return s3.upload(uploadParams).promise();

};