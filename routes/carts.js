var express = require('express');
const { route } = require('./products');
var router = express.Router();
let { checkLogin } = require('../utils/authHandler')
let cartSchema = require('../schemas/carts')
let inventorySchema = require('../schemas/inventories')

router.get('/', checkLogin, async function (req, res, next) {
    let user = req.user;
    let cart = await cartSchema.findOne({
        user: user._id
    })
    res.send(cart)
})
router.post('/add', checkLogin, async function (req, res, next) {
    let { product, quantity } = req.body;
    let user = req.user;
    let cart = await cartSchema.findOne({
        user: user._id
    })
    let inventoryOfProduct = await inventorySchema.findOne({
        product: product
    })
    if (!inventoryOfProduct) {
        res.status(404).send({
            message: "khong ton tai product"
        })
        return;
    }
    let index = cart.products.findIndex(
        function (e) {
            return e.product == product
        }
    )
    if (index < 0) {
        if (inventoryOfProduct.stock >= quantity) {
            cart.products.push({
                product: product,
                quantity: quantity
            })
        } else {
            res.status(404).send({
                message: "so luong san phan trong kho khong du"
            })
            return;
        }
    } else {
        if (inventoryOfProduct.stock >= (cart.products[index].quantity + quantity)) {
            cart.products[index].quantity += quantity
        } else {
            res.status(404).send({
                message: "so luong san phan trong kho khong du"
            })
            return;
        }
    }
    await cart.save()
    res.send(cart)
})
//push - pop
//shift-unshift
router.post('/remove', checkLogin, async function (req, res, next) {
    let { product, quantity } = req.body;
    let user = req.user;
    let cart = await cartSchema.findOne({
        user: user._id
    })
    let inventoryOfProduct = await inventorySchema.findOne({
        product: product
    })
    if (!inventoryOfProduct) {
        res.status(404).send({
            message: "khong ton tai product"
        })
        return;
    }
    let index = cart.products.findIndex(
        function (e) {
            return e.product == product
        }
    )
    if (index < 0) {
        res.status(404).send({
            message: "trong gio hang khong co san pham nay"
        })
        return;
    } else {
        if (cart.products[index].quantity > quantity) {
            cart.products[index].quantity -= quantity;
        } else {
            if (cart.products[index].quantity == quantity) {
                cart.products.splice(index, 1)
            } else {
                res.status(404).send({
                    message: "gio hang khong co du so luong"
                })
                return;
            }
        }
    }
    await cart.save()
    res.send(cart)
})
module.exports = router;