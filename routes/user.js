const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl, validateSignup, resolveLoginIdentifier } = require('../middleware');
const userController = require('../controllers/users');

router.route('/signup')
  .get(userController.renderSignupForm)
  .post(validateSignup, wrapAsync(userController.signup));

// Legacy OTP route redirected directly to home
router.get('/verify-otp', (req, res) => res.redirect('/schemes'));

router.route('/login')
  .get(userController.renderLoginForm)
  .post(
    resolveLoginIdentifier,
    saveRedirectUrl,
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: true
    }),
    wrapAsync(userController.login)
  );

router.get('/logout', userController.logout);

router.route('/forgot-password')
  .get(userController.renderForgotPassword)
  .post(wrapAsync(userController.forgotPasswordInitiate));

router.post('/forgot-password/reset', wrapAsync(userController.forgotPasswordReset));

module.exports = router;
