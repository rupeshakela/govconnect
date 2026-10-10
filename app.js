if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/User.js');

// Routers
const userRouter = require('./routes/user.js');
const schemesRouter = require('./routes/schemes.js');
const jobsRouter = require('./routes/jobs.js');
const profileRouter = require('./routes/profile.js');
const portalRouter = require('./routes/portal.js');
const chatRouter = require('./routes/chat.js');

// Background sync worker
const { startAutoSyncCron, getSyncStatus } = require('./services/govSyncService');

const dbURL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/govconnect';
const sessionSecret = process.env.SECRET || 'govconnect_super_secret_session_key_2026';

// Database Connection
main()
  .then(() => {
    console.log('✅ Connected to MongoDB Database (govconnect)');
  })
  .catch((err) => {
    console.error('❌ Database Connection Error:', err);
  });

async function main() {
  await mongoose.connect(dbURL);
}

// View Engine & Static Files Setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session Store Setup
const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: sessionSecret,
  },
  touchAfter: 24 * 3600,
});

store.on('error', (err) => {
  console.log('ERROR IN MONGO SESSION STORE', err);
});

const sessionOptions = {
  store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Authentication Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Template Locals Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user;
  res.locals.activePage = req.path.split('/')[1] || 'schemes';
  res.locals.syncStatus = getSyncStatus();
  next();
});

// Root Landing Gatekeeper: If unauthenticated, redirect to signup (register page)
app.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/signup');
  }
  res.redirect('/schemes');
});

// Mount Routes
app.use('/schemes', schemesRouter);
app.use('/jobs', jobsRouter);
app.use('/profile', profileRouter);
app.use('/portal', portalRouter);
app.use('/chat', chatRouter);
app.use('/', userRouter);

// Initialize Autonomous Background Government Gazette Ingestion Worker (Polls automatically every 15 min)
startAutoSyncCron();

// 404 Handler for Express 5
app.all('/{*splat}', (req, res, next) => {
  next(new ExpressError(404, 'Page Not Found! The requested government resource could not be located.'));
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong' } = err;
  res.status(statusCode).render('error.ejs', { message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🏛️ GovScheme Portal is live and listening on http://localhost:${PORT}`);
});
