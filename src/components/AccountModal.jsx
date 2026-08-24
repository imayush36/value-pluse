import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import {
  X,
  User,
  MapPin,
  Package,
  Shield,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Truck,
  Clock,
  Download,
  Check,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Home,
  Building,
  CreditCard,
  Lock,
} from 'lucide-react';
import gsap from 'gsap';

export default function AccountModal() {
  const {
    currentUser,
    isAccountModalOpen,
    closeAccountModal,
    accountActiveTab,
    setAccountActiveTab,
    updateUserProfile,
    addSavedAddress,
    updateSavedAddress,
    deleteSavedAddress,
    setDefaultSavedAddress,
    logout,
  } = useAuth();

  const { orders, formatPrice, showToast, setIsOrdersModalOpen } = useShop();

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
  });

  // Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    fullName: '',
    phone: '',
    street: '',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    isDefault: false,
  });

  // Password Change State
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Sync profile form when user changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        gender: currentUser.gender || 'Male',
        dob: currentUser.dob || '',
      });
    }
  }, [currentUser]);

  // Modal animation
  useEffect(() => {
    if (isAccountModalOpen && overlayRef.current && modalRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.94, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
    }
  }, [isAccountModalOpen]);

  if (!isAccountModalOpen || !currentUser) return null;

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, { scale: 0.95, opacity: 0, duration: 0.2 });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: closeAccountModal,
      });
    } else {
      closeAccountModal();
    }
  };

  // Handlers
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      showToast('Full name is required', 'error');
      return;
    }
    updateUserProfile(profileForm);
    showToast('✓ Profile updated successfully!');
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.pincode.trim()) {
      showToast('Please fill all address fields', 'error');
      return;
    }

    if (editingAddressId) {
      updateSavedAddress(editingAddressId, addressForm);
      showToast('✓ Address updated successfully!');
      setEditingAddressId(null);
    } else {
      addSavedAddress(addressForm);
      showToast('✓ New address added!');
    }

    setIsAddingAddress(false);
    setAddressForm({
      type: 'Home',
      fullName: currentUser.fullName,
      phone: currentUser.phone,
      street: '',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
      isDefault: false,
    });
  };

  const handleStartEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      type: addr.type || 'Home',
      fullName: addr.fullName || currentUser.fullName,
      phone: addr.phone || currentUser.phone,
      street: addr.street || '',
      city: addr.city || 'Noida',
      state: addr.state || 'Uttar Pradesh',
      pincode: addr.pincode || '201301',
      isDefault: addr.isDefault || false,
    });
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = (id) => {
    deleteSavedAddress(id);
    showToast('Address removed', 'info');
  };

  const handleSetDefaultAddress = (id) => {
    setDefaultSavedAddress(id);
    showToast('Default delivery address updated');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passForm.currentPassword !== currentUser.password) {
      showToast('Incorrect current password', 'error');
      return;
    }
    if (passForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    updateUserProfile({ password: passForm.newPassword });
    setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('✓ Password changed successfully!');
  };

  const handleDownloadInvoice = (orderId) => {
    showToast(`📄 Generating GST Tax Invoice for #${orderId}...`);
    setTimeout(() => {
      showToast(`✓ Invoice #${orderId}.pdf downloaded!`);
    }, 800);
  };

  const userInitials = (currentUser.fullName || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      ref={overlayRef}
      className="modal-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="account-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Close Account Modal"
        >
          <X size={20} />
        </button>

        {/* ── ACCOUNT MODAL HEADER ── */}
        <div className="account-modal-header">
          <div className="account-avatar-wrap">
            <div className="account-avatar-initials">{userInitials}</div>
          </div>
          <div className="account-header-info">
            <div className="account-name-row">
              <h2 className="account-user-name">{currentUser.fullName}</h2>
              <span className="account-tier-badge">
                <Sparkles size={13} />
                <span>{currentUser.membershipTier || 'Gold Member'}</span>
              </span>
            </div>
            <div className="account-contact-line">
              <span>{currentUser.phone ? `+91 ${currentUser.phone}` : ''}</span>
              {currentUser.email && <span className="dot-sep">•</span>}
              <span>{currentUser.email}</span>
            </div>
          </div>

          <div className="account-wallet-pill">
            <span className="wallet-label">VP Points</span>
            <strong className="wallet-amount">{currentUser.walletPoints || 500} pts</strong>
          </div>
        </div>

        {/* ── ACCOUNT BODY WITH TABS ── */}
        <div className="account-modal-body">
          {/* Navigation Sidebar */}
          <aside className="account-nav-tabs">
            <button
              type="button"
              className={`account-nav-item ${accountActiveTab === 'profile' ? 'active' : ''}`}
              onClick={() => setAccountActiveTab('profile')}
            >
              <User size={18} />
              <span>Personal Details</span>
            </button>

            <button
              type="button"
              className={`account-nav-item ${accountActiveTab === 'addresses' ? 'active' : ''}`}
              onClick={() => { setAccountActiveTab('addresses'); setIsAddingAddress(false); }}
            >
              <MapPin size={18} />
              <span>Saved Addresses ({currentUser.addresses?.length || 0})</span>
            </button>

            <button
              type="button"
              className={`account-nav-item ${accountActiveTab === 'orders' ? 'active' : ''}`}
              onClick={() => setAccountActiveTab('orders')}
            >
              <Package size={18} />
              <span>My Orders ({orders.length})</span>
            </button>

            <button
              type="button"
              className={`account-nav-item ${accountActiveTab === 'security' ? 'active' : ''}`}
              onClick={() => setAccountActiveTab('security')}
            >
              <Shield size={18} />
              <span>Security &amp; Password</span>
            </button>

            <div className="account-nav-divider" />

            <button
              type="button"
              className="account-nav-item account-logout-btn"
              onClick={() => {
                logout();
                showToast('👋 You have been logged out successfully.', 'info');
              }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </aside>

          {/* Main Tab Panel Content */}
          <main className="account-panel-content">

            {/* TAB 1: PERSONAL DETAILS */}
            {accountActiveTab === 'profile' && (
              <div className="account-tab-view">
                <div className="tab-view-header">
                  <h3 className="tab-view-title">Personal Profile Information</h3>
                  <p className="tab-view-sub">Manage your account details and contact preferences</p>
                </div>

                <form onSubmit={handleSaveProfile} className="account-form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                      className="form-control"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dob}
                      onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary">
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: SAVED ADDRESSES */}
            {accountActiveTab === 'addresses' && (
              <div className="account-tab-view">
                <div className="tab-view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 className="tab-view-title">Saved Delivery Addresses</h3>
                    <p className="tab-view-sub">Manage addresses for fast 1-click checkout</p>
                  </div>
                  {!isAddingAddress && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressForm({
                          type: 'Home',
                          fullName: currentUser.fullName,
                          phone: currentUser.phone,
                          street: '',
                          city: 'Noida',
                          state: 'Uttar Pradesh',
                          pincode: '201301',
                          isDefault: false,
                        });
                        setIsAddingAddress(true);
                      }}
                    >
                      <Plus size={15} />
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {isAddingAddress ? (
                  /* Add / Edit Address Form */
                  <form onSubmit={handleAddressSubmit} className="address-add-card">
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
                      {editingAddressId ? 'Edit Address' : 'Add New Delivery Address'}
                    </h4>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mobile Number *</label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Complete Street Address / Apartment *</label>
                      <input
                        type="text"
                        placeholder="House / Flat No., Street, Landmark"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Pincode *</label>
                        <input
                          type="text"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>

                    <div className="address-type-selector">
                      <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Address Type:</span>
                      {['Home', 'Work', 'Other'].map((t) => (
                        <label key={t} className="channel-radio">
                          <input
                            type="radio"
                            name="addrType"
                            value={t}
                            checked={addressForm.type === t}
                            onChange={() => setAddressForm({ ...addressForm, type: t })}
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                      <button type="submit" className="btn btn-primary">
                        {editingAddressId ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsAddingAddress(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Saved Addresses List */
                  <div className="saved-addresses-grid">
                    {currentUser.addresses && currentUser.addresses.length > 0 ? (
                      currentUser.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`saved-address-card ${addr.isDefault ? 'is-default' : ''}`}
                        >
                          <div className="address-card-top">
                            <div className="address-badge-group">
                              <span className="address-type-tag">
                                {addr.type === 'Work' ? <Building size={12} /> : <Home size={12} />}
                                <span>{addr.type || 'Home'}</span>
                              </span>
                              {addr.isDefault && (
                                <span className="address-default-tag">Default</span>
                              )}
                            </div>
                            <div className="address-card-actions">
                              <button
                                type="button"
                                className="address-icon-btn"
                                onClick={() => handleStartEditAddress(addr)}
                                title="Edit"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                type="button"
                                className="address-icon-btn text-danger"
                                onClick={() => handleDeleteAddress(addr.id)}
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="address-card-name">{addr.fullName}</div>
                          <div className="address-card-text">
                            {addr.street}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </div>
                          <div className="address-card-phone">
                            <Phone size={13} />
                            <span>+91 {addr.phone}</span>
                          </div>

                          {!addr.isDefault && (
                            <button
                              type="button"
                              className="address-make-default-btn"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                            >
                              Set as Default Delivery Address
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-tab-state">
                        <MapPin size={40} color="var(--text-light)" />
                        <h4>No Saved Addresses</h4>
                        <p>Add your home or office address for fast 1-click checkout.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MY ORDERS */}
            {accountActiveTab === 'orders' && (
              <div className="account-tab-view">
                <div className="tab-view-header">
                  <h3 className="tab-view-title">Order History &amp; Tracking</h3>
                  <p className="tab-view-sub">Track real-time shipment status and download tax invoices</p>
                </div>

                {orders && orders.length > 0 ? (
                  <div className="account-orders-list">
                    {orders.map((order) => (
                      <div key={order.orderId} className="account-order-card">
                        <div className="order-card-header">
                          <div>
                            <span className="order-id-label">ORDER ID</span>
                            <strong className="order-id-val">{order.orderId}</strong>
                            <span className="order-date-val">
                              {new Date(order.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="order-header-right">
                            <span className="order-status-badge status-confirmed">
                              <CheckCircle2 size={13} />
                              <span>{order.status || 'Confirmed'}</span>
                            </span>
                            <button
                              type="button"
                              className="invoice-download-btn"
                              onClick={() => handleDownloadInvoice(order.orderId)}
                              title="Download GST Invoice"
                            >
                              <Download size={13} />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </div>

                        {/* Tracking Timeline */}
                        <div className="order-tracking-bar">
                          <div className="track-step step-done">
                            <div className="track-dot"><Check size={11} /></div>
                            <span>Placed</span>
                          </div>
                          <div className="track-line active" />
                          <div className="track-step step-done">
                            <div className="track-dot"><Check size={11} /></div>
                            <span>Confirmed</span>
                          </div>
                          <div className="track-line active" />
                          <div className="track-step step-active">
                            <div className="track-dot"><Truck size={11} /></div>
                            <span>Express Shipping</span>
                          </div>
                          <div className="track-line" />
                          <div className="track-step">
                            <div className="track-dot" />
                            <span>Delivered ({order.estimatedDelivery})</span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="order-items-scroll">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-item-mini-row">
                              <img src={item.image} alt={item.name} />
                              <div className="order-item-text">
                                <div className="order-item-title">{item.name}</div>
                                <div className="order-item-qty">
                                  Qty: {item.quantity} × {formatPrice(item.price)}
                                </div>
                              </div>
                              <div className="order-item-sum">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-card-footer">
                          <span className="order-footer-dest">
                            📍 Delivering to: {order.customer?.city || 'Noida'}, {order.customer?.pincode || '201301'}
                          </span>
                          <span className="order-footer-total">
                            Total Paid: <strong>{formatPrice(order.total)}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-tab-state">
                    <Package size={40} color="var(--text-light)" />
                    <h4>No Orders Placed Yet</h4>
                    <p>Your placed orders and tracking updates will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SECURITY */}
            {accountActiveTab === 'security' && (
              <div className="account-tab-view">
                <div className="tab-view-header">
                  <h3 className="tab-view-title">Account Security</h3>
                  <p className="tab-view-sub">Update password and manage authentication settings</p>
                </div>

                <form onSubmit={handleChangePassword} className="security-form-box">
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>
                    Change Account Password
                  </h4>

                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                      className="form-control"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password (min 6 characters)</label>
                    <input
                      type="password"
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                      className="form-control"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      value={passForm.confirmPassword}
                      onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                      className="form-control"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    Update Password
                  </button>
                </form>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
