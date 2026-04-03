let mongoose = require('mongoose')
let reservedItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product'
    },
    title: {
        type: String
    },
    price: {//100
        type: Number,
        min: 0
    },
    quantity: {//5
        type: Number,
        min: 1
    },
    subtotal: {//400
        type: Number,
        min: 1
    }
}, {
    _id: false
})
let cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    products: {
        type: [reservedItemSchema],
        default: []
    },
    status: {
        type: String,
        enum: ["actived", "expired", "cancelled", "transfered"],
        default: "actived"
    },
    expiredIn: Date,
    Amount: {
        type: Number,
        min: 0
    }
})
module.exports = new mongoose.model('reservation', cartSchema)