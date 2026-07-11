const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { queueNotification } = require('../utils/notifier');

// Helper to generate invoice number
const generateInvoiceNumber = () => {
  return 'INV-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, orderNotes } = req.body;

    // 1. Get user cart
    const cart = await Cart.findOne({ user: req.user.id }).populate({
  path: 'items.product',
  populate: [
    { path: 'thumbnail' },
    { path: 'gallery' }
  ]
});

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in cart' });
    }

    // 2. Build order items array from cart items
    const orderItems = cart.items.map(item => {
      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images[0],
        quantity: item.quantity,
        price: item.price,
        gstRate: item.product.gstRate,
        designFile: item.designFile || undefined,
        specialInstructions: item.specialInstructions,
        customizations: item.customizations
      };
    });

    // 3. Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      billingAddress,
      paymentMethod,
      coupon: cart.coupon,
      subTotal: cart.subTotal,
      taxTotal: cart.taxTotal,
      shippingTotal: cart.shippingTotal,
      discountTotal: cart.discountTotal,
      grandTotal: cart.grandTotal,
      orderNotes,
      invoiceNumber: generateInvoiceNumber(),
      timeline: [{ status: 'pending', note: 'Order placed successfully' }]
    });

    // 4. (Removed) Inventory is now deducted upon Payment/Admin Confirmation

    // 5. Create Notification
    await Notification.create({
      user: req.user.id,
      title: 'Order Placed Successfully',
      message: `Your order #${order.invoiceNumber} has been placed successfully.`,
      type: 'order_created',
      relatedId: order._id
    });

    // 5.5 Queue External Notifications
    const user = await User.findById(req.user.id);
    if (user) {
      queueNotification({
        user: user._id,
        type: 'email',
        recipient: user.email,
        subject: `Order Confirmation - #${order.invoiceNumber}`,
        body: `<h1>Order Confirmed</h1><p>We have received your order #${order.invoiceNumber} for ₹${order.grandTotal}.</p>`
      });
      if (user.phone) {
        queueNotification({
          user: user._id,
          type: 'whatsapp',
          recipient: user.phone,
          subject: '',
          body: `Hi ${user.name},\nYour order #${order.invoiceNumber} has been placed successfully at Satyam Printing Press. Total: ₹${order.grandTotal}. We will notify you once it's confirmed.`
        });
      }
    }

    // 6. Empty the cart after successful order creation
    cart.items = [];
    cart.coupon = null;
    cart.subTotal = 0;
    cart.taxTotal = 0;
    cart.shippingTotal = 0;
    cart.discountTotal = 0;
    cart.grandTotal = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('shippingAddress')
      .populate('billingAddress');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Make sure user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    if (order.orderStatus !== 'pending' && order.orderStatus !== 'confirmed') {
       return res.status(400).json({ success: false, error: 'Order cannot be cancelled at this stage' });
    }

    const previousStatus = order.orderStatus;
    
    order.orderStatus = 'cancelled';
    order.timeline.push({ status: 'cancelled', note: 'Order cancelled by user' });
    await order.save();

    // Revert stock only if it was already confirmed (and thus deducted)
    if (previousStatus === 'confirmed') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    // Notification
    await Notification.create({
      user: req.user.id,
      title: 'Order Cancelled',
      message: `Your order #${order.invoiceNumber} has been cancelled.`,
      type: 'order_status_update',
      relatedId: order._id
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};
