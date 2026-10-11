import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import HomeCategoryGrid from '../components/HomeCategoryGrid';
import AlphabetFilterBar from '../components/AlphabetFilterBar';
import PortalUnifiedCard from '../components/PortalUnifiedCard';
import UnifiedItemModal from '../components/UnifiedItemModal';
import SkeletonCard from '../components/SkeletonCard';
import { 
  ArrowLeft, 
  ArrowRight,
  Briefcase, 
  FileText, 
  FileDown,
  Rocket, 
  GraduationCap, 
  Trophy, 
  Sparkles, 
  SlidersHorizontal,
  MapPin,
  ScanLine,
  Search,
  ExternalLink,
  Users,
  Filter
} from 'lucide-react';
import { getSchemeBeneficiary } from '../utils/portalItemData';

const CATEGORY_TABS = [
  { id: 'Jobs', labelKey: 'catJobsTitle', defaultLabel: 'Jobs', icon: Briefcase, color: '#3b82f6' },
  { id: 'Schemes', labelKey: 'catSchemesTitle', defaultLabel: 'Scheme', icon: FileText, color: '#10b981' },
  { id: 'Startups', labelKey: 'catStartupsTitle', defaultLabel: 'Startup', icon: Rocket, color: '#f59e0b' },
  { id: 'Exams', labelKey: 'catExamsTitle', defaultLabel: 'Exam', icon: GraduationCap, color: '#a855f7' },
  { id: 'Results', labelKey: 'catResultsTitle', defaultLabel: 'Result', icon: Trophy, color: '#06b6d4' }
];

const SCHEME_BENEFICIARIES = [
  { id: 'ALL', labelKey: 'beneficiaryAll', defaultLabel: 'All Schemes', icon: '🌟' },
  { id: 'Farmers', labelKey: 'beneficiaryFarmers', defaultLabel: 'Farmers', icon: '🌾' },
  { id: 'Girls', labelKey: 'beneficiaryGirls', defaultLabel: 'Girls & Daughters', icon: '👧' },
  { id: 'Women', labelKey: 'beneficiaryWomen', defaultLabel: 'Women & Mothers', icon: '👩' },
  { id: 'Students', labelKey: 'beneficiaryStudents', defaultLabel: 'Students & Youth', icon: '👨‍🎓' },
  { id: 'Senior Citizens', labelKey: 'beneficiarySeniors', defaultLabel: 'Senior Citizens', icon: '👴' },
  { id: 'Businesses', labelKey: 'beneficiaryBusinesses', defaultLabel: 'Small Business & MSME', icon: '💼' },
  { id: 'Startups', labelKey: 'beneficiaryStartups', defaultLabel: 'Startups', icon: '🚀' },
  { id: 'Healthcare', labelKey: 'beneficiaryHealthcare', defaultLabel: 'Healthcare', icon: '🏥' }
];

const DashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState([]);
  const [exams, setExams] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [states, setStates] = useState([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // User category selection: null = Home (Shows the 5 Category Boxes), or 'Jobs' | 'Schemes' | 'Startups' | 'Exams' | 'Results'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Active item for modal details
  const [activeModalItem, setActiveModalItem] = useState(null);

  // 1. Dynamic Time-Based Greeting (Localized based on active language)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return {
        text: t('greetingGoodMorning', 'Good Morning'),
        icon: '🌅',
        tagline: t('greetingTagline', 'Welcome to the Unified Portal. Choose a category below to explore official government opportunities.')
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        text: t('greetingGoodAfternoon', 'Good Afternoon'),
        icon: '☀️',
        tagline: t('greetingTagline', 'Welcome to the Unified Portal. Choose a category below to explore official government opportunities.')
      };
    }
    if (hour >= 17 && hour < 22) {
      return {
        text: t('greetingGoodEvening', 'Good Evening'),
        icon: '🌆',
        tagline: t('greetingTagline', 'Welcome to the Unified Portal. Choose a category below to explore official government opportunities.')
      };
    }
    return {
      text: t('greetingGoodNight', 'Namaste & Good Night'),
      icon: '🌙',
      tagline: t('greetingTagline', 'Welcome to the Unified Portal. Choose a category below to explore official government opportunities.')
    };
  }, [t]);

  // Fetch all Portal Data
  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const [schemesRes, examsRes, jobsRes, statesRes, savedRes] = await Promise.all([
        API.get('/schemes').catch(() => ({ data: { data: [] } })),
        API.get('/portal/exams').catch(() => ({ data: { data: [] } })),
        API.get('/portal/jobs').catch(() => ({ data: { data: [] } })),
        API.get('/portal/states').catch(() => ({ data: { data: [] } })),
        API.get('/schemes/user/saved').catch(() => ({ data: { data: [] } }))
      ]);

      setSchemes(schemesRes.data.data || []);
      setExams(examsRes.data.data || []);
      setJobs(jobsRes.data.data || []);
      setStates(statesRes.data.data || []);

      const savedIds = (savedRes.data.data || []).map((s) => s._id);
      setSavedSchemeIds(savedIds);
    } catch (err) {
      console.error('Failed to load portal data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleToggleBookmark = async (itemId) => {
    try {
      const res = await API.post(`/schemes/${itemId}/bookmark`);
      if (res.data.isBookmarked) {
        setSavedSchemeIds((prev) => [...prev, itemId]);
      } else {
        setSavedSchemeIds((prev) => prev.filter((id) => id !== itemId));
      }
    } catch (err) {
      console.error('Bookmark toggle failed', err);
    }
  };

  // Beneficiary count map for Schemes
  const schemeBeneficiaryCounts = useMemo(() => {
    const counts = { ALL: schemes.length };
    schemes.forEach((s) => {
      const ben = getSchemeBeneficiary(s);
      counts[ben.key] = (counts[ben.key] || 0) + 1;
    });
    return counts;
  }, [schemes]);

  // Compile active items for selected category
  const activeItems = useMemo(() => {
    if (!selectedCategory) return [];

    if (selectedCategory === 'Jobs') {
      return jobs;
    }
    if (selectedCategory === 'Schemes') {
      if (selectedBeneficiary === 'ALL') {
        return schemes;
      }
      return schemes.filter((s) => getSchemeBeneficiary(s).key === selectedBeneficiary);
    }
    if (selectedCategory === 'Startups') {
      return schemes.filter((s) => s.category === 'Startups' || s.category === 'Businesses' || /startup|seed|venture|incubat|msme|mudra|entrepreneur/i.test((s.name || '') + ' ' + (s.category || '')));
    }
    if (selectedCategory === 'Exams') {
      return exams;
    }
    if (selectedCategory === 'Results') {
      // Direct Results & Official Scorecards from both National Exams and Recruitment Notices
      const examResults = exams.map((e) => ({
        ...e,
        isResultItem: true,
        name: `${e.name} - Scorecard & Merit List`,
        resultStatus: 'Official Result & Cutoff Scorecard Active',
        resultLink: e.resultLink || e.officialWebsite || 'https://www.india.gov.in/'
      }));

      const jobResults = jobs.map((j) => ({
        ...j,
        isResultItem: true,
        name: `${j.postName} - Final Merit List & Result`,
        resultStatus: 'Merit Selection List Declared',
        resultLink: j.officialNotification || 'https://www.india.gov.in/'
      }));

      return [...examResults, ...jobResults];
    }

    return [];
  }, [selectedCategory, jobs, schemes, exams, selectedBeneficiary]);

  // Strict Alphabetical (A to Z) Sorting
  const sortedItems = useMemo(() => {
    return [...activeItems].sort((a, b) => {
      const nameA = (a.name || a.postName || '').trim();
      const nameB = (b.name || b.postName || '').trim();
      return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
    });
  }, [activeItems]);

  // Compute available letters for A-Z bar
  const availableLetters = useMemo(() => {
    const set = new Set();
    activeItems.forEach((item) => {
      const name = (item.name || item.postName || '').trim();
      if (name.length > 0) {
        const first = name[0].toUpperCase();
        if (/[A-Z]/.test(first)) {
          set.add(first);
        }
      }
    });
    return set;
  }, [activeItems]);

  // Helper to determine if a search term is a generic category trigger (e.g. "job" in Jobs category)
  const isGenericCategoryQuery = useMemo(() => {
    if (!searchTerm.trim()) return false;
    const q = searchTerm.trim().toLowerCase();
    if (selectedCategory === 'Jobs') {
      return /^(job|jobs|naukri|recruitment|recruiter|post|posts|vacancy|vacancies|govt job|govt jobs|all jobs|all job|all)$/i.test(q);
    }
    if (selectedCategory === 'Schemes') {
      return /^(scheme|schemes|yojana|yojna|subsidy|subsidies|welfare|all schemes|all scheme|all)$/i.test(q);
    }
    if (selectedCategory === 'Startups') {
      return /^(startup|startups|business|businesses|seed|fund|funding|all startups|all)$/i.test(q);
    }
    if (selectedCategory === 'Exams') {
      return /^(exam|exams|pariksha|entrance|test|tests|all exams|all exam|all)$/i.test(q);
    }
    if (selectedCategory === 'Results') {
      return /^(result|results|scorecard|admit|admit card|merit|all results|all)$/i.test(q);
    }
    return false;
  }, [searchTerm, selectedCategory]);

  // Filtered by Letter, State, and Search
  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      const name = (item.name || item.postName || '').trim();
      const firstChar = name.length > 0 ? name[0].toUpperCase() : '';

      // Letter Filter
      if (selectedLetter !== 'ALL' && firstChar !== selectedLetter) {
        return false;
      }

      // State Filter (if applicable)
      if (selectedState !== 'All') {
        const itemStateId = item.state?._id || item.state;
        const itemStateName = item.state?.name;
        if (itemStateId && itemStateId !== selectedState && itemStateName !== selectedState) {
          return false;
        }
      }

      // Search Filter: If generic category query (e.g. "job" in Jobs), display all items in this category!
      if (searchTerm.trim() && !isGenericCategoryQuery) {
        const q = searchTerm.toLowerCase();
        const matchesName = name.toLowerCase().includes(q);
        const matchesAuthority = (item.conductingAuthority || item.department || '').toLowerCase().includes(q);
        const matchesEligibility = (item.eligibility || item.eligibilityCriteria || item.qualification || '').toLowerCase().includes(q);
        const matchesCategory = (item.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesAuthority && !matchesEligibility && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [sortedItems, selectedLetter, selectedState, searchTerm, isGenericCategoryQuery]);

  // Smart category intent routing when typing in the search bar
  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return;

    // 1. Direct Category Intent Keywords
    if (/^(job|jobs|naukri|recruitment|vacancy|vacancies|post|posts|sarkari naukri|govt job|govt jobs)$/i.test(q)) {
      if (selectedCategory !== 'Jobs') {
        setSelectedCategory('Jobs');
        setSelectedLetter('ALL');
      }
      return;
    }
    if (/^(scheme|schemes|yojana|yojna|subsidy|subsidies|welfare|sarkari yojana)$/i.test(q)) {
      if (selectedCategory !== 'Schemes') {
        setSelectedCategory('Schemes');
        setSelectedLetter('ALL');
      }
      return;
    }
    if (/^(startup|startups|business|seed fund|incubator)$/i.test(q)) {
      if (selectedCategory !== 'Startups') {
        setSelectedCategory('Startups');
        setSelectedLetter('ALL');
      }
      return;
    }
    if (/^(exam|exams|pariksha|entrance|competitive exam)$/i.test(q)) {
      if (selectedCategory !== 'Exams') {
        setSelectedCategory('Exams');
        setSelectedLetter('ALL');
      }
      return;
    }
    if (/^(result|results|scorecard|admit|admit card)$/i.test(q)) {
      if (selectedCategory !== 'Results') {
        setSelectedCategory('Results');
        setSelectedLetter('ALL');
      }
      return;
    }

    // 2. Query containing category keywords
    if (q.includes('job') || q.includes('naukri') || q.includes('vacancy') || q.includes('recruitment')) {
      if (selectedCategory !== 'Jobs') {
        setSelectedCategory('Jobs');
        setSelectedLetter('ALL');
      }
      return;
    }
    if (q.includes('scheme') || q.includes('yojana') || q.includes('subsidy')) {
      if (selectedCategory !== 'Schemes') {
        setSelectedCategory('Schemes');
        setSelectedLetter('ALL');
      }
      return;
    }
    if (q.includes('startup') || q.includes('venture')) {
      if (selectedCategory !== 'Startups') {
        setSelectedCategory('Startups');
        setSelectedLetter('ALL');
      }
      return;
    }
    if (q.includes('exam') || q.includes('pariksha') || q.includes('entrance')) {
      if (selectedCategory !== 'Exams') {
        setSelectedCategory('Exams');
        setSelectedLetter('ALL');
      }
      return;
    }
    if (q.includes('result') || q.includes('scorecard') || q.includes('admit')) {
      if (selectedCategory !== 'Results') {
        setSelectedCategory('Results');
        setSelectedLetter('ALL');
      }
      return;
    }

    // 3. If searching while on Home view (selectedCategory === null), smartly route to best category
    if (selectedCategory === null) {
      const jobMatches = jobs.filter(j => (j.name || j.postName || '').toLowerCase().includes(q) || (j.department || '').toLowerCase().includes(q)).length;
      const examMatches = exams.filter(e => (e.name || '').toLowerCase().includes(q) || (e.conductingAuthority || '').toLowerCase().includes(q)).length;
      const schemeMatches = schemes.filter(s => (s.name || '').toLowerCase().includes(q) || (s.department || '').toLowerCase().includes(q)).length;

      if (jobMatches > 0 && jobMatches >= examMatches && jobMatches >= schemeMatches) {
        setSelectedCategory('Jobs');
        setSelectedLetter('ALL');
      } else if (schemeMatches > 0 && schemeMatches >= examMatches) {
        setSelectedCategory('Schemes');
        setSelectedLetter('ALL');
      } else if (examMatches > 0) {
        setSelectedCategory('Exams');
        setSelectedLetter('ALL');
      } else {
        setSelectedCategory('Jobs');
        setSelectedLetter('ALL');
      }
    }
  }, [searchTerm, selectedCategory, jobs, exams, schemes]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* 1. SIDEBAR (As shown on the left of user's sketch) */}
      <Sidebar user={user} onLogout={logout} />

      {/* Main Content Area - Full Page Width */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        {/* Top Navbar */}
        <Navbar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          user={user} 
        />

        <main className="dashboard-main-content">

          {/* 2. GREETING THE USER ACCORDING TO TIME (As in user's sketch) */}
          <div className="greeting-banner-card">
            <div style={{
              position: 'absolute',
              top: '-40%',
              right: '-10%',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '32px', lineHeight: 1 }}>{greeting.icon}</span>
                  <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: 0 }}>
                    {greeting.text}, {user?.fullName?.split(' ')[0] || 'Citizen'}!
                  </h1>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, maxWidth: '780px' }}>
                  {greeting.tagline}
                </p>
              </div>

              {/* Status Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '8px 16px',
                borderRadius: '20px',
                color: 'var(--success)',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                <span>{t('portalSynchronized', 'Central & State Portals Synchronized')}</span>
              </div>
            </div>
          </div>

          {/* 3. HOME VIEW: ONLY CATEGORIES (Jobs, Scheme, Startup, Exam, Result) AS IN USER'S SKETCH */}
          {selectedCategory === null ? (
            <div>
              {/* Category Section Header */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>
                  {t('homeChooseCategory', 'Choose a Category')}
                </h2>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  {t('homeChooseCategorySubtitle', 'Click any category below to browse official notices and examinations arranged in alphabetical order (A–Z).')}
                </p>
              </div>

              {/* Home Category Grid (Jobs, Scheme, Startup, Exam, Result) */}
              <HomeCategoryGrid 
                onSelectCategory={(catId) => {
                  setSelectedCategory(catId);
                  setSelectedLetter('ALL');
                }}
              />

              {/* Citizen Utility Suite: 3 High-Impact Direct Tools */}
              <div style={{ marginTop: '38px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Sparkles size={16} color="var(--accent-primary)" />
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        {t('citizenSuiteBadge', 'Citizen Smart Suite • 3 Essential Tools')}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
                      {t('citizenSuiteTitle', 'Quick Citizen Services & Verification')}
                    </h2>
                  </div>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {t('citizenSuiteTag', 'Official PDF Dossier • Kendra Locator • OCR Verification')}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '18px' }}>
                  {/* Tool 1: 1-Click Yojana Parchi */}
                  <div
                    onClick={() => navigate('/yojana-parchi')}
                    style={{
                      borderRadius: '18px',
                      padding: '22px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(168, 85, 247, 0.08) 100%)',
                      border: '1.5px solid rgba(99, 102, 241, 0.35)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '190px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 8px 24px -6px rgba(0,0,0,0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px -6px rgba(99,102,241,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(0,0,0,0.4)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'rgba(99, 102, 241, 0.25)', border: '1px solid rgba(99, 102, 241, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileDown size={22} color="#818cf8" />
                        </div>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                          1-CLICK PDF
                        </span>
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>
                        {t('navYojanaParchi', '1-Click Yojana Parchi')}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        Download official citizen benefit report with eligible schemes, readiness score, and document checklist.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#818cf8' }}>Generate Official Dossier</span>
                      <ArrowRight size={15} color="#818cf8" />
                    </div>
                  </div>

                  {/* Tool 2: CSC / Jan Seva Kendra Locator */}
                  <div
                    onClick={() => navigate('/csc-locator')}
                    style={{
                      borderRadius: '18px',
                      padding: '22px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(5, 150, 105, 0.08) 100%)',
                      border: '1.5px solid rgba(16, 185, 129, 0.35)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '190px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 8px 24px -6px rgba(0,0,0,0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px -6px rgba(16,185,129,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(0,0,0,0.4)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'rgba(16, 185, 129, 0.25)', border: '1px solid rgba(16, 185, 129, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MapPin size={22} color="#34d399" />
                        </div>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          OFFICIAL RATES
                        </span>
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>
                        {t('navCSCLocator', 'CSC / Jan Seva Kendra')}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        Search verified CSC centres by pincode or district with UIDAI & government mandated service rate cards.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#34d399' }}>Find Centres & Rate Card</span>
                      <ArrowRight size={15} color="#34d399" />
                    </div>
                  </div>

                  {/* Tool 3: Document OCR & Name Mismatch Checker */}
                  <div
                    onClick={() => navigate('/doc-checker')}
                    style={{
                      borderRadius: '18px',
                      padding: '22px',
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.16) 0%, rgba(234, 88, 12, 0.08) 100%)',
                      border: '1.5px solid rgba(249, 115, 22, 0.35)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '190px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 8px 24px -6px rgba(0,0,0,0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#f97316';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px -6px rgba(249,115,22,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.35)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(0,0,0,0.4)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'rgba(249, 115, 22, 0.25)', border: '1px solid rgba(249, 115, 22, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ScanLine size={22} color="#fb923c" />
                        </div>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                          AI OCR + FUZZY
                        </span>
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>
                        {t('navDocChecker', 'Doc Mismatch Checker')}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        Prevent rejection before applying. Cross-verify names across Aadhaar, PAN, and marksheets with instant risk score.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#fb923c' }}>Check Document Risk</span>
                      <ArrowRight size={15} color="#fb923c" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 4. CATEGORY VIEW: ALPHABETICAL ORDER (A TO Z) WITH A-Z JUMP BAR */
            <div>
              {/* Top Navigation & Category Switcher */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '22px'
              }}>
                {/* Back to Categories Button */}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedLetter('ALL');
                    setSelectedBeneficiary('ALL');
                    setSearchTerm('');
                  }}
                  className="btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    padding: '9px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>{t('backToCategories', '← Back to All Categories')}</span>
                </button>

                {/* Quick Category Tab Pills */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  paddingBottom: '2px'
                }}>
                  {CATEGORY_TABS.map((tab) => {
                    const isCurrent = selectedCategory === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setSelectedCategory(tab.id);
                          setSelectedLetter('ALL');
                          setSelectedBeneficiary('ALL');
                          if (isGenericCategoryQuery || /^(job|jobs|scheme|schemes|exam|exams|startup|startups|result|results)$/i.test(searchTerm.trim())) {
                            setSearchTerm('');
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '14px',
                          border: isCurrent ? `1.5px solid ${tab.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isCurrent ? `${tab.color}25` : 'rgba(255, 255, 255, 0.03)',
                          color: isCurrent ? '#fff' : 'var(--text-secondary)',
                          fontWeight: isCurrent ? '800' : '500',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={15} color={isCurrent ? tab.color : 'currentColor'} />
                        <span>{t(tab.labelKey, tab.defaultLabel)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Beneficiary Sub-Categories (When in Schemes) */}
              {selectedCategory === 'Schemes' && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} color="var(--accent-primary)" />
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#fff' }}>
                        {t('schemeTargetFilterTitle', 'Filter by Target Beneficiary')}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {t('beneficiarySubtitle', 'Schemes specifically mapped by beneficiary group')}
                    </span>
                  </div>

                  {/* Beneficiary Buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    overflowX: 'auto',
                    scrollbarWidth: 'thin',
                    paddingBottom: '4px'
                  }}>
                    {SCHEME_BENEFICIARIES.map((ben) => {
                      const isSelected = selectedBeneficiary === ben.id;
                      const count = schemeBeneficiaryCounts[ben.id] || 0;
                      return (
                        <button
                          key={ben.id}
                          onClick={() => {
                            setSelectedBeneficiary(ben.id);
                            setSelectedLetter('ALL');
                          }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '12px',
                            border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.07)',
                            background: isSelected ? 'rgba(99, 102, 241, 0.22)' : 'rgba(255, 255, 255, 0.03)',
                            color: isSelected ? '#fff' : 'var(--text-secondary)',
                            fontWeight: isSelected ? '700' : '500',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>{ben.icon}</span>
                          <span>{t(ben.labelKey, ben.defaultLabel)}</span>
                          <span style={{
                            fontSize: '11px',
                            padding: '1px 7px',
                            borderRadius: '10px',
                            background: isSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                            color: isSelected ? '#fff' : 'var(--text-muted)',
                            fontWeight: '700'
                          }}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Alphabetical A to Z Jump Bar */}
              <AlphabetFilterBar 
                selectedLetter={selectedLetter}
                onSelectLetter={setSelectedLetter}
                availableLetters={availableLetters}
                totalCount={sortedItems.length}
                activeCount={filteredItems.length}
              />

              {/* Active Section Title & Stats */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>
                      {selectedCategory === 'Jobs' && '💼 Government Jobs & Vacancies (A–Z)'}
                      {selectedCategory === 'Schemes' && '📜 Public Welfare Schemes (A–Z)'}
                      {selectedCategory === 'Startups' && '🚀 Startups, Grants & MSME Capital (A–Z)'}
                      {selectedCategory === 'Exams' && '🎓 Competitive Entrance & Recruitment Exams (A–Z)'}
                      {selectedCategory === 'Results' && '🏆 Exam Results & Admit Cards Directory (A–Z)'}
                    </span>
                    <span style={{
                      fontSize: '11.5px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      color: 'var(--text-secondary)'
                    }}>
                      {filteredItems.length} Available
                    </span>
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                    Sorted alphabetically. Click any item (e.g. JEE Main) to view dates, fees, required documents, and how to apply.
                  </p>
                </div>

                {(selectedLetter !== 'ALL' || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedLetter('ALL');
                      setSearchTerm('');
                    }}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    Reset Letter Filter
                  </button>
                )}
              </div>

              {/* Items Catalog Grid (Alphabetically Arranged) */}
              <div className="portal-items-grid">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : filteredItems.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '16px',
                    border: '1px dashed var(--border-subtle)'
                  }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '8px' }}>
                      {searchTerm.trim() && !isGenericCategoryQuery
                        ? `No items matching "${searchTerm}" found in ${selectedCategory || 'this category'}.`
                        : (selectedLetter !== 'ALL'
                          ? `No items starting with "${selectedLetter}" found in ${selectedCategory || 'this category'}.`
                          : `No items available in this category.`
                        )
                      }
                    </p>
                    <button
                      onClick={() => { setSelectedLetter('ALL'); setSearchTerm(''); }}
                      className="btn-secondary"
                      style={{ fontSize: '13px', marginTop: '10px' }}
                    >
                      Show All {selectedCategory || 'Items'} (A–Z)
                    </button>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <PortalUnifiedCard 
                      key={item._id}
                      item={item}
                      onViewDetails={(selectedItem) => setActiveModalItem(selectedItem)}
                      isBookmarked={savedSchemeIds.includes(item._id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 5. UNIVERSAL DETAIL MODAL (Opens for any item clicked: JEE Main, UPSC, PM-Kisan, etc.) */}
      <UnifiedItemModal 
        item={activeModalItem}
        isOpen={Boolean(activeModalItem)}
        onClose={() => setActiveModalItem(null)}
        isBookmarked={activeModalItem ? savedSchemeIds.includes(activeModalItem._id) : false}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
};

export default DashboardPage;
