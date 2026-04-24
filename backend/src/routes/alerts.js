const express = require('express');
const prisma  = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/alerts?vehicleId=xxx — Active alerts for a vehicle
router.get('/', async (req, res, next) => {
  try {
    const { vehicleId, status = 'ACTIVE' } = req.query;

    const where = {
      workshopId: req.user.workshopId,
      status,
      ...(vehicleId && { vehicleId }),
    };

    const alerts = await prisma.maintenanceAlert.findMany({
      where,
      include: {
        vehicle: { select: { id: true, make: true, model: true, year: true, plateNumber: true } },
        dismissedBy: { select: { id: true, name: true } },
      },
      orderBy: [{ probability: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(alerts);
  } catch (err) { next(err); }
});

// POST /api/alerts/:id/dismiss — Mechanic dismisses an alert for this vehicle
router.post('/:id/dismiss', async (req, res, next) => {
  try {
    const { reason } = req.body;

    const result = await prisma.maintenanceAlert.updateMany({
      where: {
        id: req.params.id,
        workshopId: req.user.workshopId,
        status: 'ACTIVE',
      },
      data: {
        status: 'DISMISSED',
        dismissedById: req.user.id,
        dismissReason: reason || null,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Alert not found or already dismissed' });
    }

    res.json({ success: true, message: 'Alert dismissed' });
  } catch (err) { next(err); }
});

// POST /api/alerts/:id/resolve — Mark alert as resolved (part was replaced)
router.post('/:id/resolve', async (req, res, next) => {
  try {
    const result = await prisma.maintenanceAlert.updateMany({
      where: { id: req.params.id, workshopId: req.user.workshopId },
      data: { status: 'RESOLVED' },
    });
    if (result.count === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
