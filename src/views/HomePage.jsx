import React from 'react';
import Hero from '../components/Hero';
import Deals from '../components/Deals';
import ProductGrid from '../components/ProductGrid';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Deals />
      <ProductGrid />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </>
  );
}
