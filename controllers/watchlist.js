const { validationResult } = require('express-validator');
const { count } = require('console');
const fetch = require('node-fetch');

const Watchlist = require('../models/watchlist');
const User = require('../models/user');

exports.fullWatchlist = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        console.log(error);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    try {
        const totalItems = await Watchlist.find().countDocuments()
        const watchlists = await Watchlist.find().populate('user');
        res.json({
            watchlists: watchlists,
            totalItems: totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        next(err);
    }
};

exports.addToWatchlist = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        console.log(error);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const coinId = req.params.coin;
    const watchlist = new Watchlist({
        coinId: coinId,
        user: req.userId
    })
    try {
        await watchlist.save();
        const user = User.findById(req.userId);
        user.watchlists.push(watchlist)
        await user.save();
        res.status(200).json({
            message: 'Added successfully',
            watchlist: watchlist,
        });
        console.log('added successfully');
    } catch (err) {
        if (!err.statusCode) {
            err.statuscode = 500;
        }
        next(err);
    }
};

exports.watchlistcoindetails = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        console.log(error);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const coinId = req.params.coin;
    try {
        const COIN_URL = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
        const result = await fetch(COIN_URL);
        const data = await result.json();
        const singleCoin = ({ id, symbol, name, market_data }) =>{
            id = id,
            symbol = symbol,
            name = name
            price = market_data.current_price.usd
            market_cap = market_data.market_cap.usd
            return { id, symbol, name, price, market_cap }
        };
        const one_coin = singleCoin(data);
        // console.log(bust);
        res.status(200).json({ message: 'Coin Retrieved', coinData: one_coin })
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deletefromwatchlist = async (req, res, next) => {
    const coinId = req.params.coin;
    try {
        const coin = await Watchlist.findById(coinId);
        if (!coin) {
            const error = new Error('Coin is not a part of your watchlist');
            error.statusCode = 400;
            throw error;
        }
        if (coin.user.toString() !== req.userId) {
            const error = new Error('Not authenticated');
            error.statusCode = 403;
            throw error;
        }
        await Watchlist.findByIdAndRemove(coinId);

        const user = User.findById(req.userId);
        user.watchlists.pull(coinId);
        await user.save();
        res.status(200).json({
            message: 'Removed from watchlist'
        })
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}