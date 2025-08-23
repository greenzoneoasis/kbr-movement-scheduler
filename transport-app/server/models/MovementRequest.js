const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  route: {
    type: String,
    enum: ['BEC → BDSC', 'BDSC → BEC', 'Union III → BDSC', 'BDSC → Union III'],
    required: true
  },
  notes: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submissionDate: { type: Date, default: Date.now },
  submissionTime: { type: String, default: () => new Date().toLocaleTimeString() },
  status: {
    type: String,
    enum: ['pending', 'declined', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  namePosition: { type: String }
});

// Pre-save hook to compute namePosition
requestSchema.pre('save', function (next) {
  this.namePosition = `${this.name} - ${this.position}`;
  next();
});

module.exports = mongoose.model('MovementRequest', requestSchema);