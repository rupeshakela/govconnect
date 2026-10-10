import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, CheckCircle2, AlertCircle, HelpCircle, Loader2, Bookmark, ExternalLink } from 'lucide-react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const SituationInput = ({ onOpenSchemeModal, onBookmarkToggled, savedIds = [] }) => {
  const { t } = useLanguage();
  const [problemText, setProblemText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const promptSuggestions = [
    t('preset1'),
    t('preset2'),
    t('preset3'),
    t('preset4'),
    t('preset5')
  ];

  const handleAnalyze = async (textToAnalyze) => {
    const query = textToAnalyze || problemText;
    if (!query.trim()) return;

    try {
      setAnalyzing(true);
      setError('');
      const res = await API.post('/benefits/analyze-situation', { problem: query });
      if (res.data.success) {
        setAnalysisResult(res.data.data);
      }
    } catch (err) {
      console.error('Situation analysis error', err);
      setError('Unable to analyze situation. Please try a simpler phrase.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePresetClick = (preset) => {
    setProblemText(preset);
    handleAnalyze(preset);
  };

  return (
    <div className="glass-panel" style={{
      borderRadius: '20px',
      padding: '32px',
      marginBottom: '32px',
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
      border: '1px solid rgba(99, 102, 241, 0.35)',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{
          background: 'var(--accent-gradient)',
          padding: '6px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sparkles size={18} color="#fff" />
        </div>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {t('brandName')} {t('brandTag')}
        </span>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.3px' }}>
        {t('tellUsNeed')}
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '800px', lineHeight: '1.5', marginBottom: '20px' }}>
        {t('situationSubtitle')}
      </p>

      {/* Natural Language Input Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '6px 8px 6px 16px',
        borderRadius: '14px',
        border: '1px solid var(--border-glow)',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
      }}>
        <Search size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          placeholder={t('situationPlaceholder')}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: '15px',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={() => handleAnalyze()}
          disabled={analyzing || !problemText.trim()}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '13.5px',
            opacity: (!problemText.trim() || analyzing) ? 0.6 : 1
          }}
        >
          {analyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" /> {t('analyzing')}
            </>
          ) : (
            <>
              {t('analyzeBtn')} <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* Suggestion Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('trySaying')}</span>
        {promptSuggestions.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handlePresetClick(preset)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            "{preset.slice(0, 45)}..."
          </button>
        ))}
      </div>


      {error && (
        <div style={{ marginTop: '14px', color: 'var(--error)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Analysis Results Display */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}
          >
            {/* Extracted Structured Intelligence Factors */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{t('problemCategory')}</span>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginTop: '4px' }}>
                  {t(analysisResult.detectedFactors?.category) || t('General')}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{t('targetBeneficiary')}</span>
                <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-primary)', marginTop: '4px' }}>
                  {t(analysisResult.detectedFactors?.targetBeneficiary) || t('citizen')}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{t('identifiedNeeds')}</span>
                <p style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--success)', marginTop: '4px' }}>
                  {analysisResult.detectedFactors?.needs?.map(n => t(n)).join(' • ') || t('publicSupport')}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{t('relevantOpportunities')}</span>
                <p style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
                  {analysisResult.resultsCount} {t('verifiedPrograms')}
                </p>
              </div>
            </div>

            {/* Matched Programs Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                {t('discoveredOpportunities')}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {t('deterministicNotice')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {analysisResult.matches?.map((scheme) => {
                const isLikely = scheme.confidence === 'Likely eligible';
                return (
                  <div
                    key={scheme._id}
                    className="glass-card"
                    style={{
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isLikely ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      {/* Confidence Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isLikely ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                          color: isLikely ? 'var(--success)' : 'var(--accent-primary)',
                          border: isLikely ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)'
                        }}>
                          {t(scheme.confidence) || scheme.confidence} ({scheme.matchScore}% {t('match')})
                        </span>

                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {t(scheme.applicationWindow?.status) || t('openNow')}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
                        {t(scheme.name)}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '12px' }}>
                        {t(scheme.eligibilityCriteria)?.slice(0, 110)}...
                      </p>

                      {/* Reasons */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{t('whyRecommends')}</span>
                        {scheme.reasons?.slice(0, 2).map((r, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                            <CheckCircle2 size={12} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        onClick={() => onOpenSchemeModal && onOpenSchemeModal(scheme)}
                        className="btn-secondary"
                        style={{ flex: 1, fontSize: '12px', padding: '8px', textAlign: 'center' }}
                      >
                        {t('viewFullDetails')}
                      </button>

                      <a
                        href={scheme.officialWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Official Application Portal"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SituationInput;
