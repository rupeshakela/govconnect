const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const { User, UserProfile } = require('./models/User');
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
    console.log('🌱 Connected to MongoDB for Pure MERN backend comprehensive seeding...');

    // 1. Clean existing records
    await Promise.all([
      State.deleteMany({}),
      Category.deleteMany({}),
      Scheme.deleteMany({}),
      Exam.deleteMany({}),
      Job.deleteMany({}),
      UserProfile.deleteMany({}),
      User.deleteMany({ email: { $in: demoUsersData.map(d => d.user.email) } })
    ]);
    console.log('🧹 Cleaned existing records.');

    // 2. Seed All 36 Indian States & UTs
    const createdStates = await State.insertMany(statesData);
    const stateMap = {};
    createdStates.forEach(s => { stateMap[s.code] = s._id; });
    console.log(`✅ Seeded ${createdStates.length} Indian States & UTs.`);

    // 3. Seed All 8 Scheme Categories
    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.slug] = c._id; });
    console.log(`✅ Seeded ${createdCategories.length} Scheme Categories.`);

    // 4. Seed 55+ Real Indian Government Schemes with BenefitOS Intelligence
    const windowStatuses = ['Open Now', 'Closing Soon', 'Open Now', 'Year-Round', 'Opening Soon'];
    const depts = [
      'Ministry of Education', 'Ministry of Agriculture & Farmers Welfare', 
      'Ministry of Women and Child Development', 'Ministry of Micro, Small and Medium Enterprises',
      'Ministry of Skill Development & Entrepreneurship', 'Ministry of Health and Family Welfare',
      'Ministry of Housing and Urban Affairs'
    ];

    const schemesData = schemesDataRaw.map((scheme, idx) => {
      const winStatus = windowStatuses[idx % windowStatuses.length];
      const deadlineDate = winStatus === 'Closing Soon' 
        ? new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) 
        : (winStatus === 'Opening Soon' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null);

      let pathwayCategory = 'General';
      if (scheme.category === 'Students') pathwayCategory = 'Education & Skill';
      else if (scheme.category === 'Farmers') pathwayCategory = 'Agriculture & Rural';
      else if (scheme.category === 'Women') pathwayCategory = 'Healthcare & Security';
      else if (scheme.category === 'Startups' || scheme.category === 'Businesses') pathwayCategory = 'Enterprise & Livelihood';

      return {
        name: scheme.name,
        department: depts[idx % depts.length],
        category: scheme.category,
        eligibilityCriteria: scheme.eligibilityCriteria,
        incomeLimit: scheme.incomeLimit,
        minAge: scheme.minAge,
        maxAge: scheme.maxAge,
        genderRequirement: scheme.genderRequirement,
        state: scheme.stateCode ? (stateMap[scheme.stateCode] || null) : null,
        benefitAmount: scheme.benefitAmount,
        benefitType: scheme.benefitAmount > 0 ? 'Direct Bank Transfer (DBT)' : 'Institutional Subsidy / Training',
        documentsRequired: scheme.documentsRequired,
        applicationProcess: scheme.applicationProcess,
        officialWebsite: scheme.officialWebsite,
        applicationWindow: {
          status: winStatus,
          deadline: deadlineDate,
          cycleDescription: winStatus === 'Year-Round' ? 'Year-Round Continuous Enrollment' : 'Academic & Financial Year 2026-27',
          daysRemaining: winStatus === 'Closing Soon' ? 6 : (winStatus === 'Opening Soon' ? 14 : null)
        },
        pathwayCategory,
        pathwayStep: (idx % 4) + 1,
        lastVerified: 'September 2026',
        isDeleted: false
      };
    });

    const createdSchemes = await Scheme.insertMany(schemesData);
    console.log(`✅ Seeded ${createdSchemes.length} Real-World Central & State Government Schemes.`);

    // 5. Seed 25+ Real Government Jobs
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
    console.log(`✅ Seeded ${createdJobs.length} Real Government Job Recruitment Openings.`);

    // 6. Seed 18+ Real National Competitive Entrance Exams
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

    // 7. Seed 4 Verified Demo Citizens with BenefitOS Intelligence Profiles
    const hashedPassword = await bcrypt.hash('Password@123', 10);

    const demoFamilyProfiles = [
      // Persona 1: Rahul Sharma (Student, AP)
      [
        { name: 'Ramesh Sharma', relation: 'Father', age: 48, gender: 'Male', occupation: 'Farmer', qualification: '10th Pass', annualIncome: 120000 },
        { name: 'Sunita Sharma', relation: 'Mother', age: 44, gender: 'Female', occupation: 'Homemaker', qualification: 'Below 10th / Literate', annualIncome: 0 },
        { name: 'Priya Sharma', relation: 'Sister', age: 16, gender: 'Female', occupation: 'Student', qualification: '10th Pass', annualIncome: 0 }
      ],
      // Persona 2: Priya Patel (Women / Entrepreneur)
      [
        { name: 'Dinesh Patel', relation: 'Father', age: 52, gender: 'Male', occupation: 'Artisan / Craftsman', qualification: '10th Pass', annualIncome: 140000 },
        { name: 'Kamla Patel', relation: 'Mother', age: 49, gender: 'Female', occupation: 'Self-Employed / Business', qualification: 'Below 10th / Literate', annualIncome: 60000 }
      ],
      // Persona 3: Ramesh Kumar (Farmer)
      [
        { name: 'Geeta Devi', relation: 'Mother', age: 68, gender: 'Female', occupation: 'Senior Citizen / Retired', qualification: 'No Formal Education', annualIncome: 0 },
        { name: 'Amit Kumar', relation: 'Son', age: 20, gender: 'Male', occupation: 'Student', qualification: '12th Pass', annualIncome: 0 }
      ],
      // Persona 4: Amit Verma (Job Seeker / Salaried)
      [
        { name: 'Sita Verma', relation: 'Mother', age: 58, gender: 'Female', occupation: 'Senior Citizen / Retired', qualification: 'Graduate / Degree', annualIncome: 0 }
      ]
    ];

    const standardChecklist = [
      { docName: 'Aadhaar Card', status: 'Available' },
      { docName: 'Bank Account Passbook', status: 'Available' },
      { docName: 'Marksheet / Educational Certificate', status: 'Available' },
      { docName: 'Income Certificate', status: 'Missing' },
      { docName: 'Residence / Domicile Certificate', status: 'Available' },
      { docName: 'Caste Certificate', status: 'Available' },
      { docName: 'Passport Size Photograph', status: 'Available' },
      { docName: 'Ration Card', status: 'Missing' }
    ];

    for (let i = 0; i < demoUsersData.length; i++) {
      const demo = demoUsersData[i];
      const user = await User.create({
        fullName: demo.user.fullName,
        email: demo.user.email.toLowerCase(),
        phone: demo.user.phone,
        password: hashedPassword,
        isEmailVerified: demo.user.isEmailVerified,
        isPhoneVerified: demo.user.isPhoneVerified,
        accountStatus: demo.user.accountStatus,
        isCitizen: demo.user.isCitizen,
        isAdminUser: demo.user.isAdminUser
      });

      const matchedSchemeIds = createdSchemes
        .filter(s => demo.profile.savedSchemeKeywords.some(kw => s.name.toLowerCase().includes(kw.toLowerCase())))
        .map(s => s._id);

      await UserProfile.create({
        user: user._id,
        age: demo.profile.age,
        gender: demo.profile.gender,
        annualIncome: demo.profile.annualIncome,
        occupation: demo.profile.occupation,
        qualification: demo.profile.qualification,
        casteCategory: demo.profile.casteCategory,
        state: demo.profile.stateCode ? stateMap[demo.profile.stateCode] : null,
        district: 'Guntur',
        maritalStatus: demo.profile.maritalStatus,
        disabilityStatus: demo.profile.disabilityStatus,
        savedSchemes: matchedSchemeIds.length > 0 ? matchedSchemeIds : [createdSchemes[0]._id],
        familyMembers: demoFamilyProfiles[i] || [],
        documentChecklist: standardChecklist,
        readinessScore: {
          overall: 78,
          profileCompleteness: 95,
          eligibilityConfidence: 84,
          documentReadiness: 62,
          applicationReadiness: 71,
          lastCalculated: new Date()
        }
      });
    }

    console.log(`✅ Seeded ${demoUsersData.length} Verified Demo Citizens with BenefitOS intelligence profiles.`);


    console.log(`\n=============================================================`);
    console.log(`🎉 MASSIVE REAL-WORLD DATABASE SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`=============================================================`);
    console.log(`📊 Summary:`);
    console.log(`   - States/UTs: ${createdStates.length} (All 28 States + 8 UTs)`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Govt Schemes: ${createdSchemes.length}`);
    console.log(`   - Govt Jobs: ${createdJobs.length}`);
    console.log(`   - Competitive Exams: ${createdExams.length}`);
    console.log(`   - Demo Citizens: ${demoUsersData.length} (All passwords: Password@123)`);
    demoUsersData.forEach(d => {
      console.log(`     * ${d.user.fullName} (${d.profile.occupation}): ${d.user.email}`);
    });
    console.log(`=============================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during heavy database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
