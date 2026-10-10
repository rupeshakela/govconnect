import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { GitCommit, ArrowDown, CheckCircle2, FileText, ExternalLink, Sparkles, Compass, ShieldCheck } from 'lucide-react';

const BenefitPathwayPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPathwayId, setSelectedPathwayId] = useState('pathway-education-career');

  const fetchPathways = async () => {
    try {
      setLoading(true);
      const res = await API.get('/benefits/pathways');
      if (res.data.success) {
        setPathways(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load benefit pathways', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPathways();
  }, []);

  const activePathway = pathways.find(p => p.id === selectedPathwayId) || pathways[0];

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
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '1px solid var(--border-glow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Compass size={18} color="var(--accent-primary)" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {t('pathwayChains')}
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              {t('pathwayHeroTitle')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '800px', lineHeight: '1.5' }}>
              {t('pathwayHeroDesc')}
            </p>
          </div>

          {/* Pathway Selector Tabs */}
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
            {pathways.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPathwayId(p.id)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: selectedPathwayId === p.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  background: selectedPathwayId === p.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                  color: selectedPathwayId === p.id ? '#fff' : 'var(--text-secondary)',
                  fontWeight: selectedPathwayId === p.id ? '700' : '500',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div>{t(p.title)}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{t(p.targetBeneficiary)}</div>
              </button>
            ))}
          </div>

          {/* Active Pathway Diagram Flow */}
          {activePathway && (
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '32px' }}>
              <div style={{ marginBottom: '28px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
                    {t(activePathway.title)}
                  </h2>
                  <span style={{ fontSize: '11.5px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                    {t(activePathway.disclaimer)}
                  </span>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  {t(activePathway.description)}
                </p>
              </div>

              {/* Step Sequence */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {activePathway.steps?.map((step, index) => {
                  const isLast = index === activePathway.steps.length - 1;
                  return (
                    <React.Fragment key={step.stepNumber}>
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-glow)',
                          borderRadius: '14px',
                          padding: '24px',
                          position: 'relative'
                        }}
                      >
                        {/* Step Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--accent-gradient)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '800',
                              color: '#fff',
                              fontSize: '14px'
                            }}>
                              {step.stepNumber}
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                {t('stage')} {step.stepNumber}: {t(step.stage)}
                              </span>
                              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: '2px 0 0 0' }}>
                                {step.programName}
                              </h3>
                            </div>
                          </div>

                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '6px' }}>
                            {t(step.benefit)}
                          </span>
                        </div>

                        {/* Step Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{t('problemCategory')}</span>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{step.purpose}</p>
                          </div>

                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{t('modalEligibility')}</span>
                            <p style={{ fontSize: '13px', color: '#fff', marginTop: '4px', fontWeight: '600' }}>{t(step.eligibilityStatus)}</p>
                          </div>

                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{t('modalDocuments')}</span>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              {step.requiredDocuments?.map(d => t(d)).join(' • ')}
                            </p>
                          </div>
                        </div>

                        {/* Next Action Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--warning)' }}>
                            <CheckCircle2 size={16} />
                            <strong>{t('nextAction')}</strong> {step.nextAction}
                          </div>

                          <a
                            href={step.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary"
                            style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            {t('portalLink')} <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>

                      {/* Connecting Arrow */}
                      {!isLast && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid var(--border-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowDown size={16} color="var(--accent-primary)" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BenefitPathwayPage;
