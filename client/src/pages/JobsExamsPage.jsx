import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SkeletonCard from '../components/SkeletonCard';
import AlphabetFilterBar from '../components/AlphabetFilterBar';
import PortalUnifiedCard from '../components/PortalUnifiedCard';
import UnifiedItemModal from '../components/UnifiedItemModal';
import { 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  Users, 
  ExternalLink, 
  MapPin, 
  Search, 
  BookOpen, 
  AlertCircle,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const JobsExamsPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('exams'); // Default to 'exams' or 'jobs'
  const [jobs, setJobs] = useState([]);
  const [exams, setExams] = useState([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [activeModalItem, setActiveModalItem] = useState(null);

  const fetchJobsAndExams = async () => {
    try {
      setLoading(true);
      const [jobsRes, examsRes, savedRes] = await Promise.all([
        API.get('/portal/jobs').catch(() => ({ data: { data: [] } })),
        API.get('/portal/exams').catch(() => ({ data: { data: [] } })),
        API.get('/schemes/user/saved').catch(() => ({ data: { data: [] } }))
      ]);
      setJobs(jobsRes.data.data || []);
      setExams(examsRes.data.data || []);
      const savedIds = (savedRes.data.data || []).map((s) => s._id);
      setSavedSchemeIds(savedIds);
    } catch (err) {
      console.error('Failed to load jobs/exams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndExams();
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

  // Active dataset depending on activeTab
  const activeItems = useMemo(() => {
    return activeTab === 'jobs' ? jobs : exams;
  }, [activeTab, jobs, exams]);

  // Strict Alphabetical (A to Z) Sorting
  const sortedItems = useMemo(() => {
    return [...activeItems].sort((a, b) => {
      const nameA = (a.name || a.postName || '').trim();
      const nameB = (b.name || b.postName || '').trim();
      return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
    });
  }, [activeItems]);

  // Compute available first letters for A-Z bar
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

  // Filtered by Letter and Search
  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      const name = (item.name || item.postName || '').trim();
      const firstChar = name.length > 0 ? name[0].toUpperCase() : '';

      // Letter Filter
      if (selectedLetter !== 'ALL' && firstChar !== selectedLetter) {
        return false;
      }

      // Search Query Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = name.toLowerCase().includes(q);
        const matchesAuthority = (item.conductingAuthority || item.department || '').toLowerCase().includes(q);
        const matchesEligibility = (item.eligibility || item.qualification || '').toLowerCase().includes(q);
        const matchesSyllabus = (item.syllabus || '').toLowerCase().includes(q);
        if (!matchesName && !matchesAuthority && !matchesEligibility && !matchesSyllabus) {
          return false;
        }
      }

      return true;
    });
  }, [sortedItems, selectedLetter, searchTerm]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar user={user} onLogout={logout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} user={user} />

        <main style={{ padding: '28px', flex: 1, maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)',
            border: '1px solid var(--border-glow)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--accent-primary)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  Official Central & State Portal Directory
                </span>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                  National Competitive Exams & Government Jobs (A–Z)
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '750px', margin: 0 }}>
                  Arranged in alphabetical order so you can instantly discover any examination or job opening (e.g. JEE Main, NEET-UG, UPSC CSE). Click any entry for complete dates, fees, required documents, and how-to-apply steps.
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px 20px',
                borderRadius: '14px',
                display: 'flex',
                gap: '18px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Exams</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#c084fc' }}>{exams.length}</span>
                </div>
                <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Job Vacancies</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#60a5fa' }}>{jobs.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setActiveTab('exams');
                setSelectedLetter('ALL');
              }}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                border: activeTab === 'exams' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: activeTab === 'exams' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.03)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'exams' ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              <GraduationCap size={17} />
              <span>🎓 Competitive Entrance Exams ({exams.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('jobs');
                setSelectedLetter('ALL');
              }}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                border: activeTab === 'jobs' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: activeTab === 'jobs' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.03)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'jobs' ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              <Briefcase size={17} />
              <span>💼 Government Jobs & Recruitments ({jobs.length})</span>
            </button>
          </div>

          {/* Alphabetical A to Z Jump Filter Bar */}
          <AlphabetFilterBar 
            selectedLetter={selectedLetter}
            onSelectLetter={setSelectedLetter}
            availableLetters={availableLetters}
            totalCount={sortedItems.length}
            activeCount={filteredItems.length}
          />

          {/* Active List Context Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>
                {activeTab === 'exams' ? 'All Competitive Exams (Alphabetical A–Z)' : 'All Sarkari Job Openings (Alphabetical A–Z)'}
              </span>
              <span style={{ fontSize: '12px', background: 'rgba(255, 255, 255, 0.08)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-secondary)' }}>
                {filteredItems.length} Available
              </span>
            </h2>

            {(selectedLetter !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedLetter('ALL');
                  setSearchTerm('');
                }}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Catalog Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '24px' }}>
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
                  No {activeTab} starting with "{selectedLetter}" found.
                </p>
                <button
                  onClick={() => { setSelectedLetter('ALL'); setSearchTerm(''); }}
                  className="btn-secondary"
                  style={{ fontSize: '13px', marginTop: '10px' }}
                >
                  Show All {activeTab === 'exams' ? 'Exams' : 'Jobs'}
                </button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <PortalUnifiedCard 
                  key={item._id}
                  item={item}
                  onViewDetails={(selected) => setActiveModalItem(selected)}
                  isBookmarked={savedSchemeIds.includes(item._id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* Unified Detail Modal (Exams and Jobs) */}
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

export default JobsExamsPage;
