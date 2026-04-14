const express = require('express')
const router = express.Router()
const postController = require('../../controllers/admin/postController');
const { postValidationRules, validate } = require('../../validators/postValidator');

router.get('/posts', postController.index)
router.get('/posts/create', postController.create)
router.post('/posts', postValidationRules, validate, postController.store)
router.get('/posts/edit/:id', postController.edit)
router.put('/posts/edit/:id', postValidationRules, validate, postController.update)
router.delete('/posts/delete/:id', postController.delete)

module.exports = router;