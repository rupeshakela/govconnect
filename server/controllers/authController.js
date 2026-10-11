const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, UserProfile } = require('../models/User');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otpHelper');
const { sendEmailOTP, sendPhoneOTP } = require('../services/otpService');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

// @desc    User Registration (Direct Account Creation & Instant Session)
// @route   POST /api/auth/register/initiate
// @access  Public
const initiateRegister = async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  try {
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();
    const cleanFullName = fullName.trim();

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }]
    });

    if (existingUser && existingUser.accountStatus === 'Active') {
      return res.status(400).json({ success: false, message: 'An account with this Email or Mobile Number already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    let user = existingUser;
    if (!user) {
      user = new User({
        username: cleanEmail,
        fullName: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
        isEmailVerified: true,
        isPhoneVerified: true,
        accountStatus: 'Active',
        lastLogin: now
      });
    } else {
      user.username = cleanEmail;
      user.fullName = cleanFullName;
      user.email = cleanEmail;
      user.phone = cleanPhone;
      user.password = hashedPassword;
      user.isEmailVerified = true;
      user.isPhoneVerified = true;
      user.accountStatus = 'Active';
      user.lastLogin = now;
    }

    await user.save();

    // Create initial user profile if not present
    const existingProfile = await UserProfile.findOne({ user: user._id });
    if (!existingProfile) {
      await UserProfile.create({
        user: user._id,
        age: 25,
        gender: 'Any',
        annualIncome: 250000,
        occupation: 'Student'
      });
    }

    // Issue tokens directly so citizen is immediately logged in
    const accessToken = generateAccessToken(user._id, { isCitizen: user.isCitizen, isAdmin: user.isAdminUser });
    const refreshToken = generateRefreshToken(user._id);

    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);

    await user.save();

    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isCitizen: user.isCitizen,
      isAdminUser: user.isAdminUser,
      accessToken,
      refreshToken
    };

    return res.status(200).json({
      success: true,
      message: 'Account registered successfully! Welcome to BenefitOS.',
      accessToken,
      refreshToken,
      user: userData,
      data: userData
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email-otp
// @access  Public
const verifyEmailOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.emailOtp.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Maximum Email OTP attempts exceeded. Request a new OTP.' });
    }

    if (new Date() > new Date(user.emailOtp.expiresAt)) {
      return res.status(400).json({ success: false, message: 'Email OTP has expired' });
    }

    const isValid = await verifyOTP(otp, user.emailOtp.codeHash);
    user.emailOtp.attempts += 1;

    if (!isValid) {
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid Email OTP' });
    }

    user.isEmailVerified = true;
    if (user.isPhoneVerified) {
      user.accountStatus = 'Active';
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email OTP verified successfully',
      data: { isEmailVerified: user.isEmailVerified, isPhoneVerified: user.isPhoneVerified, accountStatus: user.accountStatus }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Phone OTP
// @route   POST /api/auth/verify-phone-otp
// @access  Public
const verifyPhoneOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.phoneOtp.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Maximum Phone OTP attempts exceeded. Request a new OTP.' });
    }

    if (new Date() > new Date(user.phoneOtp.expiresAt)) {
      return res.status(400).json({ success: false, message: 'Phone OTP has expired' });
    }

    const isValid = await verifyOTP(otp, user.phoneOtp.codeHash);
    user.phoneOtp.attempts += 1;

    if (!isValid) {
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid Phone OTP' });
    }

    user.isPhoneVerified = true;
    if (user.isEmailVerified) {
      user.accountStatus = 'Active';
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Phone OTP verified successfully',
      data: { isEmailVerified: user.isEmailVerified, isPhoneVerified: user.isPhoneVerified, accountStatus: user.accountStatus }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend Email OTP
// @route   POST /api/auth/resend-email-otp
// @access  Public
const resendEmailOtp = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const now = new Date();
    if (user.emailOtp.lastSentAt && (now - new Date(user.emailOtp.lastSentAt)) < OTP_RESEND_COOLDOWN_MS) {
      return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new Email OTP' });
    }

    const rawOtp = generateOTP();
    user.emailOtp = {
      codeHash: await hashOTP(rawOtp),
      expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
      attempts: 0,
      lastSentAt: now
    };
    await user.save();

    await sendEmailOTP(user.email, rawOtp);
    res.status(200).json({
      success: true,
      message: 'New Email OTP sent successfully',
      ...(process.env.NODE_ENV !== 'production' && { devOtp: rawOtp })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend Phone OTP
// @route   POST /api/auth/resend-phone-otp
// @access  Public
const resendPhoneOtp = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const now = new Date();
    if (user.phoneOtp.lastSentAt && (now - new Date(user.phoneOtp.lastSentAt)) < OTP_RESEND_COOLDOWN_MS) {
      return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new Phone OTP' });
    }

    const rawOtp = generateOTP();
    user.phoneOtp = {
      codeHash: await hashOTP(rawOtp),
      expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
      attempts: 0,
      lastSentAt: now
    };
    await user.save();

    await sendPhoneOTP(user.phone, rawOtp);
    res.status(200).json({
      success: true,
      message: 'New Phone OTP sent successfully',
      ...(process.env.NODE_ENV !== 'production' && { devOtp: rawOtp })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Instant Login via Email or Phone + Password
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Username/Email/Phone and Password are required' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }, { username: identifier.toLowerCase().trim() }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your username/email and password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your username/email and password.' });
    }

    // Ensure account is Active
    if (user.accountStatus !== 'Active') {
      user.accountStatus = 'Active';
      user.isEmailVerified = true;
      user.isPhoneVerified = true;
    }

    // Issue Tokens
    const accessToken = generateAccessToken(user._id, { isCitizen: user.isCitizen, isAdmin: user.isAdminUser });
    const refreshToken = generateRefreshToken(user._id);

    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isCitizen: user.isCitizen,
        isAdminUser: user.isAdminUser,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Silent Automatic Refresh Token Endpoint
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ success: false, message: 'Refresh token required' });

  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT_REFRESH_SECRET is missing' });
    }
    const decoded = jwt.verify(token, refreshSecret);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id, { isCitizen: user.isCitizen, isAdmin: user.isAdminUser });
    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ success: false, message: 'Expired or invalid refresh token' });
  }
};

// @desc    Initiate Password Reset via Dual OTP
// @route   POST /api/auth/forgot-password/initiate
// @access  Public
const initiateForgotPassword = async (req, res) => {
  const { identifier } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found with provided Email or Mobile number' });
    }

    const rawEmailOtp = generateOTP();
    const rawPhoneOtp = generateOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

    user.emailOtp = { codeHash: await hashOTP(rawEmailOtp), expiresAt, attempts: 0, lastSentAt: now };
    user.phoneOtp = { codeHash: await hashOTP(rawPhoneOtp), expiresAt, attempts: 0, lastSentAt: now };
    await user.save();

    await sendEmailOTP(user.email, rawEmailOtp);
    await sendPhoneOTP(user.phone, rawPhoneOtp);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your Email',
      data: {
        userId: user._id,
        ...(process.env.NODE_ENV !== 'production' && { devOtp: rawEmailOtp })
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password after OTP verification
// @route   POST /api/auth/forgot-password/reset
// @access  Public
const resetPassword = async (req, res) => {
  const { userId, emailOtp, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await verifyOTP(emailOtp, user.emailOtp.codeHash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Logged in User
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  initiateRegister,
  verifyEmailOtp,
  verifyPhoneOtp,
  resendEmailOtp,
  resendPhoneOtp,
  loginUser,
  refreshToken,
  initiateForgotPassword,
  resetPassword,
  getMe
};
