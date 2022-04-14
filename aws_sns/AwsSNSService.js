require("dotenv").config();
const fs = require("fs");
const AWS = require('aws-sdk');
const AWS_REGION = process.env.AWS_BUCKET_REGION; 
const AwsSns = new AWS.SNS({apiVersion: '2010-03-31', region: AWS_REGION});
const logger = require('../config/logger');

  


exports.publishMessageToAmazonSNS = async (messageParams) => {
    console.log("stringify user");
    console.log(JSON.stringify(messageParams));
    const params = {
        Subject: 'NEW USER NOTIFICATION',
        Message: 'Adding new user to application ' + messageParams.username,
        MessageAttributes: {
            'domainName': {
              DataType: 'String', 
              StringValue: messageParams.domainName.S
            },
            'token': {
                DataType: 'String', 
                StringValue: messageParams.token.S
            },
            'expireUnix': {
                DataType: 'Number', 
                StringValue: messageParams.expireUnix.S
            },
            'type': {
                DataType: 'String', 
                StringValue: messageParams.type.S
            },
            'accountVerificationID': {
                DataType: 'String', 
                StringValue: messageParams.accountVerificationID.S
            },
            'username': {
                DataType: 'String', 
                StringValue: messageParams.username.S
            }

          }, 
        TopicArn: process.env.EMAIL_TOPIC_ARN
      };
      logger.info("Amazon Simple Notification Services have been triggered with params:- ", params);


      AwsSns.publish(params).promise().then(data => {
        logger.info("Amazon Simple Notification Services:: Message added :: Received data - ", data);
        
    }).catch(error => {
        logger.error("Amazon Simple Notification Services:: " + error.message);
    });
}; 

 