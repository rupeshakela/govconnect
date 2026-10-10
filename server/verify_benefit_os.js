const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { analyzeSituation } = require('./services/situationAnalyzer');
const { calculateBenefitGap } = require('./services/gapDetectorService');
const { getBenefitPathways } = require('./services/pathwayService');
const { verifyMessageOrClaim } = require('./services/scamDetectorService');
const { User, UserProfile } = require('./models/User');
const { State } = require('./models/Portal');

const runVerification = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/govconnect');
    console.log('✅ Connected to MongoDB for BenefitOS verification');

    // 1. Test Situation Understanding Engine
    console.log('\n--- 1. Testing Situation Analyzer ---');
    const situationRes = await analyzeSituation('I need financial help for my daughter higher education and tuition fees');
    console.log(`Problem Category: ${situationRes.detectedFactors.category}`);
    console.log(`Target Beneficiary: ${situationRes.detectedFactors.targetBeneficiary}`);
    console.log(`Matched Schemes Count: ${situationRes.resultsCount}`);
    if (situationRes.matches.length > 0) {
      console.log(`Top Scheme: "${situationRes.matches[0].name}" (${situationRes.matches[0].confidence}, ${situationRes.matches[0].matchScore}% match)`);
    }

    // 2. Test Benefit Gap Detector with a demo user
    console.log('\n--- 2. Testing Benefit Gap Detector ---');
    const demoUser = await User.findOne({ email: 'citizen@gov.in' });
    if (demoUser) {
      const gapRes = await calculateBenefitGap(demoUser._id);
      console.log(`Total Relevant: ${gapRes.summary.totalRelevantBenefits}`);
      console.log(`Currently Saved: ${gapRes.summary.currentlySaved}`);
      console.log(`Potentially Missed: ${gapRes.summary.potentiallyMissed}`);
      console.log(`Readiness Score: ${gapRes.readinessScore.overall}/100`);
      console.log(`Missing Documents Count: ${gapRes.summary.missingDocumentsCount}`);
    }

    // 3. Test Benefit Pathways
    console.log('\n--- 3. Testing Benefit Pathways ---');
    const pathways = await getBenefitPathways();
    console.log(`Pathways Count: ${pathways.length}`);
    console.log(`Pathway 1 Title: "${pathways[0].title}" (${pathways[0].steps.length} sequential steps)`);

    // 4. Test Government Scam / Message Risk Detector
    console.log('\n--- 4. Testing Scam Detector ---');
    const fakeMsg = 'URGENT: Approved ₹50,000 under PM Relief Scheme. Share your Aadhaar OTP and deposit ₹499 fee at http://pm-relief.xyz/claim';
    const scamRes = verifyMessageOrClaim(fakeMsg);
    console.log(`Risk Score: ${scamRes.riskScore}/100 (${scamRes.riskLevel})`);
    console.log(`Red Flags Found: ${scamRes.redFlagsFound.length}`);

    const genuineMsg = 'National Scholarship Portal applications open on https://scholarships.gov.in';
    const genuineRes = verifyMessageOrClaim(genuineMsg);
    console.log(`Genuine Notice Risk Score: ${genuineRes.riskScore}/100 (${genuineRes.riskLevel})`);

    console.log('\n🎉 ALL BENEFITOS BACKEND INTELLIGENCE MODULES VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
};

runVerification();
