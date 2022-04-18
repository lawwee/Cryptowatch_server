const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

const authRoutes = require('./routes/auth');

const MONGODB_URL = 
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.vuuxv.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        `GET, POST, PUT, PATCH, DELETE`
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(bodyparser.json());

app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data});
});

mongoose.connect(MONGODB_URL)
    .then(result => {
        app.listen(8080);
    })
    .catch(err => console.log(err));