const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  organizationId: {
    type: String,
    required: true,
    default: 'ORG001'
  },
  organizationName: {
    type: String,
    required: true,
    default: 'TechCorp Solutions'
  },
  zoneId: {
    type: String,
    required: true,
    default: 'ZONE001'
  },
  storeId: {
    type: String,
    required: true,
    default: 'STORE001'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ mobile: 1 });
userSchema.index({ organizationId: 1, zoneId: 1, storeId: 1 });

module.exports = mongoose.model('User', userSchema);