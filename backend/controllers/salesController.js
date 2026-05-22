import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// @desc    Get sales overview (KPI summary)
// @route   GET /api/sales/overview
// @access  Private
export const getSalesOverview = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalStats, todayStats, weekStats, monthStats, productCount, orderCount] = await Promise.all([
      Sale.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 }, units: { $sum: '$quantity' } } }
      ]),
      Sale.aggregate([
        { $match: { user: userId, date: { $gte: todayStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { user: userId, date: { $gte: weekStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { user: userId, date: { $gte: monthStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }
      ]),
      Product.countDocuments({ user: req.user.id }),
      Sale.countDocuments({ user: req.user.id })
    ]);

    // Calculate average order value
    const total = totalStats[0] || { revenue: 0, orders: 0, units: 0 };
    const avgOrderValue = total.orders > 0 ? (total.revenue / total.orders) : 0;

    res.json({
      success: true,
      data: {
        totalRevenue: total.revenue,
        totalOrders: total.orders,
        totalUnitsSold: total.units,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        todayRevenue: todayStats[0]?.revenue || 0,
        todayOrders: todayStats[0]?.orders || 0,
        weekRevenue: weekStats[0]?.revenue || 0,
        weekOrders: weekStats[0]?.orders || 0,
        monthRevenue: monthStats[0]?.revenue || 0,
        monthOrders: monthStats[0]?.orders || 0,
        productCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue chart data (daily for last 30 days)
// @route   GET /api/sales/revenue-chart
// @access  Private
export const getRevenueChart = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const data = await Sale.aggregate([
      { $match: { user: userId, date: { $gte: daysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          units: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Fill in missing days with zeros
    const chartData = [];
    const currentDate = new Date(daysAgo);
    const today = new Date();

    while (currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();

      const found = data.find(d => 
        d._id.year === year && d._id.month === month && d._id.day === day
      );

      chartData.push({
        date: currentDate.toISOString().split('T')[0],
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
        units: found?.units || 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({ success: true, data: chartData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products
// @route   GET /api/sales/top-products
// @access  Private
export const getTopProducts = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { limit = 10 } = req.query;

    const topProducts = await Sale.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$product',
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          totalQuantity: 1,
          orderCount: 1,
          'product.name': 1,
          'product.category': 1,
          'product.price': 1,
          'product.imageUrl': 1
        }
      }
    ]);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales by category
// @route   GET /api/sales/by-category
// @access  Private
export const getSalesByCategory = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const categoryData = await Sale.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      { $unwind: '$productData' },
      {
        $group: {
          _id: '$productData.category',
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({ success: true, data: categoryData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent sales
// @route   GET /api/sales/recent
// @access  Private
export const getRecentSales = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const sales = await Sale.find({ user: req.user.id })
      .sort('-date')
      .limit(parseInt(limit))
      .populate('product', 'name category price imageUrl')
      .lean();

    res.json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new order (storefront checkout)
// @route   POST /api/sales/order
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { items, channel = 'online' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide items for the order' });
    }

    const salesToInsert = [];

    // Loop through items to validate product inventory & verify existence
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid product ID or quantity' });
      }

      const product = await Product.findOne({ _id: productId, user: req.user.id });
      if (!product) {
        return res.status(404).json({ success: false, error: `Product not found: ${productId}` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock for product "${product.name}". Available stock: ${product.stock}, requested: ${quantity}` 
        });
      }

      // Decrement stock
      product.stock -= quantity;
      await product.save();

      // Calculate amount
      const totalAmount = product.price * quantity;

      // Prepare Sale record
      salesToInsert.push({
        user: req.user.id,
        product: product._id,
        quantity,
        totalAmount,
        channel,
        date: new Date()
      });
    }

    // Insert sale records
    const sales = await Sale.insertMany(salesToInsert);

    res.status(201).json({
      success: true,
      message: 'Order created and stock levels updated successfully',
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

