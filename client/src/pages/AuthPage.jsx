import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Lock, Eye, EyeOff, Mail, Phone, CheckCircle2, ArrowRight, Sparkles, KeyRound, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'login' | 'forgot'
  const [step, setStep] = useState('form'); // 'form' | 'reset'

  // Show / Hide Password state
  const [showPassword, setShowPassword] = useState(false);

  // Password Strength Meter state
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Registration State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login State
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);
  const [emailOtp, setEmailOtp] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Calculate password strength
  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    setPasswordStrength(score);
  }, [password]);

  // Instant Login for Returning Users
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { identifier: identifier.trim(), password: loginPassword });
      login(res.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  // First-Time User Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters long');

    const cleanPhone = phone.trim();
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return setError('Mobile number must be exactly 10 digits. Neither more nor less than 10 digits is allowed.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return setError('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/register/initiate', {
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password
      });

      // User registered & activated directly -> land directly on dashboard
      if (res.data?.data) {
        login(res.data.data);
        navigate('/dashboard');
        return;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || (err.message === 'Network Error' ? 'Backend server is not reachable on port 5000. Please start the server.' : (err.message || 'Registration failed'));
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Password Recovery Initiation
  const handleForgotInitiate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password/initiate', { identifier: forgotIdentifier });
      setPendingUserId(res.data.data.userId);
      if (res.data.data.devOtp) {
        setEmailOtp(res.data.data.devOtp);
      }
      setStep('reset');
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Submit
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password/reset', { userId: pendingUserId, emailOtp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => {
        setStep('form');
        setActiveTab('login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset password failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      {/* Left Column: Hero Branding */}
      <div 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          padding: '60px', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)',
          borderRight: '1px solid var(--border-subtle)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-gradient)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--accent-glow)' }}>
            <ShieldCheck color="#fff" size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>GovScheme Portal</h2>
            <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '600' }}>Pure MERN Architecture</span>
          </div>
        </div>

        <div style={{ maxWidth: '500px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '16px' }}>
            <Sparkles size={14} /> Official Government Scheme Intelligence
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#fff', lineHeight: '1.2', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Access Schemes, Grants & PSU Jobs Tailored To You.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
            A fast, secured, and automated platform built strictly on MongoDB, Express.js, React, and Node.js with instant 1-step registration.
          </p>

          {/* Quick Demo Login Preset */}
          <div style={{ marginTop: '28px', padding: '16px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '4px', textTransform: 'uppercase' }}>Demo Verified Account</p>
            <p style={{ fontSize: '13px', color: '#fff' }}><strong>Email:</strong> citizen@gov.in</p>
            <p style={{ fontSize: '13px', color: '#fff' }}><strong>Password:</strong> Password@123</p>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          © 2026 GovScheme Intelligence Portal • Government of India Initiative
        </div>
      </div>

      {/* Right Column: Auth Forms */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '460px' }}
        >
          {/* Tabs */}
          {step === 'form' && (
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '12px', marginBottom: '28px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => { setActiveTab('login'); setError(''); setMessage(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'login' ? 'var(--accent-gradient)' : 'transparent', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setError(''); setMessage(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'register' ? 'var(--accent-gradient)' : 'transparent', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Register Citizen
              </button>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--error)', color: '#fff', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <AlertCircle size={16} color="var(--error)" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: '#fff', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span>{message}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {step === 'form' && activeTab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Email or Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="citizen@gov.in or 9876543210"
                    style={{ width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Password</label>
                  <button type="button" onClick={() => { setActiveTab('forgot'); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '12px', cursor: 'pointer' }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ width: '100%', padding: '12px 42px 12px 42px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '14px' }}>
                {loading ? 'Authenticating...' : 'Sign In To Portal'}
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {step === 'form' && activeTab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name (As per Aadhaar)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Mobile Phone Number (Strictly 10 Digits) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>+91</span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength="10"
                    minLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    style={{ width: '100%', padding: '12px 14px 12px 48px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password (min 6 chars)"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '14px' }}>
                {loading ? 'Creating Account & Entering...' : 'Create Account & Enter Portal'}
              </button>
            </form>
          )}

          {/* 4. FORGOT PASSWORD FORM */}
          {step === 'form' && activeTab === 'forgot' && (
            <form onSubmit={handleForgotInitiate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Reset Your Password</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Enter your registered Email or Mobile number to receive an OTP.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Email or Phone</label>
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="Enter registered Email or Phone"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '14px' }}>
                {loading ? 'Sending OTP...' : 'Send Password Reset OTP'}
              </button>

              <button type="button" onClick={() => { setActiveTab('login'); }} className="btn-secondary" style={{ width: '100%', fontSize: '13px' }}>
                Cancel & Back to Sign In
              </button>
            </form>
          )}

          {/* 5. RESET PASSWORD WITH OTP */}
          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Set New Password</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Enter the OTP received on your email and choose a new password.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Email OTP</label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="6-digit OTP code"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', textAlign: 'center', letterSpacing: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '14px' }}>
                {loading ? 'Resetting Password...' : 'Save New Password & Sign In'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
