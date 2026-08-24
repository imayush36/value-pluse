// @ts-nocheck
const CART_KEY = 'technova_cart_v1';
const WISHLIST_KEY = 'technova_wishlist_v1';
const ORDERS_KEY = 'technova_orders_v1';
const USERS_KEY = 'valueplus_users_v1';
const SESSION_KEY = 'valueplus_session_v1';

export const storage = {
  getCart: () => {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load cart from storage', e);
      return [];
    }
  },

  saveCart: (cart) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  },

  getWishlist: () => {
    try {
      const data = localStorage.getItem(WISHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load wishlist from storage', e);
      return [];
    }
  },

  saveWishlist: (wishlist) => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  },

  getOrders: () => {
    try {
      const data = localStorage.getItem(ORDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load orders from storage', e);
      return [];
    }
  },

  saveOrder: (order) => {
    try {
      const orders = storage.getOrders();
      orders.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return orders;
    } catch (e) {
      console.error('Failed to save order', e);
      return [];
    }
  },

  getUsers: () => {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load users from storage', e);
      return [];
    }
  },

  saveUsers: (users) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  },

  getSession: () => {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load session', e);
      return null;
    }
  },

  saveSession: (user) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  },

  clearSession: () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  },

  clearCart: () => {
    try {
      localStorage.removeItem(CART_KEY);
    } catch (e) {
      console.error('Failed to clear cart', e);
    }
  }
};
