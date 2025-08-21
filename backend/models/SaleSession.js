const mongoose = require('mongoose');

const saleSessionSchema = new mongoose.Schema({
  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  transcript: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  sessionDate: {
    type: Date,
    default: Date.now
  },
  organizationId: {
    type: String,
    required: true
  },
  zoneId: {
    type: String,
    required: true
  },
  storeId: {
    type: String,
    required: true
  },
  isAnalyzed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
saleSessionSchema.index({ salesperson: 1, sessionDate: -1 });
saleSessionSchema.index({ customer: 1, sessionDate: -1 });
saleSessionSchema.index({ organizationId: 1, zoneId: 1, storeId: 1 });

module.exports = mongoose.model('SaleSession', saleSessionSchema);