import api from './api';

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  updateQuantity: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  toggleWishlist: (productId) => api.post('/wishlist/toggle', { productId }),
};

export const orderService = {
  createRazorpayOrder: (amount) => api.post('/orders/razorpay/create', { amount }),
  verifyRazorpayPayment: (paymentData) => api.post('/orders/razorpay/verify', paymentData),
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
};

export const reviewService = {
  getProductReviews: (productId) => api.get(`/reviews/${productId}`),
  addReview: (productId, data) => api.post(`/reviews/${productId}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleBlockUser: (id) => api.put(`/admin/users/${id}/block`),
  getContacts: () => api.get('/admin/contacts'),
  markContactRead: (id) => api.put(`/admin/contacts/${id}/read`),
  // Products & categories
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};

export const contactService = {
  submitContact: (data) => api.post('/contact', data),
};
