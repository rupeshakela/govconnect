import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  FileText, Download, Loader2, CheckCircle2, XCircle,
  User, MapPin, Briefcase, GraduationCap, IndianRupee,
  Phone, ExternalLink, ShieldCheck, RefreshCw, Printer,
  AlertCircle, Star, Calendar, Edit3, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------- helpers ----------
const formatCurrency = (n) =>
  n >= 100000
    ? `\u20b9${(n / 100000).toFixed(1)} Lakh`
    : n >= 1000
    ? `\u20b9${(n / 1000).toFixed(0)}K`
    : `\u20b9${n}`;

const today = () => {
  const d = new Date();
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
};

const YojanaParchiPage = () => {
  const { user, logout } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const [updatingDoc, setUpdatingDoc] = useState('');
  const [error, setError] = useState('');
  const printRef = useRef(null);

  const fetchParchi = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/benefits/yojana-parchi');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        setError('Failed to load citizen benefit dossier.');
      }
    } catch (err) {
      console.error('Yojana Parchi fetch failed:', err);
      setError(err.response?.data?.message || 'Server se data fetch karne me dikkat aayi. Kripya refresh karein.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParchi();
  }, []);

  const handleToggleDoc = async (docName, currentStatus) => {
    const newStatus = currentStatus === 'Available' ? 'Missing' : 'Available';
    try {
      setUpdatingDoc(docName);
      await API.put('/benefits/document-checklist', {
        docName,
        status: newStatus
      });

      // Update local state and recalculate dynamic score
      setData(prev => {
        if (!prev) return prev;
        const updatedChecklist = prev.docChecklist.map(d =>
          d.name === docName ? { ...d, status: newStatus } : d
        );
        const availCount = updatedChecklist.filter(d => d.status === 'Available').length;
        const total = updatedChecklist.length || 1;
        const docScore = Math.round((availCount / total) * 35);
        const baseScore = 20 + (prev.verificationStatus?.isOtpVerified ? 15 : 0) + (prev.profile.annualIncome > 0 ? 10 : 0) + (prev.profile.state !== 'Not Set' ? 10 : 0);
        const newScore = Math.min(Math.max(baseScore + docScore, 15), 100);

        return {
          ...prev,
          docChecklist: updatedChecklist,
          readinessScore: newScore,
          verificationStatus: {
            ...prev.verificationStatus,
            badgeText: availCount >= 5 ? 'Self-Declared (Docs Ready)' : availCount > 0 ? 'In-Progress (Partial Docs)' : 'Self-Declared (Docs Pending)'
          }
        };
      });
    } catch (err) {
      console.error('Failed to update document status:', err);
    } finally {
      setUpdatingDoc('');
    }
  };

  const handleDownloadPDF = async () => {
    if (!data) return;
    setGenerating(true);
    setPdfDone(false);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      let y = 0;

      const addPageIfNeeded = (needed = 20) => {
        if (y + needed > 275) { doc.addPage(); y = 15; }
      };

      // Header Band
      doc.setFillColor(10, 15, 40);
      doc.rect(0, 0, W, 38, 'F');
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 36, W, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('YOJANA PARCHI', 14, 16);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 180, 220);
      doc.text('Citizen Benefit Dossier  -  BenefitOS Portal  -  Government of India', 14, 24);
      doc.text(`Generated: ${today()}   |   Citizen: ${data.citizen.email || 'N/A'}`, 14, 31);
      doc.setTextColor(160, 220, 160);
      doc.setFontSize(8);
      doc.text(data.verificationStatus?.badgeText || 'Self-Declared Dossier', W - 14, 16, { align: 'right' });
      doc.setTextColor(180, 180, 220);
      doc.text('Readiness Score:', W - 14, 23, { align: 'right' });
      doc.setTextColor(99, 255, 180);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${data.readinessScore}%`, W - 14, 31, { align: 'right' });
      y = 46;

      // Section: Citizen Profile
      doc.setFillColor(20, 28, 58);
      doc.roundedRect(10, y, W - 20, 7, 2, 2, 'F');
      doc.setTextColor(200, 210, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('  CITIZEN PROFILE', 14, y + 5);
      y += 12;

      const p = data.profile;
      const profileRows = [
        ['Full Name',        data.citizen.fullName || '-'],
        ['Age / Gender',     `${p.age} Yrs  |  ${p.gender}`],
        ['Occupation',       p.occupation],
        ['Qualification',    p.qualification],
        ['Annual Income',    formatCurrency(p.annualIncome)],
        ['Caste Category',   p.casteCategory],
        ['State / District', `${p.state}  /  ${p.district}`],
        ['Marital Status',   p.maritalStatus],
        ['Disability',       p.disabilityStatus ? 'Yes' : 'No'],
        ['Contact',          data.citizen.phone || data.citizen.email || '-'],
      ];

      doc.setFontSize(8.5);
      const colX = [14, 70];
      profileRows.forEach(([label, val], i) => {
        const rowY = y + i * 7.5;
        if (i % 2 === 0) {
          doc.setFillColor(18, 24, 48);
          doc.rect(10, rowY - 4, W - 20, 7.5, 'F');
        }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(140, 150, 200);
        doc.text(label, colX[0], rowY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(230, 235, 255);
        doc.text(String(val), colX[1], rowY);
      });
      y += profileRows.length * 7.5 + 10;
      addPageIfNeeded(40);

      // Section: Top Eligible Schemes
      doc.setFillColor(20, 28, 58);
      doc.roundedRect(10, y, W - 20, 7, 2, 2, 'F');
      doc.setTextColor(200, 210, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`  TOP ${data.topSchemes.length} ELIGIBLE GOVERNMENT SCHEMES`, 14, y + 5);
      y += 12;

      if (data.topSchemes.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(180, 180, 180);
        doc.setFontSize(8.5);
        doc.text('No schemes matched. Please complete your profile for recommendations.', 14, y);
        y += 10;
      } else {
        data.topSchemes.forEach((s, i) => {
          addPageIfNeeded(32);
          doc.setFillColor(15, 22, 45);
          doc.roundedRect(10, y, W - 20, 30, 2, 2, 'F');
          doc.setFillColor(99, 102, 241);
          doc.roundedRect(10, y, 5, 30, 2, 0, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(230, 235, 255);
          doc.setFontSize(9);
          doc.text(`${i + 1}. ${s.name}`, 18, y + 7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(140, 150, 200);
          doc.setFontSize(7.5);
          doc.text(`Category: ${s.category}   |   Benefit: ${s.benefitType}`, 18, y + 14);
          doc.text(`Amount: ${s.benefitAmount > 0 ? formatCurrency(s.benefitAmount) : 'Non-monetary'}   |   Status: ${s.applicationWindow}`, 18, y + 20);
          doc.setTextColor(99, 180, 255);
          const urlText = `Portal: ${s.officialWebsite}`;
          doc.text(urlText.length > 68 ? urlText.slice(0, 65) + '...' : urlText, 18, y + 26);
          y += 34;
        });
      }
      addPageIfNeeded(10);
      y += 4;

      // Section: Document Checklist
      doc.setFillColor(20, 28, 58);
      doc.roundedRect(10, y, W - 20, 7, 2, 2, 'F');
      doc.setTextColor(200, 210, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('  DOCUMENT CHECKLIST', 14, y + 5);
      y += 12;

      data.docChecklist.forEach((d_, i) => {
        addPageIfNeeded(8);
        const rowY = y + i * 7.5;
        if (i % 2 === 0) {
          doc.setFillColor(18, 24, 48);
          doc.rect(10, rowY - 4, W - 20, 7.5, 'F');
        }
        const isAvail = d_.status === 'Available';
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(isAvail ? 100 : 239, isAvail ? 200 : 68, isAvail ? 130 : 68);
        doc.text(isAvail ? '(OK)' : '(X)', 14, rowY);
        doc.setTextColor(230, 235, 255);
        doc.text(d_.name, 28, rowY);
        doc.setTextColor(isAvail ? 100 : 239, isAvail ? 200 : 80, isAvail ? 130 : 80);
        doc.text(d_.status, W - 14, rowY, { align: 'right' });
      });
      y += data.docChecklist.length * 7.5 + 10;
      addPageIfNeeded(40);

      // Section: Helplines
      doc.setFillColor(20, 28, 58);
      doc.roundedRect(10, y, W - 20, 7, 2, 2, 'F');
      doc.setTextColor(200, 210, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('  OFFICIAL GOVERNMENT HELPLINES', 14, y + 5);
      y += 12;

      data.helplines.forEach((h, i) => {
        addPageIfNeeded(8);
        const rowY = y + i * 7.5;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(160, 180, 255);
        doc.setFontSize(8);
        doc.text(h.number, 14, rowY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(200, 210, 230);
        doc.text(h.name, 55, rowY);
      });

      // Footer on every page
      const pages = doc.internal.getNumberOfPages();
      for (let pg = 1; pg <= pages; pg++) {
        doc.setPage(pg);
        doc.setFillColor(10, 15, 40);
        doc.rect(0, 285, W, 15, 'F');
        doc.setFontSize(7);
        doc.setTextColor(120, 130, 180);
        doc.text('BenefitOS - Govt. of India Citizen Welfare Intelligence Portal', W / 2, 291, { align: 'center' });
        doc.text(`Page ${pg} of ${pages}`, W - 14, 291, { align: 'right' });
        doc.text('Advisory use only. Not an official government document.', 14, 291);
      }

      doc.save(`Yojana_Parchi_${(data.citizen.fullName || 'Citizen').replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
      setPdfDone(true);
      setTimeout(() => setPdfDone(false), 4000);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar user={user} onLogout={logout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Navbar user={user} />
        <main style={{ padding: '28px', flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto' }}>

          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{
              borderRadius: '18px', padding: '28px', marginBottom: '28px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(16,185,129,0.12) 100%)',
              border: '1px solid rgba(99,102,241,0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FileText size={18} color="var(--accent-primary)" />
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                BenefitOS  •  Yojana Parchi Generator
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
              📄 Apni <span className="gradient-text">Yojana Parchi</span> Download Karein
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '720px', lineHeight: '1.6', marginBottom: '20px' }}>
              Apna <strong style={{ color: '#fff' }}>official citizen benefit dossier</strong> — jisme aapki profile, top eligible schemes, document checklist aur government helplines hain. CSC ya Pradhan ke paas le jayein!
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDownloadPDF}
                disabled={!data || generating || loading}
                id="yojana-parchi-download-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: !data || generating || loading
                    ? 'rgba(99,102,241,0.3)'
                    : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  border: 'none', borderRadius: '12px', padding: '13px 24px',
                  color: '#fff', fontWeight: '800', fontSize: '14px',
                  cursor: !data || generating || loading ? 'not-allowed' : 'pointer',
                  boxShadow: data ? '0 0 28px rgba(99,102,241,0.4)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {generating ? (
                  <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating PDF...</>
                ) : pdfDone ? (
                  <><CheckCircle2 size={18} color="#10b981" /> Downloaded!</>
                ) : (
                  <><Download size={18} /> Download Yojana Parchi PDF</>
                )}
              </motion.button>

              <button onClick={() => window.print()} disabled={!data || loading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 18px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', cursor: !data || loading ? 'not-allowed' : 'pointer' }}
              >
                <Printer size={16} /> Print Preview
              </button>

              <button onClick={fetchParchi}
                style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '10px 12px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </motion.div>

          {error && (
            <div className="glass-panel" style={{ borderRadius: '14px', padding: '20px', marginBottom: '24px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertCircle size={20} color="var(--error)" />
              <span style={{ color: '#fff', fontSize: '14px' }}>{error}</span>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Loader2 size={40} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading your benefit dossier...</p>
            </div>
          )}

          {!loading && data && (
            <AnimatePresence>
              <motion.div
                ref={printRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'grid', gap: '20px' }}
              >
                {/* Row 1: Profile + Score */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {/* Citizen Profile Card */}
                  <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={24} color="#fff" />
                        </div>
                        <div>
                          <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: 0 }}>{data.citizen.fullName}</h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: data.docChecklist.filter(d => d.status === 'Available').length >= 5 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                              color: data.docChecklist.filter(d => d.status === 'Available').length >= 5 ? 'var(--success)' : 'var(--warning)',
                              border: `1px solid ${data.docChecklist.filter(d => d.status === 'Available').length >= 5 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                            }}>
                              {data.verificationStatus?.badgeText || 'Self-Declared Profile'}
                            </span>
                            {data.verificationStatus?.isOtpVerified && (
                              <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '600' }}>• OTP Verified</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link to="/profile" style={{ textDecoration: 'none' }}>
                        <button style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glow)',
                          color: 'var(--accent-primary)', padding: '6px 12px', borderRadius: '8px',
                          fontSize: '11.5px', fontWeight: '700', cursor: 'pointer'
                        }}>
                          <Edit3 size={13} /> Edit Profile
                        </button>
                      </Link>
                    </div>

                    {[
                      [Briefcase, 'Occupation', data.profile.occupation || 'Not Specified'],
                      [GraduationCap, 'Qualification', data.profile.qualification || 'Not Specified'],
                      [IndianRupee, 'Annual Income', formatCurrency(data.profile.annualIncome)],
                      [MapPin, 'State / District', data.profile.state && data.profile.state !== 'Not Set' ? `${data.profile.state} / ${data.profile.district || 'Any'}` : 'Not Set (Click Edit Profile)'],
                      [User, 'Category', `${data.profile.casteCategory || 'General'} • ${data.profile.gender || 'Any'} • ${data.profile.age} yrs`],
                    ].map(([Icon, label, val], i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-muted)', fontSize: '12px' }}><Icon size={13} /> {label}</span>
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: val.includes('Not Set') ? 'var(--warning)' : '#fff' }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Score + Quick Stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.12) 100%)', border: '1px solid rgba(16,185,129,0.3)', flex: 1 }}>
                      <ShieldCheck size={32} color="var(--success)" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '50px', fontWeight: '900', color: 'var(--success)', lineHeight: 1 }}>
                        {data.readinessScore}<span style={{ fontSize: '22px' }}>%</span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: '700' }}>Benefit Readiness Score</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Calculated dynamically from Profile Completeness + Documents in Hand
                      </div>
                    </div>
                    <div className="glass-panel" style={{ borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                      {[
                        [data.topSchemes.length, 'Eligible Schemes', 'var(--accent-primary)'],
                        [data.docChecklist.filter(d => d.status === 'Available').length, 'Docs Ready', 'var(--success)'],
                        [data.docChecklist.filter(d => d.status !== 'Available').length, 'Docs Missing', 'var(--error)'],
                      ].map(([num, label, color], i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '28px', fontWeight: '900', color }}>{num}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Honest Transparency Notice */}
                <div style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)'
                }}>
                  <AlertCircle size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: '#fff' }}>Transparent Citizen Verification:</strong> BenefitOS ek AI-assisted guidance portal hai. Yeh report aapke dwara darj kiye gaye data ke aadhar par banti hai. Official government benefits ke liye CSC Kendra par biometric e-KYC hona avashyak hai.
                  </span>
                </div>

                {/* Top Eligible Schemes */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={16} color="#f59e0b" fill="#f59e0b" /> Top Eligible Schemes for You
                  </h3>
                  {data.topSchemes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '28px' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>
                        Personalized schemes match karne ke liye apni profile complete karein.
                      </p>
                      <Link to="/profile">
                        <button className="btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                          Complete Profile Now
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {data.topSchemes.map((s, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ x: 4 }}
                          style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}
                        >
                          <div style={{ minWidth: '32px', height: '32px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '13px', flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '700', color: '#fff', fontSize: '13px', marginBottom: '4px' }}>{s.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ background: 'rgba(99,102,241,0.2)', padding: '2px 7px', borderRadius: '5px', color: 'var(--accent-primary)' }}>{s.category}</span>
                              <span>{s.benefitAmount > 0 ? formatCurrency(s.benefitAmount) : s.benefitType}</span>
                              <span style={{ color: s.applicationWindow === 'Open Now' ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Calendar size={11} />{s.applicationWindow}
                              </span>
                            </div>
                          </div>
                          <a href={s.officialWebsite} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }}>
                            <ExternalLink size={14} />
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interactive Document Checklist */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} color="var(--success)" /> Document Checklist (Click to Toggle Status)
                      </h3>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                        Jo documents aapke paas physical ya DigiLocker me hain, unhe toggle karein. Readiness score turant update hoga!
                      </p>
                    </div>

                    <Link to="/doc-checker" style={{ textDecoration: 'none' }}>
                      <button style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                        color: 'var(--success)', padding: '6px 12px', borderRadius: '8px',
                        fontSize: '11.5px', fontWeight: '700', cursor: 'pointer'
                      }}>
                        <Sparkles size={13} /> Check OCR Mismatch
                      </button>
                    </Link>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {data.docChecklist.map((doc, i) => {
                      const ok = doc.status === 'Available';
                      const isUpdating = updatingDoc === doc.name;

                      return (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            background: ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                            borderRadius: '12px',
                            border: `1px solid ${ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            {ok ? (
                              <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                            ) : (
                              <XCircle size={18} color="var(--error)" style={{ flexShrink: 0 }} />
                            )}
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: '12.5px', color: '#fff', fontWeight: '600', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {doc.name}
                              </span>
                              <span style={{ fontSize: '10px', fontWeight: '700', color: ok ? 'var(--success)' : 'var(--error)' }}>
                                {ok ? 'Ready in Hand' : 'Missing / Not Uploaded'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleDoc(doc.name, doc.status)}
                            disabled={isUpdating}
                            title="Click to toggle availability"
                            style={{
                              background: ok ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.18)',
                              border: `1px solid ${ok ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                              color: ok ? 'var(--error)' : 'var(--success)',
                              borderRadius: '7px',
                              padding: '5px 9px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: isUpdating ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0,
                              marginLeft: '8px'
                            }}
                          >
                            {isUpdating ? (
                              <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : ok ? (
                              'Mark Missing'
                            ) : (
                              'Mark Ready'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Helplines */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} color="var(--accent-primary)" /> Official Government Helplines
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                    {data.helplines.map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Phone size={14} color="var(--accent-primary)" />
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{h.name}</div>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '0.5px' }}>{h.number}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.08)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.2)', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <strong style={{ color: 'var(--warning)' }}>⚠ Advisory Notice:</strong> Yeh Yojana Parchi BenefitOS dwara generate kiya gaya ek AI-assisted summary hai. Yeh official government document NAHI hai. Apply karne se pehle official government portals par eligibility verify karein.
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
};

export default YojanaParchiPage;
