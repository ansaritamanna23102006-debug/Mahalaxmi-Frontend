'use client';

import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight
} from 'lucide-react';

const FacebookIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const InstagramIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const TwitterIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const YoutubeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
);

export default function Footer() {
  return (
    <footer id="contact" className="bg-brand-brown text-brand-cream/80 pt-20 pb-8 border-t-2 border-brand-gold/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-brand-gold/10">
        
        {/* Column 1: Brand Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="w-48 h-12">
            <img src="/logo.svg" alt="Mahalaxmi Mithaiwala Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-sm font-poppins font-light leading-relaxed text-brand-cream/70">
            Serving Mumbai since 1982. Handcrafting traditional Indian sweets and crunchy farsan with unmatched devotion to premium quality, pure ingredients, and timeless heritage.
          </p>
          <div className="flex space-x-4 pt-2">
            {[
              { name: 'Facebook', icon: FacebookIcon, href: '#' },
              { name: 'Instagram', icon: InstagramIcon, href: '#' },
              { name: 'Twitter', icon: TwitterIcon, href: '#' },
              { name: 'YouTube', icon: YoutubeIcon, href: '#' }
            ].map((social) => (
              <a 
                key={social.name} 
                href={social.href} 
                className="p-2.5 bg-brand-cream/5 hover:bg-brand-gold hover:text-brand-brown rounded-full border border-brand-gold/15 transition-all duration-300 text-brand-cream hover:scale-110 active:scale-95 transform"
                aria-label={social.name}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-playfair text-white text-lg font-bold">Quick Links</h3>
          <ul className="space-y-3 font-poppins text-sm font-light">
            <li><a href="/" className="hover:text-brand-gold transition-colors duration-300 flex items-center gap-1"><ChevronRight className="w-3 h-3 text-brand-gold/60" /> Home</a></li>
            <li><a href="/sweets" className="hover:text-brand-gold transition-colors duration-300 flex items-center gap-1"><ChevronRight className="w-3 h-3 text-brand-gold/60" /> Sweets</a></li>
            <li><a href="/farsan" className="hover:text-brand-gold transition-colors duration-300 flex items-center gap-1"><ChevronRight className="w-3 h-3 text-brand-gold/60" /> Farsan</a></li>
            <li><a href="/about" className="hover:text-brand-gold transition-colors duration-300 flex items-center gap-1"><ChevronRight className="w-3 h-3 text-brand-gold/60" /> About Us</a></li>
            <li><a href="/contact" className="hover:text-brand-gold transition-colors duration-300 flex items-center gap-1"><ChevronRight className="w-3 h-3 text-brand-gold/60" /> Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Categories */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-playfair text-white text-lg font-bold">Categories</h3>
          <ul className="space-y-3 font-poppins text-sm font-light">
            <li><a href="/sweets" className="hover:text-brand-gold transition-colors duration-300 flex items-center gap-1"><ChevronRight className="w-3 h-3 text-brand-gold/60" /> Sweets</a></li>
            <li><a href="/farsan" className="hover:text-brand-gold transition-colors duration-300 flex items-center gap-1"><ChevronRight className="w-3 h-3 text-brand-gold/60" /> Farsan</a></li>
            <li><a href="/#categories" className="hover:text-brand-gold transition-colors duration-300 flex items-center gap-1"><ChevronRight className="w-3 h-3 text-brand-gold/60" /> Gift Boxes</a></li>
            <li><a href="/festive-offers" className="hover:text-brand-gold transition-colors duration-300 flex items-center gap-1"><ChevronRight className="w-3 h-3 text-brand-gold/60" /> Festival Offers</a></li>
          </ul>
        </div>

        {/* Column 4: Contact & Maps */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-playfair text-white text-lg font-bold">Contact Us</h3>
          <ul className="space-y-4 font-poppins text-sm font-light text-brand-cream/80">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
              <span>
                Suraj Prashad Chawl No. 204 A,<br />
                Opp. L Ward Office,<br />
                CST Road, Kurla (W),<br />
                Mumbai, Maharashtra – 400070
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-brand-gold" />
              <a href="tel:+912212345678" className="hover:text-brand-gold transition-colors">+91 22 1234 5678</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-gold" />
              <a href="mailto:info@mahalaxmimithaiwala.com" className="hover:text-brand-gold transition-colors">info@mahalaxmimithaiwala.com</a>
            </li>
          </ul>
          
          {/* Google Maps Button */}
          <a 
            href="https://maps.google.com/?q=Kurla+West+Mumbai+Opp+L+Ward+Office" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-cream text-brand-brown text-xs font-bold font-poppins px-5 py-3 rounded-xl transition-all duration-300 shadow-md hover:scale-[1.03] active:scale-[0.97] transform"
          >
            <MapPin className="w-4 h-4 shrink-0" /> Locate on Google Maps
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-brand-cream/40 font-poppins">
        <p>© {new Date().getFullYear()} Mahalaxmi Mithaiwala. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
}
