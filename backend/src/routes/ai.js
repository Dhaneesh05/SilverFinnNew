const express = require('express');
const { processChat } = require('../services/ragService');

const router = express.Router();

// POST /api/ai/chat
router.post('/chat', async (req, res, next) => {
  try {
    const { message, vehicleId, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fallback workshop ID for demo purposes
    const workshopId = req.user?.workshopId || 1; 

    const reply = await processChat(
      vehicleId, 
      workshopId, 
      message, 
      history || []
    );

    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
