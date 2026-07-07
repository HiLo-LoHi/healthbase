const express = require('express');
const router = express.Router();
const Vaccination = require('../models/Vaccination');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// POST — save new vaccination
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const record = new Vaccination(req.body);
        const saved = await record.save();

        res.json({ success: true, record: saved });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET — all vaccinations for a resident
router.get('/', async (req, res) => {
    try {
        const query = req.query.residentId
            ? { residentId: req.query.residentId }
            : {};

        const records = await Vaccination.find(query).sort({ dateAdministered: -1 });

        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;