const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  residentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  vaccineType:      { type: String, required: true },
  doseNumber:       String,
  dateAdministered: Date
}, { timestamps: true });

vaccinationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Vaccination', vaccinationSchema);
