const express = require('express')
const router = express.Router()
const postController = require('../../controllers/admin/postController');

router.get('/posts', postController.index)
router.get('/posts/create', postController.create)
router.post('/posts', postController.store)
router.get('/posts/edit/:id', postController.edit)
router.put('/posts/edit/:id', postController.update)
router.delete('/posts/delete/:id', postController.delete)

module.exports = router;