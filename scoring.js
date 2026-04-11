// ============================================================
// backend/utils/scoring.js
// Shared scoring logic used by the analyze route as a fallback
// ============================================================

/**
 * Calculate a condition score purely from car specs.
 * Used when AI JSON parsing fails or as a sanity check.
 *
 * @param {Object} params
 * @param {number} params.age       - Car age in years
 * @param {number} params.kmDriven  - KM driven
 * @param {number} params.owners    - Number of owners
 * @param {number} params.issues    - Number of known issues
 * @returns {Object} { total, ageScore, kmScore, ownerScore, issueScore }
 */
function calculateConditionScore({ age, kmDriven, owners = 1, issues = 0 }) {
  const ageScore   = Math.max(0, Math.round(100 - age * 7));
  const kmScore    = Math.max(0, Math.round(100 - kmDriven / 1500));
  const ownerScore = Math.max(0, Math.round(100 - (owners - 1) * 22));
  const issueScore = Math.max(0, Math.round(100 - issues * 15));

  const total = Math.round(
    ageScore   * 0.25 +
    kmScore    * 0.30 +
    issueScore * 0.30 +
    ownerScore * 0.15
  );

  return { total, ageScore, kmScore, ownerScore, issueScore };
}

/**
 * Map score to recommendation.
 * @param {number} score - 0 to 100
 * @returns {'BUY'|'NEGOTIATE'|'AVOID'}
 */
function scoreToRecommendation(score) {
  if (score >= 70) return 'BUY';
  if (score >= 45) return 'NEGOTIATE';
  return 'AVOID';
}

/**
 * Map score to grade label.
 * @param {number} score
 * @returns {string}
 */
function scoreToGrade(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 35) return 'Poor';
  return 'Very Poor';
}

module.exports = { calculateConditionScore, scoreToRecommendation, scoreToGrade };
