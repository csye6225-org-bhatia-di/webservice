const uuidv4 = require('uuidv4');
const bcrypt = require('bcrypt');
const User = require('../models').user; // loads index.js
const UserToImageMapping = require('../models').usertoimagemapping;
const authorization = require('../authorization/authorize');
const s3Server = require('../aws/s3Server');
const multer = require('multer');
const upload = multer({dest: 'imgUploads/'});
const SDC = require('statsd-client');
const logger = require('../config/logger');
const sdc = new SDC({host: 'localhost', port: 8125});
const createDynamoModule = require('../token_dynamodb/createDynamoDbTable');

exports.fetchUser = async (req, res) => {

    console.log("Fetch  User Controller Started");
    console.log("Request Info-", req.body);
    sdc.increment('endpoint.user.http.get');


    const userObject = await authorization.authorizeAndFetchUserInfo(req, res, User);
    logger.info("Auth response received");

    if(userObject != null){

        logger.info("Successful Authorization");

        let temp = userObject.toJSON();
        delete temp.password;
        console.log("Response", temp);
        return res.status(200).send(temp);
    } else {
        res.status(400).send({
            message: "User not found."
        });
    }
};


exports.createUser = async (req, res) => {
    sdc.increment('endpoint.user.http.post');

    console.log("Create User Controller Started");
    console.log("Request Info", req.body);
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const username = req.body.username;
    const password = req.body.password;
    await createDynamoModule.dynamoCreateTableObject();


    
    // if(username && password && first_name && last_name) {       


    //         const isUserNamePresent = await User.findOne({ where: {username: username}});
    //         logger.info(" user found ");
            

    //         if(isUserNamePresent != null) {

    //             res.status(409).send({
    //                 message: "Invalid Request. User already exists"
    //             });

               

    //         } else {

    //             const salt = await bcrypt.genSalt(10);
    //             const hashedPassword = await bcrypt.hash(password,salt);


    //             const user = {

    //                 id: uuidv4.uuid(),
    //                 first_name: first_name,
    //                 last_name: last_name,
    //                 password: hashedPassword,
    //                 username: username
    //             };

    //             User.create(user)
    //                 .then(data => {

    //                     let temp = data.toJSON();
    //                     delete temp.password;
    //                     res.status(201).send(temp);
    //                     console.log("User has been created.")

    //                 })
    //                 .catch(err => {

    //                     res.status(500).send({
    //                         message: err.message
    //                     });
    //                 });

    //         }

        
        
    // } else {

    //     res.status(400).send({
    //         message: "Some required fields were not passed as a part of the request."
    //     });
    // }

};

exports.updateUser = async (req, res) => {
    sdc.increment('endpoint.user.http.put');

    console.log("Update User Controller Started");
    console.log("Request Info", req.body);
    

    const fetchUser = await authorization.authorizeAndFetchUserInfo(req, res, User);

    if(fetchUser !== null){

        logger.info("Successful Authorization");

        if(!req.body.password && !req.body.first_name && !req.body.last_name){
    
            res.status(400).send({
                message: "Invalid request. required parameters missing"
            });

        } else {

            const hashedPassword = await bcrypt.hash(req.body.password,10);
            fetchUser.password = hashedPassword;
            fetchUser.first_name = req.body.first_name;
            fetchUser.last_name = req.body.last_name;
            fetchUser.username = req.body.username;
            
            await fetchUser.save();
            

            res.status(204).send({
                message: "Updated Successfully."
            });

        }
    } else {
        res.status(400).send({
            message: "User not found."
        });
    }
};





exports.uploadUserImage = async (req, res) => {
    sdc.increment('endpoint.user.http.post.profilePic');
    console.log("######## Hitting user upload image #########"); 
    const fileExt = req.file.originalname.toUpperCase(); 
    const checker = fileExt.endsWith("JPEG") || fileExt.endsWith("PNG") || fileExt.endsWith("JPG");
    if (!checker) {
       res.status(400).send({"message": "Unsupported types"});
       return;
    } 


    // beginn authenticatoon
    // authorized user
    console.log("Request Info", req.body);



    const userObject = await authorization.authorizeAndFetchUserInfo(req, res, User);
    logger.info("Auth response received");

    if(userObject !== null) {

        logger.info("Successful Atuh");
        let userInfo = userObject;
        let s3Response = {}
        const userImageMappingObject = await UserToImageMapping.findOne({where: {
            userID: userInfo.id
        }});
        const currentImageKey = userImageMappingObject !== null ? userImageMappingObject.imageKey : null;


        await s3Server.uploadImageToS3Bucket(currentImageKey, userInfo.id, req.file)
        .then(data => {
            logger.info("#### response from s3  ####");
            logger.info(data);
            s3Response = data;           
        })
        .catch(err => {
            logger.info("Save to s3 failed");
            logger.info(err.message);
            res.status(400).send({"message": "Failed to save image to s3"});
        });      
        
        if (Object.keys(s3Response).length >= 1) {
            await updateUserToImageMapping(req.file, userInfo, s3Response, res);     
        } else {
            res.status(400).send({"message": "failecd! not well"});
        }

         

    } else {
        logger.info("Internal server error");
        res.status(500).send({"message": "Internal server errr"});
        
    }


  

};


exports.fetchUserImage = async (req, res) => {
    sdc.increment('endpoint.user.http.get.profilePic');
    const userObject = await authorization.authorizeAndFetchUserInfo(req, res, User);
    logger.info("Auth response received");

    if(userObject !== null) {

        logger.info("Successful Atuh");
        let userInfo = userObject;
        const userImageMappingObject = await UserToImageMapping.findOne({where: {
            userID: userInfo.id
        }});
        if(userImageMappingObject === null) {
            res.status(404).send({message: "Not found"});
            return;
        }


        let s3Response = {}
        await s3Server.fetchImageFromS3Bucket(userImageMappingObject.imageKey)
        .then(data => {
            logger.info("#### response from s3  ####");
            console.log(data);
            s3Response = data; 
            res.status(200).send({
                "file_name": s3Response.Metadata.file_name,
                "id": s3Response.Metadata.image_id,
                "url": userImageMappingObject.imageUrl,
                "upload_date": s3Response.Metadata.upload_date,
                "user_id": userInfo.id
            });          
        })
        .catch(err => {
            console.error("Fetch to s3 failed");
            console.error(err.message);
            res.status(400).send({"message": "Failed to fetch image to s3"});
        });      
        
     

         

    } else {
        res.status(500).send({"message": "Internal server errr"});
        
    }





};

exports.deleteUserImage = async (req, res) => {
    sdc.increment('endpoint.user.http.delete.profilePic');
    const userObject = await authorization.authorizeAndFetchUserInfo(req, res, User);
    logger.info("Auth response received");

    if(userObject !== null) {

        logger.info("Successful Atuh");
        let userInfo = userObject;
        const userImageMappingObject = await UserToImageMapping.findOne({where: {
            userID: userInfo.id
        }});
        
        if(userImageMappingObject === null) {
            res.status(404).send({message: "Not found"});

        } else {
            let s3Response = {};
            await s3Server.deleteImageFromS3Bucket(userImageMappingObject.imageKey)
            .then(data => {
                logger.info("#### response for delete from s3  ####");
                logger.info(data);
                s3Response = data; 
                userImageMappingObject.destroy();
                res.status(204).send();        
            })
            .catch(err => {
                console.error("Fetch to s3 failed");
                console.error(err.message);
                res.status(400).send({"message": "Failed to fetch image to s3"});
            });      



        }


       
        
     

         

    } else {
        res.status(500).send({"message": "Internal server errr"});
        
    }


};



async function updateUserToImageMapping (file, userInfo, s3Response, res) {

    const currentUserToImageMapping = await UserToImageMapping.findOne({ where: {
        userID: userInfo.id
    }});
    console.log(currentUserToImageMapping);

    if(currentUserToImageMapping !== null) {
        console.log(s3Response);
        currentUserToImageMapping.imageKey = s3Response.Key;
        currentUserToImageMapping.imageUrl = s3Response.Location;
        await currentUserToImageMapping.save();
        res.status(200).send({
            "file_name": file.originalname,
            "upload_date": new Date().toISOString().split("T")[0],
            "id": file.filename,
            "url": s3Response.Location,
             "user_id": userInfo.id  


        });
        
        
    } else {

        const newUserToImageMapping = {
            id: uuidv4.uuid(),
            userID: userInfo.id,
            imageKey: s3Response.Key,
            imageUrl: s3Response.Location
        };

        console.log("Saving image object ", newUserToImageMapping);
        UserToImageMapping.create(newUserToImageMapping)
        .then(newMapping => {
            console.log("Record saved! " + newMapping);
            res.status(200).send(
                {
                    "file_name": file.originalname,
                    "upload_date": new Date().toISOString().split("T")[0],
                    "id": file.filename,
                    "url": s3Response.Location,
                    "user_id": userInfo.id  


                }
            );
        }).catch((err) => {
            console.error("Encountered error " + err.message);
            res.status(400).send({"message": "not changa"});
        });

    }
  


}