const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const schemeController = require('../controllers/schemes');
const { isLoggedIn, isVerifiedCitizen, validateScheme } = require('../middleware');

// Root schemes routes - Protected: User must be logged in & verified to view
router.route('/')
  .get(isLoggedIn, isVerifiedCitizen, wrapAsync(schemeController.index))
  .post(isLoggedIn, validateScheme, wrapAsync(schemeController.createScheme));

// New Scheme Form (admin / authorized)
router.get('/new', isLoggedIn, wrapAsync(schemeController.renderNewForm));

// Personalized Recommendations
router.get('/recommended', isLoggedIn, isVerifiedCitizen, wrapAsync(schemeController.recommended));

// Saved Schemes Bookmarks
router.get('/saved', isLoggedIn, isVerifiedCitizen, wrapAsync(schemeController.saved));

// Specific Scheme Detail, Edit & Delete - Protected
router.route('/:id')
  .get(isLoggedIn, isVerifiedCitizen, wrapAsync(schemeController.showScheme))
  .put(isLoggedIn, validateScheme, wrapAsync(schemeController.updateScheme))
  .delete(isLoggedIn, wrapAsync(schemeController.destroyScheme));

// Edit Scheme Form
router.get('/:id/edit', isLoggedIn, wrapAsync(schemeController.renderEditForm));

// Bookmark Toggle
router.post('/:id/bookmark', isLoggedIn, wrapAsync(schemeController.toggleBookmark));

module.exports = router;
