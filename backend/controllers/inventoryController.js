import Product from '../models/Product.js';

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts
// @access  Private
export const getLowStockAlerts = async (req, res, next) => {
  try {
    const { threshold = 10 } = req.query;

    const lowStockProducts = await Product.find({
      user: req.user.id,
      stock: { $lte: parseInt(threshold) },
      status: 'active'
    })
      .sort('stock')
      .select('name category price stock imageUrl status')
      .lean();

    res.json({
      success: true,
      data: lowStockProducts,
      count: lowStockProducts.length,
      threshold: parseInt(threshold)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory summary
// @route   GET /api/inventory/summary
// @access  Private
export const getInventorySummary = async (req, res, next) => {
  try {
    const products = await Product.find({ 
      user: req.user.id, 
      status: 'active' 
    }).lean();

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const healthyStock = products.filter(p => p.stock > 10).length;

    // Category breakdown
    const categoryBreakdown = {};
    products.forEach(p => {
      if (!categoryBreakdown[p.category]) {
        categoryBreakdown[p.category] = { count: 0, totalStock: 0, totalValue: 0 };
      }
      categoryBreakdown[p.category].count++;
      categoryBreakdown[p.category].totalStock += p.stock;
      categoryBreakdown[p.category].totalValue += p.price * p.stock;
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalStock,
        totalValue: parseFloat(totalValue.toFixed(2)),
        outOfStock,
        lowStock,
        healthyStock,
        categoryBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};
