const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const upload = require('../middlewares/uploadMiddleware');
const { uploadToImageKit } = require('./restaurantController'); // Assuming we centralize ImageKit or duplicate logic

const imagekit = require('../services/imageKitService');
const uploadMedia = async (fileBuffer, fileName) => {
    return new Promise((resolve, reject) => {
        imagekit.upload({
            file: fileBuffer,
            fileName: fileName,
            folder: '/dineease/reviews'
        }, (error, result) => {
            if (error) reject(error);
            else resolve(result.url);
        });
    });
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { restaurantId, rating, comment } = req.body;

        // Genuine Review Check
        const hasBooked = await Booking.findOne({
            userId: req.user._id,
            restaurantId,
            status: { $in: ['confirmed', 'completed'] }
        });

        if (!hasBooked && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only review restaurants you have booked a table with.' });
        }

        let imageUrl = '';

        if (req.file) {
            imageUrl = await uploadMedia(req.file.buffer, req.file.originalname);
        }

        const review = await Review.create({
            userId: req.user._id,
            restaurantId,
            rating: Number(rating),
            comment,
            image: imageUrl
        });

        // Update restaurant rating
        const reviews = await Review.find({ restaurantId });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await Restaurant.findByIdAndUpdate(restaurantId, { rating: avgRating });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:id
// @access  Public
const getRestaurantReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ restaurantId: req.params.id }).populate('userId', 'name');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a review (Admin or Author)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const restaurantId = review.restaurantId;
        await review.deleteOne();

        // Recalculate avg rating
        const reviews = await Review.find({ restaurantId });
        const avgRating = reviews.length > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length : 0;
        await Restaurant.findByIdAndUpdate(restaurantId, { rating: avgRating });

        res.status(200).json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check eligibility for review
// @route   GET /api/reviews/eligibility/:restaurantId
// @access  Private
const checkReviewEligibility = async (req, res) => {
    try {
        const hasBooked = await Booking.findOne({
            userId: req.user._id,
            restaurantId: req.params.restaurantId,
            status: { $in: ['confirmed', 'completed'] }
        });

        const hasReviewed = await Review.findOne({
            userId: req.user._id,
            restaurantId: req.params.restaurantId
        });

        const isEligible = !!hasBooked && !hasReviewed;

        res.status(200).json({ eligible: isEligible, hasReviewed: !!hasReviewed });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getRestaurantReviews,
    deleteReview,
    checkReviewEligibility
};
