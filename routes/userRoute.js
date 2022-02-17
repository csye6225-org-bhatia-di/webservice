const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController');

router.post("/", UserController.createUser);
router.put("/self", UserController.updateUser);
router.get("/self", UserController.fetchUser);

module.exports = router;
