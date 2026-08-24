import React, { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

// Storefront Components
import Navbar from './components/Navbar';
import BottomNavBar from './components/BottomNavBar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import OrdersModal from './components/OrdersModal';
import PincodeModal from './components/PincodeModal';
import AuthModal from './components/AuthModal';
import AccountModal from './components/AccountModal';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

// Storefront Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PolicyPage from './pages/PolicyPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminContacts from './pages/admin/AdminContacts';

// Public Store Layout Wrapper
function StoreLayout() {
  return (
    <div className="app-layout">
      {/* Auto Scroll to top */}
      <ScrollToTop />

      {/* Sticky Desktop Navbar */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="main-content-area min-h-[60vh]">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <Checkout />
      <OrderSuccess />
      <OrdersModal />
      <PincodeModal />
      <AuthModal />
      <AccountModal />
      <Toast />

      {/* Mobile Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Routes>
          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="contacts" element={<AdminContacts />} />
          </Route>

          {/* Public Storefront Routes (wrapped in StoreLayout) */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PolicyPage />} />
            <Route path="/privacy" element={<PolicyPage />} />
            <Route path="/terms" element={<PolicyPage />} />
            <Route path="/terms-and-conditions" element={<PolicyPage />} />
            <Route path="/return-policy" element={<PolicyPage />} />
            <Route path="/return-and-replacement" element={<PolicyPage />} />
            <Route path="/return-replacement" element={<PolicyPage />} />
            <Route path="/refund-cancellation" element={<PolicyPage />} />
            <Route path="/refund-policy" element={<PolicyPage />} />
            <Route path="/cancellation-policy" element={<PolicyPage />} />
            <Route path="/shipping-policy" element={<PolicyPage />} />
            <Route path="/delivery-policy" element={<PolicyPage />} />
            <Route path="/faq" element={<PolicyPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ShopProvider>
    </AuthProvider>
  );
}
