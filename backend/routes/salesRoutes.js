import express from 'express';
import {
  getSalesOverview,
  getRevenueChart,
  getTopProducts,
  getSalesByCategory,
  getRecentSales,
  createOrder
} from '../controllers/salesController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getSalesOverview);
router.get('/revenue-chart', getRevenueChart);
router.get('/top-products', getTopProducts);
router.get('/by-category', getSalesByCategory);
router.get('/recent', getRecentSales);
router.post('/order', createOrder);


export default router;
