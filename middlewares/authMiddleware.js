const jwt = require('jsonwebtoken');

exports.isLoggedIn = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).redirect('/login'); // send them either home page or login page
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        res.locals.user = decoded;
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.status(403).redirect('/login');
    }
};