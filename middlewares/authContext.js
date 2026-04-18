const jwt = require('jsonwebtoken');

exports.setAuthContext = (req, res, next) => {
    const token = req.cookies.token;
    
    // Default to null so EJS doesn't crash
    res.locals.user = null; 

    if (!token) {
        return next(); // No token? Just move to the next step (the page)
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Save user data to res.locals so EVERY .ejs file can see it
        res.locals.user = decoded; 
        next();
    } catch (err) {
        // If token is expired/fake, just treat them as a guest
        res.locals.user = null;
        next();
    }
};