const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../utils/multer');
const path = require("path");

router.get('/', userController.getUsers);
router.get('/create', userController.userFrom);
router.post('/', upload('users').single('image'), userController.createUser);
router.get('/:id/edit', userController.editUser);
router.delete('/delete/:id', userController.userDelete);
router.put('/:id/edit', upload('users').single('image'), userController.updateUser);

module.exports = router;