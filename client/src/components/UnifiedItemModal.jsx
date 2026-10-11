import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ExternalLink, 
  Bookmark, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  GraduationCap, 
  FileText, 
  ListOrdered, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  Sparkles,
  Clock,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Award
} from 'lucide-react';
import { normalizePortalItem } from '../utils/portalItemData';
import { useLanguage } from '../context/LanguageContext';

const UnifiedItemModal = ({ 
  item, 
  isOpen, 
  onClose, 
  isBookmarked = false, 
  onToggleBookmark = () => {} 
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'dates' | 'fees' | 'documents' | 'steps' | 'syllabus'
  const [checkedDocs, setCheckedDocs] = useState({});

  if (!isOpen || !item) return null;

  const data = normalizePortalItem(item);
  if (!data) return null;

  const isResult = data.type === 'result';
  const isExam = data.type === 'exam';
  const isJob = data.type === 'job';
  const isScheme = data.type === 'scheme';
  const isStartup = data.type === 'startup';

  const toggleDocCheck = (docIndex) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docIndex]: !prev[docIndex]
    }));
  };

  const tabs = isResult
    ? [
        { id: 'overview', label: '📌 Result Overview', icon: Sparkles },
        { id: 'dates', label: '📅 Result Timeline', icon: Calendar },
        { id: 'scorecard', label: '🏆 Scorecard & Cutoff', icon: Award },
        { id: 'documents', label: '🔑 Credentials Needed', icon: FileText, badge: data.documents.length },
        { id: 'steps', label: '📋 How to Check Scorecard', icon: ListOrdered }
      ]
    : [
        { id: 'overview', label: '📌 Overview', icon: Sparkles },
        { id: 'dates', label: isExam ? '📅 Exam Schedule' : '📅 Important Dates', icon: Calendar },
        { id: 'fees', label: '💳 Application Fee', icon: DollarSign },
        { id: 'documents', label: '📄 Documents', icon: FileText, badge: data.documents.length },
        { id: 'steps', label: '📝 How to Apply', icon: ListOrdered },
        ...(data.pattern || data.syllabus ? [{ id: 'syllabus', label: '📖 Pattern & Syllabus', icon: BookOpen }] : [])
      ];

  const currentTab = (isResult && activeTab === 'fees') ? 'overview' : activeTab;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 15, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="unified-modal-box"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(13, 19, 34, 0.9) 100%)',
            position: 'relative'
          }}>
            {/* Top Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <X size={18} />
            </button>

            {/* Badges Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '20px',
                background: `${data.badgeColor}22`,
                color: data.badgeColor,
                border: `1px solid ${data.badgeColor}55`,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {data.typeBadge}
              </span>

              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                🏛️ {data.authority}
              </span>

              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ShieldCheck size={12} /> Verified Gazette Record
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#fff',
              margin: '0 0 6px 0',
              lineHeight: '1.35',
              paddingRight: '45px'
            }}>
              {data.title}
            </h2>

            <p style={{
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              {data.typeLabel} &bull; Conducting Agency: <strong style={{ color: '#fff' }}>{data.authority}</strong>
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
            gap: '8px',
            padding: '12px 18px',
            background: 'rgba(15, 23, 42, 0.5)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {isResult ? (
              <>
                {/* Result Status Metric */}
                <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#67e8f9', fontWeight: '700', textTransform: 'uppercase' }}>
                    <Award size={13} color="#06b6d4" /> Result Status
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#22d3ee', marginTop: '2px' }}>
                    Scorecard & Merit Live
                  </div>
                </div>

                {/* Declaration Status Metric */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    <Calendar size={13} color="var(--warning)" /> Declaration Status
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
                    Declared & Active
                  </div>
                </div>

                {/* Result Access Fee Metric */}
                <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6ee7b7', fontWeight: '600', textTransform: 'uppercase' }}>
                    <CheckCircle2 size={13} color="var(--success)" /> Access Fee
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--success)', marginTop: '2px' }}>
                    100% Free Access
                  </div>
                </div>

                {/* Posts / Intake Metric */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    <Users size={13} color="#ec4899" /> Posts / Intake
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#ec4899', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {data.vacancies ? `${data.vacancies.toLocaleString()} Posts` : 'Official Selection'}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Fees Metric */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    <DollarSign size={13} color="var(--success)" /> Application Fee
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--success)', marginTop: '2px' }}>
                    {data.fees.summary || data.fees.generalOBC}
                  </div>
                </div>

                {/* Dates / Last Date Metric */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    <Calendar size={13} color="var(--warning)" /> Last Date / Deadline
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
                    {data.endDate}
                  </div>
                </div>

                {/* Age Limit Metric */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    <Clock size={13} color="var(--accent-primary)" /> Age Limit
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {data.ageLimit.split('(')[0]}
                  </div>
                </div>

                {/* Vacancies / Benefit Metric */}
                {(data.vacancies || data.benefitAmount || data.salaryRange) && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                      <Award size={13} color="#ec4899" />
                      {data.vacancies ? 'Seats / Posts' : (data.benefitAmount ? 'Max Benefit' : 'Pay Scale')}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#ec4899', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {data.vacancies ? `${data.vacancies.toLocaleString()} Posts` : (data.benefitAmount ? `₹${data.benefitAmount.toLocaleString()}` : data.salaryRange)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Navigation Tabs Bar */}
          <div 
            className="touch-scroll-row"
            style={{
              gap: '6px',
              padding: '10px 20px',
              background: 'rgba(10, 15, 26, 0.9)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {tabs.map((tab) => {
              const isCurrent = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '10px',
                    border: isCurrent ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    background: isCurrent ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                    color: isCurrent ? '#fff' : 'var(--text-secondary)',
                    fontWeight: isCurrent ? '700' : '500',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span style={{
                      fontSize: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Body (Scrollable) */}
          <div style={{
            padding: '24px 28px',
            overflowY: 'auto',
            flex: 1,
            color: 'var(--text-primary)',
            fontSize: '13.5px',
            lineHeight: '1.6'
          }}>
            {/* TAB: OVERVIEW */}
            {currentTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Result Overview Banner */}
                {isResult && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    boxShadow: '0 4px 20px -4px rgba(6, 182, 212, 0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={19} color="#06b6d4" /> Official Merit & Selection Declaration
                      </h3>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: 'rgba(6, 182, 212, 0.2)',
                        color: '#22d3ee',
                        border: '1px solid rgba(6, 182, 212, 0.4)'
                      }}>
                        LIVE MERIT ROSTER
                      </span>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '0 0 14px 0', lineHeight: '1.6' }}>
                      {data.authority} has officially declared the merit selection list and scorecards for {data.title}. Candidates can check their scorecard and verification status online.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <a
                        href={data.resultLink || data.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 18px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          textDecoration: 'none',
                          boxShadow: '0 2px 10px rgba(6, 182, 212, 0.3)'
                        }}
                      >
                        <Award size={14} /> Open Result Portal <ExternalLink size={13} />
                      </a>
                      <button
                        onClick={() => setActiveTab('dates')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 16px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#e2e8f0',
                          fontWeight: '600',
                          fontSize: '12.5px',
                          cursor: 'pointer'
                        }}
                      >
                        View Result Timeline &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Target Beneficiary & Government Welfare Details (Schemes Only) */}
                {data.beneficiary && isScheme && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: `1.5px solid ${data.beneficiary.badgeColor}45`,
                    boxShadow: `0 4px 20px -4px ${data.beneficiary.badgeColor}15`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} color={data.beneficiary.badgeColor} />
                        {t('targetBeneficiaryScopeTitle', 'Target Beneficiary & Eligibility Scope')}
                      </h3>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: `${data.beneficiary.badgeColor}25`,
                        color: data.beneficiary.badgeColor,
                        border: `1px solid ${data.beneficiary.badgeColor}50`
                      }}>
                        {data.beneficiary.badge}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Intended Beneficiary:</span>
                        <strong style={{ color: data.beneficiary.badgeColor, fontSize: '13px' }}>{data.beneficiary.label}</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Gender Requirement:</span>
                        <strong style={{ color: '#fff', fontSize: '13px' }}>{data.beneficiary.genderText}</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Income Criterion:</span>
                        <strong style={{ color: '#fff', fontSize: '13px' }}>{data.incomeLimit ? `Under ₹${data.incomeLimit.toLocaleString()}/yr` : 'No Income Cap'}</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Financial Benefit / Aid:</span>
                        <strong style={{ color: 'var(--success)', fontSize: '13px' }}>{data.benefitAmount ? `₹${data.benefitAmount.toLocaleString()}` : (data.benefitType || 'Government Welfare Subsidy')}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eligibility & Qualifications Card */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={18} color="var(--accent-primary)" />
                    {isResult ? 'Post / Examination Qualifications' : 'Eligibility Criteria & Educational Qualification'}
                  </h3>
                  <p style={{ color: '#cbd5e1', margin: '0 0 10px 0' }}>
                    {data.eligibility}
                  </p>
                  <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '10px 14px', borderRadius: '10px', borderLeft: '3px solid var(--accent-primary)', fontSize: '12.5px' }}>
                    <strong>Mandatory Qualification:</strong> {data.qualification}
                  </div>
                </div>

                {/* Age Relaxations Card */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="var(--warning)" />
                    Age Limit & Government Relaxations
                  </h3>
                  <p style={{ color: '#cbd5e1', margin: 0 }}>
                    {data.ageLimit}
                  </p>
                </div>

                {/* Schedule Summary Preview */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} color="#10b981" />
                      {isResult ? 'Result Schedule Snapshot' : 'Key Dates Snapshot'}
                    </h3>
                    <button onClick={() => setActiveTab('dates')} style={{ fontSize: '12px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                      View Full Schedule &rarr;
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Release / Publish Date:</span>
                      <strong style={{ color: '#fff' }}>{data.publishDate}</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{isResult ? 'Status:' : 'Application Deadline:'}</span>
                      <strong style={{ color: isResult ? 'var(--success)' : 'var(--warning)' }}>{data.endDate}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: IMPORTANT DATES / RESULT TIMELINE */}
            {currentTab === 'dates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {isResult ? (
                  <>
                    <div style={{
                      background: 'rgba(6, 182, 212, 0.08)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Award size={20} color="#06b6d4" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: '13px', color: '#cffafe', lineHeight: '1.5' }}>
                        <strong>Official Result & Scorecard Live:</strong> {data.authority} has finalized the merit list. You can check your qualifying status directly using your Roll Number / Registration ID.
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* 1. Exam Cycle Completed */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={18} color="var(--success)" />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: '#fff', fontSize: '14px' }}>CBT / Written Examination</strong>
                              <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>COMPLETED</span>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All exam shifts successfully conducted across testing centers</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--success)', fontSize: '13.5px' }}>{data.examSchedule}</span>
                      </div>

                      {/* 2. Answer Keys Released */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={18} color="var(--success)" />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: '#fff', fontSize: '14px' }}>Official Master Answer Keys</strong>
                              <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>VERIFIED</span>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Provisional challenges scrutinized & master key published</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: '700', color: '#cbd5e1', fontSize: '13.5px' }}>Evaluation Finalized</span>
                      </div>

                      {/* 3. Official Result & Scorecard (ACTIVE NOW with ACTION BUTTON) */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 18px',
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
                        borderRadius: '14px',
                        border: '1.5px solid rgba(6, 182, 212, 0.4)',
                        boxShadow: '0 4px 18px rgba(6, 182, 212, 0.12)',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '800' }}>
                            <Award size={20} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: '#fff', fontSize: '14.5px' }}>Scorecard & Final Merit List</strong>
                              <span style={{ fontSize: '10.5px', background: '#06b6d4', color: '#000', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>ACTIVE NOW</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#a5f3fc' }}>Individual marks and qualifying rank published on portal</span>
                          </div>
                        </div>
                        <a
                          href={data.resultLink || data.officialWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: '#06b6d4',
                            color: '#000',
                            fontWeight: '800',
                            fontSize: '12px',
                            textDecoration: 'none',
                            boxShadow: '0 2px 10px rgba(6, 182, 212, 0.4)'
                          }}
                        >
                          <span>🏆 Check Scorecard Now</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>

                      {/* 4. Cutoff Marks & Category Merit Roster */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(192, 132, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={18} color="#c084fc" />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: '#fff', fontSize: '14px' }}>Category Cutoff Marks</strong>
                              <span style={{ fontSize: '10px', background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>PUBLISHED</span>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qualifying standards for UR, OBC, SC, ST, EWS categories</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('scorecard')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            background: 'rgba(192, 132, 252, 0.12)',
                            color: '#c084fc',
                            border: '1px solid rgba(192, 132, 252, 0.3)',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          View Cutoff Marks &rarr;
                        </button>
                      </div>

                      {/* 5. Document Verification (DV) & Call Letter Stage */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={18} color="var(--warning)" />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: '#fff', fontSize: '14px' }}>Document Verification (DV) & Medical / Joining</strong>
                              <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>NEXT STAGE</span>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qualified candidates to report with original certificates</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--warning)', fontSize: '13px' }}>Refer Call Letter / Notice</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertCircle size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '12.5px', color: '#fef3c7' }}>
                        Make sure to complete online submission and fee payment before the last date. No extensions are guaranteed by official conducting bodies.
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={18} color="var(--accent-primary)" />
                          </div>
                          <div>
                            <strong style={{ color: '#fff', display: 'block', fontSize: '14px' }}>Form Published / Released</strong>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Official Gazette / Notification date</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: '700', color: '#fff', fontSize: '14px' }}>{data.publishDate}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={18} color="var(--success)" />
                          </div>
                          <div>
                            <strong style={{ color: '#fff', display: 'block', fontSize: '14px' }}>Online Application Opening Date</strong>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Portal opens for registrations</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--success)', fontSize: '14px' }}>{data.startDate}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={18} color="var(--error)" />
                          </div>
                          <div>
                            <strong style={{ color: '#fff', display: 'block', fontSize: '14px' }}>Last Date to Apply (Final Deadline)</strong>
                            <span style={{ fontSize: '12px', color: '#fca5a5' }}>Portal closes for submissions and fee payment</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: '800', color: 'var(--error)', fontSize: '14px' }}>{data.endDate}</span>
                      </div>

                      {data.examSchedule && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BookOpen size={18} color="#c084fc" />
                            </div>
                            <div>
                              <strong style={{ color: '#fff', display: 'block', fontSize: '14px' }}>Examination / Assessment Schedule</strong>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CBT / Written / Interview Sessions</span>
                            </div>
                          </div>
                          <span style={{ fontWeight: '700', color: '#c084fc', fontSize: '13px', textAlign: 'right', maxWidth: '300px' }}>{data.examSchedule}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB: SCORECARD & CUTOFF (FOR RESULTS) */}
            {currentTab === 'scorecard' && isResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Hero Direct Server Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  padding: '22px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(6, 182, 212, 0.35)',
                  boxShadow: '0 4px 24px -4px rgba(6, 182, 212, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Award size={20} color="#06b6d4" />
                        <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: '#fff', margin: 0 }}>
                          Official Scorecard & Merit Portal Active
                        </h3>
                      </div>
                      <p style={{ color: '#cffafe', fontSize: '13px', margin: 0, maxWidth: '560px', lineHeight: '1.5' }}>
                        {data.authority} provides instant electronic scorecard verification. Enter your Roll Number / Registration ID to view your normalized marks, rank, and qualifying status.
                      </p>
                    </div>

                    <a
                      href={data.resultLink || data.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 22px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '13.5px',
                        textDecoration: 'none',
                        boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Award size={16} /> Open Official Result Server <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* Category Cutoff Reference Benchmarks */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h3 style={{ fontSize: '15.5px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={18} color="#c084fc" />
                    Official Category Cutoff Benchmarks
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>General / Unreserved (UR):</span>
                      <strong style={{ fontSize: '18px', color: '#fff', display: 'block', marginTop: '4px' }}>68 – 75%</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Qualifying Standard</span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>OBC (Non-Creamy Layer):</span>
                      <strong style={{ fontSize: '18px', color: '#38bdf8', display: 'block', marginTop: '4px' }}>64 – 70%</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Qualifying Standard</span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>EWS Candidates:</span>
                      <strong style={{ fontSize: '18px', color: '#c084fc', display: 'block', marginTop: '4px' }}>62 – 68%</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Qualifying Standard</span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>SC / ST / PwD:</span>
                      <strong style={{ fontSize: '18px', color: 'var(--success)', display: 'block', marginTop: '4px' }}>55 – 62%</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Relaxed Criteria</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '12px 16px', borderRadius: '10px', borderLeft: '3px solid var(--accent-primary)', fontSize: '12.5px', color: '#cbd5e1' }}>
                    <strong>Note:</strong> Cutoff percentiles vary by trade/stream and reservation norms. Refer to the official gazette notification for complete category-wise rank rosters.
                  </div>
                </div>

                {/* Security Advisory Card */}
                <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={20} color="var(--success)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '12.5px', color: '#d1fae5', lineHeight: '1.5' }}>
                    <strong>100% Free Official Service:</strong> Official Government result and scorecard access is completely free of charge. Never pay any fee or share confidential credentials on unofficial websites.
                  </span>
                </div>
              </div>
            )}

            {/* TAB: FEES & PAYMENT (NON-RESULT ONLY) */}
            {currentTab === 'fees' && !isResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={18} color="var(--success)" />
                    Official Application Fee Breakdown (Category-Wise)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>General / OBC / EWS Male:</span>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', display: 'block', marginTop: '4px' }}>
                        {data.fees.generalOBC}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>SC / ST / PwD Candidates:</span>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)', display: 'block', marginTop: '4px' }}>
                        {data.fees.scStPwd}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>All Female Candidates:</span>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#ec4899', display: 'block', marginTop: '4px' }}>
                        {data.fees.female}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '12.5px', color: '#cbd5e1' }}>
                    <strong>Supported Payment Methods:</strong> {data.fees.paymentModes}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REQUIRED DOCUMENTS / CREDENTIALS */}
            {currentTab === 'documents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isResult ? 'rgba(6, 182, 212, 0.1)' : 'rgba(99, 102, 241, 0.1)', border: isResult ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '12px', padding: '12px 18px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color={isResult ? '#06b6d4' : 'var(--accent-primary)'} />
                    <span style={{ fontSize: '13px', color: '#e0e7ff', fontWeight: '600' }}>
                      {isResult ? 'Credentials & Verification Documents Checklist' : 'Citizen Document Readiness Checklist'}
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {isResult ? 'Keep your credentials ready to view scorecard & prepare for DV' : 'Check off the documents you have prepared'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.documents.map((doc, idx) => {
                    const isChecked = checkedDocs[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleDocCheck(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '14px 18px',
                          background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '12px',
                          border: isChecked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.18s'
                        }}
                      >
                        <div style={{ flexShrink: 0, color: isChecked ? 'var(--success)' : 'var(--text-muted)' }}>
                          {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                        </div>
                        <span style={{
                          fontSize: '13.5px',
                          color: isChecked ? '#fff' : '#cbd5e1',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          opacity: isChecked ? 0.85 : 1
                        }}>
                          {doc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: STEP-BY-STEP HOW TO APPLY / HOW TO CHECK RESULT */}
            {currentTab === 'steps' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: isResult ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)' : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)', border: isResult ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '14px', padding: '16px 20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ListOrdered size={18} color={isResult ? '#06b6d4' : 'var(--accent-primary)'} />
                    {isResult ? 'Step-by-Step Scorecard & Selection Guide' : 'Step-by-Step Online Form Filling Guide'}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                    {isResult ? 'Follow these 5 verified steps to access, verify, and preserve your scorecard.' : 'Follow this official 5-step blueprint carefully to submit your application without errors.'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.applicationSteps.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: isResult ? 'rgba(6, 182, 212, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        border: isResult ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isResult ? '#67e8f9' : '#a5b4fc',
                        fontWeight: '800',
                        fontSize: '13px',
                        flexShrink: 0
                      }}>
                        {s.step}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' }}>
                          {s.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PATTERN & SYLLABUS */}
            {currentTab === 'syllabus' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {data.pattern && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={18} color="var(--accent-primary)" />
                      Exam Scheme & Testing Pattern
                    </h3>
                    <p style={{ color: '#cbd5e1', margin: 0, lineHeight: '1.6' }}>
                      {data.pattern}
                    </p>
                  </div>
                )}

                {data.syllabus && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} color="var(--warning)" />
                      Curriculum & Subject Syllabus
                    </h3>
                    <p style={{ color: '#cbd5e1', margin: 0, lineHeight: '1.6' }}>
                      {data.syllabus}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div style={{
            padding: '16px 28px',
            background: '#0a0f1d',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(item._id)}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                padding: '10px 18px',
                borderRadius: '10px'
              }}
            >
              <Bookmark 
                size={16} 
                fill={isBookmarked ? 'var(--warning)' : 'none'} 
                color={isBookmarked ? 'var(--warning)' : 'currentColor'} 
              />
              <span>{isBookmarked ? 'Saved in Profile' : 'Save / Bookmark'}</span>
            </button>

            {/* Quick Links Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {isResult ? (
                <>
                  <a
                    href={data.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ textDecoration: 'none', fontSize: '12.5px', padding: '10px 16px', borderRadius: '10px', color: '#cbd5e1' }}
                  >
                    📄 Official Gazette / Notification
                  </a>

                  <a
                    href={data.resultLink || data.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                      textDecoration: 'none',
                      fontSize: '13px',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                      border: 'none',
                      color: '#fff',
                      boxShadow: '0 4px 18px rgba(6, 182, 212, 0.4)'
                    }}
                  >
                    <span>🏆 Open Official Result Server</span>
                    <ExternalLink size={15} />
                  </a>
                </>
              ) : (
                <>
                  {data.admitCardLink && (
                    <a
                      href={data.admitCardLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ textDecoration: 'none', fontSize: '12.5px', padding: '9px 14px', borderRadius: '10px', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.3)' }}
                    >
                      Admit Card
                    </a>
                  )}

                  {data.resultLink && (
                    <a
                      href={data.resultLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ textDecoration: 'none', fontSize: '12.5px', padding: '9px 14px', borderRadius: '10px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                    >
                      Result Portal
                    </a>
                  )}

                  <a
                    href={data.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                      textDecoration: 'none',
                      fontSize: '13px',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '700'
                    }}
                  >
                    <span>Apply Online / Official Portal</span>
                    <ExternalLink size={15} />
                  </a>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnifiedItemModal;
