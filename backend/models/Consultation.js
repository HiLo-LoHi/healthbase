const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  residentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  visitDate:     { type: Date, required: true },
  complaint:     String,
  diagnosis:     String,
  temperature:   String,
  bloodPressure: String,
  heartRate:     String,
  notes:         String,
  worker:        String,
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' }
}, { timestamps: true });

consultationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Consultation', consultationSchema);
