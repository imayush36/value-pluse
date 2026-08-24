import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { smsService } from '../utils/smsService';
import {
  X,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Gift,
  Truck,
  Award,
  ChevronLeft,
  MessageSquare,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import gsap from 'gsap';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalView,
    setAuthModalView,
    pendingAuthData,
    activeOtp,
    loginWithPassword,
    requestLoginOtp,
    requestRegisterOtp,
    requestForgotOtp,
    verifyOtpAndProceed,
    completePasswordReset,
    resendOtp,
    quickDemoLogin,
  } = useAuth();

  const { showToast } = useShop();

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Form States
  const [loginMode, setLoginMode] = useState('otp'); // 'otp' or 'password'
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginChannel, setLoginChannel] = useState('phone'); // 'phone' or 'email'
  const [showPassword, setShowPassword] = useState(false);

  // Register Form State
  const [regData, setRegData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    channel: 'phone',
  });

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotChannel, setForgotChannel] = useState('phone');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 6-Digit OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputsRef = useRef([]);
  const [resendTimer, setResendTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Errors
  const [errors, setErrors] = useState({});

  // Animation on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrors({});
      if (overlayRef.current && modalRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
        gsap.fromTo(
          modalRef.current,
          { scale: 0.94, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
        );
      }
    }
  }, [isAuthModalOpen, authModalView]);

  // Handle Resend Countdown Timer
  useEffect(() => {
    if (authModalView === 'otp') {
      setResendTimer(30);
      const interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [authModalView, pendingAuthData]);

  if (!isAuthModalOpen) return null;

  // --- Handlers ---
  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, { scale: 0.94, opacity: 0, duration: 0.2 });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: closeAuthModal,
      });
    } else {
      closeAuthModal();
    }
  };

  // 1. Password Login Submit
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!loginIdentifier.trim()) {
      setErrors({ identifier: 'Please enter your registered mobile number or email' });
      return;
    }
    if (!loginPassword) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithPassword(loginIdentifier, loginPassword);
      if (res && res.success) {
        showToast(res.message);
      } else {
        setErrors({ general: res?.message || 'Invalid credentials' });
      }
    } catch (err) {
      setErrors({ general: 'Login error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Request OTP for Login
  const handleRequestLoginOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!loginIdentifier.trim()) {
      setErrors({ identifier: 'Please enter your mobile number or email' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestLoginOtp(loginIdentifier, loginChannel);
      if (res && res.success) {
        showToast(res.message);
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setErrors({ general: res?.message || 'Could not send OTP' });
      }
    } catch (err) {
      setErrors({ general: 'Failed to send OTP. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Register Submit (Send OTP)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    if (!regData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!regData.phone.trim()) {
      newErrors.phone = 'Mobile Number is required';
    } else if (regData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!regData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(regData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!regData.password || regData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestRegisterOtp(regData, regData.channel);
      if (res && res.success) {
        showToast(res.message);
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setErrors({ general: res?.message || 'Registration failed' });
      }
    } catch (err) {
      setErrors({ general: 'Failed to send registration OTP' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. OTP Inputs Change Handler
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedDigits = value.replace(/\D/g, '').split('').slice(0, 6);
      const newDigits = [...otpDigits];
      pastedDigits.forEach((digit, i) => {
        newDigits[i] = digit;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pastedDigits.length, 5);
      if (otpInputsRef.current[nextIndex]) {
        otpInputsRef.current[nextIndex].focus();
      }
      if (pastedDigits.length === 6) {
        handleOtpSubmitCode(pastedDigits.join(''));
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto verify when all 6 digits are filled
    const allFilled = newDigits.every((d) => d !== '');
    if (allFilled) {
      handleOtpSubmitCode(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // 5. Submit OTP Verification
  const handleOtpSubmitCode = async (codeToVerify) => {
    setIsSubmitting(true);
    try {
      const res = await verifyOtpAndProceed(codeToVerify);
      if (res && res.success) {
        showToast(res.message);
      } else {
        setErrors({ otp: res?.message || 'Incorrect OTP' });
      }
    } catch (err) {
      setErrors({ otp: 'Verification failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerifyForm = (e) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrors({ otp: 'Please enter all 6 digits of the OTP' });
      return;
    }
    handleOtpSubmitCode(fullCode);
  };

  // 6. Forgot Password Request
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!forgotIdentifier.trim()) {
      setErrors({ identifier: 'Please enter your registered mobile number or email' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestForgotOtp(forgotIdentifier, forgotChannel);
      if (res && res.success) {
        showToast(res.message);
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setErrors({ general: res?.message || 'Failed to send reset OTP' });
      }
    } catch (err) {
      setErrors({ general: 'Failed to send reset OTP. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. Reset Password Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!newPassword || newPassword.length < 6) {
      setErrors({ newPassword: 'New password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completePasswordReset(newPassword);
      if (res && res.success) {
        showToast(res.message);
      } else {
        setErrors({ general: res?.message || 'Failed to reset password' });
      }
    } catch (err) {
      setErrors({ general: 'Failed to update password' });
    } finally {
      setIsSubmitting(false);
    }
  };


  // 8. Resend OTP Trigger
  const handleResend = (channel = null) => {
    const res = resendOtp(channel);
    if (res.success) {
      showToast(res.message);
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);
    } else {
      setErrors({ otp: res.message });
    }
  };

  // 9. Quick Demo Login helper
  const handleQuickDemo = (userId) => {
    const user = quickDemoLogin(userId);
    if (user) {
      showToast(`⚡ Logged in as Demo User: ${user.fullName}`);
    }
  };

  // Flipkart-style dynamic sidebar details
  const getSidebarDetails = () => {
    switch (authModalView) {
      case 'register':
        return {
          title: "Looks like you're new here!",
          subtitle: 'Sign up with your mobile number to get started with Value Plus',
        };
      case 'otp': {
        const isEmail = pendingAuthData?.isEmail || pendingAuthData?.identifier?.includes('@');
        const targetLabel = isEmail
          ? pendingAuthData?.identifier
          : `+91 ${(pendingAuthData?.identifier || '').slice(-10)}`;
        return {
          title: 'Verification',
          subtitle: `We have sent a verification code to ${targetLabel}`,
        };
      }
      case 'forgot':
      case 'forgot-reset':
        return {
          title: 'Reset Password',
          subtitle: 'Recover your account access with secure OTP verification',
        };
      case 'login':
      default:
        return {
          title: 'Login',
          subtitle: 'Get access to your Orders, Wishlist and Recommendations',
        };
    }
  };

  const sidebar = getSidebarDetails();

  return (
    <div
      ref={overlayRef}
      className="modal-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="auth-modal-card fk-auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn fk-modal-close"
          onClick={handleClose}
          aria-label="Close Authentication Modal"
        >
          <X size={20} />
        </button>

        {/* ── LEFT FLIPKART-STYLE BLUE SIDEBAR ── */}
        <div className="auth-sidebar-brand fk-sidebar">
          <div className="fk-sidebar-content">
            <h2 className="fk-sidebar-title">{sidebar.title}</h2>
            <p className="fk-sidebar-sub">{sidebar.subtitle}</p>
          </div>

          <div className="fk-sidebar-illustration">
            <div className="fk-illus-badge">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>
            <div className="fk-illus-text">VALUE PLUS MEGASTORE</div>
          </div>
        </div>

        {/* ── RIGHT MAIN FORM CONTAINER ── */}
        <div className="auth-form-container fk-form-container">

          {/* VIEW 1: LOGIN */}
          {authModalView === 'login' && (
            <div className="auth-view-content">
              {errors.general && (
                <div className="auth-alert-error" role="alert">
                  {errors.general}
                </div>
              )}

              {/* Login Method Toggle */}
              <div className="auth-toggle-tabs">
                <button
                  type="button"
                  className={`auth-tab-pill ${loginMode === 'otp' ? 'active' : ''}`}
                  onClick={() => { setLoginMode('otp'); setErrors({}); }}
                >
                  <Smartphone size={15} />
                  <span>OTP Login</span>
                </button>
                <button
                  type="button"
                  className={`auth-tab-pill ${loginMode === 'password' ? 'active' : ''}`}
                  onClick={() => { setLoginMode('password'); setErrors({}); }}
                >
                  <Lock size={15} />
                  <span>Password Login</span>
                </button>
              </div>

              {/* OPTION A: OTP LOGIN (FLIPKART STYLE) */}
              {loginMode === 'otp' ? (
                <form onSubmit={handleRequestLoginOtp} className="auth-form fk-form">
                  <div className="form-group fk-floating-group">
                    <label className="fk-floating-label">Enter Email/Mobile number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210 or user@example.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="form-control fk-input"
                      autoFocus
                    />
                    {errors.identifier && <span className="input-error-msg">{errors.identifier}</span>}
                  </div>

                  <p className="fk-terms-text">
                    By continuing, you agree to Value Plus's{' '}
                    <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Use</a> and{' '}
                    <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                  </p>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg fk-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={17} className="spin-icon" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <span>Request OTP</span>
                    )}
                  </button>
                </form>
              ) : (
                /* OPTION B: PASSWORD LOGIN */
                <form onSubmit={handlePasswordLogin} className="auth-form fk-form">
                  <div className="form-group fk-floating-group">
                    <label className="fk-floating-label">Enter Email/Mobile number</label>
                    <input
                      type="text"
                      placeholder="Enter registered email or mobile"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="form-control fk-input"
                    />
                    {errors.identifier && <span className="input-error-msg">{errors.identifier}</span>}
                  </div>

                  <div className="form-group fk-floating-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="fk-floating-label">Enter Password</label>
                      <button
                        type="button"
                        className="auth-link-subtle"
                        onClick={() => { setAuthModalView('forgot'); setErrors({}); }}
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="auth-input-with-icon">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="form-control fk-input"
                      />
                      <button
                        type="button"
                        className="input-suffix-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {errors.password && <span className="input-error-msg">{errors.password}</span>}
                  </div>

                  <p className="fk-terms-text">
                    By continuing, you agree to Value Plus's{' '}
                    <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Use</a> and{' '}
                    <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                  </p>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg fk-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={17} className="spin-icon" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <span>Login</span>
                    )}
                  </button>
                </form>
              )}

              {/* Quick Demo Accounts */}
              <div className="auth-quick-demo-box">
                <div className="quick-demo-title">
                  <Sparkles size={13} color="var(--primary)" />
                  <span>Quick Demo Accounts:</span>
                </div>
                <div className="quick-demo-buttons">
                  <button
                    type="button"
                    className="quick-demo-btn"
                    onClick={() => handleQuickDemo('usr_demo_101')}
                  >
                    ⚡ Rahul Sharma
                  </button>
                  <button
                    type="button"
                    className="quick-demo-btn"
                    onClick={() => handleQuickDemo('usr_demo_102')}
                  >
                    ⚡ Priya Verma
                  </button>
                </div>
              </div>

              {/* Switch to Register */}
              <div className="fk-bottom-link-box">
                <button
                  type="button"
                  className="fk-link-create-acc"
                  onClick={() => { setAuthModalView('register'); setErrors({}); }}
                >
                  New to Value Plus? Create an account
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: REGISTER */}
          {authModalView === 'register' && (
            <div className="auth-view-content">
              {errors.general && (
                <div className="auth-alert-error" role="alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="auth-form fk-form">
                <div className="form-group fk-floating-group">
                  <label className="fk-floating-label">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={regData.fullName}
                    onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                    className="form-control fk-input"
                    autoFocus
                  />
                  {errors.fullName && <span className="input-error-msg">{errors.fullName}</span>}
                </div>

                <div className="form-group fk-floating-group">
                  <label className="fk-floating-label">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="form-control fk-input"
                  />
                  {errors.phone && <span className="input-error-msg">{errors.phone}</span>}
                </div>

                <div className="form-group fk-floating-group">
                  <label className="fk-floating-label">Email Address *</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="form-control fk-input"
                  />
                  {errors.email && <span className="input-error-msg">{errors.email}</span>}
                </div>

                <div className="form-group fk-floating-group">
                  <label className="fk-floating-label">Set Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="form-control fk-input"
                  />
                  {errors.password && <span className="input-error-msg">{errors.password}</span>}
                </div>

                <p className="fk-terms-text">
                  By continuing, you agree to Value Plus's{' '}
                  <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Use</a> and{' '}
                  <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                </p>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg fk-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>CONTINUE</span>
                  )}
                </button>
              </form>

              <div className="fk-bottom-link-box">
                <button
                  type="button"
                  className="fk-link-create-acc"
                  onClick={() => { setAuthModalView('login'); setErrors({}); }}
                >
                  Existing User? Log in
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: OTP VERIFICATION */}
          {authModalView === 'otp' && (
            <div className="auth-view-content">
              <div className="fk-otp-header-info">
                <p className="fk-otp-desc">
                  Please enter the OTP sent to{' '}
                  <strong>
                    {pendingAuthData?.isEmail || pendingAuthData?.identifier?.includes('@')
                      ? pendingAuthData?.identifier
                      : `+91 ${(pendingAuthData?.identifier || '').slice(-10)}`}
                  </strong>.{' '}
                  <button
                    type="button"
                    className="fk-otp-change-link"
                    onClick={() => setAuthModalView(pendingAuthData?.purpose === 'register' ? 'register' : 'login')}
                  >
                    Change
                  </button>
                </p>
              </div>

              {errors.otp && (
                <div className="auth-alert-error" role="alert">
                  {errors.otp}
                </div>
              )}

              <form onSubmit={handleOtpVerifyForm} className="auth-form fk-form">
                {/* 6-Digit Individual Inputs */}
                <div className="otp-boxes-grid fk-otp-grid">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={idx === 0 ? 6 : 1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`otp-digit-input fk-otp-input ${digit ? 'filled' : ''}`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg fk-btn-primary"
                  disabled={isSubmitting || otpDigits.join('').length < 6}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify</span>
                  )}
                </button>
              </form>

              {/* Resend & Channel Switch */}
              <div className="otp-resend-container fk-resend-box">
                {resendTimer > 0 ? (
                  <span className="resend-countdown">
                    Resend OTP in <strong>{resendTimer}s</strong>
                  </span>
                ) : (
                  <div className="resend-action-buttons">
                    <button
                      type="button"
                      className="resend-btn"
                      onClick={() => handleResend()}
                    >
                      <RefreshCw size={13} />
                      <span>Resend OTP</span>
                    </button>
                    <span className="resend-divider">•</span>
                    <button
                      type="button"
                      className="resend-btn"
                      onClick={() => {
                        const targetId = pendingAuthData?.identifier || '';
                        const code = activeOtp?.code || '123456';
                        smsService.sendWhatsAppOtp(targetId, code);
                        showToast('📲 WhatsApp OTP triggered!');
                      }}
                    >
                      Send via WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 4: FORGOT PASSWORD REQUEST */}
          {authModalView === 'forgot' && (
            <div className="auth-view-content">
              <button
                type="button"
                className="auth-back-nav"
                onClick={() => setAuthModalView('login')}
              >
                <ChevronLeft size={16} />
                <span>Back to Login</span>
              </button>

              <div className="auth-header-text">
                <h2 className="auth-title">Reset Your Password</h2>
                <p className="auth-subtitle">
                  Enter your registered mobile number or email to receive a password reset OTP
                </p>
              </div>

              {errors.general && (
                <div className="auth-alert-error" role="alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="auth-form fk-form">
                <div className="form-group fk-floating-group">
                  <label className="fk-floating-label">Registered Phone or Email</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210 or user@example.com"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="form-control fk-input"
                    autoFocus
                  />
                  {errors.identifier && <span className="input-error-msg">{errors.identifier}</span>}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg fk-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send Reset OTP</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* VIEW 5: FORGOT PASSWORD RESET */}
          {authModalView === 'forgot-reset' && (
            <div className="auth-view-content">
              <div className="auth-header-text">
                <h2 className="auth-title">Create New Password</h2>
                <p className="auth-subtitle">OTP verified successfully! Please enter your new password.</p>
              </div>

              {errors.general && (
                <div className="auth-alert-error" role="alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="auth-form fk-form">
                <div className="form-group fk-floating-group">
                  <label className="fk-floating-label">New Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-control fk-input"
                    autoFocus
                  />
                  {errors.newPassword && <span className="input-error-msg">{errors.newPassword}</span>}
                </div>

                <div className="form-group fk-floating-group">
                  <label className="fk-floating-label">Confirm New Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control fk-input"
                  />
                  {errors.confirmPassword && <span className="input-error-msg">{errors.confirmPassword}</span>}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg fk-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Update Password &amp; Login</span>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
