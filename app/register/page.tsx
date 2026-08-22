'use client';

import Link from 'next/link';
import { ArrowLeft, UserRound, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  return (
    <main className="auth-shell">
      <div className="auth-card auth-register">
        <div className="auth-topbar">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="brand-pill">VALUEPLUS</div>
        </div>

        <h1>Create account</h1>
        <p>Register with your email to get started.</p>

        <form className="auth-form">
          <label className="field-group">
            <span>Full name</span>
            <div className="input-with-icon">
              <UserRound className="input-icon" size={18} />
              <input type="text" placeholder="Enter your full name" />
            </div>
          </label>

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
              <input type="password" placeholder="Create a password" />
            </div>
          </label>

          <label className="field-group">
            <span>Confirm password</span>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input type="password" placeholder="Confirm your password" />
            </div>
          </label>

          <button type="submit" className="primary-submit">Create account</button>
        </form>

        <div className="divider"><span>or sign up with</span></div>

        <div className="social-stack">
          <button type="button" className="social-btn gmail-btn">
            <Mail size={18} className="social-icon" />
            Sign up with Gmail
          </button>
        </div>

        <p className="auth-footer">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
