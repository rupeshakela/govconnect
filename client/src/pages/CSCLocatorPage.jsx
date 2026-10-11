import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  MapPin, Search, Phone, Clock, Star, ExternalLink,
  Shield, AlertTriangle, IndianRupee, RefreshCw, Info,
  CheckCircle2, ChevronDown, Building2, Loader2, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATES = [
  'All', 'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'West Bengal'
];

const CSCLocatorPage = () => {
  const { user, logout } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [activeTab, setActiveTab] = useState('locator'); // 'locator' | 'rates'
  const [selectedCSC, setSelectedCSC] = useState(null);

  // Filters
  const [filterState, setFilterState] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterPincode, setFilterPincode] = useState('');
  const [filterService, setFilterService] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const fetchCSC = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterState !== 'All') params.set('state', filterState);
      if (filterDistrict.trim()) params.set('district', filterDistrict.trim());
      if (filterPincode.trim()) params.set('pincode', filterPincode.trim());

      const res = await API.get(`/benefits/csc-locator?${params.toString()}`);
      if (res.data.success) {
        let data = res.data.data;
        // client-side service filter
        if (filterService.trim()) {
          data = data.filter(c =>
            c.services.some(s => s.toLowerCase().includes(filterService.toLowerCase()))
          );
        }
        setResults(data);
        setRates(res.data.officialRates || []);
        setTotalCount(data.length);
        setSearchDone(true);
      }
    } catch (err) {
      console.error('CSC Locator error:', err);
    } finally {
      setLoading(false);
    }
  }, [filterState, filterDistrict, filterPincode, filterService]);

  // Load all on mount
  useEffect(() => { fetchCSC(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCSC();
  };

  const getRatingColor = (r) =>
    r >= 4.3 ? 'var(--success)' : r >= 3.8 ? 'var(--warning)' : 'var(--error)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar user={user} onLogout={logout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Navbar user={user} />
        <main style={{ padding: '28px', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>

          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{
              borderRadius: '18px', padding: '28px', marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(99,102,241,0.12) 100%)',
              border: '1px solid rgba(16,185,129,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <MapPin size={18} color="var(--success)" />
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                BenefitOS  •  Jan Seva Kendra Locator
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
              🏛️ Nearest <span className="gradient-text">Jan Seva Kendra</span> Dhundhein
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '800px', lineHeight: '1.6', marginBottom: '16px' }}>
              Apne district ya pincode se nearest <strong style={{ color: '#fff' }}>Common Service Center (CSC)</strong> ya <strong style={{ color: '#fff' }}>Akshaya e-Centre</strong> dhundhein — official service rates ke saath taaki aapse zyada charge na ho.
            </p>

            {/* Scam Alert */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 16px', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.25)', maxWidth: '800px' }}>
              <AlertTriangle size={16} color="var(--error)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '12px', color: '#fff', lineHeight: '1.5' }}>
                <strong style={{ color: 'var(--error)' }}>Overcharge Alert:</strong> Aadhaar enrollment FREE hai, PAN Card max ₹107 — isse zyada charge karo toh <a href="https://www.csc.gov.in/grievance" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>CSC.gov.in/grievance</a> par complaint karein.
              </span>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
            {[
              { id: 'locator', label: '📍 CSC Locator', icon: MapPin },
              { id: 'rates', label: '💰 Official Rate Card', icon: IndianRupee },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '9px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontWeight: '700', fontSize: '13px', transition: 'all 0.2s',
                  background: activeTab === tab.id ? 'var(--accent-gradient)' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                  boxShadow: activeTab === tab.id ? '0 0 20px rgba(99,102,241,0.3)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab: CSC Locator ── */}
          {activeTab === 'locator' && (
            <div>
              {/* Search Filters */}
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSearch}
                className="glass-panel"
                style={{ borderRadius: '16px', padding: '22px', marginBottom: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Filter size={15} color="var(--accent-primary)" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>Filter Jan Seva Kendras</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  {/* State Selector */}
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>State / Rajya</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={filterState}
                        onChange={e => setFilterState(e.target.value)}
                        style={{ width: '100%', padding: '10px 32px 10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                      >
                        {STATES.map(s => <option key={s} value={s} style={{ background: '#111827' }}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* District */}
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>District / Jila (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Lucknow, Pune..."
                      value={filterDistrict}
                      onChange={e => setFilterDistrict(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>PIN Code (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 226001"
                      value={filterPincode}
                      onChange={e => setFilterPincode(e.target.value)}
                      maxLength={6}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  {/* Service Filter */}
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Service Needed (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Aadhaar, PAN, Passport..."
                      value={filterService}
                      onChange={e => setFilterService(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-gradient)', border: 'none', borderRadius: '10px', padding: '11px 22px', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: loading ? 'wait' : 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
                  >
                    {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={15} />}
                    {loading ? 'Searching...' : 'Search Jan Seva Kendras'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => { setFilterState('All'); setFilterDistrict(''); setFilterPincode(''); setFilterService(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '10px 16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                  >
                    <RefreshCw size={13} /> Reset
                  </button>
                </div>
              </motion.form>

              {/* Results Count */}
              {searchDone && (
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>{totalCount}</strong> Jan Seva Kendra{totalCount !== 1 ? 's' : ''} mile
                    {filterState !== 'All' && <> in <strong style={{ color: 'var(--accent-primary)' }}>{filterState}</strong></>}
                    {filterDistrict && <>, <strong style={{ color: 'var(--accent-primary)' }}>{filterDistrict}</strong></>}
                  </span>
                  <a href="https://www.csc.gov.in" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    <ExternalLink size={12} /> Official CSC Portal
                  </a>
                </div>
              )}

              {/* CSC Cards Grid */}
              {loading && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Searching nearby Jan Seva Kendras...</p>
                </div>
              )}

              {!loading && searchDone && results.length === 0 && (
                <div className="glass-panel" style={{ borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
                  <MapPin size={40} color="var(--text-muted)" style={{ margin: '0 auto 14px', display: 'block' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Is area mein koi CSC nahi mila. District ya pincode change karein, ya <a href="https://www.csc.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>official CSC portal</a> par dhundhen.
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
                <AnimatePresence>
                  {!loading && results.map((csc, i) => (
                    <motion.div
                      key={csc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedCSC(csc)}
                      className="glass-card"
                      style={{ borderRadius: '14px', padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                    >
                      {/* Accent glow stripe */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--accent-gradient)', borderRadius: '14px 14px 0 0' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(99,102,241,0.2) 100%)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building2 size={18} color="var(--success)" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: '#fff', marginBottom: '3px', lineHeight: '1.3' }}>{csc.name}</h3>
                            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{csc.state} • {csc.district}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px', flexShrink: 0 }}>
                          <Star size={12} color={getRatingColor(csc.rating)} fill={getRatingColor(csc.rating)} />
                          <span style={{ fontSize: '12px', fontWeight: '800', color: getRatingColor(csc.rating) }}>{csc.rating}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <MapPin size={12} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{csc.address}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <Phone size={11} color="var(--success)" />
                          <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>{csc.contact}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <Clock size={11} color="var(--text-muted)" />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{csc.timings}</span>
                        </div>
                      </div>

                      {/* Service Tags */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {csc.services.map((s, j) => (
                          <span key={j} style={{ fontSize: '9.5px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.2)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Disclaimer */}
              {searchDone && (
                <div style={{ marginTop: '24px', padding: '14px 18px', background: 'rgba(99,102,241,0.08)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <Info size={13} color="var(--accent-primary)" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  <strong style={{ color: 'var(--accent-primary)' }}>Note:</strong> Yeh data CSC India network ka representative sample hai. Official aur updated locator ke liye{' '}
                  <a href="https://www.csc.gov.in/services/locateCSC" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>csc.gov.in/services/locateCSC</a> visit karein.
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Official Rate Card ── */}
          {activeTab === 'rates' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Shield size={20} color="var(--success)" />
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>Official Government Service Rate Card</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                  Yeh rates GoI circulars aur UIDAI notifications ke anusaar hain. Agar CSC operator isse zyada charge kare toh <strong style={{ color: '#fff' }}>complaint karein</strong>.
                </p>
              </div>

              <div style={{ display: 'grid', gap: '2px' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '12px', padding: '10px 16px', background: 'rgba(99,102,241,0.15)', borderRadius: '10px 10px 0 0', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Service</span>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Official Fee</span>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Note</span>
                </div>
                {rates.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Loader2 size={24} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '13px' }}>Rate card load ho raha hai...</p>
                  </div>
                ) : (
                  rates.map((r, i) => {
                    const isFree = r.fee.includes('FREE');
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ x: 4 }}
                        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '12px', padding: '13px 16px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.005)', borderRadius: '8px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={13} color={isFree ? 'var(--success)' : 'var(--warning)'} />
                          <span style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>{r.service}</span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: isFree ? 'var(--success)' : 'var(--warning)' }}>{r.fee}</span>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{r.note}</span>
                      </motion.div>
                    );
                  })
                )}
              </div>

              <div style={{ marginTop: '20px', padding: '16px 18px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertTriangle size={16} color="var(--error)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '13px', color: '#fff', fontWeight: '700', marginBottom: '6px' }}>Overcharge hone par kya karein?</p>
                    <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '16px' }}>
                      <li>Receipt lein — CSC operator ko receipt deni hoti hai</li>
                      <li>Operator ka CSC ID ya naam note karein</li>
                      <li>Complaint: <a href="https://www.csc.gov.in/grievance" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>csc.gov.in/grievance</a></li>
                      <li>Helpline: <strong style={{ color: '#fff' }}>1800-3000-3468</strong> (CSC Toll-Free)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CSC Detail Modal */}
          <AnimatePresence>
            {selectedCSC && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCSC(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="glass-panel"
                  style={{ borderRadius: '20px', padding: '32px', maxWidth: '520px', width: '100%', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(99,102,241,0.25) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={24} color="var(--success)" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{selectedCSC.name}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Star size={13} color={getRatingColor(selectedCSC.rating)} fill={getRatingColor(selectedCSC.rating)} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: getRatingColor(selectedCSC.rating) }}>{selectedCSC.rating} / 5</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• CSC ID: {selectedCSC.id}</span>
                      </div>
                    </div>
                  </div>

                  {[
                    [MapPin, 'Address', selectedCSC.address],
                    [MapPin, 'PIN Code', selectedCSC.pincode],
                    [Phone, 'Contact', selectedCSC.contact],
                    [Clock, 'Timings', selectedCSC.timings],
                  ].map(([Icon, label, val], i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'flex-start' }}>
                      <Icon size={14} color="var(--text-muted)" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '2px' }}>{label}</div>
                        <div style={{ fontSize: '13.5px', color: '#fff', fontWeight: '600' }}>{val}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>SERVICES AVAILABLE</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {selectedCSC.services.map((s, j) => (
                        <span key={j} style={{ fontSize: '11px', fontWeight: '700', padding: '5px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                      onClick={() => setSelectedCSC(null)}
                      style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Close
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(selectedCSC.address)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', background: 'var(--accent-gradient)', borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}
                    >
                      <MapPin size={14} /> Google Maps par Dhundhen
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
};

export default CSCLocatorPage;
