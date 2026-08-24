import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const {
    cart,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    formatPrice,
    setIsCheckoutOpen,
    setBuyNowItem,
    showToast,
  } = useShop();

  const deliveryCharge = cartSubtotal > 500 ? 0 : 99;
  const totalAmount = cartSubtotal + deliveryCharge;

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      showToast('Please register or log in with OTP before proceeding to checkout', 'info');
      openAuthModal('register');
      return;
    }
    setBuyNowItem(null);
    setIsCheckoutOpen(true);
  };

  if (cart.length === 0) {
    return (
      <div className="container py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-sm text-slate-500 mb-6">
            Looks like you haven't added any electronic appliances to your cart yet.
          </p>
          <Link
            to="/shop"
            className="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm inline-block transition-all shadow-md"
          >
            Start Shopping Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
            <p className="text-sm text-slate-500">You have {cartCount} item(s) in your bag</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline"
          >
            <Trash2 size={14} /> Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id || item._id || item.productId}
                className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm"
              >
                <img
                  src={item.image || item.thumbnail}
                  alt={item.name}
                  className="w-24 h-24 object-contain rounded-xl bg-slate-50 p-2 border border-slate-100 shrink-0"
                />

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-slate-900 text-base line-clamp-2">{item.name}</h3>
                  <div className="text-xs text-slate-400 mt-1">Category: {item.category || 'Appliances'}</div>
                  <div className="flex items-baseline gap-2 mt-2 justify-center sm:justify-start">
                    <span className="text-lg font-bold text-slate-900">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 w-full sm:w-auto">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(item.id || item._id || item.productId, -1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 font-bold text-sm text-slate-800 min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id || item._id || item.productId, 1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id || item._id || item.productId)}
                    className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24 space-y-5">
              <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-semibold text-slate-900">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Standard Delivery</span>
                  <span className={`font-semibold ${deliveryCharge === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST &amp; Taxes</span>
                  <span className="text-xs text-slate-500 font-medium">Included</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-lg">Total Amount</span>
                <span className="font-extrabold text-2xl text-primary">{formatPrice(totalAmount)}</span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>100% Genuine Brand Warranty Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-primary shrink-0" />
                  <span>Free doorstep delivery on orders above ₹500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
