const User = require('../../models/user')
const Post = require('../../models/post')
const path = require("path");
const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');


exports.getAllUsers = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalUsers = await User.countDocuments();
        const users = await User.aggregate([
            {
                // 1. Join the 'posts' collection
                $lookup: {
                    from: 'posts',          // The name of the collection in MongoDB (usually lowercase plural)
                    localField: '_id',      // Field in the User collection
                    foreignField: 'author', // Field in the Post collection that references the user
                    as: 'userPosts'         // Temporary array field to store found posts
                }
            },
            {
                // 2. Add a 'postCount' field based on the size of the array
                $addFields: {
                    postCount: { $size: '$userPosts' }
                }
            },
            // {
            //     // 3. Optional: Remove the temporary array to save memory
            //     $project: {
            //         userPosts: 0,
            //         password: 0 // Good practice to hide passwords in lists
            //     }
            // },
            {
                $sort: { _id: -1 }
            }
        ])
            .skip(skip)
            .limit(limit);

        res.render('admin/users/index', {
            users, currentPage: page,
            totalPages: Math.ceil(totalUsers / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

exports.create = async (req, res) => {
    res.render('admin/users/create')
}


exports.store = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // const relativePath = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        let relativePath = 'default-profile.png'; // default

        if (req.file && req.file.path) {
            relativePath = req.file.path
                .replace(/\\/g, '/')
                .replace(/^public\//, '');
        }
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            image: relativePath
        });
        return res.redirect('/admin/users');

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

exports.edit = async (req, res) => {
    let user = await User.findOne({ _id: req.params.id });
    res.render('admin/users/edit', { user })
}

exports.update = async (req, res) => {
    try {
        const { name, email, password, is_active } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).send("User not found");

        // 1. Handle Unique Email Logic
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
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
        const status = is_active === 'on' ? true : false;
        // 4. Update Database
        await User.findByIdAndUpdate(req.params.id, {
            name,
            email,
            image: dbImg,
            password: finalPassword,
            is_active: status,
        });

        res.redirect('/admin/users');

    } catch (err) {
        console.error(err);
        res.status(500).send("Update failed: " + err.message);
    }
};

exports.delete = async (req, res) => {
    await User.findOneAndDelete({ _id: req.params.id });
    res.redirect('/admin/users')
}