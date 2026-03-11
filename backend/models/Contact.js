const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true,
        default: 'General Inquiry'
    },
    message: {
        type: String,
        required: true
    },
    reply: {
        type: String,
        default: ''
    },
    repliedAt: {
        type: Date
    },
    userReply: {
        type: String,
        default: ''
    },
    userRepliedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'replied', 'user-replied'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
