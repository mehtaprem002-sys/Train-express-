const mongoose = require('mongoose');

async function checkBookings() {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        console.log('Connected to MongoDB');

        const Booking = mongoose.model('Booking', new mongoose.Schema({
            status: String,
            paymentDetails: Object
        }), 'bookings');

        const bookings = await Booking.find({});
        console.log(`Total Bookings: ${bookings.length}`);

        const statuses = bookings.reduce((acc, b) => {
            acc[b.status] = (acc[b.status] || 0) + 1;
            return acc;
        }, {});
        console.log('Statuses:', statuses);

        const revenue = bookings
            .filter(b => b.status !== 'Cancelled')
            .reduce((sum, b) => sum + (b.paymentDetails?.amount || 0), 0);
        console.log('Calculated Revenue:', revenue);

        const activeBookings = bookings.filter(b => b.status !== 'Cancelled').length;
        console.log('Active Bookings:', activeBookings);

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkBookings();
