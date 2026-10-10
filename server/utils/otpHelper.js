const bcrypt = require('bcryptjs');

// Generate 6-digit random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP for secure DB storage
const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

// Verify entered OTP against stored hash
const verifyOTP = async (enteredOtp, storedHash) => {
  if (!storedHash) return false;
  return await bcrypt.compare(enteredOtp, storedHash);
};

module.exports = { generateOTP, hashOTP, verifyOTP };
