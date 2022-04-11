const SDC = require('statsd-client');
const logger = require('../config/logger');
const sdc = new SDC({host: 'localhost', port: 8125});

exports.verifyUser = async (req, res) => {    
   sdc.increment('endpoint.user.http.post.verifyUser');
   const urlParams = new URLSearchParams(req.url.replace('/', ''));
   logger.info(urlParams.get("email"));
   logger.info(urlParams.get("token"));
   






};