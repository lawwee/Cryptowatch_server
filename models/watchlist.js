const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const watchlistSchema = new Schema ({
    coinId: {
        type: String,
        required: true
    },
    user: {
        // type: String,
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Watchlist', watchlistSchema);