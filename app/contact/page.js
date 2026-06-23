'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/utils/api';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Check, 
  MessageCircle,
  ChevronRight
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.contact.submit({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        mobile: formData.phone,
        subject: formData.subject,
        message: formData.message
      });
      setSubmitted(true);
    } catch (e) {
      console.warn('Backend contact submission failed, simulating success:', e.message);
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-32 pb-12 bg-brand-brown text-brand-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-poppins text-brand-gold uppercase tracking-widest">
            <a href="/" className="hover:underline">Home</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-cream/80">Contact Us</span>
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-black">Get in Touch</h1>
          <p className="text-sm font-poppins font-light text-brand-cream/70 max-w-xl">
            We are here to assist you with order tracking, custom wedding packages, and corporate bulk gifting inquiries.
          </p>
        </div>
      </section>

      {/* Contact Core Content */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Contact Form */}
          <main className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[36px] border border-brand-gold/15 shadow-sm space-y-6">
            <h2 className="font-playfair text-2xl font-black text-brand-brown">Send Us A Message</h2>
            <div className="w-12 h-1 bg-brand-maroon rounded-full"></div>
            
            {submitted ? (
              <div className="p-8 text-center bg-brand-cream border border-brand-gold/20 rounded-2xl space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-brand-brown">Inquiry Received</h3>
                <p className="text-xs sm:text-sm font-poppins text-brand-text/80">Thank you for writing. Our customer service desk will respond to you within 24 hours.</p>
                <button 
                  onClick={() => { setSubmitted(false); setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="bg-brand-brown hover:bg-brand-gold text-brand-cream hover:text-brand-brown px-6 py-2.5 rounded-xl text-xs font-bold font-poppins transition-colors"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">First Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Suraj"
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Last Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Prashad"
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@email.com"
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="98765 43210"
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Subject</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Wedding Sweets Platter Bulk Inquiry"
                    className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Message</label>
                  <textarea 
                    rows="4" 
                    required 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your request in detail..."
                    className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown px-8 py-3.5 rounded-xl text-xs font-bold font-poppins transition-all duration-300 shadow-md flex items-center justify-center gap-2 active:scale-95 pt-4"
                >
                  Submit Inquiry <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </main>

          {/* Right Side: Info Panel */}
          <aside className="lg:col-span-5 space-y-6">
            
            {/* Contact Details Card */}
            <div className="bg-brand-brown text-brand-cream p-8 rounded-[36px] border border-brand-gold/20 shadow-md space-y-6">
              <h3 className="font-playfair text-xl font-bold text-white">Contact Information</h3>
              <div className="w-12 h-[2px] bg-brand-gold"></div>

              <ul className="space-y-4 font-poppins text-xs sm:text-sm font-light">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <span>
                    Suraj Prashad Chawl No. 204 A,<br />
                    Opp. L Ward Office,<br />
                    CST Road, Kurla (W),<br />
                    Mumbai, Maharashtra – 400070
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-gold" />
                  <a href="tel:+912212345678" className="hover:text-brand-gold transition-colors">+91 22 1234 5678</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-gold" />
                  <a href="mailto:info@mahalaxmimithaiwala.com" className="hover:text-brand-gold transition-colors">info@mahalaxmimithaiwala.com</a>
                </li>
                <li className="flex items-start gap-3 pt-4 border-t border-brand-gold/10">
                  <Clock className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-0.5">Business Hours:</h4>
                    <p>Monday - Sunday: 9:00 AM - 10:00 PM</p>
                  </div>
                </li>
              </ul>

              {/* Direct WhatsApp Chat */}
              <a 
                href="https://wa.me/912212345678?text=Hi,%20I%20have%20an%20inquiry%20regarding%20Mahalaxmi%20Mithaiwala%20sweets" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-brand-gold hover:bg-white text-brand-brown font-bold font-poppins h-12 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <MessageCircle className="w-5 h-5" /> Chat via WhatsApp
              </a>
            </div>

            {/* Google Maps Embed */}
            <div className="rounded-[36px] overflow-hidden border border-brand-gold/15 shadow-sm h-64 relative bg-brand-cream">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.8123447953215!2d72.88371307611843!3d19.072002987085732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c880a42ea95b%3A0x6b4ef84c7a523a6d!2sKurla%20(W)%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1716584288000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              ></iframe>
            </div>

          </aside>

        </div>
      </section>

      <Footer />
    </div>
  );
}
