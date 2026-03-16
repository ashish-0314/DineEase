const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
    try {
        const { restaurantId, date, timeSlot, numberOfGuests, specialRequest, preOrderedItems, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Payment details missing. Please complete payment.' });
        }

        // Verify Razorpay Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret')
            .update(body.toString())
            .digest('hex');

        // We will only mock fail if keys aren't set
        if (expectedSignature !== razorpay_signature && process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret') {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Convert date string to Date object
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);

        // Find all active bookings for this restaurant, date, and time slot
        const activeBookings = await Booking.find({
            restaurantId,
            date: bookingDate,
            timeSlot,
            status: { $ne: 'cancelled' }
        });

        // Calculate currently booked tables
        let bookedTables = 0;
        activeBookings.forEach(booking => {
            // Assuming each booking takes Math.ceil(guests / seatsPerTable) tables
            bookedTables += Math.ceil(booking.numberOfGuests / restaurant.tables.seatsPerTable);
        });

        const requestedTables = Math.ceil(numberOfGuests / restaurant.tables.seatsPerTable);

        if (bookedTables + requestedTables > restaurant.tables.total) {
            return res.status(400).json({ message: 'No tables available for this time slot' });
        }

        // Create booking
        const booking = new Booking({
            userId: req.user._id,
            restaurantId,
            date: bookingDate,
            timeSlot,
            numberOfGuests,
            specialRequest,
            preOrderedItems: preOrderedItems || [],
            payment: {
                status: 'paid',
                transactionId: razorpay_payment_id,
                orderId: razorpay_order_id
            },
            status: 'confirmed'
        });

        const savedBooking = await booking.save();

        // Find Owner to notify them as well
        const owner = await User.findById(restaurant.ownerId);

        // Generate Pre-order HTML string for the email
        let preOrderHtml = '';
        if (preOrderedItems && preOrderedItems.length > 0) {
            preOrderHtml = `
                <h3>Pre-ordered Menu Items:</h3>
                <ul>
                    ${preOrderedItems.map(item => `<li>${item.quantity}x ${item.name} ($${item.price})</li>`).join('')}
                </ul>
            `;
        }

        // 1. Send Email to Diner
        const user = await User.findById(req.user._id);
        if (user && user.email) {
            const subjectToDiner = `Booking Confirmed: ${restaurant.name}`;
            const htmlToDiner = `
                <h2>Your table is confirmed!</h2>
                <p>Hello ${user.name}, your table at <strong>${restaurant.name}</strong> is booked.</p>
                <ul>
                    <li><strong>Date:</strong> ${new Date(bookingDate).toDateString()}</li>
                    <li><strong>Time:</strong> ${timeSlot}</li>
                    <li><strong>Guests:</strong> ${numberOfGuests}</li>
                </ul>
                ${preOrderHtml}
                <p>Thank you for using DineEase!</p>
            `;
            await sendEmail(user.email, subjectToDiner, htmlToDiner);
        }

        // 2. Send Email to Restaurant Owner
        if (owner && owner.email) {
            const subjectToOwner = `New Booking Received: ${timeSlot} on ${new Date(bookingDate).toDateString()}`;
            const htmlToOwner = `
                <h2>New Table Reservation</h2>
                <p>You have a new booking from <strong>${user.name}</strong>.</p>
                <ul>
                    <li><strong>Date:</strong> ${new Date(bookingDate).toDateString()}</li>
                    <li><strong>Time:</strong> ${timeSlot}</li>
                    <li><strong>Guests:</strong> ${numberOfGuests}</li>
                    <li><strong>Special Request:</strong> ${specialRequest || 'None'}</li>
                </ul>
                ${preOrderHtml}
                <p>Log into your Owner Dashboard to view more details.</p>
            `;
            await sendEmail(owner.email, subjectToOwner, htmlToOwner);
        }

        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).populate('restaurantId', 'name images location');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get restaurant bookings (Owner)
// @route   GET /api/bookings/restaurant/:id
// @access  Private (Owner)
const getRestaurantBookings = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant || restaurant.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const bookings = await Booking.find({ restaurantId: req.params.id }).populate('userId', 'name email');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Razorpay Order
// @route   POST /api/bookings/create-order
// @access  Private
const createOrder = async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('your_')) {
            // Return a mock order for dev mode if keys are not set
            return res.status(200).json({ id: 'order_dev_' + Date.now(), amount: 10000, currency: 'INR' });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: 100 * 100, // ₹100 in paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getRestaurantBookings,
    cancelBooking,
    createOrder
};
