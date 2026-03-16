const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Approve or Reject a Restaurant
// @route   PUT /api/admin/restaurants/:id/approve
// @access  Private (Admin)
const approveRestaurant = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        restaurant.isApproved = isApproved;
        await restaurant.save();

        res.status(200).json(restaurant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRestaurants = await Restaurant.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const pendingRestaurants = await Restaurant.countDocuments({ isApproved: false });

        res.status(200).json({
            totalUsers,
            totalRestaurants,
            totalBookings,
            pendingRestaurants
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending restaurants
// @route   GET /api/admin/restaurants/pending
// @access  Private (Admin)
const getPendingRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isApproved: false });
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all restaurants
// @route   GET /api/admin/restaurants
// @access  Private (Admin)
const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({}).populate('ownerId', 'name email').sort({ createdAt: -1 });
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    approveRestaurant,
    getStats,
    getPendingRestaurants,
    getAllUsers,
    getAllRestaurants
};
