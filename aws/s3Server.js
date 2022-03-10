const S3 = require("aws-sdk/clients/s3");
require("dotenv").config();
const fs = require("fs");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION; 
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({

    region,
    accessKey,
    secretKey

});

exports.uploadImageToS3Bucket = async (currentImageKey, userid, file) => {
    if (currentImageKey != null) {
        const deleteParams = {
            Key: currentImageKey,
            Bucket: bucketName
          };
          console.log("################# deleting previous imagekey ##############");
        
          await s3.deleteObject(deleteParams).promise();
    }
    console.log("################# Uploading new  imagekey ##############");

    console.log("file " , file);
    const fileStream = fs.createReadStream(file.path);



    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: userid + "/" + file.filename,
        Metadata: {
            "file_name": file.originalname,
            "upload_date": new Date().toISOString(),
            "image_id": file.filename          

        }
    };

    return s3.upload(uploadParams).promise();

};



exports.fetchImageFromS3Bucket = (fileKey) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
      }
    
      return s3.getObject(downloadParams).promise();
};



exports.deleteImageFromS3Bucket = (fileKey) => {
    const deleteParams = {
        Key: fileKey,
        Bucket: bucketName
      }
    
      return s3.deleteObject(deleteParams).promise();
};
