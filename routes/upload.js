var express = require("express");
var router = express.Router();
let { uploadImage, uploadExcel } = require('../utils/upload')
let path = require('path')
let exceljs = require('exceljs')
let categoryModel = require('../schemas/categories');
let productModel = require('../schemas/products')
let inventoryModel = require('../schemas/inventories')
let userModel = require('../schemas/users')
let roleModel = require('../schemas/roles')
let mongoose = require('mongoose')
let slugify = require('slugify')
let { RandomToken } = require('../utils/GenToken')
let { sendAccountPasswordMail } = require('../utils/senMailHandler')

function getCellText(cellValue) {
    if (cellValue === null || cellValue === undefined) {
        return '';
    }
    if (typeof cellValue === 'object') {
        if (Array.isArray(cellValue.richText)) {
            return cellValue.richText.map(item => item.text).join('').trim();
        }
        if (cellValue.text) {
            return String(cellValue.text).trim();
        }
        if (cellValue.result) {
            return String(cellValue.result).trim();
        }
    }
    return String(cellValue).trim();
}

router.post('/one_file', uploadImage.single('file'), function (req, res, next) {
    if (!req.file) {
        res.status(404).send({
            message: "file khong duoc de trong"
        })
        return
    }
    res.send({
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
    })
})
router.post('/multiple_file', uploadImage.array('files'), function (req, res, next) {
    if (!req.files) {
        res.status(404).send({
            message: "file khong duoc de trong"
        })
        return
    }
    res.send(req.files.map(f => {
        return {
            filename: f.filename,
            path: f.path,
            size: f.size
        }
    }))
})
router.get('/:filename', function (req, res, next) {
    let pathFile = path.join(__dirname, "../uploads", req.params.filename);
    res.sendFile(pathFile)
})
router.post('/excel', uploadExcel.single('file'), async function (req, res, next) {
    //workbook->worksheet->row/column->cell
    let workbook = new exceljs.Workbook();
    let pathFile = path.join(__dirname, "../uploads", req.file.filename);
    await workbook.xlsx.readFile(pathFile)
    let worksheet = workbook.worksheets[0];
    let result = [];
    let categories = await categoryModel.find({});
    let categoriesMap = new Map();
    for (const category of categories) {
        categoriesMap.set(category.name, category._id)
    }
    let products = await productModel.find({});
    let getTitle = products.map(p => p.title);
    let getSku = products.map(p => p.sku)
    for (let row = 2; row <= worksheet.rowCount; row++) {
        let rowErrors = [];
        const cells = worksheet.getRow(row);
        let sku = cells.getCell(1).value;
        let title = cells.getCell(2).value;
        let category = cells.getCell(3).value;//hop le
        let price = Number.parseInt(cells.getCell(4).value);
        let stock = Number.parseInt(cells.getCell(5).value);
        if (price < 0 || isNaN(price)) {
            rowErrors.push("price phai so duong")
        }
        if (stock < 0 || isNaN(stock)) {
            rowErrors.push("stock phai so duong")
        }
        if (!categoriesMap.has(category)) {
            rowErrors.push('category khong hop le')
        }
        if (getTitle.includes(title)) {
            rowErrors.push('title da ton tai')
        }
        if (getSku.includes(sku)) {
            rowErrors.push('sku da ton tai')
        }
        if (rowErrors.length > 0) {
            result.push(rowErrors);
            continue;
        }
        let session = await mongoose.startSession();
        session.startTransaction()
        try {
            let newObj = new productModel({
                sku:sku,
                title: title,
                slug: slugify(title, {
                    replacement: '-', lower: true, locale: 'vi',
                }),
                price: price,
                description: title,
                category: categoriesMap.get(category)
            })
            await newObj.save({ session })
            let newInventory = new inventoryModel({
                product: newObj._id,
                stock: stock
            })
            await newInventory.save({ session })
            await session.commitTransaction();
            await session.endSession()
            await newInventory.populate('product')
            getSku.push(sku);
            getTitle.push(title)
            result.push(newInventory);
        } catch (error) {
            await session.abortTransaction();
            await session.endSession()
            result.push(error.message);
        }
        //khong co loi
    }
    res.send(result)
})

router.post('/users', uploadExcel.single('file'), async function (req, res, next) {
    if (!req.file) {
        return res.status(400).send({
            message: 'file khong duoc de trong'
        });
    }

    let workbook = new exceljs.Workbook();
    let pathFile = path.join(__dirname, '../uploads', req.file.filename);
    await workbook.xlsx.readFile(pathFile);
    let worksheet = workbook.worksheets[0];

    if (!worksheet || worksheet.rowCount < 2) {
        return res.status(400).send({
            message: 'file excel khong co du lieu hop le'
        });
    }

    let userRole = await roleModel.findOne({
        name: { $regex: /^user$/i },
        isDeleted: false
    });

    if (!userRole) {
        return res.status(400).send({
            message: 'khong tim thay role user'
        });
    }

    let existingUsers = await userModel.find({ isDeleted: false }).select('username email');
    let existingUsernameSet = new Set(existingUsers.map(item => item.username));
    let existingEmailSet = new Set(existingUsers.map(item => item.email));
    let importedUsernameSet = new Set();
    let importedEmailSet = new Set();

    let result = [];
    let emailRegex = /^\S+@\S+\.\S+$/;

    for (let row = 2; row <= worksheet.rowCount; row++) {
        let rowErrors = [];
        const cells = worksheet.getRow(row);
        let username = getCellText(cells.getCell(1).value);
        let email = getCellText(cells.getCell(2).value).toLowerCase();

        if (!username) {
            rowErrors.push('username khong duoc de trong');
        }
        if (!email) {
            rowErrors.push('email khong duoc de trong');
        } else if (!emailRegex.test(email)) {
            rowErrors.push('email khong hop le');
        }
        if (existingUsernameSet.has(username) || importedUsernameSet.has(username)) {
            rowErrors.push('username da ton tai');
        }
        if (existingEmailSet.has(email) || importedEmailSet.has(email)) {
            rowErrors.push('email da ton tai');
        }

        if (rowErrors.length > 0) {
            result.push({
                row: row,
                username: username,
                email: email,
                status: 'failed',
                errors: rowErrors
            });
            continue;
        }

        let password = RandomToken(16);
        try {
            let newUser = new userModel({
                username: username,
                password: password,
                email: email,
                role: userRole._id
            });
            await newUser.save();
            await sendAccountPasswordMail(email, username, password);

            existingUsernameSet.add(username);
            existingEmailSet.add(email);
            importedUsernameSet.add(username);
            importedEmailSet.add(email);

            result.push({
                row: row,
                username: username,
                email: email,
                status: 'success'
            });
        } catch (error) {
            result.push({
                row: row,
                username: username,
                email: email,
                status: 'failed',
                errors: [error.message]
            });
        }
    }

    res.send({
        totalRows: Math.max(worksheet.rowCount - 1, 0),
        success: result.filter(item => item.status === 'success').length,
        failed: result.filter(item => item.status === 'failed').length,
        result: result
    });
})



module.exports = router;