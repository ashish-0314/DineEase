const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getRestaurantBookings,
    cancelBooking,
    createOrder
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, createBooking);
router.post('/create-order', protect, createOrder);
router.get('/my', protect, getMyBookings);
router.get('/restaurant/:id', protect, authorize('owner', 'admin'), getRestaurantBookings);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
