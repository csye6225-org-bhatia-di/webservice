const AWS = require('aws-sdk');
const logger = require('../config/logger');
const aws_region = process.env.AWS_BUCKET_REGION; 
const dynamoDBModule = new AWS.DynamoDB({apiVersion: '2012-08-10', region: aws_region});
const appConstants = require('../utils/constants');
const dynamoDBDocumentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10', region: aws_region});

exports.dynamoDbPutObjectWithTTL = async (item) => {
    logger.info("AWS Dynamo db :: Put Item Object :: ", item);
    dynamoDBModule.putItem({
        Item: item,
        TableName: appConstants.DYNAMO_DB_TABLE_NAME

    }).promise()
    .then(data => {
        logger.info("Put to Dynamo db Successful :: ", data);
    }).catch(error => {
        logger.error("Put to Dynamo db Failed :: " + error.message);
    });
};

exports.dynamoGetObjectUsingFilter = async (filterParams, res) => {


    try {
        var result = await dynamoDBDocumentClient.scan(filterParams).promise();
        if (Object.keys(result).length == 0 || result.Count == 0) {
            res.status(400).send({
              message: "Ops! The generated token has expired. You cannot verify your account anymore."
            });
          }
          result = result.Items[0];

    } catch (error) {
        res.status(400).send({
            message: "The user token expired. The link is invalid." + error.message
          });   
    }
    return result;
};
