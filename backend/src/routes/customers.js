const express = require('express');
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/customers — List all customers for this workshop
router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      workshopId: req.user.workshopId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: { vehicles: { select: { id: true, make: true, model: true, year: true, plateNumber: true, glbModelKey: true, currentMileage: true } } },
        orderBy: { name: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({ data: customers, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
});

// GET /api/customers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, workshopId: req.user.workshopId },
      include: {
        vehicles: {
          include: {
            sessions: {
              orderBy: { sessionDate: 'desc' },
              take: 5,
              select: { id: true, sessionDate: true, serviceType: true, mileageAtVisit: true, totalCostMyr: true },
            },
          },
        },
      },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) { next(err); }
});

// POST /api/customers
router.post('/', async (req, res, next) => {
  try {
    const { name, phone, email, notes, vehicle } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

    const data = { workshopId: req.user.workshopId, name, phone, email, notes };
    
    if (vehicle && vehicle.plateNumber && vehicle.make && vehicle.model) {
      data.vehicles = {
        create: {
          workshopId: req.user.workshopId,
          make: vehicle.make,
          model: vehicle.model,
          year: parseInt(vehicle.year, 10) || new Date().getFullYear(),
          plateNumber: vehicle.plateNumber,
          glbModelKey: vehicle.glbModelKey || undefined,
        }
      };
    }

    const customer = await prisma.customer.create({
      data,
      include: { vehicles: true }
    });
    res.status(201).json(customer);
  } catch (err) { next(err); }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, phone, email, notes } = req.body;
    const customer = await prisma.customer.updateMany({
      where: { id: req.params.id, workshopId: req.user.workshopId },
      data: { name, phone, email, notes },
    });
    if (customer.count === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
