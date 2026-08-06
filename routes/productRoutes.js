import express from 'express';
import { 
  getProducts, 
  createProduct,
  updateProduct,
  deleteProduct

} from '../controllers/productController.js';

const router = express.Router();
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/', getProducts);
router.post('/', createProduct);

export default router;
