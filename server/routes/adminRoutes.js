const express = require('express');
const router = express.Router();
const { approveRestaurant, getStats, getPendingRestaurants, getAllUsers, getAllRestaurants } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.put('/restaurants/:id/approve', approveRestaurant);
router.get('/stats', getStats);
router.get('/restaurants/pending', getPendingRestaurants);
router.get('/users', getAllUsers);
router.get('/restaurants', getAllRestaurants);

module.exports = router;
