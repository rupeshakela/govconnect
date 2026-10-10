import React from 'react';
import { 
  Briefcase, 
  FileText, 
  Rocket, 
  GraduationCap, 
  Trophy, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  // Row 1 (As in User's Sketch: Jobs, Scheme, Startup)
  {
    id: 'Jobs',
    titleKey: 'catJobsTitle',
    defaultTitle: 'Jobs',
    subtitleKey: 'catJobsSubtitle',
    defaultSubtitle: 'Official recruitment notices: UPSC, SSC CGL, Railways RRB, Banking, Police & State Commissions.',
    icon: Briefcase,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.05) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    glow: 'rgba(59, 130, 246, 0.4)',
    badgeKey: 'catJobsBadge',
    defaultBadge: '31+ Openings',
    popularKey: 'catJobsExamples',
    defaultPopular: 'UPSC Civil Services, SSC CGL, RRB NTPC, IBPS PO'
  },
  {
    id: 'Schemes',
    titleKey: 'catSchemesTitle',
    defaultTitle: 'Scheme',
    subtitleKey: 'catSchemesSubtitle',
    defaultSubtitle: 'Central & State DBT welfare initiatives, solar power subsidies, housing and direct benefit transfers.',
    icon: FileText,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.05) 100%)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    glow: 'rgba(16, 185, 129, 0.4)',
    badgeKey: 'catSchemesBadge',
    defaultBadge: '55+ Schemes',
    popularKey: 'catSchemesExamples',
    defaultPopular: 'PM-Kisan, PM Surya Ghar, Ayushman Bharat, PMAY'
  },
  {
    id: 'Startups',
    titleKey: 'catStartupsTitle',
    defaultTitle: 'Startup',
    subtitleKey: 'catStartupsSubtitle',
    defaultSubtitle: 'Early-stage seed capital, DPIIT recognition, Stand-Up India, Mudra loans, and collateral-free credit.',
    icon: Rocket,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.05) 100%)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    glow: 'rgba(245, 158, 11, 0.4)',
    badgeKey: 'catStartupsBadge',
    defaultBadge: 'Seed Funds',
    popularKey: 'catStartupsExamples',
    defaultPopular: 'Startup India Seed Fund, Stand-Up India, CGTMSE'
  },
  // Row 2 (As in User's Sketch: Exam, Result)
  {
    id: 'Exams',
    titleKey: 'catExamsTitle',
    defaultTitle: 'Exam',
    subtitleKey: 'catExamsSubtitle',
    defaultSubtitle: 'National entrance & competitive examinations: JEE Main, NEET-UG, UPSC CSE, GATE, CAT, CLAT, NDA.',
    icon: GraduationCap,
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(126, 34, 206, 0.05) 100%)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
    glow: 'rgba(168, 85, 247, 0.4)',
    badgeKey: 'catExamsBadge',
    defaultBadge: '18+ National Exams',
    popularKey: 'catExamsExamples',
    defaultPopular: 'JEE Main, JEE Adv, NEET-UG, GATE, CAT, CLAT'
  },
  {
    id: 'Results',
    titleKey: 'catResultsTitle',
    defaultTitle: 'Result',
    subtitleKey: 'catResultsSubtitle',
    defaultSubtitle: 'Official examination scorecards, merit cutoffs, answer keys, and direct admit card download portals.',
    icon: Trophy,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 116, 144, 0.05) 100%)',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    glow: 'rgba(6, 182, 212, 0.4)',
    badgeKey: 'catResultsBadge',
    defaultBadge: 'Live Results & Admit Cards',
    popularKey: 'catResultsExamples',
    defaultPopular: 'NTA Scorecards, UPSC Results, Admit Cards'
  }
];

const HomeCategoryGrid = ({ onSelectCategory }) => {
  const { t } = useLanguage();

  const row1 = CATEGORIES.slice(0, 3); // Jobs, Scheme, Startup
  const row2 = CATEGORIES.slice(3, 5); // Exam, Result

  const renderCard = (cat) => {
    const Icon = cat.icon;
    const localizedTitle = t(cat.titleKey, cat.defaultTitle);
    const localizedSubtitle = t(cat.subtitleKey, cat.defaultSubtitle);
    const localizedBadge = t(cat.badgeKey, cat.defaultBadge);
    const localizedPopular = t(cat.popularKey, cat.defaultPopular);

    return (
      <motion.div
        key={cat.id}
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={() => onSelectCategory(cat.id)}
        style={{
          borderRadius: '22px',
          padding: '28px',
          background: cat.gradient,
          border: `1.5px solid ${cat.borderColor}`,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '230px',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = cat.color;
          e.currentTarget.style.boxShadow = `0 14px 40px -10px ${cat.glow}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = cat.borderColor;
          e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.5)';
        }}
      >
        {/* Background Decorative Glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: `${cat.color}15`,
          filter: 'blur(35px)',
          pointerEvents: 'none'
        }} />

        {/* Top Header: Icon & Badge */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: `${cat.color}25`,
              border: `1.5px solid ${cat.color}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={28} color={cat.color} />
            </div>

            <div style={{
              fontSize: '11.5px',
              fontWeight: '700',
              color: cat.color,
              background: `${cat.color}18`,
              padding: '5px 12px',
              borderRadius: '20px',
              border: `1px solid ${cat.color}44`,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Sparkles size={12} />
              <span>{localizedBadge}</span>
            </div>
          </div>

          {/* Title (Only in Selected Language - No mixed translations) */}
          <div style={{ marginBottom: '10px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#fff',
              margin: '0',
              letterSpacing: '-0.3px'
            }}>
              {localizedTitle}
            </h2>
          </div>

          {/* Description */}
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            margin: '0 0 14px 0'
          }}>
            {localizedSubtitle}
          </p>

          <div style={{
            fontSize: '11.5px',
            color: 'var(--text-muted)',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '16px'
          }}>
            <strong style={{ color: '#cbd5e1' }}>{t('homeExamples', 'Examples:')}</strong> {localizedPopular}
          </div>
        </div>

        {/* Footer Button Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '700',
            color: cat.color,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {t('homeBrowseBtn', 'Explore')} {localizedTitle} (A to Z)
          </span>

          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: `${cat.color}20`,
            border: `1px solid ${cat.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cat.color,
            transition: 'transform 0.2s'
          }}>
            <ArrowRight size={17} />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Row 1: 3 Columns on desktop, 2 on tablet, 1 on mobile (Jobs, Scheme, Startup) */}
      <div className="home-grid-row1">
        {row1.map(renderCard)}
      </div>

      {/* Row 2: 2 Columns on desktop/tablet, 1 on mobile (Exam, Result) */}
      <div className="home-grid-row2">
        {row2.map(renderCard)}
      </div>
    </div>
  );
};

export default HomeCategoryGrid;
