'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  LogOut,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Star,
  Menu,
  Eye,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  Mail,
  Bell,
  Layers
} from 'lucide-react';
import { api } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function adminFetch(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mahalaxmi-token') : null;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('mahalaxmi-token');
      localStorage.removeItem('mahalaxmi-user');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

const STATUS_COLORS = {
  pending:          'bg-yellow-100 text-yellow-700',
  confirmed:        'bg-blue-100 text-blue-700',
  preparing:        'bg-purple-100 text-purple-700',
  packed:           'bg-indigo-100 text-indigo-700',
  shipped:          'bg-cyan-100 text-cyan-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
  refunded:         'bg-gray-100 text-gray-600',
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [collectionForm, setCollectionForm] = useState({
    title: '', tagline: '', description: '', image: '', imageFile: null, products: [], isActive: true
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Notifications & Inquiries states
  const [inquiries, setInquiries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '', description: '', image: null, imageUrl: ''
  });
  const categoryImageInputRef = React.useRef(null);
  const collectionImageInputRef = React.useRef(null);

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '', image: null, imageUrl: '' });
    if (categoryImageInputRef.current) categoryImageInputRef.current.value = '';
  };

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await adminFetch('/collections');
      setCollections(data?.collections || []);
    } catch (e) {
      console.warn('Collection load failed:', e.message);
    }
    setLoading(false);
  };

  const handleCollectionSave = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', collectionForm.title);
      fd.append('tagline', collectionForm.tagline);
      fd.append('description', collectionForm.description);
      fd.append('isActive', collectionForm.isActive);
      fd.append('productsJson', JSON.stringify(collectionForm.products));

      if (collectionForm.imageFile) {
        fd.append('image', collectionForm.imageFile);
      } else if (collectionForm.image) {
        fd.append('image', collectionForm.image);
      }

      const token = localStorage.getItem('mahalaxmi-token');
      const headers = { Authorization: `Bearer ${token}` };
      const url = editingCollection
        ? `${API_BASE}/collections/${editingCollection._id}`
        : `${API_BASE}/collections`;
      const method = editingCollection ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: fd });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      if (!res.ok) throw new Error(data.message || 'Failed to save collection');

      setShowCollectionForm(false);
      resetCollectionForm();
      loadCollections();
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  };

  const handleCollectionDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      await adminFetch(`/collections/${id}`, { method: 'DELETE' });
      loadCollections();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  const openEditCollection = (col) => {
    setEditingCollection(col);
    setCollectionForm({
      title: col.title || '',
      tagline: col.tagline || '',
      description: col.description || '',
      image: col.image || '',
      imageFile: null,
      products: col.products ? col.products.map(p => p._id || p) : [],
      isActive: col.isActive !== undefined ? col.isActive : true
    });
    setShowCollectionForm(true);
  };

  const resetCollectionForm = () => {
    setEditingCollection(null);
    setCollectionForm({
      title: '', tagline: '', description: '', image: '', imageFile: null, products: [], isActive: true
    });
    if (collectionImageInputRef.current) collectionImageInputRef.current.value = '';
  };

  const toggleProductInCollection = (productId) => {
    const isChecked = collectionForm.products.includes(productId);
    let updatedProducts;
    if (isChecked) {
      updatedProducts = collectionForm.products.filter(id => id !== productId);
    } else {
      updatedProducts = [...collectionForm.products, productId];
    }
    setCollectionForm({ ...collectionForm, products: updatedProducts });
  };

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', category: 'Sweets', price: '', discountPrice: '',
    stock: '', description: '', shortDescription: '',
    weightOptions: '250g,500g,1kg', isFeatured: false, isBestSeller: false,
    sku: '',
    imageUrls: [],   // existing / pasted URLs
    imageFiles: [],  // local File objects from file picker
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const imageInputRef = React.useRef(null);

  // Search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Auth guard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSidebarOpen(window.innerWidth >= 1024);
    }
    const user = JSON.parse(localStorage.getItem('mahalaxmi-user') || 'null');
    if (!user || user.role !== 'admin') {
      window.location.href = '/login';
      return;
    }
    setAdminUser(user);
    loadDashboard();
    loadCategories();
  }, []);

  useEffect(() => {
    if (!adminUser) return;
    if (activeTab === 'dashboard') loadDashboard();
    if (activeTab === 'products') { loadProducts(); loadCategories(); }
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'collections') { loadCollections(); loadProducts(); }
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'reviews') loadReviews();
    if (activeTab === 'inquiries') loadInquiries();

    // Auto-refresh orders and dashboard every 30 seconds
    let interval = null;
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      interval = setInterval(() => {
        if (activeTab === 'orders') loadOrders();
        else if (activeTab === 'dashboard') loadDashboard();
      }, 30000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeTab, adminUser]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, usersData, contactData] = await Promise.all([
        adminFetch('/orders?limit=100'),
        adminFetch('/products?limit=200'),
        adminFetch('/auth/admin/users'),
        adminFetch('/contact')
      ]);
      const allOrders = ordersData?.orders || [];
      const allProducts = productsData?.products || [];
      const allInquiries = contactData?.inquiries || [];
      const totalRevenue = allOrders.filter(o => o.orderStatus !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
      const pendingOrders = allOrders.filter(o => o.orderStatus === 'pending').length;
      const lowStock = allProducts.filter(p => p.stock < 20).length;
      
      setStats({
        totalRevenue,
        totalOrders: ordersData?.results || allOrders.length,
        totalProducts: productsData?.results || allProducts.length,
        totalUsers: usersData?.total || (usersData?.users || []).length,
        pendingOrders,
        lowStock,
        recentOrders: allOrders.slice(0, 5),
      });

      // Generate dynamic notifications
      const newNotifs = [];

      // 1. Low stock alerts (< 20)
      allProducts.filter(p => p.stock < 20).forEach(p => {
        newNotifs.push({
          id: `stock-${p._id}`,
          type: 'stock',
          title: 'Low Stock Alert',
          message: `"${p.name}" has only ${p.stock} items left!`,
          createdAt: new Date(),
          targetTab: 'products',
          filter: p.name
        });
      });

      // 2. Pending/New orders
      allOrders.filter(o => o.orderStatus === 'pending').forEach(o => {
        newNotifs.push({
          id: `order-${o._id}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order #${o.orderId || o._id.slice(-6)} (₹${o.total}) from ${o.user?.fullName || 'Guest'}`,
          createdAt: new Date(o.createdAt),
          targetTab: 'orders'
        });
      });

      // 3. Unresolved Support Inquiries
      allInquiries.filter(i => !i.isResolved).forEach(i => {
        newNotifs.push({
          id: `inquiry-${i._id}`,
          type: 'inquiry',
          title: 'New Support Inquiry',
          message: `"${i.subject}" from ${i.name}`,
          createdAt: new Date(i.createdAt),
          targetTab: 'inquiries'
        });
      });

      // Sort notifications by timestamp (newest first)
      newNotifs.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(newNotifs);
      setInquiries(allInquiries);

    } catch (e) {
      console.warn('Dashboard load failed:', e.message);
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminFetch('/products?limit=200');
      setProducts(data?.products || []);
    } catch (e) { console.warn(e.message); }
    setLoading(false);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminFetch('/orders?limit=100');
      setOrders(data?.orders || []);
    } catch (e) { console.warn(e.message); }
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminFetch('/auth/admin/users');
      setUsers(data?.users || []);
    } catch (e) { console.warn(e.message); }
    setLoading(false);
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await adminFetch('/reviews/admin');
      setReviews(data?.reviews || []);
    } catch (e) { console.warn(e.message); }
    setLoading(false);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminFetch('/categories');
      setCategories(data?.categories || []);
    } catch (e) {
      console.warn('Category load failed:', e.message);
    }
    setLoading(false);
  };

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const data = await adminFetch('/contact');
      setInquiries(data?.inquiries || []);
    } catch (e) {
      console.warn('Inquiries load failed:', e.message);
    }
    setLoading(false);
  };

  const handleResolveInquiry = async (id) => {
    try {
      await adminFetch(`/contact/${id}/resolve`, { method: 'PUT' });
      if (activeTab === 'dashboard') loadDashboard();
      else loadInquiries();
    } catch (e) {
      alert('Failed to resolve inquiry: ' + e.message);
    }
  };

  const handleCategorySave = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', categoryForm.name);
      fd.append('description', categoryForm.description);
      if (categoryForm.image) {
        fd.append('image', categoryForm.image);
      } else if (categoryForm.imageUrl) {
        fd.append('image', categoryForm.imageUrl);
      }

      const token = localStorage.getItem('mahalaxmi-token');
      const headers = { Authorization: `Bearer ${token}` };
      const url = editingCategory
        ? `${API_BASE}/categories/${editingCategory._id}`
        : `${API_BASE}/categories`;
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: fd });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      if (!res.ok) throw new Error(data.message || 'Failed to save category');

      setShowCategoryForm(false);
      setEditingCategory(null);
      resetCategoryForm();
      loadCategories();
    } catch (e) {
      alert('Error saving category: ' + e.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Products in this category will remain, but the category reference will be removed.')) return;
    try {
      await adminFetch(`/categories/${id}`, { method: 'DELETE' });
      loadCategories();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || '',
      description: cat.description || '',
      image: null,
      imageUrl: cat.image || ''
    });
    setShowCategoryForm(true);
  };


  const handleProductSave = async (e) => {
    e.preventDefault();
    try {
      // Build FormData so file uploads work with multer
      const fd = new FormData();
      fd.append('name', productForm.name);
      fd.append('category', productForm.category);
      fd.append('price', parseFloat(productForm.price));
      fd.append('discountPrice', parseFloat(productForm.discountPrice) || 0);
      fd.append('stock', parseInt(productForm.stock));
      fd.append('sku', productForm.sku || `MHL-${Date.now()}`);
      fd.append('description', productForm.description);
      fd.append('shortDescription', productForm.shortDescription);
      
      const weightArr = productForm.weightOptions.split(',').map(s => s.trim()).filter(Boolean);
      fd.append('weightOptionsJson', JSON.stringify(weightArr));
      
      fd.append('isFeatured', productForm.isFeatured);
      fd.append('isBestSeller', productForm.isBestSeller);

      // Attach existing URL images as JSON array
      if (productForm.imageUrls.length > 0) {
        fd.append('imageUrlsJson', JSON.stringify(productForm.imageUrls));
      }

      // Attach local file uploads
      productForm.imageFiles.forEach(file => fd.append('images', file));

      const token = localStorage.getItem('mahalaxmi-token');
      const headers = { Authorization: `Bearer ${token}` };
      const url = editingProduct
        ? `${API_BASE}/products/${editingProduct._id}`
        : `${API_BASE}/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: fd });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      if (!res.ok) throw new Error(data.message || 'Failed to save product');

      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
      loadProducts();
    } catch (e) {
      alert('Error saving product: ' + e.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await adminFetch(`/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch (e) { alert('Delete failed: ' + e.message); }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await adminFetch(`/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadOrders();
    } catch (e) { alert('Status update failed: ' + e.message); }
  };

  const handleApproveReview = async (id) => {
    try {
      await adminFetch(`/reviews/${id}/approve`, { method: 'PUT' });
      loadReviews();
    } catch (e) { alert(e.message); }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await adminFetch(`/reviews/${id}`, { method: 'DELETE' });
      loadReviews();
    } catch (e) { alert(e.message); }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      category: product.category || 'Sweets',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      stock: product.stock || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      weightOptions: (product.weightOptions || ['250g', '500g', '1kg']).join(','),
      isFeatured: product.isFeatured || false,
      isBestSeller: product.isBestSeller || false,
      sku: product.sku || '',
      imageUrls: product.images || [],
      imageFiles: [],
    });
    setNewImageUrl('');
    setShowProductForm(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '', category: 'Sweets', price: '', discountPrice: '',
      stock: '', description: '', shortDescription: '',
      weightOptions: '250g,500g,1kg', isFeatured: false, isBestSeller: false,
      sku: '',
      imageUrls: [],
      imageFiles: [],
    });
    setNewImageUrl('');
  };

  const handleLogout = () => {
    api.auth.logout();
    window.location.href = '/login';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'collections', label: 'Collections', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Customers', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'inquiries', label: 'Inquiries', icon: Mail },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = !productCategoryFilter || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => {
    const term = orderSearch.toLowerCase();
    const matchesId = o.orderId?.toLowerCase()?.includes(term);
    const matchesUser = o.user?.fullName?.toLowerCase()?.includes(term) ||
                        o.user?.email?.toLowerCase()?.includes(term);
    const matchesGuest = o.guestEmail?.toLowerCase()?.includes(term);
    return matchesId || matchesUser || matchesGuest;
  });

  return (
    <div className="flex h-screen bg-gray-50 font-poppins overflow-hidden">

      {/* ─── SIDEBAR ─── */}
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 lg:static z-50 lg:z-20 ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'} bg-brand-black text-white flex flex-col transition-all duration-300 shrink-0`}>
        {/* Logo */}
        <div className={`p-5 border-b border-white/10 flex items-center gap-3 ${(!sidebarOpen && window.innerWidth >= 1024) && 'justify-center'}`}>
          <div className="w-9 h-9 bg-brand-gold rounded-xl flex items-center justify-center text-brand-brown font-black text-sm shrink-0">M</div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm leading-none">Mahalaxmi</p>
              <p className="text-[10px] text-white/50 mt-0.5">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === id ? 'bg-brand-gold text-brand-brown font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'} ${!sidebarOpen && 'lg:justify-center'}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {(sidebarOpen || window.innerWidth < 1024) && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* Admin user & logout */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {(sidebarOpen || window.innerWidth < 1024) && adminUser && (
            <div className="px-3 py-2 bg-white/5 rounded-xl">
              <p className="text-xs font-bold text-white truncate">{adminUser.fullName}</p>
              <p className="text-[10px] text-white/50 truncate">{adminUser.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 transition-colors ${(!sidebarOpen && window.innerWidth >= 1024) && 'justify-center'}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(sidebarOpen || window.innerWidth < 1024) && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-800 text-lg capitalize">{activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab}</h1>
              <p className="text-xs text-gray-400">Mahalaxmi Mithaiwala Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { 
                if (activeTab === 'dashboard') loadDashboard(); 
                else if (activeTab === 'products') loadProducts(); 
                else if (activeTab === 'categories') loadCategories();
                else if (activeTab === 'collections') { loadCollections(); loadProducts(); }
                else if (activeTab === 'orders') loadOrders();
                else if (activeTab === 'inquiries') loadInquiries();
              }} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors" 
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  loadDashboard();
                }} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-40 max-h-[350px] overflow-hidden flex flex-col"
                    >
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
                        <span className="font-bold text-xs text-gray-800">Notifications ({notifications.length})</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                setActiveTab(n.targetTab);
                                if (n.filter) setProductSearch(n.filter);
                                setShowNotifications(false);
                              }}
                              className="w-full text-left p-3.5 hover:bg-amber-50/20 transition-colors flex items-start gap-3 border-none outline-none cursor-pointer bg-transparent"
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                n.type === 'stock' ? 'bg-red-50 text-red-500' :
                                n.type === 'order' ? 'bg-blue-50 text-blue-500' :
                                'bg-purple-50 text-purple-500'
                              }`}>
                                {n.type === 'stock' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                                 n.type === 'order' ? <ShoppingBag className="w-3.5 h-3.5" /> :
                                 <Mail className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[11px] text-gray-800">{n.title}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-400">
                            <Bell className="w-6 h-6 mx-auto mb-2 text-gray-200" />
                            <p className="text-[11px]">No active notifications</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-bold text-green-700">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ─── DASHBOARD ─── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: stats ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : '—', icon: IndianRupee, color: 'bg-green-500' },
              { label: 'Total Orders', value: stats?.totalOrders ?? '—', icon: ShoppingBag, color: 'bg-blue-500' },
              { label: 'Products', value: stats?.totalProducts ?? '—', icon: Package, color: 'bg-purple-500' },
              { label: 'Customers', value: stats?.totalUsers ?? '—', icon: Users, color: 'bg-orange-500' },
            ].map((card) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-black text-gray-800">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{card.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Alert Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-yellow-800">{stats?.pendingOrders ?? 0} Pending Orders</p>
                    <p className="text-xs text-yellow-600">Awaiting confirmation</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-400 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800">{stats?.lowStock ?? 0} Low Stock Items</p>
                    <p className="text-xs text-red-600">Products with stock &lt; 20</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-brand-maroon font-bold hover:underline flex items-center gap-1">
                    View All <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(stats?.recentOrders || []).map(order => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-gray-600">{order.orderId}</td>
                          <td className="px-5 py-3 font-medium text-gray-800">{order.user?.fullName || 'Guest'}</td>
                          <td className="px-5 py-3 font-bold text-gray-800">₹{order.total}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                      {(!stats?.recentOrders?.length) && (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No orders yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── PRODUCTS ─── */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
                  </div>
                  <select
                    value={productCategoryFilter}
                    onChange={e => setProductCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/30 cursor-pointer text-gray-600 font-medium"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => { setEditingProduct(null); resetProductForm(); setShowProductForm(true); }} className="flex items-center gap-2 bg-brand-black text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-gold hover:text-brand-brown transition-colors">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProducts.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              {p.images?.[0] && <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover border border-gray-100" alt={p.name} />}
                              <div>
                                <p className="font-semibold text-gray-800 text-xs">{p.name}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{p.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-600">{p.category}</td>
                          <td className="px-5 py-3">
                            <p className="font-bold text-gray-800">₹{p.discountPrice > 0 ? p.discountPrice : p.price}</p>
                            {p.discountPrice > 0 && <p className="text-[10px] text-gray-400 line-through">₹{p.price}</p>}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`font-bold text-xs ${p.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>{p.stock}</span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {p.isFeatured && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">Featured</span>}
                              {p.isBestSeller && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">Bestseller</span>}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEditProduct(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!filteredProducts.length && (
                        <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No products found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── ORDERS ─── */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search by order ID or customer..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.map(order => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{order.orderId}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800 text-xs">{order.user?.fullName || order.guestEmail?.split('@')[0] || 'Guest'}</p>
                            <p className="text-[10px] text-gray-400">{order.user?.email || order.guestEmail || '—'}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{order.items?.length || 0} items</td>
                          <td className="px-4 py-3 font-bold text-gray-800">₹{order.total}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.paymentMethod === 'cod' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                              {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={order.orderStatus}
                              onChange={e => handleOrderStatus(order._id, e.target.value)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}
                            >
                              {['pending', 'confirmed', 'preparing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => alert(
                                `Order: ${order.orderId}\n` +
                                `Customer: ${order.user?.fullName || order.guestEmail || 'Guest'}\n` +
                                `Items: ${order.items?.map(i => `${i.name || 'Product'} x${i.quantity}`).join(', ')}\n` +
                                `Total: ₹${order.total}\n` +
                                `Payment: ${order.paymentMethod?.toUpperCase()} (${order.paymentStatus})\n` +
                                `Address: ${order.shippingAddress?.name}, ${order.shippingAddress?.addressLine}, ${order.shippingAddress?.landmark ? order.shippingAddress.landmark + ', ' : ''}${order.shippingAddress?.city} - ${order.shippingAddress?.pincode}\n` +
                                `Mobile: ${order.shippingAddress?.mobile}`
                              )}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredOrders.length && (
                        <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">No orders found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── CUSTOMERS ─── */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      {['Customer', 'Mobile', 'Role', 'Verified', 'Joined'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center font-bold text-brand-brown text-xs">
                              {(u.fullName || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-xs">{u.fullName}</p>
                              <p className="text-[10px] text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-600">{u.mobileNumber}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {u.isVerified
                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                            : <X className="w-4 h-4 text-red-400" />
                          }
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                    {!users.length && (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No customers yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── REVIEWS ─── */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-800">{review.user?.fullName || 'Customer'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 italic">"{review.reviewText}"</p>
                    <p className="text-[10px] text-gray-400 mt-1">Product: {review.product?.name || 'N/A'} · {new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!review.isApproved && (
                      <button onClick={() => handleApproveReview(review._id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    <button onClick={() => handleDeleteReview(review._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {!reviews.length && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No reviews yet</p>
                </div>
              )}
            </div>
          )}

          {/* ─── CATEGORIES ─── */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="font-bold text-gray-800 text-base">Manage Categories</h3>
                <button 
                  onClick={() => { setEditingCategory(null); resetCategoryForm(); setShowCategoryForm(true); }} 
                  className="flex items-center gap-2 bg-brand-black text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-gold hover:text-brand-brown transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        {['Image', 'Category Name', 'Slug', 'Description', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {categories.map(c => (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            {c.image ? (
                              <img src={c.image} className="w-12 h-12 rounded-lg object-cover border border-gray-100" alt={c.name} />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">No Image</div>
                            )}
                          </td>
                          <td className="px-5 py-3 font-semibold text-gray-800">{c.name}</td>
                          <td className="px-5 py-3 font-mono text-xs text-gray-500">{c.slug}</td>
                          <td className="px-5 py-3 text-xs text-gray-400 max-w-xs truncate">{c.description || '—'}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEditCategory(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteCategory(c._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!categories.length && (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No categories found. Click Add Category to create one.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── COLLECTIONS ─── */}
          {activeTab === 'collections' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="font-bold text-gray-800 text-base">Manage Collections</h3>
                <button 
                  onClick={() => { resetCollectionForm(); setShowCollectionForm(true); }} 
                  className="flex items-center gap-2 bg-brand-black text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-gold hover:text-brand-brown transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Collection
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        {['Image', 'Collection Title', 'Tagline', 'Products Count', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {collections.map(c => (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            {c.image ? (
                              <img src={c.image} className="w-12 h-12 rounded-lg object-cover border border-gray-100" alt={c.title} />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">No Image</div>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-semibold text-gray-800">{c.title}</div>
                            <div className="text-[10px] text-gray-400 max-w-xs truncate">{c.description}</div>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500">{c.tagline}</td>
                          <td className="px-5 py-3 text-xs font-bold text-brand-maroon">{c.products ? c.products.length : 0} Products</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {c.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEditCollection(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleCollectionDelete(c._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!collections.length && (
                        <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No collections found. Click Add Collection to create one.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── INQUIRIES ─── */}
          {activeTab === 'inquiries' && (
            <div className="space-y-5">
              <h3 className="font-bold text-gray-800 text-base">Customer Inquiries</h3>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        {['Date', 'Customer Info', 'Subject & Message', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {inquiries.map(inquiry => (
                        <tr key={inquiry._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(inquiry.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-bold text-xs text-gray-800">{inquiry.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{inquiry.email}</p>
                            <p className="text-[10px] text-gray-400">{inquiry.mobile}</p>
                          </td>
                          <td className="px-5 py-3 max-w-md">
                            <p className="font-bold text-xs text-gray-800">{inquiry.subject}</p>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{inquiry.message}</p>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inquiry.isResolved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {inquiry.isResolved ? 'Resolved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {!inquiry.isResolved && (
                              <button 
                                onClick={() => handleResolveInquiry(inquiry._id)} 
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap border-none cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!inquiries.length && (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No inquiries found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── PRODUCT FORM MODAL ─── */}
      <AnimatePresence>
        {showProductForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowProductForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleProductSave} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Product Name *</label>
                    <input required value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="e.g. Premium Kaju Katli" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Category *</label>
                    <select required value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Product SKU *</label>
                    <div className="flex gap-2">
                      <input required value={productForm.sku} onChange={e => setProductForm(f => ({ ...f, sku: e.target.value }))} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="e.g. KAJU-101" />
                      <button
                        type="button"
                        onClick={() => {
                          if (productForm.name) {
                            const cleanName = productForm.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
                            const randomNum = Math.floor(100 + Math.random() * 900);
                            setProductForm(f => ({ ...f, sku: `${cleanName}-${randomNum}` }));
                          } else {
                            setProductForm(f => ({ ...f, sku: `PROD-${Math.floor(1000 + Math.random() * 9000)}` }));
                          }
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Price (₹) *</label>
                    <input required type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Discount Price (₹)</label>
                    <input type="number" value={productForm.discountPrice} onChange={e => setProductForm(f => ({ ...f, discountPrice: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="360" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Stock Qty *</label>
                    <input required type="number" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="100" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Weight Options</label>
                    <input value={productForm.weightOptions} onChange={e => setProductForm(f => ({ ...f, weightOptions: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="250g,500g,1kg" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Short Description *</label>
                    <input required value={productForm.shortDescription} onChange={e => setProductForm(f => ({ ...f, shortDescription: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="One-liner for product cards" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Full Description *</label>
                    <textarea required rows={3} value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none" placeholder="Detailed product description..." />
                  </div>
                  <div className="sm:col-span-2 flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={productForm.isFeatured} onChange={e => setProductForm(f => ({ ...f, isFeatured: e.target.checked }))} className="accent-brand-maroon w-4 h-4" />
                      <span className="text-sm font-medium text-gray-700">Featured Product</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={productForm.isBestSeller} onChange={e => setProductForm(f => ({ ...f, isBestSeller: e.target.checked }))} className="accent-brand-maroon w-4 h-4" />
                      <span className="text-sm font-medium text-gray-700">Best Seller</span>
                    </label>
                  </div>

                  {/* ── IMAGE SECTION ── */}
                  <div className="sm:col-span-2 space-y-3">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Product Images</label>

                    {/* Image Preview Grid */}
                    {(productForm.imageUrls.length > 0 || productForm.imageFiles.length > 0) && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {/* Existing URL images */}
                        {productForm.imageUrls.map((url, i) => (
                          <div key={`url-${i}`} className="relative group aspect-square">
                            <img src={url} alt={`img-${i}`} className="w-full h-full object-cover rounded-xl border border-gray-200" />
                            <button
                              type="button"
                              onClick={() => setProductForm(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {/* Local file previews */}
                        {productForm.imageFiles.map((file, i) => (
                          <div key={`file-${i}`} className="relative group aspect-square">
                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-xl border border-gray-200" />
                            <button
                              type="button"
                              onClick={() => setProductForm(f => ({ ...f, imageFiles: f.imageFiles.filter((_, idx) => idx !== i) }))}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload from device */}
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-brand-gold hover:bg-amber-50/30 transition-colors"
                    >
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={e => {
                          const files = Array.from(e.target.files || []);
                          setProductForm(f => ({ ...f, imageFiles: [...f.imageFiles, ...files] }));
                          e.target.value = '';
                        }}
                      />
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm font-medium">Click to upload images</p>
                        <p className="text-xs">PNG, JPG, WEBP up to 5 files</p>
                      </div>
                    </div>

                    {/* Paste image URL */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        placeholder="Or paste image URL (https://...)"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newImageUrl.trim()) {
                              setProductForm(f => ({ ...f, imageUrls: [...f.imageUrls, newImageUrl.trim()] }));
                              setNewImageUrl('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newImageUrl.trim()) {
                            setProductForm(f => ({ ...f, imageUrls: [...f.imageUrls, newImageUrl.trim()] }));
                            setNewImageUrl('');
                          }
                        }}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
                      >
                        Add URL
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">Images are shown on the product page. You can add up to 5. Hover a preview to remove it.</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowProductForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-brand-black text-white rounded-xl text-sm font-bold hover:bg-brand-gold hover:text-brand-brown transition-colors">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CATEGORY FORM MODAL ─── */}
      <AnimatePresence>
        {showCategoryForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-800">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                <button onClick={() => setShowCategoryForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCategorySave} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Category Name *</label>
                  <input required value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="e.g. Sweets" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Description</label>
                  <textarea rows={3} value={categoryForm.description} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none" placeholder="Category details..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Category Image</label>
                  
                  {/* Image Preview */}
                  {(categoryForm.image || categoryForm.imageUrl) && (
                    <div className="relative group w-24 h-24 aspect-square mb-2">
                      <img 
                        src={categoryForm.image ? URL.createObjectURL(categoryForm.image) : categoryForm.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-xl border border-gray-200" 
                      />
                      <button
                        type="button"
                        onClick={() => setCategoryForm(f => ({ ...f, image: null, imageUrl: '' }))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Upload button */}
                  <div
                    onClick={() => categoryImageInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-brand-gold hover:bg-amber-50/30 transition-colors"
                  >
                    <input
                      ref={categoryImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCategoryForm(f => ({ ...f, image: file, imageUrl: '' }));
                        }
                        e.target.value = '';
                      }}
                    />
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-xs font-medium">Click to upload cover image</p>
                    </div>
                  </div>

                  {/* Paste Image URL */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={categoryForm.imageUrl}
                      onChange={e => setCategoryForm(f => ({ ...f, imageUrl: e.target.value, image: null }))}
                      placeholder="Or paste cover image URL"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCategoryForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-brand-black text-white rounded-xl text-sm font-bold hover:bg-brand-gold hover:text-brand-brown transition-colors">
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── COLLECTION FORM MODAL ─── */}
      <AnimatePresence>
        {showCollectionForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h2 className="font-bold text-lg text-gray-800">{editingCollection ? 'Edit Collection' : 'Add New Collection'}</h2>
                <button onClick={() => setShowCollectionForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCollectionSave} className="p-6 space-y-4 overflow-y-auto flex-grow">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Collection Title *</label>
                  <input required value={collectionForm.title} onChange={e => setCollectionForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="e.g. Diwali Hamper Collection" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Tagline *</label>
                  <input required value={collectionForm.tagline} onChange={e => setCollectionForm(f => ({ ...f, tagline: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="e.g. Celebrate the Festival of Lights" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Description *</label>
                  <textarea required rows={3} value={collectionForm.description} onChange={e => setCollectionForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none" placeholder="Details about this collection..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Collection Cover Image</label>
                  
                  {/* Image Preview */}
                  {(collectionForm.imageFile || collectionForm.image) && (
                    <div className="relative group w-24 h-24 aspect-square mb-2">
                      <img 
                        src={collectionForm.imageFile ? URL.createObjectURL(collectionForm.imageFile) : collectionForm.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-xl border border-gray-200" 
                      />
                      <button
                        type="button"
                        onClick={() => setCollectionForm(f => ({ ...f, imageFile: null, image: '' }))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Upload button */}
                  <div
                    onClick={() => collectionImageInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-brand-gold hover:bg-amber-50/30 transition-colors"
                  >
                    <input
                      ref={collectionImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCollectionForm(f => ({ ...f, imageFile: file, image: '' }));
                        }
                        e.target.value = '';
                      }}
                    />
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-xs font-medium">Click to upload cover image</p>
                    </div>
                  </div>

                  {/* Paste Image URL */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={collectionForm.image}
                      onChange={e => setCollectionForm(f => ({ ...f, image: e.target.value, imageFile: null }))}
                      placeholder="Or paste cover image URL"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <input id="collection-active-checkbox" type="checkbox" checked={collectionForm.isActive} onChange={e => setCollectionForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
                  <label htmlFor="collection-active-checkbox" className="text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer">Is Active / Display on Home</label>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Select Products for Collection</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50">
                    {products.map(p => {
                      const isChecked = collectionForm.products.includes(p.id || p._id);
                      return (
                        <label key={p.id || p._id} className="flex items-center gap-3 text-xs text-gray-700 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => toggleProductInCollection(p.id || p._id)}
                            className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                          />
                          <span>{p.name} <span className="text-[10px] text-gray-400">({p.category})</span></span>
                        </label>
                      );
                    })}
                    {!products.length && (
                      <p className="text-center text-xs text-gray-400 py-4">No products found to add.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2 shrink-0">
                  <button type="button" onClick={() => setShowCollectionForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-brand-black text-white rounded-xl text-sm font-bold hover:bg-brand-gold hover:text-brand-brown transition-colors">
                    {editingCollection ? 'Save Changes' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
