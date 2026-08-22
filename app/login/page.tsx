'use client';

import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <div className="auth-card auth-login">
        <div className="auth-topbar">
          <Link href="/" className="back-link">← Back</Link>
          <div className="brand-pill">VALUEPLUS</div>
        </div>

        <h1>Welcome back</h1>
        <p>Sign in with your email or phone number.</p>

        <form className="auth-form">
          <label className="field-group">
            <span>Email or mobile number</span>
            <input type="text" placeholder="you@example.com or +91 98765 43210" />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input type="password" placeholder="Enter your password" />
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
          <button type="button" className="social-btn gmail-btn">Continue with Gmail</button>
          <button type="button" className="social-btn phone-btn">Continue with Phone Number</button>
        </div>

        <p className="auth-footer">
          Don&apos;t have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </main>
  );
}
