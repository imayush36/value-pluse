// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  UserPlus,
  LogIn,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalReason,
    setAuthModalReason,
    isAuthenticated,
    currentUser,
    login,
    logout,
    requestRegistrationOtp,
    verifyOtpAndRegister,
    resendRegistrationOtp,
    pendingRegistration,
    setPendingRegistration,
    generatedOtp,
  } = useShop();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [registerStep, setRegisterStep] = useState(1); // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpInputRef = useRef(null);

  useEffect(() => {
    let interval = null;
    if (registerStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [registerStep, otpTimer]);

  useEffect(() => {
    if (registerStep === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [registerStep]);

  if (!isAuthModalOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setRegisterStep(1);
    setEnteredOtp('');
    setError('');
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
    setRegisterStep(1);
    setPendingRegistration(null);
    setError('');
  };

  // Step 1: Submit Form to Request OTP
  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await requestRegistrationOtp(formData);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setRegisterStep(2);
      setOtpTimer(30);
      setCanResend(false);
      setEnteredOtp('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit OTP for Verification
  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const result = await verifyOtpAndRegister(enteredOtp);
      if (!result.success) {
        setError(result.message);
        return;
      }
      // Registration successful and modal closes via verifyOtpAndRegister
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    setIsSubmitting(true);
    try {
      const newOtp = await resendRegistrationOtp();
      if (newOtp) {
        setOtpTimer(30);
        setCanResend(false);
        setEnteredOtp('');
        setError('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login Submit
  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.message);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div
        className="details-modal"
        style={{
          maxWidth: '480px',
          width: '94%',
          padding: '2rem',
          borderRadius: '16px',
          background: 'var(--bg-main, #ffffff)',
          position: 'relative',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Close account dialog"
        >
          <X size={20} />
        </button>

        {isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                background: 'var(--primary-light, #e0f2fe)',
                color: 'var(--primary, #0a6cdc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserRound size={30} />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              Welcome back, {currentUser.fullName}!
            </h2>
            <div
              style={{
                background: 'var(--bg-alt, #f8fafc)',
                border: '1px solid var(--border-default, #e2e8f0)',
                borderRadius: '10px',
                padding: '0.85rem',
                margin: '1.25rem 0 1.5rem',
                textAlign: 'left',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <strong>{currentUser.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mobile:</span>
                <strong>+91 {currentUser.phone || 'Verified'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { handleClose(); logout(); }}>
                Log Out
              </button>
              <button className="btn btn-primary" onClick={handleClose}>
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Reason Notice if triggered from Checkout */}
            {authModalReason === 'checkout' && (
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '0.75rem 0.9rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  color: '#92400e',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                }}
              >
                <ShoppingBag size={18} color="#b45309" />
                <span>Customer Registration is required before placing an order. Please Log in or Register below.</span>
              </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--primary-light, #e0f2fe)',
                  color: 'var(--primary, #0a6cdc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                  {mode === 'login'
                    ? 'Welcome to Value Plus'
                    : registerStep === 1
                    ? 'Create Customer Account'
                    : 'Verify Mobile Number (OTP)'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: '2px 0 0 0' }}>
                  {mode === 'login'
                    ? 'Log in to manage orders, wishlist & fast checkout'
                    : registerStep === 1
                    ? 'Register with verified mobile number for fast checkout'
                    : `Enter 6-digit code sent to +91 ${formData.phone}`}
                </p>
              </div>
            </div>

            {/* Mode Switch Tabs (hidden on OTP screen) */}
            {registerStep === 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.35rem',
                  padding: '0.25rem',
                  background: 'var(--bg-alt, #f1f5f9)',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '7px',
                    border: 'none',
                    background: mode === 'login' ? 'var(--bg-main, #ffffff)' : 'transparent',
                    color: mode === 'login' ? 'var(--primary, #0a6cdc)' : 'var(--text-muted)',
                    boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '7px',
                    border: 'none',
                    background: mode === 'register' ? 'var(--bg-main, #ffffff)' : 'transparent',
                    color: mode === 'register' ? 'var(--primary, #0a6cdc)' : 'var(--text-muted)',
                    boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Register (with OTP)
                </button>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label className="form-label">Email Address *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '0.95rem', pointerEvents: 'none' }} />
                    <input
                      className="form-control"
                      style={{ paddingLeft: '2.85rem', paddingRight: '1rem', minHeight: '46px', fontSize: '0.9375rem' }}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. yourname@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label className="form-label">Password *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <LockKeyhole size={18} color="#64748b" style={{ position: 'absolute', left: '0.95rem', pointerEvents: 'none' }} />
                    <input
                      className="form-control"
                      style={{ paddingLeft: '2.85rem', paddingRight: '1rem', minHeight: '46px', fontSize: '0.9375rem' }}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your account password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div style={{ color: '#e11d48', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}
                >
                  {isSubmitting ? 'Verifying...' : 'Login & Continue'}
                  <ArrowRight size={16} />
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Register with OTP
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER STEP 1: FILL DETAILS */}
            {mode === 'register' && registerStep === 1 && (
              <form onSubmit={handleRequestOtp}>
                <div className="form-group" style={{ marginBottom: '0.95rem' }}>
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <UserRound size={18} color="#64748b" style={{ position: 'absolute', left: '0.95rem', pointerEvents: 'none' }} />
                    <input
                      className="form-control"
                      style={{ paddingLeft: '2.85rem', paddingRight: '1rem', minHeight: '46px', fontSize: '0.9375rem' }}
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name (e.g. Rahul Sharma)"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.95rem' }}>
                  <label className="form-label">Mobile Number (for OTP Verification) *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '0.95rem', pointerEvents: 'none' }} />
                    <input
                      className="form-control"
                      style={{ paddingLeft: '2.85rem', paddingRight: '1rem', minHeight: '46px', fontSize: '0.9375rem' }}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.95rem' }}>
                  <label className="form-label">Email Address *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '0.95rem', pointerEvents: 'none' }} />
                    <input
                      className="form-control"
                      style={{ paddingLeft: '2.85rem', paddingRight: '1rem', minHeight: '46px', fontSize: '0.9375rem' }}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email (e.g. name@domain.com)"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Create Password *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <LockKeyhole size={18} color="#64748b" style={{ position: 'absolute', left: '0.95rem', pointerEvents: 'none' }} />
                    <input
                      className="form-control"
                      style={{ paddingLeft: '2.85rem', paddingRight: '1rem', minHeight: '46px', fontSize: '0.9375rem' }}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create secret password (at least 6 characters)"
                      minLength="6"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div style={{ color: '#e11d48', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                >
                  <KeyRound size={16} />
                  Send Verification OTP
                  <ArrowRight size={16} />
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Log In directly
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER STEP 2: ENTER OTP */}
            {mode === 'register' && registerStep === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    6-Digit OTP Sent via SMS &amp; Email
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#15803d', letterSpacing: '0.04em' }}>
                    +91 {formData.phone}
                  </div>
                  {generatedOtp && (
                    <div
                      onClick={() => {
                        setEnteredOtp(generatedOtp);
                        setError('');
                        if (otpInputRef.current) otpInputRef.current.focus();
                      }}
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--primary)',
                        marginTop: '0.45rem',
                        cursor: 'pointer',
                        background: '#eff6ff',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px dashed #93c5fd',
                        display: 'inline-block',
                      }}
                      title="Click to auto-fill OTP"
                    >
                      👉 Click to Auto-fill OTP Code: <strong style={{ textDecoration: 'underline' }}>{generatedOtp}</strong>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ textAlign: 'center', display: 'block', fontSize: '0.875rem' }}>
                    Enter 6-Digit Verification Code *
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    placeholder="• • • • • •"
                    className="form-control"
                    style={{
                      textAlign: 'center',
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      letterSpacing: '0.5em',
                      padding: '0.75rem',
                    }}
                    required
                  />
                </div>

                {error && (
                  <div style={{ color: '#e11d48', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || enteredOtp.length !== 6}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginBottom: '0.85rem' }}
                >
                  <ShieldCheck size={18} />
                  {isSubmitting ? 'Verifying OTP...' : 'Verify OTP & Complete Registration'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setRegisterStep(1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    ← Edit Details
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={13} />
                      Resend OTP Code
                    </button>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Resend code in <strong>{otpTimer}s</strong>
                    </span>
                  )}
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
