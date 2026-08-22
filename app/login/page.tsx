'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
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

        <form className="auth-form">
          <label className="field-group">
            <span>Email address</span>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input type="email" placeholder="you@example.com" />
            </div>
          </label>

          <label className="field-group">
            <span>Password</span>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input type="password" placeholder="Enter your password" />
            </div>
          </label>

          <div className="row-between">
            <label className="check-row">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link href="/register" className="mini-link">Create account</Link>
          </div>

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
