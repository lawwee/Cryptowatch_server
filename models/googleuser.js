const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema ({
    googleId: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date
});

module.exports = mongoose.model('GoogleUser', userSchema);