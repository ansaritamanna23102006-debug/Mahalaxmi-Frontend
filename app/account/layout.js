export const metadata = {
  title: 'My Account',
  description: 'Manage your profile, view orders, and manage wishlists at Mahalaxmi Mithaiwala.',
  robots: {
    index: false,
    follow: false,
  }
};

export default function AccountLayout({ children }) {
  return <>{children}</>;
}
