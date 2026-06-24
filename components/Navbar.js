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
  ChevronRight
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
        ? `fixed top-0 left-0 w-full z-40 transition-all duration-500 ${isScrolled ? 'bg-brand-brown/95 backdrop-blur-md border-b border-brand-gold/20 py-3 shadow-xl' : 'bg-transparent py-5'}`
        : "fixed top-0 left-0 w-full z-40 bg-brand-brown border-b border-brand-gold/20 py-3 shadow-xl transition-all duration-500"}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center w-32 sm:w-44 md:w-56 h-12 transition-transform duration-300 hover:scale-105">
            <Image src="/logo.png" alt="Mahalaxmi Mithaiwala Logo" width={224} height={48} priority className="w-full h-full object-contain" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
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
                  className={`font-poppins font-medium text-sm tracking-wide transition-all duration-300 relative group ${
                    transparent 
                      ? (isScrolled ? 'text-brand-cream hover:text-brand-gold' : 'text-brand-brown hover:text-brand-maroon')
                      : 'text-brand-cream hover:text-brand-gold'
                  }`}
                >
                  {link}
                  <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                </Link>
              );
            })}
          </nav>

          {/* Header Controls (Right) */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className={`p-2 rounded-full transition-all duration-300 ${
                transparent 
                  ? (isScrolled ? 'text-brand-cream hover:bg-brand-cream/10' : 'text-brand-brown hover:bg-brand-brown/5')
                  : 'text-brand-cream hover:bg-brand-cream/10'
              }`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className={`hidden sm:inline-flex p-2 rounded-full relative transition-all duration-300 ${
                transparent 
                  ? (isScrolled ? 'text-brand-cream hover:bg-brand-cream/10' : 'text-brand-brown hover:bg-brand-brown/5')
                  : 'text-brand-cream hover:bg-brand-cream/10'
              }`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-maroon text-brand-cream text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-brand-gold animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`p-2 rounded-full relative transition-all duration-300 ${
                transparent 
                  ? (isScrolled ? 'text-brand-cream hover:bg-brand-cream/10' : 'text-brand-brown hover:bg-brand-brown/5')
                  : 'text-brand-cream hover:bg-brand-cream/10'
              }`}
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-brown text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-brand-brown animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <Link 
              href="/account"
              className={`hidden sm:inline-flex p-2 rounded-full transition-all duration-300 ${
                transparent 
                  ? (isScrolled ? 'text-brand-cream hover:bg-brand-cream/10' : 'text-brand-brown hover:bg-brand-brown/5')
                  : 'text-brand-cream hover:bg-brand-cream/10'
              }`}
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile Menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-full lg:hidden transition-all duration-300 ${
                transparent 
                  ? (isScrolled ? 'text-brand-cream hover:bg-brand-cream/10' : 'text-brand-brown hover:bg-brand-brown/5')
                  : 'text-brand-cream hover:bg-brand-cream/10'
              }`}
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 w-full bg-brand-brown z-35 pt-24 pb-8 px-6 border-b border-brand-gold/20 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col space-y-4">
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
                    className="font-poppins font-medium text-lg text-brand-cream hover:text-brand-gold py-2 border-b border-brand-cream/5"
                  >
                    {link}
                  </Link>
                );
              })}
              
              {/* Wishlist and Account links in Mobile Menu */}
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setIsWishlistOpen(true); }}
                className="flex items-center justify-between font-poppins font-medium text-lg text-brand-cream hover:text-brand-gold py-2 border-b border-brand-cream/5 text-left w-full cursor-pointer"
              >
                <span>My Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="bg-brand-maroon text-brand-cream text-[10px] px-2 py-0.5 rounded-full font-bold border border-brand-gold">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <Link 
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-poppins font-medium text-lg text-brand-cream hover:text-brand-gold py-2 border-b border-brand-cream/5"
              >
                My Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-brown/75 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="bg-brand-cream w-full max-w-2xl rounded-2xl shadow-2xl border border-brand-gold/30 overflow-hidden"
            >
              <div className="p-6 flex items-center justify-between border-b border-brand-gold/10">
                <h3 className="font-playfair text-xl font-bold text-brand-brown">Search Premium Sweets & Farsan</h3>
                <button onClick={() => setIsSearchOpen(false)} className="p-2 text-brand-brown/55 hover:text-brand-brown">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/50 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search for Sweets, Farsan, Hampers..." 
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      if (val.trim() === '') {
                        setFilteredSearch([]);
                      }
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/30 text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-gold font-poppins"
                    autoFocus
                  />
                </div>
                <div className="max-h-72 overflow-y-auto space-y-3">
                  {searchQuery === '' ? (
                    <p className="text-center text-sm text-brand-brown/60 py-6">Type to search our traditional collection...</p>
                  ) : filteredSearch.length === 0 ? (
                    <p className="text-center text-sm text-brand-brown/60 py-6">No matching sweet items found.</p>
                  ) : (
                    filteredSearch.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-brand-bg transition-colors">
                        <Link href={`/product/${item.slug}`} className="flex items-center space-x-3 group/search-item">
                          <Image src={item.image} alt={item.name} width={48} height={48} unoptimized className="w-12 h-12 object-cover rounded-lg border border-brand-gold/20 group-hover/search-item:border-brand-gold transition-colors" />
                          <div>
                            <h4 className="font-poppins font-medium text-brand-brown text-sm group-hover/search-item:text-brand-maroon transition-colors">{item.name}</h4>
                            <p className="text-xs text-brand-gold font-bold">₹{item.price} / 500g</p>
                          </div>
                        </Link>
                        <Link 
                          href={`/product/${item.slug}`}
                          className="bg-brand-gold text-brand-brown px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand-brown hover:text-brand-gold transition-all duration-300"
                        >
                          Order Now
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wishlist Sidebar */}
      <AnimatePresence>
        {isWishlistOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-brown/60 backdrop-blur-sm z-50 flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="bg-brand-cream w-full max-w-md h-full shadow-2xl flex flex-col border-l border-brand-gold/20"
            >
              <div className="p-6 flex items-center justify-between border-b border-brand-gold/10 bg-brand-brown text-brand-cream">
                <h3 className="font-playfair text-xl font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-brand-gold stroke-brand-gold" /> My Wishlist
                </h3>
                <button onClick={() => setIsWishlistOpen(false)} className="p-2 text-brand-cream/80 hover:text-brand-cream">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="text-center py-20">
                    <Heart className="w-16 h-16 text-brand-gold/40 mx-auto mb-4" />
                    <p className="font-poppins text-brand-brown/60">Your wishlist is empty.</p>
                  </div>
                ) : (
                  wishlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-brand-gold/10 shadow-sm">
                      <Link href={`/product/${item.slug}`} className="flex items-center space-x-3 group/wishlist-item">
                        <Image src={item.image} alt={item.name} width={56} height={56} unoptimized className="w-14 h-14 object-cover rounded-lg border border-brand-gold/10 group-hover/wishlist-item:border-brand-gold transition-colors" />
                        <div>
                          <h4 className="font-poppins font-medium text-brand-brown text-sm group-hover/wishlist-item:text-brand-maroon transition-colors">{item.name}</h4>
                          <p className="text-xs text-brand-gold font-bold">₹{item.price} / 500g</p>
                        </div>
                      </Link>
                      <div className="flex flex-col space-y-2">
                        <Link 
                          href={`/product/${item.slug}`}
                          className="bg-brand-gold text-brand-brown text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-brown hover:text-brand-gold transition-colors text-center"
                        >
                          Order Now
                        </Link>
                        <button 
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-xs text-brand-maroon hover:underline text-right"
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

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-brown/60 backdrop-blur-sm z-50 flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="bg-brand-cream w-full max-w-md h-full shadow-2xl flex flex-col border-l border-brand-gold/20"
            >
              <div className="p-6 flex items-center justify-between border-b border-brand-gold/10 bg-brand-brown text-brand-cream">
                <h3 className="font-playfair text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-gold" /> Your Order ({cartItemCount})
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-brand-cream/80 hover:text-brand-cream">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingBag className="w-16 h-16 text-brand-gold/40 mx-auto mb-4" />
                    <p className="font-poppins text-brand-brown/60">Your order is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-brand-gold/10 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Image src={item.image} alt={item.name} width={56} height={56} unoptimized className="w-14 h-14 object-cover rounded-lg border border-brand-gold/10" />
                        <div>
                          <h4 className="font-poppins font-medium text-brand-brown text-sm">{item.name}</h4>
                          <p className="text-xs text-brand-gold font-bold">₹{item.price} / 500g</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-brand-gold/30 rounded-lg overflow-hidden bg-brand-bg">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-brand-gold/15 transition-colors">
                            <Minus className="w-3.5 h-3.5 text-brand-brown" />
                          </button>
                          <span className="px-2.5 text-sm font-semibold font-poppins text-brand-brown">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-brand-gold/15 transition-colors">
                            <Plus className="w-3.5 h-3.5 text-brand-brown" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-brand-maroon/70 hover:text-brand-maroon">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-brand-brown text-brand-cream border-t border-brand-gold/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-poppins font-medium">Subtotal:</span>
                    <span className="font-poppins font-bold text-xl text-brand-gold">₹{cartTotal}</span>
                  </div>
                  <a 
                    href="/cart"
                    className="w-full bg-brand-gold text-brand-brown py-3 rounded-xl font-bold hover:bg-brand-cream hover:text-brand-brown transition-all duration-300 flex items-center justify-center gap-2 mb-2 text-center"
                  >
                    View My Order
                  </a>
                  <a 
                    href="/checkout"
                    className="w-full bg-brand-maroon text-brand-cream py-3 rounded-xl font-bold hover:bg-brand-gold hover:text-brand-brown transition-all duration-300 flex items-center justify-center gap-2 text-center"
                  >
                    Proceed to Checkout <ArrowRight className="w-5 h-5" />
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
