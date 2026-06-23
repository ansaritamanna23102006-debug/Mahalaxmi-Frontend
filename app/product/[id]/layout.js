import { api } from '@/utils/api';

export async function generateMetadata({ params }) {
  // Access params safely by awaiting it if needed, but in Next.js 13 layout it's available directly.
  // Next.js 15 might require awaiting params. We'll extract safely.
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    const product = await api.products.getBySlugOrId(id);
    if (!product) return { title: 'Product Not Found' };
    
    return {
      title: `${product.name}`, // The template in root layout adds " | Mahalaxmi Mithaiwala"
      description: product.description?.slice(0, 160) || `Buy premium ${product.name} from Mahalaxmi Mithaiwala.`,
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160),
        images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      },
      alternates: {
        canonical: `/product/${product.slug || product._id}`,
      }
    };
  } catch (error) {
    return {
      title: 'Premium Sweets',
    };
  }
}

export default async function ProductLayout({ children, params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  let product = null;
  try {
    product = await api.products.getBySlugOrId(id);
  } catch (error) {
    // Silently continue; client-side component will display the error if it fails to load
  }

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": product.name,
              "image": product.images || [],
              "description": product.description,
              "sku": product.sku || product._id,
              "brand": {
                "@type": "Brand",
                "name": "Mahalaxmi Mithaiwala"
              },
              "offers": {
                "@type": "Offer",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/product/${product.slug || product._id}`,
                "priceCurrency": "INR",
                "price": product.discountPrice || product.price,
                "availability": product.stock !== 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "itemCondition": "https://schema.org/NewCondition"
              },
              ...(product.ratings ? {
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": product.ratings,
                  "reviewCount": product.reviewsCount || 1
                }
              } : {})
            })
          }}
        />
      )}
      {children}
    </>
  );
}
