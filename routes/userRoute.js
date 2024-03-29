const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController');
const multer = require('multer');
const upload = multer({dest: 'imgUploads/'});

router.post("/", UserController.createUser);
router.put("/self", UserController.updateUser);
router.get("/self", UserController.fetchUser);
router.post("/self/pic", upload.single('profilePic'), UserController.uploadUserImage);
router.get("/self/pic", UserController.fetchUserImage);
router.delete("/self/pic", UserController.deleteUserImage);

module.exports = router;
