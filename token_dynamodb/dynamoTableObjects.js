const AWS = require('aws-sdk');
const logger = require('../config/logger');
const aws_region = process.env.AWS_BUCKET_REGION; 
const dynamoDBObj = new AWS.DynamoDB({apiVersion: '2012-08-10', region: aws_region});
const appConstants = require('../utils/constants');
const moment = require('moment');

exports.dynamoDbPutObjectWithTTL = async (item) => {
    var momentObj = moment().now().add(2, 'm');

    dynamoDBObj.putItem({
        Item: {
            userId: item.userId,
            username: item.username,
            token: 'ABC',
            expiration_time: momentObj.unix()
        },
        TableName: appConstants.DYNAMO_DB_TABLE_NAME

    }).promise()
    .then(data => {
        logger.info(data);
    }).catch(error => {
        logger.error(error);
    });
};