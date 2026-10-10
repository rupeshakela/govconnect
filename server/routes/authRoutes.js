const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register/initiate', initiateRegister);
router.post('/verify-email-otp', verifyEmailOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);
router.post('/resend-email-otp', resendEmailOtp);
router.post('/resend-phone-otp', resendPhoneOtp);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password/initiate', initiateForgotPassword);
router.post('/forgot-password/reset', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
