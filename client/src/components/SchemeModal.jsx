import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Bookmark, CheckCircle, FileText, ArrowRight, ShieldCheck, DollarSign, Calendar, MapPin, ListOrdered, CheckSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SchemeModal = ({ scheme, isOpen, onClose, isBookmarked, onToggleBookmark }) => {
  const { t } = useLanguage();

  if (!isOpen || !scheme) return null;

  const defaultSteps = [
    { num: '01', title: t('step1'), desc: t('step1Desc') },
    { num: '02', title: t('step2'), desc: t('step2Desc') },
    { num: '03', title: t('step3'), desc: t('step3Desc') },
    { num: '04', title: t('step4'), desc: t('step4Desc') },
    { num: '05', title: t('step5'), desc: t('step5Desc') }
  ];

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.2 }}
          style={{
            background: '#0f172a',
            border: '1px solid var(--border-glow)',
            borderRadius: '20px',
            maxWidth: '820px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>

          {/* Header Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', border: '1px solid var(--border-glow)' }}>
              {t(scheme.category) || t('General')}
            </span>
            {scheme.applicationWindow?.status && (
              <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', background: scheme.applicationWindow.status === 'Closing Soon' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)', color: scheme.applicationWindow.status === 'Closing Soon' ? 'var(--error)' : 'var(--success)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {t(scheme.applicationWindow.status)} {scheme.applicationWindow.daysRemaining ? `(${scheme.applicationWindow.daysRemaining} ${t('daysLeft')})` : ''}
              </span>
            )}
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
              ✓ {t('verified')} {scheme.lastVerified || 'September 2026'}
            </span>
            {scheme.state ? (
              <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {scheme.state.name}
              </span>
            ) : (
              <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                {t('verifiedCentralScheme')}
              </span>
            )}
          </div>

          {/* Scheme Department & Title */}
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            {scheme.department ? t(scheme.department) : t('govOfIndia')}
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '16px', lineHeight: '1.35', paddingRight: '40px' }}>
            {t(scheme.name)}
          </h2>


          {/* Highlights Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {scheme.benefitAmount > 0 && (
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '14px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{t('cardMaxBenefit')}</p>
                <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--success)', marginTop: '4px' }}>
                  ₹{scheme.benefitAmount.toLocaleString()}
                </p>
              </div>
            )}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{t('cardAgeLimit')}</p>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginTop: '4px' }}>
                {scheme.minAge} - {scheme.maxAge} {t('years')}
              </p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{t('cardIncomeLimit')}</p>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginTop: '4px' }}>
                {t('upTo')} ₹{scheme.incomeLimit?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="var(--accent-primary)" />
              {t('modalEligibility')}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              {t(scheme.eligibilityCriteria)}
            </p>
          </div>

          {/* Documents Required */}
          {scheme.documentsRequired && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--warning)" />
                {t('modalDocuments')}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                {t(scheme.documentsRequired)}
              </p>
            </div>
          )}

          {/* 📋 Step-by-Step Form Filling Blueprint */}
          <div style={{ marginBottom: '28px', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListOrdered size={18} color="var(--accent-primary)" />
              {t('howToApplyHeader')}
            </h3>
            
            {/* Custom scheme application process if available, otherwise step by step guide */}
            {scheme.applicationProcess && (
              <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '13px', color: '#93c5fd', borderLeft: '3px solid var(--accent-primary)' }}>
                <strong>{t('specificSchemeSteps')}:</strong> {t(scheme.applicationProcess) || scheme.applicationProcess}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {defaultSteps.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.2)', padding: '2px 8px', borderRadius: '6px', flexShrink: 0 }}>
                    {s.num}
                  </span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff', margin: 0 }}>{s.title}</p>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onToggleBookmark(scheme._id)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
            >
              <Bookmark size={16} fill={isBookmarked ? 'var(--warning)' : 'none'} color={isBookmarked ? 'var(--warning)' : 'currentColor'} />
              <span>{isBookmarked ? t('cardSaved') : t('cardSave')}</span>
            </button>

            <a
              href={scheme.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
            >
              <span>{t('modalOfficialPortal')}</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SchemeModal;
