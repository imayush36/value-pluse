import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const res = await resetPassword(token, password);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2500);
    }
  };

  return (
    <div className="reset-password-page py-16">
      <div className="container max-w-md">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Password Updated!</h2>
              <p className="text-sm text-slate-600">
                Your password has been successfully reset. Redirecting you to the home page...
              </p>
              <Link
                to="/"
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold inline-block"
              >
                Go to Home
              </Link>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-4">
                <Lock size={24} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Set New Password</h1>
              <p className="text-xs text-slate-500 mb-6">
                Please enter a secure password with at least 6 characters.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {loading ? 'Updating Password...' : 'Reset Password'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
