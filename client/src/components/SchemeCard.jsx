import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Bookmark, Share2, Award, Calendar, DollarSign, MapPin, Eye, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SchemeCard = ({ scheme, onViewDetails, isBookmarked = false, onToggleBookmark }) => {
  const { t } = useLanguage();

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: scheme.name, url: scheme.officialWebsite });
    } else {
      navigator.clipboard.writeText(scheme.officialWebsite);
      alert('Official website link copied to clipboard!');
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(scheme._id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22 }}
      className="glass-card"
      style={{
        borderRadius: '16px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        cursor: 'pointer',
        position: 'relative'
      }}
      onClick={() => onViewDetails && onViewDetails(scheme)}
    >
      <div>
        {/* Header Badges & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', border: '1px solid var(--border-glow)' }}>
              {t(scheme.category) || t('General')}
            </span>
            {scheme.applicationWindow?.status && (
              <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '3px 8px', borderRadius: '14px', background: scheme.applicationWindow.status === 'Closing Soon' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)', color: scheme.applicationWindow.status === 'Closing Soon' ? 'var(--error)' : 'var(--success)' }}>
                {t(scheme.applicationWindow.status)}
              </span>
            )}
            {scheme.matchScore && (
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> {scheme.matchScore}% {t('match')}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={handleBookmarkClick} 
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: isBookmarked ? 'var(--warning)' : 'var(--text-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={isBookmarked ? t('cardSaved') : t('cardSave')}
            >
              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={handleShare} 
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={t('shareScheme')}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Scheme Title */}
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px', lineHeight: '1.4' }}>
          {t(scheme.name)}
        </h3>

        {/* Short Criteria */}
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
          {t(scheme.eligibilityCriteria)}
        </p>

        {/* Badges / Metrics */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          {scheme.benefitAmount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontWeight: '600', background: 'rgba(16, 185, 129, 0.08)', padding: '4px 8px', borderRadius: '6px' }}>
              <DollarSign size={13} />
              <span>{t('cardMaxBenefit')}: ₹{scheme.benefitAmount.toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.03)', padding: '4px 8px', borderRadius: '6px' }}>
            <Calendar size={13} />
            <span>{t('cardAgeLimit')}: {scheme.minAge}-{scheme.maxAge} {t('years')}</span>
          </div>
          {scheme.state && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.03)', padding: '4px 8px', borderRadius: '6px' }}>
              <MapPin size={13} />
              <span>{scheme.state.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails(scheme);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-primary)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0
          }}
        >
          <Eye size={14} />
          <span>{t('cardApplyOnline')}</span>
        </button>

        <a 
          href={scheme.officialWebsite} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={(e) => e.stopPropagation()}
          className="btn-primary"
          style={{ textDecoration: 'none', fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <span>{t('apply')}</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </motion.div>
  );
};

export default SchemeCard;
