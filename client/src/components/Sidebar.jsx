import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  Briefcase, 
  Bookmark, 
  User, 
  LogOut, 
  ShieldCheck, 
  Sliders, 
  ShieldAlert, 
  BarChart3,
  X,
  FileDown,
  MapPin,
  ScanLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = ({ user, onLogout }) => {
  const { t } = useLanguage();
  const { isOpen, closeSidebar } = useSidebar();

  const navItems = [
    { to: '/dashboard', label: t('navCockpit'), icon: LayoutDashboard },
    { to: '/simulator', label: t('navSimulator'), icon: Sliders, badge: t('badgeWhatIf') },
    { to: '/verify', label: t('navVerify'), icon: ShieldAlert, badge: t('badgeSafety') },
    { to: '/recommended', label: t('navRecommended'), icon: Sparkles, badge: t('badgeAI') },
    { to: '/jobs-exams', label: t('navJobsExams'), icon: Briefcase },
    { to: '/saved', label: t('navSaved'), icon: Bookmark },
    { to: '/impact', label: t('navImpact'), icon: BarChart3, badge: t('badgeDemo') },
    { to: '/profile', label: t('navProfile'), icon: User },
    // ── New Features ──
    { to: '/yojana-parchi', label: t('navYojanaParchi', '📄 1-Click Yojana Parchi'), icon: FileDown, badge: 'NEW' },
    { to: '/csc-locator', label: t('navCSCLocator', '🏛️ CSC / Jan Seva Kendra'), icon: MapPin, badge: 'NEW' },
    { to: '/doc-checker', label: t('navDocChecker', '📋 Doc Verification & Audit'), icon: ScanLine, badge: 'NEW' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay: Click outside to dismiss sidebar */}
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              zIndex: 998,
            }}
          />

          {/* Slide-out Sidebar Drawer */}
          <motion.aside
            key="sidebar-drawer"
            initial={{ x: '-100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="glass-panel"
            style={{
              width: '300px',
              maxWidth: '85vw',
              height: '100vh',
              position: 'fixed',
              top: 0,
              left: 0,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 14px',
              zIndex: 999,
              overflowY: 'auto',
              boxShadow: '12px 0 45px rgba(0, 0, 0, 0.75)',
              borderRight: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'linear-gradient(180deg, #0e1726 0%, #080d1a 100%)'
            }}
          >
            {/* Brand Header with Close [X] Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--accent-gradient)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--accent-glow)' }}>
                  <ShieldCheck color="#fff" size={24} />
                </div>
                <div>
                  <h1 style={{ fontSize: '19px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
                    Benefit<span className="gradient-text">OS</span>
                  </h1>
                  <span style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {t('brandTag')}
                  </span>
                </div>
              </div>

              {/* Close Drawer Button */}
              <button
                onClick={closeSidebar}
                title={t('closeSidebar') || 'Close Sidebar'}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  borderRadius: '10px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Items */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px', flex: 1 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink 
                    key={item.to}
                    to={item.to} 
                    onClick={closeSidebar}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)' : 'transparent',
                      border: isActive ? '1px solid var(--border-glow)' : '1px solid transparent',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '13px',
                      transition: 'all 0.2s ease'
                    })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={17} color="currentColor" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={item.badge === 'NEW' ? 'new-badge' : ''} style={{ fontSize: '9.5px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', background: item.badge === 'NEW' ? 'rgba(16,185,129,0.25)' : 'rgba(99, 102, 241, 0.25)', color: item.badge === 'NEW' ? '#10b981' : '#fff' }}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* User Footer Card */}
            <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '13px', flexShrink: 0 }}>
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: '12.5px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{user?.fullName}</p>
                  <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  closeSidebar();
                  onLogout();
                }} 
                title={t('navLogout')} 
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--error)', borderRadius: '8px', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
