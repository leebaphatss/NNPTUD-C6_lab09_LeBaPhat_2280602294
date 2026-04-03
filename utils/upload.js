let multer = require('multer')
let path = require('path')
//luu o dau?luu file ten la gi ?
let storageSetting = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        //filename = name + ext
        let ext = path.extname(file.originalname)
        let name = Date.now() + "-" + Math.round(Math.random() * 2000_000_000) + ext;
        cb(null, name)
    }
})
let filterImage = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new Error("file dinh dang khong dung"))
    }
}
let filterExcel = function (req, file, cb) {
    if (file.mimetype.includes('spreadsheetml')) {
        cb(null, true)
    } else {
        cb(new Error("file dinh dang khong dung"))
    }
}
module.exports = {
    uploadImage: multer({
        storage: storageSetting,
        limits: 5 * 1024 * 1024,
        fileFilter: filterImage
    }),
    uploadExcel: multer({
        storage: storageSetting,
        limits: 5 * 1024 * 1024,
        fileFilter: filterExcel
    }),
    uploadAny: multer({
        storage: storageSetting,
        limits: 10 * 1024 * 1024
    })
}