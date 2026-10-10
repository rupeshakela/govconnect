const UserProfile = require('../models/UserProfile');
const Scheme = require('../models/Scheme');
const { analyzeSituation } = require('../services/situationAnalyzer');
const { calculateBenefitGap } = require('../services/gapDetectorService');
const { getBenefitPathways } = require('../services/pathwayService');
const { verifyMessageOrClaim } = require('../services/scamDetectorService');
const { getRecommendedSchemes } = require('../services/recommendationService');

// @desc    Natural Language Situation Understanding
// @route   POST /api/benefits/analyze-situation
// @access  Public (Optional auth for enhanced profile context)
const handleAnalyzeSituation = async (req, res) => {
  try {
    const { problem, profileData } = req.body;
    let userProfile = profileData || null;

    if (!userProfile && req.user) {
      userProfile = await UserProfile.findOne({ user: req.user._id }).populate('state');
    }

    const result = await analyzeSituation(problem, userProfile);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Benefit Gap Analysis & Document Bottlenecks
// @route   GET /api/benefits/gap-analysis
// @access  Private
const handleGapAnalysis = async (req, res) => {
  try {
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

    const gapData = await calculateBenefitGap(req.user._id);
    res.json({ success: true, data: gapData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Benefit Pathways / Sequences
// @route   GET /api/benefits/pathways
// @access  Public
const handleGetPathways = async (req, res) => {
  try {
    const { category } = req.query;
    const pathways = await getBenefitPathways(category);
    res.json({ success: true, count: pathways.length, data: pathways });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Government Benefit Scam / Message Risk Analyzer
// @route   POST /api/benefits/verify-message
// @access  Public
const handleVerifyMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const analysis = verifyMessageOrClaim(message);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Family Benefit Intelligence & Collective Map
// @route   GET /api/benefits/family
// @access  Private
const handleGetFamilyMap = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ user: req.user._id }).populate('state');
    if (!profile) {
      profile = await UserProfile.create({ user: req.user._id });
    }

    const members = profile.familyMembers || [];
    const allSchemes = await Scheme.find({ isDeleted: false }).lean();

    // Calculate individual and collective benefits per family member
    const familyBenefitMap = [];
    let totalCollectiveOpportunities = 0;

    for (const member of members) {
      // Simulate recommendation for this family member
      const memberProfile = {
        age: member.age,
        gender: member.gender,
        annualIncome: member.annualIncome || profile.annualIncome,
        occupation: member.occupation,
        qualification: member.qualification,
        state: profile.state?._id
      };

      const memberEligible = await getRecommendedSchemes(memberProfile);
      totalCollectiveOpportunities += memberEligible.length;

      familyBenefitMap.push({
        memberId: member._id,
        name: member.name,
        relation: member.relation,
        age: member.age,
        occupation: member.occupation,
        gender: member.gender,
        eligibleCount: memberEligible.length,
        topBenefits: memberEligible.slice(0, 3).map(s => ({
          name: s.name,
          category: s.category,
          benefitAmount: s.benefitAmount,
          benefitType: s.benefitType,
          officialWebsite: s.officialWebsite
        }))
      });
    }

    res.json({
      success: true,
      data: {
        totalMembers: members.length,
        totalCollectiveBenefits: totalCollectiveOpportunities,
        familyBenefitMap,
        members
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Family Member
// @route   POST /api/benefits/family/member
// @access  Private
const handleAddFamilyMember = async (req, res) => {
  try {
    const { name, relation, age, gender, occupation, qualification, annualIncome } = req.body;
    let profile = await UserProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new UserProfile({ user: req.user._id, familyMembers: [] });
    }

    profile.familyMembers.push({
      name,
      relation,
      age: Number(age) || 20,
      gender: gender || 'Male',
      occupation: occupation || 'Student',
      qualification: qualification || '12th Pass',
      annualIncome: Number(annualIncome) || 0
    });

    await profile.save();

    res.json({
      success: true,
      message: `${name} (${relation}) added to Family Benefit Profile.`,
      familyMembers: profile.familyMembers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Family Member
// @route   DELETE /api/benefits/family/member/:id
// @access  Private
const handleDeleteFamilyMember = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    profile.familyMembers = profile.familyMembers.filter(m => m._id.toString() !== req.params.id);
    await profile.save();

    res.json({ success: true, message: 'Family member removed.', familyMembers: profile.familyMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get or Initialize Personal Action Plan
// @route   GET /api/benefits/action-plan
// @access  Private
const handleGetActionPlan = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ user: req.user._id }).populate('savedSchemes');
    if (!profile) {
      profile = await UserProfile.create({ user: req.user._id });
    }

    // If no action tasks, generate intelligent starter plan
    if (!profile.actionPlanTasks || profile.actionPlanTasks.length === 0) {
      const initialTasks = [
        {
          title: 'Complete Citizen & Family Profile',
          description: 'Ensure age, income certificate category, and educational qualification are updated.',
          category: 'Profile Update',
          priority: 'High',
          isCompleted: Boolean(profile.annualIncome && profile.occupation),
          deadline: 'Next 3 Days',
          officialUrl: '/profile'
        },
        {
          title: 'Obtain / Renew Income Certificate',
          description: 'Required by 85% of state & central welfare scholarship schemes to verify income threshold.',
          category: 'Document Preparation',
          priority: 'High',
          isCompleted: false,
          deadline: 'Next 7 Days',
          officialUrl: 'https://services.india.gov.in'
        },
        {
          title: 'Verify Aadhaar-Bank Account DBT Linkage',
          description: 'Check active NPCI Aadhaar seeding for direct subsidy benefit transfers in your bank account.',
          category: 'Verification',
          priority: 'High',
          isCompleted: true,
          deadline: 'Completed',
          officialUrl: 'https://myaadhaar.uidai.gov.in'
        },
        {
          title: 'Prepare Scholarship / Welfare Application Dossier',
          description: 'Compile academic marksheets, domicile certificate, and passport photographs for open schemes.',
          category: 'Document Preparation',
          priority: 'Medium',
          isCompleted: false,
          deadline: 'Before Cycle Closes',
          officialUrl: 'https://scholarships.gov.in'
        },
        {
          title: 'Review Family Benefit Map Opportunities',
          description: 'Discover additional schemes available for parents and siblings under health and pension umbrellas.',
          category: 'Application Submission',
          priority: 'Low',
          isCompleted: false,
          deadline: 'Flexible',
          officialUrl: '/family'
        }
      ];

      profile.actionPlanTasks = initialTasks;
      await profile.save();
    }

    res.json({
      success: true,
      count: profile.actionPlanTasks.length,
      data: profile.actionPlanTasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle or Add Task to Action Plan
// @route   POST /api/benefits/action-plan/task
// @access  Private
const handleAddTask = async (req, res) => {
  try {
    const { title, description, category, priority, deadline, officialUrl } = req.body;
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    profile.actionPlanTasks.push({
      title,
      description,
      category: category || 'General',
      priority: priority || 'Medium',
      deadline: deadline || 'Flexible',
      officialUrl: officialUrl || '',
      isCompleted: false
    });

    await profile.save();
    res.json({ success: true, data: profile.actionPlanTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Task Completion Status
// @route   PUT /api/benefits/action-plan/task/:id
// @access  Private
const handleToggleTask = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const task = profile.actionPlanTasks.id(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.isCompleted = !task.isCompleted;
    await profile.save();

    res.json({ success: true, message: 'Task status updated.', data: profile.actionPlanTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Interactive Dynamic Benefit Simulator
// @route   POST /api/benefits/simulate
// @access  Public
const handleSimulate = async (req, res) => {
  try {
    const { annualIncome = 250000, age = 22, occupation = 'Student', gender = 'Any', stateId = null } = req.body;

    const query = {
      isDeleted: false,
      minAge: { $lte: Number(age) },
      maxAge: { $gte: Number(age) },
      incomeLimit: { $gte: Number(annualIncome) }
    };

    if (gender && gender !== 'Any') {
      query.genderRequirement = { $in: [gender, 'Any'] };
    }

    if (stateId && stateId !== 'All') {
      query.$or = [{ state: stateId }, { state: null }];
    }

    const matchedSchemes = await Scheme.find(query).populate('state', 'name code').lean();

    res.json({
      success: true,
      simulationParams: { annualIncome, age, occupation, gender },
      matchedCount: matchedSchemes.length,
      data: matchedSchemes.slice(0, 12)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Document Status in Checklist
// @route   PUT /api/benefits/document-checklist
// @access  Private
const handleUpdateDocumentChecklist = async (req, res) => {
  try {
    const { docName, status } = req.body;
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const existingIndex = profile.documentChecklist.findIndex(d => d.docName.toLowerCase() === docName.toLowerCase());
    if (existingIndex > -1) {
      profile.documentChecklist[existingIndex].status = status;
      profile.documentChecklist[existingIndex].lastUpdated = new Date();
    } else {
      profile.documentChecklist.push({ docName, status, lastUpdated: new Date() });
    }

    await profile.save();
    res.json({ success: true, message: 'Document checklist updated.', checklist: profile.documentChecklist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulated Presentation Impact Metrics (Clearly Labeled)
// @route   GET /api/benefits/impact-stats
// @access  Public
const handleGetImpactStats = async () => {
  // Demo / Simulated stats for competition judging
  return {
    isDemoData: true,
    label: 'Simulated / Demonstration Statistics for Presentation',
    metrics: {
      citizensAnalyzed: 14820,
      potentialBenefitsIdentified: 48930,
      documentGapsResolved: 21450,
      estimatedAidUnlocked: '₹18.4 Crore',
      avgReadinessGain: '+38%'
    }
  };
};

module.exports = {
  handleAnalyzeSituation,
  handleGapAnalysis,
  handleGetPathways,
  handleVerifyMessage,
  handleGetFamilyMap,
  handleAddFamilyMember,
  handleDeleteFamilyMember,
  handleGetActionPlan,
  handleAddTask,
  handleToggleTask,
  handleSimulate,
  handleUpdateDocumentChecklist,
  handleGetImpactStats
};
