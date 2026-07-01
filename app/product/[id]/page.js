'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/utils/api';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  Minus,
  Plus,
  Sparkles
} from 'lucide-react';

const getWeightMultiplier = (weight) => {
  if (weight === '250g') return 0.5;
  if (weight === '1kg') return 2;
  return 1;
};

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id) || 1;

  // Retrieve product from backend dynamically
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedWeight, setSelectedWeight] = useState("500g");
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    await Promise.resolve();
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
  }, []);

  const getDisplayPrice = useCallback(() => {
    if (!product) return 0;
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.weight === selectedWeight);
      if (variant) return variant.price;
      return product.variants[0].price;
    }
    return product.price * getWeightMultiplier(selectedWeight);
  }, [product, selectedWeight]);

  const getDisplayOriginalPrice = useCallback(() => {
    if (!product) return null;
    if (product.variants && product.variants.length > 0) {
      return null;
    }
    return product.originalPrice ? product.originalPrice * getWeightMultiplier(selectedWeight) : null;
  }, [product, selectedWeight]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      await Promise.resolve();
      try {
        setLoading(true);
        const idOrSlug = resolvedParams.id;
        const data = await api.products.getBySlugOrId(idOrSlug);
        if (data) {
          const fetchedImages = data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500'];
          
          const weightOpts = data.variants && data.variants.length > 0 
            ? data.variants.map(v => v.weight) 
            : (data.weightOptions || ['250g', '500g', '1kg']);
            
          let defaultWeight = "500g";
          if (data.variants && data.variants.length > 0) {
            const has500g = data.variants.find(v => v.weight === '500g' || v.weight === '500gm');
            defaultWeight = has500g ? has500g.weight : data.variants[0].weight;
          } else if (data.weightOptions && data.weightOptions.length > 0) {
            defaultWeight = data.weightOptions.includes('500g') ? '500g' : data.weightOptions[0];
          }

          setProduct({
            id: data._id,
            name: data.name,
            price: data.discountPrice && data.discountPrice > 0 ? data.discountPrice : data.price,
            originalPrice: data.discountPrice && data.discountPrice > 0 ? data.price : null,
            rating: data.ratings || 4.8,
            reviews: data.reviewsCount || 42,
            category: data.category,
            images: fetchedImages,
            description: data.description,
            variants: data.variants || [],
            weightOptions: weightOpts,
            stock: data.stock,
            details: `SKU: ${data.sku} | Weight Options: ${weightOpts.join(', ')} | Stock Left: ${data.stock} units`
          });
          setActiveImage(fetchedImages[0]);
          setSelectedWeight(defaultWeight);
          
          // Fetch reviews
          const reviewsData = await api.products.getReviews(data._id);
          if (reviewsData && reviewsData.reviews) {
            setReviews(reviewsData.reviews);
          }
        }
      } catch (e) {
        console.warn('Backend detail retrieval failed:', e.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    Promise.resolve().then(() => loadWishlist());
  }, [resolvedParams.id, loadWishlist]);

  const addToCart = async (buyNow = false) => {
    if (!product) return;

    // Optimistic update: localStorage first for instant feedback
    const item = {
      id: product.id,
      name: product.name,
      price: getDisplayPrice(),
      image: product.images[0],
      category: product.category,
      weight: selectedWeight
    };
    const cart = JSON.parse(localStorage.getItem('mahalaxmi-cart') || '[]');
    const existing = cart.find(i => i.id === item.id && i.weight === selectedWeight);
    const newCart = existing
      ? cart.map(i => (i.id === item.id && i.weight === selectedWeight) ? { ...i, quantity: i.quantity + quantity } : i)
      : [...cart, { ...item, quantity }];
    localStorage.setItem('mahalaxmi-cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));

    if (buyNow) {
      window.location.href = '/checkout';
      return;
    }

    // Background sync to backend
    try {
      await api.cart.add(product.id, quantity, selectedWeight);
    } catch (e) {
      console.warn('Backend cart sync failed, keeping localStorage version:', e.message);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
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



  if (loading) {
    return (
      <div className="bg-brand-bg text-brand-text min-h-screen flex items-center justify-center font-poppins">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-brand-brown/70 font-semibold">Loading Sweet Secrets...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-brand-bg text-brand-text min-h-screen flex items-center justify-center font-poppins">
        <p className="text-brand-maroon font-bold">Product Not Found</p>
      </div>
    );
  }

  const isFav = wishlist.some(i => i.id === product.id);

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen mandala-pattern">
      <Navbar />

      {/* Breadcrumb section */}
      <section className="pt-32 pb-6 max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 text-xs font-poppins text-brand-orange uppercase tracking-widest">
          <Link href="/" className="hover:text-brand-gold-highlight transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-orange/50" />
          <Link href="/sweets" className="hover:text-brand-gold-highlight transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-orange/50" />
          <span className="text-brand-text/50 font-normal">{product.name}</span>
        </div>
      </section>

      {/* Main product core */}
      <section className="pb-20 max-w-7xl mx-auto px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 sm:p-10 rounded-[36px] border border-brand-orange/20 shadow-[0_15px_45px_rgba(230,179,37,0.06)] relative overflow-hidden"
        >
          {/* Subtle top brand glow accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-gold via-brand-orange to-brand-gold-highlight"></div>
          
          {/* Left Column: Image Panel */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Stage Image */}
            <motion.div 
              layoutId={`product-image-${product.id}`}
              className="relative w-full aspect-square rounded-2xl overflow-hidden border border-brand-orange/15 bg-brand-ivory group shadow-inner"
            >
              <Image 
                src={activeImage || 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500'} 
                alt={product.name} 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute top-4 right-4 bg-brand-brown/70 backdrop-blur-md border border-brand-gold/30 rounded-xl p-2 text-brand-gold pointer-events-none">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-300 ${activeImage === img ? 'border-brand-orange shadow-md scale-95' : 'border-brand-orange/10 hover:border-brand-gold/60 hover:scale-95'}`}
                >
                  <Image src={img} alt={`Thumb ${idx}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Info & Actions */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="bg-brand-brown text-brand-gold text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full inline-block border border-brand-gold/25">
                  {product.category}
                </span>
                <span className="text-xs text-brand-orange font-poppins font-medium">Traditional Recipe</span>
              </div>

              {/* Title */}
              <h1 className="font-playfair text-3xl sm:text-4xl font-extrabold text-brand-brown leading-tight tracking-wide">{product.name}</h1>
              
              {/* Rating Panel */}
              <div className="flex items-center gap-2">
                <div className="flex text-brand-gold-highlight">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-brand-text/60 font-semibold font-poppins">{product.rating} / 5.0 ({product.reviews} reviews)</span>
              </div>

              <div className="lotus-separator">
                <span className="text-brand-orange/60 font-serif text-sm">✦</span>
              </div>

              {/* Price Panel */}
              <div className="flex items-center gap-4 bg-brand-bg/40 p-4 rounded-2xl border border-brand-orange/10">
                <div className="flex items-baseline gap-2">
                  <span className="font-poppins font-extrabold text-3xl text-brand-maroon">₹{getDisplayPrice()}</span>
                  {getDisplayOriginalPrice() && (
                    <span className="font-poppins text-base text-brand-text/40 line-through">₹{getDisplayOriginalPrice()}</span>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${product.stock > 0 ? 'text-green-700 bg-green-50 border border-green-200' : 'text-brand-maroon bg-red-50 border border-red-200'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-brand-text/80 font-poppins font-normal leading-relaxed">
                {product.description}
              </p>
              <div className="p-3 bg-brand-ivory rounded-xl border border-brand-orange/10 text-[10px] text-brand-brown/70 font-medium font-poppins leading-loose">
                {product.details}
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-brand-orange/10">
              
              {/* Weight Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown flex items-center gap-1.5">
                  <span>Select Weight Option</span>
                  <span className="text-[10px] text-brand-orange/80 font-normal">(price updates dynamically)</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {(product.weightOptions || ["250g", "500g", "1kg"]).map((wt) => (
                    <button
                      key={wt}
                      onClick={() => setSelectedWeight(wt)}
                      className={`px-5 py-3.5 rounded-xl border text-xs font-bold font-poppins transition-all duration-300 min-h-[48px] ${selectedWeight === wt ? 'bg-brand-gold text-brand-brown border-brand-orange shadow-sm scale-95' : 'border-brand-orange/20 text-brand-brown hover:bg-brand-bg hover:border-brand-orange/50'}`}
                    >
                      {wt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-brand-orange/30 rounded-xl overflow-hidden bg-brand-bg h-12">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                    className="w-12 h-full flex items-center justify-center hover:bg-brand-orange/10 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-brand-brown" />
                  </button>
                  <span className="px-4 font-bold font-poppins text-brand-brown text-sm">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)} 
                    className="w-12 h-full flex items-center justify-center hover:bg-brand-orange/10 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-brand-brown" />
                  </button>
                </div>

                <button 
                  onClick={() => addToCart(false)}
                  className="flex-1 bg-brand-gold hover:bg-brand-orange text-brand-brown font-bold font-poppins h-12 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 min-w-[150px] shine-button hover:-translate-y-0.5"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Order
                </button>

                <button 
                  onClick={() => addToCart(true)}
                  className="bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-brand-cream font-bold font-poppins h-12 px-6 rounded-xl transition-all duration-300 shadow-md hover:-translate-y-0.5"
                >
                  Order Now
                </button>

                <button 
                  onClick={toggleWishlist}
                  className={`p-3.5 rounded-xl border transition-all duration-300 hover:scale-105 min-h-[48px] min-w-[48px] flex items-center justify-center ${isFav ? 'bg-brand-maroon/5 border-brand-maroon text-brand-maroon' : 'border-brand-orange/20 text-brand-brown hover:bg-brand-bg'}`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-brand-maroon text-brand-maroon' : ''}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-brand-orange/10 text-center text-[10px] font-poppins text-brand-text/60">
                <div className="flex flex-col items-center gap-2 p-2 bg-brand-bg/30 rounded-xl border border-brand-orange/5">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-orange">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="font-medium leading-tight">Mumbai Express Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-2 bg-brand-bg/30 rounded-xl border border-brand-orange/5">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-orange">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-medium leading-tight">100% Pure Ingredients</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-2 bg-brand-bg/30 rounded-xl border border-brand-orange/5">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-orange">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <span className="font-medium leading-tight">Hassle-Free Replacement</span>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </section>

      {/* Customer Reviews & Description Tabs */}
      <section className="pb-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white p-8 rounded-[36px] border border-brand-orange/15 shadow-[0_10px_35px_rgba(230,179,37,0.04)] space-y-6">
          <h3 className="font-playfair text-xl font-bold text-brand-brown pb-3 border-b border-brand-orange/15 flex items-center gap-2">
            <span>Customer Reviews</span>
            <span className="text-xs bg-brand-gold/15 text-brand-orange font-poppins px-2.5 py-0.5 rounded-full font-bold">
              {reviews.length} Total
            </span>
          </h3>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-brand-bg/25 rounded-2xl border border-dashed border-brand-orange/20">
                <p className="text-xs sm:text-sm font-poppins font-light text-brand-text/50">No reviews yet for this product.</p>
              </div>
            ) : (
              reviews.map((rev, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-brand-bg/10 border border-brand-orange/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-poppins font-bold text-sm text-brand-brown">{rev.user ? (rev.user.fullName || rev.user.name) : 'Anonymous Customer'}</span>
                    <span className="text-[10px] text-brand-text/40 font-poppins font-semibold">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                  <div className="flex text-brand-gold-highlight">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm font-poppins font-light text-brand-text/80 leading-relaxed">{rev.reviewText}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
