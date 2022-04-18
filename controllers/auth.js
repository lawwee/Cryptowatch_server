const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../util/sendmail');

exports.signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        console.log(err);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password =  req.body.password;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            email: email,
            password: hashedPassword
        });
        const result = await user.save();
        res.status(201).json({ message: 'User created', userId: result._id });
    } catch (err) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong Password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'peterparkermilesmoralesgwenstaceymaryjaneharryosborn',
            { expiresIn: '1h' }
        );
        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString()
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        next(err);
    }
};

exports.resetPin = async (req, res, next) => {
    try{
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                console.log(err);
            }
            const token = buffer.toString('hex');
        })
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            const error = new Error('Email not found');
            error.statusCode = 401;
            throw error;
        }
        user.resetToken = token;
        // time is in miliseconds
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        const result = await sendEmail({
            to: req.body.email,
            subject: 'Password Reset',
            html: `
            <p> You requested a password reset </p>
            <p> Click this <a href="URL/${token}">link</a> to set a new password.</p>
        `
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        next(err);
    }
};

exports.getNewPass = async (req, res, next) => {
    const token = req.params.token;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        next(err);
    }
};

exports.postNewPass = async (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    try {
        const user = await User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId
        })
        resetUser = user;
        await bcrypt.hash(newPassword, 12);
        const result = hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
        }
        resetUser.save();
    } catch (err) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        next(err);
    }
}