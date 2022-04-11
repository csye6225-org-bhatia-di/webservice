const AWS = require('aws-sdk');
const logger = require('../config/logger');
const aws_region = process.env.AWS_BUCKET_REGION; 
const dynamoDBObj = new AWS.DynamoDB({apiVersion: '2012-08-10', region: aws_region});
const appConstants = require('../utils/constants');
const moment = require('moment');

exports.dynamoDbPutObjectWithTTL = async (item) => {
    var momentObj = moment().add(2, 'm');
    logger.info("Expiration time: " + momentObj.unix());
    logger.info("Put Item Object: ", item);
    dynamoDBObj.putItem({
        Item: item,
        TableName: appConstants.DYNAMO_DB_TABLE_NAME

    }).promise()
    .then(data => {
        logger.info(data);
    }).catch(error => {
        logger.error(error);
    });
};