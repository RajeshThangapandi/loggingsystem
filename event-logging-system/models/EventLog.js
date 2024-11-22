const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true },
  sourceAppId: { type: String, required: true },
  dataPayload: { type: Object, required: true },
  hash: { type: String, required: true },
  prevHash: { type: String, required: true },
});

// Index for scalability
eventLogSchema.index({ sourceAppId: 1, timestamp: -1 });

module.exports = mongoose.model('EventLog', eventLogSchema);
