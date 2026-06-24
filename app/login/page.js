'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '@/utils/api';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Register Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Status Notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication Redirect Check
  useEffect(() => {
    const user = localStorage.getItem('mahalaxmi-user');
    if (user) {
      window.location.href = '/';
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const data = await api.auth.login(email, password);
      setIsSubmitting(false);
      setSuccessMsg('Logged in successfully! Redirecting...');
      window.dispatchEvent(new Event('storage'));

      // Redirect admin to admin panel, regular users to home
      const isAdmin = data?.user?.role === 'admin';
      setTimeout(() => {
        window.location.href = isAdmin ? '/admin' : '/';
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Please accept the terms and conditions.');
      return;
    }
    if (regPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.auth.register(regName, regEmail, regPhone.replace(/\D/g, ''), regPassword);
      setIsSubmitting(false);
      setSuccessMsg('Account created successfully! Welcome to the family.');
      window.dispatchEvent(new Event('storage'));

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Registration failed. Try again.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await api.auth.forgotPassword(email);

      setIsSubmitting(false);
      setSuccessMsg('Password reset instructions sent to your email.');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('');
      }, 4000);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Please enter a valid registered email address.');
    }
  };

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen flex flex-col justify-center py-12">

      {/* Main Portal Section */}
      <section className="px-4 md:px-8 max-w-6xl mx-auto w-full flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-[36px] border border-brand-gold/15 bg-white shadow-2xl min-h-[600px]">
          
          {/* Left Panel: Decorative Legacy Branding */}
          <div className="lg:col-span-5 bg-brand-brown text-brand-cream p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background pattern styling */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F4D20A_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-4">
              <Link href="/" className="inline-block w-40 hover:scale-105 transition-transform duration-300">
                <Image src="/logo.png" alt="Mahalaxmi Mithaiwala Logo" width={160} height={40} priority className="w-full object-contain" />
              </Link>
              <span className="inline-block text-[10px] font-bold tracking-widest text-brand-gold uppercase bg-brand-cream/10 px-3 py-1 rounded-md">
                Established 1982
              </span>
            </div>

            <div className="relative z-10 py-12 lg:py-0 space-y-6">
              <h2 className="font-playfair text-3xl md:text-4xl font-black leading-tight text-white">
                A Legacy Built on <br />
                <span className="text-brand-gold">Taste & Tradition</span>
              </h2>
              <p className="font-poppins text-xs md:text-sm font-light text-brand-cream/70 leading-relaxed max-w-sm">
                Log in to order premium handmade sweets, spicy farsan collections, and custom festive hampers crafted with love for over 4 decades.
              </p>
              
              <div className="flex flex-col gap-4 text-xs font-poppins text-brand-cream/80 pt-4 border-t border-brand-gold/10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-gold shrink-0" />
                  <span>100% Hygienic & Fresh Preparation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-gold shrink-0" />
                  <span>Express 2-Hour Mumbai Delivery</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-brand-cream/5 flex justify-between items-center text-[10px] font-poppins text-brand-cream/50">
              <span>Mahalaxmi Mithaiwala © 2026</span>
              <a href="/contact" className="hover:underline hover:text-brand-gold">Need Help?</a>
            </div>
          </div>

          {/* Right Panel: Interactive Authentication Forms */}
          <div className="lg:col-span-7 bg-brand-cream/10 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white">
            
            <AnimatePresence mode="wait">
              {/* LOGIN MODE */}
              {mode === 'login' && (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h3 className="font-playfair text-2xl md:text-3xl font-black text-brand-brown">Welcome Back</h3>
                    <p className="text-xs text-brand-text/50 font-poppins">Enter your details below to access your account dashboard.</p>
                  </div>

                  {/* Feedback states */}
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 animate-bounce" /> {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/85">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/40 w-4 h-4" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="w-full pl-12 pr-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/25 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-brown font-poppins"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/85">Password</label>
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-[10px] font-bold text-brand-maroon hover:underline font-poppins"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/40 w-4 h-4" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-12 py-3 bg-brand-bg rounded-xl border border-brand-gold/25 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-brown font-poppins"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-brown/40 hover:text-brand-brown transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="accent-brand-maroon w-4.5 h-4.5 rounded cursor-pointer"
                      />
                      <label htmlFor="remember" className="text-xs text-brand-brown/80 font-poppins cursor-pointer select-none font-medium">
                        Remember this session
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown py-3 rounded-xl font-bold font-poppins transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-md mt-6 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Authenticating...' : 'Sign In To Dashboard'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Social / Registration Redirect */}
                  <div className="space-y-4 pt-4 border-t border-brand-gold/15">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-brand-text/50 font-poppins">New to Mahalaxmi Mithaiwala?</span>
                      <button
                        onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                        className="text-xs font-bold text-brand-maroon hover:underline font-poppins"
                      >
                        Create Account
                      </button>
                    </div>


                  </div>
                </motion.div>
              )}

              {/* REGISTER MODE */}
              {mode === 'register' && (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h3 className="font-playfair text-2xl md:text-3xl font-black text-brand-brown">Create Account</h3>
                    <p className="text-xs text-brand-text/50 font-poppins">Join us to save addresses, track orders, and get custom discount codes.</p>
                  </div>

                  {/* Feedback states */}
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 animate-bounce" /> {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {/* Full Name */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/85">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/40 w-4 h-4" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full pl-12 pr-4 py-2.5 bg-brand-bg rounded-xl border border-brand-gold/25 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-brown font-poppins"
                        />
                      </div>
                    </div>

                    {/* Contact Details (Email + Phone Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/85">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/40 w-4 h-4" />
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="name@email.com"
                            className="w-full pl-12 pr-4 py-2.5 bg-brand-bg rounded-xl border border-brand-gold/25 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-brown font-poppins"
                          />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/85">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/40 w-4 h-4" />
                          <input
                            type="tel"
                            required
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="98765 43210"
                            className="w-full pl-12 pr-4 py-2.5 bg-brand-bg rounded-xl border border-brand-gold/25 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-brown font-poppins"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/85">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/40 w-4 h-4" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-2.5 bg-brand-bg rounded-xl border border-brand-gold/25 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-brown font-poppins"
                          />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/85">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/40 w-4 h-4" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-2.5 bg-brand-bg rounded-xl border border-brand-gold/25 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-brown font-poppins"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Visibility Switch */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] font-bold text-brand-maroon hover:underline flex items-center gap-1 font-poppins"
                      >
                        {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                      </button>
                    </div>

                    {/* Accept Terms */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="accent-brand-maroon w-4.5 h-4.5 rounded cursor-pointer mt-0.5"
                      />
                      <label htmlFor="terms" className="text-xs text-brand-brown/80 font-poppins cursor-pointer select-none font-medium leading-tight">
                        I agree to the Terms of Service & Privacy Policy of Mahalaxmi Mithaiwala since 1982.
                      </label>
                    </div>

                    {/* Submit Register */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown py-3 rounded-xl font-bold font-poppins transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-md mt-4 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating Profile...' : 'Complete Register & Sign In'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Switch to login */}
                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-brand-gold/15">
                    <span className="text-xs text-brand-text/50 font-poppins">Already registered?</span>
                    <button
                      onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-xs font-bold text-brand-maroon hover:underline font-poppins"
                    >
                      Login Here
                    </button>
                  </div>
                </motion.div>
              )}

              {/* FORGOT PASSWORD MODE */}
              {mode === 'forgot' && (
                <motion.div
                  key="forgot-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <button
                    onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-xs font-bold text-brand-brown/60 hover:text-brand-brown flex items-center gap-1.5 font-poppins hover:-translate-x-1 transition-transform"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </button>

                  <div className="space-y-1">
                    <h3 className="font-playfair text-2xl md:text-3xl font-black text-brand-brown">Reset Password</h3>
                    <p className="text-xs text-brand-text/50 font-poppins">Enter your registered email below to receive a secure password recovery code.</p>
                  </div>

                  {/* Feedback states */}
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 animate-bounce" /> {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/85">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/40 w-4 h-4" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="w-full pl-12 pr-4 py-3 bg-brand-bg rounded-xl border border-brand-gold/25 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-brown font-poppins"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-maroon hover:bg-brand-gold text-brand-cream hover:text-brand-brown py-3 rounded-xl font-bold font-poppins transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-md mt-6 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Sending instructions...' : 'Request Verification Link'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

    </div>
  );
}
