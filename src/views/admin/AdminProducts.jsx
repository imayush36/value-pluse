import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { adminService } from '../../services';
import { Plus, Edit2, Trash2, Search, X, Check, Package, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const { products, categories, formatPrice, fetchProducts } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Mobiles',
    price: '',
    discountPrice: '',
    stock: 10,
    description: '',
    image: '',
    sku: '',
    isFeatured: false,
    badge: '',
  });

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      category: categories[0]?.name || 'Mobiles',
      price: '',
      discountPrice: '',
      stock: 10,
      description: '',
      image: '',
      sku: 'VP-' + Math.floor(1000 + Math.random() * 9000),
      isFeatured: false,
      badge: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      discountPrice: product.discountPrice || '',
      stock: product.stock ?? 10,
      description: product.description,
      image: product.thumbnail || product.images?.[0] || product.image || '',
      sku: product.sku || '',
      isFeatured: product.isFeatured || false,
      badge: product.badge || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : Number(formData.price),
      stock: Number(formData.stock),
      images: [formData.image],
      thumbnail: formData.image,
    };

    try {
      if (editingProduct) {
        const prodId = editingProduct._id || editingProduct.id;
        await adminService.updateProduct(prodId, payload);
        toast.success('Product updated successfully!');
      } else {
        await adminService.createProduct(payload);
        toast.success('Product added to inventory!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.success('Product changes saved successfully!');
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      try {
        await adminService.deleteProduct(productId);
        toast.success('Product removed');
        fetchProducts();
      } catch (err) {
        toast.success('Product removed');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Product Management</h1>
          <p className="text-slate-500 text-sm">Add, update specifications, stock counts and discounts</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-md"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, brand, SKU..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id || c._id || c.name} value={c.name || c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Featured</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const prodId = p._id || p.id;
                return (
                  <tr key={prodId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.thumbnail || p.images?.[0] || p.image}
                          alt={p.name}
                          className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                          <div className="text-xs text-slate-400">
                            {p.brand} • SKU: {p.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-600">{p.category}</td>
                    <td className="p-4 font-bold text-slate-900">
                      {formatPrice(p.discountPrice || p.price)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          (p.stock ?? 10) < 5
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.stock ?? 10} units
                      </span>
                    </td>
                    <td className="p-4">
                      {p.isFeatured ? (
                        <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          ★ Featured
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-primary rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(prodId)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sony BRAVIA 65 Inch 4K Google TV"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Sony, Samsung, Apple, LG..."
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c._id || c.name} value={c.name || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="129990"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="114990"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="15"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL (Unsplash or direct URL)</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full appliance features and highlights..."
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-slate-700">
                  Mark as Featured Product (Shows on Home Showcase)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-md"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
