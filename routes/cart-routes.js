const express = require('express');
const cartController = require('../controllers/cart-controller'); // Assuming controller file is cart-controller.js

const router = express.Router();

// Route to add a product to the cart
router.post('/add', cartController.addToCart);

// Route to get all cart items
router.get('/items', cartController.getCartItems);
// Route to get all cart items
router.get('/odata', cartController.getCartItemsBySkiptop);
// Route to get total cart items count
router.get('/count/:sessionId', cartController.getTotalCartItemsCount);
// Optional: Route to clear the cart (if needed)
router.delete('/clear', cartController.clearCart);

module.exports = router;
