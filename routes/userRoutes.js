const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../utils/multer')
const path = require("path");


router.get('/', userController.userFrom);
router.post('/', upload('users').single('image'), userController.createUser);


module.exports = router;