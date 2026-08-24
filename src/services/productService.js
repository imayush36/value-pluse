import api from './api';

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (identifier) => api.get(`/products/${identifier}`),
  getFeatured: () => api.get('/products/featured'),
  getByCategory: (category, params) => api.get(`/products/category/${category}`, { params }),
  getBrands: () => api.get('/products/brands'),
  // Admin
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};
