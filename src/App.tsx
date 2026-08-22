// @ts-nocheck
import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Navbar from './components/Navbar';
import BottomNavBar from './components/BottomNavBar';
import Hero from './components/Hero';
import Deals from './components/Deals';
import ProductGrid from './components/ProductGrid';
import ProductPage from './components/ProductPage';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import OrdersModal from './components/OrdersModal';
import PincodeModal from './components/PincodeModal';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';

function MainAppContent() {
  const { selectedProduct } = useShop();

  return (
    <div className="app-layout">
      {/* Sticky Desktop Header Navbar */}
      <Navbar />

      {/* Main Content View */}
      <main className="main-content-area">
        {selectedProduct ? (
          /* Dedicated Full Product Page */
          <ProductPage />
        ) : (
          /* Home Store Layout */
          <>
            <Hero />
            <Deals />
            <ProductGrid />
            <WhyChooseUs />
            <Testimonials />
            <Newsletter />
          </>
        )}
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
      <Toast />

      {/* Mobile App-Style Bottom Navigation Bar */}
      <BottomNavBar />
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <MainAppContent />
    </ShopProvider>
  );
}
