const Scheme = require('../models/Scheme');

/**
 * Intelligent Government Scheme Recommendation Engine (Node.js)
 * Calculates match percentage and returns eligible schemes for a citizen.
 */
const getRecommendedSchemes = async (userProfile) => {
  const { age = 25, annualIncome = 250000, gender = 'Any', occupation = 'Student', state } = userProfile;

  // Build query for broad matching
  const query = {
    isDeleted: false,
    minAge: { $lte: Number(age) || 100 },
    maxAge: { $gte: Number(age) || 0 },
    incomeLimit: { $gte: Number(annualIncome) || 0 }
  };

  // Gender filter
  if (gender && gender !== 'Any') {
    query.genderRequirement = { $in: [gender, 'Any'] };
  }

  // State filter (central schemes have state: null or match user's state)
  if (state) {
    query.$or = [{ state: state }, { state: null }];
  }

  const matchedSchemes = await Scheme.find(query).populate('state', 'name code').lean();

  // Add match relevance score
  const scoredSchemes = matchedSchemes.map((scheme) => {
    let score = 70; // baseline eligible
    if (scheme.genderRequirement === gender && gender !== 'Any') score += 10;
    if (scheme.state && state && scheme.state._id?.toString() === state?.toString()) score += 10;
    if (annualIncome <= scheme.incomeLimit * 0.75) score += 10;
    return {
      ...scheme,
      matchScore: Math.min(score, 100)
    };
  });

  // Sort by highest match score and benefit amount
  scoredSchemes.sort((a, b) => b.matchScore - a.matchScore || b.benefitAmount - a.benefitAmount);

  return scoredSchemes;
};

module.exports = { getRecommendedSchemes };
