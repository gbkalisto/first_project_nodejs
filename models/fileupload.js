const mongoose = require('mongoose')

const fileuploadSchema = mongoose.Schema({
    image: String
});

module.exports = mongoose.model('fileupload', fileuploadSchema)