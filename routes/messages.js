var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let messageModel = require('../schemas/messages');
let userModel = require('../schemas/users');
let { checkLogin } = require('../utils/authHandler');
let { uploadAny } = require('../utils/upload');

router.get('/', checkLogin, async function (req, res, next) {
    try {
        let currentUserId = req.user._id.toString();
        let allMessages = await messageModel.find({
            $or: [
                { from: req.user._id },
                { to: req.user._id }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('from', 'username email')
            .populate('to', 'username email');

        let latestByPartner = new Map();
        for (const item of allMessages) {
            let partner = item.from._id.toString() === currentUserId
                ? item.to._id.toString()
                : item.from._id.toString();

            if (!latestByPartner.has(partner)) {
                latestByPartner.set(partner, item);
            }
        }

        res.send(Array.from(latestByPartner.values()));
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get('/:userID', checkLogin, async function (req, res, next) {
    let { userID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).send({ message: 'userID khong hop le' });
    }

    try {
        let messages = await messageModel.find({
            $or: [
                { from: req.user._id, to: userID },
                { from: userID, to: req.user._id }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('from', 'username email')
            .populate('to', 'username email');

        res.send(messages);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.post('/', checkLogin, uploadAny.single('file'), async function (req, res, next) {
    let { to, text } = req.body;

    if (!to) {
        return res.status(400).send({ message: 'to khong duoc de trong' });
    }
    if (!mongoose.Types.ObjectId.isValid(to)) {
        return res.status(400).send({ message: 'to khong hop le' });
    }

    let toUser = await userModel.findOne({ _id: to, isDeleted: false });
    if (!toUser) {
        return res.status(404).send({ message: 'nguoi nhan khong ton tai' });
    }

    let contentType = req.file ? 'file' : 'text';
    let contentText = req.file ? req.file.path : (text || '').trim();

    if (!contentText) {
        return res.status(400).send({ message: 'noi dung khong duoc de trong' });
    }

    try {
        let newMessage = new messageModel({
            from: req.user._id,
            to: to,
            messageContent: {
                type: contentType,
                text: contentText
            }
        });

        await newMessage.save();
        await newMessage.populate('from', 'username email');
        await newMessage.populate('to', 'username email');

        res.send(newMessage);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
