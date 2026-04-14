const { render } = require('ejs');
const productModel = require('../../models/product');
const Category = require('../../models/category');
const path = require('path');
const fs = require('fs');


exports.getAllProducts = async (req, res) => {
    let products = await productModel.find();
    res.render('admin/products/index', { products });
}

exports.createProducts = async (req, res) => {
    let categories = await Category.find({ is_active: true }).select('name id');
    res.render('admin/products/create', { categories });
}

exports.storeProducts = async (req, res) => {
    try {
        let { name, price, stock, category } = req.body;
        const relativePath = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        await productModel.create({
            name,
            price,
            stock,
            category,
            image: relativePath
        }
        );
        res.redirect('/admin/products');
    } catch (err) { // <--- Ensure 'err' is defined here
        console.error("Validation Error:", err.message);

        // Check if it's a Mongoose validation error
        if (err.name === 'ValidationError') {
            const errors = {};
            // Loop through the Mongoose error object
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });

            // Return to the form with the errors and previous input
            return res.render('admin/products/create', {
                errors,
                oldData: req.body
            });
        }

        // If it's a different kind of error (like DB connection)
        res.status(500).send("A system error occurred: " + err.message);
    }
};


exports.editProducts = async (req, res) => {
    let product = await productModel.findOne({ _id: req.params.id });
    let categories = await Category.find();
    res.render('admin/products/edit', { product, categories })
}

exports.updateProducts = async (req, res) => {
    try {
        let { name, price, stock, category } = req.body;
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        // 1. Start with the existing image as the default
        let dbImg = product.image;

        // 2. Check if a new file was uploaded
        if (req.file) {
            // Delete the OLD image from the folder
            const oldImagePath = path.join(process.cwd(), 'public', product.image);

            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            // Update dbImg with the NEW path
            // We strip 'public' and fix slashes
            dbImg = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        }

        // 3. Update the database
        await productModel.findByIdAndUpdate(req.params.id, {
            name,
            price,
            stock,
            category,
            image: dbImg 
        });

        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating product");
    }
}

exports.deleteProducts = async (req, res) => {

    const product = await productModel.findById(req.params.id);

    if (!product) {
        return res.status(404).send("Product not found");
    }

    // We need to point to './public/images/products/name.jpg'
    const imagePath = path.join(process.cwd(), 'public', product.image);

    console.log("Absolute Path:", imagePath);

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("File deleted successfully");
    } else {
        console.log("File not found on disk, could not delete");
    }

    await productModel.findByIdAndDelete(req.params.id);
    res.redirect('/admin/products');
}