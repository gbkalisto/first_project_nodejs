const User = require('../models/user')
const bcrypt = require('bcrypt')

exports.show = async (req, res) => {
    const user = await User.findOne({ _id: req.user.id });
    // console.log(user)
    res.render('users/profile', { user })
}

exports.update = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user.id);

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

        // 4. Update Database
        await User.findByIdAndUpdate(req.user.id, {
            name,
            email,
            image: dbImg,
            password: finalPassword
        });

        res.redirect('/profile');

    } catch (err) {
        console.error(err);
        res.status(500).send("Update failed: " + err.message);
    }
}