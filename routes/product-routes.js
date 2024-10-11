const express = require('express');
const router = express.Router();
const productController = require('../controllers/product-controller'); // Ensure correct path

// Route for getting all products
router.get('/', productController.getAllProducts);
//  route for total count of products
router.get('/count', productController.getProductsCount );
//get all product by pagination
// GET http://localhost:3000/api/products?page=2&limit=5
router.get('/page', productController.getProductsByPagination );
// Route to get a product by ID
router.get('/:id', productController.getProductById);
//get all product by Ids
router.post('/getProductsByIds', productController.getProductsByIds );

// Route for getting products by category
router.get('/category/:categoryId', productController.getProductsByCategoryId);

// Route for creating a new product (no multer needed)
router.post('/', productController.createProduct);

// Route for updating a product
router.put('/:id', productController.updateProduct);

// Route for deleting a product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
