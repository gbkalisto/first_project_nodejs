const Admin = require('../../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    res.render('admin/auth/index')
}

exports.attemptLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        // 1. Check if admin exists
        if (!admin) {
            return res.status(401).send('Invalid email or password');
        }

        // 2. Compare passwords using await for cleaner flow
        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
            // 3. Generate Token (Use a real secret from process.env)
            const token = jwt.sign({ id: admin._id, email: admin.email, name: admin.name, image: admin.image }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

            // 4. Set cookie and send response (Return here to stop execution)
            res.cookie("auth_token", token, { httpOnly: true });
            return res.redirect('/admin/dashboard'); // Or res.send('logged in')
        }

        // 5. If passwords don't match
        return res.status(401).send('Invalid email or password');

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

exports.logout = (req, res) => {
    res.clearCookie("auth_token");
    res.redirect('/admin/login');
};