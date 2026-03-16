const Restaurant = require('../models/Restaurant');
const imagekit = require('../services/imageKitService');
const { parseMenuFromImage } = require('../services/ocrService');

// Helper to upload buffer to ImageKit
const uploadToImageKit = async (fileBuffer, fileName) => {
    if (!process.env.IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY.includes('your_')) {
        return Promise.reject(new Error("Please configure your ImageKit API Keys in the .env file to upload media."));
    }
    return new Promise((resolve, reject) => {
        imagekit.upload({
            file: fileBuffer,
            fileName: fileName,
            folder: '/dineease'
        }, (error, result) => {
            if (error) reject(error);
            else resolve(result.url);
        });
    });
};

// @desc    Create a restaurant listing
// @route   POST /api/restaurants
// @access  Private (Owner)
const createRestaurant = async (req, res) => {
    try {
        const { name, description, cuisine, priceRange, longitude, latitude, address, totalTables, seatsPerTable, openingTime, closingTime } = req.body;

        // Parse location if provided
        let location = { type: 'Point', coordinates: [0, 0] };
        if (longitude && latitude) {
            location.coordinates = [parseFloat(longitude), parseFloat(latitude)];
            location.address = address;
        }

        const restaurant = new Restaurant({
            ownerId: req.user._id,
            name,
            description,
            cuisine,
            priceRange,
            location,
            tables: {
                total: parseInt(totalTables),
                seatsPerTable: parseInt(seatsPerTable)
            },
            openingTime,
            closingTime
        });

        const createdRestaurant = await restaurant.save();
        res.status(201).json(createdRestaurant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all approved restaurants (with optional geo search)
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
    try {
        const { lat, lng, maxDistance = 10000, cuisine, search, location } = req.query; // maxDistance in meters

        let query = { isApproved: true };

        if (location && location !== 'Current Location') {
            query['location.address'] = { $regex: location, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { cuisine: { $regex: search, $options: 'i' } }
            ];
        }

        if (cuisine) {
            query.cuisine = { $regex: cuisine, $options: 'i' };
        }

        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            };
        }

        const restaurants = await Restaurant.find(query);
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant || !restaurant.isApproved) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.status(200).json(restaurant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload media (photos/videos)
// @route   POST /api/restaurants/:id/media
// @access  Private (Owner)
const uploadMedia = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        // Check ownership
        if (restaurant.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedUrls = [];
        for (const file of req.files) {
            const url = await uploadToImageKit(file.buffer, file.originalname);
            uploadedUrls.push(url);

            if (file.mimetype.startsWith('video/')) {
                restaurant.videos.push(url);
            } else {
                restaurant.images.push(url);
            }
        }

        await restaurant.save();
        res.status(200).json({ urls: uploadedUrls, restaurant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete media (photo/video URL) from db
// @route   PUT /api/restaurants/:id/media/delete
// @access  Private (Owner)
const deleteMedia = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ message: 'URL is required' });

        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        if (restaurant.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Remove from DB arrays
        restaurant.images = restaurant.images.filter(img => img !== url);
        restaurant.videos = restaurant.videos.filter(vid => vid !== url);

        await restaurant.save();
        res.status(200).json({ success: true, restaurant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Parse Menu from Image (AI upload)
// @route   POST /api/restaurants/menu/parse
// @access  Private (Owner)
const parseMenu = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No menu image provided' });
        }

        const parsedItems = await parseMenuFromImage(req.file.buffer, req.file.mimetype);
        res.status(200).json({ items: parsedItems });
    } catch (error) {
        console.error("AI Parse Error:", error.message);
        res.status(500).json({ message: error.message || 'Failed to parse menu image' });
    }
};

// @desc    Update Menu items (Save parsed or manual)
// @route   PUT /api/restaurants/:id/menu
// @access  Private (Owner)
const updateMenu = async (req, res) => {
    try {
        const { menuItems } = req.body; // Array of {name, price}

        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        if (restaurant.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        restaurant.menu = menuItems;
        await restaurant.save();

        res.status(200).json(restaurant.menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    uploadMedia,
    deleteMedia,
    parseMenu,
    updateMenu
};
