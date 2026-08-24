import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { orderService } from '../services';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import { Package, MapPin, CreditCard, ChevronLeft, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { orders, formatPrice } = useShop();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    // Try finding locally first
    const foundLocal = orders.find((o) => o._id === id || o.orderId === id);
    if (foundLocal) {
      setOrder(foundLocal);
      setLoading(false);
    } else {
      orderService
        .getOrderById(id)
        .then((res) => {
          if (res.data?.success && res.data.order) {
            setOrder(res.data.order);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, orders]);

  if (loading) {
    return <div className="container py-16 text-center text-slate-500">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-6">Could not find any order with identifier #{id}</p>
        <Link to="/orders" className="px-6 py-2 bg-primary text-white rounded-xl font-semibold text-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  const orderId = order.orderId || order._id;
  const address = order.deliveryAddress || order.customer || {};
  const items = order.items || [];
  const status = order.orderStatus || order.status || 'Confirmed';

  return (
    <div className="order-detail-page py-8">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link to="/orders" className="flex items-center gap-1 hover:text-primary font-medium">
            <ChevronLeft size={14} /> Back to My Orders
          </Link>
        </div>

        {/* Order Header Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm mb-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900">Order #{orderId}</h1>
                <span className="px-3 py-1 bg-blue-50 text-primary text-xs font-bold rounded-full border border-blue-200">
                  {status}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Calendar size={13} />
                <span>
                  Placed on{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recently'}
                </span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="text-xs text-slate-500">Estimated Delivery:</div>
              <div className="font-bold text-slate-900 text-sm">{order.estimatedDelivery || 'Within 2-3 days'}</div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">Delivery Status Tracking</h3>
            <OrderStatusTimeline currentStatus={status} history={order.statusHistory} />
          </div>
        </div>

        {/* Items & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Items (7 cols) */}
          <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Package size={18} className="text-primary" />
              Order Items ({items.length})
            </h3>

            <div className="space-y-4 divide-y divide-slate-100">
              {items.map((item, idx) => (
                <div key={idx} className="pt-4 first:pt-0 flex items-center gap-4">
                  <img
                    src={item.image || item.thumbnail}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{item.name}</h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Details & Payment (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                Delivery Address
              </h3>
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block text-sm mb-1">{address.fullName}</strong>
                <div>{address.addressLine1 || address.address}</div>
                {address.addressLine2 && <div>{address.addressLine2}</div>}
                <div>
                  {address.city}, {address.state} - <strong>{address.pincode}</strong>
                </div>
                <div className="mt-1 text-slate-500">Phone: {address.phone}</div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CreditCard size={18} className="text-primary" />
                Payment Breakdown
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>{order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Amount Paid</span>
                  <span className="text-primary">{formatPrice(order.totalAmount || order.total)}</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Payment: <strong>{order.paymentMethod || 'COD'}</strong> ({order.paymentStatus || 'Pending'})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
