import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, FileText, RotateCcw, Truck, HelpCircle, ChevronRight } from 'lucide-react';

export default function PolicyPage() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  const getPolicyContent = () => {
    if (pathname.includes('privacy')) {
      return {
        title: 'Privacy Policy',
        icon: <Shield className="text-primary" size={32} />,
        subtitle: 'Last updated: January 2026 • Effective for all Value Plus Customers',
        sections: [
          {
            heading: '1. Information We Collect',
            text: 'We collect personal identification details when you register with OTP verification or place an order on Value Plus. This includes your Full Name, 10-digit Mobile Number, Email Address, Complete Delivery Address (with PIN code), and transaction reference identifiers. We do NOT store your credit/debit card numbers, UPI PINs, or CVVs on our servers.',
          },
          {
            heading: '2. Mobile OTP & Authentication Security',
            text: 'Mobile number verification via 6-digit one-time password (OTP) is mandatory for customer account creation, password recovery, and secure order placement. This ensures that unauthorized users cannot misuse your identity or contact information.',
          },
          {
            heading: '3. How We Use Your Information',
            text: 'Your data is utilized strictly for order processing, billing with statutory GST invoices, delivery coordination with logistics partners, dispatching real-time SMS/email status alerts, and scheduling official brand warranty and installation services.',
          },
          {
            heading: '4. Data Security & Encryption Standards',
            text: 'Value Plus implements strict industry-standard 256-bit SSL encryption, salted bcrypt password hashing, and tokenized JWT authentication. All online payment transactions are processed through RBI-authorized, PCI-DSS compliant payment gateways (Razorpay).',
          },
          {
            heading: '5. Zero Third-Party Data Selling',
            text: 'Value Plus does not sell, rent, monetise, or disclose your personal data to any marketing brokers or unauthorized third parties. Information is shared solely with verified delivery couriers and authorized brand service centers for the completion of your order.',
          },
          {
            heading: '6. Your Privacy Rights & Contact',
            text: 'You may access, update, or request deletion of your account information at any time from your Account Dashboard or by contacting our Data Protection Officer at privacy@valueplus.in.',
          },
        ],
      };
    }

    if (pathname.includes('refund') || pathname.includes('cancellation')) {
      return {
        title: 'Refund & Cancellation Policy',
        icon: <RotateCcw className="text-primary" size={32} />,
        subtitle: 'Transparent, Fast & Customer-First Cancellation and Refund Process',
        sections: [
          {
            heading: '1. Order Cancellation Before Dispatch',
            text: 'You can cancel any order free of charge at any time before the product is dispatched from our fulfillment warehouse. To cancel, navigate to "My Orders" in your profile and click "Cancel Order" or call our toll-free customer helpline at 1800-123-VALUE.',
          },
          {
            heading: '2. Zero Cancellation Fee',
            text: 'Value Plus charges 0% cancellation or penalty fees for orders cancelled prior to courier pickup and shipment.',
          },
          {
            heading: '3. Refund Processing Timelines for Prepaid Orders',
            text: 'For orders paid via Razorpay (UPI, Credit/Debit Cards, NetBanking, or Digital Wallets), the refund is initiated automatically within 24 hours of cancellation. The funds will reflect in your original payment account within 5 to 7 working days depending on your issuing bank.',
          },
          {
            heading: '4. Refund Process for Cash on Delivery (COD) Orders',
            text: 'If a Cash on Delivery order is returned or cancelled after payment collection at the doorstep, our finance team will transfer the refund amount directly to your verified Indian Bank Account via IMPS / NEFT within 48 to 72 business hours upon receipt of your bank account details.',
          },
          {
            heading: '5. Cancellation of Orders by Value Plus',
            text: 'In rare circumstances such as unanticipated stock exhaustion, inaccurate pricing due to technical error, or inability to service a remote non-serviceable PIN code, Value Plus reserves the right to cancel the order and provide an immediate 100% full refund.',
          },
        ],
      };
    }

    if (pathname.includes('return') || pathname.includes('replacement')) {
      return {
        title: 'Return & Replacement Policy',
        icon: <RotateCcw className="text-primary" size={32} />,
        subtitle: '7-Day Easy Doorstep Replacement Guarantee on All Electronics',
        sections: [
          {
            heading: '1. 7-Day Doorstep Replacement Guarantee',
            text: 'Every consumer electronic product and home appliance purchased from Value Plus is covered under our 7-Day Replacement Guarantee from the date of physical delivery in the event of manufacturing defects, in-transit physical damage, or delivery of an incorrect model.',
          },
          {
            heading: '2. Mandatory Conditions for Return & Replacement',
            text: 'To be eligible for a replacement, the product must be in its original unused condition, with all original manufacturer serial number barcode stickers, warranty cards, user manuals, remote controls, connecting cables, and outer packaging intact.',
          },
          {
            heading: '3. Authorized Brand Technician Inspection',
            text: 'For major home appliances (such as Smart TVs, Inverter Air Conditioners, Refrigerators, and Washing Machines), an authorized brand service technician (e.g. Daikin, LG, Samsung, Sony, IFB) will visit your doorstep within 24 to 48 hours of raising the request to inspect and generate a technical diagnostic report.',
          },
          {
            heading: '4. Reverse Pickup & Dispatch of Replacement Unit',
            text: 'Upon technician verification, our delivery team will schedule a free doorstep reverse pickup and dispatch a brand-new, sealed replacement unit immediately at zero additional shipping cost.',
          },
          {
            heading: '5. Non-Replaceable Scenarios',
            text: 'Replacements will not be entertained for physical damages caused by customer mishandling, electrical voltage surge without stabilizer, third-party unapproved repairs, missing serial number labels, or standard buyer remorse after 7 days.',
          },
        ],
      };
    }

    if (pathname.includes('shipping') || pathname.includes('delivery')) {
      return {
        title: 'Shipping & Delivery Policy',
        icon: <Truck className="text-primary" size={32} />,
        subtitle: 'Fast, Insured & Express Doorstep Delivery across Uttar Pradesh & NCR',
        sections: [
          {
            heading: '1. Delivery Coverage Area',
            text: 'Value Plus delivers across all districts, cities, and towns in Uttar Pradesh, Delhi NCR, and adjacent North Indian states through our centralized warehouse hubs and 50+ retail store logistics network.',
          },
          {
            heading: '2. Delivery Timelines & Express Shipping',
            text: 'Metro & Tier-1 Cities (Noida, Greater Noida, Ghaziabad, Lucknow, Kanpur): Delivered within 24 to 48 hours. Tier-2 & Regional Towns: Delivered within 2 to 4 business days. Same-day express dispatch is available for select orders placed before 1:00 PM.',
          },
          {
            heading: '3. Free Shipping Threshold',
            text: 'All orders with a subtotal value of ₹500 and above qualify for 100% FREE doorstep delivery. Orders below ₹500 incur a standard nominal shipping fee of ₹99.',
          },
          {
            heading: '4. Open Box Delivery & Inspection for Fragile Electronics',
            text: 'For high-value fragile appliances (LED Smart TVs, Refrigerators, Glass-top Washers), our certified delivery personnel offer Open-Box Delivery at your doorstep. You may inspect the physical exterior for any scratches or cracks before sharing the delivery confirmation OTP.',
          },
          {
            heading: '5. Real-Time Order Tracking & SMS Alerts',
            text: 'Once your order is processed, you will receive an SMS and email with your tracking number and delivery partner details. You can also track your live order progress in the "My Orders" section of your Value Plus account.',
          },
        ],
      };
    }

    if (pathname.includes('faq')) {
      return {
        title: 'Frequently Asked Questions (FAQ)',
        icon: <HelpCircle className="text-primary" size={32} />,
        subtitle: 'Everything you need to know about purchasing at Value Plus',
        sections: [
          {
            heading: 'Are all products 100% original and genuine?',
            text: 'Yes! Value Plus is an authorized direct dealer for all brands featured on our website. Every appliance comes with a valid manufacturer warranty and a standard GST invoice.',
          },
          {
            heading: 'How does No-Cost EMI work?',
            text: 'We partner with leading banks (HDFC, ICICI, SBI, Axis) and financial services (Bajaj Finserv) to provide 0% interest EMI options up to 24 months during checkout.',
          },
          {
            heading: 'How do I arrange for appliance installation?',
            text: 'Upon delivery, our system automatically raises an installation ticket with the official brand service center (e.g. Daikin, LG, Samsung). An engineer will contact you within 24 hours to complete standard installation.',
          },
          {
            heading: 'Can I pay Cash on Delivery (COD)?',
            text: 'Yes, Cash on Delivery is available for most products and PIN codes across North India up to the regulatory threshold of ₹50,000.',
          },
        ],
      };
    }

    // Default: Terms & Conditions
    return {
      title: 'Terms & Conditions',
      icon: <FileText className="text-primary" size={32} />,
      subtitle: 'Please review our service agreement',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          text: 'By accessing or purchasing from Value Plus (value-pluse.vercel.app), you agree to be bound by these Terms of Service, applicable laws, and regulations in India.',
        },
        {
          heading: '2. Pricing and Availability',
          text: 'All prices listed on the site are in Indian Rupees (INR) and inclusive of applicable GST taxes. Value Plus reserves the right to adjust prices or correct accidental typographical errors.',
        },
        {
          heading: '3. Brand Warranties',
          text: 'All manufacturer warranties are honored directly by the respective brands across their authorized service centers nationwide.',
        },
        {
          heading: '4. User Conduct & Account Security',
          text: 'Users are responsible for maintaining the confidentiality of their credentials and all activities occurring under their user account.',
        },
      ],
    };
  };

  const content = getPolicyContent();

  return (
    <div className="policy-page py-12">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 font-semibold">{content.title}</span>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center shrink-0">
              {content.icon}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{content.title}</h1>
              <p className="text-xs text-slate-500 mt-1">{content.subtitle}</p>
            </div>
          </div>

          <div className="space-y-6">
            {content.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">{sec.heading}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{sec.text}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-4">
            <span>For any legal or policy enquiries, write to legal@valueplus.in</span>
            <Link to="/contact" className="text-primary font-bold hover:underline">
              Contact Customer Support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
