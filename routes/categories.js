var express = require('express');
var router = express.Router();
let slugify = require('slugify')
let categorySchema = require('../schemas/categories')
//mongoose --- mongoDB

/* GET users listing. */
///api/v1/products
router.get('/', async function (req, res, next) {
  //let categoryName = req.query.category ? req.query.category : '';
  let data = await categorySchema.find({})
  let result = data.filter(function (e) {
    return (!e.isDeleted)
  })
  res.send(result);
});
router.get('/slug/:slug', async function (req, res, next) {
  let slug = req.params.slug;
  let result = await categorySchema.findOne({
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
    let result = await categorySchema.findOne(
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
  try {
    let newObj = new categorySchema({
      name: req.body.name,
      slug: slugify(req.body.name, {
        replacement: '-', lower: true, locale: 'vi',
      }),
      description: req.body.description,
      images: req.body.images
    })
    await newObj.save()
    res.send(newObj);
  } catch (error) {
    res.status(404).send(error.message);
  }
})
router.put('/:id', async function (req, res, next) {
  try {
    // let result = await categorySchema.findOne(
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


    let result = await categorySchema.findByIdAndUpdate(req.params.id,
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
    let result = await categorySchema.findByIdAndUpdate(req.params.id,
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
