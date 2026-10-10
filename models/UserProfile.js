const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const familyMemberSchema = new Schema({
  name: { type: String, required: true, trim: true },
  relation: { type: String, required: true },
  age: { type: Number, required: true, min: 0 },
  gender: { type: String, default: 'Male' },
  occupation: { type: String, default: 'Farmer' },
  qualification: { type: String, default: '10th Pass' },
  annualIncome: { type: Number, default: 0 },
  disabilityStatus: { type: Boolean, default: false }
}, { timestamps: true });

const documentChecklistItemSchema = new Schema({
  docName: { type: String, required: true },
  status: { type: String, default: 'Available' },
  notes: { type: String, default: '' },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const actionPlanTaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' },
  priority: { type: String, default: 'Medium' },
  isCompleted: { type: Boolean, default: false },
  deadline: { type: String, default: 'Flexible' },
  officialUrl: { type: String, default: '' },
  schemeName: { type: String, default: '' }
}, { timestamps: true });

const userProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  age: { type: Number, default: 25, min: 0 },
  gender: { type: String, default: 'Male' },
  annualIncome: { type: Number, default: 100000, min: 0 },
  occupation: { type: String, default: 'Citizen' },
  qualification: { type: String, default: 'Graduate / Degree' },
  casteCategory: { type: String, default: 'General' },
  state: {
    type: Schema.Types.ObjectId,
    ref: 'State',
    default: null
  },
  district: { type: String, default: '' },
  maritalStatus: { type: String, default: 'Single' },
  disabilityStatus: { type: Boolean, default: false },
  savedSchemes: [{
    type: Schema.Types.ObjectId,
    ref: 'Scheme'
  }],
  familyMembers: [familyMemberSchema],
  documentChecklist: [documentChecklistItemSchema],
  readinessScore: {
    overall: { type: Number, default: 75 },
    profileCompleteness: { type: Number, default: 80 },
    eligibilityConfidence: { type: Number, default: 70 },
    documentReadiness: { type: Number, default: 70 },
    applicationReadiness: { type: Number, default: 70 },
    lastCalculated: { type: Date, default: Date.now }
  },
  actionPlanTasks: [actionPlanTaskSchema]
}, { timestamps: true });

const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
