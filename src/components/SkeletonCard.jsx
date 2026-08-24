import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="product-card skeleton-loading" style={{ minHeight: '380px', pointerEvents: 'none' }}>
      <div style={{ height: '200px', background: '#e2e8f0', borderRadius: '10px', marginBottom: '12px', opacity: 0.7 }} />
      <div style={{ height: '14px', width: '40%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '18px', width: '90%', background: '#cbd5e1', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '24px', width: '50%', background: '#cbd5e1', borderRadius: '6px', marginBottom: '16px' }} />
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <div style={{ height: '36px', flex: 1, background: '#e2e8f0', borderRadius: '6px' }} />
        <div style={{ height: '36px', flex: 1, background: '#e2e8f0', borderRadius: '6px' }} />
      </div>
    </div>
  );
}
