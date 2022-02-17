const uuidv4 = require('uuidv4');
const bcrypt = require('bcrypt');
const User = require('../models').user; // loads index.js
const authorization = require('../authorization/authorize');
const { response } = require('express');
const { use } = require('bcrypt/promises');

exports.createUser = async (req, res) => {

    console.log("Create User Controller Started");
    console.log("Request Info", req.body);
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const username = req.body.username;
    const password = req.body.password;
    
    if(username && password && first_name && last_name) {       


            const isUserNamePresent = await User.findOne({ where: {username: username}});
            console.log("Found user ", isUserNamePresent);
            

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
                            message: err.message || "Some error occurred while creating the User."
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
    console.log("Auth returned : ", fetchUser);

    if(fetchUser){

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
    }
};



exports.fetchUser = async (req, res) => {

    console.log("Fetch  User Controller Started");
    console.log("Request Info", req.body);
    

    const userObject = await authorization.authorizeAndFetchUserInfo(req, res, User);

    if(userObject != null){

        console.log("Successful Authorization");

        let temp = userObject.toJSON();
        delete temp.password;
        console.log("Response", temp);
        return res.status(200).send(temp);
    }
};



