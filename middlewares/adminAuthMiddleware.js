const jwt = require('jsonwebtoken');

exports.isAdminLoggedIn = (req, res, next) => {
    try {
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).redirect('/admin/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        res.locals.admin = decoded;
        next();
    } catch (err) {
        res.clearCookie("auth_token");
        return res.status(403).redirect('/admin/login');
    }
};