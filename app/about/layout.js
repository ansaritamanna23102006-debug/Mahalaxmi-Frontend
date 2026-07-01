export const metadata = {
  title: 'About Us',
  description: 'Learn about Mahalaxmi Mithaiwala, our heritage, core values, and the legacy of traditional sweet-making in Mumbai since 1982.',
  openGraph: {
    title: 'About Us | Mahalaxmi Mithaiwala',
    description: 'Learn about Mahalaxmi Mithaiwala, our heritage, core values, and the legacy of traditional sweet-making in Mumbai since 1982.',
    url: '/about',
  },
  alternates: {
    canonical: '/about',
  }
};

export default function AboutLayout({ children }) {
  return <>{children}</>;
}
