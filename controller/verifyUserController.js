const SDC = require('statsd-client');
require('dotenv').config();
const fs = require('fs');
const logger = require('../config/logger');
const sdc = new SDC({host: 'localhost', port: 8125});
const User = require('../models').user; // loads index.js
const appConstants = require('../utils/constants');
const dynamoTableObjectModule = require('../token_dynamodb/dynamoTableObjects');

exports.verifyUser = async (req, res) => {    
   sdc.increment('endpoint.user.http.post.verifyUser');
   const urlParams = new URLSearchParams(req.url.replace('/v1/verifyUserEmail', '').replace('/', ''));
   logger.info(req.url);
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


      try {
        const usersResult = await dynamoTableObjectModule.dynamoGetObjectUsingFilter(userStatusParams, res);
        if (usersResult != null) {
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
        } else {
          res.status(400).send({
            message: "User has been marked un-verified.Somthing went wrong "
          });
        }
      } catch(error) {
        res.status(400).send({
          message: "User has been marked un-verified.Somthing went wrong "
        });
      }
        
     


   





};