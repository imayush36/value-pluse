'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="auth-shell">
      <div className="auth-card auth-register">
        <div className="auth-topbar">
          <Link href="/" className="back-link">← Back</Link>
          <div className="brand-pill">VALUEPLUS</div>
        </div>

        <h1>Create account</h1>
        <p>Register with your email or phone number.</p>

        <form className="auth-form">
          <label className="field-group">
            <span>Full name</span>
            <input type="text" placeholder="Enter your full name" />
          </label>

          <label className="field-group">
            <span>Email address</span>
            <input type="email" placeholder="you@example.com" />
          </label>

          <label className="field-group">
            <span>Phone number</span>
            <input type="tel" placeholder="+91 98765 43210" />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input type="password" placeholder="Create a password" />
          </label>

          <label className="field-group">
            <span>Confirm password</span>
            <input type="password" placeholder="Confirm your password" />
          </label>

          <button type="submit" className="primary-submit">Create account</button>
        </form>

        <div className="divider"><span>or sign up with</span></div>

        <div className="social-stack">
          <button type="button" className="social-btn gmail-btn">Sign up with Gmail</button>
          <button type="button" className="social-btn phone-btn">Sign up with Phone Number</button>
        </div>

        <p className="auth-footer">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
