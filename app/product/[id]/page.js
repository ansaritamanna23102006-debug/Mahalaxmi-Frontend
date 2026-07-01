import ProductDetailClient from '@/components/ProductDetailClient';
import { api } from '@/utils/api';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const idOrSlug = resolvedParams.id;
  try {
    const product = await api.products.getBySlugOrId(idOrSlug);
    return {
      title: `${product.name} | Mahalaxmi Mithaiwala`,
      description: product.description || `Buy fresh ${product.name} online from Mahalaxmi Mithaiwala. Premium quality sweets handcrafted in Mumbai since 1982.`,
      openGraph: {
        title: `${product.name} | Mahalaxmi Mithaiwala`,
        description: product.description,
        images: [{ url: product.images?.[0] || '/hero_sweets.jpg' }],
      },
    };
  } catch (e) {
    return {
      title: 'Product Details | Mahalaxmi Mithaiwala',
    };
  }
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  return <ProductDetailClient id={id} />;
}
