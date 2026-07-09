const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['new_order', 'order_status_update', 'order_status', 'payment_success', 'payment_failed', 'product_added', 'product_updated', 'profile_updated', 'welcome', 'admin_announcement', 'system', 'promotion'],
      default: 'system'
    },
    relatedId: {
      type: mongoose.Schema.ObjectId // e.g., Order ID
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
