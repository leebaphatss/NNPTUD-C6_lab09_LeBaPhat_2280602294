let mongoose = require('mongoose');

let categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            default: ""
        },
        images: {
            type: [String],
            default: ["https://smithcodistributing.com/wp-content/themes/hello-elementor/assets/default_product.png"]
        },
        isDeleted:{
            type:Boolean,
            default:false
        }
    }, {
    timestamps: true
})
module.exports = mongoose.model('category', categorySchema)