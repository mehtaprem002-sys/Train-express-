const mongoose = require('mongoose');

async function clearBookings() {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('bookings').deleteMany({});
        console.log(`Deleted ${result.deletedCount} bookings.`);

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

clearBookings();
