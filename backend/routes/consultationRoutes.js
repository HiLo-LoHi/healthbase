// routes/consultationRoutes.js
const express      = require('express');
const router       = express.Router();
const Consultation = require('../models/Consultation');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// POST — save new consultation
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const record = new Consultation(req.body);
    const saved  = await record.save();
    res.json({ success: true, record: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — all consultations for a resident
router.get('/', async (req, res) => {
  try {
    const query = req.query.residentId ? { residentId: req.query.residentId } : {};
    const records = await Consultation.find(query).sort({ visitDate: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
