const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { queueNotification } = require('../utils/notifier');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mocksecret',
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ success: false, error: 'Order is not in a pending payment state' });
    }

    const amountInPaise = Math.round(order.grandTotal * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${order._id}`,
      payment_capture: 1 // Auto capture
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create Payment Record
    await Payment.create({
      razorpayOrderId: razorpayOrder.id,
      order: order._id,
      customer: req.user.id,
      amount: order.grandTotal,
      currency: 'INR'
    });

    // Update order with razorpayOrderId
    order.paymentDetails.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
};

// @desc    Verify Razorpay Signature and Capture Payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment details' });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    // Replay protection
    if (payment.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, error: 'Payment already processed' });
    }

    const order = await Order.findById(payment.order);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Associated order not found' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'mocksecret';
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update Payment
      payment.paymentStatus = 'completed';
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.signature = razorpay_signature;
      payment.transactionTime = new Date();
      await payment.save();

      // Update Order
      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
      order.paymentDetails.razorpaySignature = razorpay_signature;
      order.timeline.push({
        status: 'confirmed',
        note: 'Payment verified and order confirmed.'
      });
      await order.save();

      // Reduce Inventory
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }

      // Notifications
      const user = await User.findById(order.user);
      if (user) {
        queueNotification({
          user: user._id,
          type: 'email',
          recipient: user.email,
          subject: `Payment Successful - Order #${order.invoiceNumber}`,
          body: `<h1>Payment Received</h1><p>We have successfully received ₹${order.grandTotal.toLocaleString('en-IN')} for your order #${order.invoiceNumber}. We are now processing it.</p>`
        });
      }

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      payment.paymentStatus = 'failed';
      await payment.save();
      
      order.paymentStatus = 'failed';
      order.timeline.push({
        status: 'failed',
        note: 'Payment signature verification failed.'
      });
      await order.save();

      res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
};

// @desc    Initiate Refund (Admin)
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
exports.initiateRefund = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    if (payment.paymentStatus !== 'completed') {
      return res.status(400).json({ success: false, error: 'Payment is not completed. Cannot refund.' });
    }

    if (payment.refundStatus === 'full') {
      return res.status(400).json({ success: false, error: 'Payment is already fully refunded.' });
    }

    const { amount } = req.body; // Optional partial refund
    const refundAmountInPaise = amount ? Math.round(amount * 100) : Math.round(payment.amount * 100);

    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: refundAmountInPaise
    });

    if (refund) {
      payment.refundStatus = amount && amount < payment.amount ? 'partial' : 'full';
      payment.paymentStatus = 'refunded';
      await payment.save();

      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'refunded';
        order.orderStatus = 'refunded';
        order.timeline.push({
          status: 'refunded',
          note: `Refund of ₹${refundAmountInPaise / 100} initiated.`
        });
        
        // Revert stock if full refund / cancelled
        if (payment.refundStatus === 'full') {
          for (const item of order.items) {
             const product = await Product.findById(item.product);
             if (product) {
                product.stock += item.quantity;
                await product.save();
             }
          }
        }
        await order.save();
      }

      return res.status(200).json({ success: true, data: payment });
    }
    
    res.status(400).json({ success: false, error: 'Refund failed at gateway' });
  } catch (error) {
    console.error('Refund Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Refund failed' });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().populate('customer', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};
