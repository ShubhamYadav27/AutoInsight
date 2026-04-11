// ============================================================
// routes/analyze.js
// POST /api/analyze-car
// Combines car details + image analysis into a full report
// ============================================================

const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const CarAnalysis = require('../models/CarAnalysis');
const { predictMaintenanceCost } = require('../ml/costPredictor');
const { calculateConditionScore } = require('../utils/scoring');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * POST /api/analyze-car
 * Body: { make, model, year, kmDriven, fuelType, askingPrice,
 *         owners, knownIssues[], hasServiceBook, images[] (base64) }
 */
router.post('/', async (req, res) => {
  try {
    const {
      make, model, year, kmDriven, fuelType,
      askingPrice, owners, knownIssues = [],
      hasServiceBook = false, images = []
    } = req.body;

    // ── 1. Validate required inputs ───────────────────────────
    if (!make || !model || !year || !kmDriven) {
      return res.status(400).json({ error: 'make, model, year, and kmDriven are required' });
    }

    const carAge = new Date().getFullYear() - parseInt(year);

    // ── 2. Build AI prompt ────────────────────────────────────
    const carDetails = `
Used Car Details:
- Make/Model: ${year} ${make} ${model}
- Fuel Type: ${fuelType || 'Unknown'}
- KM Driven: ${kmDriven.toLocaleString()} km
- Car Age: ${carAge} years
- Previous Owners: ${owners || 'Unknown'}
- Asking Price: ${askingPrice ? '₹' + Number(askingPrice).toLocaleString('en-IN') : 'Not provided'}
- Known Issues: ${knownIssues.length ? knownIssues.join(', ') : 'None disclosed'}
- Service Book: ${hasServiceBook ? 'Available' : 'Not available'}
- Photos uploaded: ${images.length}
- Current market: Indian used car market (2025)
    `.trim();

    // Build message content array (text + optional images)
    const messageContent = [];

    // Attach up to 3 images to the API call
    for (let i = 0; i < Math.min(images.length, 3); i++) {
      const img = images[i];
      // Support both { data, mediaType } object or raw base64 string
      const b64 = img.data || img;
      const mtype = img.mediaType || 'image/jpeg';
      messageContent.push({
        type: 'image',
        source: { type: 'base64', media_type: mtype, data: b64 }
      });
    }

    messageContent.push({ type: 'text', text: carDetails });

    // ── 3. Call Claude API ────────────────────────────────────
    const aiResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `You are AutoInsight, an expert AI used-car inspector for the Indian market.
Analyze the provided car details and any photos, then respond ONLY with a valid JSON object.
No markdown fences, no explanation outside the JSON.

JSON schema:
{
  "conditionScore": <number 0-100>,
  "grade": <"Excellent"|"Good"|"Fair"|"Poor">,
  "recommendation": <"BUY"|"NEGOTIATE"|"AVOID">,
  "recommendationReason": <string>,
  "estimatedMaintenanceCost": <annual INR number>,
  "costBreakdown": [
    { "item": string, "amount": number, "urgency": "Low"|"Medium"|"High" }
  ],
  "detectedIssues": [
    { "title": string, "description": string, "severity": "Low"|"Medium"|"High", "estimatedCost": number }
  ],
  "scoreBreakdown": { "ageScore": number, "kmScore": number, "imageScore": number, "ownerScore": number },
  "fairMarketPrice": <INR number>,
  "negotiationRoom": <INR number>,
  "narrative": <string>,
  "redFlags": [string],
  "positives": [string]
}`,
      messages: [{ role: 'user', content: messageContent }]
    });

    // ── 4. Parse AI response ──────────────────────────────────
    const rawText = aiResponse.content.map(c => c.text || '').join('');
    const clean = rawText.replace(/```json|```/g, '').trim();
    let analysis;

    try {
      analysis = JSON.parse(clean);
    } catch (parseErr) {
      // Fallback: use ML-only scoring if AI JSON malformed
      console.warn('AI JSON parse failed, using fallback scoring');
      analysis = buildFallbackAnalysis({ make, model, year, kmDriven, owners, knownIssues, fuelType });
    }

    // ── 5. Enrich with local ML cost prediction ───────────────
    const mlCost = predictMaintenanceCost({
      age: carAge,
      kmDriven: parseInt(kmDriven),
      fuelType: fuelType || 'Petrol',
      owners: parseInt(owners) || 1,
      issueCount: (analysis.detectedIssues || []).length,
      make
    });

    // Blend AI estimate with ML prediction (70/30 weight)
    analysis.estimatedMaintenanceCost = Math.round(
      (analysis.estimatedMaintenanceCost * 0.7) + (mlCost * 0.3)
    );

    // ── 6. Save to database ───────────────────────────────────
    try {
      const record = new CarAnalysis({
        carInfo: { make, model, year, kmDriven, fuelType, askingPrice, owners },
        knownIssues,
        hasServiceBook,
        imageCount: images.length,
        result: analysis,
        createdAt: new Date()
      });
      await record.save();
      analysis.recordId = record._id;
    } catch (dbErr) {
      // DB save failing shouldn't break the response
      console.warn('DB save failed:', dbErr.message);
    }

    res.json({ success: true, data: analysis });

  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/analyze-car/history ─────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const records = await CarAnalysis.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select('carInfo result.conditionScore result.recommendation createdAt');
    res.json({ data: records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Fallback scoring (no AI) ──────────────────────────────────
function buildFallbackAnalysis({ make, model, year, kmDriven, owners, knownIssues, fuelType }) {
  const age = new Date().getFullYear() - parseInt(year);
  const km = parseInt(kmDriven);
  const ageScore = Math.max(0, 100 - age * 8);
  const kmScore = Math.max(0, 100 - (km / 1500));
  const ownerScore = Math.max(0, 100 - (((parseInt(owners) || 1) - 1) * 20));
  const issueScore = Math.max(0, 100 - (knownIssues.length * 15));
  const conditionScore = Math.round(ageScore * 0.25 + kmScore * 0.30 + issueScore * 0.30 + ownerScore * 0.15);

  const rec = conditionScore >= 70 ? 'BUY' : conditionScore >= 45 ? 'NEGOTIATE' : 'AVOID';
  const baseCost = 15000 + (age * 2000) + (km / 50) + (knownIssues.length * 5000);

  return {
    conditionScore,
    grade: conditionScore >= 75 ? 'Good' : conditionScore >= 50 ? 'Fair' : 'Poor',
    recommendation: rec,
    recommendationReason: `Based on ${age} years age and ${km.toLocaleString()}km driven, this car shows typical wear.`,
    estimatedMaintenanceCost: Math.round(baseCost),
    costBreakdown: [
      { item: 'Engine & Transmission', amount: Math.round(baseCost * 0.3), urgency: age > 5 ? 'Medium' : 'Low' },
      { item: 'Brakes & Suspension', amount: Math.round(baseCost * 0.2), urgency: km > 80000 ? 'Medium' : 'Low' },
      { item: 'Tyres & Wheels', amount: Math.round(baseCost * 0.15), urgency: 'Low' },
      { item: 'AC & Electrical', amount: Math.round(baseCost * 0.15), urgency: 'Low' },
      { item: 'Body & Interior', amount: Math.round(baseCost * 0.1), urgency: 'Low' },
      { item: 'Routine Servicing', amount: Math.round(baseCost * 0.1), urgency: 'Low' }
    ],
    detectedIssues: knownIssues.map(issue => ({
      title: issue,
      description: `Seller-disclosed issue: ${issue}`,
      severity: 'Medium',
      estimatedCost: 5000
    })),
    scoreBreakdown: { ageScore, kmScore, imageScore: 75, ownerScore },
    fairMarketPrice: 0,
    negotiationRoom: Math.round(baseCost * 0.5),
    narrative: `This ${year} ${make} ${model} has covered ${km.toLocaleString()}km over ${age} years. Score is based on disclosed information only; no photos were analyzed.`,
    redFlags: age > 7 ? ['High vehicle age'] : [],
    positives: []
  };
}

module.exports = router;
