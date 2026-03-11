const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

connectDB(); // Connect to MongoDB

const authRoutes = require('./routes/auth.routes');
const trainRoutes = require('./routes/train.routes');
const bookingRoutes = require('./routes/booking.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Basic health check
app.get('/', (req, res) => {
    res.send('Train Express API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/payments', require('./routes/payment.routes'));


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
