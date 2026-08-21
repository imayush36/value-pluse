import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Package, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export default function OrdersModal() {
  const { orders, isOrdersModalOpen, setIsOrdersModalOpen, formatPrice } = useShop();

  if (!isOrdersModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsOrdersModalOpen(false)}>
      <div
        className="details-modal"
        style={{ maxWidth: '750px', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={() => setIsOrdersModalOpen(false)}
          aria-label="Close orders"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Value Plus Orders ({orders.length})
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Track order status and history
            </p>
          </div>
        </div>

        {orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {orders.map((order) => (
              <div
                key={order.orderId}
                style={{
                  background: 'var(--bg-alt)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      ORDER NUMBER
                    </span>
                    <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {order.orderId}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                    <CheckCircle2 size={13} />
                    <span>{order.status}</span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-default)' }}
                      />
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '700' }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', borderTop: '1px solid var(--border-default)', paddingTop: '0.6rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} />
                    <span>Deliver to: {order.customer.city}, {order.customer.state}</span>
                  </div>
                  <div>
                    Total: <strong style={{ color: 'var(--text-main)', fontSize: '0.9375rem' }}>{formatPrice(order.total)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Package size={48} color="var(--text-light)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.35rem' }}>
              No past orders found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              When you place demo orders, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
