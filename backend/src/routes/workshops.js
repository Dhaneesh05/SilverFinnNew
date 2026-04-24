const express = require('express');
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/workshops/me — Current workshop info
router.get('/me', async (req, res, next) => {
  try {
    const workshop = await prisma.workshop.findUnique({
      where: { id: req.user.workshopId },
      include: {
        _count: { select: { users: true, customers: true, vehicles: true, sessions: true } },
      },
    });
    if (!workshop) return res.status(404).json({ error: 'Workshop not found' });
    res.json(workshop);
  } catch (err) { next(err); }
});

// GET /api/workshops/me/stats — Dashboard summary stats
router.get('/me/stats', async (req, res, next) => {
  try {
    const wid = req.user.workshopId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalVehicles,
      totalCustomers,
      sessionsToday,
      activeAlerts,
      recentSessions,
    ] = await Promise.all([
      prisma.vehicle.count({ where: { workshopId: wid } }),
      prisma.customer.count({ where: { workshopId: wid } }),
      prisma.serviceSession.count({ where: { workshopId: wid, sessionDate: { gte: today } } }),
      prisma.maintenanceAlert.count({ where: { workshopId: wid, status: 'ACTIVE' } }),
      prisma.serviceSession.findMany({
        where: { workshopId: wid },
        orderBy: { sessionDate: 'desc' },
        take: 5,
        include: {
          vehicle: { select: { make: true, model: true, plateNumber: true } },
          mechanic: { select: { name: true } },
        },
      }),
    ]);

    res.json({ totalVehicles, totalCustomers, sessionsToday, activeAlerts, recentSessions });
  } catch (err) { next(err); }
});

// GET /api/workshops/me/users — All users in this workshop (Admin only)
router.get('/me/users', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { workshopId: req.user.workshopId },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, isActive: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (err) { next(err); }
});

module.exports = router;
