const express = require('express');
const router = express.Router();
const authController = require('../../controllers/api/authController');
const apiAuth = require('../../middlewares/apiAuth');

// Public Route
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Route Example
router.get('/profile', apiAuth, (req, res) => {
    res.json({ message: "Welcome to your protected profile", userId: req.user.id });
});

module.exports = router;