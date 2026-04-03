let userModel = require('../schemas/users');

module.exports = {
    CreateAnUser: function (username, password,
        email, role, fullname, avatar, status, logincount) {
        return new userModel(
            {
                username: username,
                password: password,
                email: email,
                fullName: fullname,
                avatarUrl: avatar,
                status: status,
                role: role,
                loginCount: logincount
            }
        )
    },
    FindByUsername: async function (username) {
        return await userModel.findOne({
            username: username,
            isDeleted: false
        })
    }, 
    FindByEmail: async function (email) {
        return await userModel.findOne({
            email: email,
            isDeleted: false
        })
    },
    FindByToken: async function (token) {
        return await userModel.findOne({
            resetPasswordToken: token,
            isDeleted: false
        })
    },
    FailLogin: async function (user) {
        user.loginCount++;
        if (user.loginCount == 3) {
            user.loginCount = 0;
            user.lockTime = new Date(Date.now() + 60 * 60 * 1000)
        }
        await user.save()
    },
    SuccessLogin: async function (user) {
        user.loginCount = 0;
        await user.save()
    },
    GetAllUser: async function () {
        return await userModel
            .find({ isDeleted: false }).populate({
                path: 'role',
                select: 'name'
            })
    },
    FindById: async function (id) {
        try {
            let getUser = await userModel
                .findOne({ isDeleted: false, _id: id }).populate({
                    path: 'role',
                    select: 'name'
                })
            return getUser;
        } catch (error) {
            return false
        }
    }
}