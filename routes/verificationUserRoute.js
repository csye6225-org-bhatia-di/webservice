const express = require('express');
const router = express.Router();
const VerifyUserController = require('../controller/verificationController');

router.get("/", VerifyUserController.verifyUser);

module.exports = router;