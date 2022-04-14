const SDC = require('statsd-client');
require('dotenv').config();
const fs = require('fs');
const logger = require('../config/logger');
const sdc = new SDC({host: 'localhost', port: 8125});
const User = require('../models').user; // loads index.js
const appConstants = require('../utils/constants');
const dynamoTableObjectModule = require('../aws_dynamodb/dynamoDbClientService');
const moment = require("moment");

exports.verifyCreatedUser = async (request, response) => {    
   sdc.increment('endpoint.user.http.get.verificationUser');

   const urlParams = new URLSearchParams(request.url.replace('/v1/verifyUserEmail', '').replace('/', ''));
   
   logger.info(request.url);
   
   const userEmail  = urlParams.get("email");
   const userTokenPartURL = urlParams.get("token");
   logger.info(urlParams.get("email"));
   logger.info(urlParams.get("token"));

   // check if its not verified
   const savedUser = await User.findOne({ where: {username: userEmail}});
   logger.info("Founded username:: ", savedUser);

   if (savedUser === null) {
      response.status(400).send({
         message: "The verification link is invalid, username is not present."
     });
   } else if (savedUser !== null && savedUser.isVerified) {
      response.status(400).send({
         message: "The verification link is invalid, since the user is already verified."
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


      try {
        const usersResult = await dynamoTableObjectModule.dynamoGetObjectUsingFilter(userStatusParams, response);
        if (usersResult != null) {
          logger.info("## Dynamo DB :: user result ", usersResult);

          if (userTokenPartURL !== usersResult.token) {
            savedUser.isVerified = false;
            savedUser.save();
            response.status(400).send({
              message: "The token provided in the link is incorrect. The account has been marked un-verified. "
            });
           
          }
          else if (Number(usersResult.expireUnix) < Number(moment().unix().toString())) {
            savedUser.isVerified = false;
            savedUser.save();
            response.status(400).send({
              message: "Token has expired. The verification Link is invalid. The account remains un-verified. "
            });
          } else {
            savedUser.isVerified = true;
            savedUser.save();
            response.status(200).send({
              message: "User has been marked verified. "
            });
          }
        } else {
          response.status(400).send({
            message: "The account remains un-verified. Opss! Something went wrong "
          });
        }
      } catch(error) {
        response.status(400).send({
          message: "The account remains un-verified. Opss! Something went wrong "
        });
      }
};