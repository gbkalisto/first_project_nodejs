const postModel = require('../models/post')

exports.index = async (req, res) => {
    let posts = await postModel.find({ isPublished: true })
        .populate('author', 'name') // if you need to get other fields like email or something pass other key after space
        .sort({ _id: -1 });
    res.render('home', { posts })
}
