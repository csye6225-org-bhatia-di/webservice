const uuidv4 = require('uuidv4');
const bcrypt = require('bcrypt');
const User = require('../models').user; // loads index.js
const UserToImageMapping = require('../models').usertoimagemapping;
const authorization = require('../authorization/authorize');
const s3Server = require('../aws/s3Server');
const multer = require('multer');
const { use } = require('../routes/userRoute');
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




//     console.log("######## Hitting user upload image #########");  

 
//     console.log("Request header ", req.header);
//     console.log("Request Info", req.file); 
//     console.log("Request Info", req.files); 

//     console.log("Request Info", req.body); 
//     const userObject = await authorization.authorizeAndFetchUserInfo(req, res, User);
//     console.log("Auth response received");

//     if(userObject != null) {
        

//         console.log("Successful Authorization");
//         let userInfo = userObject.toJSON();
//         const file = req.body.file;
//         console.log("Request to s3 Bucket");
//         console.log(req.file.path);

//         // uploading to s3
//         await s3Server.uploadImageToS3Bucket(file)
//         .then(data => {
//             console.log("#### response from s3  ####");
//             console.log(data);

//             const currentUserToImageMapping = UserToImageMapping.findOne({ where: {
//                 userID: userInfo.id
//             }});

//             if(currentUserToImageMapping != null) {
//                 currentUserToImageMapping.imageKey = data.Key;
//                 currentUserToImageMapping.save();

//             } else {

//                 const newUserToImageMapping = {
//                     id: uuidv4.uuid(),
//                     userID: userInfo.id,
//                     imageKey: data.Key
//                 };

//                 console.log("Saving image object ", newUserToImageMapping);
//                 UserToImageMapping.create(newUserToImageMapping)
//                 .then(newMapping => {
//                     console.log("Record saved! " + newMapping);
//                 }).catch((err) => {
//                     console.err("Encountered error " + err.message);
//                 });

//             }
//             console.log("Saved to s3");
//         })
//         .catch(err => {
//             console.error("Save to s3 failed");
//             console.error(err.message);
//         });    


//         res.status(201).send({ message: "Uploaded user image at path " + '$file.path'});
        

//     } else {
//         res.status(400).send({
//             message: "Invalid credentials"
//         });
//     }   

// };



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
        await s3Server.uploadImageToS3Bucket(req.file)
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

        await updateUserToImageMapping(userInfo, s3Response, res);      

    } else {
        res.status(500).send({"message": "Internal server errr"});
        
    }


  

};


async function updateUserToImageMapping (userInfo, s3Response, res) {

    const currentUserToImageMapping = await UserToImageMapping.findOne({ where: {
        userID: userInfo.id
    }});

    if(currentUserToImageMapping !== null) {
        currentUserToImageMapping.imageKey = s3Response.Key;
        currentUserToImageMapping.save().then((data) => {
            res.status(200).send({"message": "changa"});
        }).catch((err) => {
            console.error("Encountered error " + err.message);
            res.status(400).send({"message": "not changa"});
        });
        
    } else {

        const newUserToImageMapping = {
            id: uuidv4.uuid(),
            userID: userInfo.id,
            imageKey: s3Response.Key
        };

        console.log("Saving image object ", newUserToImageMapping);
        UserToImageMapping.create(newUserToImageMapping)
        .then(newMapping => {
            console.log("Record saved! " + newMapping);
            res.status(200).send({"message": "changa"});
        }).catch((err) => {
            console.error("Encountered error " + err.message);
            res.status(400).send({"message": "not changa"});
        });

    }
  


}