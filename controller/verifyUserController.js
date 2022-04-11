const SDC = require('statsd-client');
require('dotenv').config();
const fs = require('fs');
const logger = require('../config/logger');
const sdc = new SDC({host: 'localhost', port: 8125});
const User = require('../models').user; // loads index.js
const appConstants = require('../utils/constants');
const aws_region = process.env.AWS_BUCKET_REGION; 
const AWS = require('aws-sdk');
const dynamoDBClientObj = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10', region: aws_region});

exports.verifyUser = async (req, res) => {    
   sdc.increment('endpoint.user.http.post.verifyUser');
   const urlParams = new URLSearchParams(req.url.replace('/', ''));
   const userEmail  = urlParams.get("email");
   const userTokenPartURL = urlParams.get("token");
   logger.info(urlParams.get("email"));
   logger.info(urlParams.get("token"));

   // check if its not verified
   const isUserNamePresent = await User.findOne({ where: {username: userEmail}});
   logger.info(isUserNamePresent);

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
        ':username': userEmail.trim()
      }
    };



        const usersResult = await dynamoDBClientObj.scan(userStatusParams).promise().then(data => {
         
        
          if (data.Count == 0) {
            res.status(400).send({
              message: "The user token expired. The link is invalid."
            });
          } 
          return data.Items[0];
        }).catch(error => {
          res.status(400).send({
            message: "The user token expired. The link is invalid."
          });

  
        });
        logger.info("## user result ", usersResult);
        if (userTokenPartURL !== usersResult.token) {
          isUserNamePresent.isVerified = false;
          isUserNamePresent.save();
          res.status(400).send({
            message: "Encountered Invalid token and the account is not verified. "
          });
         
        } else {
          isUserNamePresent.isVerified = true;
          isUserNamePresent.save();
          res.status(200).send({
            message: "User has been marked verified. "
          });
        }
        
     


   





};