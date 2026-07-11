const Product = require("../models/Product");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("thumbnail gallery pdfSample", "secureUrl originalName");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// Helper function for collections
const getCollectionProducts = async (req, res, next, collectionTypeValue) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 0;
    
    let query = Product.find({ isActive: true, collectionType: collectionTypeValue })
      .populate("category")
      .populate("thumbnail gallery pdfSample", "secureUrl originalName");
      
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const products = await query;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get premium collection products
// @route   GET /api/products/premium
// @access  Public
exports.getPremiumProducts = (req, res, next) => getCollectionProducts(req, res, next, 'premium');

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
exports.getBestSellers = (req, res, next) => getCollectionProducts(req, res, next, 'bestSeller');

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = (req, res, next) => getCollectionProducts(req, res, next, 'newArrival');

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = (req, res, next) => getCollectionProducts(req, res, next, 'featured');

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("thumbnail gallery pdfSample", "secureUrl originalName");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
