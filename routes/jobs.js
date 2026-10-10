const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const jobsController = require('../controllers/jobs');
const { isLoggedIn, isVerifiedCitizen } = require('../middleware');

// Jobs and Exams portal requires citizen login
router.get('/', isLoggedIn, isVerifiedCitizen, wrapAsync(jobsController.index));

module.exports = router;
