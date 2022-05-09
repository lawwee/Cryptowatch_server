const express = require('express');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

const watchlistControl = require('../controllers/watchlist');

router.get('/watchlist', isAuth, watchlistControl.fullWatchlist);

router.post('/addwatchlist/:coin', isAuth, watchlistControl.addToWatchlist);

router.get('/watchlist/:coin', isAuth, watchlistControl.watchlistcoindetails);

router.delete('/watchlist/:coin', isAuth, watchlistControl.deletefromwatchlist);

module.exports = router;