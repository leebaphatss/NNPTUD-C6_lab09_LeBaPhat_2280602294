let mongoose = require('mongoose');

let productSchema = mongoose.Schema(
    {
        sku: {
            type: String,
            required: true,
            unique: true
        },
        title: {
            type: String,
            required: true,
            unique: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        price: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            default: ""
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'category',
            required: true
        },
        images: {
            type: [String],
            default: ["https://smithcodistributing.com/wp-content/themes/hello-elementor/assets/default_product.png"]
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }, {
    timestamps: true
})
module.exports = mongoose.model('product', productSchema)