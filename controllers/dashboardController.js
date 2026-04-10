const userModel = require('../models/user');


exports.dashboard = async (req, res) => {
    console.log(req.user)
    res.render('dashboard')
}
