const AWS = require('aws-sdk');
const AwsSns = new AWS.SNS({apiVersion: '2010-03-31', region: AWS_REGION});

const logger = require('../config/logger');
const AWS_REGION = process.env.AWS_BUCKET_REGION; 

  


exports.publishMessageToAmazonSNS = async (messageParams) => {
    console.log("stringify user");
    console.log(JSON.stringify(messageParams));
    const params = {
        Message: JSON.stringify(messageParams), 
        TopicArn: process.env.EMAIL_TOPIC_ARN
      };
      logger.info("Amazon Simple Notification Services have been triggered with params:- ", params);


      AwsSns.publish(params).promise().then(data => {
        logger.info("Amazon Simple Notification Services:: Message added :: Received data - ", data);
        
    }).catch(error => {
        logger.error("Amazon Simple Notification Services:: " + error.message);
    });
}; 

 