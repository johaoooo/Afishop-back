const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Routes publiques
router.get('/', getProducts);
router.get('/:id', getProductById);

// Routes protégées (admin uniquement pour l'instant, ajustable selon vos rôles réels)
router.post('/', authenticate, authorize('admin'), createProduct);
router.put('/:id', authenticate, authorize('admin'), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

module.exports = router;
