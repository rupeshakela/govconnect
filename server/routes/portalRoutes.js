const express = require('express');
const router = express.Router();
const {
  getStates,
  getCategories,
  getJobs,
  getExams,
  triggerGovSync,
  getGovSyncStatus
} = require('../controllers/portalController');

router.get('/states', getStates);
router.get('/categories', getCategories);
router.get('/jobs', getJobs);
router.get('/exams', getExams);

// Government Portal Live Auto-Sync Endpoints
router.post('/sync-gov-data', triggerGovSync);
router.get('/sync-status', getGovSyncStatus);

module.exports = router;
