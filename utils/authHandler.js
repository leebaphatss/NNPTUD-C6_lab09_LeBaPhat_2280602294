let jwt = require('jsonwebtoken')
let userController = require('../controllers/users')
module.exports = {
    checkLogin: async function (req, res, next) {
        let token
        if (req.cookies.token_login_tungNT) {
            token = req.cookies.token_login_tungNT
        } else {
            token = req.headers.authorization;
            if (!token || !token.startsWith("Bearer")) {
                res.status(403).send("ban chua dang nhap");
            }
            token = token.split(" ")[1];
        }
        try {//private - public
            let result = jwt.verify(token, "secret")
            if (result.exp * 1000 > Date.now()) {
                let user = await userController.FindById(result.id)
                if (!user) {
                    res.status(403).send("ban chua dang nhap");
                } else {
                    req.user = user;
                    next()
                }
            } else {
                res.status(403).send("ban chua dang nhap");
            }
        } catch (error) {
            res.status(403).send("ban chua dang nhap");
        }

    },
    CheckPermission: function (...requiredRole) {
        return function (req, res, next) {
            let role = req.user.role.name;
            console.log(role);
            if (requiredRole.includes(role)) {
                next();
            } else {
                res.status(403).send("ban khong co quyen")
            }
        }
    }
}