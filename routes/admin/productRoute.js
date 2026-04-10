const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
const upload = require('../../utils/multer');
const path = require("path");


router.get('/products', productController.getAllProducts);
router.get('/products/create', productController.createProducts);
router.post('/products', upload('products').single('image'), productController.storeProducts); // POST for Creating

router.get('/products/:id/edit', productController.editProducts);
router.put('/products/:id', upload('products').single('image'), productController.updateProducts); // PUT for Updating
router.delete('/products/:id', productController.deleteProducts); // DELETE for Deleting

module.exports = router;