import React from 'react';
import { CheckCircle2, Clock, Truck, Package, XCircle } from 'lucide-react';

const ALL_STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderStatusTimeline({ currentStatus = 'Processing', history = [] }) {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <XCircle size={24} className="text-red-600 shrink-0" />
        <div>
          <div className="font-semibold">Order Cancelled</div>
          <div className="text-sm text-red-600">This order has been cancelled.</div>
        </div>
      </div>
    );
  }

  const currentIndex = ALL_STATUSES.indexOf(currentStatus);

  const getStatusIcon = (status, isPassed, isCurrent) => {
    if (isPassed || isCurrent) {
      return <CheckCircle2 size={18} className="text-white" />;
    }
    return <Clock size={16} className="text-slate-400" />;
  };

  return (
    <div className="w-full py-4">
      <div className="relative flex justify-between items-center">
        {/* Track Line */}
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-1 bg-slate-200 -z-0" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (ALL_STATUSES.length - 1)) * 100)}%`,
          }}
        />

        {ALL_STATUSES.map((status, index) => {
          const isPassed = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isPassed || isCurrent
                    ? 'bg-primary text-white shadow-md ring-4 ring-blue-100'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {getStatusIcon(status, isPassed, isCurrent)}
              </div>
              <span
                className={`mt-2 text-xs text-center font-medium ${
                  isCurrent ? 'text-primary font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
