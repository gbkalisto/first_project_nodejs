const Project = require('../../models/Project');


exports.index = async (req, res) => {
    let projects = await Project.find();
    res.render('admin/projects/index', { projects })
}

exports.create = async (req, res) => {
    res.render('admin/projects/create');
}

exports.store = async (req, res) => {
    const files = req.files;

    // Helper function to clean the path
    const formatPath = (filePath) => {
        if (!filePath) return null;

        let cleanPath = filePath.replace(/\\/g, '/');
        return cleanPath.replace(/^public\//, '').replace(/^\//, '');
    };

    const coverImage = files['coverImage']
        ? formatPath(files['coverImage'][0].path)
        : null;

    const screenshots = files['screenshots']
        ? files['screenshots'].map(file => formatPath(file.path))
        : [];

    await Project.create({ ...req.body, coverImage, screenshots });
    res.redirect('/admin/projects');
};
