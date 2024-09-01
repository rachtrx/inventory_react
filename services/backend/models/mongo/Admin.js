const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const { Schema, model } = mongoose;

const adminSchema = new Schema({
  _id: { type: String, required: true },
  adminName: { type: String, required: true },
  displayName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  pwd: { type: String, required: false },  // Make password optional
  authType: { type: [String], enum: ['SSO', 'local'], required: true },
  preferences: {
    dashboard: {
      theme: { type: String, default: 'light' },
      layout: { type: String, default: 'grid' }
    },
  }
}, { timestamps: true });
  
  
const Admin = model('Admin', adminSchema);

module.exports = Admin;