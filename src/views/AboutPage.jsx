import React from 'react';
import { ShieldCheck, Truck, Store, Award, Users, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="about-page py-12">
      <div className="container max-w-5xl">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50 px-3 py-1 rounded-full">
            About Value Plus
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-4">
            India's Leading Electronics &amp; Home Appliances Megastore
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Since our inception, Value Plus has transformed consumer electronics retail across North India, bringing genuine top-tier brands, transparent pricing, flexible financing, and world-class post-purchase service under one roof.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { number: '50+', label: 'Retail Megastores in UP & NCR' },
            { number: '500K+', label: 'Happy Families Served' },
            { number: '100%', label: 'Genuine Brand Warranty' },
            { number: '24 Hrs', label: 'Express Delivery Time' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
              <div className="text-3xl md:text-4xl font-extrabold text-primary mb-1">{stat.number}</div>
              <div className="text-xs font-medium text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 mb-16">
          <h2 className="text-2xl font-bold text-slate-900">Our Story &amp; Vision</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Value Plus began with a simple yet ambitious vision: to make the latest home technology and entertainment electronics accessible to every household in India without the friction of unreliable sellers or exorbitant prices.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Today, our network covers more than 50 brick-and-mortar retail outlets backed by our state-of-the-art digital storefront. Whether you are upgrading to an AI-powered 4K TV, outfitting a modular kitchen with inverter appliances, or setting up a high-performance workstation, Value Plus offers verified products straight from authorized distributors with complete brand warranty.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                <Award size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Authorized Dealers</h3>
              <p className="text-xs text-slate-500">Official partners with Sony, Samsung, LG, Daikin, Apple, Bosch, and 40+ global tech leaders.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Truck size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Express Logistics</h3>
              <p className="text-xs text-slate-500">Dedicated fulfillment fleet ensuring zero-transit damage and on-time doorstep installation.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-secondary flex items-center justify-center">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Lifetime Service Care</h3>
              <p className="text-xs text-slate-500">Dedicated toll-free helpline and certified in-house appliance technicians.</p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-r from-blue-900 to-primary text-white p-8 md:p-12 rounded-3xl text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold">Ready to Upgrade Your Living Space?</h2>
          <p className="text-blue-100 text-sm max-w-xl mx-auto">
            Discover curated appliances, unbeatable festive bank offers, and zero-downpayment EMI schemes today.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="px-8 py-3.5 bg-white text-primary rounded-xl font-bold text-sm hover:bg-blue-50 transition-all inline-block shadow-lg"
            >
              Explore All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
