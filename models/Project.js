const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    liveUrl: {
        type: String,
        trim: true
    },
    coverImage: {
        type: String,
        required: true
    },
    screenshots: [{
        type: String
    }],
    techStack: [{
        type: String,
        enum: ['Node.js', 'React', 'MongoDB', 'Express', 'Tailwind', 'Bootstrap','Html 5','Java','Laravel']
    }],
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Project', ProjectSchema);