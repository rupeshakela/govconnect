const Scheme = require('../models/Scheme');
const UserProfile = require('../models/UserProfile');
const { State } = require('../models/Portal');
const { getRecommendedSchemes } = require('../services/recommendationService');

module.exports.index = async (req, res) => {
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

  const allSchemes = await Scheme.find(filter).populate('state', 'name code').sort({ name: 1 });
  const allStates = await State.find().sort({ name: 1 });

  let savedSchemeIds = [];
  if (req.user) {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (profile && profile.savedSchemes) {
      savedSchemeIds = profile.savedSchemes.map((id) => id.toString());
    }
  }

  res.render('schemes/index.ejs', {
    title: 'Government Schemes Portal | Explore All Yojanas',
    allSchemes,
    allStates,
    currentCategory: category || 'All',
    currentState: state || 'All',
    searchQuery: search || '',
    savedSchemeIds
  });
};

module.exports.renderNewForm = async (req, res) => {
  const allStates = await State.find().sort({ name: 1 });
  res.render('schemes/new.ejs', {
    title: 'Add New Government Scheme',
    allStates
  });
};

module.exports.createScheme = async (req, res) => {
  const newScheme = new Scheme(req.body.scheme);
  if (!newScheme.state || newScheme.state === '') {
    newScheme.state = null;
  }
  await newScheme.save();
  req.flash('success', 'New Government Scheme published successfully!');
  res.redirect(`/schemes/${newScheme._id}`);
};

module.exports.showScheme = async (req, res) => {
  const { id } = req.params;
  const scheme = await Scheme.findOne({ _id: id, isDeleted: false }).populate('state', 'name code');

  if (!scheme) {
    req.flash('error', 'Scheme you requested for does not exist or has been retired.');
    return res.redirect('/schemes');
  }

  let isBookmarked = false;
  if (req.user) {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (profile && profile.savedSchemes) {
      isBookmarked = profile.savedSchemes.some((sid) => sid.toString() === id);
    }
  }

  res.render('schemes/show.ejs', {
    title: `${scheme.name} | Eligibility & Application`,
    scheme,
    isBookmarked
  });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const scheme = await Scheme.findById(id);
  if (!scheme) {
    req.flash('error', 'Scheme does not exist.');
    return res.redirect('/schemes');
  }
  const allStates = await State.find().sort({ name: 1 });
  res.render('schemes/edit.ejs', {
    title: `Edit ${scheme.name}`,
    scheme,
    allStates
  });
};

module.exports.updateScheme = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body.scheme };
  if (!updateData.state || updateData.state === '') {
    updateData.state = null;
  }
  await Scheme.findByIdAndUpdate(id, updateData);
  req.flash('success', 'Scheme details updated successfully.');
  res.redirect(`/schemes/${id}`);
};

module.exports.destroyScheme = async (req, res) => {
  const { id } = req.params;
  await Scheme.findByIdAndUpdate(id, { isDeleted: true });
  req.flash('success', 'Scheme has been archived.');
  res.redirect('/schemes');
};

module.exports.recommended = async (req, res) => {
  let profile = await UserProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await UserProfile.create({
      user: req.user._id,
      age: 25,
      gender: 'Any',
      annualIncome: 250000,
      occupation: 'Student'
    });
  }

  const recommendedSchemes = await getRecommendedSchemes(profile);
  const savedSchemeIds = profile.savedSchemes ? profile.savedSchemes.map((id) => id.toString()) : [];

  res.render('schemes/recommended.ejs', {
    title: 'AI Smart Scheme Recommendations | For You',
    recommendedSchemes,
    profile,
    savedSchemeIds
  });
};

module.exports.saved = async (req, res) => {
  const profile = await UserProfile.findOne({ user: req.user._id }).populate({
    path: 'savedSchemes',
    match: { isDeleted: false },
    populate: { path: 'state', select: 'name code' }
  });

  const savedSchemes = (profile && profile.savedSchemes) ? profile.savedSchemes : [];

  res.render('schemes/saved.ejs', {
    title: 'Saved Schemes & Bookmarks | GovScheme Portal',
    savedSchemes
  });
};

module.exports.toggleBookmark = async (req, res) => {
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

  // Handle AJAX call or standard form submit
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.json({
      success: true,
      isBookmarked,
      message: isBookmarked ? 'Scheme saved to your bookmarks' : 'Scheme removed from bookmarks'
    });
  }

  req.flash('success', isBookmarked ? 'Scheme saved to your bookmarks!' : 'Scheme removed from bookmarks.');
  res.redirect(req.get('Referrer') || `/schemes/${schemeId}`);
};
