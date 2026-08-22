// @ts-nocheck
import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export default function Toast() {
  const { toasts } = useShop();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item">
          {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
          {toast.type === 'info' && <Info size={18} color="#3b82f6" />}
          {toast.type === 'error' && <AlertCircle size={18} color="#f43f5e" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
