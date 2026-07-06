const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  firstName:  { type: String, required: true },
  lastName:   { type: String, required: true },
  birthdate:  Date,
  sex:        String,
  address:    String,
  contact:    String,
  bloodType:  String,
  occupation: String,
  condition:  String,
  vaccinated: { type: Boolean, default: false }
}, { timestamps: true });

residentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Resident', residentSchema);
