import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  GraduationCap, 
  ArrowRight, 
  Bookmark, 
  Users, 
  Clock, 
  Award,
  ExternalLink,
  ShieldCheck,
  FileText,
  Sparkles
} from 'lucide-react';
import { normalizePortalItem } from '../utils/portalItemData';
import { useLanguage } from '../context/LanguageContext';

const PortalUnifiedCard = ({ 
  item, 
  onViewDetails, 
  isBookmarked = false, 
  onToggleBookmark = () => {} 
}) => {
  const { t } = useLanguage();
  if (!item) return null;

  const data = normalizePortalItem(item);
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="glass-card"
      style={{
        borderRadius: '18px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'rgba(21, 29, 45, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative'
      }}
    >
      <div>
        {/* Top Badges Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '20px',
              background: `${data.badgeColor}20`,
              color: data.badgeColor,
              border: `1px solid ${data.badgeColor}40`
            }}>
              {data.typeBadge}
            </span>

            {/* Target Beneficiary Badge (For Schemes) */}
            {data.beneficiary && data.beneficiary.key !== 'General' && (
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '3px 9px',
                borderRadius: '20px',
                background: `${data.beneficiary.badgeColor}22`,
                color: data.beneficiary.badgeColor,
                border: `1px solid ${data.beneficiary.badgeColor}45`
              }}>
                {data.beneficiary.badge}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(item._id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isBookmarked ? 'var(--warning)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '6px',
              transition: 'color 0.15s'
            }}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark item'}
          >
            <Bookmark 
              size={18} 
              fill={isBookmarked ? 'var(--warning)' : 'none'} 
              color={isBookmarked ? 'var(--warning)' : 'currentColor'} 
            />
          </button>
        </div>

        {/* Authority / Department */}
        <span style={{
          fontSize: '11.5px',
          color: 'var(--text-muted)',
          display: 'block',
          marginBottom: '5px',
          fontWeight: '600'
        }}>
          {data.authority}
        </span>

        {/* Title */}
        <h3 
          onClick={() => onViewDetails(item)}
          style={{
            fontSize: '16.5px',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '14px',
            lineHeight: '1.4',
            cursor: 'pointer',
            transition: 'color 0.15s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#fff'; }}
        >
          {data.title}
        </h3>

        {/* Info Highlights */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '18px',
          fontSize: '12.5px',
          color: 'var(--text-secondary)'
        }}>
          {/* If Scheme: Show Beneficiary Target Group */}
          {data.type === 'scheme' && data.beneficiary && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={14} color={data.beneficiary.badgeColor} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong style={{ color: '#cbd5e1' }}>{t('beneficiaryTarget', 'Target Group')}:</strong> {data.beneficiary.targetAudience}
              </span>
            </div>
          )}

          {/* If Scheme: Show Aid / Benefit Scale */}
          {data.type === 'scheme' && (data.benefitAmount || data.benefitType) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} color="var(--warning)" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong style={{ color: '#cbd5e1' }}>{t('benefitAidLabel', 'Benefit / Subsidy')}:</strong> {data.benefitAmount ? `₹${data.benefitAmount.toLocaleString()} (${data.benefitType})` : data.benefitType}
              </span>
            </div>
          )}

          {/* Result Specific Highlights */}
          {data.type === 'result' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={14} color="#06b6d4" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong style={{ color: '#cbd5e1' }}>Result Status:</strong> <span style={{ color: '#22d3ee', fontWeight: '700' }}>{item.resultStatus || 'Scorecard & Merit Link Active'}</span>
              </span>
            </div>
          )}

          {/* Important Dates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color="var(--warning)" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: '#cbd5e1' }}>{data.type === 'result' ? 'Declaration Date' : t('deadlineLabel', 'Deadline')}:</strong> {data.endDate}
            </span>
          </div>

          {/* Fee / Benefit */}
          {data.type !== 'result' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={14} color="var(--success)" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong style={{ color: '#cbd5e1' }}>{t('feeLabel', 'Fee')}:</strong> {data.fees.summary || data.fees.generalOBC}
              </span>
            </div>
          )}

          {/* Qualification / Eligibility */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: '#cbd5e1' }}>{t('eligibilityLabel', 'Eligibility')}:</strong> {data.qualification}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        paddingTop: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
      }}>
        <button
          onClick={() => onViewDetails(item)}
          className="btn-primary"
          style={{
            fontSize: '12.5px',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            flex: 1,
            justifyContent: 'center',
            textDecoration: 'none',
            background: data.type === 'result' ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' : undefined,
            border: data.type === 'result' ? '1px solid #06b6d4' : undefined,
            boxShadow: data.type === 'result' ? '0 4px 14px rgba(6, 182, 212, 0.35)' : undefined
          }}
        >
          <span>{data.type === 'result' ? '🏆 View Scorecard & Result' : t('viewDetailsBtn', 'View Details & Apply')}</span>
          <ArrowRight size={14} />
        </button>

        <a
          href={data.type === 'result' && (data.resultLink || item.resultLink) ? (data.resultLink || item.resultLink) : data.officialWebsite}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px',
            color: data.type === 'result' ? '#22d3ee' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'all 0.15s'
          }}
          title={data.type === 'result' ? 'Direct Official Result / Scorecard Portal' : 'Direct Official Portal Link'}
        >
          <ExternalLink size={15} />
        </a>
      </div>
    </motion.div>
  );
};

export default PortalUnifiedCard;
