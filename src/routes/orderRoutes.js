const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/admin/all', authenticate, authorize('admin'), getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/status', authenticate, authorize('admin'), updateOrderStatus);

module.exports = router;
