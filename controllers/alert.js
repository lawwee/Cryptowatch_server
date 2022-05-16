const { count } = require('console');
const fetch = require('node-fetch');
const { validationResult } = require('express-validator');

const Alert = require('../models/alert');
const User = require('../models/user');

exports.allAlerts = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        console.log(error);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    try {
        const totalItems = await Alert.find().countDocuments()
        const alerts = await Alert.find().populate('user');
        res.json({
            totalItems: totalItems,
            alerts: alerts
        })
    } catch (error) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        next(err);
    }
};

exports.addAlert = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        console.log(error);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const { price, type } = req.body;
    const coinId = req.params.coin;
    const user = User.findById(req.userId);
    if (!price || !type) {
        return res.status(400).json({
            message: 'Please provide all required fields'
        })
    }
    const alert = new Alert({
        coinId: coinId,
        price: price,
        alertType: type.toUpperCase(),
        user: req.userId,
        email: user.email,
        createdAt: new Date()
    })
    try {
        await alert.save()
        const user = User.findById(req.userId);
        console.log(user);
        user.alerts.push(alert);
        await user.save();
        res.status(200).json({
            message: 'added successfully',
            alert: alert
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteAlert = async (req, res, next) => {
    const coinId = req.params.coin;
    try {
        const coin = await Alert.findById(coinId);
        if (!coin) {
            const error = new Error('Coin is not part of your alert');
            error.statusCode = 400;
            throw error;
        }
        if (coin.user.toString() !== req.userId) {
            const error = new Error('Not authenticated');
            error.statusCode = 403;
            throw error;
        }
        await Alert.findByIdAndRemove(coinId);

        const user = User.findById(req.userId);
        user.alerts.pull(coinId);
        await user.save();
        res.status(200).json({
            message: 'Removed from Price Alerts'
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
