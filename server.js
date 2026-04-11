// ============================================================
// AutoInsight Backend - server.js
// Main Express server with all routes and middleware configured
// ============================================================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));  // Large limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Database Connection ───────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autoinsight')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.warn('⚠️  MongoDB not connected (results won\'t be saved):', err.message));

// ── Route Imports ─────────────────────────────────────────────
const analyzeRoutes = require('./routes/analyze');
const predictRoutes = require('./routes/predict');
const imageRoutes   = require('./routes/imageAnalysis');

// ── API Routes ────────────────────────────────────────────────
app.use('/api/analyze-car',     analyzeRoutes);
app.use('/api/predict-cost',    predictRoutes);
app.use('/api/image-analysis',  imageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 AutoInsight API running on http://localhost:${PORT}`);
});

module.exports = app;
