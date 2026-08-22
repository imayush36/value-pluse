'use client';

import Link from 'next/link';

export default function SettingsPage() {
  return (
    <main className="settings-page-shell">
      <div className="settings-panel">
        <div className="settings-header">
          <div>
            <p className="settings-kicker">Account</p>
            <h1>Settings</h1>
          </div>
          <Link href="/register" className="ghost-button">Register</Link>
        </div>

        <div className="settings-grid">
          <section className="settings-card">
            <h2>Profile</h2>
            <label className="settings-field">
              <span>Full name</span>
              <input type="text" defaultValue="Amit Sharma" />
            </label>
            <label className="settings-field">
              <span>Email</span>
              <input type="email" defaultValue="amit@example.com" />
            </label>
            <label className="settings-field">
              <span>Phone number</span>
              <input type="tel" defaultValue="+91 98765 43210" />
            </label>
          </section>

          <section className="settings-card">
            <h2>Preferences</h2>
            <label className="toggle-row">
              <span>Order alerts</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="toggle-row">
              <span>Promotional emails</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="toggle-row">
              <span>Newsletter</span>
              <input type="checkbox" />
            </label>
          </section>
        </div>

        <div className="settings-actions">
          <button type="button" className="secondary-button">Cancel</button>
          <button type="button" className="primary-button">Save changes</button>
        </div>
      </div>
    </main>
  );
}
