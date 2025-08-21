const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  lastContactDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for unique customers per organization
customerSchema.index({ name: 1, phone: 1, organizationId: 1 }, { unique: true });
customerSchema.index({ createdBy: 1 });
customerSchema.index({ organizationId: 1, zoneId: 1, storeId: 1 });

module.exports = mongoose.model('Customer', customerSchema);