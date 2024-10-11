    const mongoose = require('mongoose');

    // Cart Schema
    const cartSchema = new mongoose.Schema({
        sessionId: { type: String, required: true }, // Unique session ID for identifying users
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 },
        addedAt: { type: Date, default: Date.now, expires: 43200 } // TTL index (expires after 12 hours)
    }, { timestamps: true });

    // TTL Index ensures the document is deleted after 12 hours (43200 seconds)
    module.exports = mongoose.model('Cart', cartSchema);
