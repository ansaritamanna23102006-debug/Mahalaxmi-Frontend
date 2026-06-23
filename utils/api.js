// API client helper for Mahalaxmi Mithaiwala Ecommerce Backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Get or generate a guest session ID for guest carts
export const getOrCreateGuestId = () => {
  if (typeof window === 'undefined') return '';
  let guestId = localStorage.getItem('mahalaxmi-guest-id');
  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('mahalaxmi-guest-id', guestId);
  }
  return guestId;
};

// Generic fetch handler supporting JSON payload stringification, JWT headers, and guest headers
async function apiFetch(endpoint, options = {}) {
  const guestId = getOrCreateGuestId();
  const token = typeof window !== 'undefined' ? localStorage.getItem('mahalaxmi-token') : null;

  const headers = {
    'x-guest-id': guestId,
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type only if it's not a FormData upload
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    cache: 'no-store',
    ...options,
    headers
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = { message: text };
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('mahalaxmi-token');
      localStorage.removeItem('mahalaxmi-user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  // Authentication APIs
  auth: {
    login: async (email, password) => {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      if (data.accessToken) {
        localStorage.setItem('mahalaxmi-token', data.accessToken);
        localStorage.setItem('mahalaxmi-user', JSON.stringify(data.user));
      }
      return data;
    },
    register: async (fullName, email, mobileNumber, password) => {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: { fullName, email, mobileNumber, password }
      });
      if (data.accessToken) {
        localStorage.setItem('mahalaxmi-token', data.accessToken);
        localStorage.setItem('mahalaxmi-user', JSON.stringify(data.user));
      }
      return data;
    },
    logout: async () => {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } catch (e) {
        // ignore
      }
      localStorage.removeItem('mahalaxmi-token');
      localStorage.removeItem('mahalaxmi-user');
    },
    getProfile: () => apiFetch('/auth/me'),
    updateProfile: (formData) => apiFetch('/auth/me', {
      method: 'PUT',
      body: formData // accepts FormData containing profile photo
    }),
    changePassword: (currentPassword, newPassword) => apiFetch('/auth/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword }
    })
  },

  // Products and Collections
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          query.append(key, params[key]);
        }
      });
      const queryString = query.toString();
      return apiFetch(`/products?${queryString}`);
    },
    getBySlugOrId: async (idOrSlug) => {
      // First try to fetch by slug, if not found or format is id, the backend handles it.
      // We will hit getBySlug endpoint first
      try {
        const res = await apiFetch(`/products/slug/${idOrSlug}`);
        return res.product;
      } catch (e) {
        // Fallback or retry? Let's query catalog filters
        const res = await apiFetch(`/products?search=${idOrSlug}`);
        if (res.products && res.products.length > 0) {
          return res.products[0];
        }
        throw e;
      }
    },
    getFeatured: () => apiFetch('/products/featured'),
    getBestSellers: () => apiFetch('/products/bestsellers'),
    getFestival: () => apiFetch('/products/festival'),
    getRelated: (slug) => apiFetch(`/products/related/${slug}`),
    getReviews: (productId) => apiFetch(`/reviews/product/${productId}`),
    submitReview: (reviewData) => apiFetch('/reviews', {
      method: 'POST',
      body: reviewData
    })
  },

  // Cart Management
  cart: {
    get: (couponCode) => {
      const query = couponCode ? `?couponCode=${couponCode}` : '';
      return apiFetch(`/cart${query}`);
    },
    save: (items, couponCode) => apiFetch('/cart', {
      method: 'POST',
      body: { items, couponCode }
    }),
    add: (productId, quantity, weight, couponCode) => apiFetch('/cart/add', {
      method: 'POST',
      body: { productId, quantity, weight, couponCode }
    }),
    update: (productId, weight, quantity, newWeight, couponCode) => apiFetch('/cart/quantity', {
      method: 'PUT',
      body: { productId, weight, quantity, newWeight, couponCode }
    }),
    remove: (productId, weight, couponCode) => apiFetch('/cart/remove', {
      method: 'DELETE',
      body: { productId, weight, couponCode }
    })
  },

  // Wishlist Management
  wishlist: {
    get: () => apiFetch('/wishlist'),
    add: (productId) => apiFetch('/wishlist/add', {
      method: 'POST',
      body: { productId }
    }),
    remove: (productId) => apiFetch('/wishlist/remove', {
      method: 'DELETE',
      body: { productId }
    })
  },

  // Address Management
  addresses: {
    get: () => apiFetch('/addresses'),
    add: (addressData) => apiFetch('/addresses', {
      method: 'POST',
      body: addressData
    }),
    update: (id, addressData) => apiFetch(`/addresses/${id}`, {
      method: 'PUT',
      body: addressData
    }),
    delete: (id) => apiFetch(`/addresses/${id}`, {
      method: 'DELETE'
    })
  },

  // Coupon Validation
  coupon: {
    validate: (code, orderAmount) => apiFetch('/coupons/validate', {
      method: 'POST',
      body: { code, orderAmount }
    })
  },

  // Order Placement and Checkouts
  orders: {
    create: (orderData) => apiFetch('/orders', {
      method: 'POST',
      body: orderData
    }),
    verifyPayment: (paymentData) => apiFetch('/orders/verify-payment', {
      method: 'POST',
      body: paymentData
    }),
    getMyOrders: () => apiFetch('/orders/my-orders'),
    track: (orderId, email) => apiFetch(`/orders/track?orderId=${orderId}&email=${email}`)
  },

  // General Forms and Newsletter
  contact: {
    submit: (contactData) => apiFetch('/contact', {
      method: 'POST',
      body: contactData
    })
  },
  newsletter: {
    subscribe: (email) => apiFetch('/newsletter/subscribe', {
      method: 'POST',
      body: { email }
    })
  },

  // Reviews (global listing for testimonials etc.)
  reviews: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          query.append(key, params[key]);
        }
      });
      return apiFetch(`/reviews?${query.toString()}`);
    }
  },

  // Dynamic Category Management
  categories: {
    getAll: () => apiFetch('/categories'),
    create: (formData) => apiFetch('/categories', {
      method: 'POST',
      body: formData
    }),
    update: (id, formData) => apiFetch(`/categories/${id}`, {
      method: 'PUT',
      body: formData
    }),
    delete: (id) => apiFetch(`/categories/${id}`, {
      method: 'DELETE'
    })
  },

  // Dynamic Collection Management
  collections: {
    getAll: () => apiFetch('/collections'),
    getOne: (id) => apiFetch(`/collections/${id}`),
    create: (data) => apiFetch('/collections', {
      method: 'POST',
      body: data
    }),
    update: (id, data) => apiFetch(`/collections/${id}`, {
      method: 'PUT',
      body: data
    }),
    delete: (id) => apiFetch(`/collections/${id}`, {
      method: 'DELETE'
    })
  }
};
