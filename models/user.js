const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema ({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    watchlists: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Watchlist'
        }
    ],
    alerts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Alert'
        }
    ]
});

module.exports = mongoose.model('User', userSchema);