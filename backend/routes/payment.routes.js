const express = require('express');
const router = express.Router();
const PaymentIntent = require('../models/PaymentIntent');
const os = require('os');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Create a new intent
router.post('/intent', async (req, res) => {
    try {
        const intent = new PaymentIntent({ bookingData: req.body });
        await intent.save();
        res.status(201).json({ id: intent._id, localIp: getLocalIp() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Get intent status
router.get('/intent/:id', async (req, res) => {
    try {
        const intent = await PaymentIntent.findById(req.params.id);
        if (!intent) return res.status(404).json({ error: 'Not found' });
        res.json({ status: intent.status, bookingData: intent.bookingData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Complete intent
router.post('/intent/:id/complete', async (req, res) => {
    try {
        const intent = await PaymentIntent.findById(req.params.id);
        if (!intent) return res.status(404).json({ error: 'Not found' });
        intent.status = 'completed';
        await intent.save();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
