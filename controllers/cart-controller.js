const Cart = require("../models/CartModel");
const Product = require("../models/productModel"); // Assuming you have a Product model

// Helper function to get or create a session ID
const getSessionId = (req, res) => {
    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
        sessionId = require('crypto').randomBytes(16).toString('hex');
        res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
    }

    return sessionId;
};

// Add product to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Get or generate sessionId
        let sessionId = getSessionId(req, res);

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Use `findOneAndUpdate` to either update or insert a new cart item
        const cartItem = await Cart.findOneAndUpdate(
            { sessionId, productId },
            { $inc: { quantity: quantity } },
            { new: true, upsert: true } // Create if not exists
        );

        res.status(201).json({
            message: 'Product added to cart',
            cartItem,
            notification: 'Your cart will be available for 12 hours from now.',
        });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ error: 'Error adding to cart' });
    }
};

// Get all cart items
exports.getCartItems = async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;

        if (!sessionId) {
            return res.status(400).json({ error: 'No cart found for this session' });
        }

        // Use aggregation for better performance and flexibility
        const cartItems = await Cart.aggregate([
            { $match: { sessionId } },
            {
                $lookup: {
                    from: 'products', // Name of the products collection
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productDetails',
                }
            },
            { $unwind: '$productDetails' }
        ]);

        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart is empty' });
        }

        res.json(cartItems);
    } catch (err) {
        console.error('Error fetching cart items:', err);
        res.status(500).json({ error: 'Error fetching cart items' });
    }
};
exports.getCartItemsBySkiptop = async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!sessionId) {
            return res.status(400).json({ error: 'No cart found for this session' });
        }

        const cartItems = await Cart.find({ sessionId })
            .populate('productId')
            .skip(skip)
            .limit(limit);

        const totalItems = await Cart.countDocuments({ sessionId });

        res.json({
            cartItems,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
            },
        });
    } catch (err) {
        console.error('Error fetching cart items:', err);
        res.status(500).json({ error: 'Error fetching cart items' });
    }
};

// Get total count of cart items for a specific session ID
// Get total cart items count by session ID
exports.getTotalCartItemsCount = async (req, res) => {
    try {
        // Extract sessionId from request parameters or body
        const sessionId = req.params.sessionId || req.body.sessionId;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        // Count total items for the specific sessionId
        const totalCount = await Cart.aggregate([
            { $match: { sessionId } },
            { $group: { _id: null, totalItems: { $sum: "$quantity" } } }
        ]);

        const count = totalCount.length > 0 ? totalCount[0].totalItems : 0;

        res.json({ totalCount: count });
    } catch (err) {
        console.error('Error fetching total cart items count:', err);
        res.status(500).json({ error: 'Error fetching total cart items count' });
    }
};


// Optional: Clear the cart
exports.clearCart = async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;

        if (!sessionId) {
            return res.status(400).json({ error: 'No cart found for this session' });
        }

        await Cart.deleteMany({ sessionId });

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (err) {
        console.error('Error clearing cart:', err);
        res.status(500).json({ error: 'Error clearing cart' });
    }
};
