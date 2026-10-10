const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);

module.exports = router;
