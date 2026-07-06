const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      required: true // e.g., 'Order', 'Product', 'User'
    },
    entityId: {
      type: mongoose.Schema.ObjectId,
      required: true
    },
    details: {
      type: String
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
