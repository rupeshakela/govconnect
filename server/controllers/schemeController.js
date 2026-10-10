const Scheme = require('../models/Scheme');
const UserProfile = require('../models/UserProfile');
const { getRecommendedSchemes } = require('../services/recommendationService');

// @desc    Get all government schemes with query filters
// @route   GET /api/schemes
// @access  Public
const getSchemes = async (req, res) => {
  try {
    const { category, state, search } = req.query;
    const filter = { isDeleted: false };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (state && state !== 'All') {
      filter.$or = [{ state: state }, { state: null }];
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { eligibilityCriteria: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const schemes = await Scheme.find(filter)
      .populate('state', 'name code')
      .sort({ name: 1 });

    res.json({ success: true, count: schemes.length, data: schemes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single government scheme by ID
// @route   GET /api/schemes/:id
// @access  Public
const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findOne({ _id: req.params.id, isDeleted: false })
      .populate('state', 'name code');

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    res.json({ success: true, data: scheme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recommended schemes for authenticated user profile
// @route   GET /api/schemes/recommended
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await UserProfile.create({
        user: req.user._id,
        age: 25,
        gender: 'Any',
        annualIncome: 250000
      });
    }

    const schemes = await getRecommendedSchemes(profile);
    res.json({ success: true, count: schemes.length, data: schemes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Bookmark / Save Scheme
// @route   POST /api/schemes/:id/bookmark
// @access  Private
const toggleBookmarkScheme = async (req, res) => {
  try {
    const schemeId = req.params.id;
    let profile = await UserProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new UserProfile({ user: req.user._id, savedSchemes: [] });
    }

    const index = profile.savedSchemes.findIndex((id) => id.toString() === schemeId);
    let isBookmarked = false;

    if (index > -1) {
      profile.savedSchemes.splice(index, 1);
      isBookmarked = false;
    } else {
      profile.savedSchemes.push(schemeId);
      isBookmarked = true;
    }

    await profile.save();

    res.json({
      success: true,
      isBookmarked,
      message: isBookmarked ? 'Scheme saved to your bookmarks' : 'Scheme removed from bookmarks',
      savedSchemes: profile.savedSchemes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all saved / bookmarked schemes for authenticated user
// @route   GET /api/schemes/user/saved
// @access  Private
const getSavedSchemes = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id })
      .populate({
        path: 'savedSchemes',
        match: { isDeleted: false },
        populate: { path: 'state', select: 'name code' }
      });

    if (!profile) {
      return res.json({ success: true, count: 0, data: [] });
    }

    res.json({
      success: true,
      count: profile.savedSchemes ? profile.savedSchemes.length : 0,
      data: profile.savedSchemes || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  getRecommendations,
  toggleBookmarkScheme,
  getSavedSchemes
};
