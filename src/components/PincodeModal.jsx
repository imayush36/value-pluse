import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, MapPin, Check, Search, Building2 } from 'lucide-react';

const POPULAR_LOCATIONS = [
  { pincode: '201301', city: 'Noida, UP' },
  { pincode: '226001', city: 'Lucknow, UP' },
  { pincode: '201001', city: 'Ghaziabad, UP' },
  { pincode: '208001', city: 'Kanpur, UP' },
  { pincode: '282001', city: 'Agra, UP' },
  { pincode: '221001', city: 'Varanasi, UP' },
  { pincode: '110001', city: 'New Delhi' },
  { pincode: '122001', city: 'Gurugram, HR' },
];

export default function PincodeModal() {
  const {
    isPincodeModalOpen,
    setIsPincodeModalOpen,
    deliveryPincode,
    updateLocation,
  } = useShop();

  const [inputPincode, setInputPincode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isPincodeModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanPin = inputPincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setErrorMsg('Please enter a valid 6-digit Indian Pincode');
      return;
    }

    // Match with popular or generate clean city tag
    const matched = POPULAR_LOCATIONS.find((l) => l.pincode === cleanPin);
    const cityName = matched ? matched.city : `Delivery Zone (${cleanPin})`;
    updateLocation(cleanPin, cityName);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setIsPincodeModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="details-modal"
        style={{ maxWidth: '520px', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={() => setIsPincodeModalOpen(false)}
          aria-label="Close location selector"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Choose Delivery Location
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Check product availability, same-day delivery &amp; store pickup
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Enter 6-digit Pincode (e.g. 201301)"
              value={inputPincode}
              onChange={(e) => {
                setInputPincode(e.target.value);
                setErrorMsg('');
              }}
              maxLength={6}
              className="form-control"
              style={{ fontWeight: '600', letterSpacing: '1px' }}
            />
            <button type="submit" className="btn btn-primary">
              Check
            </button>
          </div>
          {errorMsg && (
            <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.4rem' }}>
              {errorMsg}
            </div>
          )}
        </form>

        <h4 style={{ fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Popular Value Plus Service Locations:
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {POPULAR_LOCATIONS.map((loc) => {
            const isSelected = loc.pincode === deliveryPincode;
            return (
              <button
                key={loc.pincode}
                type="button"
                className={`btn btn-secondary btn-sm ${isSelected ? 'active-location' : ''}`}
                style={{
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-default)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                }}
                onClick={() => updateLocation(loc.pincode, loc.city)}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.8125rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                    {loc.city}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {loc.pincode}
                  </div>
                </div>
                {isSelected && <Check size={16} color="var(--primary)" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
