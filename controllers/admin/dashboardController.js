const Admin = require('../../models/admin');
const User = require('../../models/user');
const Product = require('../../models/product');
const Category = require('../../models/category');
const Post = require('../../models/post');
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.dashboard = async (req, res) => {
    try {
        // Execute all counts in parallel for better performance
        const [userCount, productCount, categoryCount, postCount] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Category.countDocuments(),
            Post.countDocuments()
        ]);

        res.render('admin/dashboard', {
            stats: {
                users: userCount,
                products: productCount,
                categories: categoryCount,
                posts: postCount,
            }
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

exports.profile = async (req, res) => {
    res.render('admin/auth/profile')
}

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const admin = await Admin.findById(req.admin.id);

        if (!admin) return res.status(404).send("Admin not found");

        // 1. Handle Unique Email Logic
        if (email && email !== admin.email) {
            const emailExists = await Admin.findOne({ email });
            if (emailExists) {
                return res.status(400).send("Email is already taken by another user");
            }
        }

        // 2. Handle Password (Only hash if a new one is provided)
        let finalPassword = admin.password;
        if (password && password.trim() !== "") {
            finalPassword = await bcrypt.hash(password, 10);
        }

        // 3. Handle Image (Optional)
        // 3. Handle Image (Optional)
        let dbImg = admin.image;
        if (req.file) {
            // Check if the admin currently has an image AND it's not the default one
            if (admin.image && admin.image !== 'default-profile.png') {

                // Correct way to build the absolute path: Project Root + public + DB path
                const oldImagePath = path.join(process.cwd(), 'public', admin.image);

                console.log("Attempting to delete:", oldImagePath); // For debugging

                try {
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                        console.log("Successfully deleted old image");
                    } else {
                        console.log("File does not exist at path:", oldImagePath);
                    }
                } catch (unlinkErr) {
                    console.error("Error while unlinking file:", unlinkErr);
                    // We don't stop the request here, just log the error
                }
            }

            // Prepare new path for database
            dbImg = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        }

        // 4. Update Database
        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.admin.id,
            {
                name,
                email,
                image: dbImg,
                password: finalPassword
            },
            { new: true } // CRITICAL: This tells Mongoose to return the UPDATED data
        );

        // 5. Re-sign the JWT
        // Now 'updatedAdmin' actually contains the new name/image
        const token = jwt.sign(
            {
                id: updatedAdmin._id,
                email: updatedAdmin.email,
                name: updatedAdmin.name,
                image: updatedAdmin.image
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );

        // 6. Overwrite the cookie
        // Ensure the name "auth_token" matches exactly what your login/middleware uses!
        res.cookie("auth_token", token, { httpOnly: true });

        res.redirect('/admin/dashboard');

    } catch (err) {
        console.error(err);
        res.status(500).send("Update failed: " + err.message);
    }
}