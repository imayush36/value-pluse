const CART_KEY = 'technova_cart_v1';
const WISHLIST_KEY = 'technova_wishlist_v1';
const ORDERS_KEY = 'technova_orders_v1';

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

  clearCart: () => {
    try {
      localStorage.removeItem(CART_KEY);
    } catch (e) {
      console.error('Failed to clear cart', e);
    }
  }
};
