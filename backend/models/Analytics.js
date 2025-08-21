const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaleSession',
    required: true,
    unique: true
  },
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
  pitchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  buyerIntent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  objections: [{
    type: String,
    required: true
  }],
  mistakes: [{
    statement: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    }
  }],
  insights: [{
    type: String,
    required: true
  }],
  followupMessage: {
    type: String,
    required: true
  },
  analysisDate: {
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
  }
}, {
  timestamps: true
});

// Indexes
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ salesperson: 1, analysisDate: -1 });
analyticsSchema.index({ customer: 1, analysisDate: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);