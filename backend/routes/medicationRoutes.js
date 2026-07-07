const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// POST — save new medication
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const record = new Medication(req.body);
        const saved = await record.save();

        res.json({ success: true, record: saved });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET — all medications for a resident
router.get('/', async (req, res) => {
    try {
        const query = req.query.residentId
            ? { residentId: req.query.residentId }
            : {};

        const records = await Medication.find(query).sort({ prescribedDate: -1 });

        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;