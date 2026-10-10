import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SchemeModal from '../components/SchemeModal';
import { AlertTriangle, CheckCircle2, XCircle, Clock, Calendar, FileText, ArrowRight, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

const BenefitGapPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSchemeModal, setActiveSchemeModal] = useState(null);
  const [updatingDoc, setUpdatingDoc] = useState(null);

  const fetchGapAnalysis = async () => {
    try {
      setLoading(true);
      const res = await API.get('/benefits/gap-analysis');
      if (res.data.success) {
        setGapData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch gap analysis', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapAnalysis();
  }, []);

  const handleToggleDocStatus = async (docName, currentStatus) => {
    try {
      setUpdatingDoc(docName);
      const nextStatus = currentStatus === 'Available' ? 'Missing' : 'Available';
      await API.put('/benefits/document-checklist', { docName, status: nextStatus });
      await fetchGapAnalysis(); // Refresh gap analysis
    } catch (err) {
      console.error('Failed to update document status', err);
    } finally {
      setUpdatingDoc(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar user={user} onLogout={logout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Navbar user={user} />

        <main style={{ padding: '28px', flex: 1, maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          {/* Hero Banner */}
          <div className="glass-panel" style={{
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <AlertTriangle size={18} color="var(--warning)" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {t('brandName')} {t('navGap')}
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              {t('gapHeroTitle')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '800px', lineHeight: '1.5' }}>
              {t('gapHeroDesc')}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              {t('analyzingGaps')}
            </div>
          ) : (
            <>
              {/* Gap Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div className="glass-panel" style={{ borderRadius: '12px', padding: '20px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('totalRelevant')}</span>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>
                    {gapData?.summary?.totalRelevantBenefits || 0}
                  </h2>
                </div>

                <div className="glass-panel" style={{ borderRadius: '12px', padding: '20px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('currentlySaved')}</span>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)', marginTop: '8px' }}>
                    {gapData?.summary?.currentlySaved || 0}
                  </h2>
                </div>

                <div className="glass-panel" style={{ borderRadius: '12px', padding: '20px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--error)', fontWeight: '600' }}>{t('potentiallyMissed')}</span>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--error)', marginTop: '8px' }}>
                    {gapData?.summary?.potentiallyMissed || 0}
                  </h2>
                </div>

                <div className="glass-panel" style={{ borderRadius: '12px', padding: '20px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('estimatedValue')}</span>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '12px' }}>
                    {gapData?.summary?.monetaryLabel || 'Varies by category'}
                  </h2>
                </div>
              </div>

              {/* Document Gap / Bottleneck Analyzer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} color="var(--accent-primary)" /> {t('docChecklistTitle')}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('clickCheckboxToggle')}</span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {t('docChecklistSubtitle')}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {gapData?.documentsChecklist?.map((doc, idx) => {
                      const isAvail = doc.status === 'Available';
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleDocStatus(doc.docName, doc.status)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            background: isAvail ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                            border: isAvail ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isAvail ? (
                              <CheckCircle2 size={18} color="var(--success)" />
                            ) : (
                              <XCircle size={18} color="var(--error)" />
                            )}
                            <div>
                              <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#fff' }}>{t(doc.docName)}</span>
                              {doc.isBottleneck && (
                                <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', fontWeight: '700' }}>
                                  {t('bottleneck')}
                                </span>
                              )}
                            </div>
                          </div>

                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: '600',
                            color: isAvail ? 'var(--success)' : 'var(--error)'
                          }}>
                            {isAvail ? t('docReady') : t('docMissing')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Application Window Intelligence */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color="var(--warning)" /> {t('appWindowsTitle')}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('realAppCycles')}</span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {t('appWindowsSubtitle')}
                  </p>


                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Closing Soon */}
                    {gapData?.applicationWindows?.closingSoon?.slice(0, 2).map((s) => (
                      <div key={s._id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#fff' }}>{t(s.name)}</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '6px' }}>
                            {t('closingInDays')}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Cycle: {s.applicationWindow?.cycleDescription || 'Academic Cycle 2026'}
                        </p>
                      </div>
                    ))}

                    {/* Open Now */}
                    {gapData?.applicationWindows?.openNow?.slice(0, 2).map((s) => (
                      <div key={s._id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#fff' }}>{t(s.name)}</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '6px' }}>
                            {t('openNow')}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Cycle: {s.applicationWindow?.cycleDescription || 'Annual Enrollment'}
                        </p>
                      </div>
                    ))}

                    {/* Year-Round */}
                    {gapData?.applicationWindows?.yearRound?.slice(0, 1).map((s) => (
                      <div key={s._id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#fff' }}>{t(s.name)}</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.2)', padding: '2px 8px', borderRadius: '6px' }}>
                            {t('yearRound')}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {t('continuousEnrollment')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Potentially Missed Opportunities List */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
                  {t('missedOpportunitiesTitle')}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {gapData?.missedBenefits?.map((scheme) => (
                    <div
                      key={scheme._id}
                      className="glass-card"
                      style={{
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                            {t(scheme.category)}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: '600' }}>
                            {t(scheme.applicationWindow?.status) || t('openNow')}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                          {t(scheme.name)}
                        </h4>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px' }}>
                          {t(scheme.eligibilityCriteria)?.slice(0, 110)}...
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => setActiveSchemeModal(scheme)}
                          className="btn-secondary"
                          style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                        >
                          {t('viewCriteria')}
                        </button>
                        <a
                          href={scheme.officialWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary"
                          style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                        >
                          {t('apply')} <ExternalLink size={13} style={{ marginLeft: '4px' }} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <SchemeModal
        scheme={activeSchemeModal}
        isOpen={Boolean(activeSchemeModal)}
        onClose={() => setActiveSchemeModal(null)}
      />
    </div>
  );
};

export default BenefitGapPage;
