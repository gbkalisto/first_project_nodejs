const mongoose = require("mongoose");


const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a product name"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [1, "Price must be at least 1"]
    },
    stock: { type: Number, default: 0 },
    category: {
        type: String,
        required: [true, "Category is required"],
    },
    image: {
        type: String,
        required: ['true', "Image required"]
    },
    description: {
        type: String,
    },
    is_active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Product', ProductSchema);