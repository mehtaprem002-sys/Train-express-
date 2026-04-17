const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        id: String,
        name: String,
        email: String
    },
    train: {
        number: String,
        name: String,
        from: String,
        to: String,
        date: String,
        departure: String,
        arrival: String
    },
    date: {
        type: String, // Explicit top-level date in YYYY-MM-DD format
    },
    passengers: [{
        name: String,
        age: Number,
        gender: String,
        coach: String,
        seatNumber: Number,
        berth: Number,
        berthType: String,
        status: String
    }],
    pnr: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        default: 'Confirmed'
    },
    class: {
        type: mongoose.Schema.Types.Mixed, // Allow object or string
    },
    paymentDetails: {
        method: String,
        amount: Number,
        currency: String,
        paymentId: String,
        date: String
    },
    cancellationDetails: {
        date: Date,
        penalty: Number,
        refundAmount: Number,
        reason: String
    },
    hidden: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
