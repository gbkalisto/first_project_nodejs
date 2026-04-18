const FileUpload = require('../../models/fileupload');
const fs = require('fs');
const path = require('path');

exports.index = async (req, res) => {
    const files = await FileUpload.find();
    res.render('admin/files/index', { files })
}

exports.create = async (req, res) => {
    res.render('admin/files/create');
}

exports.store = async (req, res) => {
    if (!req.file) {
        req.flash('error', 'Please select a file to upload.');
        return res.redirect('/admin/media/create');
    }
    const basePath = req.file.destination.replace('./public/', '');
    const databasePath = `${basePath}/${req.file.filename}`;
    const fileCreated = await FileUpload.create({
        image: databasePath
    });
    req.flash('success', 'Image uploaded successfully!');
    res.redirect('/admin/media');
}

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const fileData = await FileUpload.findById(id);

        // CHECK 1: Did we actually find a record?
        if (!fileData) {
            console.log("No record found with ID:", id);
            req.flash('error', 'Record not found.');
            return res.redirect('/admin/media');
        }

        // CHECK 2: Does the field exist? 
        // Replace 'image' with the actual field name in your Schema
        if (!fileData.image) {
            console.log("Field 'image' is undefined. Document data:", fileData);
            await FileUpload.findByIdAndDelete(id); // Optional: Clean up orphaned record
            req.flash('error', 'Database record has no file path.');
            return res.redirect('/admin/media');
        }

        // Construct path safely
        // path.join requires all arguments to be strings
        const fullPath = path.join(__dirname, '../../public', fileData.image);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath); // Using Sync for simplicity in admin tasks
        }

        await FileUpload.findByIdAndDelete(id);

        req.flash('success', 'Media File Deleted successfully!');
        res.redirect('/admin/media');

    } catch (error) {
        console.error("Delete Error:", error);
        req.flash('error', 'Server error during deletion.');
        res.redirect('/admin/media');
    }
};