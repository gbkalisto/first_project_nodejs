const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/admin/userController');
const upload = require('../../utils/multer')


router.get('/users', usersController.getAllUsers);
router.get('/users/create', usersController.create);
router.post('/users', upload('products').single('image'), usersController.store);
router.get('/users/:id/edit', usersController.edit);
router.put('/users/:id', upload('products').single('image'), usersController.update);
router.delete('/users/:id', usersController.delete);


module.exports = router;