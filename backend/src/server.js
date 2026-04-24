require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes      = require('./routes/auth');
const workshopRoutes  = require('./routes/workshops');
const customerRoutes  = require('./routes/customers');
const vehicleRoutes   = require('./routes/vehicles');
const sessionRoutes   = require('./routes/sessions');
const checklistRoutes = require('./routes/checklists');
const partRoutes      = require('./routes/parts');
const alertRoutes     = require('./routes/alerts');
const predictionRoutes = require('./routes/predictions');
const uploadRoutes    = require('./routes/upload');
const aiRoutes        = require('./routes/ai');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Silver Finn API', ts: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/workshops',   workshopRoutes);
app.use('/api/customers',   customerRoutes);
app.use('/api/vehicles',    vehicleRoutes);
app.use('/api/sessions',    sessionRoutes);
app.use('/api/checklists',  checklistRoutes);
app.use('/api/parts',       partRoutes);
app.use('/api/alerts',      alertRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/upload',      uploadRoutes);
app.use('/api/ai',          aiRoutes);

// ── Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔧 Silver Finn API running on http://localhost:${PORT}`);
});

module.exports = app;
