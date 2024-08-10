const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { v4: uuidv4 } = require('uuid');

const eventSchema = new Schema({
  _id: {
    type: String,   // Set _id type to String
    default: uuidv4 // Default to a UUIDv4
  },
  description: String,
  eventDate: { type: Date, default: Date.now },
  eventType: String,
  remarks: [{
    text: String,
    adminId: String,
    remarkedAt: { type: Date, default: Date.now }
  }],
  user: String,
  // peripherals: [{
  //   id: String,
  //   typeId: String,
  // }],
  peripherals: [String],
  assetId: String,
  filePath: String,
  adminId: { type: String, ref: 'Admin' }
}, { timestamps: true });

eventSchema.index({ userId: 1, eventDate: -1 });  // Optimize for user-based queries
eventSchema.index({ assetId: 1, eventDate: -1 }); // Optimize for asset-based queries

const Event = model('Event', eventSchema);

module.exports = Event