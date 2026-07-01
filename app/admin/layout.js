export const metadata = {
  title: 'Admin Dashboard',
  description: 'Mahalaxmi Mithaiwala Admin Panel.',
  robots: {
    index: false,
    follow: false,
  }
};

export default function AdminLayout({ children }) {
  return <>{children}</>;
}
