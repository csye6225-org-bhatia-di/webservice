const SDC = require('statsd-client');
const logger = require('../config/logger');
const sdc = new SDC({host: 'localhost', port: 8125});
const User = require('../models').user; // loads index.js
const appConstants = require('../utils/constants');
const aws_region = process.env.AWS_BUCKET_REGION; 
const AWS = require('aws-sdk');
const dynamoDBObj = new AWS.DynamoDB({apiVersion: '2012-08-10', region: aws_region});

exports.verifyUser = async (req, res) => {    
   sdc.increment('endpoint.user.http.post.verifyUser');
   const urlParams = new URLSearchParams(req.url.replace('/', ''));
   logger.info(urlParams.get("email"));
   logger.info(urlParams.get("token"));

   // check if its not verified
   const isUserNamePresent = await User.findOne({ where: {username: username}});

   if (isUserNamePresent === null) {
      res.status(400).send({
         message: "Username is not present. The link is invalid."
     });
   } else if (isUserNamePresent !== null && isUserNamePresent.isVerified) {
      res.status(400).send({
         message: "The user is already verified. The link is invalid."
     });
   }

   // check if obj exist in dynamo db
   const userStatusParams = {
      TableName: appConstants.DYNAMO_DB_TABLE_NAME,
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ":username": email
      }
    };


    var usersResult;
      try {
        usersResult = await dynamoDBObj.call("scan", userStatusParams);
        logger.info(usersResult);
      }catch (e) {
        console.log("Error occurred querying for users belong to group.");
        console.log(e);
      }


   


  //once api hit make it verified



};