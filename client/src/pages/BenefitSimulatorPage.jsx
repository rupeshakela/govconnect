import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import UnifiedItemModal from '../components/UnifiedItemModal';
import { Sliders, Sparkles, AlertCircle, CheckCircle2, TrendingDown, TrendingUp, ExternalLink, RefreshCw, Info } from 'lucide-react';

const OCCUPATIONS = ['Student', 'Farmer', 'Self-Employed / Business', 'Unemployed', 'Salaried Worker', 'Artisan / Craftsman', 'Senior Citizen / Retired', 'Other'];

const CATEGORY_COLORS = {
  Students: '#38bdf8',
  Farmers: '#10b981',
  Women: '#ec4899',
  Startups: '#f59e0b',
  Businesses: '#f59e0b',
  'Senior Citizens': '#818cf8',
  Healthcare: '#14b8a6',
  General: '#94a3b8'
};

const BenefitSimulatorPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [income, setIncome] = useState(250000);
  const [age, setAge] = useState(22);
  const [occupation, setOccupation] = useState('Student');
  const [gender, setGender] = useState('Any');
  const [matchedSchemes, setMatchedSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState(null);

  const handleOccupationChange = (newOcc) => {
    setOccupation(newOcc);
    if (newOcc === 'Student' && age > 30) {
      setAge(22);
    } else if (newOcc === 'Senior Citizen / Retired' && age < 60) {
      setAge(65);
    }
  };

  const runSimulation = async () => {
    try {
      setLoading(true);
      const res = await API.post('/benefits/simulate', {
        annualIncome: Number(income),
        age: Number(age),
        occupation,
        gender
      });

      if (res.data.success) {
        setMatchedSchemes(res.data.data || []);
      }
    } catch (err) {
      console.error('Simulation failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [income, age, occupation, gender]);

  const isStudentOverAge = occupation === 'Student' && age > 35;

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
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid var(--border-glow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sliders size={18} color="var(--warning)" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {t('navSimulator')}
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              {t('simulatorTitle')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '750px', lineHeight: '1.5' }}>
              {t('simulatorDesc')}
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Income Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{t('annualFamilyIncome')}</label>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                    ₹{Number(income).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="1200000"
                  step="25000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>₹50,000 (BPL)</span>
                  <span>₹5,00,000</span>
                  <span>₹12,00,000</span>
                </div>
              </div>

              {/* Age Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{t('citizenAge')}</label>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--success)' }}>
                    {age} {t('cardAgeLimit')}
                  </span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="80"
                  step="1"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--success)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>14 ({t('Student')})</span>
                  <span>45 ({t('Salaried Worker')})</span>
                  <span>80 ({t('Senior Citizen / Retired')})</span>
                </div>
              </div>

              {/* Occupation Selector */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '8px' }}>{t('primaryOccupation')}</label>
                <select
                  value={occupation}
                  onChange={(e) => handleOccupationChange(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                >
                  {OCCUPATIONS.map(o => <option key={o} value={o}>{t(o)}</option>)}
                </select>
              </div>

              {/* Gender Selector */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '8px' }}>{t('beneficiaryGender')}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                >
                  <option value="Any">{t('allCategories')}</option>
                  <option value="Male">{t('male')}</option>
                  <option value="Female">{t('female')}</option>
                </select>
              </div>
            </div>

            {/* Simulation Status Live Ticker */}
            <div style={{
              marginTop: '24px',
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('simulatedProfile')}</span>
                  {loading && (
                    <span style={{ fontSize: '11px', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <RefreshCw size={11} className="animate-spin" /> Updating Real-Time...
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '3px 0 0 0' }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>{t(occupation)}</strong> • {t('citizenAge')} <strong style={{ color: 'var(--success)' }}>{age}</strong> • <strong style={{ color: '#38bdf8' }}>₹{Number(income).toLocaleString()}</strong> • {t(gender)}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('matchingSchemes')}</span>
                <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', minWidth: '40px', textAlign: 'right' }}>
                  {matchedSchemes.length}
                </span>
              </div>
            </div>

            {/* Age mismatch friendly tip */}
            {isStudentOverAge && (
              <div style={{
                marginTop: '14px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12.5px',
                color: '#fde68a'
              }}>
                <Info size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Lifelong Learning Note:</strong> Standard university youth scholarships are generally aimed at ages 14–35. For age {age}, the simulator highlights adult education, solar electrification, housing, and general public welfare benefits.
                </span>
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
                {t('simulatedCount')} ({matchedSchemes.length})
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Sorted by dynamic eligibility match & benefit impact
              </span>
            </div>

            {matchedSchemes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
                <AlertCircle size={32} color="var(--warning)" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {t('noSimulationMatches')}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                  Try adjusting the income or age sliders to see how your eligibility envelope expands.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {matchedSchemes.map((scheme) => {
                  const catColor = CATEGORY_COLORS[scheme.category] || 'var(--accent-primary)';
                  return (
                    <div
                      key={scheme._id}
                      className="glass-card"
                      style={{
                        borderRadius: '14px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        background: 'rgba(15, 23, 42, 0.55)',
                        transition: 'transform 0.2s ease, border-color 0.2s ease'
                      }}
                    >
                      <div>
                        {/* Top Category & Benefit Amount */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{
                            fontSize: '11px',
                            color: catColor,
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            background: `${catColor}18`,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: `1px solid ${catColor}33`
                          }}>
                            {t(scheme.category)}
                          </span>
                          <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '800' }}>
                            {scheme.benefitAmount > 0 ? `₹${scheme.benefitAmount.toLocaleString()}` : scheme.benefitType}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '8px', lineHeight: '1.4' }}>
                          {scheme.name}
                        </h4>

                        {/* Eligibility Snippet */}
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
                          {scheme.eligibilityCriteria?.slice(0, 115)}...
                        </p>

                        {/* Eligibility Criteria Tags */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.04)', color: '#cbd5e1' }}>
                            Age: {scheme.minAge}–{scheme.maxAge} yrs
                          </span>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.04)', color: '#cbd5e1' }}>
                            Income: ≤ ₹{scheme.incomeLimit?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <button
                          onClick={() => setActiveModalItem(scheme)}
                          className="btn-secondary"
                          style={{ flex: 1, fontSize: '12px', padding: '9px', fontWeight: '600' }}
                        >
                          {t('viewFullDetails')}
                        </button>
                        <a
                          href={scheme.officialWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary"
                          style={{ padding: '9px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Official Portal"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <UnifiedItemModal
        item={activeModalItem}
        isOpen={Boolean(activeModalItem)}
        onClose={() => setActiveModalItem(null)}
      />
    </div>
  );
};

export default BenefitSimulatorPage;
