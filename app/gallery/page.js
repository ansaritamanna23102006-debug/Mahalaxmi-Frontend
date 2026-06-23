'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, ZoomIn } from 'lucide-react';

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = ["All", "Shop Interior", "Traditional Preparation", "Gift Boxes", "Festival Displays"];

  // Gallery category labels rotated across products
  const galleryLabels = ["Shop Interior", "Traditional Preparation", "Gift Boxes", "Festival Displays", "Shop Interior", "Traditional Preparation", "Gift Boxes", "Festival Displays"];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const data = await api.products.getAll({ limit: 12 });
        if (data && data.products && data.products.length > 0) {
          const items = data.products
            .filter(p => p.images && p.images.length > 0)
            .map((p, i) => ({
              title: p.name,
              category: galleryLabels[i % galleryLabels.length],
              image: p.images[0]
            }));
          setGalleryItems(items);
        } else {
          setGalleryItems([]);
        }
      } catch (e) {
        console.warn('Failed to load gallery items:', e.message);
        setGalleryItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filtered = activeFilter === "All"
    ? galleryItems
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-32 pb-12 bg-brand-brown text-brand-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-poppins text-brand-gold uppercase tracking-widest">
            <a href="/" className="hover:underline">Home</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-cream/80">Gallery</span>
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-black">Visual Heritage Gallery</h1>
          <p className="text-sm font-poppins font-light text-brand-cream/70 max-w-xl">
            Take a visual tour of our preparation kitchen, boutique sweet counter, and festive packaging displays.
          </p>
        </div>
      </section>

      {/* Tag Filters */}
      <section className="py-8 bg-brand-cream border-b border-brand-gold/15">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-start sm:justify-center overflow-x-auto gap-4 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider font-poppins shrink-0 transition-colors border ${activeFilter === f ? 'bg-brand-maroon text-brand-cream border-brand-maroon shadow-md' : 'bg-white text-brand-brown border-brand-gold/20 hover:bg-brand-bg'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="rounded-3xl bg-brand-cream border border-brand-gold/15 shadow-sm break-inside-avoid animate-pulse h-64" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <p className="font-playfair text-2xl font-bold text-brand-brown">No gallery items yet</p>
            <p className="text-sm text-brand-text/60 font-poppins">Gallery images will appear here once products are loaded from the catalog.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxImage(item)}
                className="relative overflow-hidden rounded-3xl border border-brand-gold/20 shadow-md group break-inside-avoid cursor-pointer bg-brand-cream"
              >
                <img src={item.image} alt={item.title} className="w-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-brand-brown/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                  <div className="text-right">
                    <span className="inline-block p-2 bg-brand-gold/10 border border-brand-gold/30 rounded-xl text-brand-gold">
                      <ZoomIn className="w-5 h-5" />
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-gold text-xs font-bold uppercase tracking-widest font-poppins">{item.category}</span>
                    <h3 className="font-playfair text-white text-lg font-bold mt-1">{item.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Pop-up Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[80vh] relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl"
            >
              <img src={lightboxImage.image} alt={lightboxImage.title} className="w-full h-full object-contain" />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                <span className="text-brand-gold text-xs font-bold uppercase tracking-widest font-poppins">{lightboxImage.category}</span>
                <h3 className="font-playfair text-xl font-bold mt-1">{lightboxImage.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
