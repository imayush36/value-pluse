// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { PRODUCTS } from '../data/products';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Cart State
  const [cart, setCart] = useState(() => storage.getCart());
  // Wishlist State
  const [wishlist, setWishlist] = useState(() => storage.getWishlist());
  // Orders State
  const [orders, setOrders] = useState(() => {
    const session = storage.getSession();
    return session?.email
      ? storage.getOrders().filter((order) => order.customer?.email?.toLowerCase() === session.email.toLowerCase())
      : [];
  });
  const [currentUser, setCurrentUser] = useState(() => storage.getSession());

  // UI Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [buyNowItem, setBuyNowItem] = useState(null);

  // Delivery Location / Pincode
  const [deliveryPincode, setDeliveryPincode] = useState(() => {
    try {
      return localStorage.getItem('valueplus_pincode') || '201301';
    } catch {
      return '201301';
    }
  });
  const [deliveryCity, setDeliveryCity] = useState(() => {
    try {
      return localStorage.getItem('valueplus_city') || 'Noida, UP';
    } catch {
      return 'Noida, UP';
    }
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState(300000);

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const user = data.session.user;
        setCurrentUser({ id: user.id, fullName: user.user_metadata.fullName, email: user.email, phone: user.user_metadata.phone });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setCurrentUser(user ? { id: user.id, fullName: user.user_metadata.fullName, email: user.email, phone: user.user_metadata.phone } : null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser?.email) {
      setOrders([]);
      return;
    }
    if (!isSupabaseConfigured || !currentUser?.id) {
      setOrders(storage.getOrders().filter((order) => order.customer?.email?.toLowerCase() === currentUser.email.toLowerCase()));
      return;
    }
    const loadCustomerOrders = () => supabase.from('orders').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) {
        setOrders(data.map((order) => ({ ...order, orderId: order.order_id, estimatedDelivery: order.estimated_delivery })));
      }
    });
    loadCustomerOrders();
    const ordersChannel = supabase
      .channel(`customer-orders-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${currentUser.id}` }, loadCustomerOrders)
      .subscribe();
    return () => supabase.removeChannel(ordersChannel);
  }, [currentUser?.id]);

  const register = async (userData) => {
    const email = userData.email.trim().toLowerCase();
    const phone = userData.phone.trim();
    if (userData.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email,
        password: userData.password,
        options: { data: { fullName: userData.fullName.trim(), phone } },
      });
      if (error) return { success: false, message: error.message };
      showToast('Account created. Check your email to verify it.');
      return { success: true };
    }
    if (storage.getUsers().some((user) => user.email === email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const user = { fullName: userData.fullName.trim(), email, phone };
    storage.saveUsers([...storage.getUsers(), { ...user, password: userData.password }]);
    storage.saveSession(user);
    setCurrentUser(user);
    showToast('Account created successfully');
    return { success: true };
  };

  const login = async (email, password) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) return { success: false, message: error.message };
      const user = data.user;
      setCurrentUser({ id: user.id, fullName: user.user_metadata.fullName, email: user.email, phone: user.user_metadata.phone });
      showToast('Welcome back to Value Plus');
      return { success: true };
    }
    const user = storage.getUsers().find((item) => item.email === email.trim().toLowerCase() && item.password === password);
    if (!user) {
      return { success: false, message: 'Incorrect email or password.' };
    }
    const sessionUser = { fullName: user.fullName, email: user.email, phone: user.phone };
    storage.saveSession(sessionUser);
    setCurrentUser(sessionUser);
    showToast('Welcome back to Value Plus');
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    storage.clearSession();
    setCurrentUser(null);
    showToast('You have been logged out', 'info');
  };

  // Save changes to localStorage
  useEffect(() => {
    storage.saveCart(cart);
  }, [cart]);

  useEffect(() => {
    storage.saveWishlist(wishlist);
  }, [wishlist]);

  const updateLocation = (pincode, city) => {
    setDeliveryPincode(pincode);
    setDeliveryCity(city);
    try {
      localStorage.setItem('valueplus_pincode', pincode);
      localStorage.setItem('valueplus_city', city);
    } catch (e) {
      console.error(e);
    }
    showToast(`📍 Delivery location set to ${pincode} (${city})`);
    setIsPincodeModalOpen(false);
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Cart Functions
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    showToast(`✓ "${product.name.slice(0, 32)}..." added to cart!`);
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    storage.clearCart();
  };

  // Wishlist Functions
  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast(`Removed from wishlist`, 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast(`❤ "${product.name.slice(0, 30)}..." saved to wishlist!`);
    }
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Buy Now Flow
  const handleBuyNow = (product, quantity = 1) => {
    setBuyNowItem({ ...product, quantity });
    setIsCheckoutOpen(true);
  };

  // Order Placement
  const placeOrder = async (customerDetails, items, totals) => {
    const orderId = 'VP-' + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      orderId,
      date: new Date().toISOString(),
      customer: customerDetails,
      items: items,
      subtotal: totals.subtotal,
      delivery: totals.delivery,
      discount: totals.discount || 0,
      total: totals.total,
      status: 'Confirmed',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };

    const updatedOrders = storage.saveOrder(orderData);
    const customerOrders = isSupabaseConfigured
      ? [orderData, ...orders.filter((order) => order.orderId !== orderData.orderId)]
      : updatedOrders.filter((order) => order.customer?.email?.toLowerCase() === customerDetails.email.toLowerCase());
    setOrders(customerOrders);
    if (isSupabaseConfigured && currentUser?.id) {
      const { error } = await supabase.from('orders').insert({
        user_id: currentUser.id,
        order_id: orderData.orderId,
        customer: orderData.customer,
        items: orderData.items,
        subtotal: orderData.subtotal,
        delivery: orderData.delivery,
        discount: orderData.discount,
        total: orderData.total,
        status: orderData.status,
        estimated_delivery: orderData.estimatedDelivery,
      });
      if (error) showToast('Order saved locally, but cloud sync failed.', 'error');
    }
    setLastPlacedOrder(orderData);

    // If it was regular cart checkout, clear cart
    if (!buyNowItem) {
      clearCart();
    }
    setBuyNowItem(null);
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);
  };

  // Format INR Price helper
  const formatPrice = (amount) => {
    return '₹' + Number(amount).toLocaleString('en-IN');
  };

  // Calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        orders,
        currentUser,
        isAuthenticated: Boolean(currentUser),
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderSuccessOpen,
        setIsOrderSuccessOpen,
        isOrdersModalOpen,
        setIsOrdersModalOpen,
        isPincodeModalOpen,
        setIsPincodeModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        selectedProduct,
        setSelectedProduct,
        buyNowItem,
        setBuyNowItem,
        lastPlacedOrder,
        deliveryPincode,
        deliveryCity,
        updateLocation,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedBrand,
        setSelectedBrand,
        sortBy,
        setSortBy,
        priceRange,
        setPriceRange,
        toasts,
        showToast,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        handleBuyNow,
        placeOrder,
        login,
        register,
        logout,
        formatPrice,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
