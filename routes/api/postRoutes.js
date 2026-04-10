const express = require('express');
const router = express.Router();
const postController = require('../../controllers/api/postController');
const apiAuth = require('../../middlewares/apiAuth');

// Public Route
router.get('/', apiAuth, postController.index);
router.post('/', apiAuth, postController.create);

module.exports = router;