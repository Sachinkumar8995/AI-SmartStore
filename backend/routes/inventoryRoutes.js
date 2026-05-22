import express from 'express';
import { getLowStockAlerts, getInventorySummary } from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/alerts', getLowStockAlerts);
router.get('/summary', getInventorySummary);

export default router;
