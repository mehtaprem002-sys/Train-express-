const mongoose = require('mongoose');

const PaymentIntentSchema = new mongoose.Schema({
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed', 'failed']
    },
    bookingData: {
        type: Object,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentIntent', PaymentIntentSchema);
