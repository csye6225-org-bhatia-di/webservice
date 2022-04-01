const express = require("express");
var bodyParser = require('body-parser');

const app = express();


app.use(express.json());


//Importing health Routes
const healthRoute = require('./routes/healthRoute');
app.use('/healthz', healthRoute);
//Importing USER Routes
const userRoute = require('./routes/userRoute');
app.use('/v2/user', userRoute);




app.listen('3000', () => {

    console.log("Server is listening on port 3000");

});
