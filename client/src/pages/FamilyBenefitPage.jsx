import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Users, Plus, Trash2, ArrowRight, ShieldCheck, HeartHandshake, Sparkles, ExternalLink } from 'lucide-react';

const RELATIONS = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandparent', 'Other'];
const OCCUPATIONS = ['Farmer', 'Student', 'Self-Employed / Business', 'Unemployed', 'Salaried Worker', 'Artisan / Craftsman', 'Senior Citizen / Retired', 'Homemaker', 'Other'];
const QUALIFICATIONS = ['Below 10th / Literate', '10th Pass', '12th Pass', 'Diploma / ITI', 'Graduate / Degree', 'Post Graduate', 'No Formal Education'];

const FamilyBenefitPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: 'Father',
    age: 45,
    gender: 'Male',
    occupation: 'Farmer',
    qualification: '10th Pass',
    annualIncome: 100000
  });

  const fetchFamilyMap = async () => {
    try {
      setLoading(true);
      const res = await API.get('/benefits/family');
      if (res.data.success) {
        setFamilyData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch family map', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyMap();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await API.post('/benefits/family/member', newMember);
      setShowAddModal(false);
      setNewMember({
        name: '',
        relation: 'Father',
        age: 45,
        gender: 'Male',
        occupation: 'Farmer',
        qualification: '10th Pass',
        annualIncome: 100000
      });
      await fetchFamilyMap();
    } catch (err) {
      console.error('Add family member failed', err);
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      await API.delete(`/benefits/family/member/${id}`);
      await fetchFamilyMap();
    } catch (err) {
      console.error('Delete family member failed', err);
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
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
            border: '1px solid var(--border-glow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Users size={18} color="var(--accent-primary)" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {t('navFamily')}
                  </span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                  {t('familyHeroTitle')}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '750px', lineHeight: '1.5' }}>
                  {t('familyHeroDesc')}
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}
              >
                <Plus size={16} /> {t('addFamilyMember')}
              </button>
            </div>
          </div>

          {/* Collective Family Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            <div className="glass-panel" style={{ borderRadius: '12px', padding: '20px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('registeredFamily')}</span>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>
                {familyData?.totalMembers || 0}
              </h2>
            </div>

            <div className="glass-panel" style={{ borderRadius: '12px', padding: '20px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('collectiveOpportunities')}</span>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)', marginTop: '8px' }}>
                {familyData?.totalCollectiveBenefits || 0} {t('programsFound')}
              </h2>
            </div>
          </div>

          {/* Visual Family Benefit Map Tree */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
              {t('treeTitle')}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {t('treeDesc')}
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>{t('loadingFamily')}</div>
            ) : familyData?.familyBenefitMap?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
                <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>{t('noFamilyYet')}</p>
                <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ fontSize: '13px' }}>
                  {t('addFirstMember')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {familyData?.familyBenefitMap?.map((member) => (
                  <div
                    key={member.memberId}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    {/* Member Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                          {member.relation.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
                              {member.name}
                            </h4>
                            <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                              {t(member.relation)}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            {t('citizenAge')} {member.age} • {t(member.occupation)}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--success)' }}>
                          {member.eligibleCount} {t('matchedOpportunities')}
                        </span>
                        <button
                          onClick={() => handleDeleteMember(member.memberId)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--error)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                          title={t('removeMember')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Top Benefits Discovered */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                      {member.topBenefits?.map((b, idx) => (
                        <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px' }}>
                          <span style={{ fontSize: '10.5px', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                            {t(b.category)}
                          </span>
                          <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: '#fff', margin: '4px 0 6px 0' }}>
                            {t(b.name)}
                          </h5>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                              {b.benefitAmount > 0 ? `₹${b.benefitAmount.toLocaleString()}` : b.benefitType}
                            </span>
                            <a href={b.officialWebsite} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              {t('apply')} <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
              {t('addFamilyMember')}
            </h3>

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('fullNameLabel')}</label>
                <input
                  type="text"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="E.g., Ramesh Sharma"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('relationLabel')}</label>
                  <select
                    value={newMember.relation}
                    onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                  >
                    {RELATIONS.map(r => <option key={r} value={r}>{t(r)}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('ageLabel')}</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    required
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('occupationLabel')}</label>
                  <select
                    value={newMember.occupation}
                    onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                  >
                    {OCCUPATIONS.map(o => <option key={o} value={o}>{t(o)}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('incomeLabel')}</label>
                  <input
                    type="number"
                    value={newMember.annualIncome}
                    onChange={(e) => setNewMember({ ...newMember, annualIncome: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  {t('saveToMap')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyBenefitPage;
