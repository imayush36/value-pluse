'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    alert('Login successful');
  };

  return (
    <main className="auth-shell">
      <div className="auth-card auth-login">
        <div className="auth-topbar">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="brand-pill">VALUEPLUS</div>
        </div>

        <h1>Welcome back</h1>
        <p>Login with your email and password.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="field-group">
            <span>Email address</span>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <label className="field-group">
            <span>Password</span>
            <div className="input-with-icon password-wrap">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="row-between">
            <label className="check-row">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link href="/register" className="mini-link">Create account</Link>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-submit">Login</button>
        </form>

        <div className="divider"><span>or continue with</span></div>

        <div className="social-stack">
          <button type="button" className="social-btn gmail-btn">
            <Mail size={18} className="social-icon" />
            Continue with Gmail
          </button>
        </div>

        <p className="auth-footer">
          Don&apos;t have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </main>
  );
}
