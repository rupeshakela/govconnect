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
  handleGetImpactStats
} = require('../controllers/benefitController');
const { protect } = require('../middlewares/authMiddleware');

// Public Intelligence Endpoints
router.post('/analyze-situation', handleAnalyzeSituation);
router.get('/pathways', handleGetPathways);
router.post('/verify-message', handleVerifyMessage);
router.post('/simulate', handleSimulate);
router.get('/impact-stats', (req, res) => res.json({
  success: true,
  isDemoData: true,
  label: 'Simulated / Demonstration Statistics for Presentation',
  data: {
    citizensAnalyzed: 14820,
    potentialBenefitsIdentified: 48930,
    documentGapsResolved: 21450,
    estimatedAidUnlocked: '₹18.4 Crore',
    avgReadinessGain: '+38%'
  }
}));

// Authenticated Citizen Intelligence Endpoints
router.get('/gap-analysis', protect, handleGapAnalysis);
router.get('/family', protect, handleGetFamilyMap);
router.post('/family/member', protect, handleAddFamilyMember);
router.delete('/family/member/:id', protect, handleDeleteFamilyMember);
router.get('/action-plan', protect, handleGetActionPlan);
router.post('/action-plan/task', protect, handleAddTask);
router.put('/action-plan/task/:id', protect, handleToggleTask);
router.put('/document-checklist', protect, handleUpdateDocumentChecklist);

module.exports = router;
