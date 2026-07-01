'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Award, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Calendar,
  Users,
  Compass,
  Smile,
  Heart,
  ChevronRight
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    { title: "Premium Ingredients", desc: "We source only pure A-grade ghee, select nuts, and organic saffron for our recipes.", icon: Award },
    { title: "Traditional Recipes", desc: "Our sweets are prepared based on heritage culinary formulas preserved since 1982.", icon: Compass },
    { title: "Fresh Daily", desc: "Small batch manufacturing daily guarantees maximum taste and long shelf life.", icon: Clock },
    { title: "Hygienic Preparation", desc: "Top-tier cleanliness processes in double-sanitized modern kitchens.", icon: ShieldCheck },
    { title: "Customer Satisfaction", desc: "Providing premium service and customizations for over 40 years across Mumbai.", icon: Smile },
    { title: "Authentic Taste", desc: "True, rich Indian flavors that honor authentic sweet-making roots.", icon: Heart }
  ];

  const timeline = [
    { year: "1982", title: "Founded", desc: "Opened the first traditional boutique counter in Kurla, Mumbai." },
    { year: "1990", title: "Expansion", desc: "Expanded the kitchen size to meet local corporate event demands." },
    { year: "2005", title: "Modernization", desc: "Introduced advanced packaging lines to maintain moisture and quality." },
    { year: "2015", title: "Premium Gifts", desc: "Launched customized velvet boxes for grand Indian weddings." },
    { year: "2020", title: "Online Orders", desc: "Built our first digital catalog and local delivery network in Mumbai." },
    { year: "2025", title: "Digital Scale", desc: "Upgraded to 1-hour express delivery for hot, fresh farsans." }
  ];

  const teamMembers = [
    { name: "Suraj Prashad", role: "Founder & Master Chef", bio: "Began the journey in 1982 with classic family recipes.", initials: "SP" },
    { name: "Rahul Prashad", role: "Managing Director", bio: "Pioneered product development and corporate gift boxes.", initials: "RP" },
    { name: "Aman Prashad", role: "Head of Operations", bio: "Maintains high quality control and manages shipping logs.", initials: "AP" }
  ];

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen mandala-pattern">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-brand-brown text-brand-cream overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(217,164,65,0.15),transparent)]"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-gold via-brand-orange to-brand-gold-highlight"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center space-y-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-xs font-poppins text-brand-gold uppercase tracking-widest">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-cream/30" />
            <span className="text-brand-cream/80">About Us</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl font-extrabold tracking-wide text-white">Our Sweet Journey</h1>
          <p className="text-brand-gold text-xs uppercase tracking-widest font-bold font-poppins">Est. 1982 in Mumbai</p>
          <p className="text-brand-cream/70 max-w-xl mx-auto font-poppins font-light text-sm sm:text-base leading-relaxed">
            Delivering legacy sweetness, premium quality treats, and traditional Indian savories to Mumbai families for over four decades.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-3xl overflow-hidden border-8 border-white shadow-[0_20px_50px_rgba(11,11,11,0.1)]">
              <img src="/traditional_maker.png" alt="Heritage Sweet Crafting" className="w-full object-cover" />
              <div className="absolute inset-0 border border-brand-orange/20 rounded-[20px] pointer-events-none"></div>
            </div>
          </motion.div>

          {/* Right Column: Story & Address */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="text-xs font-bold text-brand-orange tracking-widest uppercase font-poppins">Our Story</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-extrabold text-brand-brown leading-tight">
              A Legacy Built on Taste & Tradition
            </h2>
            <div className="w-16 h-1 bg-brand-orange rounded-full"></div>
            
            <p className="font-poppins font-normal text-brand-text/80 text-xs sm:text-sm leading-relaxed">
              Mahalaxmi Mithaiwala is a family legacy founded in 1982 on CST Road in Kurla, Mumbai. From humble beginnings, we focused on producing traditional treats using pure ghee, fresh khoya, and raw spices. Over 40 years, our dedication to traditional culinary taste has created a legacy that Mumbaikars love and trust.
            </p>
            
            <div className="p-5 rounded-2xl bg-brand-cream border border-brand-orange/20 flex items-start gap-4 shadow-sm">
              <MapPin className="w-6 h-6 text-brand-orange shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-poppins text-brand-brown">
                <h4 className="font-bold mb-1">Our Heritage Location:</h4>
                <p>Suraj Prashad Chawl No. 204 A, Opp. L Ward Office,</p>
                <p className="text-brand-text/70">CST Road, Kurla (W), Mumbai, Maharashtra – 400070</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-orange/10">
              <div className="p-4 bg-white rounded-2xl border border-brand-orange/15 text-center shadow-[0_5px_15px_rgba(230,179,37,0.03)] hover:border-brand-orange transition-colors">
                <h3 className="font-playfair text-xl sm:text-2xl font-extrabold text-brand-maroon">40+</h3>
                <p className="text-[9px] text-brand-text/60 font-poppins uppercase tracking-wider font-bold mt-1">Years Legacy</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-brand-orange/15 text-center shadow-[0_5px_15px_rgba(230,179,37,0.03)] hover:border-brand-orange transition-colors">
                <h3 className="font-playfair text-xl sm:text-2xl font-extrabold text-brand-maroon">1000+</h3>
                <p className="text-[9px] text-brand-text/60 font-poppins uppercase tracking-wider font-bold mt-1">Daily Orders</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-brand-orange/15 text-center shadow-[0_5px_15px_rgba(230,179,37,0.03)] hover:border-brand-orange transition-colors">
                <h3 className="font-playfair text-xl sm:text-2xl font-extrabold text-brand-maroon">50+</h3>
                <p className="text-[9px] text-brand-text/60 font-poppins uppercase tracking-wider font-bold mt-1">Varieties</p>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-brand-brown text-brand-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(217,164,65,0.08),transparent)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-gold tracking-widest uppercase font-poppins">Our DNA</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-extrabold text-white mt-2">Our Core Values</h2>
            <div className="w-16 h-1 bg-brand-gold mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <motion.div 
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 rounded-2xl border border-brand-gold/15 hover:border-brand-gold/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-xs sm:text-sm text-brand-cream/70 font-poppins leading-relaxed font-light">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-orange tracking-widest uppercase font-poppins">Our Progress</span>
          <h2 className="font-playfair text-3xl sm:text-4xl font-extrabold text-brand-brown mt-2">Historical Timeline</h2>
          <div className="w-16 h-1 bg-brand-orange mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="relative border-l-2 border-brand-orange/30 ml-4 md:ml-32 space-y-12 pb-8">
          {timeline.map((item, idx) => (
            <motion.div 
              key={item.year}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative pl-8 md:pl-12"
            >
              {/* Year badge left side */}
              <div className="absolute left-[-17px] top-1.5 w-8 h-8 rounded-full bg-brand-gold border-4 border-brand-bg flex items-center justify-center text-brand-brown font-bold text-xs shadow-md"></div>
              <div className="hidden md:block absolute left-[-140px] top-1.5 w-24 text-right font-playfair font-black text-xl text-brand-maroon">{item.year}</div>
              
              <div className="p-6 bg-white rounded-3xl border border-brand-orange/15 shadow-[0_5px_20px_rgba(230,179,37,0.03)] max-w-2xl hover:border-brand-orange transition-all duration-300">
                <span className="md:hidden block font-playfair font-black text-lg text-brand-maroon mb-1">{item.year}</span>
                <h3 className="font-playfair text-lg font-bold text-brand-brown mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-brand-text/80 font-poppins leading-relaxed font-light">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-brand-ivory border-t border-brand-orange/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-orange tracking-widest uppercase font-poppins">The Family</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-extrabold text-brand-brown mt-2">Our Leadership Team</h2>
            <div className="w-16 h-1 bg-brand-orange mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <motion.div 
                key={member.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl border border-brand-orange/15 shadow-sm hover:border-brand-orange hover:shadow-md transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-full bg-brand-bg text-brand-brown font-playfair font-bold text-2xl flex items-center justify-center mx-auto mb-6 border-2 border-brand-orange shadow-inner">
                  {member.initials}
                </div>
                <h3 className="font-playfair text-lg font-bold text-brand-brown">{member.name}</h3>
                <p className="text-xs text-brand-orange uppercase tracking-wider font-semibold mt-1 font-poppins">{member.role}</p>
                <p className="text-xs sm:text-sm text-brand-text/70 mt-4 font-poppins leading-relaxed font-light">{member.bio}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
