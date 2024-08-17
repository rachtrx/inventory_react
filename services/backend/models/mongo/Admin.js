const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const adminSchema = new Schema({
<<<<<<< HEAD
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
=======
    name: String,
      preferences: {
      dashboard: {
        theme: { type: String, default: 'light' },
        layout: { type: String, default: 'grid' }
      },
    }
  }, { timestamps: true }); // Automatically adds createdAt and updatedAt fields
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
  
  
const Admin = model('Admin', adminSchema);

module.exports = Admin