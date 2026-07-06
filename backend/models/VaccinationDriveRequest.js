const mongoose = require('mongoose');

const vaccinationDriveRequestSchema = new mongoose.Schema({
  residentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  vaccineType:   String,
  preferredDate: Date,
  location:      String,
  status: {
    type:    String,
    enum:    ['Pending', 'Approved', 'Declined'],
    default: 'Pending'
  },
  remarks: String
}, { timestamps: true });

vaccinationDriveRequestSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('VaccinationDriveRequest', vaccinationDriveRequestSchema);
