import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, XCircle, Info, Lock, ExternalLink } from 'lucide-react';

const SAMPLE_CLAIMS = [
  {
    label: '🚨 WhatsApp OTP Scam',
    text: 'URGENT: Government of India has approved ₹50,000 under PM Relief Scheme for you. Share your Aadhaar OTP and deposit ₹499 registration fee within 2 hours at http://pm-relief-grant.xyz/claim'
  },
  {
    label: '⚠️ Shortened Link Claim',
    text: 'Congratulations! Your free solar water pump is sanctioned. Click bit.ly/pm-kusum-free-pump and enter ATM PIN to activate bank transfer today only.'
  },
  {
    label: '✅ Genuine Gov Announcement',
    text: 'National Scholarship Portal (NSP) applications for Pre-Matric and Post-Matric schemes are open for AY 2026-27. Eligible students can apply on official website https://scholarships.gov.in before 31st October.'
  }
];

const VerifyBenefitPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [claimText, setClaimText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (textToVerify) => {
    const query = textToVerify || claimText;
    if (!query.trim()) return;

    try {
      setAnalyzing(true);
      setError('');
      const res = await API.post('/benefits/verify-message', { message: query });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error('Verification failed', err);
      setError('Unable to analyze message claim.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSampleClick = (sample) => {
    setClaimText(sample.text);
    handleVerify(sample.text);
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
              <ShieldAlert size={18} color="var(--error)" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {t('navVerify')}
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              {t('verifyTitle')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '800px', lineHeight: '1.5' }}>
              {t('verifyDesc')}
            </p>
          </div>

          {/* Input Box */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#fff', display: 'block', marginBottom: '8px' }}>
              {t('pasteLabel')}
            </label>
            <textarea
              rows="4"
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder="Paste suspicious text or claim here... E.g., 'Claim ₹50,000 relief grant by clicking this link...'"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-glow)',
                color: '#fff',
                fontSize: '14px',
                lineHeight: '1.5',
                outline: 'none',
                fontFamily: 'inherit',
                marginBottom: '14px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{t('testSample')}</span>
                {SAMPLE_CLAIMS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleClick(sample)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleVerify()}
                disabled={analyzing || !claimText.trim()}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', opacity: (!claimText.trim() || analyzing) ? 0.6 : 1 }}
              >
                {analyzing ? t('scanning') : t('scanBtn')} <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Verification Results Card */}
          {result && (
            <div className="glass-panel" style={{
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '28px',
              border: `1px solid ${result.indicatorColor}`
            }}>
              {/* Risk Level Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {result.riskLevel === 'HIGH' ? (
                    <ShieldAlert size={36} color="var(--error)" />
                  ) : (result.riskLevel === 'MODERATE' ? (
                    <AlertTriangle size={36} color="var(--warning)" />
                  ) : (
                    <ShieldCheck size={36} color="var(--success)" />
                  ))}

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                      {t('riskAssessment')}
                    </span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', color: result.indicatorColor, margin: 0 }}>
                      {result.riskLevel === 'HIGH' ? t('highRisk') : result.riskLevel === 'MODERATE' ? t('moderateRisk') : t('lowRisk')} ({result.riskScore}/100)
                    </h3>
                  </div>
                </div>

                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Scanned: {new Date(result.verifiedAt).toLocaleTimeString()}
                </span>
              </div>

              {/* Advisory Message */}
              <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: '#fff', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>
                  {result.advisory}
                </p>
              </div>

              {/* Red Flags and Positive Signals Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* Red Flags */}
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--error)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={16} /> {t('redFlagsTitle')} ({result.redFlagsFound?.length || 0})
                  </h4>

                  {result.redFlagsFound?.length === 0 ? (
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>No overt fraud or urgency patterns detected.</p>
                  ) : (
                    <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {result.redFlagsFound?.map((rf, i) => (
                        <li key={i} style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {rf}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Positive Signals */}
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--success)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> {t('positiveSignalsTitle')} ({result.positiveSignals?.length || 0})
                  </h4>

                  {result.positiveSignals?.length === 0 ? (
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>No official .gov.in domain or verified national database matches found.</p>
                  ) : (
                    <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {result.positiveSignals?.map((ps, i) => (
                        <li key={i} style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {ps}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Safety Protocol Tips */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {t('safetyGuidelines')}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {result.safetyTips?.map((tip, idx) => (
                    <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '8px' }}>
                      • {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VerifyBenefitPage;
