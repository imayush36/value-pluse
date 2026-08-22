// @ts-nocheck
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserPlus, Settings, ShieldCheck, BellRing } from 'lucide-react';

export default function SidebarNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/register', label: 'Registration', icon: UserPlus },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">V</span>
        <div>
          <strong>Value Plus</strong>
          <small>Admin Panel</small>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} className={`sidebar-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-card">
        <div className="sidebar-card-icon">
          <ShieldCheck size={18} />
        </div>
        <div>
          <strong>Security</strong>
          <p>Protected account</p>
        </div>
      </div>

      <div className="sidebar-card secondary">
        <div className="sidebar-card-icon yellow">
          <BellRing size={18} />
        </div>
        <div>
          <strong>Alerts</strong>
          <p>2 new updates</p>
        </div>
      </div>
    </aside>
  );
}
