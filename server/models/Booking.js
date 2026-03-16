const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g., "19:00"
    numberOfGuests: { type: Number, required: true },
    specialRequest: { type: String },
    preOrderedItems: [{
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number }
    }],
    payment: {
        status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
        transactionId: { type: String },
        orderId: { type: String }
    },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
