import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdvancedPageTransition from "@/components/AdvancedPageTransition";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { ReviewProvider } from "@/contexts/ReviewContext";
import { DebugProvider } from "@/contexts/DebugContext";
// Removed LanguageProvider import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Void Esports",
  description: "Professional Esports Organization",
  metadataBase: new URL("https://voidwebsite-smoky.vercel.app"),
  icons: {
    icon: '/void.ico',
    apple: [
      { url: '/logos/apple-icon.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: "Void Esports",
    description: "Professional Esports Organization",
    url: "https://voidwebsite-smoky.vercel.app",
    siteName: "Void Esports",
    images: [
      { url: "/logos/icon-512.png", width: 512, height: 512, alt: "Void" },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Void Esports",
    description: "Professional Esports Organization",
    images: ["/logos/icon-512.png"],
  },
  manifest: "/manifest.webmanifest",
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Only load Google Ads in browser environment */}
        {typeof window !== 'undefined' && (
          <Script
            id="google-ads"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3190492570821815"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* Removed LanguageProvider */}
        <OrderProvider>
          <CartProvider>
            <ReviewProvider>
              <GlobalErrorBoundary>
                <AdvancedPageTransition>
                  <ScrollToTop />
                  <Navbar />
                  <main className="min-h-screen bg-gray-900">{children}</main>
                  <Footer />
                </AdvancedPageTransition>
              </GlobalErrorBoundary>
            </ReviewProvider>
          </CartProvider>
        </OrderProvider>
      </body>
    </html>
  );
}