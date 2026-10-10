import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SchemeCard from '../components/SchemeCard';
import SchemeModal from '../components/SchemeModal';
import SkeletonCard from '../components/SkeletonCard';
import { Bookmark, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedSchemesPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSchemeModal, setActiveSchemeModal] = useState(null);

  const fetchSavedSchemes = async () => {
    try {
      setLoading(true);
      const res = await API.get('/schemes/user/saved');
      setSavedSchemes(res.data.data || []);
    } catch (err) {
      console.error('Failed to load saved schemes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSchemes();
  }, []);

  const handleToggleBookmark = async (schemeId) => {
    try {
      await API.post(`/schemes/${schemeId}/bookmark`);
      setSavedSchemes((prev) => prev.filter((s) => s._id !== schemeId));
      if (activeSchemeModal && activeSchemeModal._id === schemeId) {
        setActiveSchemeModal(null);
      }
    } catch (err) {
      console.error('Bookmark toggle failed', err);
    }
  };

  const filteredSchemes = savedSchemes.filter((s) =>
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
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '28px', marginBottom: '28px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(99, 102, 241, 0.1) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', marginBottom: '8px' }}>
              <Bookmark size={20} />
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{t('navSaved')}</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
              {t('savedTitle')} ({savedSchemes.length})
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '650px' }}>
              {t('savedSubtitle')}
            </p>
          </div>

          {/* Scheme Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filteredSchemes.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '14px' }}>{t('noSavedSchemes')}</p>
                <Link to="/recommended" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span>{t('browseRecommended')}</span>
                    <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            ) : (
              filteredSchemes.map((scheme) => (
                <SchemeCard 
                  key={scheme._id} 
                  scheme={scheme} 
                  onViewDetails={(s) => setActiveSchemeModal(s)}
                  isBookmarked={true}
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
        isBookmarked={true}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
};

export default SavedSchemesPage;
