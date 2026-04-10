const express = require('express');
const router = express.Router();
const adminLoginController = require('../../controllers/admin/authController');


router.get('/login', adminLoginController.login);
router.post('/login', adminLoginController.attemptLogin);
router.get('/logout', adminLoginController.logout);

module.exports = router;