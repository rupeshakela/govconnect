const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, roles) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not configured.');
  }
  return jwt.sign({ id: userId, roles }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
};

const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('FATAL: JWT_REFRESH_SECRET environment variable is not configured.');
  }
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
