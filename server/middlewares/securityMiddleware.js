const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Express v5 compatible NoSQL & input sanitizer
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  Object.keys(obj).forEach((key) => {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  });
};

const safeSanitizer = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  next();
};

const setupSecurity = (app) => {
  // Helmet HTTP Headers Security
  app.use(helmet({
    crossOriginResourcePolicy: false
  }));

  // Rate Limiting
  app.use('/api', limiter);

  // Safe input sanitization compatible with Express v5
  app.use(safeSanitizer);
};

module.exports = setupSecurity;
