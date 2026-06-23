'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronRight
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
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-32 pb-12 bg-brand-brown text-brand-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-poppins text-brand-gold uppercase tracking-widest">
            <a href="/" className="hover:underline">Home</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-cream/80">Your Order</span>
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-black">Your Sweet Order</h1>
          <p className="text-sm font-poppins font-light text-brand-cream/70 max-w-xl">
            Review your traditional sweet selections and prepare for a safe, secure checkout.
          </p>
        </div>
      </section>

      {/* Cart Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white border border-brand-gold/15 rounded-[36px] space-y-4">
            <ShoppingBag className="w-16 h-16 text-brand-gold/40 mx-auto" />
            <h2 className="font-playfair text-2xl font-bold text-brand-brown">Your Order Is Empty</h2>
            <p className="text-xs sm:text-sm text-brand-text/60 font-poppins">Explore our sweets and farsans to add items to your order.</p>
            <a 
              href="/sweets" 
              className="inline-block bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown px-8 py-3.5 rounded-xl font-bold font-poppins transition-colors"
            >
              Explore Sweets
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Cart items */}
            <main className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-brand-gold/15 shadow-sm space-y-6">
                <h3 className="font-playfair text-xl font-bold text-brand-brown pb-3 border-b border-brand-gold/15">Selected Treats</h3>
                
                <div className="space-y-6">
                  {cart.map((item, idx) => (
                    <div 
                      key={`${item.id}-${item.weight}-${idx}`} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-gold/10 last:border-0 last:pb-0"
                    >
                      {/* Product image & title */}
                      <div className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-brand-gold/20" />
                        <div>
                          <h4 className="font-poppins font-semibold text-brand-brown text-sm sm:text-base">{item.name}</h4>
                          <div className="flex gap-2 items-center text-xs text-brand-text/50 font-poppins mt-1">
                            <span className="bg-brand-bg px-2 py-0.5 rounded-md text-brand-brown border border-brand-gold/20 font-bold">{item.weight}</span>
                            <span>Category: {item.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center border border-brand-gold/30 rounded-xl overflow-hidden bg-brand-bg h-10">
                          <button onClick={() => updateQuantity(item.id, item.weight, -1)} className="px-2.5 hover:bg-brand-gold/15 h-full transition-colors">
                            <Minus className="w-3.5 h-3.5 text-brand-brown" />
                          </button>
                          <span className="px-3 font-semibold font-poppins text-brand-brown text-xs sm:text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.weight, 1)} className="px-2.5 hover:bg-brand-gold/15 h-full transition-colors">
                            <Plus className="w-3.5 h-3.5 text-brand-brown" />
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <span className="font-poppins font-black text-sm sm:text-base text-brand-maroon">₹{item.price * item.quantity}</span>
                          <p className="text-[10px] text-brand-text/40 font-poppins">₹{item.price} each</p>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.id, item.weight)}
                          className="text-brand-maroon/60 hover:text-brand-maroon p-1.5 bg-brand-bg rounded-lg border border-brand-gold/15 hover:border-brand-maroon transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Form */}
              <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-brand-gold/15 shadow-sm space-y-4">
                <h4 className="font-playfair text-lg font-bold text-brand-brown">Apply Promo Coupon</h4>
                <div className="w-12 h-[2px] bg-brand-gold"></div>
                
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
                      className="flex-grow px-4 py-2.5 bg-brand-bg text-brand-brown rounded-xl border border-brand-gold/20 focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs sm:text-sm font-poppins"
                    />
                    <button 
                      type="submit"
                      className="bg-brand-brown hover:bg-brand-gold text-brand-cream hover:text-brand-brown px-5 py-2.5 rounded-xl font-bold font-poppins text-xs transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-xs text-brand-maroon font-poppins font-medium">{couponError}</p>}
              </div>

            </main>

            {/* Right Column: Order Summary */}
            <aside className="lg:col-span-4 bg-brand-brown text-brand-cream p-8 rounded-[36px] border border-brand-gold/20 shadow-md space-y-6">
              <h3 className="font-playfair text-xl font-bold text-white">Order Summary</h3>
              <div className="w-12 h-[2px] bg-brand-gold"></div>

              <div className="space-y-4 font-poppins text-xs sm:text-sm font-light">
                <div className="flex justify-between">
                  <span>Order Subtotal:</span>
                  <span className="font-semibold text-white">₹{subtotal}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-brand-gold">
                    <span>Discount (15%):</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Shipping:</span>
                  <span className="font-semibold text-white">{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
                </div>
                
                <p className="text-[10px] text-brand-cream/50 pt-2 border-t border-brand-cream/10">
                  {subtotal > 1000 ? '🎉 Free delivery applied to your order!' : 'Add ₹' + (1000 - subtotal) + ' more to get FREE shipping.'}
                </p>

                <div className="w-full h-[1px] bg-brand-cream/10 pt-2"></div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-sm font-medium text-white">Grand Total:</span>
                  <span className="font-poppins font-black text-2xl text-brand-gold">₹{total}</span>
                </div>
              </div>

              <a 
                href="/checkout"
                className="w-full bg-brand-gold hover:bg-white text-brand-brown font-bold font-poppins h-12 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-xs"
              >
                Proceed To Checkout <ArrowRight className="w-4 h-4" />
              </a>

              <a 
                href="/sweets" 
                className="block text-center text-xs text-brand-cream/70 hover:text-brand-gold underline font-poppins pt-2"
              >
                Continue Shopping
              </a>
            </aside>

          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
