const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  username:  { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'patient'], default: 'patient' },
  email:     String,
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('UserAccount', userSchema);