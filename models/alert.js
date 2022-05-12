const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const alertSchema = new Schema({
    coinId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    alertType: {
        type: String,
        enum: [ 'HIGH', 'LOW' ],
        required: true
    },
    user: {
        // type: String,
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }

})

module.exports = mongoose.model('Alert', alertSchema);