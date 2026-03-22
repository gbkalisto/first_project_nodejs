const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getUploader = (folderName) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = `./public/images/${folderName}`;

            // AUTOMATION: Create folder if it doesn't exist
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, folderName + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    return multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    });
};

module.exports = getUploader;