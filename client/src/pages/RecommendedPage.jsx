import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SchemeCard from '../components/SchemeCard';
import SchemeModal from '../components/SchemeModal';
import SkeletonCard from '../components/SkeletonCard';
import { Sparkles, SlidersHorizontal, UserCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendedPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [savedSchemeIds, setSavedSchemeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSchemeModal, setActiveSchemeModal] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const [recRes, profRes, savedRes] = await Promise.all([
        API.get('/schemes/recommended'),
        API.get('/profile').catch(() => ({ data: { data: null } })),
        API.get('/schemes/user/saved').catch(() => ({ data: { data: [] } }))
      ]);

      setRecommendedSchemes(recRes.data.data || []);
      setUserProfile(profRes.data.data);
      const savedIds = (savedRes.data.data || []).map((s) => s._id);
      setSavedSchemeIds(savedIds);
    } catch (err) {
      console.error('Failed to load recommended schemes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleToggleBookmark = async (schemeId) => {
    try {
      const res = await API.post(`/schemes/${schemeId}/bookmark`);
      if (res.data.isBookmarked) {
        setSavedSchemeIds((prev) => [...prev, schemeId]);
      } else {
        setSavedSchemeIds((prev) => prev.filter((id) => id !== schemeId));
      }
    } catch (err) {
      console.error('Bookmark toggle failed', err);
    }
  };

  const filteredSchemes = recommendedSchemes.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.eligibilityCriteria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar user={user} onLogout={logout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} user={user} />

        <main style={{ padding: '28px', flex: 1, maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '28px', marginBottom: '28px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
                  <Sparkles size={14} /> {t('aiRecommendationEngine')}
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                  {t('personalizedSchemeMatches')}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '650px' }}>
                  {t('matchedDemographicsDesc')} ({userProfile?.age || 25} {t('years')} • ₹{userProfile?.annualIncome?.toLocaleString() || '2.5L'} • {t(userProfile?.occupation || 'Student')}).
                </p>
              </div>

              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <UserCheck size={16} color="var(--accent-primary)" />
                  <span>{t('updateProfileCriteria')}</span>
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>

          {/* Scheme Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filteredSchemes.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '12px' }}>{t('noRecommendationsFound')}</p>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ fontSize: '13px' }}>{t('updateProfileCriteria')}</button>
                </Link>
              </div>
            ) : (
              filteredSchemes.map((scheme) => (
                <SchemeCard 
                  key={scheme._id} 
                  scheme={scheme} 
                  onViewDetails={(s) => setActiveSchemeModal(s)}
                  isBookmarked={savedSchemeIds.includes(scheme._id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))
            )}
          </div>
        </main>
      </div>

      <SchemeModal
        scheme={activeSchemeModal}
        isOpen={Boolean(activeSchemeModal)}
        onClose={() => setActiveSchemeModal(null)}
        isBookmarked={activeSchemeModal ? savedSchemeIds.includes(activeSchemeModal._id) : false}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
};

export default RecommendedPage;
