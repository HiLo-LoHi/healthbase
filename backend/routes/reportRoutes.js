const express = require('express');
const router = express.Router();

const Resident = require('../models/Resident');
const Consultation = require('../models/Consultation');
const Vaccination = require('../models/Vaccination');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');

router.get('/', async (req, res) => {
  try {
    const range = (req.query.range || 'weekly').toLowerCase();

    const now = new Date();
    let startDate = new Date(now);

    switch (range) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;

      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;

      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1);
        break;

      default:
        startDate.setDate(now.getDate() - 7);
    }

    const [
      residents,
      consultations,
      vaccinations,
      medications,
      appointments
    ] = await Promise.all([
      Resident.countDocuments({ createdAt: { $gte: startDate } }),
      Consultation.countDocuments({ createdAt: { $gte: startDate } }),
      Vaccination.countDocuments({ createdAt: { $gte: startDate } }),
      Medication.countDocuments({ createdAt: { $gte: startDate } }),
      Appointment.countDocuments({ createdAt: { $gte: startDate } })
    ]);

    res.json({
      range,
      residents,
      consultations,
      vaccinations,
      medications,
      appointments
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;