
const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const path = require("path");
const fs = require('fs')
const jwt = require('jsonwebtoken')



exports.userFrom = (req, res) => {
    res.render('auth/register');
}

exports.createUser = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const relativePath = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            image: relativePath
        });

        const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
        res.cookie("token", token, { httpOnly: true });
        return res.redirect('/dashboard');

    } catch (err) {
        const errors = {};

        // FIX 2: Handle Unique Email Error (Code 11000)
        if (err.code === 11000) {
            errors.email = "This email is already registered.";
        }

        // Handle Mongoose Validation Errors
        if (err.name === 'ValidationError') {
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
        }

        // If there are errors, re-render the form
        if (Object.keys(errors).length > 0) {
            return res.render('users/create', {
                errors,
                oldData: req.body
            });
        }

        res.status(500).send("System Error: " + err.message);
    }
}
