const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('./models/User');
const UserProfile = require('./models/UserProfile');
const Scheme = require('./models/Scheme');
const { State, Category, Exam, Job } = require('./models/Portal');

const {
  statesData,
  categoriesData,
  schemesDataRaw,
  jobsDataRaw,
  examsDataRaw,
  demoUsersData
} = require('./data/realData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/govconnect';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🌱 Connected to MongoDB for comprehensive real-world seeding...');

    // 1. Clean existing collections completely
    await Promise.all([
      State.deleteMany({}),
      Category.deleteMany({}),
      Scheme.deleteMany({}),
      Exam.deleteMany({}),
      Job.deleteMany({}),
      UserProfile.deleteMany({}),
      User.deleteMany({ email: { $in: demoUsersData.map(d => d.user.email) } })
    ]);
    console.log('🧹 Cleaned existing portal and demo user records.');

    // 2. Seed All 36 Indian States & Union Territories
    const createdStates = await State.insertMany(statesData);
    const stateMap = {};
    createdStates.forEach(s => { stateMap[s.code] = s._id; });
    console.log(`✅ Seeded ${createdStates.length} Indian States & Union Territories.`);

    // 3. Seed All 8 Scheme Categories
    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.slug] = c._id; });
    console.log(`✅ Seeded ${createdCategories.length} Scheme Categories.`);

    // 4. Seed 55+ Verified Real Schemes
    const schemesData = schemesDataRaw.map(scheme => ({
      name: scheme.name,
      category: scheme.category,
      eligibilityCriteria: scheme.eligibilityCriteria,
      incomeLimit: scheme.incomeLimit,
      minAge: scheme.minAge,
      maxAge: scheme.maxAge,
      genderRequirement: scheme.genderRequirement,
      state: scheme.stateCode ? (stateMap[scheme.stateCode] || null) : null,
      benefitAmount: scheme.benefitAmount,
      documentsRequired: scheme.documentsRequired,
      applicationProcess: scheme.applicationProcess,
      officialWebsite: scheme.officialWebsite,
      isDeleted: false
    }));

    const createdSchemes = await Scheme.insertMany(schemesData);
    console.log(`✅ Seeded ${createdSchemes.length} Real-World Central & State Government Schemes.`);

    // 5. Seed 25+ Sarkari Job Recruitment Notifications
    const jobsData = jobsDataRaw.map(job => ({
      department: job.department,
      postName: job.postName,
      vacancies: job.vacancies,
      salaryRange: job.salaryRange,
      qualification: job.qualification,
      lastDate: job.lastDate,
      state: job.stateCode ? (stateMap[job.stateCode] || null) : null,
      officialNotification: job.officialNotification,
      isDeleted: false
    }));

    const createdJobs = await Job.insertMany(jobsData);
    console.log(`✅ Seeded ${createdJobs.length} Real Sarkari Job Recruitment Openings.`);

    // 6. Seed 18+ National Competitive Entrance & Civil Services Exams
    const examsData = examsDataRaw.map(exam => ({
      name: exam.name,
      conductingAuthority: exam.conductingAuthority,
      category: catMap[exam.categorySlug] || createdCategories[0]._id,
      qualification: exam.qualification,
      ageLimit: exam.ageLimit,
      fees: exam.fees,
      importantDates: exam.importantDates,
      eligibility: exam.eligibility,
      examPattern: exam.examPattern,
      syllabus: exam.syllabus,
      vacancyCount: exam.vacancyCount,
      admitCardLink: exam.admitCardLink,
      resultLink: exam.resultLink,
      officialWebsite: exam.officialWebsite,
      isDeleted: false
    }));

    const createdExams = await Exam.insertMany(examsData);
    console.log(`✅ Seeded ${createdExams.length} Real National Competitive Entrance & Recruitment Exams.`);

    // 7. Seed 4 Verified Citizen Demographics with Password@123
    const hashedPassword = await bcrypt.hash('Password@123', 10);

    for (const demo of demoUsersData) {
      // Create user document compatible with both Passport and MERN
      const userDoc = new User({
        username: demo.user.email.toLowerCase(),
        fullName: demo.user.fullName,
        email: demo.user.email.toLowerCase(),
        phone: demo.user.phone,
        password: hashedPassword,
        accountStatus: demo.user.accountStatus,
        isEmailVerified: demo.user.isEmailVerified,
        isPhoneVerified: demo.user.isPhoneVerified,
        isCitizen: demo.user.isCitizen,
        isAdminUser: demo.user.isAdminUser
      });

      // Register with passport-local-mongoose for EJS app session auth
      const registeredUser = await User.register(userDoc, 'Password@123');
      
      // Ensure bcrypt password field is also saved for MERN JWT auth
      registeredUser.password = hashedPassword;
      await registeredUser.save();

      // Find matched schemes for bookmarks
      const matchedSchemeIds = createdSchemes
        .filter(s => demo.profile.savedSchemeKeywords.some(kw => s.name.toLowerCase().includes(kw.toLowerCase())))
        .map(s => s._id);

      await UserProfile.create({
        user: registeredUser._id,
        age: demo.profile.age,
        gender: demo.profile.gender,
        annualIncome: demo.profile.annualIncome,
        occupation: demo.profile.occupation,
        qualification: demo.profile.qualification,
        casteCategory: demo.profile.casteCategory,
        state: demo.profile.stateCode ? stateMap[demo.profile.stateCode] : null,
        maritalStatus: demo.profile.maritalStatus,
        disabilityStatus: demo.profile.disabilityStatus,
        savedSchemes: matchedSchemeIds.length > 0 ? matchedSchemeIds : [createdSchemes[0]._id]
      });
    }

    console.log(`✅ Seeded ${demoUsersData.length} Verified Demo Citizens (All passwords: Password@123).`);

    console.log(`\n================================================================`);
    console.log(`🎉 COMPREHENSIVE REAL-WORLD DATABASE SEEDING COMPLETED!`);
    console.log(`================================================================`);
    console.log(`📊 Total Seeded Entities:`);
    console.log(`   🏛️  States & UTs:         ${createdStates.length} (All 28 States + 8 UTs)`);
    console.log(`   📂  Categories:           ${createdCategories.length}`);
    console.log(`   📜  Government Schemes:   ${createdSchemes.length}`);
    console.log(`   💼  Sarkari Jobs:         ${createdJobs.length}`);
    console.log(`   🎓  Competitive Exams:    ${createdExams.length}`);
    console.log(`   👤  Citizen Personas:     ${demoUsersData.length}`);
    console.log(`\n🔑 Demo Citizen Accounts (Password: Password@123):`);
    demoUsersData.forEach(d => {
      console.log(`   - ${d.user.fullName} (${d.profile.occupation}): ${d.user.email} | Mobile: ${d.user.phone}`);
    });
    console.log(`================================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during comprehensive database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
