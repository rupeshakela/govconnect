const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const setupSecurity = require('./middlewares/securityMiddleware');

dotenv.config();

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Setup Security Middlewares (Helmet, Rate Limiting, Mongo Sanitize, XSS)
setupSecurity(app);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root API info
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Active',
    message: 'GovScheme Pure MERN API Server is running.',
    frontendURL: 'http://localhost:5173',
    healthCheck: 'http://localhost:5000/health',
    endpoints: {
      auth: '/api/auth',
      schemes: '/api/schemes',
      profile: '/api/profile',
      portal: '/api/portal'
    }
  });
});

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Pure MERN Backend is live and secure.' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schemes', require('./routes/schemeRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/portal', require('./routes/portalRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/benefits', require('./routes/benefitRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

app.listen(PORT, () => {
  console.log(`Pure MERN Server running on port ${PORT}`);
  // Initialize Government Portal Auto-Sync Daemon
  const { startAutoSyncCron } = require('./services/govSyncService');
  startAutoSyncCron();
});
