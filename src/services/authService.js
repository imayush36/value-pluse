import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (identifier, password) => api.post('/auth/login', { identifier, password }),
  sendOtp: (identifier, purpose) => api.post('/auth/send-otp', { identifier, phone: identifier, purpose }),
  verifyOtp: (identifier, otp, userData) =>
    api.post('/auth/verify-otp', { identifier, phone: identifier, otp, userData }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  resetPasswordWithOtp: (identifier, newPassword) =>
    api.post('/auth/reset-otp-password', { identifier, newPassword }),
  addAddress: (address) => api.post('/auth/addresses', address),

  updateAddress: (addressId, data) => api.put(`/auth/addresses/${addressId}`, data),
  deleteAddress: (addressId) => api.delete(`/auth/addresses/${addressId}`),
};
