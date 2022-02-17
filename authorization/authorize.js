const auth = require("basic-auth");
const bcrypt = require('bcrypt');

const authorizeAndFetchUserInfo = async (req,res, User) => {

    console.log("Beginning Authorization");
    const credentials = auth(req);

    if(!credentials){

        res.status(401).send({
            message: "Please Login!"
        });

    } else {

        let username = credentials.name;
        let password = credentials.pass;

        if(username && password){
            
            
            let userObject = await User.findOne({
                where: {
                    username: username
                }
            });
          
            if(!userObject){

                res.setHeader('WWW-Authentication', 'Basic realm = "example"');
                res.status(401).send({
                    Unauthorized: "Username doesn't exists"
                });
                console.error("Username doesn't exists..!");

            } else {

                if(! await bcrypt.compare(password, userObject.password)){
                    res.setHeader('WWW-Authentication', 'Basic realm = "example"');
                    res.status(401).send({
                        Unauthorized: "Invalid Credentials"
                    });

                } else {

                    return userObject;
                }
            }
        } else {

            if(typeof username === typeof "" && typeof password === typeof "") {
                res.status(400).send({
                    message: "Please enter Username and Password!"
                });
            }
        }
    }
    

  

   
}

module.exports = {authorizeAndFetchUserInfo};