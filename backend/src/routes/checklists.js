const express = require('express');
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/checklists/templates — All templates for this workshop
router.get('/templates', async (req, res, next) => {
  try {
    const templates = await prisma.checklistTemplate.findMany({
      where: { workshopId: req.user.workshopId, isActive: true },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { mileageTrigger: 'asc' },
    });
    res.json(templates);
  } catch (err) { next(err); }
});

// GET /api/checklists/templates/suggest?mileage=45000&serviceType=MAJOR
// Returns the best-matching template for a given mileage
router.get('/templates/suggest', async (req, res, next) => {
  try {
    const { mileage, serviceType } = req.query;
    if (!mileage) return res.status(400).json({ error: 'mileage required' });

    const km = Number(mileage);
    // Find the closest template at or below the current mileage
    const template = await prisma.checklistTemplate.findFirst({
      where: {
        workshopId: req.user.workshopId,
        isActive: true,
        mileageTrigger: { lte: km },
        ...(serviceType && { serviceType }),
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { mileageTrigger: 'desc' }, // closest match below current km
    });

    res.json(template || null);
  } catch (err) { next(err); }
});

// GET /api/checklists/templates/:id
router.get('/templates/:id', async (req, res, next) => {
  try {
    const template = await prisma.checklistTemplate.findFirst({
      where: { id: req.params.id, workshopId: req.user.workshopId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (err) { next(err); }
});

// POST /api/checklists/templates — Create new template (Advisor/Admin only)
router.post('/templates', requireRole('ADVISOR', 'ADMIN'), async (req, res, next) => {
  try {
    const { name, description, mileageTrigger, serviceType, items } = req.body;
    if (!name || !mileageTrigger || !serviceType) {
      return res.status(400).json({ error: 'name, mileageTrigger, serviceType required' });
    }

    const template = await prisma.checklistTemplate.create({
      data: {
        workshopId: req.user.workshopId,
        name, description,
        mileageTrigger: Number(mileageTrigger),
        serviceType,
        items: {
          create: (items || []).map((item, idx) => ({
            zone: item.zone,
            category: item.category,
            itemName: item.itemName,
            guideline: item.guideline,
            isMandatory: item.isMandatory !== false,
            sortOrder: item.sortOrder ?? idx,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(template);
  } catch (err) { next(err); }
});

// PUT /api/checklists/templates/:id — Update template
router.put('/templates/:id', requireRole('ADVISOR', 'ADMIN'), async (req, res, next) => {
  try {
    const { name, description, mileageTrigger, serviceType, isActive } = req.body;
    const result = await prisma.checklistTemplate.updateMany({
      where: { id: req.params.id, workshopId: req.user.workshopId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(mileageTrigger !== undefined && { mileageTrigger: Number(mileageTrigger) }),
        ...(serviceType && { serviceType }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    if (result.count === 0) return res.status(404).json({ error: 'Template not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
