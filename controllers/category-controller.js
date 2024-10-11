const Category = require('../models/categoryModel');

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const category = new Category({name});
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err); // Log error for debugging
    res.status(500).json({ error: 'Failed to create category. ' + err.message });
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

// Get Category By ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    console.error('Error fetching category by ID:', err); // Log error for debugging
    res.status(500).json({ error: 'Failed to fetch category. ' + err.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err); // Log error for debugging
    res.status(500).json({ error: 'Failed to update category. ' + err.message });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err); // Log error for debugging
    res.status(500).json({ error: 'Failed to delete category. ' + err.message });
  }
};
