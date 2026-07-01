'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/utils/api';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag, 
  Check, 
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [backendCalculations, setBackendCalculations] = useState({
    subtotal: 0,
    discount: 0,
    shippingCharge: 0,
    total: 0
  });

  const loadCart = async (code = null) => {
    try {
      const activeCode = code || (appliedDiscount > 0 ? couponCode : null);
      const data = await api.cart.get(activeCode);
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
      }
    } catch (e) {
      console.warn('Backend cart fetching failed, falling back to local storage:', e.message);
      // Fallback
      const stored = localStorage.getItem('mahalaxmi-cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCart(parsed);
      }
    }
  };

  useEffect(() => {
    loadCart();
    
    const handleCartUpdate = () => {
      loadCart();
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [appliedDiscount]);

  const saveCart = async (newCart) => {
    setCart(newCart);
    localStorage.setItem('mahalaxmi-cart', JSON.stringify(newCart));
    try {
      const itemsPayload = newCart.map(item => ({
        product: item.id,
        quantity: item.quantity,
        weight: item.weight || '500g'
      }));
      await api.cart.save(itemsPayload, appliedDiscount > 0 ? couponCode : null);
      loadCart();
    } catch (e) {
      console.warn('Could not sync cart to backend:', e.message);
    }
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = async (id, weight, delta) => {
    const item = cart.find(i => i.id === id && i.weight === weight);
    if (!item) return;
    const newQty = item.quantity + delta;

    try {
      await api.cart.update(id, weight, newQty, undefined, appliedDiscount > 0 ? couponCode : null);
      loadCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      const updated = cart.map(item => {
        if (item.id === id && item.weight === weight) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter(item => item.quantity > 0);
      saveCart(updated);
    }
  };

  const removeFromCart = async (id, weight) => {
    try {
      await api.cart.remove(id, weight, appliedDiscount > 0 ? couponCode : null);
      loadCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      const updated = cart.filter(item => !(item.id === id && item.weight === weight));
      saveCart(updated);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    const sub = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const data = await api.coupon.validate(couponCode, sub);
      if (data && data.discountAmount > 0) {
        setAppliedDiscount(data.discountValue / 100);
        setCouponSuccess(`${couponCode.toUpperCase()} coupon applied successfully! ₹${data.discountAmount} discount has been subtracted.`);
        // Reload cart with active coupon
        loadCart(couponCode);
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code.');
    }
  };

  const removeCoupon = () => {
    setAppliedDiscount(0);
    setCouponCode('');
    setCouponSuccess('');
    loadCart('');
  };

  // Re-calculate totals locally as a backup, or use server values
  const subtotal = backendCalculations.subtotal || cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = backendCalculations.discount || 0;
  const shippingCharge = backendCalculations.shippingCharge || (subtotal > 1000 || subtotal === 0 ? 0 : 80);
  const total = backendCalculations.total || (subtotal - discountAmount + shippingCharge);

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
            <span className="text-brand-cream/80">Your Order</span>
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-extrabold tracking-wide">Your Shopping Bag</h1>
          <p className="text-xs sm:text-sm font-poppins font-light text-brand-cream/70 max-w-xl">
            Review your traditional sweet selections and prepare for a safe, secure checkout.
          </p>
        </div>
      </section>

      {/* Cart Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white border border-brand-orange/20 rounded-[36px] shadow-sm max-w-2xl mx-auto space-y-6"
          >
            <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center text-brand-orange mx-auto border border-brand-orange/25">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-playfair text-2xl font-bold text-brand-brown">Your Shopping Bag is Empty</h2>
            <p className="text-xs sm:text-sm text-brand-text/60 font-poppins max-w-xs mx-auto leading-relaxed">
              Explore our fresh categories to discover premium sweets and savory farsans.
            </p>
            <Link 
              href="/sweets" 
              className="inline-block bg-brand-gold hover:bg-brand-orange text-brand-brown px-8 py-3.5 rounded-xl font-bold font-poppins transition-all duration-300 shadow-md hover:-translate-y-0.5"
            >
              Explore Menu
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Cart items */}
            <main className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-brand-orange/15 shadow-[0_10px_35px_rgba(230,179,37,0.04)] space-y-6">
                <h3 className="font-playfair text-xl font-bold text-brand-brown pb-3 border-b border-brand-orange/15">Selected Treats</h3>
                
                <div className="space-y-6">
                  <AnimatePresence initial={false}>
                    {cart.map((item, idx) => (
                      <motion.div 
                        key={`${item.id}-${item.weight}-${idx}`} 
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden', marginBottom: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-orange/10 last:border-0 last:pb-0"
                      >
                        {/* Product image & title */}
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-16 object-cover rounded-xl overflow-hidden border border-brand-orange/20 bg-brand-ivory shrink-0">
                            <img src={encodeURI(item.image)} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-poppins font-bold text-brand-brown text-sm sm:text-base">{item.name}</h4>
                            <div className="flex gap-2 items-center text-xs text-brand-text/50 font-poppins mt-1">
                              <span className="bg-brand-bg px-2 py-0.5 rounded-md text-brand-brown border border-brand-orange/20 font-bold">{item.weight}</span>
                              <span>Category: {item.category}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                          <div className="flex items-center border border-brand-orange/30 rounded-xl overflow-hidden bg-brand-bg h-10">
                            <button 
                              onClick={() => updateQuantity(item.id, item.weight, -1)} 
                              className="px-2.5 hover:bg-brand-orange/15 h-full transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5 text-brand-brown" />
                            </button>
                            <span className="px-3 font-bold font-poppins text-brand-brown text-xs sm:text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.weight, 1)} 
                              className="px-2.5 hover:bg-brand-orange/15 h-full transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5 text-brand-brown" />
                            </button>
                          </div>

                          <div className="text-right min-w-[80px]">
                            <span className="font-poppins font-black text-sm sm:text-base text-brand-maroon">₹{item.price * item.quantity}</span>
                            <p className="text-[10px] text-brand-text/40 font-poppins">₹{item.price} each</p>
                          </div>

                          <button 
                            type="button"
                            onClick={() => removeFromCart(item.id, item.weight)}
                            className="text-brand-maroon/60 hover:text-brand-maroon p-2 bg-brand-bg rounded-xl border border-brand-orange/15 hover:border-brand-maroon hover:bg-red-50/50 transition-all duration-200"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-brand-orange/15 shadow-[0_10px_35px_rgba(230,179,37,0.04)] space-y-4">
                <h4 className="font-playfair text-lg font-bold text-brand-brown flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-orange" /> Apply Promo Coupon
                </h4>
                <div className="w-12 h-[2px] bg-brand-orange"></div>
                
                {couponSuccess ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm rounded-xl">
                    <span className="flex items-center gap-2 font-poppins font-medium"><Check className="w-4 h-4 shrink-0" /> {couponSuccess}</span>
                    <button onClick={removeCoupon} className="text-green-700 hover:text-red-600 font-bold ml-4"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-3 max-w-md">
                    <input 
                      type="text" 
                      placeholder="Enter Coupon Code (e.g. FESTIVE15)" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow px-4 py-2.5 bg-brand-bg text-brand-brown rounded-xl border border-brand-orange/20 focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs sm:text-sm font-poppins"
                    />
                    <button 
                      type="submit"
                      className="bg-brand-brown hover:bg-brand-gold text-brand-cream hover:text-brand-brown px-6 py-2.5 rounded-xl font-bold font-poppins text-xs transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-xs text-brand-maroon font-poppins font-medium">{couponError}</p>}
              </div>

            </main>

            {/* Right Column: Order Summary */}
            <aside className="lg:col-span-4 bg-brand-brown text-brand-cream p-8 rounded-[36px] border border-brand-gold/20 shadow-md space-y-6 lg:sticky lg:top-24">
              <h3 className="font-playfair text-xl font-bold text-white flex items-center gap-2">
                <span>Order Summary</span>
                <Sparkles className="w-4.5 h-4.5 text-brand-gold animate-pulse" />
              </h3>
              <div className="w-12 h-[2px] bg-brand-gold"></div>

              <div className="space-y-4 font-poppins text-xs sm:text-sm font-light">
                <div className="flex justify-between">
                  <span className="text-brand-cream/80">Order Subtotal:</span>
                  <span className="font-bold text-white">₹{subtotal}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-brand-gold">
                    <span>Discount:</span>
                    <span className="font-bold">- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-brand-cream/80">Express Shipping:</span>
                  <span className="font-bold text-white">{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
                </div>
                
                <div className="p-3 bg-brand-cream/5 border border-brand-cream/10 rounded-xl mt-2 text-[10px] text-center">
                  {subtotal > 1000 ? (
                    <span className="text-brand-gold font-medium">🎉 Free delivery applied to your order!</span>
                  ) : (
                    <span>Add <strong className="text-brand-gold font-bold">₹{1000 - subtotal}</strong> more to get <strong className="text-brand-gold font-bold">FREE</strong> shipping.</span>
                  )}
                </div>

                <div className="w-full h-[1px] bg-brand-cream/10 pt-2"></div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-sm font-medium text-white">Grand Total:</span>
                  <span className="font-poppins font-black text-2xl text-brand-gold">₹{total}</span>
                </div>
              </div>

              <Link 
                href="/checkout"
                className="w-full bg-brand-gold hover:bg-brand-orange text-brand-brown font-bold font-poppins h-12 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-xs shine-button"
              >
                Proceed To Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <Link 
                href="/sweets" 
                className="block text-center text-xs text-brand-cream/60 hover:text-brand-gold underline font-poppins pt-2 transition-colors"
              >
                Continue Shopping
              </Link>
            </aside>

          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
