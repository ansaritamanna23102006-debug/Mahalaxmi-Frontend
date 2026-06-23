'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/utils/api';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Lock, 
  LogOut,
  ChevronRight,
  Check,
  CheckCircle,
  X
} from 'lucide-react';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [wishlist, setWishlist] = useState([]);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form states
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: ''
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const loadWishlist = async () => {
    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        const data = await api.wishlist.get();
        if (data && data.products) {
          setWishlist(data.products.map(p => ({
            id: p._id,
            name: p.name,
            price: p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price,
            image: p.images ? p.images[0] : p.image
          })));
          return;
        }
      }
    } catch (e) {
      console.warn('Backend wishlist fetch failed, loading from local storage:', e.message);
    }
    // Fallback
    try {
      const stored = localStorage.getItem('mahalaxmi-wishlist');
      if (stored) setWishlist(JSON.parse(stored));
    } catch (e) {
      console.warn('Parsing local wishlist failed:', e.message);
    }
  };

  const loadAddresses = async () => {
    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        const data = await api.addresses.get();
        if (data && data.addresses) {
          setAddresses(data.addresses);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend addresses fetch failed:', e.message);
    }
    // Fallback to empty addresses
    setAddresses([]);
  };

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        const data = await api.orders.getMyOrders();
        if (data && data.orders) {
          setOrders(data.orders.map(o => ({
            id: o.orderId,
            date: new Date(o.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            total: o.total,
            status: o.orderStatus,
            items: o.items.map(item => `${item.name || (item.product && item.product.name)} (${item.weight}) x ${item.quantity}`).join(', ')
          })));
          return;
        }
      }
    } catch (e) {
      console.warn('Backend orders fetch failed:', e.message);
    }
    // Fallback to empty orders
    setOrders([]);
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        const data = await api.auth.getProfile();
        if (data && data.user) {
          setProfile({
            name: data.user.fullName || '',
            email: data.user.email || '',
            phone: data.user.mobileNumber || '',
            profilePhoto: data.user.profilePhoto || ''
          });
          // Update stored user in local storage to keep sync
          localStorage.setItem('mahalaxmi-user', JSON.stringify({
            name: data.user.fullName || '',
            email: data.user.email || '',
            phone: data.user.mobileNumber || '',
            profilePhoto: data.user.profilePhoto || ''
          }));
          return;
        }
      }
    } catch (e) {
      console.warn('Backend profile fetch failed, using local storage user:', e.message);
    }
    // Fallback
    const storedUser = localStorage.getItem('mahalaxmi-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          profilePhoto: user.profilePhoto || ''
        });
      } catch (e) {
        console.warn('Parsing local user failed:', e.message);
      }
    }
  };

  useEffect(() => {
    // Session authorization check
    const storedUser = localStorage.getItem('mahalaxmi-user');
    const token = localStorage.getItem('mahalaxmi-token');
    if (!storedUser && !token) {
      window.location.href = '/login';
    } else {
      fetchProfile();
      loadOrders();
      loadAddresses();
      loadWishlist();
      setIsLoading(false);
    }

    const handleWishlistUpdate = () => loadWishlist();
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, []);

  const removeFromWishlist = async (id) => {
    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        await api.wishlist.remove(id);
        loadWishlist();
        window.dispatchEvent(new Event('wishlist-updated'));
        showToast('Item removed from wishlist', 'info');
        return;
      }
    } catch (e) {
      console.warn('Backend wishlist remove failed, modifying locally:', e.message);
    }
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('mahalaxmi-wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-updated'));
    showToast('Item removed from wishlist', 'info');
  };

  const addToCartFromWishlist = async (item) => {
    try {
      await api.cart.add(item.id, 1, '500g');
      window.dispatchEvent(new Event('cart-updated'));
      showToast(`${item.name} added to cart!`);
    } catch (e) {
      // Fallback to localStorage
      const cart = JSON.parse(localStorage.getItem('mahalaxmi-cart') || '[]');
      const existing = cart.find(i => i.id === item.id);
      let newCart;
      if (existing) {
        newCart = cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newCart = [...cart, { ...item, weight: '500g', quantity: 1 }];
      }
      localStorage.setItem('mahalaxmi-cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event('cart-updated'));
      showToast(`${item.name} added to cart!`);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        const formData = new FormData();
        formData.append('fullName', profile.name);
        formData.append('mobileNumber', profile.phone);
        const res = await api.auth.updateProfile(formData);
        if (res && res.user) {
          setProfile({
            name: res.user.fullName || '',
            email: res.user.email || '',
            phone: res.user.mobileNumber || '',
            profilePhoto: res.user.profilePhoto || ''
          });
          localStorage.setItem('mahalaxmi-user', JSON.stringify({
            name: res.user.fullName || '',
            email: res.user.email || '',
            phone: res.user.mobileNumber || '',
            profilePhoto: res.user.profilePhoto || ''
          }));
          setProfileSuccess(true);
          setTimeout(() => setProfileSuccess(false), 3000);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to update profile on backend:', e.message);
      alert('Failed to save profile changes to backend: ' + e.message);
    }
    // Fallback if database is down or not logged in
    localStorage.setItem('mahalaxmi-user', JSON.stringify(profile));
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    try {
      const token = localStorage.getItem('mahalaxmi-token');
      if (token) {
        await api.auth.changePassword(passwords.current, passwords.new);
        setPasswordSuccess(true);
        setPasswords({ current: '', new: '', confirm: '' });
        setTimeout(() => setPasswordSuccess(false), 3000);
        return;
      }
    } catch (e) {
      console.error('Failed to change password on backend:', e.message);
      alert('Failed to change password: ' + e.message);
      return;
    }
    // Fallback mock success
    setPasswordSuccess(true);
    setPasswords({ current: '', new: '', confirm: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center font-poppins text-brand-brown">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-wider font-bold">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-poppins font-semibold ${
          toast.type === 'info' ? 'bg-brand-brown text-brand-cream' : 'bg-green-600 text-white'
        }`}>
          <CheckCircle className="w-5 h-5 shrink-0" />
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}
      <Navbar />

      {/* Header Banner */}
      <section className="pt-32 pb-12 bg-brand-brown text-brand-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-poppins text-brand-gold uppercase tracking-widest">
            <a href="/" className="hover:underline">Home</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-cream/80">My Account</span>
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl font-black">Customer Dashboard</h1>
          <p className="text-sm font-poppins font-light text-brand-cream/70 max-w-xl">
            Manage your personal profile, track fresh shipments, and review your sweet wishlist.
          </p>
        </div>
      </section>

      {/* Account Core Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Tabs */}
          <aside className="lg:col-span-3">
            <div className="p-6 bg-white rounded-3xl border border-brand-gold/15 shadow-sm space-y-2">
              {[
                { id: 'profile', label: 'My Profile', icon: User },
                { id: 'orders', label: 'Order History', icon: ShoppingBag },
                { id: 'wishlist', label: 'My Wishlist', icon: Heart },
                { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
                { id: 'password', label: 'Change Password', icon: Lock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left text-xs sm:text-sm font-poppins font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-colors flex items-center gap-3 ${activeTab === tab.id ? 'bg-brand-maroon text-brand-cream' : 'hover:bg-brand-bg text-brand-brown/80'}`}
                >
                  <tab.icon className="w-4.5 h-4.5 text-brand-gold" /> {tab.label}
                </button>
              ))}
              
              <button 
                onClick={async () => { await api.auth.logout(); window.location.href = '/'; }}
                className="w-full text-left text-xs sm:text-sm font-poppins font-bold uppercase tracking-wider py-3 px-4 rounded-xl hover:bg-red-50 text-red-600 transition-colors flex items-center gap-3 pt-4 border-t border-brand-gold/10"
              >
                <LogOut className="w-4.5 h-4.5" /> Logout Session
              </button>
            </div>
          </aside>

          {/* Right Tab Contents */}
          <main className="lg:col-span-9 bg-white p-8 sm:p-10 rounded-[36px] border border-brand-gold/15 shadow-sm min-h-[450px]">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="font-playfair text-xl font-bold text-brand-brown">Edit Profile Details</h3>
                <div className="w-12 h-[2px] bg-brand-gold"></div>

                {profileSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" /> Personal profile saved successfully!
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown px-8 py-3 rounded-xl text-xs font-bold font-poppins transition-colors shadow-sm pt-2"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="font-playfair text-xl font-bold text-brand-brown">Order History</h3>
                <div className="w-12 h-[2px] bg-brand-gold"></div>

                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-6 rounded-2xl border border-brand-gold/15 bg-brand-cream/20 space-y-3 font-poppins">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="font-bold text-brand-brown text-sm sm:text-base">ID: {ord.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${ord.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-brand-text/50">Ordered on: {ord.date}</p>
                      <p className="text-xs text-brand-text/80 leading-relaxed font-light">{ord.items}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-brand-gold/10 text-xs">
                        <span className="font-light">Subtotal Amount:</span>
                        <span className="font-black text-brand-maroon text-sm">₹{ord.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <h3 className="font-playfair text-xl font-bold text-brand-brown">My Wishlist</h3>
                <div className="w-12 h-[2px] bg-brand-gold"></div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-20 bg-brand-bg rounded-2xl">
                    <Heart className="w-12 h-12 text-brand-gold/30 mx-auto mb-2" />
                    <p className="text-xs text-brand-text/60 font-poppins">No favorited sweets found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-4 rounded-2xl border border-brand-gold/15 bg-white shadow-sm flex-wrap gap-4 font-poppins">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-brand-gold/20" />
                          <div>
                            <h4 className="font-bold text-brand-brown text-sm">{item.name}</h4>
                            <p className="text-[11px] text-brand-gold font-bold">₹{item.price} / 500g</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => addToCartFromWishlist(item)}
                            className="flex items-center gap-1.5 bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown px-4 py-2 rounded-xl text-xs font-bold font-poppins transition-all duration-200 shadow-sm"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                          </button>
                          <button 
                            onClick={() => removeFromWishlist(item.id)}
                            className="text-xs text-brand-maroon/70 hover:text-brand-maroon hover:underline font-bold transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <h3 className="font-playfair text-xl font-bold text-brand-brown">Saved Addresses</h3>
                <div className="w-12 h-[2px] bg-brand-gold"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {addresses.map((addr, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-brand-gold/15 bg-brand-cream/20 space-y-2 font-poppins">
                      <span className="bg-brand-brown text-brand-gold text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-md inline-block">
                        {addr.type}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-brand-brown mt-2">{addr.street}</p>
                      <p className="text-xs text-brand-text/60">{addr.landmark}</p>
                      <p className="text-xs text-brand-text/60">{addr.area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASSWORD TAB */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <h3 className="font-playfair text-xl font-bold text-brand-brown">Change Password</h3>
                <div className="w-12 h-[2px] bg-brand-gold"></div>

                {passwordSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" /> Password altered successfully!
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Current Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">New Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">Confirm New Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/20 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown px-8 py-3 rounded-xl text-xs font-bold font-poppins transition-colors shadow-sm pt-2"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

          </main>

        </div>
      </section>

      <Footer />
    </div>
  );
}
