const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');
const { downloadReceipt } = require('../controllers/receiptController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/admin/all', authenticate, authorize('admin'), getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.get('/:id/receipt', authenticate, downloadReceipt);
router.patch('/:id/status', authenticate, authorize('admin'), updateOrderStatus);

module.exports = router;
