const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const eventSchema = new Schema({
    eventDate: { type: Date, default: Date.now },
    eventType: String,
    remarks: [{
      text: String,
      authorisedUserId: String,
      remarkedAt: { type: Date, default: Date.now }
    }],
    userId: String,
    assetId: String,
    filePath: String,
    authorisedUserId: { type: Schema.Types.ObjectId, ref: 'AuthorisedUser' }
  }, { timestamps: true });

eventSchema.index({ userId: 1, eventDate: -1 });  // Optimize for user-based queries
eventSchema.index({ assetId: 1, eventDate: -1 }); // Optimize for asset-based queries

const Event = model('Event', eventSchema);

module.exports = Event