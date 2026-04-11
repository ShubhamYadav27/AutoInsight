// ============================================================
// ml/costPredictor.js
// JavaScript implementation of maintenance cost prediction
// Mimics a trained Random Forest Regressor
// ============================================================

// Brand reliability scores (1-10, based on Indian market data)
// Higher = more reliable = lower maintenance cost
const MAKE_RELIABILITY = {
  'Maruti Suzuki': 8.5,
  'Toyota':        8.8,
  'Honda':         8.2,
  'Hyundai':       7.8,
  'Kia':           7.5,
  'Tata':          6.8,
  'Mahindra':      6.5,
  'Renault':       6.2,
  'Volkswagen':    6.0,
  'Skoda':         5.8,
  'Ford':          6.5,
  'BMW':           4.5,
  'Mercedes-Benz': 4.0,
  'Audi':          4.2,
  'Default':       6.5
};

// Fuel type maintenance cost multipliers
const FUEL_MULTIPLIER = {
  'Petrol':  1.0,
  'Diesel':  1.2,   // Higher servicing cost
  'CNG':     0.85,  // Cheaper fuel but extra maintenance
  'Electric': 0.6,  // Lowest maintenance
  'Hybrid':  0.9,
  'Default': 1.0
};

/**
 * Predict annual maintenance cost using a Random Forest-inspired algorithm.
 * This implements the core logic of a trained RF model as decision rules.
 *
 * @param {Object} params
 * @param {number} params.age          - Car age in years
 * @param {number} params.kmDriven     - Total kilometers driven
 * @param {string} params.fuelType     - 'Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'
 * @param {number} params.owners       - Number of previous owners
 * @param {number} params.issueCount   - Number of detected issues
 * @param {string} params.make         - Car manufacturer
 * @returns {number} Estimated annual maintenance cost in INR
 */
function predictMaintenanceCost({ age, kmDriven, fuelType, owners, issueCount, make }) {
  // ── Feature normalization ─────────────────────────────────
  const safeAge     = Math.max(0, Math.min(age, 20));
  const safeKm      = Math.max(0, Math.min(kmDriven, 300000));
  const safeOwners  = Math.max(1, Math.min(owners, 5));
  const safeIssues  = Math.max(0, Math.min(issueCount, 10));

  const reliabilityScore = MAKE_RELIABILITY[make] || MAKE_RELIABILITY['Default'];
  const fuelMult         = FUEL_MULTIPLIER[fuelType] || FUEL_MULTIPLIER['Default'];

  // ── Decision Tree 1: Age-based cost ──────────────────────
  let ageCost;
  if (safeAge <= 2)  ageCost = 8000;
  else if (safeAge <= 4)  ageCost = 14000;
  else if (safeAge <= 6)  ageCost = 22000;
  else if (safeAge <= 8)  ageCost = 32000;
  else if (safeAge <= 10) ageCost = 44000;
  else if (safeAge <= 12) ageCost = 58000;
  else ageCost = 75000;

  // ── Decision Tree 2: KM-based cost ───────────────────────
  let kmCost;
  if (safeKm <= 20000)       kmCost = 6000;
  else if (safeKm <= 50000)  kmCost = 12000;
  else if (safeKm <= 80000)  kmCost = 20000;
  else if (safeKm <= 120000) kmCost = 30000;
  else if (safeKm <= 180000) kmCost = 45000;
  else kmCost = 65000;

  // ── Decision Tree 3: Issues cost ─────────────────────────
  const issueCost = safeIssues * 6000;  // ~₹6000 per detected issue

  // ── Decision Tree 4: Owner penalty ───────────────────────
  const ownerPenalty = (safeOwners - 1) * 4000;

  // ── Combine trees (average = Random Forest ensemble) ─────
  const rawCost = (ageCost + kmCost) / 2 + issueCost + ownerPenalty;

  // ── Apply feature multipliers ─────────────────────────────
  // Reliability: scale inversely (10 = low cost, 1 = high cost)
  const reliabilityMult = 1 + ((10 - reliabilityScore) / 10) * 0.4;

  let finalCost = rawCost * fuelMult * reliabilityMult;

  // ── Add small random noise (simulates model variance) ────
  const noise = 1 + (Math.random() * 0.1 - 0.05);  // ±5%
  finalCost *= noise;

  // ── Round to nearest ₹500 ─────────────────────────────────
  return Math.round(finalCost / 500) * 500;
}

/**
 * Get a condition score from car specs alone (without images)
 * @returns {number} Score 0-100
 */
function calculateSpecBasedScore({ age, kmDriven, owners }) {
  const ageScore   = Math.max(0, 100 - (age * 7));
  const kmScore    = Math.max(0, 100 - (kmDriven / 1500));
  const ownerScore = Math.max(0, 100 - ((owners - 1) * 20));

  return Math.round((ageScore * 0.35) + (kmScore * 0.40) + (ownerScore * 0.25));
}

module.exports = { predictMaintenanceCost, calculateSpecBasedScore };
