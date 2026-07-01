import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "Mahalaxmi Mithaiwala | Premium Sweets & Farsan",
    template: "%s | Mahalaxmi Mithaiwala"
  },
  description: "Serving Mumbai with premium sweets, farsan, gift boxes, and festive collections for over four decades. Handcrafted with traditional recipes since 1982.",
  keywords: "Mahalaxmi Mithaiwala, Kurla sweets shop, Indian sweets Mumbai, premium farsan, Diwali sweet boxes, traditional mithai, corporate gift boxes",
  openGraph: {
    title: "Mahalaxmi Mithaiwala | Premium Sweets & Farsan",
    description: "Serving Mumbai with premium sweets, farsan, gift boxes, and festive collections for over four decades.",
    url: '/',
    siteName: 'Mahalaxmi Mithaiwala',
    images: [
      {
        url: '/hero_sweets.png',
        width: 1200,
        height: 630,
        alt: 'Mahalaxmi Mithaiwala Premium Sweets',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mahalaxmi Mithaiwala | Premium Sweets & Farsan",
    description: "Serving Mumbai with premium sweets, farsan, gift boxes, and festive collections for over four decades.",
    images: ['/hero_sweets.png'],
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="antialiased min-h-screen bg-brand-bg text-brand-text">
        {children}
      </body>
    </html>
  );
}
