const express = require('express');
const router = express.Router();
const { verifyPayment } = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/verify', authenticate, verifyPayment);

module.exports = router;
