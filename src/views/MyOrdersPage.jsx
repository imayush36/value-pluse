import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { orderService } from '../services';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, ChevronRight, CheckCircle2, ShoppingBag, Eye } from 'lucide-react';

export default function MyOrdersPage() {
  const { orders, formatPrice, fetchMyOrders } = useShop();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [localOrders, setLocalOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (isAuthenticated) {
      setLoading(true);
      fetchMyOrders();
      orderService
        .getMyOrders()
        .then((res) => {
          if (res.data?.success && res.data.orders) {
            setLocalOrders(res.data.orders);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, fetchMyOrders]);

  const displayOrders = localOrders.length > 0 ? localOrders : orders;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="my-orders-page py-8">
      <div className="container">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">My Orders</h1>
          <p className="text-sm text-slate-500">Track and manage your past and active orders</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading your orders...</div>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Found</h3>
            <p className="text-slate-500 text-sm mb-6">
              You haven't placed any orders with Value Plus yet. Browse our top electronics collection!
            </p>
            <Link
              to="/shop"
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark inline-block transition-all shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayOrders.map((order) => {
              const orderId = order.orderId || order._id || 'VP-ORDER';
              const items = order.items || [];
              const dateStr = order.createdAt || order.date
                ? new Date(order.createdAt || order.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recent';

              return (
                <div
                  key={order._id || order.orderId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Header Bar */}
                  <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-slate-400 block text-[11px]">ORDER PLACED</span>
                        <span className="font-semibold text-slate-700">{dateStr}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">TOTAL AMOUNT</span>
                        <span className="font-bold text-slate-900">{formatPrice(order.totalAmount || order.total)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">SHIP TO</span>
                        <span className="font-semibold text-slate-700">
                          {order.deliveryAddress?.fullName || order.customer?.fullName || 'Customer'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-500">#{orderId}</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                          order.orderStatus || order.status || 'Confirmed'
                        )}`}
                      >
                        {order.orderStatus || order.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-5 space-y-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img
                          src={item.image || item.thumbnail}
                          alt={item.name}
                          className="w-16 h-16 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100 shrink-0"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</h4>
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

                  {/* Footer Bar */}
                  <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-500">
                      Payment Method:{' '}
                      <strong className="text-slate-700">{order.paymentMethod || 'COD'}</strong> (
                      {order.paymentStatus || 'Pending'})
                    </div>
                    <Link
                      to={`/orders/${order._id || order.orderId}`}
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye size={14} /> View Order Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
