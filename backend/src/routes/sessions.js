const express = require('express');
const prisma  = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { generateAlerts } = require('../services/predictionService');

const router = express.Router();
router.use(authenticate);

// GET /api/sessions?vehicleId=xxx — All sessions for a vehicle
router.get('/', async (req, res, next) => {
  try {
    const { vehicleId, page = 1, limit = 10 } = req.query;
    if (!vehicleId) return res.status(400).json({ error: 'vehicleId required' });

    const skip = (Number(page) - 1) * Number(limit);
    const where = { vehicleId, workshopId: req.user.workshopId };

    const [sessions, total] = await Promise.all([
      prisma.serviceSession.findMany({
        where,
        include: {
          mechanic: { select: { id: true, name: true, avatarUrl: true } },
          replacedParts: true,
          checkItems: {
            include: { templateItem: { select: { itemName: true, zone: true, category: true } } },
          },
        },
        orderBy: { sessionDate: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.serviceSession.count({ where }),
    ]);

    res.json({ data: sessions, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
});

// GET /api/sessions/:id — Single session detail
router.get('/:id', async (req, res, next) => {
  try {
    const session = await prisma.serviceSession.findFirst({
      where: { id: req.params.id, workshopId: req.user.workshopId },
      include: {
        vehicle: { include: { customer: true } },
        mechanic: { select: { id: true, name: true, avatarUrl: true } },
        replacedParts: true,
        checkItems: {
          include: { templateItem: true },
          orderBy: { templateItem: { sortOrder: 'asc' } },
        },
      },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) { next(err); }
});

// POST /api/sessions — Start a new service session
router.post('/', async (req, res, next) => {
  try {
    const { vehicleId, mileageAtVisit, serviceType, notes } = req.body;
    if (!vehicleId || !mileageAtVisit || !serviceType) {
      return res.status(400).json({ error: 'vehicleId, mileageAtVisit, serviceType required' });
    }

    // Validate service type
    const validTypes = ['MINOR', 'MAJOR', 'INSPECTION'];
    if (!validTypes.includes(serviceType)) {
      return res.status(400).json({ error: `serviceType must be one of: ${validTypes.join(', ')}` });
    }

    // Ensure vehicle belongs to this workshop
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, workshopId: req.user.workshopId },
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    // Create session + update vehicle mileage in one transaction
    const session = await prisma.$transaction(async (tx) => {
      const s = await tx.serviceSession.create({
        data: {
          workshopId: req.user.workshopId,
          vehicleId,
          mechanicId: req.user.id,
          mileageAtVisit: Number(mileageAtVisit),
          serviceType,
          notes,
        },
        include: {
          vehicle: { include: { customer: { select: { id: true, name: true } } } },
          mechanic: { select: { id: true, name: true } },
        },
      });

      // Update current mileage if new reading is higher
      if (Number(mileageAtVisit) > vehicle.currentMileage) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { currentMileage: Number(mileageAtVisit) },
        });
      }

      return s;
    });

    res.status(201).json(session);
  } catch (err) { next(err); }
});

// POST /api/sessions/:id/complete — Finalize a session
router.post('/:id/complete', async (req, res, next) => {
  try {
    const { totalCostMyr, laborCostMyr } = req.body;

    const session = await prisma.serviceSession.updateMany({
      where: { id: req.params.id, workshopId: req.user.workshopId, isCompleted: false },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        ...(totalCostMyr !== undefined && { totalCostMyr }),
        ...(laborCostMyr !== undefined && { laborCostMyr }),
      },
    });

    if (session.count === 0) {
      return res.status(404).json({ error: 'Session not found or already completed' });
    }

    // Trigger prediction alert regeneration in background
    const s = await prisma.serviceSession.findUnique({ where: { id: req.params.id } });
    if (s) {
      generateAlerts(s.vehicleId, req.user.workshopId).catch(console.error);
    }

    res.json({ success: true, message: 'Session completed' });
  } catch (err) { next(err); }
});

// POST /api/sessions/:id/check-items — Submit checklist results
router.post('/:id/check-items', async (req, res, next) => {
  try {
    const { items } = req.body; // [{ templateItemId, result, notes, photoUrl }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array required' });
    }

    // Verify session ownership
    const session = await prisma.serviceSession.findFirst({
      where: { id: req.params.id, workshopId: req.user.workshopId },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Upsert check items (re-submit allowed)
    await prisma.$transaction(
      items.map((item) =>
        prisma.checkItem.upsert({
          where: {
            // Custom unique constraint: sessionId + templateItemId
            // Using a find-first + create/update pattern
            id: item.id || 'new-' + Math.random(), // placeholder
          },
          update: { result: item.result, notes: item.notes, photoUrl: item.photoUrl },
          create: {
            sessionId: req.params.id,
            templateItemId: item.templateItemId,
            result: item.result,
            notes: item.notes || null,
            photoUrl: item.photoUrl || null,
          },
        })
      )
    );

    res.json({ success: true, itemsLogged: items.length });
  } catch (err) { next(err); }
});

// POST /api/sessions/:id/replaced-parts — Log replaced parts
router.post('/:id/replaced-parts', async (req, res, next) => {
  try {
    const { parts } = req.body; // [{ partName, partNumber, brand, category, costMyr, quantity, photoUrl, notes }]
    if (!Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({ error: 'parts array required' });
    }

    const session = await prisma.serviceSession.findFirst({
      where: { id: req.params.id, workshopId: req.user.workshopId },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const created = await prisma.replacedPart.createMany({
      data: parts.map((p) => ({
        sessionId: req.params.id,
        partName: p.partName,
        partNumber: p.partNumber || null,
        brand: p.brand || null,
        category: p.category || null,
        costMyr: Number(p.costMyr),
        quantity: p.quantity ? Number(p.quantity) : 1,
        photoUrl: p.photoUrl || null,
        notes: p.notes || null,
      })),
    });

    res.status(201).json({ success: true, count: created.count });
  } catch (err) { next(err); }
});

module.exports = router;
