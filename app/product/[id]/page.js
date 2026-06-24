'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  Plus
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
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
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

  useEffect(() => {
    const fetchProductDetails = async () => {
      await Promise.resolve();
      try {
        setLoading(true);
        const idOrSlug = resolvedParams.id;
        const data = await api.products.getBySlugOrId(idOrSlug);
        if (data) {
          const fetchedImages = data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500'];
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
            details: `SKU: ${data.sku} | Weight Options: ${data.weightOptions ? data.weightOptions.join(', ') : '500g'} | Stock Left: ${data.stock} units`
          });
          setActiveImage(fetchedImages[0]);
          
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
      price: product.price * getWeightMultiplier(selectedWeight),
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

  // Magnifier Zoom Effect
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
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
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <Navbar />

      {/* Breadcrumb section */}
      <section className="pt-32 pb-6 max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 text-xs font-poppins text-brand-gold uppercase tracking-widest">
          <Link href="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/sweets" className="hover:underline">Sweets</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-brown/60">{product.name}</span>
        </div>
      </section>

      {/* Main product core */}
      <section className="pb-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 sm:p-10 rounded-[36px] border border-brand-gold/15 shadow-sm">
          
          {/* Left Column: Image Panel */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Stage Image with Zoom overlay */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full aspect-square rounded-2xl overflow-hidden border border-brand-gold/15 bg-brand-bg cursor-zoom-in"
            >
              <Image src={activeImage || 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500'} alt={product.name} fill className="object-cover" unoptimized />
              <div 
                style={zoomStyle} 
                className="absolute inset-0 pointer-events-none border-2 border-brand-gold bg-no-repeat z-10"
              ></div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-brand-gold shadow-md' : 'border-transparent hover:border-brand-gold/30'}`}
                >
                  <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Info & Actions */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category */}
              <span className="bg-brand-brown text-brand-gold text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full inline-block">
                {product.category}
              </span>

              {/* Title */}
              <h1 className="font-playfair text-3xl sm:text-4xl font-black text-brand-brown">{product.name}</h1>
              
              {/* Rating Panel */}
              <div className="flex items-center gap-2">
                <div className="flex text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-brand-text/60 font-semibold font-poppins">{product.rating} / 5.0 ({product.reviews} customer reviews)</span>
              </div>

              {/* Price Panel */}
              <div className="flex items-baseline gap-3">
                <span className="font-poppins font-black text-3xl text-brand-maroon">₹{product.price * getWeightMultiplier(selectedWeight)}</span>
                {product.originalPrice && (
                  <span className="font-poppins text-lg text-brand-text/40 line-through">₹{product.originalPrice * getWeightMultiplier(selectedWeight)}</span>
                )}
                <span className="text-xs text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-md">In Stock & Ready</span>
              </div>

              <div className="w-full h-[1px] bg-brand-gold/10"></div>

              {/* Description */}
              <p className="text-sm text-brand-text/80 font-poppins font-light leading-relaxed">
                {product.description}
              </p>
              <p className="text-xs text-brand-brown font-medium font-poppins">
                {product.details}
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t border-brand-gold/10">
              
              {/* Weight Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Select Weight</label>
                <div className="flex gap-3">
                  {["250g", "500g", "1kg"].map((wt) => (
                    <button
                      key={wt}
                      onClick={() => setSelectedWeight(wt)}
                      className={`px-5 py-2.5 rounded-xl border text-xs font-bold font-poppins transition-colors ${selectedWeight === wt ? 'bg-brand-gold text-brand-brown border-brand-gold' : 'border-brand-gold/20 text-brand-brown hover:bg-brand-bg'}`}
                    >
                      {wt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-brand-gold/30 rounded-xl overflow-hidden bg-brand-bg h-12">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 hover:bg-brand-gold/15 h-full transition-colors">
                    <Minus className="w-4 h-4 text-brand-brown" />
                  </button>
                  <span className="px-4 font-semibold font-poppins text-brand-brown text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="px-3 hover:bg-brand-gold/15 h-full transition-colors">
                    <Plus className="w-4 h-4 text-brand-brown" />
                  </button>
                </div>

                <button 
                  onClick={() => addToCart(false)}
                  className="flex-1 bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown font-bold font-poppins h-12 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 min-w-[150px]"
                >
                  <ShoppingBag className="w-4.5 h-4.5" /> Add to Order
                </button>

                <button 
                  onClick={() => addToCart(true)}
                  className="bg-brand-brown hover:bg-brand-gold text-brand-cream hover:text-brand-brown font-bold font-poppins h-12 px-6 rounded-xl transition-all duration-300 shadow-md"
                >
                  Order Now
                </button>

                <button 
                  onClick={toggleWishlist}
                  className={`p-3.5 rounded-xl border transition-colors ${isFav ? 'bg-brand-maroon/5 border-brand-maroon text-brand-maroon' : 'border-brand-gold/20 text-brand-brown hover:bg-brand-bg'}`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-brand-maroon' : 'none'}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-gold/10 text-center text-[10px] font-poppins text-brand-text/60">
                <div className="flex flex-col items-center gap-1.5">
                  <Truck className="w-5 h-5 text-brand-gold" />
                  <span>Mumbai express delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-brand-gold" />
                  <span>100% pure ingredients</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <RotateCcw className="w-5 h-5 text-brand-gold" />
                  <span>Hassle-free replacement</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Customer Reviews & Description Tabs */}
      <section className="pb-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white p-8 rounded-[36px] border border-brand-gold/15 shadow-sm space-y-6">
          <h3 className="font-playfair text-xl font-bold text-brand-brown pb-3 border-b border-brand-gold/15">Customer Reviews</h3>
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-xs sm:text-sm font-poppins font-light text-brand-text/50">No reviews yet for this product.</p>
            ) : (
              reviews.map((rev, idx) => (
                <div key={idx} className="space-y-2 pb-6 border-b border-brand-gold/10 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-poppins font-semibold text-sm text-brand-brown">{rev.user ? (rev.user.fullName || rev.user.name) : 'Anonymous Customer'}</span>
                    <span className="text-[10px] text-brand-text/40">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                  <div className="flex text-brand-gold">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm font-poppins font-light text-brand-text/80">{rev.reviewText}</p>
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
