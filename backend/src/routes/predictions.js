const express = require('express');
const { getPredictions, generateAlerts } = require('../services/predictionService');
const prisma  = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/predictions/:vehicleId
 * Returns ranked list of predicted parts likely needed for this vehicle.
 * Also triggers alert generation if stale.
 */
router.get('/:vehicleId', async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: req.params.vehicleId, workshopId: req.user.workshopId },
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const predictions = await getPredictions(vehicle.make, vehicle.model, vehicle.currentMileage);

    res.json({
      vehicle: { id: vehicle.id, make: vehicle.make, model: vehicle.model, currentMileage: vehicle.currentMileage },
      predictions,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) { next(err); }
});

/**
 * GET /api/predictions/analytics/top-parts?make=Toyota&model=Vios
 * Workshop-level analytics: most commonly replaced parts per model.
 */
router.get('/analytics/top-parts', async (req, res, next) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const csvPath = path.join(__dirname, '../../../mock_parts_dataset.csv');
    
    if (fs.existsSync(csvPath)) {
      const csvData = fs.readFileSync(csvPath, 'utf8');
      const lines = csvData.split('\n').filter(l => l.trim().length > 0);
      
      const partStats = {};
      
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length < 6) continue;
        
        const partName = row[1].replace(/"/g, '');
        const category = row[2].replace(/"/g, '');
        const mileage = parseInt(row[3], 10);
        const wasBroken = row[4].replace(/"/g, '') === 'Yes';
        
        if (!partStats[partName]) {
          partStats[partName] = { part: partName, category, totalMileage: 0, frequency: 0, brokenCount: 0 };
        }
        
        partStats[partName].totalMileage += mileage;
        partStats[partName].frequency += 1;
        if (wasBroken) partStats[partName].brokenCount += 1;
      }
      
      const results = Object.values(partStats).map(p => ({
        part: p.part,
        category: p.category,
        mileage: Math.round(p.totalMileage / p.frequency),
        frequency: p.frequency,
        failureProb: Math.round((p.brokenCount / p.frequency) * 100)
      })).sort((a, b) => b.frequency - a.frequency);
      
      return res.json(results);
    }
    
    // Fallback if no CSV
    return res.json([]);
  } catch (err) { next(err); }
});

/**
 * GET /api/predictions/analytics/service-frequency
 * How often do cars of each make/model come in?
 */
router.get('/analytics/service-frequency', async (req, res, next) => {
  try {
    // Fetch all sessions to correspond with the history page
    const sessions = await prisma.serviceSession.findMany({
      where: { workshopId: req.user.workshopId },
      include: { vehicle: true }
    });
    
    const freq = {};
    sessions.forEach(s => {
      if (s.vehicle) {
        const key = `${s.vehicle.make}|${s.vehicle.model}`;
        freq[key] = (freq[key] || 0) + 1;
      }
    });
    
    const results = Object.entries(freq).map(([key, count]) => {
      const [make, model] = key.split('|');
      return { make, model, vehicleCount: count };
    }).sort((a, b) => b.vehicleCount - a.vehicleCount);
    
    res.json(results);
  } catch (err) { next(err); }
});

/**
 * GET /api/predictions/analytics/inspection-failures
 * Top failed inspection items across the workshop.
 */
router.get('/analytics/inspection-failures', async (req, res, next) => {
  try {
    const checkItems = await prisma.checkItem.findMany({
      where: {
        result: 'FAIL',
        session: { workshopId: req.user.workshopId }
      },
      include: { templateItem: true }
    });

    const failures = {};
    checkItems.forEach(item => {
      const name = item.templateItem?.itemName || 'Unknown Item';
      failures[name] = (failures[name] || 0) + 1;
    });

    const results = Object.entries(failures)
      .map(([item, failCount]) => ({ item, failCount }))
      .sort((a, b) => b.failCount - a.failCount)
      .slice(0, 5); // top 5

    res.json(results);
  } catch (err) { next(err); }
});

module.exports = router;
