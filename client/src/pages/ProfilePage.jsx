import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { User, ShieldCheck, Mail, Phone, CheckCircle2, Lock, Save, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OCCUPATIONS = [
  'Student',
  'Farmer',
  'Self-Employed / Business',
  'Unemployed',
  'Salaried Worker',
  'Artisan / Craftsman',
  'Senior Citizen / Retired',
  'Other'
];

const QUALIFICATIONS = [
  'Below 10th / Literate',
  '10th Pass',
  '12th Pass',
  'Diploma / ITI',
  'Graduate / Degree',
  'Post Graduate',
  'No Formal Education'
];

const CASTE_CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];
const GENDERS = ['Any', 'Male', 'Female', 'Other'];

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [states, setStates] = useState([]);
  const [profile, setProfile] = useState({
    age: 25,
    gender: 'Male',
    annualIncome: 250000,
    occupation: 'Student',
    qualification: 'Graduate / Degree',
    casteCategory: 'General',
    state: '',
    district: '',
    maritalStatus: 'Single',
    disabilityStatus: false
  });
  const [recommendedCount, setRecommendedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProfileAndStates = async () => {
    try {
      setLoading(true);
      const [profileRes, statesRes] = await Promise.all([
        API.get('/profile'),
        API.get('/portal/states').catch(() => ({ data: { data: [] } }))
      ]);

      if (profileRes.data.data) {
        const p = profileRes.data.data;
        setProfile({
          age: p.age ?? 25,
          gender: p.gender ?? 'Male',
          annualIncome: p.annualIncome ?? 250000,
          occupation: p.occupation ?? 'Student',
          qualification: p.qualification ?? 'Graduate / Degree',
          casteCategory: p.casteCategory ?? 'General',
          state: p.state?._id || p.state || '',
          district: p.district || '',
          maritalStatus: p.maritalStatus ?? 'Single',
          disabilityStatus: p.disabilityStatus ?? false
        });
      }
      setRecommendedCount(profileRes.data.recommendedCount || 0);
      setStates(statesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndStates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    setErrorMessage('');

    try {
      const res = await API.put('/profile', profile);
      setSaveMessage(t('profileUpdatedSuccess'));
      setRecommendedCount(res.data.recommendedCount || 0);
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar user={user} onLogout={logout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Navbar user={user} />
        <main style={{ flex: 1, padding: '36px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '24px' }}>
          {t('profileTitle')}
        </h1>

        {/* Profile Card Header */}
        <div className="glass-panel" style={{ borderRadius: '16px', padding: '28px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 'bold', color: '#fff', boxShadow: 'var(--accent-glow)' }}>
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>{user?.fullName}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '2px' }}>
                {t('navVerifiedCitizen')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '12px 18px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{t('matchedOpportunities')}</span>
              <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)' }}>{recommendedCount}</p>
            </div>

            <Link to="/recommended" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}>
                <Sparkles size={16} />
                <span>{t('viewFullDetails')}</span>
              </button>
            </Link>
          </div>
        </div>

        {saveMessage && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: '#fff', padding: '14px 18px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
            <CheckCircle2 size={18} color="var(--success)" />
            <span>{saveMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--error)', color: '#fff', padding: '14px 18px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
            <AlertCircle size={18} color="var(--error)" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '28px' }}>
          {/* Eligibility Parameters Form */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '28px', gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <Sparkles color="var(--accent-primary)" size={22} />
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#fff' }}>{t('eligibilityParameters')}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('profileSubtitle')}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {/* Age */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('citizenAge')}</label>
                <input
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleInputChange}
                  min="0"
                  max="120"
                  required
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {/* Gender */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('beneficiaryGender')}</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="Male">{t('male')}</option>
                  <option value="Female">{t('female')}</option>
                  <option value="Other">{t('other')}</option>
                </select>
              </div>

              {/* Annual Family Income */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('annualFamilyIncome')}</label>
                <input
                  type="number"
                  name="annualIncome"
                  value={profile.annualIncome}
                  onChange={handleInputChange}
                  min="0"
                  step="10000"
                  required
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {/* Occupation */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('primaryOccupation')}</label>
                <select
                  name="occupation"
                  value={profile.occupation}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                >
                  {OCCUPATIONS.map((occ) => <option key={occ} value={occ}>{t(occ)}</option>)}
                </select>
              </div>

              {/* Qualification */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('qualificationLabel')}</label>
                <select
                  name="qualification"
                  value={profile.qualification}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                >
                  {QUALIFICATIONS.map((q) => <option key={q} value={q}>{t(q)}</option>)}
                </select>
              </div>

              {/* Caste Category */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('casteCategory')}</label>
                <select
                  name="casteCategory"
                  value={profile.casteCategory}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                >
                  {CASTE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* State */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('allStates')}</label>
                <select
                  name="state"
                  value={profile.state}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">{t('allStates')}</option>
                  {states.map((st) => (
                    <option key={st._id} value={st._id}>{st.name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>District / City</label>
                <input
                  type="text"
                  name="district"
                  placeholder="e.g. Pune, Patna, Lucknow, Bengaluru"
                  value={profile.district || ''}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {/* Disability Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '28px' }}>
                <input
                  type="checkbox"
                  id="disabilityStatus"
                  name="disabilityStatus"
                  checked={profile.disabilityStatus}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="disabilityStatus" style={{ fontSize: '14px', color: '#fff', cursor: 'pointer' }}>
                  {t('disabilityStatus')}
                </label>
              </div>

              {/* Submit Button */}
              <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                >
                  <Save size={16} />
                  <span>{saving ? t('saving') : t('saveChanges')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Account Security Card */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <ShieldCheck color="var(--success)" size={22} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Dual OTP Security</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={18} color="var(--text-muted)" />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Registered Email</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email}</p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Verified
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={18} color="var(--text-muted)" />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Mobile Phone</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.phone}</p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default ProfilePage;
