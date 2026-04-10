const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController');

router.get('/', postController.index)
router.get('/create', postController.create)
router.post('/create', postController.store)
router.get('/edit/:id', postController.edit)
router.put('/edit/:id', postController.update)
router.delete('/delete/:id', postController.delete)

module.exports = router;