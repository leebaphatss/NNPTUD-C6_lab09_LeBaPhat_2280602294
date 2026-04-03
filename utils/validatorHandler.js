let { body, validationResult } = require('express-validator')

let options = {
    password: {
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1
    }
}

module.exports = {
    userCreateValidator: [
        body('email').notEmpty().withMessage("Email khong duoc rong").isEmail().withMessage('email sai dinh dang'),
        body('username').isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
        body('password').isStrongPassword(options.password).withMessage(`password dai it nhat ${options.password.minLength} ki tu, trong do co it nhat ${options.password.minNumbers} so ${options.password.minUppercase} chu hoa ${options.password.minLowercase} chu thuong ${options.password.minSymbols} ki tu dac biet`),
    ],
    userUpdateValidator: [
        body('email').optional({
            checkFalsy: true
        }).isEmail().withMessage('email sai dinh dang').normalizeEmail(),
        body('username').optional().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
        body('password').isStrongPassword(options.password).withMessage(`password dai it nhat ${options.password.minLength} ki tu, trong do co it nhat ${options.password.minNumbers} so ${options.password.minUppercase} chu hoa ${options.password.minLowercase} chu thuong ${options.password.minSymbols} ki tu dac biet`),
    ],
    RegisterValidator: [
        body('email').notEmpty().withMessage("email khong duoc rong").bail().isEmail().withMessage('email sai dinh dang').normalizeEmail(),
        body('username').notEmpty().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
        body('password').notEmpty().withMessage().isStrongPassword(options.password).withMessage(`password dai it nhat ${options.password.minLength} ki tu, trong do co it nhat ${options.password.minNumbers} so ${options.password.minUppercase} chu hoa ${options.password.minLowercase} chu thuong ${options.password.minSymbols} ki tu dac biet`),
    ]
    ,
        ChangPasswordValidator: [
        body('oldpassword').notEmpty().withMessage("old password khong duoc de trong"),
        body('newpassword').notEmpty().withMessage("new password khong duoc de trong").bail().isStrongPassword(options.password).withMessage(`password dai it nhat ${options.password.minLength} ki tu, trong do co it nhat ${options.password.minNumbers} so ${options.password.minUppercase} chu hoa ${options.password.minLowercase} chu thuong ${options.password.minSymbols} ki tu dac biet`),
    ]
    ,
    handleResultValidator: function (req, res, next) {
        let result = validationResult(req);
        if (result.errors.length > 0) {
            res.status(404).send(result.errors.map(e => {
                return e.msg
            }))
            return;
        }
        next();
    }
}