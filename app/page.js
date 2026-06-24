/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { 
  Star, 
  Heart,
  ShoppingBag,
  Check, 
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  Send,
  MapPin,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/utils/api';

// Import Swiper CSS styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// All data is loaded dynamically from the backend API.

export default function Home() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let data = await api.products.getBestSellers();
      let productsList = data?.products || [];
      if (productsList.length === 0) {
        const fallbackData = await api.products.getAll({ limit: 8 });
        productsList = fallbackData?.products || [];
      }
      // Limit featured bestsellers to at most 8 items on the homepage
      if (productsList.length > 8) {
        productsList = productsList.slice(0, 8);
      }
      if (productsList.length > 0) {
        setProducts(productsList.map(p => ({
          id: p._id,
          slug: p.slug || p._id,
          name: p.name,
          price: p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price,
          rating: p.ratings || 4.8,
          reviews: p.reviewsCount || 40,
          category: p.category,
          image: p.images ? p.images[0] : '',
          description: p.description,
          weight: p.variants && p.variants[0] ? p.variants[0].weight : '500g'
        })));
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.warn('Backend API failed to load bestsellers:', e.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.categories.getAll(),
        api.products.getAll({ limit: 200 })
      ]);

      const counts = {};
      if (prodRes && prodRes.products) {
        prodRes.products.forEach(p => {
          if (!counts[p.category]) counts[p.category] = 0;
          counts[p.category] += 1;
        });
      }

      if (catRes && catRes.categories) {
        const mappedCats = catRes.categories.map(cat => {
          const itemCount = counts[cat.name] || 0;
          return {
            name: cat.name,
            count: `${itemCount} Item${itemCount !== 1 ? 's' : ''}`,
            rawCount: itemCount,
            image: cat.image || 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500'
          };
        });

        // Sort by product count descending so popular categories are featured
        mappedCats.sort((a, b) => b.rawCount - a.rawCount);

        // Set all categories for the sliding carousel
        setCategories(mappedCats);
      }
    } catch (e) {
      console.warn('Failed to load categories:', e.message);
      setCategories([]);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const data = await api.reviews.getAll({ limit: 6 });
      if (data && data.reviews && data.reviews.length > 0) {
        setTestimonials(data.reviews.map(r => ({
          name: r.user?.fullName || 'Customer',
          location: 'Mumbai',
          rating: r.rating || 5,
          comment: r.comment
        })));
      } else {
        setTestimonials([]);
      }
    } catch (e) {
      console.warn('Failed to load testimonials:', e.message);
      setTestimonials([]);
    }
  };

  const fetchFestivalProducts = async () => {
    try {
      const data = await api.collections.getAll();
      if (data && data.collections) {
        const active = data.collections.filter(c => c.isActive !== false);
        setFestivals(active);
      } else {
        setFestivals([]);
      }
    } catch (e) {
      console.warn('Failed to load dynamic collections:', e.message);
      setFestivals([]);
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const data = await api.products.getAll({ limit: 6 });
      if (data && data.products && data.products.length > 0) {
        const galleryLabels = ['Shop Interior', 'Traditional Preparation', 'Gift Boxes', 'Festival Displays'];
        setGalleryItems(data.products.slice(0, 6).map((p, i) => ({
          title: p.name,
          category: galleryLabels[i % galleryLabels.length],
          image: p.images ? p.images[0] : ''
        })).filter(g => g.image));
      } else {
        setGalleryItems([]);
      }
    } catch (e) {
      console.warn('Failed to load gallery items:', e.message);
      setGalleryItems([]);
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
    Promise.resolve().then(() => {
      fetchProducts();
      fetchCategories();
      fetchTestimonials();
      fetchFestivalProducts();
      fetchGalleryItems();
      loadWishlist();
    });

    const handleWishlistUpdate = () => {
      loadWishlist();
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, []);

  const addToCart = async (product) => {
    // Optimistic update: localStorage first so cart shows instantly
    const cart = JSON.parse(localStorage.getItem('mahalaxmi-cart') || '[]');
    const existing = cart.find(i => i.id === product.id && i.weight === '500g');
    const newCart = existing
      ? cart.map(i => (i.id === product.id && i.weight === '500g') ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...product, weight: '500g', quantity: 1 }];
    localStorage.setItem('mahalaxmi-cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
    // Background sync
    try {
      await api.cart.add(product.id, 1, '500g');
    } catch (e) {
      console.warn('Backend cart sync failed, keeping localStorage version:', e.message);
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

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await api.newsletter.subscribe(newsletterEmail);
      setNewsletterSubscribed(true);
    } catch (err) {
      console.warn('Newsletter subscription failed:', err.message);
      setNewsletterSubscribed(true);
    }
  };

  return (
    <div className="relative min-h-screen font-sans antialiased text-brand-text bg-brand-bg select-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Mahalaxmi Mithaiwala",
            "image": "http://localhost:3000/hero_sweets.png",
            "@id": "http://localhost:3000",
            "url": "http://localhost:3000",
            "telephone": "+91-9999999999",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Kurla",
              "addressLocality": "Mumbai",
              "postalCode": "400070",
              "addressCountry": "IN"
            }
          })
        }}
      />
      <Navbar transparent={true} />
      
      {/* ----------------- HERO SECTION ----------------- */}
      <section id="home" className="relative min-h-screen pt-28 pb-16 flex items-center overflow-hidden bg-brand-ivory">
        {/* Background circular glowing effects */}
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] bg-brand-gold/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-[-10%] w-[400px] h-[400px] bg-brand-maroon/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Tagline / Established Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-maroon/10 border border-brand-maroon/30">
              <Sparkles className="w-4 h-4 text-brand-maroon" />
              <span className="text-xs font-semibold text-brand-maroon uppercase tracking-widest font-poppins">Since 1982 • Authentic Indian Sweets</span>
            </div>

            {/* Headline */}
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-black text-brand-brown leading-[1.1]">
              Sweets & Farsan <br />
              <span className="text-brand-maroon relative inline-block">
                Crafted with Tradition
                <span className="absolute bottom-1 left-0 w-full h-[4px] bg-brand-gold rounded-full opacity-60"></span>
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-brand-text/80 max-w-xl font-poppins font-light leading-relaxed">
              Serving Mumbai with premium sweets, farsan, gift boxes and festive collections for over four decades.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#shop"
                className="bg-brand-maroon text-brand-cream hover:bg-brand-gold hover:text-brand-brown font-semibold font-poppins px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
              >
                Shop Now 
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#categories"
                className="bg-transparent text-brand-brown border-2 border-brand-brown/80 hover:bg-brand-brown hover:text-brand-cream font-semibold font-poppins px-8 py-3.5 rounded-xl transition-all duration-300"
              >
                Explore Collection
              </a>
            </div>

            {/* Legacy Floating Badges (Desktop) */}
            <div className="hidden sm:flex items-center gap-6 pt-6 border-t border-brand-gold/25">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-cream rounded-xl border border-brand-maroon/20 shadow-sm text-brand-maroon">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs text-brand-text/50 font-bold uppercase tracking-wider">Legacy</h4>
                  <p className="font-semibold text-brand-brown text-sm font-poppins">Since 1982</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-cream rounded-xl border border-brand-maroon/20 shadow-sm text-brand-maroon">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs text-brand-text/50 font-bold uppercase tracking-wider">Quality</h4>
                  <p className="font-semibold text-brand-brown text-sm font-poppins">Premium Quality</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-cream rounded-xl border border-brand-maroon/20 shadow-sm text-brand-maroon">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs text-brand-text/50 font-bold uppercase tracking-wider">Freshness</h4>
                  <p className="font-semibold text-brand-brown text-sm font-poppins">Fresh Daily</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t lg:border-t-0 border-brand-gold/20">
              <div className="text-center sm:text-left">
                <h3 className="font-playfair text-2xl sm:text-3xl font-black text-brand-maroon">500+</h3>
                <p className="text-xs text-brand-text/75 font-poppins">Sweet Varieties</p>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-playfair text-2xl sm:text-3xl font-black text-brand-maroon">50+</h3>
                <p className="text-xs text-brand-text/75 font-poppins">Farsan Items</p>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-playfair text-2xl sm:text-3xl font-black text-brand-maroon">1M+</h3>
                <p className="text-xs text-brand-text/75 font-poppins">Happy Customers</p>
              </div>
            </div>
          </motion.div>

          {/* Right Image Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative flex justify-center items-center"
          >
            {/* Circular glow background ornament */}
            <div className="absolute w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full border border-brand-gold/30 bg-radial-gradient from-brand-gold/10 to-transparent pointer-events-none animate-[spin_60s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-brand-gold rounded-full shadow-lg"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-brand-maroon rounded-full shadow-lg"></div>
            </div>

            {/* Hero Main Sweet Image */}
            <div className="relative w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full overflow-hidden border-8 border-brand-cream shadow-2xl glow-gold group">
              <Image 
                src="/hero_sweets.png" 
                alt="Premium Mithai Platter" 
                fill
                priority
                sizes="(max-width: 640px) 280px, 420px"
                className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ----------------- CATEGORIES SECTION ----------------- */}
      <section id="categories" className="py-20 bg-brand-cream border-t border-brand-gold/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-maroon tracking-widest uppercase font-poppins">Handpicked Collections</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-brand-brown mt-2">
              Every Craving, Every Celebration
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Categories Slider */}
          <div className="relative px-2">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={2}
              breakpoints={{
                480: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 5 },
                1280: { slidesPerView: 6 }
              }}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              pagination={{ clickable: true, el: '.categories-pagination' }}
              navigation={{
                nextEl: '.categories-next',
                prevEl: '.categories-prev',
              }}
              className="py-6"
            >
              {categories.map((cat, idx) => {
                let link = `/sweets?category=${encodeURIComponent(cat.name)}`;
                if (cat.name.toLowerCase() === 'farsan') {
                  link = '/farsan';
                } else if (cat.name.toLowerCase() === 'gift boxes' || cat.name.toLowerCase() === 'gift box') {
                  link = '/festive-offers';
                }

                return (
                  <SwiperSlide key={cat.name} className="h-auto">
                    <Link href={link} className="block h-full">
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="group cursor-pointer flex flex-col items-center bg-brand-bg p-4 rounded-3xl border border-brand-gold/15 shadow-sm hover:shadow-xl hover:border-brand-gold transition-all duration-300 text-center h-full"
                      >
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 group-hover:scale-105 transition-transform duration-500">
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-playfair text-md font-bold text-brand-brown group-hover:text-brand-maroon transition-colors duration-300">{cat.name}</h3>
                        <span className="text-xs text-brand-maroon font-bold mt-1">{cat.count}</span>
                      </motion.div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
            
            {/* Custom Pagination & Navigation Controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="categories-pagination flex justify-center gap-2 w-auto"></div>
              <div className="flex space-x-2">
                <button className="categories-prev p-2.5 bg-brand-cream border border-brand-gold/40 text-brand-brown rounded-full hover:bg-brand-brown hover:text-brand-cream transition-colors duration-300">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <button className="categories-next p-2.5 bg-brand-cream border border-brand-gold/40 text-brand-brown rounded-full hover:bg-brand-brown hover:text-brand-cream transition-colors duration-300">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ----------------- BEST SELLERS SECTION ----------------- */}
      <section id="shop" className="py-20 bg-brand-ivory">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-maroon tracking-widest uppercase font-poppins">Customer Favorites</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-brand-brown mt-2">
              Our Bestseller Delicacies
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product, idx) => {
              const inWishlist = wishlist.some(item => item.id === product.id);
              
              return (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="bg-brand-cream rounded-3xl overflow-hidden border border-brand-gold/15 shadow-md hover:shadow-xl hover:border-brand-gold transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Product Image Panel */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700" 
                    />
                    
                    {/* Floating Wishlist Button */}
                    <button 
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-4 right-4 bg-white/80 hover:bg-white text-brand-maroon p-2 rounded-full shadow-md backdrop-blur-sm transition-transform duration-300 hover:scale-110 active:scale-95"
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-brand-maroon' : 'none'}`} />
                    </button>

                    {/* Category Overlay */}
                    <span className="absolute bottom-4 left-4 bg-brand-brown/90 text-brand-gold text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-brand-gold/30">
                      {product.category}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      {/* Rating Panel */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center text-brand-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-brand-text/60 font-poppins">({product.reviews})</span>
                      </div>

                      <h3 className="font-playfair text-lg font-bold text-brand-brown mb-2 group-hover:text-brand-maroon transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-xs text-brand-text/70 line-clamp-2 mb-4 font-poppins leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div>
                      {/* Price & Action Row */}
                      <div className="pt-4 border-t border-brand-gold/10">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-[10px] text-brand-text/50 uppercase tracking-widest font-bold">Starting from</p>
                            <span className="font-poppins font-black text-xl text-brand-maroon">₹{product.price}</span>
                          </div>
                          <span className="text-[10px] text-brand-text/40 font-poppins">per {product.weight}</span>
                        </div>
                        <Link
                          href={`/product/${product.slug}`}
                          className="w-full flex items-center justify-center gap-2 bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown font-bold font-poppins text-xs py-3 px-4 rounded-2xl transition-all duration-300 shadow-md active:scale-95"
                        >
                          Order Now <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ----------------- WHY FAMILIES TRUST MAHALAXMI ----------------- */}
      <section id="about-us" className="py-24 bg-brand-brown text-brand-cream relative overflow-hidden">
        {/* Glow patterns inside Dark Brown Section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold text-brand-gold tracking-widest uppercase font-poppins">Our Standards</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-2">
              Why Families Trust Mahalaxmi
            </h2>
            <div className="w-16 h-1 bg-brand-gold mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Since 1982 Legacy",
                description: "Serving Mumbaikars with traditional sweets & snacks for over 40 years.",
                icon: Award
              },
              {
                title: "Premium Ingredients",
                description: "Crafted exclusively with pure cow ghee, premium saffron, and select nuts.",
                icon: Sparkles
              },
              {
                title: "Fresh Daily",
                description: "Every item is freshly prepared in small batches each morning for perfect taste.",
                icon: Clock
              },
              {
                title: "Traditional Recipes",
                description: "Authentic, time-tested cooking methods passed down through generations.",
                icon: TrendingUp
              },
              {
                title: "Hygienic Preparation",
                description: "Highest sanitization standards, state of the art packaging, clean environment.",
                icon: ShieldCheck
              },
              {
                title: "Fast Delivery",
                description: "Secure, reliable, and prompt home delivery services across Mumbai.",
                icon: MapPin
              }
            ].map((feature, idx) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card p-8 rounded-3xl border border-brand-gold/15 hover:border-brand-gold/45 hover:bg-brand-cream/10 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-brand-gold/15 rounded-2xl flex items-center justify-center border border-brand-gold/30 text-brand-gold mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-brand-cream/70 font-poppins leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ----------------- FESTIVAL COLLECTIONS ----------------- */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-maroon tracking-widest uppercase font-poppins">Festive Hampers</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-brand-brown mt-2">
              Festival Collections
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Festival Collections Carousel */}
          <div className="relative px-2">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 1.5 },
                1024: { slidesPerView: 2 },
                1280: { slidesPerView: 3 }
              }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true, el: '.festival-pagination' }}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              className="py-10"
            >
              {festivals.map((fest, idx) => (
                <SwiperSlide key={fest.title} className="h-auto">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-3xl overflow-hidden border border-brand-gold/15 shadow-lg flex flex-col h-full hover:shadow-xl hover:border-brand-gold transition-all duration-300"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img src={fest.image} alt={fest.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6">
                        <span className="text-brand-gold text-xs uppercase font-bold tracking-widest">{fest.tagline}</span>
                        <h3 className="font-playfair text-2xl font-bold text-white mt-1">{fest.title}</h3>
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <p className="text-sm text-brand-text/70 font-poppins leading-relaxed mb-6">
                        {fest.description}
                      </p>
                      <button 
                        onClick={() => setSelectedCollection(fest)}
                        className="text-brand-maroon hover:text-brand-gold font-semibold text-sm flex items-center gap-2 transition-colors self-start"
                      >
                        Inquire Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Pagination & Navigation Controls */}
            <div className="flex justify-between items-center mt-6">
              <div className="festival-pagination flex justify-center gap-2 w-auto"></div>
              <div className="flex space-x-2">
                <button className="swiper-button-prev-custom p-2.5 bg-brand-cream border border-brand-gold/40 text-brand-brown rounded-full hover:bg-brand-brown hover:text-brand-cream transition-colors duration-300">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <button className="swiper-button-next-custom p-2.5 bg-brand-cream border border-brand-gold/40 text-brand-brown rounded-full hover:bg-brand-brown hover:text-brand-cream transition-colors duration-300">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ----------------- OUR STORY SECTION ----------------- */}
      <section className="py-24 bg-brand-ivory">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Image Column */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 relative flex justify-center"
            >
              {/* Legacy Floating Badge */}
              <div className="absolute top-4 left-4 z-20 bg-brand-gold text-brand-brown font-playfair font-bold text-lg px-6 py-3 rounded-2xl shadow-xl border border-brand-cream/30">
                Since 1982
              </div>

              {/* Photo Frame */}
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border-8 border-white shadow-2xl">
                <img 
                  src="/traditional_maker.png" 
                  alt="Traditional Indian Sweet Maker" 
                  className="w-full h-full object-cover transform scale-100 hover:scale-105 transition-transform duration-700" 
                />
              </div>
            </motion.div>

            {/* Right Story Column */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 space-y-6"
            >
              <span className="text-xs font-bold text-brand-maroon tracking-widest uppercase font-poppins">Our Heritage</span>
              <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-brand-brown leading-tight">
                A Sweet Legacy, <br />
                Passed Down With Love
              </h2>
              <div className="w-16 h-1 bg-brand-maroon rounded-full"></div>
              
              <div className="space-y-4 text-brand-text/85 font-poppins font-light text-sm sm:text-base leading-relaxed">
                <p>
                  For over four decades, Mahalaxmi Mithaiwala has been synonymous with sweet celebrations in Mumbai. Founded in 1982, we started with a simple vision: to prepare and serve traditional sweets and savories with unwavering purity and authentic flavor.
                </p>
                <p>
                  Every recipe has been preserved and refined, ensuring that the legacy of standard Indian culinary artistry remains alive. From milk sweets made with traditional condensing procedures to crunchy farsan seasoned with secret masala blends, we bring you taste that feels like home.
                </p>
              </div>

              {/* Heritage Stats Row */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-brand-gold/25">
                <div>
                  <h4 className="font-playfair text-2xl font-black text-brand-maroon">1982</h4>
                  <p className="text-xs text-brand-text/70 font-poppins font-medium mt-1">Established</p>
                </div>
                <div>
                  <h4 className="font-playfair text-2xl font-black text-brand-maroon">40+</h4>
                  <p className="text-xs text-brand-text/70 font-poppins font-medium mt-1">Years Experience</p>
                </div>
                <div>
                  <h4 className="font-playfair text-2xl font-black text-brand-maroon">1000+</h4>
                  <p className="text-xs text-brand-text/70 font-poppins font-medium mt-1">Daily Customers</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ----------------- TESTIMONIALS SECTION ----------------- */}
      <section id="testimonials" className="py-24 bg-brand-cream border-t border-b border-brand-gold/15">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-maroon tracking-widest uppercase font-poppins">Customer Love</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-brand-brown mt-2">
              Words From Our Customers
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Testimonial Auto Slider */}
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: '.testimonials-pagination' }}
            className="pb-12"
          >
            {testimonials.map((test, idx) => (
              <SwiperSlide key={idx} className="h-auto">
                <div className="bg-white p-8 rounded-3xl border border-brand-gold/15 shadow-md flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-300">
                  <div>
                    {/* Star Rating */}
                    <div className="flex text-brand-gold gap-1 mb-4">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-brand-text/80 text-sm font-poppins italic leading-relaxed mb-6">
                      &quot;{test.comment}&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-brand-gold/10">
                    <div className="w-10 h-10 bg-brand-gold/15 rounded-full flex items-center justify-center font-bold text-brand-maroon">
                      {test.name[0]}
                    </div>
                    <div>
                      <h4 className="font-poppins font-semibold text-brand-brown text-sm">{test.name}</h4>
                      <p className="text-xs text-brand-text/50 font-medium">{test.location}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="testimonials-pagination flex justify-center gap-2 mt-4"></div>

        </div>
      </section>

      {/* ----------------- GALLERY SECTION ----------------- */}
      <section id="gallery" className="py-20 bg-brand-ivory">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-maroon tracking-widest uppercase font-poppins">Visual Journey</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-brand-brown mt-2">
              Our Gallery
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Pinterest-style masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryItems.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl border border-brand-gold/20 shadow-md group break-inside-avoid"
              >
                <img src={item.image} alt={item.title} className="w-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-brand-brown/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">{item.category}</span>
                  <h3 className="font-playfair text-white text-lg font-bold mt-1">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ----------------- CTA SECTION ----------------- */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto rounded-[36px] bg-brand-gradient border border-brand-gold/30 shadow-2xl relative overflow-hidden p-8 sm:p-12 md:p-16 text-center">
          
          {/* Subtle gold ornaments */}
          <div className="absolute -top-10 -right-10 w-40 h-40 border border-brand-gold/10 rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 border border-brand-gold/10 rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-brand-gold text-xs font-bold tracking-widest uppercase font-poppins">Join Our Sweet Circle</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Get Festive Offers <br />& New Arrivals
            </h2>
            <p className="text-sm sm:text-base text-brand-cream/80 font-poppins font-light">
              Subscribe to our newsletter to receive exclusive seasonal discount coupons and alerts on special festive sweets boxes.
            </p>

            {/* Subscription Field */}
            {newsletterSubscribed ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-brand-gold font-semibold font-poppins py-4"
              >
                <Check className="w-6 h-6" /> Subscribed successfully! Thank you for joining.
              </motion.div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); if (newsletterEmail) setNewsletterSubscribed(true); }}
                className="flex flex-col sm:flex-row gap-3 pt-4 max-w-lg mx-auto"
              >
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-grow px-5 py-4 bg-brand-cream text-brand-brown rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-gold font-poppins font-medium placeholder-brand-brown/50"
                  required
                />
                <button 
                  type="submit"
                  className="bg-brand-gold hover:bg-brand-cream text-brand-brown font-bold font-poppins px-8 py-4 rounded-2xl transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  Subscribe <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── COLLECTION DETAIL MODAL ─── */}
      <AnimatePresence>
        {selectedCollection && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-brand-gold/15">
              <div className="p-6 border-b border-brand-gold/10 flex items-center justify-between shrink-0 bg-brand-brown text-brand-cream">
                <div>
                  <span className="text-brand-gold text-[10px] uppercase font-bold tracking-widest block">{selectedCollection.tagline}</span>
                  <h2 className="font-playfair text-xl font-bold text-white mt-0.5">{selectedCollection.title}</h2>
                </div>
                <button onClick={() => setSelectedCollection(null)} className="p-2 text-brand-cream/80 hover:text-brand-cream hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-grow space-y-5 bg-brand-bg">
                <p className="text-xs sm:text-sm text-brand-text/80 font-poppins leading-relaxed font-light">
                  {selectedCollection.description}
                </p>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown border-b border-brand-gold/15 pb-2">Included Products ({selectedCollection.products ? selectedCollection.products.length : 0})</h4>
                  <div className="space-y-3">
                    {selectedCollection.products && selectedCollection.products.map(p => (
                      <div key={p._id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-brand-gold/10 shadow-sm hover:border-brand-gold transition-colors">
                        <div className="flex items-center space-x-3">
                          <img src={p.images ? p.images[0] : 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500'} alt={p.name} className="w-14 h-14 object-cover rounded-xl border border-brand-gold/10" />
                          <div>
                            <h4 className="font-poppins font-medium text-brand-brown text-xs sm:text-sm">{p.name}</h4>
                            <p className="text-[10px] text-brand-maroon font-bold">Starting from ₹{p.discountPrice || p.price}</p>
                          </div>
                        </div>
                        <Link 
                          href={`/product/${p.slug || p._id}`}
                          className="bg-brand-maroon text-brand-cream hover:bg-brand-gold hover:text-brand-brown px-4 py-2 rounded-xl text-[10px] font-bold transition-all"
                        >
                          Order Now
                        </Link>
                      </div>
                    ))}
                    {(!selectedCollection.products || selectedCollection.products.length === 0) && (
                      <p className="text-center text-xs text-brand-text/50 font-light py-4">No products in this collection currently.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- SEO CONTENT BLOCK ----------------- */}
      <section className="py-16 bg-brand-cream border-t border-brand-gold/20 text-center px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-playfair text-2xl font-bold text-brand-brown">Traditional Indian Sweets & Premium Quality Farsan</h2>
          <div className="space-y-4 text-sm font-poppins font-light text-brand-text/80 leading-relaxed text-justify sm:text-center">
            <p>
              For over <strong>four decades</strong>, Mahalaxmi Mithaiwala has been the trusted <strong>home</strong> of authentic, <strong>traditional</strong> culinary delights. We take immense pride in <strong>serving Mumbai</strong> with the finest <strong>Indian sweets</strong> and <strong>premium quality</strong> snacks since 1982. Our time-tested recipes use only the purest ingredients, ensuring that every bite of our <strong>sweets farsan</strong> collection brings true heritage and joy to your family&apos;s table.
            </p>
            <p>
              Beyond our daily treats, we specialize in beautifully curated <strong>farsan gift</strong> options and exquisite <strong>gift boxes</strong> perfect for corporate gifting, grand weddings, and festive celebrations like Diwali and Raksha Bandhan. We believe that maintaining our high standards is not just a business practice, but a legacy we uphold for every customer. Experience the unmatched taste of authenticity and bring home the true essence of celebration with Mumbai&apos;s premier sweet artisans.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <Footer />

    </div>
  );
}
