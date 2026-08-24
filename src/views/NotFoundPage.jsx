import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ShoppingBag } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="not-found-page py-20">
      <div className="container max-w-md text-center">
        <div className="text-8xl font-black text-blue-100 mb-2">404</div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-500 text-sm mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Home size={16} /> Back to Home
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingBag size={16} /> Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
