const AWS = require('aws-sdk');
const logger = require('../config/logger');
const aws_region = process.env.AWS_BUCKET_REGION; 
const dynamoDBObj = new AWS.DynamoDB({apiVersion: '2012-08-10', region: aws_region});

exports.dynamoListTableObject = async () => dynamoDBObj.listTables({Limit: 10}).promise().then((data) => {
    logger.info(data);
    console.log(data);
    return data.TableNames;
}).catch(error => {
    logger.error("Error conecting to dynamo db " + error.message);
    console.error("Error conecting to dynamo db " + error.message);
});

 // if (err) {
    //   console.log("Error", err.code);
    // } else {
    //   console.log("Table names are ", data.TableNames);
    //   return data.TableNames;
    // }