import express from 'express';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getCategories 
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/categories/list', getCategories);
router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);

export default router;
