const express = require('express');
const router = express.Router();
const { createReview, getRestaurantReviews, deleteReview, checkReviewEligibility } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/', protect, upload.single('image'), createReview);
router.get('/restaurant/:id', getRestaurantReviews);
router.delete('/:id', protect, deleteReview);
router.get('/eligibility/:restaurantId', protect, checkReviewEligibility);

module.exports = router;
