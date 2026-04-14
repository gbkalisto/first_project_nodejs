const express = require('express')
const router = express.Router();
const categoryController = require('../../controllers/admin/categoryController')
const upload = require('../../utils/multer')
const { categoryValidationRules, validate } = require('../../validators/categoryValidator');

router.get('/categories', categoryController.index)
router.get('/categories/create', categoryController.create)
router.post('/categories', upload('categories').single('image'), categoryValidationRules, validate, categoryController.store)
router.get('/categories/:id/edit', categoryController.edit)
router.put('/categories/:id/edit', upload('categories').single('image'), categoryController.update)
router.delete('/categories/delete/:id', categoryController.delete);



module.exports = router;