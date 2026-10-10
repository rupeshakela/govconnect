const Scheme = require('../models/Scheme');
const UserProfile = require('../models/UserProfile');
const { State } = require('../models/Portal');
const { getRecommendedSchemes } = require('./recommendationService');

/**
 * BenefitOS Benefit Gap Detector Engine
 * Answers: "What am I missing?"
 * Evaluates citizen's profile and documents to identify un-availed opportunities and document bottlenecks.
 */
const calculateBenefitGap = async (userId) => {
  const profile = await UserProfile.findOne({ user: userId })
    .populate('savedSchemes')
    .populate('state', 'name code');

  if (!profile) {
    throw new Error('Profile not found.');
  }

  // 1. Get all potentially eligible schemes
  const eligibleSchemes = await getRecommendedSchemes(profile);
  const savedSchemeIds = (profile.savedSchemes || []).map(s => s._id ? s._id.toString() : s.toString());

  // 2. Identify saved vs missed
  const savedList = [];
  const missedList = [];

  eligibleSchemes.forEach(scheme => {
    const isSaved = savedSchemeIds.includes(scheme._id.toString());
    if (isSaved) {
      savedList.push(scheme);
    } else {
      missedList.push(scheme);
    }
  });

  // 3. Document Readiness and Gap Analysis
  const standardDocs = [
    'Aadhaar Card',
    'Bank Account Passbook',
    'Income Certificate',
    'Residence / Domicile Certificate',
    'Caste Certificate',
    'Marksheet / Educational Certificate',
    'Passport Size Photograph',
    'Ration Card'
  ];

  // User's current document checklist
  const userDocs = profile.documentChecklist || [];
  const userDocMap = {};
  userDocs.forEach(d => {
    userDocMap[d.docName.toLowerCase()] = d.status;
  });

  // Aggregate document demand across all eligible schemes
  const docDemandCount = {};
  eligibleSchemes.forEach(scheme => {
    const rawDocs = scheme.documentsRequired || '';
    standardDocs.forEach(stdDoc => {
      if (rawDocs.toLowerCase().includes(stdDoc.toLowerCase().split(' ')[0])) {
        docDemandCount[stdDoc] = (docDemandCount[stdDoc] || 0) + 1;
      }
    });
  });

  // Document checklist with current statuses
  const evaluatedDocs = standardDocs.map(docName => {
    const status = userDocMap[docName.toLowerCase()] || 'Missing';
    return {
      docName,
      status,
      requiredBySchemesCount: docDemandCount[docName] || 1,
      isBottleneck: status === 'Missing' && (docDemandCount[docName] || 0) >= 2
    };
  });

  const availableDocsCount = evaluatedDocs.filter(d => d.status === 'Available').length;
  const missingDocsCount = evaluatedDocs.filter(d => d.status === 'Missing').length;
  const documentReadinessPercentage = Math.round((availableDocsCount / evaluatedDocs.length) * 100);

  // 4. Calculate Explainable Benefit Readiness Score
  // Weights: Profile Completeness (30%), Eligibility Confidence (30%), Document Readiness (40%)
  const profileFields = [profile.age, profile.gender, profile.annualIncome, profile.occupation, profile.qualification, profile.casteCategory, profile.state];
  const filledFields = profileFields.filter(f => f !== null && f !== undefined && f !== '');
  const profileCompleteness = Math.round((filledFields.length / profileFields.length) * 100);

  const avgMatchScore = eligibleSchemes.length > 0 
    ? Math.round(eligibleSchemes.reduce((acc, curr) => acc + (curr.matchScore || 70), 0) / eligibleSchemes.length)
    : 60;

  const overallReadinessScore = Math.round(
    (profileCompleteness * 0.25) + 
    (avgMatchScore * 0.35) + 
    (documentReadinessPercentage * 0.40)
  );

  // Update profile readiness score in DB
  profile.readinessScore = {
    overall: overallReadinessScore,
    profileCompleteness,
    eligibilityConfidence: avgMatchScore,
    documentReadiness: documentReadinessPercentage,
    applicationReadiness: Math.round((savedList.length > 0 ? 75 : 45)),
    lastCalculated: new Date()
  };
  await profile.save();

  // 5. Total Estimated Monetary Value (Never fabricate - clearly label variable)
  let totalEstimatedValue = 0;
  let hasVariableAmount = false;

  eligibleSchemes.forEach(s => {
    if (s.benefitAmount && s.benefitAmount > 0) {
      totalEstimatedValue += s.benefitAmount;
    } else {
      hasVariableAmount = true;
    }
  });

  // 6. Application Windows Breakdown
  const windows = {
    openNow: [],
    openingSoon: [],
    closingSoon: [],
    yearRound: [],
    closed: []
  };

  eligibleSchemes.forEach(s => {
    const winStatus = s.applicationWindow?.status || 'Open Now';
    if (winStatus === 'Opening Soon') windows.openingSoon.push(s);
    else if (winStatus === 'Closing Soon') windows.closingSoon.push(s);
    else if (winStatus === 'Year-Round') windows.yearRound.push(s);
    else if (winStatus === 'Closed') windows.closed.push(s);
    else windows.openNow.push(s);
  });

  return {
    summary: {
      totalRelevantBenefits: eligibleSchemes.length,
      currentlySaved: savedList.length,
      potentiallyMissed: missedList.length,
      estimatedMonetaryValue: totalEstimatedValue,
      isAmountVariable: hasVariableAmount,
      monetaryLabel: totalEstimatedValue > 0 ? `₹${totalEstimatedValue.toLocaleString('en-IN')}+ (where fixed)` : 'Benefit amount varies by eligibility',
      missingDocumentsCount: missingDocsCount
    },
    readinessScore: profile.readinessScore,
    missedBenefits: missedList.slice(0, 8),
    savedBenefits: savedList,
    documentsChecklist: evaluatedDocs,
    applicationWindows: windows,
    nextRecommendedAction: missingDocsCount > 0 
      ? `Obtain your missing documents (${evaluatedDocs.find(d => d.status === 'Missing')?.docName || 'Income Certificate'}) to unlock ${missedList.length} potential benefits.`
      : 'You have high document readiness! Proceed to submit applications for closing opportunities.'
  };
};

module.exports = { calculateBenefitGap };
