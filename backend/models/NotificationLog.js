const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp'],
      required: true
    },
    recipient: {
      type: String, // email address or phone number
      required: true
    },
    subject: {
      type: String // For email
    },
    body: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    retryCount: {
      type: Number,
      default: 0
    },
    errorDetails: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

NotificationLogSchema.index({ status: 1, retryCount: 1 });

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);
