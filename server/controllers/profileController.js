const UserProfile = require('../models/UserProfile');
const { getRecommendedSchemes } = require('../services/recommendationService');

// @desc    Get Current User's Profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ user: req.user._id })
      .populate('state', 'name code')
      .populate('savedSchemes');

    if (!profile) {
      profile = await UserProfile.create({
        user: req.user._id,
        age: 25,
        gender: 'Any',
        annualIncome: 250000,
        occupation: 'Student',
        qualification: 'Graduate / Degree',
        casteCategory: 'General',
        disabilityStatus: false
      });
      profile = await UserProfile.findById(profile._id).populate('state', 'name code');
    }

    // Also get count of recommended schemes
    const recommended = await getRecommendedSchemes(profile);

    res.json({
      success: true,
      data: profile,
      recommendedCount: recommended.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Current User's Profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  const {
    age,
    gender,
    annualIncome,
    occupation,
    qualification,
    casteCategory,
    state,
    district,
    maritalStatus,
    disabilityStatus
  } = req.body;

  try {
    let profile = await UserProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new UserProfile({ user: req.user._id });
    }

    if (age !== undefined) profile.age = Number(age);
    if (gender !== undefined) profile.gender = gender;
    if (annualIncome !== undefined) profile.annualIncome = Number(annualIncome);
    if (occupation !== undefined) profile.occupation = occupation;
    if (qualification !== undefined) profile.qualification = qualification;
    if (casteCategory !== undefined) profile.casteCategory = casteCategory;
    if (state !== undefined) profile.state = state || null;
    if (district !== undefined) profile.district = String(district).trim();
    if (maritalStatus !== undefined) profile.maritalStatus = maritalStatus;
    if (disabilityStatus !== undefined) profile.disabilityStatus = Boolean(disabilityStatus);

    await profile.save();

    const populatedProfile = await UserProfile.findById(profile._id)
      .populate('state', 'name code')
      .populate('savedSchemes');

    const recommended = await getRecommendedSchemes(populatedProfile);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: populatedProfile,
      recommendedCount: recommended.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
