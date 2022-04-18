const express = require('express');

const router = express.Router();

const authControl = require('../controllers/auth');

router.put('/signup', authControl.signUp);