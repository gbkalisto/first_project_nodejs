const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController')
const upload = require('../utils/multer');

router.get('/', profileController.show)
router.put('/update', upload('users').single('image'), profileController.update)






module.exports = router