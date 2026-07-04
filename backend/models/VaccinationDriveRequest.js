const mongoose = require('mongoose');

const vaccinationDriveRequestSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  vaccineType: String,
  preferredDate: Date,
  location: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Declined'],
    default: 'Pending'
  },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model(
  'VaccinationDriveRequest',
  vaccinationDriveRequestSchema
);