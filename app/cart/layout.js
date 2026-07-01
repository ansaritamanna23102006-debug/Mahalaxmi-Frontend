export const metadata = {
  title: 'Shopping Cart',
  description: 'Review the items in your shopping cart before proceeding to checkout at Mahalaxmi Mithaiwala.',
  robots: {
    index: false,
    follow: false,
  }
};

export default function CartLayout({ children }) {
  return <>{children}</>;
}
