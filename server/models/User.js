const mongoose = require('mongoose');
const UserProfile = require('./UserProfile');

const otpSchema = new mongoose.Schema({
  codeHash: { type: String, default: null },
  expiresAt: { type: Date, default: null },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: null }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, trim: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, default: null },
  
  hash: { type: String, default: null },
  salt: { type: String, default: null },

  isEmailVerified: { type: Boolean, default: true },
  isPhoneVerified: { type: Boolean, default: true },
  accountStatus: { 
    type: String, 
    enum: ['PendingVerification', 'Active', 'Suspended'], 
    default: 'Active' 
  },

  emailOtp: { type: otpSchema, default: () => ({}) },
  phoneOtp: { type: otpSchema, default: () => ({}) },

  refreshTokens: [{ type: String }],
  lastLogin: { type: Date, default: null },

  isCitizen: { type: Boolean, default: true },
  isModerator: { type: Boolean, default: false },
  isAdminUser: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = { User, UserProfile };

