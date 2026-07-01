'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/utils/api';
import { 
  Star, 
  Heart, 
  SlidersHorizontal,
  Search,
  ChevronRight,
  ArrowUpDown,
  ArrowRight
} from 'lucide-react';

export default function FarsanPage() {
  const [farsans, setFarsans] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch farsans from backend
  const fetchFarsans = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAll({ category: 'Farsan', limit: 100 });
      if (data && data.products) {
        setFarsans(data.products.map(p => ({
          id: p._id,
          slug: p.slug || p._id,
          name: p.name,
          price: p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price,
          rating: p.ratings || 4.8,
          reviews: p.reviewsCount || 40,
          category: p.name.includes('Sev') || p.name.includes('Gathiya') || p.name.includes('Bhujia') || p.name.includes('Mix')
            ? 'Sev & Gathiya' 
            : p.name.includes('Chakli') || p.name.includes('Khakhra') || p.name.includes('Bhakarwadi') 
              ? 'Dry Snacks' 
              : 'Chutney Special',
          weight: p.weightOptions ? p.weightOptions[0] : '500g',
          image: p.images ? p.images[0] : 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500',
          description: p.description
        })));
      }
    } catch (e) {
      console.warn('Backend API failed to load farsans:', e.message);
      setFarsans([]);
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
      console.warn('Wishlist load failed:', e.message);
      const stored = localStorage.getItem('mahalaxmi-wishlist');
      if (stored) setWishlist(JSON.parse(stored));
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchFarsans();
      loadWishlist();
    });

    const handleWishlistUpdate = () => {
      loadWishlist();
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, []);

  const addToCart = async (product) => {
    // Optimistic update: localStorage first
    const weight = product.weight || '500g';
    const cart = JSON.parse(localStorage.getItem('mahalaxmi-cart') || '[]');
    const existing = cart.find(i => i.id === product.id && i.weight === weight);
    const newCart = existing
      ? cart.map(i => (i.id === product.id && i.weight === weight) ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...product, weight, quantity: 1 }];
    localStorage.setItem('mahalaxmi-cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
    try {
      await api.cart.add(product.id, 1, weight);
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

  const filtered = farsans.filter(far => {
    const matchesSearch = far.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || far.category === category;
    const matchesRating = far.rating >= minRating;
    return matchesSearch && matchesCategory && matchesRating;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-32 pb-12 bg-brand-brown text-brand-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-poppins text-brand-gold uppercase tracking-widest">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-cream/80">Crunchy Farsan</span>
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-black">Crunchy Farsan & Namkeen</h1>
          <p className="text-sm font-poppins font-light text-brand-cream/70 max-w-xl">
            Savor the true taste of Mumbai&apos;s finest crispy flatbreads, spiced bhujias, and sweet-sour bhakarwadis.
          </p>
        </div>
      </section>

      {/* Product Hub */}
      <section className="py-12 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-brand-gold/15 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-brand-gold/10">
                <h3 className="font-playfair text-lg font-bold text-brand-brown flex items-center gap-2">
                  <SlidersHorizontal className="w-4.5 h-4.5 text-brand-gold" /> Filter Settings
                </h3>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown/40 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search farsan..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-brand-bg rounded-lg border border-brand-gold/20 text-brand-brown focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Categories</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-brand-bg px-3 py-2.5 rounded-xl border border-brand-gold/20 text-xs font-medium text-brand-brown focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins cursor-pointer"
                >
                  {['All', 'Sev & Gathiya', 'Dry Snacks', 'Chutney Special'].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Min Rating</label>
                <div className="flex space-x-1">
                  {[0, 4.6, 4.7, 4.8, 4.9].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 text-center py-1.5 rounded-lg border text-xs font-bold font-poppins transition-colors ${minRating === rating ? 'bg-brand-maroon text-brand-cream border-brand-maroon' : 'border-brand-gold/20 text-brand-brown hover:bg-brand-bg'}`}
                    >
                      {rating === 0 ? 'All' : `${rating}★`}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Product Grid and Sorting */}
          <main className="lg:col-span-9 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-brand-cream rounded-2xl border border-brand-gold/15 gap-4">
              <span className="text-xs font-poppins text-brand-brown/70 font-semibold">{sorted.length} Crunchy snacks found</span>
              
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-brand-gold" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white px-3 py-1.5 rounded-lg border border-brand-gold/20 text-xs font-medium text-brand-brown focus:outline-none focus:ring-1 focus:ring-brand-gold"
                >
                  <option value="popular">Sort By Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Sort By Rating</option>
                </select>
              </div>
            </div>

            {/* Product Cards */}
            {sorted.length === 0 ? (
              <div className="p-20 text-center bg-brand-cream border border-brand-gold/15 rounded-3xl">
                <p className="text-brand-brown/60 font-poppins text-sm">No snacks found. Try resetting filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {sorted.map((product) => {
                  const isFav = wishlist.some(i => i.id === product.id);
                  return (
                    <div 
                      key={product.id}
                      className="bg-white rounded-[32px] overflow-hidden border border-brand-gold/15 shadow-md hover:shadow-2xl hover:border-brand-gold hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(255,213,74,0.12)] transition-all duration-500 group flex flex-col justify-between"
                    >
                      <div className="relative h-36 sm:h-52 overflow-hidden bg-brand-ivory border-b border-brand-gold/10">
                        <Image src={product.image} alt={product.name} fill unoptimized className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" />
                        <button 
                          onClick={() => toggleWishlist(product)}
                          className="absolute top-2.5 right-2.5 bg-white/80 hover:bg-white text-brand-maroon w-12 h-12 flex items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 border border-brand-gold/10 z-20"
                          aria-label="Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-brand-maroon text-brand-maroon' : 'none'}`} />
                        </button>
                        <span className="hidden sm:inline-block absolute bottom-4 left-4 bg-brand-brown/95 text-brand-gold text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-xl border border-brand-gold/20 shadow-md">
                          {product.category}
                        </span>
                      </div>

                      <div className="p-4 sm:p-6 flex-grow flex flex-col justify-between bg-white">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2.5">
                            <div className="flex text-brand-gold">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                            <span className="text-[10px] text-brand-text/50 font-poppins">({product.reviews})</span>
                          </div>
                          
                          <a href={`/product/${product.slug}`} className="hover:underline">
                            <h3 className="font-playfair text-sm sm:text-lg font-bold text-brand-brown mb-1.5 sm:mb-2 group-hover:text-brand-maroon transition-colors duration-300 line-clamp-2 leading-tight">{product.name}</h3>
                          </a>
                          
                          <p className="hidden sm:block text-xs text-brand-text/60 line-clamp-2 font-poppins font-light leading-relaxed mb-4">{product.description}</p>
                        </div>

                        <div className="pt-3 sm:pt-4 border-t border-brand-gold/10">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
                            <div>
                              <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-brand-text/40">Starting from</span>
                              <h4 className="font-poppins font-black text-sm sm:text-lg text-brand-maroon">₹{product.price}</h4>
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-brand-text/40 font-poppins">per 500g</span>
                          </div>
                          <a
                            href={`/product/${product.slug}`}
                            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown font-bold font-poppins text-xs py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-md active:scale-95 shine-button uppercase tracking-wider text-center min-h-[48px]"
                          >
                            Order Now <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Mock */}
            <div className="flex justify-center items-center gap-2 pt-6">
              <button className="px-4 py-2 bg-brand-cream rounded-xl text-xs font-semibold text-brand-brown border border-brand-gold/20 hover:bg-brand-gold hover:text-brand-brown transition-colors">Prev</button>
              <button className="w-9 h-9 bg-brand-maroon text-brand-cream rounded-xl text-xs font-bold">1</button>
              <button className="px-4 py-2 bg-brand-cream rounded-xl text-xs font-semibold text-brand-brown border border-brand-gold/20 hover:bg-brand-gold hover:text-brand-brown transition-colors">Next</button>
            </div>

          </main>

        </div>
      </section>

      <Footer />
    </div>
  );
}
