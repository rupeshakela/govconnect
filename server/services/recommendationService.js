const Scheme = require('../models/Scheme');

/**
 * Intelligent Government Scheme Recommendation Engine (Node.js)
 * Calculates match percentage dynamically based on:
 * 1. Demographic & Age/Income boundary criteria
 * 2. Primary Occupation alignment & Category Priority
 * 3. Document Readiness: Matches required docs against citizen's actual checklist!
 * 4. State & Gender specificity
 */
const getRecommendedSchemes = async (userProfile) => {
  const {
    age = 25,
    annualIncome = 250000,
    gender = 'Any',
    occupation = 'Student',
    state,
    documentChecklist = []
  } = userProfile || {};

  const numAge = Number(age) || 25;
  const numIncome = Number(annualIncome) || 250000;

  // Build query for baseline eligibility
  const query = {
    isDeleted: false,
    minAge: { $lte: numAge },
    maxAge: { $gte: numAge },
    incomeLimit: { $gte: numIncome }
  };

  // Gender exclusion
  if (gender === 'Male') {
    query.genderRequirement = { $in: ['Male', 'Any'] };
  } else if (gender === 'Female') {
    query.genderRequirement = { $in: ['Female', 'Any'] };
  }

  // State filter (Central schemes have state: null or match user's state)
  if (state) {
    query.$or = [{ state: state }, { state: null }];
  }

  // Occupation category prioritization & exclusion mapping
  let priorityCategories = [];
  let excludedCategories = [];

  switch (occupation) {
    case 'Student':
      priorityCategories = ['Students'];
      excludedCategories = ['Farmers', 'Businesses', 'Startups', 'Senior Citizens'];
      break;
    case 'Farmer':
      priorityCategories = ['Farmers'];
      excludedCategories = ['Students', 'Startups', 'Businesses', 'Senior Citizens'];
      break;
    case 'Self-Employed / Business':
      priorityCategories = ['Businesses', 'Startups'];
      excludedCategories = ['Farmers', 'Students', 'Senior Citizens'];
      break;
    case 'Senior Citizen / Retired':
      priorityCategories = ['Senior Citizens', 'Healthcare'];
      excludedCategories = ['Students', 'Farmers', 'Startups', 'Businesses'];
      break;
    case 'Unemployed':
      priorityCategories = ['Students', 'Businesses', 'General'];
      excludedCategories = ['Senior Citizens'];
      break;
    default:
      priorityCategories = [];
      excludedCategories = [];
  }

  if (excludedCategories.length > 0) {
    query.category = { $nin: excludedCategories };
  }

  const matchedSchemes = await Scheme.find(query).populate('state', 'name code').lean();

  // Extract citizen's available documents from their checklist
  const availableDocs = new Set(
    (documentChecklist || [])
      .filter(d => d.status === 'Available')
      .map(d => d.docName.toLowerCase().trim())
  );

  // Score each scheme dynamically based on real criteria & documents
  const scoredSchemes = matchedSchemes.map((scheme) => {
    let score = 50; // Base: passed age and income constraints

    // 1. Occupation & Category Alignment (up to +25%)
    if (priorityCategories.includes(scheme.category)) {
      score += 25;
    } else if (scheme.category === 'General' || scheme.category === 'Healthcare') {
      score += 10;
    }

    // Keyword match in criteria or title
    const criteriaLower = `${scheme.name} ${scheme.eligibilityCriteria} ${scheme.tags?.join(' ') || ''}`.toLowerCase();
    if (occupation === 'Student' && (criteriaLower.includes('scholarship') || criteriaLower.includes('student') || criteriaLower.includes('fellowship') || criteriaLower.includes('college'))) {
      score += 10;
    } else if (occupation === 'Farmer' && (criteriaLower.includes('kisan') || criteriaLower.includes('farmer') || criteriaLower.includes('crop') || criteriaLower.includes('agriculture'))) {
      score += 10;
    } else if (occupation === 'Self-Employed / Business' && (criteriaLower.includes('msme') || criteriaLower.includes('mudra') || criteriaLower.includes('business') || criteriaLower.includes('loan'))) {
      score += 10;
    }

    // 2. Document Readiness Matching (up to +20%) - DYNAMIC BASED ON USER CHECKLIST
    const reqDocsText = (scheme.documentsRequired || '').toLowerCase();
    const commonDocKeywords = [
      { key: 'aadhaar', name: 'aadhaar' },
      { key: 'pan', name: 'pan' },
      { key: 'income', name: 'income' },
      { key: 'caste', name: 'caste' },
      { key: 'marksheet', name: 'marksheet' },
      { key: 'bank', name: 'bank' },
      { key: 'ration', name: 'ration' },
      { key: 'domicile', name: 'domicile' }
    ];

    let schemeDocCount = 0;
    let citizenMatchedDocCount = 0;

    commonDocKeywords.forEach(doc => {
      if (reqDocsText.includes(doc.key)) {
        schemeDocCount++;
        const hasDoc = Array.from(availableDocs).some(userDoc => userDoc.includes(doc.key));
        if (hasDoc) {
          citizenMatchedDocCount++;
        }
      }
    });

    if (schemeDocCount > 0) {
      const docMatchRatio = citizenMatchedDocCount / schemeDocCount;
      score += Math.round(docMatchRatio * 20); // up to +20% for document readiness
    } else {
      score += 10; // neutral if no specific docs listed
    }

    // 3. Gender Specificity (up to +10%)
    if (scheme.genderRequirement === gender && gender !== 'Any') {
      score += 10;
    } else if (scheme.category === 'Women' && gender === 'Female') {
      score += 15;
    }

    // 4. State Alignment (up to +10%)
    if (scheme.state && state && scheme.state._id?.toString() === state?.toString()) {
      score += 10;
    } else if (!scheme.state) {
      score += 5; // Central Pan-India
    }

    // 5. Income Comfort Margin (up to +8%)
    if (numIncome <= scheme.incomeLimit * 0.5) {
      score += 8;
    } else if (numIncome <= scheme.incomeLimit * 0.75) {
      score += 4;
    }

    // 6. Application Window Urgency
    if (scheme.applicationWindow?.status === 'Open Now') {
      score += 4;
    }

    // Final bound: Realistic dynamic percentage between 52% and 98%
    const finalScore = Math.min(Math.max(score, 52), 98);

    return {
      ...scheme,
      matchScore: finalScore,
      docsMatched: citizenMatchedDocCount,
      docsRequiredCount: schemeDocCount
    };
  });

  // Sort primarily by highest dynamic matchScore, then by benefitAmount
  scoredSchemes.sort((a, b) => b.matchScore - a.matchScore || (b.benefitAmount || 0) - (a.benefitAmount || 0));

  return scoredSchemes;
};

module.exports = { getRecommendedSchemes };
