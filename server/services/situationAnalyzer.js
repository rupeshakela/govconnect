const Scheme = require('../models/Scheme');
const UserProfile = require('../models/UserProfile');
const { State } = require('../models/Portal');

/**
 * BenefitOS Situation Understanding Engine
 * Extracts structured parameters from natural language citizen input and performs
 * deterministic rule matching against real government welfare schemes.
 */
const analyzeSituation = async (queryText, userProfile = null) => {
  if (!queryText || !queryText.trim()) {
    throw new Error('Problem description is required.');
  }

  const query = queryText.toLowerCase().trim();

  // 1. NLP Parameter & Intent Extraction (Deterministic Rule Engine + Intent Classifier)
  const extractedIntent = {
    problemCategory: 'General Welfare',
    targetBeneficiary: 'Citizen',
    ageInferred: null,
    genderInferred: 'Any',
    incomeConstraint: false,
    educationLevel: null,
    keywords: [],
    detectedNeeds: []
  };

  // Education / Student
  if (/\b(daughter|son|child|children|student|college|school|higher education|scholarship|fees|degree|btech|study|tuition|marksheet|intermediate)\b/i.test(query)) {
    extractedIntent.problemCategory = 'Students';
    extractedIntent.detectedNeeds.push('Education Assistance', 'Scholarships & Grants');
    if (/\b(daughter|girl|female)\b/i.test(query)) {
      extractedIntent.targetBeneficiary = 'Female Student';
      extractedIntent.genderInferred = 'Female';
    } else if (/\b(son|boy)\b/i.test(query)) {
      extractedIntent.targetBeneficiary = 'Male Student';
      extractedIntent.genderInferred = 'Male';
    } else {
      extractedIntent.targetBeneficiary = 'Student';
    }
  }

  // Farming / Agriculture
  if (/\b(farmer|farming|crop|kisan|agriculture|tractor|irrigation|fertilizer|seed|solar pump|land|cultivation|harvest)\b/i.test(query)) {
    extractedIntent.problemCategory = 'Farmers';
    extractedIntent.targetBeneficiary = 'Farmer';
    extractedIntent.detectedNeeds.push('Agricultural Direct Benefit', 'Farm Machinery & Subsidy');
  }

  // Women / Mother
  if (/\b(woman|women|mother|widow|maternity|girl|pregnant|self help group|shg|mahila)\b/i.test(query)) {
    extractedIntent.problemCategory = 'Women';
    extractedIntent.genderInferred = 'Female';
    extractedIntent.targetBeneficiary = 'Woman Beneficiary';
    extractedIntent.detectedNeeds.push('Women Welfare & Livelihood', 'Maternal & Health Support');
  }

  // Business / Startup / Self-employment
  if (/\b(business|shop|startup|loan|mudra|enterprise|self-employed|vendor|shopkeeper|trade|company|store|capital)\b/i.test(query)) {
    extractedIntent.problemCategory = 'Businesses';
    extractedIntent.targetBeneficiary = 'Micro-Entrepreneur / Business Owner';
    extractedIntent.detectedNeeds.push('Working Capital Loans', 'MSME Subsidies');
  }

  // Job Loss / Unemployment / Skills
  if (/\b(job|lost job|unemployed|unemployment|career|training|skill|placement|hiring|fresher)\b/i.test(query)) {
    extractedIntent.problemCategory = 'Students';
    extractedIntent.targetBeneficiary = 'Job Seeker / Youth';
    extractedIntent.detectedNeeds.push('Skill Development & Apprenticeship', 'Employment Opportunities');
  }

  // Healthcare / Medical
  if (/\b(health|hospital|medical|illness|treatment|operation|surgery|disease|ayushman|medicine|doctor)\b/i.test(query)) {
    extractedIntent.problemCategory = 'Healthcare';
    extractedIntent.targetBeneficiary = 'Patient / Family';
    extractedIntent.detectedNeeds.push('Cashless Hospitalization', 'Health Insurance');
  }

  // Housing / Low Income
  if (/\b(housing|house|home|pucca|slum|homeless|awas|shelter|rent|low income|poor|bpl|ration)\b/i.test(query)) {
    extractedIntent.problemCategory = 'General';
    extractedIntent.incomeConstraint = true;
    extractedIntent.detectedNeeds.push('Affordable Housing Subsidy', 'Food Security (PDS)');
  }

  // Senior Citizen / Pension
  if (/\b(old age|senior citizen|pension|retired|elderly|grandfather|grandmother|60 years|70 years)\b/i.test(query)) {
    extractedIntent.problemCategory = 'Senior Citizens';
    extractedIntent.targetBeneficiary = 'Senior Citizen';
    extractedIntent.detectedNeeds.push('Old Age Pension', 'Elder Care Healthcare');
  }

  // 2. Fetch active schemes from database
  const allSchemes = await Scheme.find({ isDeleted: false })
    .populate('state', 'name code')
    .lean();

  // Merge with profile context if provided
  const userAge = userProfile?.age || (extractedIntent.problemCategory === 'Students' ? 20 : (extractedIntent.problemCategory === 'Senior Citizens' ? 65 : 30));
  const userGender = (userProfile?.gender && userProfile.gender !== 'Any') ? userProfile.gender : extractedIntent.genderInferred;
  const userIncome = userProfile?.annualIncome || 250000;

  // 3. Match against Schemes with strict categorization
  const scoredSchemes = allSchemes.map((scheme) => {
    let matchScore = 0;
    let confidence = 'Potentially relevant'; // 'Potentially relevant' | 'Likely eligible' | 'Verified eligibility'
    const reasons = [];
    const missingCriteria = [];

    // Category match
    const sCat = scheme.category;
    if (sCat === extractedIntent.problemCategory) {
      matchScore += 45;
      reasons.push(`Direct match with category: ${sCat}`);
    } else if (sCat === 'General') {
      matchScore += 25;
      reasons.push('Universal welfare scheme accessible to general citizens');
    }

    // Keyword & semantic relevance in description/name
    const words = query.split(/\s+/).filter(w => w.length > 3);
    const textBlob = `${scheme.name} ${scheme.eligibilityCriteria} ${scheme.category} ${scheme.documentsRequired}`.toLowerCase();
    const matchedWords = words.filter(w => textBlob.includes(w));
    if (matchedWords.length > 0) {
      matchScore += Math.min(matchedWords.length * 10, 30);
      reasons.push(`Matches keywords: "${matchedWords.join(', ')}"`);
    }

    // Deterministic Age verification
    if (userAge >= scheme.minAge && userAge <= scheme.maxAge) {
      matchScore += 10;
      reasons.push(`Citizen age (${userAge} yrs) is within eligible bracket (${scheme.minAge}-${scheme.maxAge} yrs)`);
    } else {
      missingCriteria.push(`Age requirement: ${scheme.minAge} to ${scheme.maxAge} years`);
    }

    // Deterministic Income verification
    if (userIncome <= scheme.incomeLimit) {
      matchScore += 10;
      reasons.push(`Annual income (₹${userIncome.toLocaleString()}) is below ceiling of ₹${scheme.incomeLimit.toLocaleString()}`);
    } else {
      missingCriteria.push(`Income ceiling of ₹${scheme.incomeLimit.toLocaleString()} exceeded`);
    }

    // Deterministic Gender verification
    if (scheme.genderRequirement === 'Any' || scheme.genderRequirement === userGender || userGender === 'Any') {
      matchScore += 5;
    } else {
      missingCriteria.push(`Scheme requires beneficiary gender to be ${scheme.genderRequirement}`);
    }

    // Determine Confidence level (Never falsely guarantee)
    if (missingCriteria.length === 0 && matchScore >= 75) {
      confidence = 'Likely eligible';
    } else if (matchScore >= 40) {
      confidence = 'Potentially relevant';
    }

    return {
      ...scheme,
      matchScore: Math.min(matchScore, 98), // Never claim 100% automated verification
      confidence,
      reasons,
      missingCriteria
    };
  });

  // Filter top matches
  const topMatches = scoredSchemes
    .filter(s => s.matchScore >= 35)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  return {
    query: queryText,
    extractedIntent,
    detectedFactors: {
      category: extractedIntent.problemCategory,
      targetBeneficiary: extractedIntent.targetBeneficiary,
      needs: extractedIntent.detectedNeeds,
      inferredIncomeConstraint: extractedIntent.incomeConstraint ? 'Low Income / Need-based' : 'Standard',
      inferredGender: extractedIntent.genderInferred
    },
    resultsCount: topMatches.length,
    matches: topMatches
  };
};

module.exports = { analyzeSituation };
