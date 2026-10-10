const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const portalController = require('../controllers/portal');

router.get('/sync-status', portalController.getSyncStatus);
router.post('/sync-gov-data', wrapAsync(portalController.triggerSync));
router.get('/states', wrapAsync(portalController.getStates));
router.get('/categories', wrapAsync(portalController.getCategories));

module.exports = router;
