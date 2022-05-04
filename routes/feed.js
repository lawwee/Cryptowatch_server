const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const feedControl = require('../controllers/feed');

router.get('/allcoins', feedControl.allCoins);

router.get('/onecoin/:coin', feedControl.oneCoin);

module.exports = router;