import Product from '../models/Product.js';

// @desc    Get all products for current user
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, status, sort = '-createdAt' } = req.query;

    const query = { user: req.user.storeOwnerId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      user: req.user.storeOwnerId 
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.storeOwnerId;
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findOne({ 
      _id: req.params.id, 
      user: req.user.storeOwnerId 
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      user: req.user.storeOwnerId 
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Private
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { user: req.user.storeOwnerId });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
