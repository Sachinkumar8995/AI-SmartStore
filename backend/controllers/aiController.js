import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import {
  generateDescription,
  generateSEOTags,
  generateMarketingCaption,
  generatePricingSuggestion,
  generateTrendingInsights
} from '../services/aiService.js';

// @desc    Generate AI description for a product
// @route   POST /api/ai/generate-description
// @access  Private
export const aiGenerateDescription = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findOne({ _id: productId, user: req.user.storeOwnerId });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const description = await generateDescription(product);

    // Save to product
    product.aiDescription = description;
    await product.save();

    res.json({ success: true, data: { description } });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate SEO tags for a product
// @route   POST /api/ai/generate-tags
// @access  Private
export const aiGenerateTags = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findOne({ _id: productId, user: req.user.storeOwnerId });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const tags = await generateSEOTags(product);

    product.seoTags = tags;
    await product.save();

    res.json({ success: true, data: { tags } });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate marketing caption for a product
// @route   POST /api/ai/generate-caption
// @access  Private
export const aiGenerateCaption = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findOne({ _id: productId, user: req.user.storeOwnerId });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const caption = await generateMarketingCaption(product);

    product.marketingCaption = caption;
    await product.save();

    res.json({ success: true, data: { caption } });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate all AI content for a product
// @route   POST /api/ai/generate-all
// @access  Private
export const aiGenerateAll = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findOne({ _id: productId, user: req.user.storeOwnerId });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const [description, tags, caption] = await Promise.all([
      generateDescription(product),
      generateSEOTags(product),
      generateMarketingCaption(product)
    ]);

    product.aiDescription = description;
    product.seoTags = tags;
    product.marketingCaption = caption;
    await product.save();

    res.json({
      success: true,
      data: { description, tags, caption }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI sales suggestions
// @route   GET /api/ai/suggestions
// @access  Private
export const aiGetSuggestions = async (req, res, next) => {
  try {
    const products = await Product.find({ user: req.user.storeOwnerId }).lean();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const salesData = await Sale.find({
      user: req.user.storeOwnerId,
      date: { $gte: ninetyDaysAgo }
    }).lean();

    const insights = await generateTrendingInsights(products, salesData);

    res.json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI pricing recommendation for a product
// @route   GET /api/ai/pricing/:productId
// @access  Private
export const aiGetPricing = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      user: req.user.storeOwnerId
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const salesData = await Sale.find({
      product: product._id,
      date: { $gte: thirtyDaysAgo }
    }).lean();

    const pricing = await generatePricingSuggestion(product, salesData);

    res.json({ success: true, data: pricing });
  } catch (error) {
    next(error);
  }
};
