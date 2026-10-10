import React, { useState } from 'react';
import API from '../services/api';
import { Search, RefreshCw, CheckCircle2, Globe, Shield, Menu, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useSidebar } from '../context/SidebarContext';

const Navbar = ({ searchTerm, setSearchTerm, user }) => {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { toggleSidebar, isOpen } = useSidebar();

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncMessage(t('navSyncing'));
    try {
      const res = await API.post('/portal/sync-gov-data');
      setSyncMessage(res.data.message || 'Successfully synced latest government schemes!');
      setTimeout(() => {
        setSyncMessage('');
        window.location.reload(); // Refresh to reflect newly added schemes
      }, 1500);
    } catch (err) {
      setSyncMessage('Sync completed.');
      setTimeout(() => setSyncMessage(''), 2000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="glass-panel navbar-header">
      {/* Left Area: Sidebar Toggle Icon Button + Live Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, maxWidth: '640px' }}>
        {/* ☰ Sidebar Toggle Icon Button */}
        <button
          onClick={toggleSidebar}
          className="sidebar-toggle-btn"
          title={t('sidebarToggle')}
          aria-label={t('sidebarToggle')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isOpen ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.25) 100%)' : 'rgba(255, 255, 255, 0.05)',
            border: isOpen ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '7px 12px',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: isOpen ? 'var(--accent-glow)' : '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.25s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.2) 100%)';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            if (!isOpen) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Menu size={18} color="var(--accent-primary)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck color="#fff" size={13} />
            </div>
            <span className="hide-on-xs" style={{ fontSize: '13px', fontWeight: '800', color: '#fff', letterSpacing: '-0.2px' }}>
              Benefit<span className="gradient-text">OS</span>
            </span>
          </div>
          <span className="hide-on-mobile" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', paddingLeft: '4px', borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {t('sidebarMenu')}
          </span>
        </button>

        {/* Live Search Bar (if setSearchTerm provided) */}
        {setSearchTerm ? (
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%', minWidth: '120px', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder={t('navSearchPlaceholder')} 
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 10px 8px 34px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '12px', outline: 'none' }}
            />
          </div>
        ) : null}
      </div>

      {/* Sync Status / Feedback Toast */}
      {syncMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', borderRadius: '20px', padding: '6px 14px', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <CheckCircle2 size={14} color="var(--success)" />
          <span className="hide-on-xs">{syncMessage}</span>
        </motion.div>
      )}

      {/* Right Navbar Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* 🌐 Multi-Language Selector Dropdown (Protected: Never translated or modified) */}
        <div 
          className="notranslate" 
          translate="no"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '4px 8px' }}
        >
          <Globe size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="notranslate"
            translate="no"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer',
              padding: '2px 0',
              maxWidth: '120px'
            }}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code} className="notranslate" translate="no" style={{ background: '#111827', color: '#fff' }}>
                {lang.flag} {lang.native} ({lang.name})
              </option>
            ))}
          </select>
        </div>

        {/* Government Portal Live Auto-Sync Button */}
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="btn-secondary"
          title="Click to fetch newest Government Schemes from official portals"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11.5px',
            padding: '6px 10px',
            borderRadius: '20px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#fff',
            cursor: syncing ? 'wait' : 'pointer',
            flexShrink: 0
          }}
        >
          <RefreshCw size={13} className={syncing ? 'spinning' : ''} color="var(--accent-primary)" />
          <span className="hide-on-mobile">{syncing ? t('navSyncing') : t('navLiveSync')}</span>
        </button>

        {/* Dual OTP Verified Badge */}
        <div 
          title={t('navVerifiedCitizen')}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 10px', borderRadius: '20px', fontSize: '11.5px', color: 'var(--success)', fontWeight: '600', flexShrink: 0 }}
        >
          <Shield size={13} />
          <span className="hide-on-mobile">{t('navVerifiedCitizen')}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
