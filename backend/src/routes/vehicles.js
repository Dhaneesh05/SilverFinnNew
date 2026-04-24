const express = require('express');
const prisma  = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/vehicles — All vehicles for this workshop (with optional filters)
router.get('/', async (req, res, next) => {
  try {
    const { customerId, make, model, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      workshopId: req.user.workshopId,
      ...(customerId && { customerId }),
      ...(make && { make: { contains: make, mode: 'insensitive' } }),
      ...(model && { model: { contains: model, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { plateNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          alerts: { where: { status: 'ACTIVE' }, select: { id: true, alertType: true, probability: true } },
          _count: { select: { sessions: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.json({ data: vehicles, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
});

// GET /api/vehicles/:id — Single vehicle with full history
router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: req.params.id, workshopId: req.user.workshopId },
      include: {
        customer: true,
        alerts: { where: { status: 'ACTIVE' }, orderBy: { probability: 'desc' } },
        sessions: {
          orderBy: { sessionDate: 'desc' },
          include: {
            mechanic: { select: { id: true, name: true } },
            replacedParts: true,
            _count: { select: { checkItems: true } },
          },
        },
      },
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) { next(err); }
});

// POST /api/vehicles
router.post('/', async (req, res, next) => {
  try {
    const { customerId, make, model, year, plateNumber, vin, colour, engineType, transmissionType, currentMileage } = req.body;
    if (!customerId || !make || !model || !year || !plateNumber) {
      return res.status(400).json({ error: 'customerId, make, model, year, plateNumber required' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        workshopId: req.user.workshopId,
        customerId, make, model, year: Number(year),
        plateNumber: plateNumber.toUpperCase(),
        vin, colour, engineType, transmissionType,
        currentMileage: currentMileage ? Number(currentMileage) : 0,
      },
      include: { customer: { select: { id: true, name: true } } },
    });
    res.status(201).json(vehicle);
  } catch (err) { next(err); }
});

// PUT /api/vehicles/:id — Update mileage or details
router.put('/:id', async (req, res, next) => {
  try {
    const { make, model, year, plateNumber, vin, colour, engineType, transmissionType, currentMileage } = req.body;
    const result = await prisma.vehicle.updateMany({
      where: { id: req.params.id, workshopId: req.user.workshopId },
      data: {
        ...(make && { make }),
        ...(model && { model }),
        ...(year && { year: Number(year) }),
        ...(plateNumber && { plateNumber: plateNumber.toUpperCase() }),
        ...(vin !== undefined && { vin }),
        ...(colour !== undefined && { colour }),
        ...(engineType !== undefined && { engineType }),
        ...(transmissionType !== undefined && { transmissionType }),
        ...(currentMileage !== undefined && { currentMileage: Number(currentMileage) }),
      },
    });
    if (result.count === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
