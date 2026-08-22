// @ts-nocheck
import React, { useState } from 'react';
import { X, UserRound, Mail, Phone, LockKeyhole, UserPlus, LogIn } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
  } = useShop();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = mode === 'login' ? await login(formData.email, formData.password) : await register(formData);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setFormData({ fullName: '', email: '', phone: '', password: '' });
      setError('');
      if (mode === 'login') setIsAuthModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthModalOpen(false);
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
      <div className="details-modal" style={{ maxWidth: '460px', padding: '2rem' }} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)} aria-label="Close account dialog">
          <X size={20} />
        </button>

        {isAuthenticated ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', margin: '0 auto 1rem', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserRound size={27} />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', marginBottom: '0.35rem' }}>Welcome, {currentUser.fullName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{currentUser.email} · {currentUser.phone}</p>
            <button className="btn btn-secondary" onClick={handleLogout}>Log Out</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {mode === 'login' ? <LogIn size={19} /> : <UserPlus size={19} />}
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{mode === 'login' ? 'Login with your email' : 'Register with email and mobile number'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', padding: '0.25rem', background: 'var(--bg-alt)', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <button type="button" onClick={() => switchMode('login')} style={{ flex: 1, padding: '0.55rem', borderRadius: '6px', background: mode === 'login' ? 'var(--bg-main)' : 'transparent', color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700' }}>Login</button>
              <button type="button" onClick={() => switchMode('register')} style={{ flex: 1, padding: '0.55rem', borderRadius: '6px', background: mode === 'register' ? 'var(--bg-main)' : 'transparent', color: mode === 'register' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700' }}>Register</button>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}><UserRound size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem' }} /><input className="form-control" style={{ paddingLeft: '2.25rem' }} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Rahul Sharma" required /></div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}><Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem' }} /><input className="form-control" style={{ paddingLeft: '2.25rem' }} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required /></div>
              </div>
              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <div style={{ position: 'relative' }}><Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem' }} /><input className="form-control" style={{ paddingLeft: '2.25rem' }} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" pattern="[0-9]{10}" maxLength="10" required /></div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}><LockKeyhole size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem' }} /><input className="form-control" style={{ paddingLeft: '2.25rem' }} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" minLength="6" required /></div>
              </div>
              {error && <p style={{ color: '#e11d48', fontSize: '0.8rem', marginBottom: '0.9rem' }}>{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>{isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
