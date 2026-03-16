const express = require('express');
const router = express.Router();
const {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    uploadMedia,
    deleteMedia,
    parseMenu,
    updateMenu
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Protected Owner routes
router.post('/', protect, authorize('owner', 'admin'), createRestaurant);
router.post('/:id/media', protect, authorize('owner'), upload.array('files', 5), uploadMedia);
router.put('/:id/media/delete', protect, authorize('owner'), deleteMedia);
router.post('/menu/parse', protect, authorize('owner'), upload.single('menuImage'), parseMenu);
router.put('/:id/menu', protect, authorize('owner'), updateMenu);

module.exports = router;
