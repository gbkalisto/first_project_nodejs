const express = require('express');
const router = express.Router();
const fileUploadController = require('../../controllers/api/fileUploadController');
const multer = require('../../utils/multer');

// Public Route
router.get('/', fileUploadController.index);
router.post('/', multer('testing').single('image'), fileUploadController.store);


module.exports = router;