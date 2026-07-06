const express = require('express');
const router = express.Router();
const VaccinationDriveRequest = require('../models/VaccinationDriveRequest');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// POST — save a new vaccination drive request
router.post('/', verifyToken, async (req, res) => {
  try {
    const request = new VaccinationDriveRequest(req.body);
    const saved = await request.save();
    res.json({ success: true, request: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — return all vaccination drive requests
router.get('/', async (req, res) => {
  try {
    const requests = await VaccinationDriveRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH — approve or decline a request
router.patch('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updated = await VaccinationDriveRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;