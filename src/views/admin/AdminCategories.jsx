import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { adminService } from '../../services';
import { Plus, Edit2, Trash2, X, Grid, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const { categories } = useShop();
  const [localCategories, setLocalCategories] = useState(categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', tag: '', description: '', icon: 'Sparkles' });

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', tag: '', description: '', icon: 'Sparkles' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      tag: cat.tag || '',
      description: cat.description || '',
      icon: cat.icon || 'Sparkles',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingCategory) {
      const catId = editingCategory._id || editingCategory.id;
      try {
        await adminService.updateCategory(catId, formData);
      } catch {}
      setLocalCategories((prev) =>
        prev.map((c) => ((c._id || c.id) === catId ? { ...c, ...formData } : c))
      );
      toast.success('Category updated!');
    } else {
      const newCat = { ...formData, id: formData.name.toLowerCase().replace(/\s+/g, '-'), count: 0 };
      try {
        await adminService.createCategory(formData);
      } catch {}
      setLocalCategories((prev) => [...prev, newCat]);
      toast.success('Category added!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (catId) => {
    if (window.confirm('Delete this category?')) {
      try {
        adminService.deleteCategory(catId);
      } catch {}
      setLocalCategories((prev) => prev.filter((c) => (c._id || c.id) !== catId));
      toast.success('Category removed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Category Management</h1>
          <p className="text-slate-500 text-sm">Organize appliance departments and homepage banners</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-md"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {localCategories.map((cat) => {
          const catId = cat._id || cat.id;
          return (
            <div key={catId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold">
                  <Grid size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-50"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(catId)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{cat.description || 'Department catalog'}</p>
                {cat.tag && (
                  <span className="inline-block mt-2 text-[10px] font-bold bg-blue-50 text-primary px-2 py-0.5 rounded border border-blue-100">
                    {cat.tag}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Smart Watches"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tag / Promo Badge</label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="e.g. Top Brand, Mega Deal"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary-dark"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
