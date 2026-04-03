var express = require('express');
var router = express.Router();
let slugify = require('slugify')
let productSchema = require('../schemas/products')
let inventorySchema = require('../schemas/inventories')
let mongoose = require('mongoose')

/* GET users listing. */
///api/v1/products
router.get('/', async function (req, res, next) {
  let titleQ = req.query.title ? req.query.title : '';
  let maxPrice = req.query.maxPrice ? req.query.maxPrice : 1E4;
  let minPrice = req.query.minPrice ? req.query.minPrice : 0;
  //let categoryName = req.query.category ? req.query.category : '';
  let data = await productSchema.find({}).populate({ path: 'category', select: 'name images' })
  let result = data.filter(function (e) {
    return (!e.isDeleted) &&
      e.title.toLowerCase().includes(titleQ.toLowerCase())
      && e.price > minPrice
      && e.price < maxPrice
    //&& e.category.name.toLowerCase().includes(categoryName.toLowerCase())
  })
  res.send(result);
});
router.get('/slug/:slug', async function (req, res, next) {
  let slug = req.params.slug;
  let result = await productSchema.findOne({
    slug: slug
  })
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "SLUG NOT FOUND"
    })
  }
});
///api/v1/products/1
router.get('/:id', async function (req, res, next) {
  try {
    let result = await productSchema.findOne(
      { _id: req.params.id && isDeleted }
    );
    if (result) {
      res.status(200).send(result)
    } else {
      res.status(404).send({
        message: "ID NOT FOUND"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
});
router.post('/', async function (req, res, next) {
  let session = await mongoose.startSession();
  session.startTransaction()
  try {
    let newObj = new productSchema({
      title: req.body.title,
      slug: slugify(req.body.title, {
        replacement: '-', lower: true, locale: 'vi',
      }),
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      images: req.body.images
    })
    await newObj.save({ session })
    console.log(newObj);
    let newInventory = new inventorySchema({
      product: newObj._id
    })
    await newInventory.save({ session })
    await session.commitTransaction();
    await session.endSession()
    await newInventory.populate('product')
    res.send(newInventory);
  } catch (error) {
    await session.abortTransaction();
    await session.endSession()
    res.status(404).send(error.message);
  }
})


router.put('/:id', async function (req, res, next) {
  try {
    // let result = await productSchema.findOne(
    //   { _id: req.params.id }
    // );
    // if (result) {
    //   //res.status(200).send(result)
    //   let keys = Object.keys(req.body);
    //   for (const key of keys) {
    //     result[key] = req.body[key];
    //   }
    //   await result.save();
    //   res.status(200).send(result)
    // } else {
    //   res.status(404).send({
    //     message: "ID NOT FOUND"
    //   })
    // }


    let result = await productSchema.findByIdAndUpdate(req.params.id,
      req.body, {
      new: true
    })
    res.status(200).send(result)
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})
router.delete('/:id', async function (req, res, next) {
  try {
    let result = await productSchema.findByIdAndUpdate(req.params.id,
      { isDeleted: true }, {
      new: true
    })
    res.status(200).send(result)
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})

module.exports = router;
