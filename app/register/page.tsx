'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, UserRound, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, KeyRound, RotateCcw } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let interval = null;
    if (step === 2 && otpTimer > 0) {
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
  }, [step, otpTimer]);

  const handleRequestOtp = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    let otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Call /api/auth/otp to send OTP & appear in Network tab
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone: phone.trim(), email: email.trim().toLowerCase(), fullName: fullName.trim() }),
      });
      const data = await res.json();
      if (data.success && data.otp) {
        otp = data.otp;
      }
    } catch (err) {
      console.warn('OTP API fallback:', err);
    }

    setGeneratedOtp(otp);
    setError('');
    setStep(2);
    setOtpTimer(30);
    setCanResend(false);
    setOtpCode('');
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();

    // Call /api/auth/otp to verify
    try {
      const verifyRes = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone: phone.trim(), otp: otpCode.trim() }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setError(verifyData.message || 'Invalid OTP code.');
        return;
      }
    } catch (err) {
      if (otpCode.trim() !== generatedOtp.trim()) {
        setError('Invalid OTP code. Please enter the 6-digit code shown.');
        return;
      }
    }

    // Save to MongoDB /api/users
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });
    } catch (err) {
      console.error('User save to DB error:', err);
    }

    // Save to local storage for demo persistence
    try {
      const existingUsers = JSON.parse(localStorage.getItem('valueplus_users') || '[]');
      const newUser = { fullName: fullName.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password };
      localStorage.setItem('valueplus_users', JSON.stringify([...existingUsers, newUser]));
      localStorage.setItem('valueplus_session', JSON.stringify({ fullName: newUser.fullName, email: newUser.email, phone: newUser.phone }));
    } catch {
      // storage fallback
    }

    setError('');
    setSuccessMsg('Account registered and verified successfully! Redirecting...');
    setTimeout(() => {
      router.push('/');
    }, 1200);
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    let newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', phone: phone.trim(), email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.success && data.otp) {
        newOtp = data.otp;
      }
    } catch (err) {
      console.warn('Resend OTP fallback:', err);
    }

    setGeneratedOtp(newOtp);
    setOtpTimer(30);
    setCanResend(false);
    setOtpCode('');
    setError('');
  };

  return (
    <main className="auth-shell">
      <div className="auth-card auth-register" style={{ maxWidth: '480px' }}>
        <div className="auth-topbar">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} /> Back to Store
          </Link>
          <div className="brand-pill">VALUEPLUS</div>
        </div>

        <h1>{step === 1 ? 'Create Account' : 'Verify Mobile OTP'}</h1>
        <p>
          {step === 1
            ? 'Register with verified mobile number for secure checkout.'
            : `Enter 6-digit OTP sent to +91 ${phone}`}
        </p>

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleRequestOtp} noValidate>
            <label className="field-group">
              <span>Full Name *</span>
              <div className="input-with-icon">
                <UserRound className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span>Mobile Number (for OTP Verification) *</span>
              <div className="input-with-icon">
                <Phone className="input-icon" size={18} />
                <input
                  type="tel"
                  placeholder="9876543210 (10 digits)"
                  value={phone}
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span>Email Address *</span>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span>Password *</span>
              <div className="input-with-icon password-wrap">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="field-group">
              <span>Confirm Password *</span>
              <div className="input-with-icon password-wrap">
                <Lock className="input-icon" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="primary-submit">
              <KeyRound size={17} />
              Continue with OTP Verification
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp} noValidate>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>
                Verification OTP Sent to +91 {phone}
              </div>
              <div
                onClick={() => {
                  setOtpCode(generatedOtp);
                  setError('');
                }}
                style={{
                  fontSize: '0.82rem',
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
                👉 Click to Auto-fill Code: <strong style={{ textDecoration: 'underline' }}>{generatedOtp}</strong>
              </div>
            </div>

            <label className="field-group">
              <span style={{ textAlign: 'center', display: 'block' }}>Enter 6-Digit OTP Code *</span>
              <input
                type="text"
                placeholder="• • • • • •"
                value={otpCode}
                maxLength={6}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  textAlign: 'center',
                  fontSize: '1.6rem',
                  fontWeight: '800',
                  letterSpacing: '0.4em',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  width: '100%',
                }}
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}
            {successMsg && <p style={{ color: '#16a34a', fontWeight: '700', textAlign: 'center' }}>{successMsg}</p>}

            <button type="submit" className="primary-submit" disabled={otpCode.length !== 6}>
              <ShieldCheck size={18} />
              Verify OTP &amp; Complete Registration
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.8125rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ← Edit Details
              </button>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCcw size={13} /> Resend OTP
                </button>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Resend in <strong>{otpTimer}s</strong></span>
              )}
            </div>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
