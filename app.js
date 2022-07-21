const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
require('dotenv').config();
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const authRoutes = require('./routes/auth');
const feedRoutes = require('./routes/feed');
const watchlistRoutes = require('./routes/watchlist');
const alertRoutes = require('./routes/alert');

const MONGODB_URI = 
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cryptowatch.rsniqey.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})
app.use(session({ 
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.get('/', (req, res) => {
    res.send('Hello World')
});

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
)

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

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
app.use('/feed', feedRoutes);
app.use('/watchlist', watchlistRoutes);
app.use('/notify', alertRoutes);

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
})

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next;
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });  
});

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data});
});

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(process.env.PORT || 8080);
    })
    .catch(err => console.log(err));