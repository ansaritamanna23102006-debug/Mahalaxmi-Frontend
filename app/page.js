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

// Static fallback datasets for stale-while-revalidate performance optimization
const fallbackProducts = [
  {
    id: "prod-1",
    slug: "kaju-katli",
    name: "Premium Kaju Katli",
    price: 450,
    rating: 4.9,
    reviews: 120,
    category: "Traditional Sweets",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500",
    description: "Rich cashew fudge sweet seasoned with real silver leaf.",
    weight: "500g"
  },
  {
    id: "prod-2",
    slug: "besan-ladoo",
    name: "Shahi Besan Ladoo",
    price: 320,
    rating: 4.8,
    reviews: 95,
    category: "Traditional Sweets",
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500",
    description: "Fragrant roasted chickpea flour spheres cooked in pure ghee.",
    weight: "500g"
  },
  {
    id: "prod-3",
    slug: "motichoor-ladoo",
    name: "Special Motichoor Ladoo",
    price: 280,
    rating: 4.9,
    reviews: 150,
    category: "Traditional Sweets",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500",
    description: "Tiny gram flour pearls fried, soaked in saffron syrup, and pressed into ladoos.",
    weight: "500g"
  },
  {
    id: "prod-4",
    slug: "dry-fruit-bites",
    name: "Anjeer Dry Fruit Roll",
    price: 600,
    rating: 4.7,
    reviews: 80,
    category: "Dry Fruit Bites",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500",
    description: "Sugar-free sweet rolls packed with premium figs, almonds, and pistachios.",
    weight: "500g"
  },
  {
    id: "prod-5",
    slug: "pista-roll",
    name: "Kaju Pista Roll",
    price: 550,
    rating: 4.8,
    reviews: 65,
    category: "Dry Fruit Bites",
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500",
    description: "Elegant layered sweet with a rich pistachio center wrapped in cashew fudge.",
    weight: "500g"
  },
  {
    id: "prod-6",
    slug: "kesar-peda",
    name: "Premium Kesar Peda",
    price: 350,
    rating: 4.8,
    reviews: 110,
    category: "Traditional Sweets",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500",
    description: "Soft milk solids cooked with fragrant saffron, cardamom, and almond garnish.",
    weight: "500g"
  },
  {
    id: "prod-7",
    slug: "spicy-mix-chavana",
    name: "Royal Farsan Mix",
    price: 180,
    rating: 4.9,
    reviews: 210,
    category: "Farsan & Namkeen",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500",
    description: "A crunchy savory blend of sev, gathiya, lentils, and nuts seasoned with spices.",
    weight: "500g"
  },
  {
    id: "prod-8",
    slug: "spicy-sev",
    name: "Spicy Ratlami Sev",
    price: 160,
    rating: 4.8,
    reviews: 140,
    category: "Farsan & Namkeen",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500",
    description: "Spicy and crisp gram flour sticks seasoned with ratlami cloves and pepper.",
    weight: "500g"
  }
];

const fallbackCategories = [
  { name: "Traditional Sweets", count: "45 Items", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400", link: "/sweets?category=Traditional" },
  { name: "Dry Fruit Bites", count: "30 Items", image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400", link: "/sweets?category=DryFruit" },
  { name: "Premium Gifting", count: "15 Items", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400", link: "/categories" },
  { name: "Daily Savories", count: "25 Items", image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400", link: "/farsan" }
];

const fallbackTestimonials = [
  { name: "Amit Sharma", location: "Kurla, Mumbai", rating: 5, comment: "Mahalaxmi's Kaju Katli has been a staple in our family celebrations for decades. The quality remains unmatched." },
  { name: "Priya Patel", location: "Bandra, Mumbai", rating: 5, comment: "Absolutely love their dry fruit bites. Best part is they are not overly sweet and packed with nuts. Perfect for gifting!" },
  { name: "Rajesh Mehta", location: "Ghatkopar, Mumbai", rating: 5, comment: "Their Farsan and Ratlami Sev are super crispy and delicious. Service is quick and friendly." }
];

const fallbackGallery = [
  { title: "Boutique Sweet Counter", category: "Store", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500" },
  { title: "Sweet Preparation Ghee", category: "Kitchen", image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500" },
  { title: "Gold Festive Sweet Boxes", category: "Packaging", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500" },
  { title: "Fresh Handcrafted Ladoos", category: "Kitchen", image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500" },
  { title: "Premium Gifting Collection", category: "Store", image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500" },
  { title: "Savory Snack Assortment", category: "Kitchen", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500" }
];

export default function Home() {
  const [products, setProducts] = useState(fallbackProducts);
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState(fallbackCategories);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [festivals, setFestivals] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [galleryItems, setGalleryItems] = useState(fallbackGallery);
  const [loading, setLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const fetchProducts = async () => {
    try {
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
      }
    } catch (e) {
      console.warn('Backend API failed to load bestsellers:', e.message);
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
      const data = await api.gallery.getAll();
      if (data && data.images && data.images.length > 0) {
        setGalleryItems(data.images.slice(0, 6).map(img => ({
          title: img.title || 'Untitled',
          category: img.category || 'General',
          image: img.imageUrl
        })));
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
            "image": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/hero_sweets.jpg`,
            "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.svg`,
            "@id": process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            "url": process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            "telephone": "+91 22 1234 5678",
            "email": "info@mahalaxmimithaiwala.com",
            "hasMap": "https://maps.google.com/?q=Kurla+West+Mumbai+Opp+L+Ward+Office",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Suraj Prashad Chawl No. 204 A, Opp. L Ward Office, CST Road, Kurla (W)",
              "addressLocality": "Mumbai",
              "addressRegion": "Maharashtra",
              "postalCode": "400070",
              "addressCountry": "IN"
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "09:00",
                "closes": "22:00"
              }
            ]
          })
        }}
      />
      <Navbar transparent={true} />
      <main id="main-content" className="flex flex-col min-h-screen flex-grow">
      
      {/* ----------------- HERO SECTION ----------------- */}
      <section id="home" className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden bg-brand-brown mandala-pattern">
        
        {/* Dark overlay with brand color gradients */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-brown via-brand-brown/95 to-brand-maroon/20 pointer-events-none"></div>
        
        {/* Gold blur highlights */}
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[130px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-[-10%] w-[450px] h-[450px] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Decorative corner mandalas */}
        <div className="absolute top-0 right-0 w-64 h-64 border border-brand-gold/10 rounded-full opacity-35 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 border border-brand-gold/5 rounded-full opacity-20 translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        {/* Soft floating sparkles */}
        <motion.div 
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/12 text-brand-gold/50 pointer-events-none hidden md:block"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 18, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/12 text-brand-gold/40 pointer-events-none hidden md:block"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-7 text-left"
          >
            {/* Tagline / Established Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-maroon/20 border border-brand-gold/30 shadow-md">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest font-poppins">Since 1982 • Authentic Indian Sweets</span>
            </div>
 
            {/* Headline */}
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-wide">
              Sweets & Farsan <br />
              Crafted with{" "}
              <span className="text-brand-gold relative inline-block">
                Tradition
                <span className="absolute bottom-2 left-0 w-full h-[4px] bg-brand-maroon rounded-full"></span>
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-brand-cream/80 max-w-xl font-poppins font-light leading-relaxed">
              Serving Mumbai with premium handcrafted sweets, spiced farsan, luxury wedding sweet boxes, and custom festive collections for over four decades.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap gap-4 pt-3">
              <a 
                href="#shop"
                className="bg-brand-gold text-brand-brown hover:bg-brand-orange font-bold font-poppins px-9 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group shine-button text-sm uppercase tracking-wider"
              >
                Shop Now 
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#categories"
                className="bg-transparent text-brand-gold border-2 border-brand-gold/60 hover:bg-brand-gold hover:text-brand-brown font-bold font-poppins px-9 py-4 rounded-2xl transition-all duration-300 text-sm uppercase tracking-wider"
              >
                Explore Collection
              </a>
            </div>

            {/* Legacy Floating Badges (Desktop) */}
            <div className="hidden sm:flex items-center gap-8 pt-8 border-t border-brand-gold/15">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-brand-cream/5 rounded-2xl border border-brand-gold/20 shadow-sm text-brand-gold">
                  <Award className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-[10px] text-brand-cream/40 font-bold uppercase tracking-wider">Legacy</h4>
                  <p className="font-semibold text-brand-cream text-sm font-poppins">Since 1982</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-brand-cream/5 rounded-2xl border border-brand-gold/20 shadow-sm text-brand-gold">
                  <ShieldCheck className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-[10px] text-brand-cream/40 font-bold uppercase tracking-wider">Quality</h4>
                  <p className="font-semibold text-brand-cream text-sm font-poppins">Premium Quality</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-brand-cream/5 rounded-2xl border border-brand-gold/20 shadow-sm text-brand-gold">
                  <Clock className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-[10px] text-brand-cream/40 font-bold uppercase tracking-wider">Freshness</h4>
                  <p className="font-semibold text-brand-cream text-sm font-poppins">Fresh Daily</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t lg:border-t-0 border-brand-gold/15 max-w-lg">
              <div className="text-left">
                <h3 className="font-playfair text-2xl sm:text-3xl font-black text-brand-gold">500+</h3>
                <p className="text-[11px] text-brand-cream/60 font-poppins uppercase tracking-wider font-semibold">Delicacies</p>
              </div>
              <div className="text-left">
                <h3 className="font-playfair text-2xl sm:text-3xl font-black text-brand-gold">50+</h3>
                <p className="text-[11px] text-brand-cream/60 font-poppins uppercase tracking-wider font-semibold">Farsans</p>
              </div>
              <div className="text-left">
                <h3 className="font-playfair text-2xl sm:text-3xl font-black text-brand-gold">1M+</h3>
                <p className="text-[11px] text-brand-cream/60 font-poppins uppercase tracking-wider font-semibold">Customers</p>
              </div>
            </div>
          </motion.div>

          {/* Right Image Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-5 relative flex justify-center items-center"
          >
            {/* Circular glow background ornament */}
            <div className="absolute w-[280px] sm:w-[480px] h-[280px] sm:h-[480px] rounded-full border border-brand-gold/20 bg-radial-gradient from-brand-gold/10 to-transparent pointer-events-none animate-[spin_80s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-brand-gold rounded-full shadow-lg"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 bg-brand-maroon rounded-full shadow-lg"></div>
            </div>

            {/* Hero Main Sweet Image - Gently floats */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[260px] sm:w-[430px] h-[260px] sm:h-[430px] rounded-full overflow-hidden border-8 border-brand-brown shadow-2xl glow-gold group"
            >
              <Image 
                src="/hero_sweets.jpg" 
                alt="Premium Mithai Platter" 
                fill
                priority
                sizes="(max-width: 640px) 260px, 430px"
                className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700" 
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ----------------- CATEGORIES SECTION ----------------- */}
      <section id="categories" className="py-24 bg-brand-cream border-t border-brand-gold/15 relative overflow-hidden">
        
        {/* Subtle mandala watermark background */}
        <div className="absolute top-10 left-10 w-44 h-44 rounded-full border border-brand-gold/5 opacity-40 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-maroon tracking-widest uppercase font-poppins">Handpicked Collections</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-brand-brown mt-2">
              Every Craving, Every Celebration
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto mt-4 rounded-full shadow-[0_0_8px_#C62828]"></div>
          </div>

          {/* Categories Slider */}
          <div className="relative px-2">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={24}
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
                  <SwiperSlide key={cat.name} className="h-auto flex flex-col">
                    <Link href={link} className="flex flex-col flex-grow h-full w-full group">
                      <div 
                        className="cursor-pointer flex flex-col items-center bg-white p-5 rounded-[32px] border border-brand-gold/15 shadow-md hover:shadow-xl hover:border-brand-gold hover:-translate-y-2 transition-all duration-300 text-center w-full flex-grow justify-between relative overflow-hidden"
                      >
                        {/* Shimmer overlay effect */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-brand-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        
                        <div className="flex flex-col items-center relative z-10">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-brand-bg shadow-inner mb-4 group-hover:scale-105 transition-transform duration-500 relative">
                            <Image 
                              src={cat.image} 
                              alt={cat.name} 
                              fill 
                              sizes="(max-width: 640px) 96px, 112px"
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <h3 className="font-playfair text-md font-bold text-brand-brown group-hover:text-brand-maroon transition-colors duration-300 line-clamp-2 px-1">{cat.name}</h3>
                        </div>
                        <span className="text-xs text-brand-maroon font-bold mt-4 block shrink-0 bg-brand-maroon/5 px-3 py-1 rounded-full relative z-10">{cat.count}</span>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
            
            {/* Custom Pagination & Navigation Controls */}
            <div className="flex justify-between items-center mt-6">
              <div className="categories-pagination flex justify-center gap-2 w-auto"></div>
              <div className="flex space-x-2">
                <button className="categories-prev w-12 h-12 flex items-center justify-center bg-white border border-brand-gold/30 text-brand-brown rounded-full hover:bg-brand-gold hover:border-brand-gold transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm" aria-label="Previous Category">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <button className="categories-next w-12 h-12 flex items-center justify-center bg-white border border-brand-gold/30 text-brand-brown rounded-full hover:bg-brand-gold hover:border-brand-gold transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm" aria-label="Next Category">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ----------------- BEST SELLERS SECTION ----------------- */}
      <section id="shop" className="py-24 bg-brand-bg relative overflow-hidden">
        
        {/* Decorative layout background details */}
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full border border-brand-gold/5 opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-1/3 left-0 w-72 h-72 rounded-full border border-brand-gold/5 opacity-30 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-maroon tracking-widest uppercase font-poppins">Customer Favorites</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-brand-brown mt-2">
              Our Bestseller Delicacies
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto mt-4 rounded-full shadow-[0_0_8px_#C62828]"></div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {products.map((product, idx) => {
              const inWishlist = wishlist.some(item => item.id === product.id);
              
              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-[32px] overflow-hidden border border-brand-gold/15 shadow-md hover:shadow-2xl hover:border-brand-gold hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(255,213,74,0.15)] transition-all duration-500 group flex flex-col h-full relative"
                >
                  {/* Product Image Panel */}
                  <div className="relative h-36 sm:h-56 overflow-hidden bg-brand-ivory border-b border-brand-gold/10">
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700" 
                    />
                    
                    {/* Floating Wishlist Button */}
                    <button 
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white text-brand-maroon w-12 h-12 flex items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 z-20 border border-brand-gold/10"
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-brand-maroon' : 'none'}`} />
                    </button>

                    {/* Category Overlay */}
                    <span className="hidden sm:inline-block absolute bottom-4 left-4 bg-brand-brown/95 text-brand-gold text-[9px] uppercase font-bold tracking-widest px-3.5 py-1.5 rounded-xl border border-brand-gold/20 shadow-md">
                      {product.category}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 sm:p-6 flex flex-col flex-grow justify-between relative z-10 bg-white">
                    <div>
                      {/* Rating Panel */}
                      <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2.5">
                        <div className="flex items-center text-brand-gold" role="img" aria-label={`Rating: ${product.rating || 4.8} out of 5 stars`}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-xs text-brand-text/50 font-poppins">({product.reviews})</span>
                      </div>

                      <h3 className="font-playfair text-sm sm:text-lg font-bold text-brand-brown mb-1.5 sm:mb-2 group-hover:text-brand-maroon transition-colors duration-300 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                      <p className="hidden sm:block text-xs text-brand-text/60 line-clamp-2 mb-4 font-poppins font-light leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div>
                      {/* Price & Action Row */}
                      <div className="pt-3 sm:pt-4 border-t border-brand-gold/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
                          <div>
                            <p className="text-[8px] sm:text-[9px] text-brand-text/70 uppercase tracking-widest font-bold">Starting from</p>
                            <span className="font-poppins font-black text-base sm:text-xl text-brand-maroon">₹{product.price}</span>
                          </div>
                          <span className="text-[10px] text-brand-text/70 font-poppins">per {product.weight}</span>
                        </div>
                        <Link
                          href={`/product/${product.slug}`}
                          className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown font-bold font-poppins text-xs py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-md active:scale-95 shine-button uppercase tracking-wider min-h-[48px]"
                        >
                          Order Now <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ----------------- WHY FAMILIES TRUST MAHALAXMI ----------------- */}
      <section id="about-us" className="py-24 bg-brand-brown text-brand-cream relative overflow-hidden mandala-pattern">
        
        {/* Glow patterns inside Dark Section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-brand-gold/10 to-brand-maroon/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold text-brand-gold tracking-widest uppercase font-poppins">Our Standards</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-2">
              Why Families Trust Mahalaxmi
            </h2>
            <div className="w-16 h-1 bg-brand-gold mx-auto mt-4 rounded-full shadow-[0_0_8px_#FFD54A]"></div>
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
                className="glass-card p-8 rounded-[32px] border border-brand-gold/15 hover:border-brand-gold/45 hover:bg-white/5 transition-all duration-300 group shadow-lg hover:shadow-[0_12px_24px_rgba(255,213,74,0.1)] hover:-translate-y-1.5"
              >
                <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30 text-brand-gold mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-brand-cream/70 font-poppins leading-relaxed font-light">{feature.description}</p>
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
                <button className="swiper-button-prev-custom p-2.5 bg-white border border-brand-gold/30 text-brand-brown rounded-full hover:bg-brand-gold hover:border-brand-gold transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <button className="swiper-button-next-custom p-2.5 bg-white border border-brand-gold/30 text-brand-brown rounded-full hover:bg-brand-gold hover:border-brand-gold transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ----------------- OUR STORY SECTION ----------------- */}
      <section className="py-24 bg-brand-ivory relative overflow-hidden">
        
        {/* Ornamental lotus details */}
        <div className="absolute top-1/2 left-0 w-64 h-64 border border-brand-gold/5 rounded-full opacity-30 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Image Column */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 relative flex justify-center"
            >
              {/* Photo Frame with Badge inside */}
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-[36px] overflow-hidden border-8 border-white shadow-2xl group">
                {/* Legacy Floating Badge */}
                <div className="absolute top-4 left-4 z-20 bg-brand-gold text-brand-brown font-playfair font-black text-xs sm:text-lg px-5 py-2 rounded-2xl shadow-xl border border-white/30">
                  Since 1982
                </div>
                <div className="relative w-full h-full">
                  <Image 
                    src="/traditional_maker.png" 
                    alt="Traditional Indian Sweet Maker" 
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-103 transition-transform duration-700" 
                  />
                </div>
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
              <div className="w-16 h-1 bg-brand-maroon rounded-full shadow-[0_0_8px_#C62828]"></div>
              
              <div className="space-y-4 text-brand-text/80 font-poppins font-light text-sm sm:text-base leading-relaxed">
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
                  <h3 className="font-playfair text-2xl sm:text-3xl font-black text-brand-maroon">1982</h3>
                  <p className="text-xs text-brand-text/60 font-poppins font-medium mt-1 uppercase tracking-wider">Established</p>
                </div>
                <div>
                  <h3 className="font-playfair text-2xl sm:text-3xl font-black text-brand-maroon">40+</h3>
                  <p className="text-xs text-brand-text/60 font-poppins font-medium mt-1 uppercase tracking-wider">Years Experience</p>
                </div>
                <div>
                  <h3 className="font-playfair text-2xl sm:text-3xl font-black text-brand-maroon">1000+</h3>
                  <p className="text-xs text-brand-text/60 font-poppins font-medium mt-1 uppercase tracking-wider">Daily Customers</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ----------------- TESTIMONIALS SECTION ----------------- */}
      <section id="testimonials" className="py-24 bg-brand-cream border-t border-b border-brand-gold/15 relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-maroon tracking-widest uppercase font-poppins">Customer Love</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-brand-brown mt-2">
              Words From Our Customers
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto mt-4 rounded-full shadow-[0_0_8px_#C62828]"></div>
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
                <div className="bg-white p-8 rounded-[32px] border border-brand-gold/15 shadow-md flex flex-col justify-between h-full hover:shadow-xl hover:border-brand-gold transition-all duration-300">
                  <div>
                    {/* Star Rating */}
                    <div className="flex text-brand-gold gap-1 mb-5" role="img" aria-label={`Rating: ${test.rating} out of 5 stars`}>
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-brand-text/80 text-sm font-poppins italic leading-relaxed mb-6 font-light">
                      &quot;{test.comment}&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5 pt-5 border-t border-brand-gold/10">
                    <div className="w-11 h-11 bg-brand-gold/15 rounded-full flex items-center justify-center font-bold text-brand-maroon shadow-inner">
                      {test.name[0]}
                    </div>
                    <div>
                      <h4 className="font-poppins font-semibold text-brand-brown text-sm">{test.name}</h4>
                      <p className="text-[11px] text-brand-text/75 font-medium">{test.location}</p>
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
      <section id="gallery" className="py-24 bg-brand-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-maroon tracking-widest uppercase font-poppins">Visual Journey</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-brand-brown mt-2">
              Our Gallery
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto mt-4 rounded-full shadow-[0_0_8px_#C62828]"></div>
          </div>

          {/* Pinterest-style masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryItems.map((item, idx) => (
              <div 
                key={idx}
                className="relative overflow-hidden rounded-[32px] border border-brand-gold/20 shadow-md group break-inside-avoid"
              >
                <img src={item.image} alt={item.title} className="w-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-brand-brown/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 select-none pointer-events-none">
                  <span className="text-brand-gold text-xs font-bold uppercase tracking-widest font-poppins">{item.category}</span>
                  <h3 className="font-playfair text-white text-lg font-bold mt-1.5">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ----------------- CTA SECTION ----------------- */}
      <section className="py-20 px-4 relative overflow-hidden bg-brand-cream border-t border-brand-gold/15">
        <div className="max-w-5xl mx-auto rounded-[40px] bg-brand-gradient border border-brand-gold/20 shadow-2xl relative overflow-hidden p-8 sm:p-12 md:p-16 text-center">
          
          {/* Subtle gold ornaments */}
          <div className="absolute -top-12 -right-12 w-48 h-48 border border-brand-gold/10 rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 border border-brand-gold/10 rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-brand-gold text-xs font-bold tracking-widest uppercase font-poppins">Join Our Sweet Circle</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Get Festive Offers <br />& New Arrivals
            </h2>
            <p className="text-sm sm:text-base text-brand-cream font-poppins font-light leading-relaxed">
              Subscribe to our newsletter to receive exclusive seasonal discount coupons and alerts on special festive sweets boxes.
            </p>

            {/* Subscription Field */}
            {newsletterSubscribed ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-brand-gold font-bold font-poppins py-4 text-sm"
              >
                <Check className="w-5 h-5 shrink-0" /> Subscribed successfully! Thank you for joining.
              </motion.div>
            ) : (
              <form 
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 pt-4 max-w-lg mx-auto"
              >
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-grow px-5 py-4 bg-white/10 hover:bg-white/15 focus:bg-white border-2 border-brand-gold/30 focus:border-brand-gold focus:text-brand-brown focus:ring-1 focus:ring-brand-gold text-white rounded-2xl focus:outline-none font-poppins font-medium placeholder-brand-cream/40 transition-all text-sm"
                  aria-label="Email address for newsletter"
                  required
                />
                <button 
                  type="submit"
                  className="bg-brand-gold hover:bg-white text-brand-brown font-bold font-poppins px-8 py-4 rounded-2xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-sm uppercase tracking-wider shine-button shrink-0"
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-brand-brown/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-brand-bg rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-brand-gold/25">
              <div className="p-6 border-b border-brand-gold/20 flex items-center justify-between shrink-0 bg-brand-brown text-brand-cream relative">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-45"></div>
                <div>
                  <span className="text-brand-gold text-[10px] uppercase font-bold tracking-widest block font-poppins">{selectedCollection.tagline}</span>
                  <h2 className="font-playfair text-xl font-bold text-white mt-0.5">{selectedCollection.title}</h2>
                </div>
                <button onClick={() => setSelectedCollection(null)} className="p-2 text-brand-cream/80 hover:text-brand-gold hover:bg-white/5 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-grow space-y-6 bg-brand-bg custom-scrollbar">
                <p className="text-xs sm:text-sm text-brand-text/80 font-poppins leading-relaxed font-light">
                  {selectedCollection.description}
                </p>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown border-b border-brand-gold/15 pb-2 font-poppins">Included Delicacies ({selectedCollection.products ? selectedCollection.products.length : 0})</h4>
                  <div className="space-y-3">
                    {selectedCollection.products && selectedCollection.products.map(p => (
                      <div key={p._id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-brand-gold/10 shadow-sm hover:border-brand-gold hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3.5">
                          <img src={p.images ? p.images[0] : 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500'} alt={p.name} className="w-14 h-14 object-cover rounded-xl border border-brand-gold/10 bg-brand-bg" />
                          <div>
                            <h4 className="font-poppins font-semibold text-brand-brown text-xs sm:text-sm leading-tight">{p.name}</h4>
                            <p className="text-[10px] text-brand-maroon font-bold mt-1">Starting from ₹{p.discountPrice || p.price}</p>
                          </div>
                        </div>
                        <Link 
                          href={`/product/${p.slug || p._id}`}
                          onClick={() => setSelectedCollection(null)}
                          className="bg-brand-maroon text-brand-cream hover:bg-brand-gold hover:text-brand-brown px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider shadow-sm"
                        >
                          Order
                        </Link>
                      </div>
                    ))}
                    {(!selectedCollection.products || selectedCollection.products.length === 0) && (
                      <p className="text-center text-xs text-brand-text/50 font-light py-6">No products in this collection currently.</p>
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

      </main>

      {/* ----------------- FOOTER ----------------- */}
      <Footer />

    </div>
  );
}
