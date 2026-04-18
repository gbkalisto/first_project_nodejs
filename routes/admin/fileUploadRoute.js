const express = require('express')
const router = express.Router();
const FileUploadController = require('../../controllers/admin/fileUploadController');
const uploader = require('../../utils/multer')

router.get('/media', FileUploadController.index);
router.post('/media', uploader('testing').single('image'), FileUploadController.store);
router.get('/media/create', FileUploadController.create);
router.delete('/media/delete/:id', FileUploadController.delete);



module.exports = router;
