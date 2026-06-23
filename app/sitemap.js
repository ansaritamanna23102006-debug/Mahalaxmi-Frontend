import { api } from '@/utils/api';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/sweets',
    '/farsan',
    '/categories',
    '/contact',
    '/festive-offers',
    '/gallery'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic product routes
  let products = [];
  try {
    const data = await api.products.getAll({ limit: 1000 });
    if (data && data.products) {
      products = data.products;
    }
  } catch (error) {
    console.warn('Sitemap dynamic product fetch failed:', error.message);
  }

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug || product._id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
