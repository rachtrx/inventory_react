const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const adminSchema = new Schema({
    name: String,
      preferences: {
      dashboard: {
        theme: { type: String, default: 'light' },
        layout: { type: String, default: 'grid' }
      },
    }
  }, { timestamps: true }); // Automatically adds createdAt and updatedAt fields
  
  
const Admin = model('Admin', adminSchema);

module.exports = Admin