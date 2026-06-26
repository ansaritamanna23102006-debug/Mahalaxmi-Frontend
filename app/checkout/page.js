'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/utils/api';
import { 
  Check, 
  ArrowRight, 
  MapPin, 
  Truck, 
  CreditCard, 
  Eye, 
  Download, 
  ShoppingBag,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [placedOrderId, setPlacedOrderId] = useState('MM-987452');
  const [placedOrderMongoId, setPlacedOrderMongoId] = useState('');
  const [backendCalculations, setBackendCalculations] = useState(null);
  
  // Checkout Form States
  const [address, setAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    landmark: '',
    pinCode: '',
    city: 'Mumbai'
  });
  
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const loadCart = async () => {
    try {
      const couponCode = localStorage.getItem('mahalaxmi-coupon-code') || null;
      const data = await api.cart.get(couponCode);
      if (data && data.cart) {
        if (data.cart.items && data.cart.items.length > 0) {
          setCart(data.cart.items.map(item => ({
            id: item.product._id || item.product,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            weight: item.weight,
            image: item.product.images ? item.product.images[0] : item.product.image
          })));
        } else {
          setCart([]);
        }
        setBackendCalculations({
          subtotal: data.cart.subtotal,
          discount: data.cart.discount,
          shippingCharge: data.cart.shippingCharge,
          total: data.cart.total
        });
        return;
      }
    } catch (e) {
      console.warn('Backend checkout cart loading failed, falling back to local storage:', e.message);
    }
    // Fallback
    try {
      const stored = localStorage.getItem('mahalaxmi-cart');
      if (stored) setCart(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('mahalaxmi-token');
    setIsLoggedIn(!!token);

    const storedUser = localStorage.getItem('mahalaxmi-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setProfile({
          name: user.name || user.fullName || '',
          email: user.email || '',
          phone: user.phone || user.mobileNumber || ''
        });
        setAddress(prev => ({
          ...prev,
          fullName: user.name || user.fullName || '',
          email: user.email || '',
          phone: user.phone || user.mobileNumber || '',
          street: '',
          landmark: '',
          pinCode: ''
        }));

        // Fetch saved addresses from backend and pre-fill default
        api.addresses.get().then(res => {
          if (res && res.addresses && res.addresses.length > 0) {
            const defAddr = res.addresses.find(a => a.isDefault) || res.addresses[0];
            setAddress(prev => ({
              ...prev,
              street: defAddr.addressLine || '',
              landmark: defAddr.landmark || '',
              pinCode: defAddr.pincode || '',
              city: defAddr.city || 'Mumbai'
            }));
          }
        }).catch(err => {
          // ignore
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadCart();
  }, []);

  const subtotal = backendCalculations ? backendCalculations.subtotal : cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = backendCalculations ? backendCalculations.discount : 0;
  const shippingCharge = backendCalculations ? backendCalculations.shippingCharge : (subtotal > 1000 || subtotal === 0 ? 0 : 80);
  const total = backendCalculations ? backendCalculations.total : (subtotal - discountAmount + shippingCharge);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!address.fullName || !address.fullName.trim()) {
        alert('Please enter your full name.');
        return;
      }
      const cleanPhone = address.phone ? address.phone.trim().replace(/\s+/g, '') : '';
      if (!cleanPhone) {
        alert('Please enter your mobile phone number.');
        return;
      }
      if (!/^\d{10}$/.test(cleanPhone)) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!isLoggedIn) {
        if (!address.email || !address.email.trim()) {
          alert('Please enter your email address.');
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(address.email.trim())) {
          alert('Please enter a valid email address.');
          return;
        }
      }
      if (!address.street || !address.street.trim()) {
        alert('Please enter your street address.');
        return;
      }
      const cleanPin = address.pinCode ? address.pinCode.trim() : '';
      if (!cleanPin) {
        alert('Please enter your pin code.');
        return;
      }
      if (!/^\d{6}$/.test(cleanPin)) {
        alert('Please enter a valid 6-digit pin code.');
        return;
      }
    }

    if (step === 4) {
      // Construct order request payload
      const orderData = {
        items: cart.map(item => ({
          product: item.id,
          quantity: item.quantity,
          weight: item.weight || '500g'
        })),
        shippingAddress: {
          name: address.fullName,
          mobile: address.phone,
          addressLine: address.street,
          landmark: address.landmark,
          city: address.city,
          state: 'Maharashtra',
          pincode: address.pinCode
        },
        paymentMethod: paymentMethod,
        couponCode: localStorage.getItem('mahalaxmi-coupon-code') || undefined,
        guestEmail: profile.email || address.email || 'guest@example.com'
      };

      try {
        const res = await api.orders.create(orderData);
        if (res.status === 'success') {
          if (orderData.paymentMethod === 'cod') {
            localStorage.setItem('mahalaxmi-cart', JSON.stringify([]));
            localStorage.removeItem('mahalaxmi-coupon-code');
            window.dispatchEvent(new Event('cart-updated'));
            setPlacedOrderId(res.order.orderId);
            setPlacedOrderMongoId(res.order._id);
            setStep(5);
          } else {
            // Trigger Razorpay payment gateway
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
              alert('Razorpay SDK failed to load. Are you offline?');
              return;
            }

            const options = {
              key: res.key,
              amount: res.amount,
              currency: res.currency,
              name: 'Mahalaxmi Mithaiwala',
              description: 'Traditional Sweets & Farsan since 1982',
              image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=100&auto=format&fit=crop',
              order_id: res.razorpayOrderId,
              handler: async function (response) {
                try {
                  const verifyRes = await api.orders.verifyPayment({
                    orderId: res.orderId,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature
                  });
                  
                  if (verifyRes.status === 'success') {
                    localStorage.setItem('mahalaxmi-cart', JSON.stringify([]));
                    localStorage.removeItem('mahalaxmi-coupon-code');
                    window.dispatchEvent(new Event('cart-updated'));
                    setPlacedOrderId(res.orderIdCode);
                    setPlacedOrderMongoId(res.orderId);
                    setStep(5);
                  } else {
                    alert('Payment verification failed.');
                  }
                } catch (err) {
                  alert('Error verifying payment: ' + err.message);
                }
              },
              prefill: {
                name: address.fullName,
                contact: address.phone,
                email: orderData.guestEmail
              },
              theme: {
                color: '#D7261E'
              }
            };
            
            const rzp = new window.Razorpay(options);
            rzp.open();
          }
        }
      } catch (err) {
        console.error('Order placement failed:', err);
        alert('Order placement failed: ' + err.message);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(Math.max(1, step - 1));
  };

  const downloadInvoice = () => {
    try {
      const invoiceText = `
========================================
       MAHALAXMI MITHAIWALA
          Since 1982
========================================
Order Code: ${placedOrderId}
Date: ${new Date().toLocaleDateString('en-IN')}
Customer: ${address.fullName}
Phone: ${address.phone}
Address: ${address.street}, ${address.landmark}, Mumbai - ${address.pinCode}

Items Ordered:
${cart.map(item => `- ${item.name} (${item.weight || '500g'}) x ${item.quantity}: Rs. ${item.price * item.quantity}`).join('\n')}

Subtotal: Rs. ${subtotal}
${discountAmount > 0 ? `Discount: - Rs. ${discountAmount}\n` : ''}Shipping: Rs. ${shippingCharge}
Grand Total: Rs. ${total}
========================================
   Thank you for your sweet purchase!
========================================
      `;
      const blob = new Blob([invoiceText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${placedOrderId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Invoice download simulated successfully!");
    }
  };

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen mandala-pattern">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-32 pb-12 bg-brand-brown text-brand-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(217,164,65,0.12),transparent)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-poppins text-brand-gold uppercase tracking-widest">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-cream/40" />
            <span className="text-brand-cream/80">Checkout</span>
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-extrabold tracking-wide">Secure Checkout</h1>
          <p className="text-xs sm:text-sm font-poppins font-light text-brand-cream/70 max-w-xl">
            Provide details to verify shipment parameters and confirm your order.
          </p>
        </div>
      </section>

      {/* Steps Indicator */}
      {step < 5 && (
        <section className="py-6 bg-brand-cream border-b border-brand-orange/15 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-[10px] sm:text-xs font-poppins font-bold uppercase tracking-wider text-brand-brown">
            {[
              { num: 1, label: "Address", icon: MapPin },
              { num: 2, label: "Delivery", icon: Truck },
              { num: 3, label: "Payment", icon: CreditCard },
              { num: 4, label: "Review", icon: Eye }
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-all duration-300 ${
                    isActive ? 'bg-brand-brown text-brand-gold border-brand-brown shadow-sm scale-110' :
                    isCompleted ? 'bg-green-600 text-white border-green-600' :
                    'bg-white border-brand-orange/20 text-brand-text/40'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                  </span>
                  <span className={`transition-colors duration-300 ${isActive ? 'text-brand-brown font-black underline decoration-brand-orange decoration-2' : 'text-brand-text/50 hidden sm:inline'}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Checkout Content */}
      <section className="py-16 max-w-5xl mx-auto px-4 md:px-8">
        
        {step === 5 ? (
          // Success Screen
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white border border-brand-orange/15 rounded-[36px] shadow-[0_15px_45px_rgba(230,179,37,0.05)] max-w-2xl mx-auto space-y-6"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto border-2 border-green-200 shadow-inner">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="font-playfair text-3xl font-black text-brand-brown">Order Confirmed!</h2>
            <div className="lotus-separator">
              <span className="text-brand-orange/60 font-serif text-sm">✦</span>
            </div>
            
            <p className="text-xs sm:text-sm font-poppins text-brand-text/80 leading-relaxed max-w-md mx-auto px-4">
              Thank you for ordering from <strong className="text-brand-brown font-bold">Mahalaxmi Mithaiwala</strong>. Your order reference code is <strong className="text-brand-maroon font-bold font-mono text-base px-2.5 py-1 bg-brand-bg rounded-lg border border-brand-orange/15">{placedOrderId}</strong>. We have sent receipt details to your registered credentials.
            </p>

            <div className="flex justify-center gap-4 pt-4 px-4 flex-wrap">
              <button 
                type="button"
                onClick={downloadInvoice}
                className="bg-brand-brown hover:bg-brand-gold text-brand-cream hover:text-brand-brown px-6 py-3 rounded-xl text-xs font-bold font-poppins transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" /> Download Invoice
              </button>
              <Link 
                href="/sweets" 
                className="bg-brand-gold hover:bg-brand-orange text-brand-brown px-6 py-3 rounded-xl text-xs font-bold font-poppins transition-colors shadow-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Step Panel */}
            <main className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-[36px] border border-brand-orange/15 shadow-[0_10px_35px_rgba(230,179,37,0.04)] space-y-6">
              
              <AnimatePresence mode="wait">
                {/* STEP 1: ADDRESS */}
                {step === 1 && (
                  <motion.div 
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <h3 className="font-playfair text-xl font-bold text-brand-brown">Shipping Address Details</h3>
                    <div className="w-12 h-[2px] bg-brand-orange mb-6"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-brown/80">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={address.fullName}
                          onChange={(e) => setAddress({...address, fullName: e.target.value})}
                          placeholder="Sneha Kapoor" 
                          className="w-full px-4 py-2.5 bg-brand-bg rounded-xl border border-brand-orange/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-brown/80">Mobile Phone</label>
                        <input 
                          type="tel" 
                          required
                          value={address.phone}
                          onChange={(e) => setAddress({...address, phone: e.target.value})}
                          placeholder="98765 43210" 
                          className="w-full px-4 py-2.5 bg-brand-bg rounded-xl border border-brand-orange/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                        />
                      </div>
                      {!isLoggedIn && (
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-brand-brown/80">Email Address (For invoice & order updates)</label>
                          <input 
                            type="email" 
                            required
                            value={address.email}
                            onChange={(e) => setAddress({...address, email: e.target.value})}
                            placeholder="name@email.com" 
                            className="w-full px-4 py-2.5 bg-brand-bg rounded-xl border border-brand-orange/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-brown/80">Street Address</label>
                      <input 
                        type="text" 
                        required
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        placeholder="Flat 304, Building A, CST Road, Kurla West" 
                        className="w-full px-4 py-2.5 bg-brand-bg rounded-xl border border-brand-orange/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-brown/80">Landmark</label>
                        <input 
                          type="text" 
                          value={address.landmark}
                          onChange={(e) => setAddress({...address, landmark: e.target.value})}
                          placeholder="Opp L Ward Office" 
                          className="w-full px-4 py-2.5 bg-brand-bg rounded-xl border border-brand-orange/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-brown/80">Pin Code</label>
                        <input 
                          type="text" 
                          required
                          value={address.pinCode}
                          onChange={(e) => setAddress({...address, pinCode: e.target.value})}
                          placeholder="400070" 
                          className="w-full px-4 py-2.5 bg-brand-bg rounded-xl border border-brand-orange/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-brown/80">City</label>
                        <input 
                          type="text" 
                          disabled
                          value={address.city}
                          className="w-full px-4 py-2.5 bg-brand-bg/60 text-brand-brown/50 rounded-xl border border-brand-orange/20 text-xs sm:text-sm font-poppins"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: DELIVERY */}
                {step === 2 && (
                  <motion.div 
                    key="step-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <h3 className="font-playfair text-xl font-bold text-brand-brown">Delivery Method</h3>
                    <div className="w-12 h-[2px] bg-brand-orange mb-6"></div>

                    <div className="space-y-4">
                      <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${deliveryMethod === 'standard' ? 'border-brand-orange bg-brand-bg/40' : 'border-brand-orange/10 hover:bg-brand-bg/20'}`}>
                        <input 
                          type="radio" 
                          name="delivery" 
                          value="standard" 
                          checked={deliveryMethod === 'standard'}
                          onChange={() => setDeliveryMethod('standard')}
                          className="accent-brand-brown w-4.5 h-4.5"
                        />
                        <div className="text-left font-poppins">
                          <h4 className="font-bold text-brand-brown text-sm">Standard Local Shipping (Same Day)</h4>
                          <p className="text-xs text-brand-text/60">Free shipping on orders above ₹1000. Else ₹80.</p>
                        </div>
                      </label>

                      <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${deliveryMethod === 'express' ? 'border-brand-orange bg-brand-bg/40' : 'border-brand-orange/10 hover:bg-brand-bg/20'}`}>
                        <input 
                          type="radio" 
                          name="delivery" 
                          value="express" 
                          checked={deliveryMethod === 'express'}
                          onChange={() => setDeliveryMethod('express')}
                          className="accent-brand-brown w-4.5 h-4.5"
                        />
                        <div className="text-left font-poppins">
                          <h4 className="font-bold text-brand-brown text-sm">Express Kitchen Prep & Local Dispatch</h4>
                          <p className="text-xs text-brand-text/60">Free shipping on orders above ₹1000. Else ₹80.</p>
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: PAYMENT */}
                {step === 3 && (
                  <motion.div 
                    key="step-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <h3 className="font-playfair text-xl font-bold text-brand-brown">Select Payment Method</h3>
                    <div className="w-12 h-[2px] bg-brand-orange mb-6"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'upi', label: 'UPI / GooglePay' },
                        { id: 'card', label: 'Credit / Debit Card' },
                        { id: 'net', label: 'Net Banking' },
                        { id: 'cod', label: 'Cash On Delivery' }
                      ].map((pm) => (
                        <label 
                          key={pm.id} 
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${paymentMethod === pm.id ? 'border-brand-brown bg-brand-bg text-brand-brown' : 'border-brand-orange/20 hover:bg-brand-bg/40'}`}
                        >
                          <input 
                            type="radio" 
                            name="payment" 
                            value={pm.id} 
                            checked={paymentMethod === pm.id}
                            onChange={() => setPaymentMethod(pm.id)}
                            className="accent-brand-brown w-4 h-4 shrink-0"
                          />
                          <span className="font-poppins font-bold text-xs sm:text-sm">{pm.label}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: REVIEW */}
                {step === 4 && (
                  <motion.div 
                    key="step-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <h3 className="font-playfair text-xl font-bold text-brand-brown">Review & Submit Order</h3>
                    <div className="w-12 h-[2px] bg-brand-orange"></div>

                    <div className="p-5 rounded-2xl bg-brand-ivory border border-brand-orange/15 space-y-3 font-poppins text-xs sm:text-sm">
                      <h4 className="font-bold text-brand-brown">Shipping Summary:</h4>
                      <p className="text-brand-text/80">{address.fullName} - {address.phone}</p>
                      <p className="text-brand-text/80">{address.street}, {address.landmark}, Mumbai {address.pinCode}</p>
                      <p className="text-brand-text/80 font-bold uppercase pt-2 border-t border-brand-orange/10 flex justify-between">
                        <span>Dispatch Method:</span>
                        <span className="text-brand-orange">{deliveryMethod.toUpperCase()}</span>
                      </p>
                      <p className="text-brand-text/80 font-bold uppercase flex justify-between">
                        <span>Payment Mode:</span>
                        <span className="text-brand-orange">{paymentMethod.toUpperCase()}</span>
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-playfair text-lg font-bold text-brand-brown">Items to prepare:</h4>
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs sm:text-sm font-poppins pb-2 border-b border-brand-orange/5">
                          <span className="text-brand-brown font-medium">{item.name} ({item.weight}) x {item.quantity}</span>
                          <span className="font-bold text-brand-maroon">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Navigation Controls */}
              <div className="flex justify-between items-center pt-6 border-t border-brand-orange/10">
                {step > 1 ? (
                  <button 
                    type="button"
                    onClick={handlePrevStep}
                    className="border border-brand-orange/30 hover:bg-brand-bg text-brand-brown font-bold font-poppins px-6 py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}
                
                <button 
                  type="button"
                  onClick={handleNextStep}
                  className="bg-brand-brown hover:bg-brand-gold text-brand-cream hover:text-brand-brown font-bold font-poppins px-8 py-3 rounded-xl text-xs transition-all duration-300 shadow-md flex items-center gap-2 active:scale-95 text-white shine-button"
                >
                  {step === 4 ? "Place Order" : "Continue"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </main>

            {/* Right Column: Checkout Pricing */}
            <aside className="lg:col-span-4 bg-brand-brown text-brand-cream p-8 rounded-[36px] border border-brand-gold/20 shadow-md space-y-6">
              <h3 className="font-playfair text-xl font-bold text-white flex items-center gap-2">
                <span>Your Order</span>
                <Sparkles className="w-4.5 h-4.5 text-brand-gold animate-pulse" />
              </h3>
              <div className="w-12 h-[2px] bg-brand-gold"></div>

              <div className="space-y-4 font-poppins text-xs sm:text-sm font-light">
                <div className="flex justify-between">
                  <span className="text-brand-cream/80">Items Subtotal:</span>
                  <span className="font-bold text-white">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-brand-gold">
                    <span>Discount:</span>
                    <span className="font-bold">- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-brand-cream/80">Shipping:</span>
                  <span className="font-bold text-white">{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
                </div>
                
                <div className="w-full h-[1px] bg-brand-cream/10 pt-2"></div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-sm font-medium text-white">Grand Total:</span>
                  <span className="font-poppins font-black text-2xl text-brand-gold">₹{total}</span>
                </div>
              </div>
            </aside>

          </div>
        )}

      </section>

      <Footer />
    </div>
  );
}
