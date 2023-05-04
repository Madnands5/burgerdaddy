const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    order: String,
    status: String,
    payment: String,
    total: Number,
    date: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);