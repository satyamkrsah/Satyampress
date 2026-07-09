const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { parse } = require('json2csv');
const { queueNotification } = require('../utils/notifier');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      lowStockProducts,
      revenueResult,
      todayRevenueResult,
      todayOrdersResult,
      weeklySalesResult
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'cancelled' }),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.find().sort('-createdAt').limit(10).populate('user', 'name email'),
      Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } }).limit(10).select('name stock lowStockThreshold images'),
      Order.aggregate([
        { $match: { orderStatus: { $nin: ['cancelled', 'refunded', 'rejected'] } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            orderStatus: { $nin: ['cancelled', 'refunded', 'rejected'] },
            createdAt: { $gte: today }
          } 
        },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { 
          $match: { 
            orderStatus: { $nin: ['cancelled', 'refunded', 'rejected'] },
            createdAt: { $gte: sevenDaysAgo }
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            sales: { $sum: '$grandTotal' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

    // Format weekly sales to ensure all 7 days are present
    const weeklySales = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const found = weeklySalesResult.find(item => item._id === dateString);
      weeklySales.push({
        day: dayName,
        date: dateString,
        sales: found ? found.sales : 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        todayOrders: todayOrdersResult,
        todayRevenue,
        weeklySales,
        recentOrders,
        lowStockProducts
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recent orders
// @route   GET /api/admin/orders/recent
// @access  Private/Admin
exports.getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort('-createdAt')
      .limit(10)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, adminNotes, estimatedDeliveryDate } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (orderStatus && orderStatus !== order.orderStatus) {
      const previousStatus = order.orderStatus;
      order.orderStatus = orderStatus;
      
      order.timeline.push({ 
        status: orderStatus, 
        note: `Order status updated to ${orderStatus} by Admin`,
        date: new Date()
      });
      
      // Reduce Inventory if changing from pending to confirmed (e.g. for COD orders)
      if (previousStatus === 'pending' && orderStatus === 'confirmed') {
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock = Math.max(0, product.stock - item.quantity);
            await product.save();
          }
        }
      }
      
      // We would create a Notification here for the user
      const user = await User.findById(order.user);
      if (user) {
        let subject = '';
        let body = '';
        let smsBody = '';

        switch (orderStatus) {
          case 'confirmed':
            subject = `Order Confirmed - #${order.invoiceNumber}`;
            body = `<h1>Order Confirmed</h1><p>Your order #${order.invoiceNumber} has been confirmed by our team and is now in processing.</p>`;
            smsBody = `Hi ${user.name},\nYour order #${order.invoiceNumber} has been confirmed. We are processing it.`;
            break;
          case 'printing':
            subject = `Printing Started - #${order.invoiceNumber}`;
            body = `<h1>Printing Started</h1><p>We have started printing your designs for order #${order.invoiceNumber}.</p>`;
            smsBody = `Hi ${user.name},\nGood news! Your order #${order.invoiceNumber} is now printing.`;
            break;
          case 'shipped':
            subject = `Order Shipped - #${order.invoiceNumber}`;
            body = `<h1>Order Shipped</h1><p>Your order #${order.invoiceNumber} has been shipped and is on its way to you.</p>`;
            smsBody = `Hi ${user.name},\nYour order #${order.invoiceNumber} has been shipped and is on its way!`;
            break;
          case 'delivered':
            subject = `Order Delivered - #${order.invoiceNumber}`;
            body = `<h1>Order Delivered</h1><p>Your order #${order.invoiceNumber} has been delivered. Thank you for choosing Satyam Printing Press!</p>`;
            smsBody = `Hi ${user.name},\nYour order #${order.invoiceNumber} has been delivered. Thank you!`;
            break;
          case 'cancelled':
            subject = `Order Cancelled - #${order.invoiceNumber}`;
            body = `<h1>Order Cancelled</h1><p>Your order #${order.invoiceNumber} has been cancelled.</p>`;
            smsBody = `Hi ${user.name},\nYour order #${order.invoiceNumber} has been cancelled.`;
            break;
          default:
            subject = `Order Status Update - #${order.invoiceNumber}`;
            body = `<h1>Order Update</h1><p>Your order #${order.invoiceNumber} status is now: ${orderStatus}.</p>`;
            smsBody = `Hi ${user.name},\nYour order #${order.invoiceNumber} is now: ${orderStatus}.`;
        }

        queueNotification({
          user: user._id,
          type: 'email',
          recipient: user.email,
          subject,
          body
        });

        if (user.phone) {
          queueNotification({
            user: user._id,
            type: 'sms',
            recipient: user.phone,
            subject: '',
            body: smsBody
          });
        }
      }
    }

    if (adminNotes) order.adminNotes = adminNotes;
    if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export Sales Report (CSV)
// @route   GET /api/admin/reports/sales
// @access  Private/Admin
exports.exportSalesReport = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt');

    const fields = ['invoiceNumber', 'createdAt', 'user.name', 'user.email', 'orderStatus', 'paymentMethod', 'grandTotal'];
    const opts = { fields };

    const csv = parse(orders, opts);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.csv');
    
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
exports.getCustomers = async (req, res, next) => {
  try {
    // Find all users with role 'customer'
    const customers = await User.find({ role: 'customer' }).sort('-createdAt');
    
    // We can also aggregate their total orders and total spending here if needed,
    // but for simplicity we will just return the user objects for now.
    
    res.status(200).json({
      success: true,
      data: customers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update customer status (Block/Unblock)
// @route   PUT /api/admin/customers/:id/status
// @access  Private/Admin
exports.updateCustomerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete customer
// @route   DELETE /api/admin/customers/:id
// @access  Private/Admin
exports.deleteCustomer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
