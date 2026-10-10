const { State, Category, Exam, Job } = require('../models/Portal');

// @desc    Get all Indian States / UTs
// @route   GET /api/portal/states
// @access  Public
const getStates = async (req, res) => {
  try {
    const states = await State.find().sort({ name: 1 });
    res.json({ success: true, count: states.length, data: states });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Categories
// @route   GET /api/portal/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Government Job Vacancies
// @route   GET /api/portal/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const { state, search } = req.query;
    const filter = { isDeleted: false };

    if (state && state !== 'All') {
      filter.$or = [{ state: state }, { state: null }];
    }

    if (search) {
      filter.$or = [
        { postName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(filter)
      .populate('state', 'name code')
      .sort({ postName: 1 });

    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Government Competitive Exams
// @route   GET /api/portal/exams
// @access  Public
const getExams = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isDeleted: false };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { conductingAuthority: { $regex: search, $options: 'i' } },
        { eligibility: { $regex: search, $options: 'i' } }
      ];
    }

    const exams = await Exam.find(filter)
      .populate('category', 'name slug')
      .sort({ name: 1 });

    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trigger Live Auto-Sync with Government Portals
// @route   POST /api/portal/sync-gov-data
// @access  Public
const triggerGovSync = async (req, res) => {
  try {
    const { syncGovernmentPortals } = require('../services/govSyncService');
    const result = await syncGovernmentPortals();
    res.json({
      success: true,
      message: 'Successfully synced and updated latest Government Schemes & Announcements from official portals.',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Government Auto-Sync Status
// @route   GET /api/portal/sync-status
// @access  Public
const getGovSyncStatus = async (req, res) => {
  try {
    const { getSyncStatus } = require('../services/govSyncService');
    const status = getSyncStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStates,
  getCategories,
  getJobs,
  getExams,
  triggerGovSync,
  getGovSyncStatus
};
