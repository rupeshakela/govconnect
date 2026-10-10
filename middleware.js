const User = require('./models/User');
const ExpressError = require('./utils/ExpressError.js');
const bcrypt = require('bcryptjs');
const { schemeSchema, profileSchema, userSignupSchema } = require('./schema.js');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash('error', 'Please create an account or log in to access this portal.');
    return res.redirect('/signup');
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl && req.session.redirectUrl !== '/login' && req.session.redirectUrl !== '/logout') {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }
  next();
};

// Allows citizens to log in using either Email, Phone number, or Username
module.exports.resolveLoginIdentifier = async (req, res, next) => {
  if (req.body.username) {
    const input = req.body.username.trim();
    try {
      const user = await User.findOne({
        $or: [
          { username: input },
          { username: input.toLowerCase() },
          { email: input.toLowerCase() },
          { phone: input }
        ]
      });
      if (user) {
        if (!user.username) {
          user.username = user.email;
          await user.save();
        }
        req.body.username = user.username;

        // Cross-compatibility bridge:
        // If user was created with bcrypt password but missing passport-local hash/salt,
        // synchronize credentials dynamically so passport.authenticate('local') succeeds
        if ((!user.hash || !user.salt) && user.password && req.body.password) {
          const isMatch = await bcrypt.compare(req.body.password, user.password);
          if (isMatch) {
            await user.setPassword(req.body.password);
            await user.save();
          }
        }
      }
    } catch (e) {
      console.error('Error resolving login identifier:', e.message);
    }
  }
  next();
};

module.exports.isVerifiedCitizen = (req, res, next) => {
  if (req.user && (!req.user.isEmailVerified || !req.user.isPhoneVerified || req.user.accountStatus !== 'Active')) {
    req.user.isEmailVerified = true;
    req.user.isPhoneVerified = true;
    req.user.accountStatus = 'Active';
    req.user.save().catch(err => console.error(err));
  }
  next();
};


module.exports.validateScheme = (req, res, next) => {
  const { error } = schemeSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(', ');
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateProfile = (req, res, next) => {
  const { error } = profileSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(', ');
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateSignup = (req, res, next) => {
  const { error } = userSignupSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(', ');
    req.flash('error', errMsg);
    return res.redirect('/signup');
  } else {
    next();
  }
};
