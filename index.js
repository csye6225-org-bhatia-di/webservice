const express = require("express");
const app = express();


app.use(express.json());


//Importing health Routes
const healthRoute = require('./routes/healthRoute');
app.use('/healthz', healthRoute);




app.listen('3000', () => {

    console.log("Server is listening on port 3000");

});
