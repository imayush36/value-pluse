import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { productService, categoryService, cartService, wishlistService, orderService } from '../services';
import { PRODUCTS as FALLBACK_PRODUCTS, VALUE_PLUS_CATEGORIES as FALLBACK_CATEGORIES } from '../data/products';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { isAuthenticated, currentUser, openAuthModal } = useAuth();

  // Products & Categories state (Dynamic from API + graceful fallback)
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [brands, setBrands] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productPagination, setProductPagination] = useState({ page: 1, pages: 1, total: FALLBACK_PRODUCTS.length });

  // Cart & Wishlist State
  const [cart, setCart] = useState(() => storage.getCart());
  const [wishlist, setWishlist] = useState(() => storage.getWishlist());
  const [orders, setOrders] = useState(() => storage.getOrders());

  // UI Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
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
  const [minRating, setMinRating] = useState(0);

  // Toasts queue for in-app floating banner
  const [toasts, setToasts] = useState([]);

  // Fetch initial products, categories & brands from API
  const fetchProducts = useCallback(async (params = {}) => {
    setIsLoadingProducts(true);
    try {
      const res = await productService.getProducts(params);
      if (res.data?.success && res.data.products?.length > 0) {
        setProducts(res.data.products);
        setProductPagination({
          page: res.data.page || 1,
          pages: res.data.pages || 1,
          total: res.data.total || res.data.products.length,
        });
      }
    } catch (err) {
      // Keep fallback products in case backend is offline
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await productService.getFeatured();
      if (res.data?.success && res.data.products?.length > 0) {
        setFeaturedProducts(res.data.products);
      } else {
        setFeaturedProducts(FALLBACK_PRODUCTS.filter((p) => p.isFeatured));
      }
    } catch {
      setFeaturedProducts(FALLBACK_PRODUCTS.filter((p) => p.isFeatured));
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.data?.success && res.data.categories?.length > 0) {
        setCategories(res.data.categories);
      }
    } catch {
      // Keep fallback categories
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await productService.getBrands();
      if (res.data?.success && res.data.brands?.length > 0) {
        setBrands(res.data.brands);
      } else {
        const unique = [...new Set(FALLBACK_PRODUCTS.map((p) => p.brand))];
        setBrands(unique.sort());
      }
    } catch {
      const unique = [...new Set(FALLBACK_PRODUCTS.map((p) => p.brand))];
      setBrands(unique.sort());
    }
  }, []);

  // Sync Cart with Backend when authenticated
  const syncCartFromBackend = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await cartService.getCart();
      if (res.data?.success && res.data.cart) {
        const items = (res.data.cart.items || []).map((item) => ({
          id: item.product?._id || item.product,
          productId: item.product?._id || item.product,
          cartItemId: item._id,
          name: item.name || item.product?.name,
          image: item.image || item.product?.thumbnail || item.product?.images?.[0],
          price: item.discountPrice || item.price,
          originalPrice: item.price,
          quantity: item.quantity,
          stock: item.stock || item.product?.stock || 10,
        }));
        setCart(items);
        storage.saveCart(items);
      }
    } catch {
      // Use local storage
    }
  }, [isAuthenticated]);

  // Sync Wishlist with Backend when authenticated
  const syncWishlistFromBackend = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await wishlistService.getWishlist();
      if (res.data?.success && res.data.wishlist) {
        const prods = res.data.wishlist.products || [];
        setWishlist(prods);
        storage.saveWishlist(prods);
      }
    } catch {
      // Use local storage
    }
  }, [isAuthenticated]);

  // Sync Orders when authenticated
  const fetchMyOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await orderService.getMyOrders();
      if (res.data?.success && res.data.orders) {
        setOrders(res.data.orders);
        storage.saveOrder(res.data.orders);
      }
    } catch {
      // Use local storage
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchFeatured();
    fetchCategories();
    fetchBrands();
  }, [fetchProducts, fetchFeatured, fetchCategories, fetchBrands]);

  // Sync user-specific data on auth changes
  useEffect(() => {
    if (isAuthenticated) {
      syncCartFromBackend();
      syncWishlistFromBackend();
      fetchMyOrders();
    }
  }, [isAuthenticated, syncCartFromBackend, syncWishlistFromBackend, fetchMyOrders]);

  // Persist cart to localStorage
  useEffect(() => {
    storage.saveCart(cart);
  }, [cart]);

  // Persist wishlist to localStorage
  useEffect(() => {
    storage.saveWishlist(wishlist);
  }, [wishlist]);

  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast(message);

    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

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
  const addToCart = async (product, quantity = 1) => {
    const prodId = product._id || product.id;

    // Check stock
    const currentItem = cart.find((i) => (i.id || i._id) === prodId || i.productId === prodId);
    const totalDesired = (currentItem?.quantity || 0) + quantity;
    const maxStock = product.stock !== undefined ? product.stock : 99;

    if (totalDesired > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }

    if (isAuthenticated && product._id) {
      try {
        await cartService.addToCart(product._id, quantity);
        syncCartFromBackend();
      } catch (err) {
        // Fallback local
      }
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => (item.id || item._id) === prodId || item.productId === prodId);
      if (existingIndex > -1) {
        return prevCart.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prevCart,
        {
          ...product,
          id: prodId,
          productId: prodId,
          quantity,
          price: product.discountPrice || product.price,
          originalPrice: product.price,
          image: product.thumbnail || product.images?.[0] || product.image,
        },
      ];
    });

    showToast(`✓ "${(product.name || 'Product').slice(0, 30)}..." added to cart!`);
  };

  const updateQuantity = async (productId, delta) => {
    const item = cart.find((i) => (i.id || i._id) === productId || i.productId === productId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (item.stock && newQty > item.stock) {
      toast.error(`Only ${item.stock} units in stock`);
      return;
    }

    if (isAuthenticated && item.cartItemId) {
      try {
        await cartService.updateQuantity(item.cartItemId, newQty);
        syncCartFromBackend();
      } catch {
        // fallback
      }
    }

    setCart((prevCart) =>
      prevCart.map((it) =>
        (it.id || it._id) === productId || it.productId === productId ? { ...it, quantity: newQty } : it
      )
    );
  };

  const removeFromCart = async (productId) => {
    const item = cart.find((i) => (i.id || i._id) === productId || i.productId === productId);

    if (isAuthenticated && item?.cartItemId) {
      try {
        await cartService.removeFromCart(item.cartItemId);
        syncCartFromBackend();
      } catch {
        // fallback
      }
    }

    setCart((prevCart) => prevCart.filter((i) => (i.id || i._id) !== productId && i.productId !== productId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch {
        // fallback
      }
    }
    setCart([]);
    storage.clearCart();
  };

  // Wishlist Functions
  const toggleWishlist = async (product) => {
    const prodId = product._id || product.id;
    const exists = wishlist.some((item) => (item._id || item.id) === prodId);

    if (isAuthenticated && product._id) {
      try {
        await wishlistService.toggleWishlist(product._id);
        syncWishlistFromBackend();
      } catch {
        // fallback
      }
    }

    if (exists) {
      setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== prodId));
      showToast('Removed from wishlist', 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast(`❤ "${(product.name || 'Product').slice(0, 30)}..." saved to wishlist!`);
    }
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => (item._id || item.id) === productId);
  };

  // Buy Now Flow
  const handleBuyNow = (product, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please register or log in with OTP before ordering', 'info');
      openAuthModal('register');
      return;
    }
    setBuyNowItem({
      ...product,
      id: product._id || product.id,
      productId: product._id || product.id,
      quantity,
      price: product.discountPrice || product.price,
      originalPrice: product.price,
      image: product.thumbnail || product.images?.[0] || product.image,
    });
    setIsCheckoutOpen(true);
  };

  // Order Placement
  const placeOrder = async (customerDetails, items, totals, paymentInfo = {}) => {
    const orderItems = items.map((item) => ({
      product: item.productId || item._id || item.id,
      name: item.name,
      image: item.image || item.thumbnail || item.images?.[0],
      price: item.discountPrice || item.price,
      quantity: item.quantity,
    }));

    const orderPayload = {
      items: orderItems,
      deliveryAddress: customerDetails,
      paymentMethod: paymentInfo.method || 'COD',
      subtotal: totals.subtotal,
      deliveryCharge: totals.delivery || 0,
      discount: totals.discount || 0,
      totalAmount: totals.total,
      razorpayOrderId: paymentInfo.razorpayOrderId,
      razorpayPaymentId: paymentInfo.razorpayPaymentId,
      razorpaySignature: paymentInfo.razorpaySignature,
    };

    let confirmedOrder = null;

    if (isAuthenticated) {
      try {
        const res = await orderService.createOrder(orderPayload);
        if (res.data?.success && res.data.order) {
          confirmedOrder = res.data.order;
        }
      } catch (err) {
        console.error('Backend order creation failed, falling back to local storage:', err);
      }
    }

    // Local fallback order
    if (!confirmedOrder) {
      const orderId = 'VP-' + Math.floor(100000 + Math.random() * 900000);
      confirmedOrder = {
        _id: 'local_' + orderId,
        orderId,
        createdAt: new Date().toISOString(),
        customer: customerDetails,
        deliveryAddress: customerDetails,
        items: items,
        subtotal: totals.subtotal,
        deliveryCharge: totals.delivery || 0,
        discount: totals.discount || 0,
        totalAmount: totals.total,
        paymentMethod: paymentInfo.method || 'COD',
        paymentStatus: paymentInfo.method === 'Razorpay' ? 'Paid' : 'Pending',
        orderStatus: 'Confirmed',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      };
      const updatedOrders = storage.saveOrder(confirmedOrder);
      setOrders(updatedOrders);
    }

    setLastPlacedOrder(confirmedOrder);

    if (!buyNowItem) {
      clearCart();
    }
    setBuyNowItem(null);
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);
    return confirmedOrder;
  };

  const formatPrice = (amount) => {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  };

  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <ShopContext.Provider
      value={{
        products,
        featuredProducts,
        categories,
        brands,
        isLoadingProducts,
        productPagination,
        fetchProducts,
        cart,
        wishlist,
        orders,
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
        minRating,
        setMinRating,
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
        formatPrice,
        fetchMyOrders,
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
