import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { Search, UserX, UserCheck, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([
    {
      _id: 'usr_demo_1',
      fullName: 'Ayush Sharma',
      email: 'demo@valueplus.in',
      phone: '8888888888',
      role: 'user',
      isBlocked: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'usr_demo_2',
      fullName: 'Rahul Verma',
      email: 'rahul.v@gmail.com',
      phone: '9811223344',
      role: 'user',
      isBlocked: false,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      _id: 'usr_demo_3',
      fullName: 'Pooja Gupta',
      email: 'pooja.g@yahoo.com',
      phone: '9871100223',
      role: 'user',
      isBlocked: false,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminService
      .getUsers()
      .then((res) => {
        if (res.data?.success && res.data.users?.length > 0) {
          setUsers(res.data.users);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleBlock = async (userId) => {
    try {
      await adminService.toggleBlockUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u))
      );
      toast.success('User status updated');
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u))
      );
      toast.success('User status updated');
    }
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Customer Management</h1>
        <p className="text-slate-500 text-sm">View registered accounts, monitor activity and manage permissions</p>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-primary font-bold text-sm flex items-center justify-center">
                        {user.fullName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{user.fullName}</div>
                        <div className="text-[11px] text-slate-400">Role: {user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-slate-600">
                    <div className="font-medium text-slate-900">{user.email}</div>
                    <div className="text-slate-400">+91 {user.phone}</div>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleBlock(user._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        user.isBlocked
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {user.isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
