
const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const path = require("path");
const fs = require('fs')

exports.getUsers = async (req, res) => {
    let users = await userModel.find().sort({ _id: -1 });
    res.render('users/index', { users });
};

exports.userFrom = (req, res) => {
    res.render('Users/create');
}

exports.createUser = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const relativePath = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        await userModel.create({
            name,
            email,
            password: hashedPassword,
            image: relativePath
        });

        res.redirect('/users');

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

exports.editUser = async (req, res) => {
    let user = await userModel.findOne({ _id: req.params.id });
    res.render('users/edit', { user })
}

exports.updateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await userModel.findById(req.params.id);

        if (!user) return res.status(404).send("User not found");

        // 1. Handle Unique Email Logic
        if (email && email !== user.email) {
            const emailExists = await userModel.findOne({ email });
            if (emailExists) {
                return res.status(400).send("Email is already taken by another user");
            }
        }

        // 2. Handle Password (Only hash if a new one is provided)
        let finalPassword = user.password;
        if (password && password.trim() !== "") {
            finalPassword = await bcrypt.hash(password, 10);
        }

        // 3. Handle Image (Optional)
        let dbImg = user.image;
        if (req.file) {
            // Delete old image if it's not the default one
            if (user.image && user.image !== 'default-profile.png') {
                const oldImagePath = path.join(__dirname, '..', 'public', user.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            // Prepare new path
            dbImg = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        }

        // 4. Update Database
        await userModel.findByIdAndUpdate(req.params.id, {
            name,
            email,
            image: dbImg,
            password: finalPassword
        });

        res.redirect('/users');

    } catch (err) {
        console.error(err);
        res.status(500).send("Update failed: " + err.message);
    }
};

exports.userDelete = async (req, res) => {
    await userModel.findOneAndDelete({ _id: req.params.id });
    res.redirect('/users')
}