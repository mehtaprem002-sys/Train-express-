const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    trainNumber: {
        type: String,
        required: true
    },
    date: {
        type: String, // 'YYYY-MM-DD'
        required: true
    },
    classes: {
        type: Map,
        of: new mongoose.Schema({
            status: String,
            count: Number,
            text: String,
            color: String,
            bg: String
        }, { _id: false })
    }
}, { timestamps: true });

// Compound index for fast lookups
availabilitySchema.index({ trainNumber: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
