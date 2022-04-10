const AWS = require('aws-sdk');
const logger = require('../config/logger');
const aws_region = process.env.AWS_BUCKET_REGION; 
const dynamoDBObj = new AWS.DynamoDB({apiVersion: '2012-08-10', region: aws_region});
const listDynamoTables = require('./listDynamoDbTables');
const appConstants = require('../utils/constants');

const tokenTableParams = {
    TableName : appConstants.DYNAMO_DB_TABLE_NAME,
    KeySchema: [       
        { AttributeName: "userID", KeyType: "HASH"}, //Primary key,
        { AttributeName: "expiration_time", KeyType: "RANGE"} //Primary key,

    ],
    AttributeDefinitions: [       
        { AttributeName: "userID", AttributeType: "S" },
        { AttributeName: "expiration_time", AttributeType: "N"} //Primary key,

    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }

};


exports.dynamoCreateTableObject = async () => {
    logger.info("Checking if Table Object already exisits. ");
    const existingTableNames = await listDynamoTables.dynamoListTableObject();
    console.log(existingTableNames);
    logger.info("###############");
    if (Array.isArray(existingTableNames) && existingTableNames.includes(appConstants.DYNAMO_DB_TABLE_NAMEs)) {
        logger.info("Table: " + appConstants.DYNAMO_DB_TABLE_NAME + " already exists");
        return;
    } else {
        logger.info("Table doesnt exist");
        logger.info("creating table");
        const tableCreated = await dynamoDBObj.createTable(tokenTableParams).promise().then((data) => {
            logger.info("table created");
            return true;
        }).catch(error => {
            logger.error("Error conecting to dynamo db " + error.message);
        });
        await new Promise(r => setTimeout(r, 5000));

        if(tableCreated) {
            logger.info("updating time to live on the table");
            dynamoDBObj.updateTimeToLive({
                "TableName": appConstants.DYNAMO_DB_TABLE_NAME,
                "TimeToLiveSpecification": { 
                        "AttributeName": "expiration_time",
                        "Enabled": true
                }
            }).promise().then(data => {
                logger.info("Time to lve enabled");
            }).catch(error => {
                logger.error("Time to lve failed to enable. " + error.message);
            });
        }

    }



};






 