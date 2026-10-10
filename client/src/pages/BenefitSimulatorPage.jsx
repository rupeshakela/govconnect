import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SchemeModal from '../components/SchemeModal';
import { Sliders, Sparkles, AlertCircle, CheckCircle2, TrendingDown, TrendingUp, ExternalLink } from 'lucide-react';

const OCCUPATIONS = ['Student', 'Farmer', 'Self-Employed / Business', 'Unemployed', 'Salaried Worker', 'Artisan / Craftsman', 'Senior Citizen / Retired', 'Other'];

const BenefitSimulatorPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [income, setIncome] = useState(250000);
  const [age, setAge] = useState(22);
  const [occupation, setOccupation] = useState('Student');
  const [gender, setGender] = useState('Any');
  const [matchedSchemes, setMatchedSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSchemeModal, setActiveSchemeModal] = useState(null);

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
                  onChange={(e) => setOccupation(e.target.value)}
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
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('simulatedProfile')}</span>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '2px 0 0 0' }}>
                  {t(occupation)} • {t('citizenAge')} {age} • ₹{Number(income).toLocaleString()} • {t(gender)}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('matchingSchemes')}</span>
                <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                  {matchedSchemes.length}
                </span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
              {t('simulatedCount')} ({matchedSchemes.length})
            </h3>

            {matchedSchemes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
                <AlertCircle size={32} color="var(--warning)" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {t('noSimulationMatches')}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {matchedSchemes.map((scheme) => (
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                          {t(scheme.category)}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--success)', fontWeight: '700' }}>
                          {scheme.benefitAmount > 0 ? `₹${scheme.benefitAmount.toLocaleString()}` : scheme.benefitType}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                        {scheme.name}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '12px' }}>
                        {scheme.eligibilityCriteria?.slice(0, 110)}...
                      </p>

                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {t('cardIncomeLimit')}: ₹{scheme.incomeLimit?.toLocaleString()} • {t('cardAgeLimit')}: {scheme.minAge}-{scheme.maxAge} yrs
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                      <button
                        onClick={() => setActiveSchemeModal(scheme)}
                        className="btn-secondary"
                        style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                      >
                        {t('viewFullDetails')}
                      </button>
                      <a
                        href={scheme.officialWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default BenefitSimulatorPage;
