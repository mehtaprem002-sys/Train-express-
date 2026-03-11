const mongoose = require('mongoose');
const Train = require('./models/Train');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const fixData = async () => {
    await connectDB();

    try {
        // 1. Fix Vande Bharat
        const vandeResult = await Train.updateMany(
            { $or: [{ type: 'Vande Bharat' }, { name: /Vande/i }] },
            { $set: { classes: ['CC', 'EC'] } }
        );
        console.log(`Updated ${vandeResult.modifiedCount} Vande Bharat trains to have [CC, EC]`);

        // 2. Fix Rajdhani (Remove SL)
        // Rajdhani typically has 3A, 2A, 1A. Sometimes 3E.
        const rajdhaniResult = await Train.updateMany(
            { type: 'Rajdhani' },
            { $set: { classes: ['3A', '2A', '1A'] } }
        );
        console.log(`Updated ${rajdhaniResult.modifiedCount} Rajdhani trains to have [3A, 2A, 1A]`);

        // 3. Fix Shatabdi (Usually CC, EC, EA)
        const shatabdiResult = await Train.updateMany(
            { type: 'Shatabdi' },
            { $set: { classes: ['CC', 'EC'] } }
        );
        console.log(`Updated ${shatabdiResult.modifiedCount} Shatabdi trains to have [CC, EC]`);

    } catch (error) {
        console.error('Error updating data:', error);
    } finally {
        mongoose.disconnect();
    }
};

fixData();
