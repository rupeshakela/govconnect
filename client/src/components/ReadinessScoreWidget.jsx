import React, { useState } from 'react';
import { ShieldCheck, Info, ArrowUpRight, CheckCircle2, FileText, UserCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ReadinessScoreWidget = ({ scoreData }) => {
  const { t } = useLanguage();
  const [showExplanation, setShowExplanation] = useState(false);

  const overall = scoreData?.overall || 78;
  const profileScore = scoreData?.profileCompleteness || 95;
  const eligibilityScore = scoreData?.eligibilityConfidence || 84;
  const docScore = scoreData?.documentReadiness || 62;
  const appScore = scoreData?.applicationReadiness || 71;

  // Determine score tier color
  const getScoreColor = (val) => {
    if (val >= 80) return 'var(--success)';
    if (val >= 60) return 'var(--accent-primary)';
    return 'var(--warning)';
  };

  return (
    <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>
            {t('readinessScoreTitle')}
          </h3>
        </div>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px'
          }}
          title={t('explainScore')}
        >
          <Info size={15} /> {t('explainScore')}
        </button>
      </div>

      {/* Main Score Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          border: `3px solid ${getScoreColor(overall)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 16px ${getScoreColor(overall)}33`,
          flexShrink: 0
        }}>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{overall}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>/ 100</span>
        </div>

        <div>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            color: getScoreColor(overall),
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {overall >= 75 ? t('highReadiness') : (overall >= 55 ? t('moderateReadiness') : t('needsPrep'))}
          </span>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
            {t('scoreSubtitle')}
          </p>
        </div>
      </div>

      {/* 4 Factor Breakdown Meters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <UserCheck size={13} color="var(--accent-primary)" /> {t('profileCompleteness')}
            </span>
            <span style={{ fontWeight: '700', color: '#fff' }}>{profileScore}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${profileScore}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '3px' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Award size={13} color="var(--success)" /> {t('eligibilityConfidence')}
            </span>
            <span style={{ fontWeight: '700', color: '#fff' }}>{eligibilityScore}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${eligibilityScore}%`, height: '100%', background: 'var(--success)', borderRadius: '3px' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FileText size={13} color="var(--warning)" /> {t('documentReadiness')}
            </span>
            <span style={{ fontWeight: '700', color: '#fff' }}>{docScore}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${docScore}%`, height: '100%', background: 'var(--warning)', borderRadius: '3px' }} />
          </div>
        </div>
      </div>

      {/* Official Disclaimer */}
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
        <em>{t('officialDisclaimer')}</em>
      </p>


      {/* Explanation Modal / Dropdown */}
      {showExplanation && (
        <div style={{
          marginTop: '14px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-glow)',
          borderRadius: '10px',
          padding: '14px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5'
        }}>
          <strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>{t('howScoreCalculated')}</strong>
          <ul style={{ paddingLeft: '18px', margin: 0 }}>
            <li><strong>{t('profileCompleteness')} (25%):</strong> {t('scoreProfileDesc')}</li>
            <li><strong>{t('eligibilityConfidence')} (35%):</strong> {t('scoreEligibilityDesc')}</li>
            <li><strong>{t('documentReadiness')} (40%):</strong> {t('scoreDocDesc')}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReadinessScoreWidget;
