const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { auth, admin } = require('../middleware/auth');

router.post('/', auth, bookingController.createBooking);
router.get('/seats/booked', bookingController.getBookedSeats);
router.get('/user/:userId', auth, bookingController.getUserBookings);
router.get('/all', auth, admin, bookingController.getAllBookings); // Admin
router.get('/pnr/:pnr', bookingController.getBookingByPnr);
router.get('/:id', auth, bookingController.getBookingById);
router.get('/:id/download', auth, bookingController.getBookingPDF);
router.post('/cancel/:id', auth, bookingController.cancelBooking);
router.delete('/:id', auth, bookingController.deleteBooking);
router.delete('/admin/:id', auth, admin, bookingController.deleteBookingAdmin);
router.post('/admin/confirm-wl/:id', auth, admin, bookingController.confirmWaitlistAdmin);

module.exports = router;
