const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otpHelper');
const { sendEmailOTP, sendPhoneOTP } = require('../services/otpService');

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

// Helper to mask sensitive contact info
const maskContact = (str, isEmail = false) => {
  if (!str) return '';
  if (isEmail) {
    const [user, domain] = str.split('@');
    if (!domain) return str;
    const maskedUser = user.length > 2 ? user.slice(0, 2) + '***' + user.slice(-1) : user + '***';
    return `${maskedUser}@${domain}`;
  }
  return str.length > 4 ? str.slice(0, 3) + '*****' + str.slice(-2) : str;
};

module.exports.renderSignupForm = (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/schemes');
  res.render('users/signup.ejs', { title: 'Citizen Registration | GovScheme Portal' });
};

module.exports.signup = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/signup');
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();
    const cleanFullName = fullName.trim();

    // Strict 10-digit phone validation
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      req.flash('error', 'Mobile number must be exactly 10 digits. Neither more nor less than 10 digits is allowed.');
      return res.redirect('/signup');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      req.flash('error', 'Please enter a valid email address.');
      return res.redirect('/signup');
    }

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }, { username: cleanEmail }]
    });

    if (existingUser) {
      req.flash('error', 'An account with this Email or Mobile Number already exists. Please log in.');
      return res.redirect('/login');
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    const user = new User({
      username: cleanEmail,
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      accountStatus: 'Active',
      isEmailVerified: true,
      isPhoneVerified: true,
      lastLogin: now
    });

    // Register with passport-local-mongoose
    await User.register(user, password);

    // Save bcrypt password on the record for seamless cross-compatibility with JWT API
    user.password = hashedPassword;
    await user.save();

    // Ensure citizen profile exists
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

    // Automatically log the user in immediately & land directly on Home page
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash('success', `Namaste ${user.fullName}! Your citizen account has been created successfully. Welcome to GovScheme Portal.`);
      return res.redirect('/schemes');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/signup');
  }
};

module.exports.renderVerifyOtpForm = async (req, res) => {
  const userId = req.query.userId || (req.session.devOtp && req.session.devOtp.userId);
  if (!userId) {
    req.flash('error', 'Session expired. Please sign up or log in.');
    return res.redirect('/signup');
  }

  const user = await User.findById(userId);
  if (!user) {
    req.flash('error', 'Citizen record not found.');
    return res.redirect('/signup');
  }

  if (user.isEmailVerified && user.isPhoneVerified && user.accountStatus === 'Active') {
    req.flash('success', 'Your account is already verified! Please log in.');
    return res.redirect('/login');
  }

  const devOtp = (req.session.devOtp && req.session.devOtp.userId === user._id.toString())
    ? req.session.devOtp
    : null;

  res.render('users/verify-otp.ejs', {
    title: 'Dual OTP Verification | GovScheme Portal',
    user,
    maskedEmail: maskContact(user.email, true),
    maskedPhone: maskContact(user.phone, false),
    devOtp
  });
};

module.exports.verifyOtp = async (req, res, next) => {
  const { userId, emailOtp, phoneOtp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'User account not found.');
      return res.redirect('/signup');
    }

    const now = new Date();

    // Check attempts & expiry for email OTP
    if (user.emailOtp.attempts >= MAX_OTP_ATTEMPTS) {
      req.flash('error', 'Maximum Email OTP attempts exceeded. Please request a new OTP.');
      return res.redirect(`/verify-otp?userId=${userId}`);
    }
    if (now > new Date(user.emailOtp.expiresAt)) {
      req.flash('error', 'Email OTP has expired. Please request a new OTP.');
      return res.redirect(`/verify-otp?userId=${userId}`);
    }
    const isEmailValid = verifyOTP(emailOtp, user.emailOtp.codeHash);
    user.emailOtp.attempts += 1;

    // Check attempts & expiry for phone OTP
    if (user.phoneOtp.attempts >= MAX_OTP_ATTEMPTS) {
      req.flash('error', 'Maximum Phone OTP attempts exceeded. Please request a new OTP.');
      return res.redirect(`/verify-otp?userId=${userId}`);
    }
    if (now > new Date(user.phoneOtp.expiresAt)) {
      req.flash('error', 'Phone OTP has expired. Please request a new OTP.');
      return res.redirect(`/verify-otp?userId=${userId}`);
    }
    const isPhoneValid = verifyOTP(phoneOtp, user.phoneOtp.codeHash);
    user.phoneOtp.attempts += 1;

    if (!isEmailValid && !isPhoneValid) {
      await user.save();
      req.flash('error', 'Both Email and Mobile OTPs are incorrect. Please re-check.');
      return res.redirect(`/verify-otp?userId=${userId}`);
    }

    if (!isEmailValid) {
      await user.save();
      req.flash('error', 'Invalid Email OTP. Please check the code sent to your inbox.');
      return res.redirect(`/verify-otp?userId=${userId}`);
    }

    if (!isPhoneValid) {
      await user.save();
      req.flash('error', 'Invalid Mobile OTP. Please check the SMS code.');
      return res.redirect(`/verify-otp?userId=${userId}`);
    }

    // Both OTPs are valid!
    user.isEmailVerified = true;
    user.isPhoneVerified = true;
    user.accountStatus = 'Active';
    user.lastLogin = now;
    await user.save();

    // Clean up dev OTP
    delete req.session.devOtp;

    // Automatically log in using passport
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash('success', `Namaste ${user.fullName || user.username}! Your GovScheme account is successfully verified and active.`);
      const redirectUrl = res.locals.redirectUrl || '/schemes';
      res.redirect(redirectUrl);
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/verify-otp?userId=${userId}`);
  }
};

module.exports.resendOtp = async (req, res) => {
  const { userId, type } = req.body; // 'email', 'phone', or 'all'

  try {
    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/signup');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

    if (type === 'email' || type === 'all' || !type) {
      if (user.emailOtp.lastSentAt && (now - new Date(user.emailOtp.lastSentAt)) < OTP_RESEND_COOLDOWN_MS) {
        req.flash('error', 'Please wait 60 seconds before requesting a new Email OTP.');
        return res.redirect(`/verify-otp?userId=${userId}`);
      }
      const rawEmailOtp = generateOTP();
      user.emailOtp = { codeHash: hashOTP(rawEmailOtp), expiresAt, attempts: 0, lastSentAt: now };
      await sendEmailOTP(user.email, rawEmailOtp);
      if (!req.session.devOtp) req.session.devOtp = { userId: user._id.toString() };
      req.session.devOtp.emailOtp = rawEmailOtp;
    }

    if (type === 'phone' || type === 'all' || !type) {
      if (user.phoneOtp.lastSentAt && (now - new Date(user.phoneOtp.lastSentAt)) < OTP_RESEND_COOLDOWN_MS) {
        req.flash('error', 'Please wait 60 seconds before requesting a new Mobile OTP.');
        return res.redirect(`/verify-otp?userId=${userId}`);
      }
      const rawPhoneOtp = generateOTP();
      user.phoneOtp = { codeHash: hashOTP(rawPhoneOtp), expiresAt, attempts: 0, lastSentAt: now };
      await sendPhoneOTP(user.phone, rawPhoneOtp);
      if (!req.session.devOtp) req.session.devOtp = { userId: user._id.toString() };
      req.session.devOtp.phoneOtp = rawPhoneOtp;
    }

    await user.save();
    req.flash('success', 'New verification code(s) sent successfully.');
    res.redirect(`/verify-otp?userId=${userId}`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/verify-otp?userId=${userId}`);
  }
};

module.exports.renderLoginForm = (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/schemes');
  res.render('users/login.ejs', { title: 'Citizen Login | GovScheme Portal' });
};

module.exports.login = async (req, res) => {
  if (req.user) {
    if (req.user.accountStatus !== 'Active' || !req.user.isEmailVerified || !req.user.isPhoneVerified) {
      req.user.accountStatus = 'Active';
      req.user.isEmailVerified = true;
      req.user.isPhoneVerified = true;
    }
    req.user.lastLogin = new Date();
    await req.user.save();
  }

  req.flash('success', `Welcome back, ${req.user.fullName || req.user.username}!`);
  const redirectUrl = res.locals.redirectUrl || '/schemes';
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out securely.');
    res.redirect('/login');
  });
};


module.exports.renderForgotPassword = (req, res) => {
  res.render('users/forgot-password.ejs', { title: 'Reset Password | GovScheme Portal', step: 1, userId: null });
};

module.exports.forgotPasswordInitiate = async (req, res) => {
  const { identifier } = req.body;
  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }, { username: identifier.trim() }]
  });

  if (!user) {
    req.flash('error', 'No citizen account found with that email or mobile number.');
    return res.redirect('/forgot-password');
  }

  const rawEmailOtp = generateOTP();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);
  user.emailOtp = { codeHash: hashOTP(rawEmailOtp), expiresAt, attempts: 0, lastSentAt: now };
  await user.save();

  await sendEmailOTP(user.email, rawEmailOtp);

  req.flash('success', `Password reset OTP has been sent to ${maskContact(user.email, true)}.`);
  res.render('users/forgot-password.ejs', {
    title: 'Enter Reset OTP | GovScheme Portal',
    step: 2,
    userId: user._id,
    devOtp: process.env.NODE_ENV !== 'production' ? rawEmailOtp : null
  });
};

module.exports.forgotPasswordReset = async (req, res) => {
  const { userId, otp, newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) {
    req.flash('error', 'New passwords do not match.');
    return res.redirect('/forgot-password');
  }

  const user = await User.findById(userId);
  if (!user) {
    req.flash('error', 'User not found.');
    return res.redirect('/forgot-password');
  }

  const isValid = verifyOTP(otp, user.emailOtp.codeHash);
  if (!isValid) {
    req.flash('error', 'Invalid or expired OTP code.');
    return res.redirect('/forgot-password');
  }

  await user.setPassword(newPassword);
  await user.save();

  req.flash('success', 'Password reset successfully! You can now log in with your new password.');
  res.redirect('/login');
};
