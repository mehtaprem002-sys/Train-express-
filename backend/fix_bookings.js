const mongoose = require('mongoose');
const Booking = require('./models/Booking');

const fixBookings = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        console.log('Connected to MongoDB');

        const cancelledBookings = await Booking.find({ status: 'Cancelled' });
        console.log(`Found ${cancelledBookings.length} cancelled bookings.`);

        if (cancelledBookings.length > 0) {
            // Take up to 10 bookings and mark them as Confirmed
            const toFix = cancelledBookings.slice(0, 10);
            for (const booking of toFix) {
                booking.status = 'Confirmed';
                booking.cancellationDetails = undefined;
                await booking.save();
                console.log(`Updated booking ${booking.pnr} to Confirmed`);
            }
            console.log(`Marked ${toFix.length} bookings as Confirmed.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error fixing bookings:', error);
        process.exit(1);
    }
};

fixBookings();
