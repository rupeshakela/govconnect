const UserProfile = require('../models/UserProfile');
const { State } = require('../models/Portal');
const { getRecommendedSchemes } = require('../services/recommendationService');

module.exports.show = async (req, res) => {
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
  }

  const allStates = await State.find().sort({ name: 1 });
  const recommendedSchemes = await getRecommendedSchemes(profile);

  res.render('profile/index.ejs', {
    title: 'Citizen Welfare Profile | GovScheme Portal',
    profile,
    allStates,
    recommendedCount: recommendedSchemes.length
  });
};

module.exports.update = async (req, res) => {
  const {
    age,
    gender,
    annualIncome,
    occupation,
    qualification,
    casteCategory,
    state,
    maritalStatus,
    disabilityStatus
  } = req.body.profile || req.body;

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
  profile.state = state && state !== '' ? state : null;
  if (maritalStatus !== undefined) profile.maritalStatus = maritalStatus;
  profile.disabilityStatus = disabilityStatus === 'true' || disabilityStatus === true || disabilityStatus === 'on';

  await profile.save();

  req.flash('success', 'Your citizen profile was updated! Schemes recommendation engine has recalculated your benefits.');
  res.redirect('/profile');
};
