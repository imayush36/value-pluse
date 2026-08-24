// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const [authModalReason, setAuthModalReason] = useState(null); // 'checkout' | null
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [buyNowItem, setBuyNowItem] = useState(null);

  // Policy Modal State: { isOpen: boolean, activeTab: 'shipping' | 'privacy' | 'refund' | 'returns' }
  const [policyModalState, setPolicyModalState] = useState({
    isOpen: false,
    activeTab: 'shipping',
  });

  // Pending post-authentication action
  const postAuthActionRef = useRef(null);

  // OTP Verification State for Registration
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');

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

  const showToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const user = data.session.user;
        setCurrentUser({ id: user.id, fullName: user.user_metadata?.fullName || 'Valued Customer', email: user.email, phone: user.user_metadata?.phone || '' });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setCurrentUser(user ? { id: user.id, fullName: user.user_metadata?.fullName || 'Valued Customer', email: user.email, phone: user.user_metadata?.phone || '' } : null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser?.email) {
      setOrders([]);
      return;
    }

    const loadOrdersFromDbAndStorage = async () => {
      // 1. Initial load from local storage
      const local = storage.getOrders().filter((order) => order.customer?.email?.toLowerCase() === currentUser.email.toLowerCase());
      setOrders(local);

      // 2. Fetch from MongoDB API
      try {
        const res = await fetch(`/api/orders?email=${encodeURIComponent(currentUser.email)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.orders) && json.orders.length > 0) {
          // Merge MongoDB orders with local orders
          const map = new Map();
          json.orders.forEach((o) => map.set(o.orderId, o));
          local.forEach((o) => { if (!map.has(o.orderId)) map.set(o.orderId, o); });
          const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
          setOrders(merged);
        }
      } catch (err) {
        console.error('MongoDB orders fetch fallback to local:', err);
      }
    };

    loadOrdersFromDbAndStorage();

    if (isSupabaseConfigured && currentUser?.id) {
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
    }
  }, [currentUser?.id, currentUser?.email]);

  // Execute pending actions after successful login/registration
  const handleAuthSuccess = (user) => {
    if (postAuthActionRef.current) {
      const callback = postAuthActionRef.current;
      postAuthActionRef.current = null;
      callback(user);
    }
    setAuthModalReason(null);
  };

  // Step 1 of Registration: Validate details and Generate 6-Digit OTP via /api/auth/otp
  const requestRegistrationOtp = async (userData) => {
    const email = userData.email.trim().toLowerCase();
    const phone = userData.phone.trim();
    const fullName = userData.fullName.trim();

    if (!fullName) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!userData.password || userData.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    if (storage.getUsers().some((user) => user.email === email)) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    let otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Call Backend /api/auth/otp to send OTP & show in Network Tab
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          phone,
          email,
          fullName,
        }),
      });
      const data = await res.json();
      if (data.success && data.otp) {
        otp = data.otp;
      }
    } catch (err) {
      console.error('OTP API fetch warning:', err);
    }

    setGeneratedOtp(otp);
    setPendingRegistration({ ...userData, email, phone, fullName });

    showToast(`🔑 [Value Plus OTP] Your verification code is: ${otp}`, 'success', 8000);

    return { success: true, otp };
  };

  // Step 2 of Registration: Verify OTP and finalize account registration
  const verifyOtpAndRegister = async (enteredOtp) => {
    if (!pendingRegistration) {
      return { success: false, message: 'No registration in progress. Please fill details again.' };
    }

    const { fullName, email, phone, password } = pendingRegistration;

    // Call Backend /api/auth/otp to verify
    try {
      const verifyRes = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phone,
          otp: enteredOtp.trim(),
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return { success: false, message: verifyData.message || 'Invalid OTP code.' };
      }
    } catch (err) {
      if (enteredOtp.trim() !== generatedOtp.trim()) {
        return { success: false, message: 'Invalid OTP code. Please enter the 6-digit code shown or request a new one.' };
      }
    }

    const user = { fullName, email, phone };
    storage.saveUsers([...storage.getUsers(), { ...user, password }]);
    storage.saveSession(user);
    setCurrentUser(user);

    // Primary: Sync and save user directly to MongoDB database
    try {
      const apiRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, password }),
      });
      const apiData = await apiRes.json();
      console.log('MongoDB /api/users response:', apiData);
    } catch (e) {
      console.error('MongoDB user sync warning:', e);
    }

    // Optional Supabase sync if enabled
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signUp({
          email,
          password,
          options: { data: { fullName, phone } },
        });
      } catch (err) {
        console.warn('Supabase optional sync warning:', err);
      }
    }

    setPendingRegistration(null);
    setGeneratedOtp('');
    setIsAuthModalOpen(false);

    showToast(`🎉 Registration verified! Welcome to Value Plus, ${fullName}!`);
    handleAuthSuccess(user);

    return { success: true };
  };

  // Resend OTP code via /api/auth/otp
  const resendRegistrationOtp = async () => {
    if (!pendingRegistration) return null;
    let otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend',
          phone: pendingRegistration.phone,
          email: pendingRegistration.email,
        }),
      });
      const data = await res.json();
      if (data.success && data.otp) {
        otp = data.otp;
      }
    } catch (err) {
      console.error('Resend OTP API warning:', err);
    }

    setGeneratedOtp(otp);
    showToast(`📲 [New OTP] Your verification code is: ${otp}`, 'info', 8000);
    return otp;
  };

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try MongoDB API login
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: cleanEmail, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const sessionUser = {
          fullName: data.user.fullName || 'Valued Customer',
          email: data.user.email,
          phone: data.user.phone || '',
        };
        storage.saveSession(sessionUser);
        setCurrentUser(sessionUser);
        setIsAuthModalOpen(false);
        showToast(`Welcome back, ${sessionUser.fullName}!`);
        handleAuthSuccess(sessionUser);
        return { success: true };
      }
    } catch (e) {
      console.error('MongoDB login error, checking local fallback:', e);
    }

    // 2. Local storage fallback login
    const localUser = storage.getUsers().find((item) => item.email === cleanEmail && item.password === password);
    if (localUser) {
      const sessionUser = { fullName: localUser.fullName, email: localUser.email, phone: localUser.phone };
      storage.saveSession(sessionUser);
      setCurrentUser(sessionUser);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${localUser.fullName}`);
      handleAuthSuccess(sessionUser);
      return { success: true };
    }

    return { success: false, message: 'Incorrect email or password. Please verify or register.' };
  };

  const logout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    storage.clearSession();
    setCurrentUser(null);
    setOrders([]);
    showToast('You have been logged out', 'info');
  };

  // Policy Modal Control
  const openPolicy = (activeTab = 'shipping') => {
    setPolicyModalState({ isOpen: true, activeTab });
  };

  const closePolicy = () => {
    setPolicyModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Guard to ensure Customer is Registered & Logged In before Checkout
  const requireAuthToProceed = (actionCallback, reason = 'checkout') => {
    if (currentUser) {
      actionCallback(currentUser);
    } else {
      postAuthActionRef.current = actionCallback;
      setAuthModalReason(reason);
      setIsCartOpen(false);
      setIsAuthModalOpen(true);
      showToast('🔒 Please Register or Log in to proceed with your order', 'info', 4500);
    }
  };

  // Buy Now Flow with registration requirement
  const handleBuyNow = (product, quantity = 1) => {
    const item = { ...product, quantity };
    requireAuthToProceed((_user) => {
      setBuyNowItem(item);
      setIsCheckoutOpen(true);
    }, 'checkout');
  };

  // Proceed to checkout from cart with registration requirement
  const handleProceedToCheckoutFromCart = () => {
    requireAuthToProceed((_user) => {
      setBuyNowItem(null);
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    }, 'checkout');
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
    showToast(`✓ "${product.name.slice(0, 30)}..." added to cart!`);
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

  // Order Placement
  const placeOrder = async (customerDetails, items, totals) => {
    const orderId = 'VP-' + Math.floor(100000 + Math.random() * 900000);

    const enrichedItems = (items || []).map((item) => ({
      id: item.id,
      name: item.name || item.title || 'Value Plus Product',
      productName: item.name || item.title || 'Value Plus Product',
      brand: item.brand || '',
      category: item.category || '',
      price: item.price || 0,
      quantity: item.quantity || 1,
      image: item.image || item.images?.[0] || '',
    }));

    const productNamesList = enrichedItems.map((i) => i.name).filter(Boolean);
    const productNames = productNamesList.join(', ');
    const primaryProductName = enrichedItems[0]?.name || 'Value Plus Product';

    const orderData = {
      orderId,
      date: new Date().toISOString(),
      customer: customerDetails,
      items: enrichedItems,
      productNames,
      primaryProductName,
      totalItemsCount: enrichedItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
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
      : updatedOrders.filter((order) => order.customer?.email?.toLowerCase() === (currentUser?.email || customerDetails.email).toLowerCase());
    setOrders(customerOrders);

    // Save directly to MongoDB Database
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          userId: currentUser?.id || null,
        }),
      });
      const orderJson = await orderRes.json();
      console.log('MongoDB /api/orders response with product names:', orderJson);
    } catch (e) {
      console.error('MongoDB order sync warning:', e);
    }

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
      if (error) showToast('Order saved locally & MongoDB, but Supabase sync failed.', 'info');
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

  // Cancel Order handler
  const cancelOrder = async (orderId) => {
    const allStored = storage.getOrders();
    const updated = allStored.map((ord) => ord.orderId === orderId ? { ...ord, status: 'Cancelled' } : ord);
    try {
      localStorage.setItem('valueplus_orders', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setOrders((prev) => prev.map((ord) => ord.orderId === orderId ? { ...ord, status: 'Cancelled' } : ord));

    // Update in MongoDB
    try {
      fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'Cancelled' }),
      }).catch((e) => console.error('MongoDB cancel update warning:', e));
    } catch (e) {
      console.error(e);
    }

    showToast(`Order ${orderId} has been cancelled successfully. Refund initiated.`, 'info');
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
        authModalReason,
        setAuthModalReason,
        policyModalState,
        openPolicy,
        closePolicy,
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
        handleProceedToCheckoutFromCart,
        requireAuthToProceed,
        placeOrder,
        cancelOrder,
        login,
        logout,
        requestRegistrationOtp,
        verifyOtpAndRegister,
        resendRegistrationOtp,
        pendingRegistration,
        setPendingRegistration,
        generatedOtp,
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

