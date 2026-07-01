export const metadata = {
  title: 'Sweets Collection',
  description: 'Explore our heritage catalog of luxury ghee sweets, soft milk pedas, and syrup-rich Bengali delicacies.',
  openGraph: {
    title: 'Sweets Collection | Mahalaxmi Mithaiwala',
    description: 'Explore our heritage catalog of luxury ghee sweets, soft milk pedas, and syrup-rich Bengali delicacies.',
    url: '/sweets',
  },
  alternates: {
    canonical: '/sweets',
  }
};

export default function SweetsLayout({ children }) {
  return <>{children}</>;
}
