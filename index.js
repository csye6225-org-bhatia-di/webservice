const express = require("express");
var bodyParser = require('body-parser');

const app = express();


app.use(express.json());
// app.use(express.json({limit: '25mb'}));
// app.use(express.urlencoded({limit: '25mb'}));


//Importing health Routes
const healthRoute = require('./routes/healthRoute');
app.use('/healthz', healthRoute);
//Importing USER Routes
const userRoute = require('./routes/userRoute');
app.use('/v1/user', userRoute);




app.listen('3000', () => {

    console.log("Server is listening on port 3000");

});
