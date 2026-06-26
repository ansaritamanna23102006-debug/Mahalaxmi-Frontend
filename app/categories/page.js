'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/utils/api';
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

// Dynamic categories and counts fetched from the backend API
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.categories.getAll(),
          api.products.getAll({ limit: 200 })
        ]);

        if (catRes && catRes.categories) {
          setCategories(catRes.categories);
        }

        if (prodRes && prodRes.products) {
          const counts = {};
          prodRes.products.forEach(p => {
            if (!counts[p.category]) counts[p.category] = 0;
            counts[p.category] += 1;
          });
          setCategoryCounts(counts);
        }
      } catch (e) {
        console.warn('Failed to load categories or product counts:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryList = categories.map(cat => {
    let link = `/sweets?category=${encodeURIComponent(cat.name)}`;
    if (cat.name.toLowerCase() === 'farsan') {
      link = '/farsan';
    } else if (cat.name.toLowerCase() === 'gift boxes' || cat.name.toLowerCase() === 'gift box') {
      link = '/festive-offers';
    }

    const itemCount = categoryCounts[cat.name];
    const countStr = itemCount !== undefined
      ? `${itemCount} Items`
      : (cat.name.toLowerCase() === 'gift boxes' || cat.name.toLowerCase() === 'gift box')
        ? 'Collections'
        : '0 Items';

    return {
      name: cat.name,
      description: cat.description || 'Explore our dynamic variety of heritage sweets and snacks.',
      image: cat.image || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      link,
      count: countStr
    };
  });

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen flex flex-col justify-between mandala-pattern">
      <div>
        <Navbar />

        {/* Hero Header */}
        <section className="pt-32 pb-12 bg-brand-brown text-brand-cream relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(217,164,65,0.12),transparent)] pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-gold via-brand-orange to-brand-gold-highlight"></div>
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-poppins text-brand-gold uppercase tracking-widest">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-brand-cream/40" />
              <span className="text-brand-cream/80">Categories</span>
            </div>
            <h1 className="font-playfair text-3xl md:text-5xl font-extrabold tracking-wide">Sweets &amp; Savory Categories</h1>
            <p className="text-xs sm:text-sm font-poppins font-light text-brand-cream/70 max-w-xl">
              Explore our curated culinary segments prepared with heritage recipes since 1982.
            </p>
          </div>
        </section>

        {/* Grid Collections */}
        <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-brand-orange/15 shadow-sm p-6 space-y-6 animate-pulse">
                  <div className="h-56 bg-gray-100 rounded-2xl w-full" />
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded-xl w-32" />
                </div>
              ))}
            </div>
          ) : categoryList.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-brand-text/75 font-poppins text-lg">No categories found in the database.</p>
              <p className="text-xs text-brand-text/50 font-poppins">Please add categories in the Admin Panel.</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {categoryList.map((cat, idx) => (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                  }}
                  className="bg-white rounded-[36px] overflow-hidden border border-brand-orange/15 shadow-[0_10px_30px_-5px_rgba(230,179,37,0.04)] hover:shadow-[0_15px_40px_-5px_rgba(230,179,37,0.12)] hover:border-brand-gold transition-all duration-500 group flex flex-col justify-between"
                >
                  <div className="relative h-60 overflow-hidden bg-brand-ivory">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/90 via-brand-brown/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div>
                        {cat.count && (
                          <span className="text-brand-gold text-[10px] uppercase font-bold tracking-widest font-poppins">{cat.count}</span>
                        )}
                        <h3 className="font-playfair text-2xl font-bold text-white mt-1 leading-none">{cat.name}</h3>
                      </div>
                      <Sparkles className="w-5 h-5 text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                    <p className="text-xs sm:text-sm text-brand-text/75 font-poppins font-light leading-relaxed">
                      {cat.description}
                    </p>
                    <Link
                      href={cat.link}
                      className="bg-brand-gold hover:bg-brand-orange text-brand-brown font-bold font-poppins py-3 px-6 rounded-xl text-xs transition-all duration-300 self-start flex items-center gap-2 shine-button shadow-sm"
                    >
                      Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
