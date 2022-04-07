const SDC = require('statsd-client');
const logger = require('../config/logger');
const sdc = new SDC({host: 'localhost', port: 8125});


exports.fetchHealthInfo = async (req, res) => {
    sdc.increment('endpoint.user.http.get.healthz');
    console.log("Health controller");
    logger.info("Succefull 200 healthz");
    return res.status(200).send();

}