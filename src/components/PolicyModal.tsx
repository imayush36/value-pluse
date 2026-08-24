// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Truck,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Lock,
  Phone,
  Mail,
  Store,
  CreditCard,
} from 'lucide-react';
import gsap from 'gsap';

export default function PolicyModal() {
  const { policyModalState, closePolicy, openPolicy } = useShop();
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  const { isOpen, activeTab } = policyModalState || { isOpen: false, activeTab: 'shipping' };

  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.94, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      closePolicy();
    }
  };

  const tabs = [
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'returns', label: '7-Day Return & Replacement', icon: RotateCcw },
    { id: 'refund', label: 'Refund & Cancellation', icon: RefreshCw },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
  ];

  return (
    <div
      className="modal-backdrop"
      ref={overlayRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 1100 }}
    >
      <div
        className="details-modal policy-modal-container"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          width: '94%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          borderRadius: '16px',
          background: 'var(--bg-main, #ffffff)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'var(--primary-light, #e0f2fe)',
                color: 'var(--primary, #0a6cdc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                Value Plus Official Store Policies
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Clear, transparent customer guarantees for electronics &amp; appliances
              </p>
            </div>
          </div>

          <button
            className="modal-close-btn"
            onClick={closePolicy}
            aria-label="Close policy modal"
            style={{ position: 'static' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation Buttons */}
        <div
          className="policy-tabs-nav"
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => openPolicy(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 0.95rem',
                  borderRadius: '8px',
                  border: isActive ? '1px solid var(--primary, #0a6cdc)' : '1px solid var(--border-default, #e2e8f0)',
                  background: isActive ? 'var(--primary, #0a6cdc)' : 'var(--bg-alt, #f8fafc)',
                  color: isActive ? '#ffffff' : 'var(--text-main, #1e293b)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Policy Content Body */}
        <div
          className="policy-content-scroll"
          style={{
            overflowY: 'auto',
            paddingRight: '0.5rem',
            flexGrow: 1,
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: 'var(--text-main)',
          }}
        >
          {/* TAB 1: SHIPPING & DELIVERY POLICY */}
          {activeTab === 'shipping' && (
            <div>
              <div style={{ background: 'var(--primary-light, #f0fdf4)', border: '1px solid #bae6fd', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary, #0a6cdc)', fontWeight: '700', marginBottom: '0.25rem' }}>
                  <Truck size={18} />
                  <span>Value Plus Express Logistics Network</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  We dispatch genuine electronics directly from over <strong>50+ Value Plus Retail Stores &amp; Megastore Hubs</strong> across Uttar Pradesh, NCR, and partner delivery networks Pan-India.
                </p>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>1. Delivery Timelines</h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>Same-Day / Next-Day Delivery:</strong> Available across Noida, Greater Noida, Ghaziabad, Lucknow, Kanpur, Varanasi, Agra, Meerut, and Prayagraj for orders placed before 2:00 PM.</li>
                <li><strong>Standard Express Delivery:</strong> 2 to 4 business days for all other locations across India.</li>
                <li><strong>Heavy Appliances (AC, Refrigerator, Washing Machine, 55"+ TVs):</strong> Dispatched with dedicated specialized carriers within 24–48 hours with pre-scheduled delivery slots.</li>
              </ul>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>2. Shipping Charges &amp; Free Delivery</h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>FREE Shipping:</strong> Applicable on all orders with cart subtotal of <strong>₹999 or above</strong>.</li>
                <li><strong>Standard Delivery Fee:</strong> Flat ₹99 for orders below ₹999.</li>
                <li>No hidden handling or transit insurance surcharges.</li>
              </ul>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>3. Free Installation &amp; Demo Assistance</h3>
              <p>
                For all major home appliances (Split Air Conditioners, LED Smart TVs, and Washing Machines), an authorized brand service engineer is auto-assigned within <strong>24 to 48 hours</strong> of product delivery for professional wall mounting, unboxing, and demo.
              </p>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>4. Real-time Order Tracking</h3>
              <p>
                Upon order confirmation, customers receive a live tracking ID (`VP-XXXXXX`) via SMS, Email, and in their Value Plus <strong>"My Orders"</strong> account section to monitor real-time shipment milestones.
              </p>
            </div>
          )}

          {/* TAB 2: 7-DAY RETURN & REPLACEMENT POLICY */}
          {activeTab === 'returns' && (
            <div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: '700', marginBottom: '0.25rem' }}>
                  <RotateCcw size={18} />
                  <span>7-Day Hassle-Free Replacement Guarantee</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350f' }}>
                  Every electronic product and appliance purchased at Value Plus is protected with our direct 7-Day Replacement Guarantee from the date of doorstep delivery.
                </p>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>1. Eligible Replacement Scenarios</h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>Transit Damage:</strong> Product arrived physically damaged, cracked, or with seal broken.</li>
                <li><strong>Dead on Arrival (DOA) / Technical Defect:</strong> Product does not power on or key hardware functions are malfunctioning.</li>
                <li><strong>Wrong Item Received:</strong> Model, color, capacity, or specifications do not match the invoice.</li>
                <li><strong>Missing In-Box Accessories:</strong> Remote, charger, power cord, or warranty card missing.</li>
              </ul>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>2. Seamless 3-Step Replacement Process</h3>
              <ol style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>Raise Request:</strong> Navigate to <em>My Orders</em> or call Toll-Free <strong>1800-123-VALUE</strong> within 7 days of receiving the item.</li>
                <li><strong>Brand Technician Verification:</strong> For large electronics (TVs/ACs/Laptops), an engineer performs a quick diagnostic visit to certify the hardware defect.</li>
                <li><strong>Free Doorstep Replacement:</strong> Our logistics team collects the defective unit and delivers a brand new, sealed replacement box at zero extra cost.</li>
              </ol>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>3. Customer Guidelines for Returns</h3>
              <p>
                Please ensure the item is returned with its original brand packaging, serial number / IMEI barcode intact, user manuals, and the official Value Plus GST invoice.
              </p>
            </div>
          )}

          {/* TAB 3: REFUND & CANCELLATION POLICY */}
          {activeTab === 'refund' && (
            <div>
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: '700', marginBottom: '0.25rem' }}>
                  <RefreshCw size={18} />
                  <span>100% Transparent Refund &amp; Cancellation Terms</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#065f46' }}>
                  Enjoy complete flexibility to cancel orders prior to shipment, or receive instant refunds if replacement inventory is unavailable.
                </p>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>1. Order Cancellation Policy</h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>Before Dispatch:</strong> You can cancel any order instantly from <em>My Orders</em> or by contacting customer support before the package is handed over to the courier. 100% full refund is immediately initiated.</li>
                <li><strong>After Dispatch / In-Transit:</strong> If you change your mind once shipped, you can simply decline the delivery at doorstep. The refund will process once the package returns to the warehouse.</li>
              </ul>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>2. Refund Processing Timelines</h3>
              <div style={{ border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-alt)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}>Payment Mode</th>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}>Refund Mechanism</th>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}>Estimated Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}>UPI / GPay / PhonePe</td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}>Original UPI VPA / Account</td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}><strong>Instant – 24 Hours</strong></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}>Credit / Debit Card</td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}>Source Bank Account / Card</td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}><strong>3 to 5 Business Days</strong></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}>Net Banking</td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}>Direct Bank Transfer</td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-default)' }}><strong>2 to 4 Business Days</strong></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem' }}>Cash on Delivery (COD)</td>
                      <td style={{ padding: '0.75rem' }}>Customer Bank NEFT / IMPS / UPI</td>
                      <td style={{ padding: '0.75rem' }}><strong>24 to 48 Hours</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>3. No Deductions or Restocking Fees</h3>
              <p>
                Value Plus does NOT charge any restocking fees, packaging deductions, or cancellation penalties for verified returns.
              </p>
            </div>
          )}

          {/* TAB 4: PRIVACY & SECURITY POLICY */}
          {activeTab === 'privacy' && (
            <div>
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: '700', marginBottom: '0.25rem' }}>
                  <Lock size={18} color="var(--primary)" />
                  <span>Value Plus Customer Data Privacy Commitment</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                  Your privacy and cybersecurity are our utmost priority. Value Plus complies with the Digital Personal Data Protection (DPDP) Act and international data privacy benchmarks.
                </p>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>1. What Information We Collect</h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>Identity &amp; Contact:</strong> Full Name, verified Email Address, and verified 10-digit Mobile Number via OTP authentication.</li>
                <li><strong>Shipping &amp; Billing:</strong> Delivery street address, city, state, and 6-digit postal pincode.</li>
                <li><strong>Order &amp; Warranty History:</strong> Invoices, purchased serial numbers, and service tickets.</li>
              </ul>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>2. 256-Bit SSL &amp; PCI-DSS Payment Security</h3>
              <p>
                All digital transactions are encrypted with industry-standard 256-bit SSL protocols. <strong>Value Plus never stores your Credit/Debit Card CVVs or Net Banking passwords</strong>. All payments are securely handled via RBI-authorized payment gateways.
              </p>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>3. Zero Spam &amp; Third-Party Non-Disclosure</h3>
              <p>
                We do not sell, rent, or trade your personal information with any third-party advertisers. Your phone number is strictly used for order OTP verifications, dispatch status SMS, and technician appointment scheduling.
              </p>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '1rem 0 0.5rem 0' }}>4. Customer Data Control &amp; Grievance Officer</h3>
              <p>
                You have the full right to review, update, or request permanent deletion of your account profile at any time by contacting our Grievance Officer at <strong>support@valueplus.in</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer info & Contact */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={14} color="var(--primary)" /> Helpline: 1800-123-VALUE
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={14} color="var(--primary)" /> care@valueplus.in
            </span>
          </div>

          <button className="btn btn-primary btn-sm" onClick={closePolicy}>
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
