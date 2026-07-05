const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  residentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  medicationName: { type: String, required: true },
  dosage:         String,
  prescribedDate: Date,
  duration:       String
}, { timestamps: true });

medicationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Medication', medicationSchema);
