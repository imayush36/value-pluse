import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { Mail, CheckCircle2, Clock, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminContacts() {
  const [messages, setMessages] = useState([
    {
      _id: 'msg_1',
      name: 'Deepak Sharma',
      email: 'deepak.s@gmail.com',
      phone: '9876543210',
      subject: 'Bulk Corporate Order for 15 Air Conditioners',
      message: 'Looking for GST invoice quote for 15 units of Daikin 1.5T 5-star ACs for our office in Sector 62 Noida.',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'msg_2',
      name: 'Anjali Rawat',
      email: 'anjali.r@outlook.com',
      phone: '9988776655',
      subject: 'Installation request for Sony BRAVIA 65 TV',
      message: 'Order #VP-892144 was delivered yesterday. When will the Sony engineer arrive for wall mounting?',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  useEffect(() => {
    adminService
      .getContacts()
      .then((res) => {
        if (res.data?.success && res.data.messages?.length > 0) {
          setMessages(res.data.messages);
        }
      })
      .catch(() => {});
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await adminService.markContactRead(id);
    } catch {}
    setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, isRead: true } : m)));
    toast.success('Marked as read');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Customer Messages</h1>
        <p className="text-slate-500 text-sm">Enquiries and support tickets submitted via contact form</p>
      </div>

      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-6 rounded-2xl border transition-all ${
              msg.isRead ? 'bg-white border-slate-200 shadow-sm' : 'bg-blue-50/50 border-blue-200 shadow-md'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs">
                  {msg.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{msg.name}</h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{msg.email}</span>
                    {msg.phone && <span>• +91 {msg.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {!msg.isRead && (
                  <button
                    onClick={() => handleMarkRead(msg._id)}
                    className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>

            <div className="font-bold text-sm text-slate-800 mb-1">{msg.subject}</div>
            <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-100">
              {msg.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
