const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccount'
  },
  date: {
    type: Date,
    required: true
  },
  purpose: String,
  status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);