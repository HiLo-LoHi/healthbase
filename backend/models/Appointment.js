const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' },
  date:       { type: Date, required: true },
  purpose:    String,
  worker:     String,
  status: {
    type:    String,
    enum:    ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

appointmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
