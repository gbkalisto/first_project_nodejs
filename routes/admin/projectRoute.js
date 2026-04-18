const express = require('express');
const router = express.Router();
const path = require("path");
const projectController = require('../../controllers/admin/projectController');
const getUploader = require('../../utils/multer');
const projectUpload = getUploader('projects');



router.get('/projects', projectController.index);
router.get('/projects/create', projectController.create);
router.post('/projects', projectUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 }
]), projectController.store);
// router.get('/users/:id/edit', usersController.edit);
// router.put('/users/:id', upload('products').single('image'), usersController.update);
// router.delete('/users/:id', usersController.delete);


module.exports = router;


