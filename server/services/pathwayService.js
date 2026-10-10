const Scheme = require('../models/Scheme');

/**
 * BenefitOS Benefit Pathway / Sequence Engine
 * Links related welfare and developmental initiatives into cohesive citizen pathways.
 * Clearly framed as "Possible pathway" to help citizens navigate life-stage milestones.
 */
const getBenefitPathways = async (category = 'Student') => {
  const allSchemes = await Scheme.find({ isDeleted: false }).lean();

  const pathways = [
    {
      id: 'pathway-education-career',
      title: 'Higher Education & Career Progression Pathway',
      targetBeneficiary: 'Students & Fresher Youth',
      description: 'A sequential progression from intermediate education funding to industry skill certification and employment.',
      disclaimer: 'Possible pathway based on developmental milestones. Individual schemes require separate eligibility checks.',
      steps: [
        {
          stepNumber: 1,
          stage: 'Foundational Education Support',
          programName: 'Central Sector Scheme of Scholarships for College & University Students',
          purpose: 'Annual financial grant to meet university tuition and examination fees.',
          benefit: '₹12,000 to ₹20,000 / year',
          eligibilityStatus: 'Likely Eligible (Age 17-25, 12th Pass >80th percentile)',
          requiredDocuments: ['12th Marksheet', 'Income Certificate', 'Aadhaar Card', 'Bank Account'],
          nextAction: 'Apply on National Scholarship Portal (NSP) before deadline.',
          officialUrl: 'https://scholarships.gov.in'
        },
        {
          stepNumber: 2,
          stage: 'Skill Training & Industry Certification',
          programName: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
          purpose: 'Free industry-aligned skill training with government certification and stipend.',
          benefit: '100% Free Training + Skill Card + ₹8,000 reward on certification',
          eligibilityStatus: 'Likely Eligible (10th/12th/Graduate youth)',
          requiredDocuments: ['Aadhaar Card', 'Highest Qualification Certificate', 'Bank Passbook'],
          nextAction: 'Enroll in nearest Skill India Training Centre.',
          officialUrl: 'https://www.pmkvyofficial.org'
        },
        {
          stepNumber: 3,
          stage: 'Industry Apprenticeship & Experience',
          programName: 'National Apprenticeship Promotion Scheme (NAPS)',
          purpose: 'On-the-job industrial apprenticeship with monthly government-shared stipend.',
          benefit: 'Monthly stipend of ₹8,000 - ₹15,000 + Industry experience',
          eligibilityStatus: 'Likely Eligible (Diploma/ITI/Graduates)',
          requiredDocuments: ['NAPS Portal Registration', 'Resume', 'ID Proof'],
          nextAction: 'Register candidate profile on Apprenticeship Portal.',
          officialUrl: 'https://www.apprenticeshipindia.gov.in'
        },
        {
          stepNumber: 4,
          stage: 'Self-Employment / Venture Setup',
          programName: 'Pradhan Mantri Mudra Yojana (Shishu & Kishor Category)',
          purpose: 'Collateral-free business credit for starting small enterprises or consultancy.',
          benefit: 'Loans up to ₹50,000 (Shishu) to ₹5,00,000 (Kishor)',
          eligibilityStatus: 'Likely Eligible with viable business project plan',
          requiredDocuments: ['Business Plan / Quotation', 'PAN & Aadhaar Card', 'Bank Statement 6 Months'],
          nextAction: 'Submit Mudra application via Udyamimitra portal.',
          officialUrl: 'https://www.mudra.org.in'
        }
      ]
    },
    {
      id: 'pathway-farmer-prosperity',
      title: 'Farmer Income Security & Modernization Pathway',
      targetBeneficiary: 'Farmers & Agricultural Workers',
      description: 'End-to-end support covering direct income, solar pump irrigation, crop risk insurance, and Kisan credit.',
      disclaimer: 'Possible pathway based on agricultural lifecycle needs.',
      steps: [
        {
          stepNumber: 1,
          stage: 'Direct Income Support',
          programName: 'PM-KISAN Samman Nidhi',
          purpose: 'Direct income support of ₹6,000 annually in 3 equal installments.',
          benefit: '₹6,000 / year direct to DBT bank account',
          eligibilityStatus: 'Likely Eligible (Landholding farming families)',
          requiredDocuments: ['Land Records (Khatauni/ROR)', 'Aadhaar Card', 'DBT Linked Bank Account'],
          nextAction: 'Complete e-KYC on PM-KISAN portal.',
          officialUrl: 'https://pmkisan.gov.in'
        },
        {
          stepNumber: 2,
          stage: 'Clean Energy & Irrigation Subsidy',
          programName: 'PM-KUSUM Component-B (Solar Water Pump)',
          purpose: 'Up to 90% combined central & state subsidy for standalone solar agricultural pump.',
          benefit: '60% - 90% Subsidy on 3HP to 7.5HP Solar Pumps',
          eligibilityStatus: 'Likely Eligible (Farmers with agricultural land & water source)',
          requiredDocuments: ['Land Record Copy', 'Aadhaar Card', 'Bank Passbook', 'Water Source Declaration'],
          nextAction: 'Apply through State Renewable Energy Agency portal.',
          officialUrl: 'https://pmkusum.mnre.gov.in'
        },
        {
          stepNumber: 3,
          stage: 'Crop Loss & Disaster Insurance',
          programName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
          purpose: 'Comprehensive crop insurance against non-preventable natural risks.',
          benefit: 'Full sum insured coverage at nominal 1.5%-2% farmer premium',
          eligibilityStatus: 'Likely Eligible (All farmers growing notified crops)',
          requiredDocuments: ['Sowing Certificate', 'Land Possession Certificate', 'Aadhaar Card'],
          nextAction: 'Opt-in during seasonal crop enrollment window.',
          officialUrl: 'https://pmfby.gov.in'
        },
        {
          stepNumber: 4,
          stage: 'Low-Interest Working Capital',
          programName: 'Kisan Credit Card (KCC) Scheme',
          purpose: 'Flexible credit line at 4% subsidized interest for seeds, fertilizers, and farm inputs.',
          benefit: 'Credit limit up to ₹3,00,000 at 4% effective interest rate',
          eligibilityStatus: 'Likely Eligible (Farmers, Dairy, Fisheries)',
          requiredDocuments: ['Land Title Deed', 'Application Form', 'ID & Address Proof'],
          nextAction: 'Submit KCC application to local commercial or cooperative bank.',
          officialUrl: 'https://www.myscheme.gov.in'
        }
      ]
    },
    {
      id: 'pathway-women-livelihood',
      title: 'Women Livelihood & Self-Reliance Pathway',
      targetBeneficiary: 'Women & Self-Help Group (SHG) Members',
      description: 'Progressive journey from health & maternity support to skill training, collective credit, and independent micro-enterprise.',
      disclaimer: 'Possible pathway. Verified state and central guidelines apply.',
      steps: [
        {
          stepNumber: 1,
          stage: 'Healthcare & Family Nutrition',
          programName: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
          purpose: 'Direct financial incentive of ₹5,000 for wage compensation and maternal nutrition.',
          benefit: '₹5,000 in DBT installments',
          eligibilityStatus: 'Likely Eligible for pregnant & lactating mothers',
          requiredDocuments: ['Mother & Child Protection (MCP) Card', 'Aadhaar Card', 'Bank Passbook'],
          nextAction: 'Register with Anganwadi Worker (AWW) or PMMVY portal.',
          officialUrl: 'https://pmmvy.wcd.gov.in'
        },
        {
          stepNumber: 2,
          stage: 'Livelihood & Skill Development',
          programName: 'Deendayal Antyodaya Yojana - National Rural Livelihoods Mission (DAY-NRLM)',
          purpose: 'Community institutional support and livelihood skills through Women Self-Help Groups.',
          benefit: 'Community Revolving Fund + Micro-enterprise training',
          eligibilityStatus: 'Likely Eligible (Rural women joining SHG)',
          requiredDocuments: ['SHG Membership ID', 'Aadhaar Card'],
          nextAction: 'Join or form a local Village Organization / SHG.',
          officialUrl: 'https://aajeevika.gov.in'
        },
        {
          stepNumber: 3,
          stage: 'Enterprise Credit & Expansion',
          programName: 'Stand-Up India Scheme for Women Entrepreneurs',
          purpose: 'Bank loans between ₹10 lakh and ₹1 crore for setting up greenfield enterprises.',
          benefit: 'Bank loans from ₹10,00,000 to ₹1,00,00,000',
          eligibilityStatus: 'Likely Eligible (Women setting up manufacturing/service enterprise)',
          requiredDocuments: ['Detailed Project Report', 'Business Registration', 'PAN/Aadhaar'],
          nextAction: 'Apply through Stand-Up India web portal.',
          officialUrl: 'https://www.standupmitra.in'
        }
      ]
    }
  ];

  return pathways;
};

module.exports = { getBenefitPathways };
