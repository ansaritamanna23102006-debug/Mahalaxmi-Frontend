'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User, 
  X, 
  Plus, 
  Minus, 
  ArrowRight,
  Menu,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '@/utils/api';

export default function Navbar({ transparent = false }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCart = localStorage.getItem('mahalaxmi-cart');
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (_) {}
    }
    return [];
  });

  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedWishlist = localStorage.getItem('mahalaxmi-wishlist');
        if (storedWishlist) {
          const parsed = JSON.parse(storedWishlist);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (_) {}
    }
    return [];
  });

  const [filteredSearch, setFilteredSearch] = useState([]);

  // Load cart and wishlist — localStorage-first, backend overlays if available
  const loadCartAndWishlist = async () => {
    // ── CART: always read localStorage first for instant update ──
    try {
      const storedCart = localStorage.getItem('mahalaxmi-cart');
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
    } catch (_) {}

    // Then try to sync with backend (overlay if backend has items)
    try {
      const cartData = await api.cart.get();
      if (cartData && cartData.cart && cartData.cart.items && cartData.cart.items.length > 0) {
        const backendCart = cartData.cart.items.map(item => ({
          id: item.product._id || item.product,
          name: item.product.name || 'Treat',
          price: item.price,
          quantity: item.quantity,
          weight: item.weight,
          image: item.product.images ? item.product.images[0] : 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500'
        }));
        setCart(backendCart);
        // Keep localStorage in sync with backend
        localStorage.setItem('mahalaxmi-cart', JSON.stringify(backendCart));
      }
    } catch (e) {
      console.warn('Backend Cart unavailable, using local storage:', e.message);
    }

    // ── WISHLIST: localStorage-first then backend overlay ──
    try {
      const storedWishlist = localStorage.getItem('mahalaxmi-wishlist');
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    } catch (_) {}

    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        const wishlistData = await api.wishlist.get();
        if (wishlistData && wishlistData.products) {
          setWishlist(wishlistData.products.map(p => ({
            id: p._id,
            slug: p.slug || p._id,
            name: p.name,
            price: p.discountPrice || p.price,
            category: p.category,
            image: p.images ? p.images[0] : 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500'
          })));
          return;
        }
      }
    } catch (e) {
      console.warn('Backend Wishlist unavailable, using local storage:', e.message);
    }
  };

  useEffect(() => {
    // Defer the initial load to the next event tick to avoid synchronous state updates in the mount effect
    const timer = setTimeout(() => {
      loadCartAndWishlist();
    }, 0);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleCartUpdate = () => {
      loadCartAndWishlist();
      setIsCartOpen(true);
    };

    const handleWishlistUpdate = () => {
      loadCartAndWishlist();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, []);

  // Debounced live backend search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      return;
    }
    const searchTimer = setTimeout(async () => {
      try {
        const data = await api.products.getAll({ search: searchQuery, limit: 5 });
        if (data && data.products) {
          setFilteredSearch(data.products.map(p => ({
            id: p._id,
            slug: p.slug || p._id,
            name: p.name,
            price: p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price,
            category: p.category,
            image: p.images ? p.images[0] : 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500'
          })));
        }
      } catch (err) {
        console.warn('Debounced search failed:', err.message);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const saveCart = async (newCart) => {
    setCart(newCart);
    localStorage.setItem('mahalaxmi-cart', JSON.stringify(newCart));
    try {
      const itemsPayload = newCart.map(item => ({
        product: item.id,
        quantity: item.quantity,
        weight: item.weight || '500g'
      }));
      await api.cart.save(itemsPayload);
    } catch (e) {
      console.warn('Could not sync cart to backend server:', e.message);
    }
    window.dispatchEvent(new Event('cart-updated'));
  };

  const saveWishlist = async (newWishlist) => {
    setWishlist(newWishlist);
    localStorage.setItem('mahalaxmi-wishlist', JSON.stringify(newWishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const updateQuantity = async (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;

    try {
      await api.cart.update(id, item.weight, newQty);
      loadCartAndWishlist();
    } catch (e) {
      const updated = cart.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter(item => item.quantity > 0);
      saveCart(updated);
    }
  };

  const removeFromCart = async (id) => {
    const item = cart.find(i => i.id === id);
    try {
      if (item) {
        await api.cart.remove(id, item.weight);
        loadCartAndWishlist();
      }
    } catch (e) {
      const updated = cart.filter(item => item.id !== id);
      saveCart(updated);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        await api.wishlist.remove(id);
        loadCartAndWishlist();
      } else {
        const updated = wishlist.filter(item => item.id !== id);
        saveWishlist(updated);
      }
    } catch (e) {
      const updated = wishlist.filter(item => item.id !== id);
      saveWishlist(updated);
    }
  };

  const addToCartFromWishlist = async (item) => {
    try {
      await api.cart.add(item.id, 1, item.weight || '500g');
      await api.wishlist.remove(item.id);
      loadCartAndWishlist();
    } catch (e) {
      const existing = cart.find(i => i.id === item.id);
      let updatedCart;
      if (existing) {
        updatedCart = cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        updatedCart = [...cart, { ...item, quantity: 1 }];
      }
      saveCart(updatedCart);
      removeFromWishlist(item.id);
    }
  };

  const addToCartFromSearch = async (item) => {
    try {
      await api.cart.add(item.id, 1, '500g');
      loadCartAndWishlist();
      setIsSearchOpen(false);
    } catch (e) {
      const existing = cart.find(i => i.id === item.id);
      let updatedCart;
      if (existing) {
        updatedCart = cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        updatedCart = [...cart, { ...item, quantity: 1 }];
      }
      saveCart(updatedCart);
      setIsSearchOpen(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className={transparent 
        ? `fixed top-0 left-0 w-full z-40 transition-all duration-500 ${isScrolled ? 'bg-brand-brown/90 backdrop-blur-md border-b border-brand-gold/30 py-2.5 shadow-2xl' : 'bg-transparent py-6'}`
        : "fixed top-0 left-0 w-full z-40 bg-brand-brown/95 backdrop-blur-md border-b border-brand-gold/30 py-2.5 shadow-2xl transition-all duration-500"}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Brand Logo - Enlarged and animated */}
          <Link href="/" className="flex items-center w-40 sm:w-52 md:w-56 h-12 transition-transform duration-300 hover:scale-105 active:scale-95" aria-label="Mahalaxmi Mithaiwala Home">
            <Image src="/logo.svg" alt="Mahalaxmi Mithaiwala Logo" width={224} height={48} priority className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,213,74,0.15)]" />
          </Link>

          {/* Navigation Links - Centered, customized with gold underlines and glows */}
          <nav className="hidden lg:flex items-center space-x-10">
            {['Home', 'Shop', 'Categories', 'About Us', 'Gallery', 'Contact'].map((link) => {
              const hrefs = {
                'Home': '/',
                'Shop': '/sweets',
                'Categories': '/categories',
                'About Us': '/about',
                'Gallery': '/gallery',
                'Contact': '/contact'
              };
              return (
                <Link 
                  key={link} 
                  href={hrefs[link]} 
                  className={`font-poppins font-semibold text-xs uppercase tracking-wider transition-all duration-300 relative group py-2 ${
                    transparent 
                      ? (isScrolled ? 'text-brand-cream hover:text-brand-gold' : 'text-brand-brown hover:text-brand-maroon')
                      : 'text-brand-cream hover:text-brand-gold'
                  }`}
                >
                  {link}
                  <span className="absolute left-1/2 bottom-0 -translate-x-1/2 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full shadow-[0_0_8px_#FFD54A]"></span>
                </Link>
              );
            })}
          </nav>

          {/* Header Controls (Right) - Elevated design and transitions */}
          <div className="flex items-center space-x-3.5">
            
            {/* Search Icon */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className={`p-3.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                transparent 
                  ? (isScrolled ? 'text-brand-cream hover:bg-white/10' : 'text-brand-brown hover:bg-brand-brown/10')
                  : 'text-brand-cream hover:bg-white/10'
              }`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className={`hidden sm:inline-flex p-3.5 rounded-full relative transition-all duration-300 hover:scale-110 active:scale-95 ${
                transparent 
                  ? (isScrolled ? 'text-brand-cream hover:bg-white/10' : 'text-brand-brown hover:bg-brand-brown/10')
                  : 'text-brand-cream hover:bg-white/10'
              }`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-maroon text-brand-cream text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-brand-gold animate-[pulse_1.5s_infinite]">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Icon with bounce badge */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`p-3.5 rounded-full relative transition-all duration-300 hover:scale-110 active:scale-95 ${
                transparent 
                  ? (isScrolled ? 'text-brand-cream hover:bg-white/10' : 'text-brand-brown hover:bg-brand-brown/10')
                  : 'text-brand-cream hover:bg-white/10'
              }`}
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-brown text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-brand-brown animate-[bounce_2s_infinite]">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <Link 
              href="/account"
              className={`hidden sm:inline-flex p-3.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                transparent 
                  ? (isScrolled ? 'text-brand-cream hover:bg-white/10' : 'text-brand-brown hover:bg-brand-brown/10')
                  : 'text-brand-cream hover:bg-white/10'
              }`}
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-3.5 rounded-full lg:hidden transition-all duration-300 hover:scale-110 active:scale-95 ${
                transparent 
                  ? (isScrolled ? 'text-brand-cream hover:bg-white/10' : 'text-brand-brown hover:bg-brand-brown/10')
                  : 'text-brand-cream hover:bg-white/10'
              }`}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 w-full bg-brand-brown/95 backdrop-blur-xl z-30 pt-24 pb-8 px-6 border-b border-brand-gold/30 shadow-2xl lg:hidden mandala-pattern"
          >
            <div className="flex flex-col space-y-3.5">
              {['Home', 'Shop', 'Categories', 'About Us', 'Gallery', 'Contact'].map((link) => {
                const hrefs = {
                  'Home': '/',
                  'Shop': '/sweets',
                  'Categories': '/categories',
                  'About Us': '/about',
                  'Gallery': '/gallery',
                  'Contact': '/contact'
                };
                return (
                  <Link 
                    key={link} 
                    href={hrefs[link]} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-poppins font-semibold text-md text-brand-cream hover:text-brand-gold py-3.5 border-b border-brand-cream/5 flex items-center justify-between group"
                  >
                    <span>{link}</span>
                    <ChevronRight className="w-4 h-4 text-brand-gold/50 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
              
              {/* Wishlist Link in Mobile Menu */}
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setIsWishlistOpen(true); }}
                className="flex items-center justify-between font-poppins font-semibold text-md text-brand-cream hover:text-brand-gold py-3.5 border-b border-brand-cream/5 text-left w-full cursor-pointer group"
              >
                <span>My Wishlist</span>
                <div className="flex items-center gap-2">
                  {wishlist.length > 0 && (
                    <span className="bg-brand-maroon text-brand-cream text-[9px] px-2 py-0.5 rounded-full font-bold border border-brand-gold">
                      {wishlist.length}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-brand-gold/50 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
                </div>
              </button>
              
              {/* Account Link in Mobile Menu */}
              <Link 
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-poppins font-semibold text-md text-brand-cream hover:text-brand-gold py-3.5 flex items-center justify-between group"
              >
                <span>My Account</span>
                <ChevronRight className="w-4 h-4 text-brand-gold/50 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay - Fully Glassmorphic */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-brown/85 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: -30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass-card w-full max-w-2xl rounded-3xl border border-brand-gold/30 overflow-hidden shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-brand-gold/15 bg-brand-brown/40">
                <h3 className="font-playfair text-xl font-bold text-brand-gold flex items-center gap-2">
                  <Search className="w-5 h-5 text-brand-gold" /> Search Our Traditional Collection
                </h3>
                <button onClick={() => setIsSearchOpen(false)} className="p-3.5 text-brand-cream/60 hover:text-brand-gold hover:bg-white/5 rounded-xl transition-all" aria-label="Close search">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search for Kaju Katli, Besan Ladoo, Spicy Sev..." 
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      if (val.trim() === '') {
                        setFilteredSearch([]);
                      }
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-brand-brown/30 rounded-2xl border-2 border-brand-gold/30 text-white placeholder-brand-cream/40 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all font-poppins text-lg"
                    aria-label="Search catalog"
                    autoFocus
                  />
                </div>
                <div className="max-h-80 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {searchQuery === '' ? (
                    <div className="text-center py-10 space-y-2">
                      <Sparkles className="w-8 h-8 text-brand-gold/30 mx-auto animate-pulse" />
                      <p className="text-sm text-brand-cream/50">Type to explore our freshly crafted sweets & farsans...</p>
                    </div>
                  ) : filteredSearch.length === 0 ? (
                    <p className="text-center text-sm text-brand-cream/50 py-10">No matching delicacies found.</p>
                  ) : (
                    filteredSearch.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 border border-transparent hover:border-brand-gold/20 transition-all group">
                        <Link href={`/product/${item.slug}`} onClick={() => setIsSearchOpen(false)} className="flex items-center space-x-4">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-brand-gold/20 bg-brand-brown/50">
                            <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                          </div>
                          <div>
                            <h4 className="font-poppins font-semibold text-white text-sm group-hover:text-brand-gold transition-colors">{item.name}</h4>
                            <p className="text-xs text-brand-gold font-medium">₹{item.price} / 500g</p>
                          </div>
                        </Link>
                        <button 
                          onClick={() => addToCartFromSearch(item)}
                          className="bg-brand-gold hover:bg-white text-brand-brown px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          Order Now
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wishlist Sidebar - Redesigned to Dark Luxury Theme */}
      <AnimatePresence>
        {isWishlistOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-brown/70 backdrop-blur-sm z-50 flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="bg-brand-brown/95 backdrop-blur-xl w-full max-w-md h-full shadow-2xl flex flex-col border-l border-brand-gold/25 text-brand-cream mandala-pattern"
            >
              <div className="p-6 flex items-center justify-between border-b border-brand-gold/20 bg-brand-brown text-brand-cream">
                <h3 className="font-playfair text-xl font-bold flex items-center gap-2 text-brand-gold">
                  <Heart className="w-5 h-5 fill-brand-gold stroke-brand-gold animate-[pulse_2s_infinite]" /> My Wishlist
                </h3>
                <button onClick={() => setIsWishlistOpen(false)} className="p-3 text-brand-cream/80 hover:text-brand-gold hover:bg-white/5 rounded-xl transition-all" aria-label="Close wishlist">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <Heart className="w-16 h-16 text-brand-gold/30 mx-auto" />
                    <p className="font-poppins text-brand-cream/50">Your wishlist is empty.</p>
                  </div>
                ) : (
                  wishlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-brand-brown/40 rounded-2xl border border-brand-gold/15 shadow-sm hover:border-brand-gold/40 transition-colors">
                      <Link href={`/product/${item.slug}`} onClick={() => setIsWishlistOpen(false)} className="flex items-center space-x-3.5 group/wishlist-item">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-brand-gold/15 bg-brand-brown">
                          <Image src={item.image} alt={item.name} width={56} height={56} unoptimized className="w-full h-full object-cover group-hover/wishlist-item:scale-105 transition-transform" />
                        </div>
                        <div>
                          <h4 className="font-poppins font-semibold text-white text-sm group-hover:text-brand-gold transition-colors">{item.name}</h4>
                          <p className="text-xs text-brand-gold font-bold">₹{item.price} / 500g</p>
                        </div>
                      </Link>
                      <div className="flex flex-col space-y-2.5 items-end">
                        <button 
                          onClick={() => addToCartFromWishlist(item)}
                          className="bg-brand-gold hover:bg-white text-brand-brown text-xs font-bold px-3.5 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                        >
                          Order
                        </button>
                        <button 
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-[11px] text-brand-maroon hover:text-white transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar - Redesigned to Dark Luxury Theme */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-brown/70 backdrop-blur-sm z-50 flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="bg-brand-brown/95 backdrop-blur-xl w-full max-w-md h-full shadow-2xl flex flex-col border-l border-brand-gold/25 text-brand-cream mandala-pattern"
            >
              <div className="p-6 flex items-center justify-between border-b border-brand-gold/20 bg-brand-brown text-brand-cream">
                <h3 className="font-playfair text-xl font-bold flex items-center gap-2 text-brand-gold">
                  <ShoppingBag className="w-5 h-5 text-brand-gold" /> Your Order ({cartItemCount})
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-3 text-brand-cream/80 hover:text-brand-gold hover:bg-white/5 rounded-xl transition-all" aria-label="Close cart">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <ShoppingBag className="w-16 h-16 text-brand-gold/30 mx-auto" />
                    <p className="font-poppins text-brand-cream/50">Your order is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-brand-brown/40 rounded-2xl border border-brand-gold/15 shadow-sm hover:border-brand-gold/40 transition-colors">
                      <div className="flex items-center space-x-3.5">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-brand-gold/15 bg-brand-brown">
                          <Image src={item.image} alt={item.name} width={56} height={56} unoptimized className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-poppins font-semibold text-white text-sm">{item.name}</h4>
                          <p className="text-xs text-brand-gold font-bold">₹{item.price} / 500g</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3.5">
                        <div className="flex items-center border border-brand-gold/30 rounded-xl overflow-hidden bg-brand-brown/60">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-brand-gold/15 transition-colors">
                            <Minus className="w-3.5 h-3.5 text-brand-cream" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold font-poppins text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-brand-gold/15 transition-colors">
                            <Plus className="w-3.5 h-3.5 text-brand-cream" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-brand-maroon/80 hover:text-brand-maroon">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-brand-brown border-t border-brand-gold/20">
                  <div className="flex justify-between items-center mb-4.5">
                    <span className="font-poppins font-medium text-brand-cream/80 text-sm">Subtotal:</span>
                    <span className="font-poppins font-bold text-2xl text-brand-gold">₹{cartTotal}</span>
                  </div>
                  <a 
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-brand-gold hover:bg-white text-brand-brown py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 mb-3 text-center text-sm shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    View My Order
                  </a>
                  <a 
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-brand-maroon text-brand-cream py-3 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-brown transition-all duration-300 flex items-center justify-center gap-2 text-center text-sm shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
