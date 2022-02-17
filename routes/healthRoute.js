const express = require('express');
const router = express.Router();
const HealthController = require('../controller/healthController');


router.get("/", HealthController.fetchHealthInfo);

module.exports = router;
