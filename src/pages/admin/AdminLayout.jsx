import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Grid,
  Mail,
  LogOut,
  Store,
  ExternalLink,
  Shield,
} from 'lucide-react';

export default function AdminLayout() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/products', label: 'Products', icon: <Package size={18} /> },
    { to: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
    { to: '/admin/categories', label: 'Categories', icon: <Grid size={18} /> },
    { to: '/admin/users', label: 'Customers', icon: <Users size={18} /> },
    { to: '/admin/contacts', label: 'Messages', icon: <Mail size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="bg-primary text-white font-extrabold text-xs px-2 py-1 rounded">
                VALUE PLUS
              </div>
              <span className="text-xs font-semibold text-blue-300 tracking-wider">ADMIN</span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info & Store Link */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/40 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store size={14} /> View Store
            </span>
            <ExternalLink size={12} />
          </Link>

          <div className="flex items-center justify-between px-2 pt-2 text-xs">
            <div className="truncate">
              <div className="font-semibold text-white truncate">{currentUser?.fullName || 'Admin'}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
