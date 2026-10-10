const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getSchemeById,
  getRecommendations,
  toggleBookmarkScheme,
  getSavedSchemes
} = require('../controllers/schemeController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getSchemes);
router.get('/recommended', protect, getRecommendations);
router.get('/user/saved', protect, getSavedSchemes);
router.get('/:id', getSchemeById);
router.post('/:id/bookmark', protect, toggleBookmarkScheme);

module.exports = router;
