// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Package, Calendar, MapPin, CheckCircle2, Search, Clock3, Truck, Home } from 'lucide-react';

const TRACKING_STEPS = [
  { label: 'Order confirmed', status: 'Confirmed', icon: CheckCircle2 },
  { label: 'Packed at warehouse', status: 'Packed', icon: Package },
  { label: 'Out for delivery', status: 'Out for delivery', icon: Truck },
  { label: 'Delivered', status: 'Delivered', icon: Home },
];

export default function OrdersModal() {
  const { orders, isOrdersModalOpen, setIsOrdersModalOpen, formatPrice, cancelOrder, openPolicy } = useShop();
  const [trackingQuery, setTrackingQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.orderId || '');
  const [trackingError, setTrackingError] = useState('');

  useEffect(() => {
    if (orders.length > 0 && !orders.some((order) => order.orderId === selectedOrderId)) {
      setSelectedOrderId(orders[0].orderId);
    }
  }, [orders, selectedOrderId]);

  const selectedOrder = orders.find((order) => order.orderId === selectedOrderId);
  const activeTrackingStep = selectedOrder
    ? Math.max(0, TRACKING_STEPS.findIndex((step) => step.status.toLowerCase() === selectedOrder.status.toLowerCase()))
    : 0;
  const sortedOrders = [...orders].sort((firstOrder, secondOrder) => {
    const firstDate = firstOrder.created_at || firstOrder.date;
    const secondDate = secondOrder.created_at || secondOrder.date;
    return new Date(secondDate) - new Date(firstDate);
  });

  const handleTrackOrder = (event) => {
    event.preventDefault();
    const orderId = trackingQuery.trim().toUpperCase().replace(/^ORDER\s*ID\s*:\s*/, '');
    const matchingOrder = orders.find((order) => order.orderId.toUpperCase() === orderId);

    if (!matchingOrder) {
      setTrackingError('Order ID not found. Please check the ID and try again.');
      return;
    }

    setSelectedOrderId(matchingOrder.orderId);
    setTrackingError('');
  };

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
              My Orders ({orders.length})
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              All your orders, newest first
            </p>
          </div>
        </div>

        <form className="order-track-form" onSubmit={handleTrackOrder} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={trackingQuery}
              onChange={(event) => { setTrackingQuery(event.target.value); setTrackingError(''); }}
              placeholder="Enter order ID, e.g. VP-123456"
              aria-label="Order ID"
              style={{ width: '100%', padding: '0.7rem 0.8rem 0.7rem 2.35rem', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-main)', background: 'var(--bg-main)' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Track Order
          </button>
        </form>

        {trackingError && (
          <p style={{ color: '#e11d48', fontSize: '0.8rem', marginBottom: '1rem' }}>{trackingError}</p>
        )}

        {selectedOrder && (
          <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(10, 108, 220, 0.15)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>TRACKING ORDER</span>
                <strong style={{ color: 'var(--primary)' }}>{selectedOrder.orderId}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-emerald)', fontWeight: '700', fontSize: '0.8rem' }}>
                <Clock3 size={15} /> {selectedOrder.status}
              </div>
            </div>

            <div className="order-tracking-route" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
              <div className="order-tracking-line" aria-hidden="true" />
              <div
                className="order-tracking-car"
                aria-hidden="true"
                style={{ left: `calc(${12.5 + activeTrackingStep * 25}% - 14px)` }}
              >
                <Truck size={17} />
              </div>
              {TRACKING_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isCurrent = index === activeTrackingStep;
                const isCompleted = index <= activeTrackingStep;
                return (
                  <div key={step.label} style={{ position: 'relative', textAlign: 'center', color: isCompleted ? 'var(--primary)' : 'var(--text-light)' }}>
                    <div style={{ width: '32px', height: '32px', margin: '0 auto 0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCurrent ? 'var(--primary)' : 'var(--bg-main)', color: isCurrent ? '#fff' : isCompleted ? 'var(--primary)' : 'var(--text-light)', border: `1px solid ${isCompleted ? 'var(--primary)' : 'var(--border-default)'}` }}>
                      <StepIcon size={16} />
                    </div>
                    <span style={{ display: 'block', fontSize: '0.68rem', lineHeight: 1.25, fontWeight: isCurrent ? '700' : '500' }}>{step.label}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-default)' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} color="var(--primary)" /> Expected delivery: <strong>{selectedOrder.estimatedDelivery}</strong>
              </p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#e11d48', borderColor: '#fecdd3', fontSize: '0.75rem' }}
                    onClick={() => cancelOrder(selectedOrder.orderId)}
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => openPolicy('returns')}
                >
                  Replacement Policy
                </button>
              </div>
            </div>
          </div>
        )}

        {orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {sortedOrders.map((order) => (
              <div
                key={order.orderId}
                style={{
                  background: 'var(--bg-alt)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <button type="button" onClick={() => setSelectedOrderId(order.orderId)} style={{ display: 'block', width: '100%', textAlign: 'left', color: 'inherit' }} aria-label={`Track ${order.orderId}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      ORDER PLACED
                    </span>
                    <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {order.orderId}
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {new Date(order.created_at || order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
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
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                      {new Date(order.created_at || order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div>Total: <strong style={{ color: 'var(--text-main)', fontSize: '0.9375rem' }}>{formatPrice(order.total)}</strong></div>
                  </div>
                </div>
                </button>
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
