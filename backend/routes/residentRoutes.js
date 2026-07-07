const express  = require('express');
const router   = express.Router();
const Resident = require('../models/Resident');

// POST — save new resident
router.post('/', async (req, res) => {
  try {
    const resident = new Resident(req.body);
    const saved = await resident.save();
    res.json({ success: true, resident: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — search all residents (optional name filter)
router.get('/', async (req, res) => {
  try {
    let query = {};

    if (req.query.name) {
      query.$or = [
        { firstName: { $regex: req.query.name, $options: 'i' } },
        { lastName:  { $regex: req.query.name, $options: 'i' } }
      ];
    }

    const residents = await Resident.find(query).sort({ createdAt: -1 });
    res.json(residents);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — single resident by ID
router.get('/:id', async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    res.json(resident);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;