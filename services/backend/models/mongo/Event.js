const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const { Schema, model } = mongoose;

const eventSchema = new Schema({
  loanId: {
    type: String,
    default: nanoid,
  },
  description: String,
  eventDate: { type: Date, default: Date.now },
  eventType: String,
  remarks: [{
    text: String,
    adminId: String,
    remarkedAt: { type: Date, default: Date.now }
  }],
  userId: String, // TODO CHANGE TO ID?
  assetId: String,
  adminId: { type: String, ref: 'Admin' }
}, { timestamps: true });

eventSchema.index({ userId: 1, eventDate: -1 });  // Optimize for user-based queries
eventSchema.index({ assetId: 1, eventDate: -1 }); // Optimize for asset-based queries

const Event = model('Event', eventSchema);

module.exports = Event;