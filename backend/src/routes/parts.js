const express = require('express');
const prisma  = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/parts?search=filter&brand=MANN&category=Engine
router.get('/', async (req, res, next) => {
  try {
    const { search, brand, category, make, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
      ...(category && { category: { contains: category, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { partName: { contains: search, mode: 'insensitive' } },
          { partNumber: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(make && { compatibleMakes: { has: make } }),
    };

    const [parts, total] = await Promise.all([
      prisma.partCatalogue.findMany({
        where,
        orderBy: { partName: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.partCatalogue.count({ where }),
    ]);

    res.json({ data: parts, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
});

// GET /api/parts/categories — Distinct categories list
router.get('/categories', async (req, res, next) => {
  try {
    const cats = await prisma.partCatalogue.groupBy({
      by: ['category'],
      orderBy: { category: 'asc' },
    });
    res.json(cats.map((c) => c.category));
  } catch (err) { next(err); }
});

// GET /api/parts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const part = await prisma.partCatalogue.findUnique({ where: { id: req.params.id } });
    if (!part) return res.status(404).json({ error: 'Part not found' });
    res.json(part);
  } catch (err) { next(err); }
});

module.exports = router;
