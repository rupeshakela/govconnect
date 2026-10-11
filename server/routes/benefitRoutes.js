const express = require('express');
const router = express.Router();
const {
  handleAnalyzeSituation,
  handleGapAnalysis,
  handleGetPathways,
  handleVerifyMessage,
  handleGetFamilyMap,
  handleAddFamilyMember,
  handleDeleteFamilyMember,
  handleGetActionPlan,
  handleAddTask,
  handleToggleTask,
  handleSimulate,
  handleUpdateDocumentChecklist,
  handleGetImpactStats,
  handleYojanaParchi,
  handleCSCLocator,
  handleGetDocumentTypes,
  handleAuditSingleDocument
} = require('../controllers/benefitController');
const { protect } = require('../middlewares/authMiddleware');

// Public Intelligence Endpoints
router.post('/analyze-situation', handleAnalyzeSituation);
router.get('/pathways', handleGetPathways);
router.post('/verify-message', handleVerifyMessage);
router.post('/simulate', handleSimulate);
router.get('/impact-stats', handleGetImpactStats);
router.get('/document-types', handleGetDocumentTypes);
router.post('/audit-single-document', handleAuditSingleDocument);

// Authenticated Citizen Intelligence Endpoints
router.get('/gap-analysis', protect, handleGapAnalysis);
router.get('/family', protect, handleGetFamilyMap);
router.post('/family/member', protect, handleAddFamilyMember);
router.delete('/family/member/:id', protect, handleDeleteFamilyMember);
router.get('/action-plan', protect, handleGetActionPlan);
router.post('/action-plan/task', protect, handleAddTask);
router.put('/action-plan/task/:id', protect, handleToggleTask);
router.put('/document-checklist', protect, handleUpdateDocumentChecklist);

// Yojana Parchi PDF Data (Private - needs profile)
router.get('/yojana-parchi', protect, handleYojanaParchi);

// CSC / Jan Seva Kendra Locator (Public)
router.get('/csc-locator', handleCSCLocator);

module.exports = router;
