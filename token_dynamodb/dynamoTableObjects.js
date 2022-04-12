const AWS = require('aws-sdk');
const logger = require('../config/logger');
const aws_region = process.env.AWS_BUCKET_REGION; 
const dynamoDBObj = new AWS.DynamoDB({apiVersion: '2012-08-10', region: aws_region});
const appConstants = require('../utils/constants');
const moment = require('moment');
const dynamoDBClientObj = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10', region: aws_region});

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

exports.dynamoGetObjectUsingFilter = async (filterParams, res) => {


    try {
        var result = await dynamoDBClientObj.scan(filterParams).promise();
        logger.info("Dynam resukt ", result);
        if (Object.keys(result).length == 0 || result.Count == 0) {
            res.status(400).send({
              message: "The user token expired. The link is invalid."
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
