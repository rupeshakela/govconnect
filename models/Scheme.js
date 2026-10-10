const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  category: { 
    type: String, 
    enum: ['Farmers', 'Women', 'Students', 'Senior Citizens', 'Startups', 'Businesses', 'Healthcare', 'General'],
    default: 'General'
  },
  eligibilityCriteria: { type: String, required: true },
  incomeLimit: { type: Number, default: 300000.00 },
  minAge: { type: Number, default: 0 },
  maxAge: { type: Number, default: 100 },
  genderRequirement: { type: String, enum: ['Any', 'Male', 'Female'], default: 'Any' },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', default: null },
  benefitAmount: { type: Number, default: 0.00 },
  documentsRequired: { type: String, required: true },
  applicationProcess: { type: String, required: true },
  officialWebsite: { type: String, required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
