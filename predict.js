// ============================================================
// routes/predict.js
// POST /api/predict-cost
// Pure ML-based maintenance cost prediction (no Claude API)
// ============================================================

const express = require('express');
const router = express.Router();
const { predictMaintenanceCost } = require('../ml/costPredictor');

/**
 * POST /api/predict-cost
 * Body: { year, kmDriven, fuelType, owners, make, issueCount }
 * Returns: { annualCost, breakdown, confidence }
 */
router.post('/', (req, res) => {
  try {
    const { year, kmDriven, fuelType, owners, make, issueCount = 0 } = req.body;

    if (!year || !kmDriven) {
      return res.status(400).json({ error: 'year and kmDriven are required' });
    }

    const age = new Date().getFullYear() - parseInt(year);
    const cost = predictMaintenanceCost({
      age,
      kmDriven: parseInt(kmDriven),
      fuelType: fuelType || 'Petrol',
      owners: parseInt(owners) || 1,
      issueCount: parseInt(issueCount),
      make: make || 'Unknown'
    });

    // Build category breakdown
    const breakdown = {
      'Engine & Transmission': Math.round(cost * 0.28),
      'Brakes & Suspension':   Math.round(cost * 0.20),
      'Tyres & Wheels':        Math.round(cost * 0.15),
      'AC & Electrical':       Math.round(cost * 0.15),
      'Body & Interior':       Math.round(cost * 0.10),
      'Routine Servicing':     Math.round(cost * 0.12)
    };

    // Confidence is higher when inputs are typical
    const confidence = age < 10 && parseInt(kmDriven) < 150000 ? 'High' : 'Medium';

    res.json({
      success: true,
      data: {
        annualCost: cost,
        breakdown,
        confidence,
        note: 'Estimate based on Indian market data for similar vehicles'
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
