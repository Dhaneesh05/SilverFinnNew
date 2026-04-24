const express = require('express');
const multer  = require('multer');
const cloudinary = require('cloudinary').v2;
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — upload directly from buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

/**
 * POST /api/upload/part-photo
 * Uploads a photo of a car part (old or replaced).
 * Returns: { url, publicId }
 */
router.post('/part-photo', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `silverfinn/${req.user.workshopId}/parts`,
          resource_type: 'image',
          transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
        },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(req.file.buffer);
    });

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) { next(err); }
});

/**
 * POST /api/upload/check-photo
 * Photo taken during a check item inspection.
 */
router.post('/check-photo', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `silverfinn/${req.user.workshopId}/inspections`,
          resource_type: 'image',
          transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
        },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(req.file.buffer);
    });

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) { next(err); }
});

module.exports = router;
