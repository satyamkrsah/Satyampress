const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} = require('../controllers/orderController');
const { downloadInvoice } = require('../controllers/invoiceController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(createOrder);

router.route('/myorders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/cancel')
  .put(cancelOrder);

router.route('/:id/invoice')
  .get(downloadInvoice);

module.exports = router;
