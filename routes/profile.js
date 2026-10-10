const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const profileController = require('../controllers/profile');
const { isLoggedIn, isVerifiedCitizen, validateProfile } = require('../middleware');

router.route('/')
  .get(isLoggedIn, isVerifiedCitizen, wrapAsync(profileController.show))
  .put(isLoggedIn, isVerifiedCitizen, validateProfile, wrapAsync(profileController.update))
  .post(isLoggedIn, isVerifiedCitizen, validateProfile, wrapAsync(profileController.update)); // allows POST fallback

module.exports = router;
