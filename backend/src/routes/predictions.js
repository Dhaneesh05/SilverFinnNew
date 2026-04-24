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
    const { make, model, limit = 10 } = req.query;

    // Raw aggregation: count replaced parts grouped by partName
    const results = await prisma.replacedPart.groupBy({
      by: ['partName', 'category'],
      where: {
        session: {
          workshopId: req.user.workshopId,
          ...(make || model
            ? {
                vehicle: {
                  ...(make && { make: { contains: make, mode: 'insensitive' } }),
                  ...(model && { model: { contains: model, mode: 'insensitive' } }),
                },
              }
            : {}),
        },
      },
      _count: { partName: true },
      _avg: { costMyr: true },
      orderBy: { _count: { partName: 'desc' } },
      take: Number(limit),
    });

    res.json(results.map((r) => ({
      partName: r.partName,
      category: r.category,
      count: r._count.partName,
      avgCostMyr: r._avg.costMyr ? Number(r._avg.costMyr).toFixed(2) : null,
    })));
  } catch (err) { next(err); }
});

/**
 * GET /api/predictions/analytics/service-frequency
 * How often do cars of each make/model come in?
 */
router.get('/analytics/service-frequency', async (req, res, next) => {
  try {
    const results = await prisma.vehicle.groupBy({
      by: ['make', 'model'],
      where: { workshopId: req.user.workshopId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    res.json(results.map((r) => ({ make: r.make, model: r.model, vehicleCount: r._count.id })));
  } catch (err) { next(err); }
});

module.exports = router;
