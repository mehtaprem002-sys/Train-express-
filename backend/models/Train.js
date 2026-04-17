const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
    baseId: Number,
    trainNo: String, // Explicit mapping if needed, or just use number
    name: { type: String, required: true },
    number: { type: String, required: true, unique: true },
    type: String,
    from: String,
    to: String,
    from_code: String,
    to_code: String,
    departureTime: String,
    arrivalTime: String,
    duration: String,
    distance: Number,
    runsOn: [String],
    classes: [String],
    pantry: { type: Boolean, default: false },
    availableSeats: { type: Number, default: null },
    waitlistSeats: { type: Number, default: null },
    basePrice: Number, // Add basePrice field
    route: [String], // Array of station codes
    schedule: [{
        station: String,
        code: String,
        departure: String,
        arrival: String,
        distanceFromStart: Number
    }],
    overrides: [{
        date: String,
        classType: String,
        availableSeats: { type: Number, default: null },
        waitlistSeats: { type: Number, default: null },
        price: { type: Number, default: null }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Train', trainSchema);
