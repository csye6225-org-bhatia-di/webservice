const AWS = require('aws-sdk');
const logger = require('../config/logger');
const aws_region = process.env.AWS_BUCKET_REGION; 

  
const aws_sns_module = new AWS.SNS({apiVersion: '2010-03-31', region: aws_region});


exports.publicNewUserMessage = async (newUser) => {
    const params = {
        Message: JSON.stringify(newUser), 
        TopicArn: process.env.EMAIL_TOPIC_ARN
      };
      logger.info("SNS Triggered", params);


      aws_sns_module.publish(params).promise().then(data => {
        logger.info("Sns Message added", data);
        
    }).catch(error => {
        logger.error("SNS Publish error: " + error.message);
    });
}; 

 