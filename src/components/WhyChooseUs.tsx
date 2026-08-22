// @ts-nocheck
import React from 'react';
import { Award, Store, Truck, CreditCard, ShieldCheck, Zap } from 'lucide-react';

const VALUE_PLUS_ADVANTAGES = [
  {
    icon: Store,
    title: '50+ Megastores in UP & NCR',
    desc: 'Touch and feel products at our physical retail stores in Noida, Lucknow, Ghaziabad, Kanpur & Agra before you buy.',
  },
  {
    icon: Award,
    title: '100% Genuine Brand Warranty',
    desc: 'Direct partnership with Apple, Samsung, Sony, LG, Daikin, Philips with official brand warranty & GST tax invoices.',
  },
  {
    icon: CreditCard,
    title: 'Zero-Cost EMI & Bank Offers',
    desc: 'Instant cashback and flexible No-Cost EMI up to 24 months with HDFC, ICICI, SBI, Axis & Bajaj Finserv.',
  },
  {
    icon: Truck,
    title: 'Express Doorstep Delivery',
    desc: 'Fast, insured doorstep delivery with optional professional demo & installation by certified brand technicians.',
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us-section" className="section section-light">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <ShieldCheck size={14} />
            <span>Value Plus Promise</span>
          </div>
          <h2 className="section-title">Why Shop at Value Plus?</h2>
          <p className="section-desc">
            For over two decades, Value Plus has been northern India's most trusted electronics and home appliance retailer.
          </p>
        </div>

        <div className="features-grid">
          {VALUE_PLUS_ADVANTAGES.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="feature-box">
                <div className="feature-icon-circle">
                  <Icon size={26} />
                </div>
                <h3 className="feature-title">{item.title}</h3>
                <p className="feature-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
