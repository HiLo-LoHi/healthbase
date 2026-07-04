const mongoose = require('mongoose');
const medicationSchema = new mongoose.Schema({
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
    medicationName: { type: String, required: true },
    dosage: String,
    prescribedDate: Date,
    duration: String,
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);