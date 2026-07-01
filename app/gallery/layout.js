export const metadata = {
  title: 'Our Sweets & Shop Gallery',
  description: 'Take a visual tour of Mahalaxmi Mithaiwala. Explore our handcrafted sweets, high-quality pure ingredients, traditional sweet-making processes, and shop ambiance.',
  openGraph: {
    title: 'Our Sweets & Shop Gallery | Mahalaxmi Mithaiwala',
    description: 'Take a visual tour of Mahalaxmi Mithaiwala. Explore our handcrafted sweets, high-quality pure ingredients, traditional sweet-making processes, and shop ambiance.',
    url: '/gallery',
  },
  alternates: {
    canonical: '/gallery',
  }
};

export default function GalleryLayout({ children }) {
  return <>{children}</>;
}
