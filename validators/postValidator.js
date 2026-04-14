const { body, validationResult } = require('express-validator');
const Authers = require('../models/user');

const postValidationRules = [
    body('author').notEmpty().withMessage('Author is required'),
    body('title').notEmpty()
        .withMessage('Title is required')
        .trim()
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
    body('slug').optional({ checkFalsy: true })
        .trim()
        .isSlug().withMessage('Slug must be URL friendly (no spaces or special characters)'),
    body('body').notEmpty().withMessage('Body is required'),
    body('publishedAt').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Published At must be a valid date'),
    body('isPublished').optional().isIn(['on']).withMessage('Invalid value for Published')
];


// 2. The Checker Middleware
const validate = async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // No errors? Move to the controller
    }

    const authors = await Authers.find({ is_active: true }).select('name id');
    // Errors found? Re-render the form with messages
    return res.status(400).render('admin/posts/create', {
        authors: authors,
        errors: errors.mapped(),
        oldData: req.body
    });
};


module.exports = {
    postValidationRules,
    validate
};