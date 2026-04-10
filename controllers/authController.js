const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    res.render('auth/login')
}

exports.attemptLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        // 1. Check if user exists
        if (!user) {
            return res.status(401).render('auth/login', {
                error: 'Invalid email or password'
            });
        }

        // 2. Check the user status before password comparison
        if (!user.is_active) {
            return res.status(403).render('auth/login', {
                error: 'Your account is inactive. Please contact support.'
            });
        }

        // 2. Compare passwords using await for cleaner flow
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // 3. Generate Token (Use a real secret from process.env)
            const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

            // 4. Set cookie and send response (Return here to stop execution)
            res.cookie("token", token, { httpOnly: true });
            return res.redirect('/dashboard'); // Or res.send('logged in')
        }

        // 5. If passwords don't match
        return res.status(401).render('auth/login', {
            error: 'Invalid email or password'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

// exports.logout = (req, res) => {
//     res.clearCookie("token");
//     res.redirect('/login');
// };