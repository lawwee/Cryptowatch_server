const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');

const router = express.Router();

const User = require('../models/user');
const authControl = require('../controllers/auth');

function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401)
}

router.put(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((value, { req }) => {
                return User
                    .findOne({ email: value })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject('Email already exists')
                        }
                    })
            })
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim()
            .not()
            .isEmpty(),
        body('confirmpassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to Match!');
                }
                return true;
            })
    ],
    authControl.signUp);

router.post('/login', authControl.login);

router.post('/reset', authControl.resetPin);

router.get('/reset/:token', authControl.getNewPass);

router.post('/new-password', authControl.postNewPass);  

router.get('/test', (req, res) => {
    res.send(`<a href="/auth/google">Google Authentication</a>`);
});

router.get(
    '/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })    
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/failure'
    })
)

router.get(
    '/protected',
    isLoggedIn,
    (req, res) => {
        res.send('Logged in bosk')
    }
)

router.get('/failure', (req, res) => {
    res.send('Your attempt failed boss');
});



module.exports = router;
