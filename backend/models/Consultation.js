const mongoose = require('mongoose');
const consultationSchema = new mongoose.Schema({
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
visitDate: { type: Date, required: true },
complaint: String,
diagnosis: String,
temperature: String,
bloodPressure: String,
heartRate: String,
notes: String,
userId: {type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount'}
}, { timestamps: true });
module.exports = mongoose.model('Consultation', consultationSchema);
