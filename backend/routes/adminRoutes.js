const express = require('express');
const {
  getDashboardStats,
  getRecentOrders,
  updateOrderStatus,
  exportSalesReport,
  getCustomers,
  updateCustomerStatus,
  deleteCustomer
} = require('../controllers/adminController');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin')); // All admin routes strictly protected

router.get('/dashboard', getDashboardStats);
router.get('/orders/recent', getRecentOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/reports/sales', exportSalesReport);

// Customers
router.get('/customers', getCustomers);
router.put('/customers/:id/status', updateCustomerStatus);
router.delete('/customers/:id', deleteCustomer);

module.exports = router;
