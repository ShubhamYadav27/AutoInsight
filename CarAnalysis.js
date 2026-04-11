// ============================================================
// models/CarAnalysis.js
// MongoDB schema for storing car analysis results
// ============================================================

const mongoose = require('mongoose');

const CarAnalysisSchema = new mongoose.Schema({
  // Input data
  carInfo: {
    make:        { type: String, required: true },
    model:       { type: String, required: true },
    year:        { type: Number, required: true },
    kmDriven:    { type: Number, required: true },
    fuelType:    { type: String },
    askingPrice: { type: Number },
    owners:      { type: Number }
  },
  knownIssues:    [String],
  hasServiceBook: { type: Boolean, default: false },
  imageCount:     { type: Number, default: 0 },

  // AI-generated results
  result: {
    conditionScore:           Number,
    grade:                    String,
    recommendation:           { type: String, enum: ['BUY', 'NEGOTIATE', 'AVOID'] },
    recommendationReason:     String,
    estimatedMaintenanceCost: Number,
    fairMarketPrice:          Number,
    negotiationRoom:          Number,
    narrative:                String,
    redFlags:                 [String],
    positives:                [String],

    detectedIssues: [{
      title:         String,
      description:   String,
      severity:      { type: String, enum: ['Low', 'Medium', 'High'] },
      estimatedCost: Number
    }],

    costBreakdown: [{
      item:    String,
      amount:  Number,
      urgency: { type: String, enum: ['Low', 'Medium', 'High'] }
    }],

    scoreBreakdown: {
      ageScore:   Number,
      kmScore:    Number,
      imageScore: Number,
      ownerScore: Number
    }
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  userId:    { type: String }  // For future auth integration
});

// Index for efficient queries
CarAnalysisSchema.index({ createdAt: -1 });
CarAnalysisSchema.index({ 'carInfo.make': 1, 'carInfo.model': 1 });

module.exports = mongoose.model('CarAnalysis', CarAnalysisSchema);
