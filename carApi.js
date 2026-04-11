// ============================================================
// src/api/carApi.js
// Axios-based API client for AutoInsight backend
// ============================================================

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,  // 60s timeout for AI analysis
});

/**
 * Convert a File object to base64 string
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * POST /api/analyze-car
 * Full AI analysis of car details + optional images
 *
 * @param {Object} formData - Car details from the form
 * @param {File[]} imageFiles - Array of File objects
 * @returns {Object} Analysis result
 */
export async function analyzeCar(formData, imageFiles = []) {
  // Convert image files to base64 for API transport
  const images = await Promise.all(
    imageFiles.slice(0, 4).map(async (file) => ({
      data: await fileToBase64(file),
      mediaType: file.type || 'image/jpeg'
    }))
  );

  const response = await api.post('/analyze-car', {
    ...formData,
    images
  });

  return response.data;
}

/**
 * POST /api/predict-cost
 * ML-only maintenance cost prediction (no images)
 *
 * @param {Object} params - { year, kmDriven, fuelType, owners, make }
 * @returns {Object} { annualCost, breakdown, confidence }
 */
export async function predictCost(params) {
  const response = await api.post('/predict-cost', params);
  return response.data;
}

/**
 * POST /api/image-analysis
 * Image-only damage detection
 *
 * @param {File[]} imageFiles - Array of File objects
 * @returns {Object} { issues, overallImageScore }
 */
export async function analyzeImages(imageFiles) {
  const images = await Promise.all(
    imageFiles.slice(0, 4).map(async (file) => ({
      data: await fileToBase64(file),
      mediaType: file.type || 'image/jpeg'
    }))
  );

  const response = await api.post('/image-analysis', { images });
  return response.data;
}

/**
 * GET /api/analyze-car/history
 * Fetch past analyses from database
 */
export async function getHistory() {
  const response = await api.get('/analyze-car/history');
  return response.data;
}

export default api;
