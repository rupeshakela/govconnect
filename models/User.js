const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongooseModule = require('passport-local-mongoose');
const passportLocalMongoose = passportLocalMongooseModule.default || passportLocalMongooseModule;

const otpSchema = new Schema({
  codeHash: { type: String, default: null },
  expiresAt: { type: Date, default: null },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: null }
}, { _id: false });

const userSchema = new Schema({
  username: { type: String, trim: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  
  isEmailVerified: { type: Boolean, default: true },
  isPhoneVerified: { type: Boolean, default: true },
  accountStatus: { 
    type: String, 
    enum: ['PendingVerification', 'Active', 'Suspended'], 
    default: 'Active' 
  },
  password: { type: String, default: null },

  emailOtp: { type: otpSchema, default: () => ({}) },
  phoneOtp: { type: otpSchema, default: () => ({}) },

  lastLogin: { type: Date, default: null },

  isCitizen: { type: Boolean, default: true },
  isModerator: { type: Boolean, default: false },
  isAdminUser: { type: Boolean, default: false }
}, { timestamps: true });

// Attach passport-local-mongoose with lowercase username
userSchema.plugin(passportLocalMongoose, { usernameLowerCase: true });

module.exports = mongoose.model('User', userSchema);

