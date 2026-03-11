const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Male'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    savedTravelers: [{
        name: String,
        age: Number,
        gender: { type: String, enum: ['Male', 'Female', 'Other'] }
    }],
    preferences: {
        berth: { type: String, enum: ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'No Preference'], default: 'No Preference' },
        food: { type: String, enum: ['Veg', 'Non-Veg', 'No Food'], default: 'Veg' }
    },
    lastLogin: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
