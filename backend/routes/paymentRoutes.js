const express = require('express');
const {
  createOrder,
  verifyPayment,
  initiateRefund,
  getPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

// Admin routes
router.get('/', protect, authorize('admin'), getPayments);
router.post('/:id/refund', protect, authorize('admin'), initiateRefund);

module.exports = router;
