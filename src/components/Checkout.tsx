// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
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
  Building2,
} from 'lucide-react';
import gsap from 'gsap';

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

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: deliveryCity ? deliveryCity.split(',')[0] : 'Noida',
    state: 'Uttar Pradesh',
    pincode: deliveryPincode || '201301',
    paymentMethod: 'upi', // 'upi', 'card', 'cod'
  });

  const [formErrors, setFormErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');

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

  const deliveryFee = itemsSubtotal >= 999 ? 0 : 99;
  const calculatedDiscount = (itemsSubtotal * couponDiscount) / 100;
  const grandTotal = Math.max(0, itemsSubtotal - calculatedDiscount + deliveryFee);

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, { scale: 0.95, opacity: 0, duration: 0.25 });
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

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fill all required delivery details', 'error');
      return;
    }

    placeOrder(formData, checkoutItems, {
      subtotal: itemsSubtotal,
      delivery: deliveryFee,
      discount: calculatedDiscount,
      total: grandTotal,
    });
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Lock size={19} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Value Plus Secure Checkout
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              100% Frontend static demo order simulation — No real payment charged.
            </p>
          </div>
        </div>

        <div className="checkout-grid">
          {/* Left Form */}
          <form onSubmit={handleSubmitOrder}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
              1. Delivery &amp; Contact Details
            </h3>

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
              2. Demo Payment Method
            </h3>

            <div className="payment-options-grid">
              <div
                className={`payment-radio-card ${formData.paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
              >
                <Smartphone size={20} style={{ margin: '0 auto 0.35rem auto' }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: '700' }}>UPI / GPay / Paytm</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Demo Instant QR</div>
              </div>

              <div
                className={`payment-radio-card ${formData.paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
              >
                <CreditCard size={20} style={{ margin: '0 auto 0.35rem auto' }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: '700' }}>Credit / Debit Card</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Visa / Mastercard / RuPay</div>
              </div>

              <div
                className={`payment-radio-card ${formData.paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
              >
                <Truck size={20} style={{ margin: '0 auto 0.35rem auto' }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: '700' }}>Cash on Delivery</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pay at Doorstep</div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.75rem' }}
            >
              <ShieldCheck size={18} />
              PLACE ORDER ({formatPrice(grandTotal)})
            </button>
          </form>

          {/* Right Order Summary */}
          <div className="checkout-summary-box">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>
              Order Summary ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)} items)
            </h3>

            {/* List of items */}
            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', paddingRight: '4px' }}>
              {checkoutItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-default)' }}
                  />
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {formatPrice(item.price * item.quantity)}
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
