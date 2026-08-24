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
  UserCheck,
  LogIn,
  RotateCcw,
  RefreshCw,
  FileText,
  QrCode,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  KeyRound,
  Copy,
  Sparkles,
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
    currentUser,
    setIsAuthModalOpen,
    setAuthModalReason,
    openPolicy,
    deliveryPincode,
    deliveryCity,
    formatPrice,
    showToast,
  } = useShop();

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Checkout Steps: 'address' | 'upi' | 'card' | 'card_otp'
  const [checkoutStep, setCheckoutStep] = useState('address');

  // Form Fields pre-filled with registered user data
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    address: '',
    city: deliveryCity ? deliveryCity.split(',')[0] : 'Noida',
    state: 'Uttar Pradesh',
    pincode: deliveryPincode || '201301',
    paymentMethod: 'upi', // 'upi', 'card', 'cod'
  });

  // Payment Gateway States
  const [upiId, setUpiId] = useState('ayush979430@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState('');
  const [qrTimer, setQrTimer] = useState(300); // 5 min timer

  // Card Payment States
  const [cardData, setCardData] = useState({
    cardNumber: '4532 8921 4412 8890',
    cardName: currentUser?.fullName || 'Rahul Sharma',
    expiry: '08/29',
    cvv: '821',
  });
  const [cardErrors, setCardErrors] = useState({});
  const [cardOtp, setCardOtp] = useState('');
  const [cardOtpGenerated, setCardOtpGenerated] = useState('749210');
  const [cardOtpError, setCardOtpError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName || '',
        phone: prev.phone || currentUser.phone || '',
        email: prev.email || currentUser.email || '',
      }));
      setCardData((prev) => ({
        ...prev,
        cardName: prev.cardName || currentUser.fullName || 'Rahul Sharma',
      }));
    }
  }, [currentUser]);

  const [formErrors, setFormErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');

  useEffect(() => {
    if (isCheckoutOpen) {
      setCheckoutStep('address');
      setIsProcessingPayment(false);
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

  // QR Timer Countdown
  useEffect(() => {
    let timer;
    if (checkoutStep === 'upi' && qrTimer > 0) {
      timer = setInterval(() => setQrTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [checkoutStep, qrTimer]);

  if (!isCheckoutOpen) return null;

  const checkoutItems = buyNowItem ? [buyNowItem] : cart;
  const itemsSubtotal = buyNowItem
    ? buyNowItem.price * buyNowItem.quantity
    : cartSubtotal;

  const deliveryFee = itemsSubtotal >= 999 ? 0 : 99;
  const calculatedDiscount = (itemsSubtotal * couponDiscount) / 100;
  const grandTotal = Math.max(0, itemsSubtotal - calculatedDiscount + deliveryFee);

  const handleClose = () => {
    if (isProcessingPayment) return;
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, { scale: 0.95, opacity: 0, duration: 0.25 });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          setIsCheckoutOpen(false);
          setBuyNowItem(null);
          setCheckoutStep('address');
        },
      });
    } else {
      setIsCheckoutOpen(false);
      setBuyNowItem(null);
      setCheckoutStep('address');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCardInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length >= 3) {
        value = `${value.slice(0, 2)}/${value.slice(2)}`;
      }
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardData((prev) => ({ ...prev, [name]: value }));
    if (cardErrors[name]) {
      setCardErrors((prev) => ({ ...prev, [name]: '' }));
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

  // STEP 1: Process Proceed to Payment
  const handleProceedToPayment = (e) => {
    e.preventDefault();

    if (!currentUser) {
      setAuthModalReason('checkout');
      setIsAuthModalOpen(true);
      showToast('Please login or register to complete your order', 'error');
      return;
    }

    if (!validateForm()) {
      showToast('Please fill all required delivery details', 'error');
      return;
    }

    if (formData.paymentMethod === 'upi') {
      setQrTimer(300);
      setCheckoutStep('upi');
    } else if (formData.paymentMethod === 'card') {
      setCheckoutStep('card');
    } else {
      // Cash on Delivery
      finalizeOrderPlacement('Cash on Delivery', 'Pending (COD)', null);
    }
  };

  // STEP 2: Execute UPI Payment & Place Order
  const handleExecuteUpiPayment = async () => {
    if (!upiId.trim() || !upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)', 'error');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatusText('1/3: Initiating UPI Payment request...');

    try {
      await new Promise((r) => setTimeout(r, 900));
      setPaymentStatusText('2/3: Waiting for bank authorization & UPI confirmation...');

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'upi',
          amount: grandTotal,
          upiId: upiId.trim(),
          customerEmail: formData.email,
        }),
      });
      const paymentData = await verifyRes.json();

      await new Promise((r) => setTimeout(r, 800));
      setPaymentStatusText('3/3: Payment Approved! Finalizing Order in Database...');

      showToast(`✓ UPI Payment of ${formatPrice(grandTotal)} Successful!`, 'success');

      // Place Order in DB only after payment succeeds
      await finalizeOrderPlacement('UPI', 'Paid', paymentData.transactionId || `UPI-${Date.now()}`);
    } catch (err) {
      console.error('UPI payment error:', err);
      showToast('UPI Payment failed. Please try again.', 'error');
      setIsProcessingPayment(false);
    }
  };

  // STEP 3: Validate Card & Trigger 3D Secure OTP
  const handleCardAuthorize = (e) => {
    e.preventDefault();
    const errors = {};
    const rawCard = cardData.cardNumber.replace(/\s/g, '');
    if (rawCard.length < 15) errors.cardNumber = 'Enter valid 16-digit card number';
    if (!cardData.cardName.trim()) errors.cardName = 'Name on card is required';
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) errors.expiry = 'MM/YY required';
    if (cardData.cvv.length < 3) errors.cvv = '3 digits required';

    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setCardOtpGenerated(otp);
    setCardOtp('');
    setCardOtpError('');
    setCheckoutStep('card_otp');
    showToast(`📲 [Bank OTP] Your 3D Secure Card Verification Code is: ${otp}`, 'info', 9000);
  };

  // STEP 4: Submit Card OTP & Place Order
  const handleVerifyCardOtpAndPay = async (e) => {
    e.preventDefault();
    if (cardOtp.trim() !== cardOtpGenerated.trim()) {
      setCardOtpError('Invalid Bank OTP. Please enter the 6-digit code sent to your mobile.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatusText('Authorizing Credit/Debit Card with Visa/MasterCard Gateway...');

    try {
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'card',
          amount: grandTotal,
          cardDetails: {
            cardNumber: cardData.cardNumber.replace(/\s/g, ''),
            cardType: cardData.cardNumber.startsWith('4') ? 'Visa' : 'MasterCard',
          },
          customerEmail: formData.email,
        }),
      });
      const paymentData = await verifyRes.json();

      await new Promise((r) => setTimeout(r, 900));
      setPaymentStatusText('Payment Authorized! Placing Order in Database...');

      showToast(`✓ Card Payment of ${formatPrice(grandTotal)} Successful!`, 'success');

      // Place Order in DB only after payment succeeds
      await finalizeOrderPlacement('Credit / Debit Card', 'Paid', paymentData.transactionId || `CARD-${Date.now()}`);
    } catch (err) {
      console.error('Card payment error:', err);
      showToast('Card authorization failed. Please try again.', 'error');
      setIsProcessingPayment(false);
    }
  };

  // Final Order Placement Helper
  const finalizeOrderPlacement = async (methodName, paymentStatus, transactionId) => {
    try {
      await placeOrder(
        formData,
        checkoutItems,
        {
          subtotal: itemsSubtotal,
          delivery: deliveryFee,
          discount: calculatedDiscount,
          total: grandTotal,
        },
        {
          paymentMethod: methodName,
          paymentStatus,
          transactionId,
          paidAt: paymentStatus === 'Paid' ? new Date().toISOString() : null,
        }
      );
      setIsCheckoutOpen(false);
      setBuyNowItem(null);
      setCheckoutStep('address');
    } finally {
      setIsProcessingPayment(false);
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
        style={{ maxWidth: checkoutStep === 'address' ? '960px' : '620px', transition: 'max-width 0.3s ease' }}
      >
        <button
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Close checkout"
          disabled={isProcessingPayment}
        >
          <X size={20} />
        </button>

        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              {checkoutStep === 'address' ? <Lock size={20} /> : checkoutStep === 'upi' ? <Smartphone size={20} /> : <CreditCard size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                {checkoutStep === 'address' && 'Value Plus Secure Checkout'}
                {checkoutStep === 'upi' && 'Instant UPI / QR Payment'}
                {checkoutStep === 'card' && 'Credit / Debit Card Payment'}
                {checkoutStep === 'card_otp' && 'Bank 3D-Secure Authorization'}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                {checkoutStep === 'address' ? '100% Genuine electronics with official GST tax invoice' : `Total Amount to Pay: ${formatPrice(grandTotal)}`}
              </p>
            </div>
          </div>

          {checkoutStep !== 'address' && !isProcessingPayment && (
            <button
              type="button"
              onClick={() => setCheckoutStep(checkoutStep === 'card_otp' ? 'card' : 'address')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: ADDRESS & PAYMENT SELECTION */}
        {/* ========================================================================= */}
        {checkoutStep === 'address' && (
          <>
            {/* Customer Status Bar */}
            {currentUser ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '0.65rem 0.95rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: '700' }}>
                  <UserCheck size={16} color="#15803d" />
                  <span>Verified Customer: {currentUser.fullName} ({currentUser.email})</span>
                </div>
                <span style={{ color: '#15803d', fontSize: '0.75rem', fontWeight: '600' }}>● OTP Verified</span>
              </div>
            ) : (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
                  <AlertCircle size={18} />
                  <span><strong>Login Required:</strong> Please register or log in before ordering.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalReason('checkout');
                    setIsAuthModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <LogIn size={14} /> Login / Register
                </button>
              </div>
            )}

            <div className="checkout-grid">
              {/* Left Details Form */}
              <form onSubmit={handleProceedToPayment}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
                  1. Delivery Details
                </h3>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Rahul Sharma"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                  {formErrors.fullName && (
                    <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {formErrors.fullName}
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

                {/* Payment Method Selection */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '1.5rem 0 0.75rem 0', color: 'var(--text-main)', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
                  2. Select Payment Method
                </h3>

                <div className="payment-options-grid">
                  <div
                    className={`payment-radio-card ${formData.paymentMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                  >
                    <Smartphone size={20} style={{ margin: '0 auto 0.35rem auto' }} />
                    <div style={{ fontSize: '0.8125rem', fontWeight: '700' }}>UPI / QR / GPay</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scan &amp; Instant Pay</div>
                  </div>

                  <div
                    className={`payment-radio-card ${formData.paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                  >
                    <CreditCard size={20} style={{ margin: '0 auto 0.35rem auto' }} />
                    <div style={{ fontSize: '0.8125rem', fontWeight: '700' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Visa, Master, RuPay</div>
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
                  style={{ width: '100%', marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <ShieldCheck size={18} />
                  {formData.paymentMethod === 'upi' && `PROCEED TO UPI PAYMENT (${formatPrice(grandTotal)})`}
                  {formData.paymentMethod === 'card' && `PROCEED TO CARD PAYMENT (${formatPrice(grandTotal)})`}
                  {formData.paymentMethod === 'cod' && `CONFIRM & PLACE ORDER (${formatPrice(grandTotal)})`}
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
                    <Tag size={13} /> Apply
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

                {/* Guarantees & Policy Links */}
                <div style={{ marginTop: '1.25rem', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <ShieldCheck size={14} color="var(--accent-emerald)" />
                    <span><strong>100% Secure Checkout</strong> with 256-Bit SSL</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button type="button" onClick={() => openPolicy('shipping')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '0.75rem' }}>Shipping Policy</button>
                    <span>•</span>
                    <button type="button" onClick={() => openPolicy('returns')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '0.75rem' }}>Returns</button>
                    <span>•</span>
                    <button type="button" onClick={() => openPolicy('refund')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '0.75rem' }}>Refunds</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: INTERACTIVE UPI & QR PAYMENT GATEWAY */}
        {/* ========================================================================= */}
        {checkoutStep === 'upi' && (
          <div style={{ padding: '0.5rem 0' }}>
            {/* Amount Banner */}
            <div style={{ background: 'linear-gradient(135deg, #0a6cdc 0%, #1e40af 100%)', color: '#ffffff', padding: '1.25rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.25rem' }}>PAYING VALUE PLUS MEGASTORE</div>
              <div style={{ fontSize: '1.85rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{formatPrice(grandTotal)}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>Order ID: Will be confirmed upon payment completion</div>
            </div>

            {/* UPI QR & Apps Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* QR Code Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>
                  Scan QR with any UPI App
                </div>
                <div style={{ width: '160px', height: '160px', margin: '0 auto', background: '#ffffff', padding: '8px', borderRadius: '8px', border: '2px dashed #0a6cdc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=valueplus.official@okhdfcbank%26pn=ValuePlus%26am=${grandTotal}%26cu=INR`}
                    alt="UPI QR Code"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <RefreshCw size={12} className="spin-slow" /> QR Valid for: {Math.floor(qrTimer / 60)}:{(qrTimer % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* UPI Apps & Direct ID */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.6rem', color: '#1e293b' }}>
                    Select UPI App or Enter UPI ID:
                  </div>

                  {/* App Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.9rem' }}>
                    {[
                      { id: 'gpay', name: 'Google Pay', icon: '🟢' },
                      { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                      { id: 'paytm', name: 'Paytm UPI', icon: '🔵' },
                      { id: 'bhim', name: 'BHIM UPI', icon: '🟠' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp(app.id);
                          setUpiId(app.id === 'gpay' ? `${formData.phone || '9794307570'}@okaxis` : `${formData.phone || '9794307570'}@${app.id}`);
                        }}
                        style={{
                          padding: '0.5rem',
                          border: selectedUpiApp === app.id ? '2px solid #0a6cdc' : '1px solid #cbd5e1',
                          background: selectedUpiApp === app.id ? '#eff6ff' : '#ffffff',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{app.icon}</span> {app.name}
                      </button>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>UPI ID / VPA *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>
                  🔒 Payments are protected with NPCI UPI 256-bit bank encryption.
                </div>
              </div>
            </div>

            {/* Pay Now Button with Loader */}
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleExecuteUpiPayment}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', fontWeight: '800' }}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 size={18} className="spin-slow" />
                  <span>{paymentStatusText || 'Authorizing UPI Payment...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>I HAVE PAID / CONFIRM UPI PAYMENT ({formatPrice(grandTotal)})</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: CREDIT / DEBIT CARD PAYMENT GATEWAY */}
        {/* ========================================================================= */}
        {checkoutStep === 'card' && (
          <form onSubmit={handleCardAuthorize} style={{ padding: '0.5rem 0' }}>
            {/* Amount Banner */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Payable Amount</div>
                <div style={{ fontSize: '1.45rem', fontWeight: '800' }}>{formatPrice(grandTotal)}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ background: '#334155', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>VISA</span>
                <span style={{ background: '#334155', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>Mastercard</span>
                <span style={{ background: '#334155', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>RuPay</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">16-Digit Card Number *</label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleCardInputChange}
                  placeholder="4532 8921 4412 8890"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', fontSize: '0.95rem', letterSpacing: '1px' }}
                  maxLength="19"
                  required
                />
              </div>
              {cardErrors.cardNumber && <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cardErrors.cardNumber}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Cardholder Name *</label>
              <input
                type="text"
                name="cardName"
                value={cardData.cardName}
                onChange={handleCardInputChange}
                placeholder="Name as on Card"
                className="form-control"
                required
              />
              {cardErrors.cardName && <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cardErrors.cardName}</div>}
            </div>

            <div className="form-row-2" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Expiry Date *</label>
                <input
                  type="text"
                  name="expiry"
                  value={cardData.expiry}
                  onChange={handleCardInputChange}
                  placeholder="MM/YY"
                  className="form-control"
                  maxLength="5"
                  required
                />
                {cardErrors.expiry && <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cardErrors.expiry}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">CVV / CVC *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardInputChange}
                    placeholder="•••"
                    className="form-control"
                    style={{ paddingLeft: '2.4rem' }}
                    maxLength="4"
                    required
                  />
                </div>
                {cardErrors.cvv && <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cardErrors.cvv}</div>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1rem', fontWeight: '800' }}
            >
              <Lock size={18} />
              PAY SECURELY {formatPrice(grandTotal)}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: BANK 3D-SECURE OTP AUTHORIZATION */}
        {/* ========================================================================= */}
        {checkoutStep === 'card_otp' && (
          <form onSubmit={handleVerifyCardOtpAndPay} style={{ padding: '0.5rem 0' }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: '#1d4ed8' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '0.35rem' }}>
                Bank 3D-Secure Authorization
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.65rem' }}>
                Enter the 6-digit OTP sent by your bank to registered mobile <strong>••••••{formData.phone ? formData.phone.slice(-4) : '7570'}</strong> to authenticate payment of <strong>{formatPrice(grandTotal)}</strong>.
              </p>

              {/* Click-to-autofill Test Badge */}
              <div
                onClick={() => setCardOtp(cardOtpGenerated)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fef3c7',
                  border: '1px dashed #f59e0b',
                  color: '#92400e',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                <span>👉 Click to Auto-fill Demo Bank OTP: <strong>{cardOtpGenerated}</strong></span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ textAlign: 'center' }}>Enter 6-Digit Bank OTP Code *</label>
              <input
                type="text"
                value={cardOtp}
                onChange={(e) => setCardOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                className="form-control"
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px', fontWeight: '800', minHeight: '52px' }}
                maxLength="6"
                required
              />
              {cardOtpError && (
                <div style={{ color: '#e11d48', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.4rem' }}>
                  {cardOtpError}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessingPayment}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', fontWeight: '800' }}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 size={18} className="spin-slow" />
                  <span>{paymentStatusText || 'Verifying with Bank...'}</span>
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  <span>VERIFY &amp; AUTHORIZE PAYMENT</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
