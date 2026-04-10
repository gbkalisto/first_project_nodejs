const express = require('express');
const router = express.Router();
const loginController = require('../controllers/authController');


router.get('/', loginController.login);
router.post('/', loginController.attemptLogin);

module.exports = router;