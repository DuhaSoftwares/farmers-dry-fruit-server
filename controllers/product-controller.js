const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// File type map for validation
const FILE_TYPE_MAP = {
     'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/jfif': 'jfif',
    'image/webp': 'webp',
    'image/gif': 'gif' // Add any other types if neede
};

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        const uploadError = isValid ? null : new Error('invalid image type');
        cb(uploadError, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

// Create a product
exports.createProduct = async (req, res) => {
    uploadOptions.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).send(err.message);
        }
        
        try {
            const { name, description, price, category, units, isBestSelling } = req.body;

            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ error: 'Category not found' });
            }

            const file = req.file;  // Retrieve the uploaded file
            if (!file) return res.status(400).send('No image in the request');

            const fileName = file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

            const product = new Product({
                name,
                description,
                price,
                category,
                image: `${basePath}${fileName}`, // Use the uploaded file name
                units,
                isBestSelling
            });

            await product.save();
            res.status(201).json(product);
        } catch (err) {
            console.error('Error creating product:', err);
            res.status(400).json({ error: 'Error creating product' });
        }
    });
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Error fetching products' });
    }
};


exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.status(200).json(product);
    } catch (err) {
        console.error('Error fetching product by ID:', err);
        res.status(500).json({ error: 'Error fetching product by ID' });
    }
};

exports.getProductsByIds = async (req, res) => {
    try {
        // Assuming you send an array of product IDs in the request body
        const { productIds } = req.body;

        // Ensure that productIds is provided and is an array
        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({ error: 'Invalid productIds. Expected an array.' });
        }

        // Fetch the products whose _id is in the provided array
        const products = await Product.find({ _id: { $in: productIds } }).populate('category');

        // Check if products are found
        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found' });
        }

        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products by IDs:', err);
        res.status(500).json({ error: 'Error fetching products by IDs' });
    }
};


exports.getProductsCount = async (req, res) => {
    try {
        const count = await Product.countDocuments();
        res.status(200).json({ count });
    } catch (err) {
        console.error('Error fetching product count:', err);
        res.status(500).json({ error: 'Error fetching product count' });
    }
};


exports.getProductsByPagination = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const products = await Product.find().skip(skip).limit(limit).populate('category');
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products with pagination:', err);
        res.status(500).json({ error: 'Error fetching products with pagination' });
    }
};

// Get All Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err); // Log error for debugging
    res.status(500).json({ error: 'Failed to fetch categories. ' + err.message });
  }
};
exports.getProductsByCategoryId = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.categoryId }).populate('category');
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products by category:', err);
        res.status(500).json({ error: 'Error fetching products by category' });
    }
};


exports.updateProduct = async (req, res) => {
    uploadOptions.single('image')(req, res, async (err) => {
        if (err) return res.status(400).send(err.message);

        try {
            const { name, description, price, category, units, isBestSelling } = req.body;

            const categoryExists = await Category.findById(category);
            if (!categoryExists) return res.status(400).json({ error: 'Category not found' });

            let imagePath;
            if (req.file) {
                const file = req.file;
                const fileName = file.filename;
                const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
                imagePath = `${basePath}${fileName}`;
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    description,
                    price,
                    category,
                    units,
                    isBestSelling,
                    image: imagePath ? imagePath : undefined
                },
                { new: true }
            );

            if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });

            res.status(200).json(updatedProduct);
        } catch (err) {
            console.error('Error updating product:', err);
            res.status(400).json({ error: 'Error updating product' });
        }
    });
};


exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndRemove(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Delete associated image file
        const filePath = path.join(__dirname, `../public/uploads/${product.image.split('/').pop()}`);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting image:', err);
        });

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Error deleting product' });
    }
};
