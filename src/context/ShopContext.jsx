import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { PRODUCTS } from '../data/products';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Cart State
  const [cart, setCart] = useState(() => storage.getCart());
  // Wishlist State
  const [wishlist, setWishlist] = useState(() => storage.getWishlist());
  // Orders State
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

  // Toasts
  const [toasts, setToasts] = useState([]);

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
  const placeOrder = (customerDetails, items, totals) => {
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
    setOrders(updatedOrders);
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
