const uuidv4 = require('uuidv4');
const bcrypt = require('bcrypt');
const User = require('../models').user; // loads index.js
const UserToImageMapping = require('../models').usertoimagemapping;
const authorization = require('../authorization/authorize');
const s3Server = require('../aws/s3Server');
const multer = require('multer');
const upload = multer({dest: 'imgUploads/'});

exports.fetchUser = async (req, res) => {

    console.log("Fetch  User Controller Started");
    console.log("Request Info", req.body);
    

    const userObject = await authorization.authorizeAndFetchUserInfo(req, res, User);
    console.log("Auth response received");

    if(userObject != null){

        console.log("Successful Authorization");

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

    console.log("Create User Controller Started");
    console.log("Request Info", req.body);
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const username = req.body.username;
    const password = req.body.password;
    
    if(username && password && first_name && last_name) {       


            const isUserNamePresent = await User.findOne({ where: {username: username}});
            console.log(" user found ");
            

            if(isUserNamePresent != null) {

                res.status(409).send({
                    message: "Invalid Request. User already exists"
                });

               

            } else {

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password,salt);


                const user = {

                    id: uuidv4.uuid(),
                    first_name: first_name,
                    last_name: last_name,
                    password: hashedPassword,
                    username: username
                };

                User.create(user)
                    .then(data => {

                        let temp = data.toJSON();
                        delete temp.password;
                        res.status(201).send(temp);
                        console.log("User has been created.")

                    })
                    .catch(err => {

                        res.status(500).send({
                            message: err.message
                        });
                    });

            }

        
        
    } else {

        res.status(400).send({
            message: "Some required fields were not passed as a part of the request."
        });
    }

};

exports.updateUser = async (req, res) => {

    console.log("Update User Controller Started");
    console.log("Request Info", req.body);
    

    const fetchUser = await authorization.authorizeAndFetchUserInfo(req, res, User);

    if(fetchUser !== null){

        console.log("Successful Authorization");

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

    console.log("######## Hitting user upload image #########");  


    // beginn authenticatoon
    // authorized user
    console.log("Request Info", req.body);



    const userObject = await authorization.authorizeAndFetchUserInfo(req, res, User);
    console.log("Auth response received");

    if(userObject !== null) {

        console.log("Successful Atuh");
        let userInfo = userObject;
        let s3Response = {}
        const userImageMappingObject = await UserToImageMapping.findOne({where: {
            userID: userInfo.id
        }});
        const currentImageKey = userImageMappingObject !== null ? userImageMappingObject.imageKey : null;


        await s3Server.uploadImageToS3Bucket(currentImageKey, userInfo.id, req.file)
        .then(data => {
            console.log("#### response from s3  ####");
            console.log(data);
            s3Response = data;           
        })
        .catch(err => {
            console.error("Save to s3 failed");
            console.error(err.message);
            res.status(400).send({"message": "Failed to save image to s3"});
        });      
        
        if (Object.keys(s3Response).length >= 1) {
            await updateUserToImageMapping(req.file, userInfo, s3Response, res);     
        } else {
            res.status(400).send({"message": "not well"});
        }

         

    } else {
        res.status(500).send({"message": "Internal server errr"});
        
    }


  

};


exports.fetchUserImage = async (req, res) => {

    const userObject = await authorization.authorizeAndFetchUserInfo(req, res, User);
    console.log("Auth response received");

    if(userObject !== null) {

        console.log("Successful Atuh");
        let userInfo = userObject;
        const userImageMappingObject = await UserToImageMapping.findOne({where: {
            userID: userInfo.id
        }});


        let s3Response = {}
        await s3Server.fetchImageFromS3Bucket(userImageMappingObject.imageKey)
        .then(data => {
            console.log("#### response from s3  ####");
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

    const userObject = await authorization.authorizeAndFetchUserInfo(req, res, User);
    console.log("Auth response received");

    if(userObject !== null) {

        console.log("Successful Atuh");
        let userInfo = userObject;
        const userImageMappingObject = await UserToImageMapping.findOne({where: {
            userID: userInfo.id
        }});
        


        let s3Response = {};
        await s3Server.deleteImageFromS3Bucket(userImageMappingObject.imageKey)
        .then(data => {
            console.log("#### response for delete from s3  ####");
            console.log(data);
            s3Response = data; 
            userImageMappingObject.destroy();
            res.status(204).send();        
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
            "upload_date": new Date().toISOString(),
            "image_id": file.filename,
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
                    "upload_date": new Date().toISOString(),
                    "image_id": file.filename,
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