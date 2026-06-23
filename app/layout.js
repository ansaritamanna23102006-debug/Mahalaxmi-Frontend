import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Mahalaxmi Mithaiwala | Premium Sweets & Farsan Since 1982 | Mumbai",
  description: "Serving Mumbai with premium sweets, farsan, gift boxes, and festive collections for over four decades. Handcrafted with traditional recipes since 1982.",
  keywords: "Mahalaxmi Mithaiwala, Kurla sweets shop, Indian sweets Mumbai, premium farsan, Diwali sweet boxes, traditional mithai, corporate gift boxes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo.svg" />
      </head>
      <body className="antialiased min-h-screen bg-brand-bg text-brand-text">
        {children}
      </body>
    </html>
  );
}
