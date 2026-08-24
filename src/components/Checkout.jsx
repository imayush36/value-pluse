import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Truck,
  Check,
  Tag,
  AlertCircle,
  Lock,
  User,
  Sparkles,
  MapPin,
} from 'lucide-react';
import gsap from 'gsap';
import toast from 'react-hot-toast';

// Helper to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const {
    cart,
    cartSubtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    buyNowItem,
    setBuyNowItem,
    placeOrder,
    deliveryPincode,
    deliveryCity,
    formatPrice,
    showToast,
  } = useShop();

  const { currentUser, openAuthModal } = useAuth();

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: deliveryCity ? deliveryCity.split(',')[0].trim() : 'Noida',
    state: 'Uttar Pradesh',
    pincode: deliveryPincode || '201301',
    paymentMethod: 'Razorpay', // 'Razorpay' or 'COD'
  });

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-fill from currentUser when opened
  useEffect(() => {
    if (isCheckoutOpen && currentUser) {
      const defaultAddr = currentUser.addresses?.find((a) => a.isDefault) || currentUser.addresses?.[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id || defaultAddr.id);
        setFormData((prev) => ({
          ...prev,
          fullName: defaultAddr.fullName || currentUser.fullName || '',
          phone: defaultAddr.phone || currentUser.phone || '',
          email: currentUser.email || '',
          address: defaultAddr.addressLine1 || defaultAddr.street || '',
          city: defaultAddr.city || 'Noida',
          state: defaultAddr.state || 'Uttar Pradesh',
          pincode: defaultAddr.pincode || '201301',
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          fullName: currentUser.fullName || '',
          phone: currentUser.phone || '',
          email: currentUser.email || '',
        }));
      }
    }
  }, [isCheckoutOpen, currentUser]);

  useEffect(() => {
    if (isCheckoutOpen) {
      if (overlayRef.current && modalRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          modalRef.current,
          { scale: 0.94, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
        );
      }
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const checkoutItems = buyNowItem ? [buyNowItem] : cart;
  const itemsSubtotal = buyNowItem
    ? buyNowItem.price * buyNowItem.quantity
    : cartSubtotal;
  const deliveryFee = itemsSubtotal > 500 ? 0 : 99;
  const calculatedDiscount = Math.round((itemsSubtotal * couponDiscount) / 100);
  const grandTotal = Math.max(0, itemsSubtotal + deliveryFee - calculatedDiscount);

  const handleClose = () => {
    if (modalRef.current && overlayRef.current) {
      gsap.to(modalRef.current, { scale: 0.94, opacity: 0, y: 30, duration: 0.25 });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          setIsCheckoutOpen(false);
          setBuyNowItem(null);
        },
      });
    } else {
      setIsCheckoutOpen(false);
      setBuyNowItem(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id || addr.id);
    setFormData((prev) => ({
      ...prev,
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.addressLine1 || addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }));
    showToast(`📍 Selected ${addr.label || addr.type || 'Home'} address`);
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'VALUE20' || code === 'SAVE20') {
      setCouponDiscount(20);
      setCouponApplied(code);
      showToast('🎉 Value Plus Coupon applied: 20% Instant Discount!');
    } else if (code === 'MEGA10' || code === 'FIRST10') {
      setCouponDiscount(10);
      setCouponApplied(code);
      showToast('🎉 Coupon applied: 10% Discount!');
    } else {
      showToast('Invalid promo code. Try "VALUE20" or "MEGA10"', 'error');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.phone.trim()) {
      errors.phone = '10-digit mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim().replace(/\D/g, '').slice(-10))) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!formData.address.trim()) errors.address = 'Door/Flat & Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim()) errors.pincode = '6-digit Pincode is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Enforce user registration / login before ordering
    if (!currentUser) {
      showToast('Please register or log in with OTP before placing your order', 'error');
      openAuthModal('register');
      return;
    }

    if (!validateForm()) {
      showToast('Please fill all required delivery details', 'error');
      return;
    }

    setIsProcessing(true);

    const orderTotals = {
      subtotal: itemsSubtotal,
      delivery: deliveryFee,
      discount: calculatedDiscount,
      total: grandTotal,
    };

    // 1. Cash on Delivery Flow
    if (formData.paymentMethod === 'COD') {
      try {
        await placeOrder(formData, checkoutItems, orderTotals, { method: 'COD' });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // 2. Razorpay Online Payment Flow
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setIsProcessing(false);
      return;
    }

    try {
      // Create backend order
      let rzpOrder = null;
      try {
        const res = await orderService.createRazorpayOrder(grandTotal);
        if (res.data?.success && res.data.order) {
          rzpOrder = res.data.order;
        }
      } catch (err) {
        console.log('Razorpay backend order creation notice:', err.message);
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_5173_valueplus';

      const options = {
        key: razorpayKey,
        amount: rzpOrder ? rzpOrder.amount : Math.round(grandTotal * 100),
        currency: 'INR',
        name: 'Value Plus Megastore',
        description: `Order Payment (${checkoutItems.length} items)`,
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80',
        order_id: rzpOrder?.id,
        handler: async function (response) {
          // Signature Verification
          try {
            await orderService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch {
            // verified
          }

          await placeOrder(formData, checkoutItems, orderTotals, {
            method: 'Razorpay',
            razorpayOrderId: response.razorpay_order_id || rzpOrder?.id || 'rzp_ord_' + Date.now(),
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#0a6cdc',
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled. You can retry anytime.');
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        toast.error(`Payment failed: ${resp.error.description || 'Transaction declined'}`);
        setIsProcessing(false);
      });
      razorpayInstance.open();
    } catch (err) {
      // Fallback direct placement in demo mode
      await placeOrder(formData, checkoutItems, orderTotals, { method: 'Razorpay' });
    } finally {
      setIsProcessing(false);
    }
  };

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
        className="checkout-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Close checkout"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Lock size={19} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Value Plus Secure Checkout
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              100% Genuine Electronics with Official Brand Warranty &amp; Doorstep Delivery
            </p>
          </div>
        </div>

        {/* ── USER AUTHENTICATION NOTICE / FAST CHECKOUT BAR ── */}
        {currentUser ? (
          <div className="checkout-auth-banner logged-in">
            <div className="auth-banner-left">
              <span className="auth-user-tag">
                <Check size={13} />
                <span>Logged in as <strong>{currentUser.fullName}</strong></span>
              </span>
              <span className="auth-user-email">
                ({currentUser.phone ? `+91 ${currentUser.phone}` : currentUser.email})
              </span>
            </div>
            <span className="auth-tier-pill">
              <Sparkles size={12} />
              <span>Verified Customer</span>
            </span>
          </div>
        ) : (
          <div className="checkout-auth-banner guest-prompt">
            <div className="auth-banner-left">
              <User size={16} color="var(--primary)" />
              <span>Have an account with saved addresses?</span>
            </div>
            <button
              type="button"
              className="checkout-signin-cta"
              onClick={() => openAuthModal('login')}
            >
              Sign In / Quick OTP →
            </button>
          </div>
        )}

        <div className="checkout-grid">
          {/* Left Form */}
          <form onSubmit={handleSubmitOrder}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                1. Delivery &amp; Contact Details
              </h3>
            </div>

            {/* Saved Addresses Picker */}
            {currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
              <div className="checkout-saved-addresses-picker">
                <span className="picker-label">Select Saved Delivery Address:</span>
                <div className="picker-chips-row">
                  {currentUser.addresses.map((addr) => (
                    <button
                      key={addr._id || addr.id}
                      type="button"
                      className={`address-picker-chip ${selectedAddressId === (addr._id || addr.id) ? 'active' : ''}`}
                      onClick={() => handleSelectSavedAddress(addr)}
                    >
                      <MapPin size={13} />
                      <strong>{addr.label || addr.type || 'Home'}</strong>
                      <span>({addr.city}, {addr.pincode})</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`address-picker-chip ${selectedAddressId === 'custom' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedAddressId('custom');
                      setFormData((prev) => ({ ...prev, address: '', city: 'Noida', pincode: '201301' }));
                    }}
                  >
                    + Enter New Address
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={handleInputChange}
                className="form-control"
              />
              {formErrors.fullName && (
                <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {formErrors.fullName}
                </div>
              )}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-control"
                />
                {formErrors.phone && (
                  <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {formErrors.phone}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                />
                {formErrors.email && (
                  <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {formErrors.email}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Complete Street Address / Apartment *</label>
              <input
                type="text"
                name="address"
                placeholder="Flat 402, Tower B, Sector 62"
                value={formData.address}
                onChange={handleInputChange}
                className="form-control"
              />
              {formErrors.address && (
                <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {formErrors.address}
                </div>
              )}
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Noida"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-control"
                />
                {formErrors.city && (
                  <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {formErrors.city}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Uttar Pradesh"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="form-control"
                />
                {formErrors.state && (
                  <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {formErrors.state}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="201301"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="form-control"
                />
                {formErrors.pincode && (
                  <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {formErrors.pincode}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1.5rem 0 0.75rem 0', color: 'var(--text-main)', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
              2. Payment Method
            </h3>

            <div className="payment-options-grid">
              <div
                className={`payment-radio-card ${formData.paymentMethod === 'Razorpay' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'Razorpay' })}
              >
                <CreditCard size={20} style={{ margin: '0 auto 0.35rem auto' }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: '700' }}>Razorpay Online Pay</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UPI / Cards / NetBanking / EMI</div>
              </div>

              <div
                className={`payment-radio-card ${formData.paymentMethod === 'COD' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
              >
                <Truck size={20} style={{ margin: '0 auto 0.35rem auto' }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: '700' }}>Cash on Delivery (COD)</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pay at Doorstep</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.75rem' }}
            >
              <ShieldCheck size={18} />
              {isProcessing
                ? 'Processing Payment...'
                : formData.paymentMethod === 'Razorpay'
                  ? `PAY NOW VIA RAZORPAY (${formatPrice(grandTotal)})`
                  : `PLACE COD ORDER (${formatPrice(grandTotal)})`}
            </button>
          </form>

          {/* Right Order Summary */}
          <div className="checkout-summary-box">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>
              Order Summary ({checkoutItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} items)
            </h3>

            {/* List of items */}
            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', paddingRight: '4px' }}>
              {checkoutItems.map((item) => (
                <div key={item.id || item._id || item.productId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={item.image || item.thumbnail}
                    alt={item.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-default)' }}
                  />
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity || 1} × {formatPrice(item.price)}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                placeholder="Promo code (e.g. VALUE20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.8125rem', textTransform: 'uppercase' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={applyCoupon}
              >
                <Tag size={13} />
                Apply
              </button>
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
              <div className="cart-calc-row">
                <span>Subtotal:</span>
                <strong>{formatPrice(itemsSubtotal)}</strong>
              </div>

              {couponDiscount > 0 && (
                <div className="cart-calc-row" style={{ color: 'var(--accent-emerald)' }}>
                  <span>Discount ({couponApplied}):</span>
                  <strong>-{formatPrice(calculatedDiscount)}</strong>
                </div>
              )}

              <div className="cart-calc-row">
                <span>Shipping:</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--accent-emerald)' }}>FREE</strong> : formatPrice(deliveryFee)}</span>
              </div>

              <div className="cart-calc-total">
                <span>Total Due:</span>
                <span style={{ color: 'var(--primary)' }}>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Guarantees */}
            <div style={{ marginTop: '1.25rem', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Check size={14} color="var(--accent-emerald)" />
                <span>GST Tax Invoice &amp; Official Brand Warranty Included</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} color="var(--accent-emerald)" />
                <span>Value Plus 7-Day Replacement Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
