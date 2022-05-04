const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/user');
const sendEmail = require('../util/sendmail');
const { token } = require('morgan');

exports.signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        console.log(error);
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
            `${process.env.JWT_TOKEN}`,
            { expiresIn: '1h' }
        );
        res.status(200).json({
            message: 'logged in successfully',
            token: token,
            userId: loadedUser._id.toString()
        });
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save((err) => {
            console.log(err);
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        next(err);
    }
};

exports.resetPin = async (req, res, next) => {
    const email = req.body.email;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
        }
        const token = buffer.toString('hex');
        User.findOne({ email: email })
            .then(user => {
                if(!user) {
                    const error = new Error('Email not found');
                    error.statusCode = 401;
                    throw error;
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.status(200).json({
                    message: 'requested a password change',
                    token: token,
                });
                sendEmail({
                    to: email,
                    subject: 'Password Reset',
                    html: `
                        <p> You requested a password reset </p>
                        <p> Click this <a href="http://localhost:8080/auth/reset/${token}">link</a> to set a new password.</p>
                    `
                })       
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statuscode = 500;
                }
                next(err);
            })
    });
};

exports.getNewPass = async (req, res, next) => {
    const token = req.params.token;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });
        res.status(200).json({
            message: 'new password request',
        });
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
    const passwordToken = req.body.token;
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
            resetUser.save();
        };
        res.status(200).json({ message: 'password changed'});
    } catch (err) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        next(err);
    }
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
    });
    res.status(200).json({ message: 'logged out' });
};

