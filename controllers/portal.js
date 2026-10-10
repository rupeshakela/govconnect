const { syncGovernmentPortals, getSyncStatus } = require('../services/govSyncService');
const { State, Category } = require('../models/Portal');

module.exports.getSyncStatus = (req, res) => {
  res.json({ success: true, data: getSyncStatus() });
};

module.exports.triggerSync = async (req, res) => {
  try {
    const result = await syncGovernmentPortals();
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.json({
        success: true,
        message: 'Successfully ingested latest Gazette & Portal updates!',
        data: result
      });
    }
    req.flash('success', 'Successfully synchronized live Government schemes & job notifications!');
    res.redirect(req.get('Referrer') || '/schemes');
  } catch (error) {
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.status(500).json({ success: false, message: error.message });
    }
    req.flash('error', `Sync failed: ${error.message}`);
    res.redirect(req.get('Referrer') || '/schemes');
  }
};

module.exports.getStates = async (req, res) => {
  const states = await State.find().sort({ name: 1 });
  res.json({ success: true, data: states });
};

module.exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, data: categories });
};
