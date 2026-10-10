const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
};

const verifyOTP = (enteredOtp, storedHash) => {
  if (!storedHash || !enteredOtp) return false;
  const hash = crypto.createHash('sha256').update(String(enteredOtp).trim()).digest('hex');
  return hash === storedHash;
};

module.exports = { generateOTP, hashOTP, verifyOTP };
