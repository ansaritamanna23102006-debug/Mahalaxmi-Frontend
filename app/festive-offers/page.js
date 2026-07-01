'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/utils/api';
import { 
  Sparkles, 
  Heart, 
  ChevronRight,
  Clock,
  Gift,
  Tag,
  ArrowRight
} from 'lucide-react';

export default function FestiveOffersPage() {
  const [activeCategory, setActiveCategory] = useState("Diwali");
  const [offers, setOffers] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["Diwali", "Eid", "Wedding", "Corporate Gifts", "Navratri", "Holi"];

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAll({ limit: 100 });
      if (data && data.products) {
        const mapped = data.products.map(p => {
          let category = "Diwali";
          if (p.name.includes("Besan") || p.name.includes("Peda") || p.name.includes("Ladoo")) category = "Eid";
          else if (p.name.includes("Mysore") || p.name.includes("Fafda") || p.name.includes("Bhujia")) category = "Wedding";
          else if (p.name.includes("Sev") || p.name.includes("Chakli") || p.name.includes("Namkeen")) category = "Corporate Gifts";
          else if (p.name.includes("Roll") || p.name.includes("Bhakarwadi")) category = "Navratri";
          else if (p.name.includes("Gulab") || p.name.includes("Rasgulla")) category = "Holi";

          return {
            id: p._id,
            slug: p.slug || p._id,
            name: p.name + " Festive Hamper",
            price: p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price,
            originalPrice: p.discountPrice && p.discountPrice > 0 ? p.price : p.price + 50,
            category: category,
            discount: p.discountPrice && p.discountPrice > 0 ? `${Math.round(((p.price - p.discountPrice) / p.price) * 100)}% OFF` : "15% OFF",
            badge: p.isFeatured ? "Best Seller" : "Special Offer",
            image: p.images ? p.images[0] : 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500',
            description: p.description,
            items: p.weightOptions ? p.weightOptions.join(' + ') : '500g sweets'
          };
        });
        setOffers(mapped);
      }
    } catch (e) {
      console.warn('Backend API failed to load products for festive offers:', e.message);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        const wishlistData = await api.wishlist.get();
        if (wishlistData && wishlistData.products) {
          setWishlist(wishlistData.products.map(p => ({ id: p._id })));
          return;
        }
      }
      const stored = localStorage.getItem('mahalaxmi-wishlist');
      if (stored) setWishlist(JSON.parse(stored));
    } catch (e) {
      const stored = localStorage.getItem('mahalaxmi-wishlist');
      if (stored) setWishlist(JSON.parse(stored));
    }
  };

  useEffect(() => {
    fetchOffers();
    loadWishlist();

    const handleWishlistUpdate = () => {
      loadWishlist();
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, []);

  const addToCart = async (product) => {
    // Optimistic update: localStorage first
    const cart = JSON.parse(localStorage.getItem('mahalaxmi-cart') || '[]');
    const existing = cart.find(i => i.id === product.id && i.weight === '500g');
    const newCart = existing
      ? cart.map(i => (i.id === product.id && i.weight === '500g') ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...product, weight: '500g', quantity: 1 }];
    localStorage.setItem('mahalaxmi-cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
    try {
      await api.cart.add(product.id, 1, '500g');
    } catch (e) {
      console.warn('Backend cart sync failed:', e.message);
    }
  };

  const toggleWishlist = async (product) => {
    const isFav = wishlist.some(i => i.id === product.id);
    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        if (isFav) {
          await api.wishlist.remove(product.id);
        } else {
          await api.wishlist.add(product.id);
        }
        loadWishlist();
        window.dispatchEvent(new Event('wishlist-updated'));
        return;
      }

      // Guest wishlist fallback
      let updated;
      if (isFav) {
        updated = wishlist.filter(i => i.id !== product.id);
      } else {
        updated = [...wishlist, { id: product.id }];
      }
      setWishlist(updated);
      localStorage.setItem('mahalaxmi-wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (e) {
      let updated;
      if (isFav) {
        updated = wishlist.filter(i => i.id !== product.id);
      } else {
        updated = [...wishlist, { id: product.id }];
      }
      setWishlist(updated);
      localStorage.setItem('mahalaxmi-wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlist-updated'));
    }
  };

  const currentOffers = offers.filter(item => item.category === activeCategory);

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-32 pb-12 bg-brand-brown text-brand-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-poppins text-brand-gold uppercase tracking-widest">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-cream/80">Festive Deals</span>
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-black">Festival Offers & Hampers</h1>
          <p className="text-sm font-poppins font-light text-brand-cream/70 max-w-xl">
            Explore limited-time collections, grand sweet combinations, and luxury gift hampers for your beloved ones.
          </p>
        </div>
      </section>

      {/* Festival Category Tabs */}
      <section className="py-8 bg-brand-cream border-b border-brand-gold/15">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-start sm:justify-center overflow-x-auto gap-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider font-poppins shrink-0 transition-colors border ${activeCategory === cat ? 'bg-brand-maroon text-brand-cream border-brand-maroon shadow-md' : 'bg-white text-brand-brown border-brand-gold/20 hover:bg-brand-bg'}`}
            >
              {cat} Offerings
            </button>
          ))}
        </div>
      </section>

      {/* Offers Showcase */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        
        {/* Banner Card */}
        <div className="rounded-3xl bg-brand-gradient border border-brand-gold/30 p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-brand-cream shadow-xl">
          <div className="space-y-4 max-w-xl">
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest font-poppins flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Active Promo Code
            </span>
            <h2 className="font-playfair text-2xl sm:text-4xl font-black">Get Flat 15% OFF on Wedding & Corporate Platters</h2>
            <p className="text-xs sm:text-sm text-brand-cream/85 font-poppins leading-relaxed">
              Celebrate the season with handcrafted sweets boxed in premium luxury packaging. Apply the coupon during checkout.
            </p>
            <div className="inline-flex items-center gap-3 bg-brand-gold/10 border border-brand-gold/30 px-4 py-2 rounded-xl">
              <Tag className="w-4 h-4 text-brand-gold" />
              <span className="font-mono text-brand-gold font-bold text-sm tracking-wider">FESTIVE15</span>
            </div>
          </div>
          
          {/* Limited Timer Box */}
          <div className="bg-brand-cream/10 backdrop-blur-md border border-brand-cream/20 p-6 rounded-2xl text-center space-y-3 min-w-[200px]">
            <Clock className="w-8 h-8 text-brand-gold mx-auto" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Time Remaining:</h4>
            <p className="font-mono text-brand-gold font-bold text-lg">3 Days : 12 Hours</p>
          </div>
        </div>

        {/* Selected Festival Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {currentOffers.map((item) => {
            const isFav = wishlist.some(i => i.id === item.id);
            return (
              <div 
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-brand-gold/15 shadow-md hover:shadow-xl hover:border-brand-gold transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Image Stage */}
                <div className="relative h-60 overflow-hidden">
                  <img src={encodeURI(item.image)} alt={item.name} className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <span className="absolute top-4 left-4 bg-brand-maroon text-brand-cream text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-brand-gold/20 shadow-md">
                    {item.discount}
                  </span>
                  {item.badge && (
                    <span className="absolute top-4 right-4 bg-brand-gold text-brand-brown text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md">
                      {item.badge}
                    </span>
                  )}
                  <button 
                    onClick={() => toggleWishlist(item)}
                    className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-brand-maroon w-12 h-12 flex items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-transform duration-300 hover:scale-110 active:scale-95"
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-brand-maroon' : 'none'}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-playfair text-xl font-bold text-brand-brown group-hover:text-brand-maroon transition-colors duration-300">{item.name}</h3>
                    <p className="text-xs text-brand-text/75 font-poppins font-light leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-gold uppercase tracking-wider font-poppins pt-2">
                      <Gift className="w-3.5 h-3.5" /> Includes: {item.items}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-gold/10">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-poppins font-black text-xl text-brand-maroon">₹{item.price}</span>
                      {item.originalPrice && (
                        <span className="font-poppins text-sm text-brand-text/40 line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                    <a
                      href={`/product/${item.slug}`}
                      className="w-full flex items-center justify-center gap-2 bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown font-bold font-poppins text-xs py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-md active:scale-95 min-h-[48px]"
                    >
                      Order Now <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      <Footer />
    </div>
  );
}
