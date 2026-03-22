const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../utils/multer');
const path = require("path");


router.get('/', productController.getAllProducts);
router.get('/create', productController.createProducts);
router.post('/', upload('products').single('image'), productController.storeProducts); // POST for Creating

router.get('/:id/edit', productController.editProducts);
router.put('/:id', upload('products').single('image'), productController.updateProducts); // PUT for Updating
router.delete('/:id', productController.deleteProducts); // DELETE for Deleting

module.exports = router;