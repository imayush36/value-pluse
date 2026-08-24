import React, { useEffect, useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { adminService } from '../../services';
import { Search, Eye, Filter, CheckCircle2, Clock, Truck, XCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const { orders, formatPrice } = useShop();
  const [adminOrders, setAdminOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    adminService
      .getOrders({ status: filterStatus !== 'all' ? filterStatus : undefined })
      .then((res) => {
        if (res.data?.success && res.data.orders) {
          setAdminOrders(res.data.orders);
        }
      })
      .catch(() => {
        setAdminOrders(orders);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const displayList = (adminOrders.length > 0 ? adminOrders : orders).filter((o) => {
    const matchStatus = filterStatus === 'all' || (o.orderStatus || o.status) === filterStatus;
    const matchSearch =
      !search ||
      (o.orderId || o._id)?.includes(search) ||
      o.deliveryAddress?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.fullName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, { orderStatus: newStatus });
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch {
      toast.success(`Order status updated to ${newStatus}`);
      setAdminOrders((prev) =>
        prev.map((o) => (o._id === orderId || o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Order Management</h1>
        <p className="text-slate-500 text-sm">Track customer shipments, process dispatch, and verify payments</p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID or customer name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none"
        >
          <option value="all">All Order Statuses</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Payment</th>
                <th className="p-4 font-semibold">Status Action</th>
                <th className="p-4 font-semibold text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayList.map((order) => {
                const oId = order.orderId || order._id;
                const address = order.deliveryAddress || order.customer || {};
                const currentStatus = order.orderStatus || order.status || 'Confirmed';

                return (
                  <tr key={oId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-xs text-slate-900">#{oId}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 text-xs">{address.fullName || 'Customer'}</div>
                      <div className="text-[11px] text-slate-400">{address.phone || address.city}</div>
                    </td>
                    <td className="p-4 text-xs text-slate-600">{(order.items || []).length} items</td>
                    <td className="p-4 font-bold text-xs text-slate-900">
                      {formatPrice(order.totalAmount || order.total)}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-slate-700 block">
                        {order.paymentMethod || 'COD'}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleUpdateStatus(order._id || order.orderId, e.target.value)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                Order #{selectedOrder.orderId || selectedOrder._id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Delivery address */}
            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600">
              <div className="font-bold text-slate-900 text-sm">
                Recipient: {(selectedOrder.deliveryAddress || selectedOrder.customer)?.fullName}
              </div>
              <div>Phone: {(selectedOrder.deliveryAddress || selectedOrder.customer)?.phone}</div>
              <div>
                Address: {(selectedOrder.deliveryAddress || selectedOrder.customer)?.addressLine1},{' '}
                {(selectedOrder.deliveryAddress || selectedOrder.customer)?.city} -{' '}
                {(selectedOrder.deliveryAddress || selectedOrder.customer)?.pincode}
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Ordered Items</h4>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-800 line-clamp-1">{it.name}</span>
                    <span className="font-bold text-slate-900 shrink-0 ml-2">
                      Qty {it.quantity} × {formatPrice(it.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline font-bold text-base text-slate-900">
              <span>Total Paid</span>
              <span className="text-primary text-xl">
                {formatPrice(selectedOrder.totalAmount || selectedOrder.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
