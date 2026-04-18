const FileUpload = require('../../models/fileupload');

exports.index = async (req, res) => {
    const uploadedFile = await FileUpload.find();
    res.status(200).json({
        success: true,
        count: uploadedFile.length,
        data: uploadedFile
    });
}

exports.store = async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const basePath = req.file.destination.replace('./public/', '');
        const databasePath = `${basePath}/${req.file.filename}`;
        const uploadedFile = await FileUpload.create({
            image: databasePath
        });

        res.status(200).json({
            success: true,
            data: uploadedFile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }









}