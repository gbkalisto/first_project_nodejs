const { body, validationResult } = require('express-validator');

const categoryValidationRules = [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('slug').optional({ checkFalsy: true })
        .trim()
        .isSlug().withMessage('Slug must be URL friendly (no spaces or special characters)'),
    body('image').notEmpty().withMessage('Image is required'),
    body('is_active').optional().isIn(['on']).withMessage('Invalid value for Active')
];


// 2. The Checker Middleware
const validate = async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // No errors? Move to the controller
    }
    // Errors found? Re-render the form with messages
    return res.status(400).render('admin/categories/create', {
        errors: errors.mapped(),
        oldData: req.body
    });
};


module.exports = {
    categoryValidationRules,
    validate
};