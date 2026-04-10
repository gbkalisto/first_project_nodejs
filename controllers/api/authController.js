const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Create User (Password hashing usually handled in User Schema pre-save hook)
        user = await User.create({ name, email, password });

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: token, // Send this to the client
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not exists" });

        // Create User (Password hashing usually handled in User Schema pre-save hook)
        // user = await User.create({ name, email, password });
        let verifyPassword = await bcrypt.compare(password, user.password);
        if (verifyPassword) {
            // Generate JWT
            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                success: true,
                message: "User Logged In",
                token: token, // Send this to the client
                user: { id: user._id, name: user.name, email: user.email }
            });
        }

        res.status(200).json({
            success: false,
            message: "Something went wrong",
        });



    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}