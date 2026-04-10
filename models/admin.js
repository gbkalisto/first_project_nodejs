const mongoose = require("mongoose");

const AdminSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter user name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter email address"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    image: {
        type: String,
        default: "default-profile.png"
    }
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);