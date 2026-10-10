const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  department: { type: String, default: 'Government of India' },
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
  benefitType: { type: String, default: 'Direct Financial Aid / Subsidy' },
  documentsRequired: { type: String, required: true },
  applicationProcess: { type: String, required: true },
  officialWebsite: { type: String, required: true },
  
  // BenefitOS Intelligence Extensions
  applicationWindow: {
    status: { 
      type: String, 
      enum: ['Open Now', 'Opening Soon', 'Closing Soon', 'Year-Round', 'Closed'], 
      default: 'Open Now' 
    },
    deadline: { type: Date, default: null },
    cycleDescription: { type: String, default: 'Annual Cycle' },
    daysRemaining: { type: Number, default: null }
  },
  pathwayCategory: { 
    type: String, 
    enum: ['Education & Skill', 'Healthcare & Security', 'Enterprise & Livelihood', 'Agriculture & Rural', 'Social Welfare', 'General'], 
    default: 'General' 
  },
  pathwayStep: { type: Number, default: 1 }, // 1: Foundation/Support, 2: Skill/Training, 3: Employment/Growth
  tags: [{ type: String }],
  lastVerified: { type: String, default: 'September 2026' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);

