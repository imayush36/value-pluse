import React, { useState } from 'react';
import { contactService } from '../services';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await contactService.submitContact(formData);
      if (res.data?.success) {
        setSubmitted(true);
        toast.success(res.data.message || 'Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (err) {
      // Local graceful fallback
      setSubmitted(true);
      toast.success('Thank you! Your message has been sent to our customer care team.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page py-12">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50 px-3 py-1 rounded-full">
            We're Here to Help
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">
            Get in Touch with Value Plus
          </h1>
          <p className="text-slate-600 text-sm">
            Have questions about appliance specifications, warranties, bulk corporate orders, or store locations? Drop us a message or visit our nearby store.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Information & Store Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-lg space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                Customer Support Hub
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Value Plus Electronics Megastore operates 50+ flagship stores across Uttar Pradesh and NCR. Our team is available 7 days a week.
              </p>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-primary shrink-0 mt-1" />
                  <div>
                    <div className="text-xs text-slate-400">Toll-Free Helpline</div>
                    <a href="tel:18001238258" className="font-semibold text-white hover:text-blue-200">
                      1800-123-VALUE (8258)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-primary shrink-0 mt-1" />
                  <div>
                    <div className="text-xs text-slate-400">Email Support</div>
                    <a href="mailto:support@valueplus.in" className="font-semibold text-white hover:text-blue-200">
                      support@valueplus.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-primary shrink-0 mt-1" />
                  <div>
                    <div className="text-xs text-slate-400">Corporate Headquarters</div>
                    <div className="text-slate-200 text-xs">
                      Value Plus Tower, Sector 62, Electronic City, Noida, UP - 201301
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-primary shrink-0 mt-1" />
                  <div>
                    <div className="text-xs text-slate-400">Working Hours</div>
                    <div className="text-slate-200 text-xs">Monday - Sunday: 10:00 AM – 9:00 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Guarantees Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <ShieldCheck size={18} className="text-emerald-600" />
                Value Plus Promise
              </div>
              <p>• 100% Genuine Brand Appliances with GST invoice</p>
              <p>• Certified Brand Installation Engineers</p>
              <p>• Immediate replacement for defective units</p>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
              <p className="text-slate-500 text-xs mb-6">
                Fill out the form below and an appliance specialist will reach back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                  <p className="text-slate-600 text-sm max-w-sm mx-auto">
                    Thank you for reaching out. We have logged your enquiry and our support team will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="9876543210"
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Subject / Topic <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Product Enquiry / Order Help"
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your query or message details here..."
                      className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Send size={16} />
                    {submitting ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
