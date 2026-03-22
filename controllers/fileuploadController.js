const fileuploadModel = require('../models/fileupload');


exports.show = async (req, res) => {
    res.render('fileupload')
}

exports.upload = async (req, res) => {
    const relativePath = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
    await fileuploadModel.create({
        image: relativePath
    });
    res.send('file upload and stored in db')
}