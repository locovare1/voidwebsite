import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdvancedPageTransition from "@/components/AdvancedPageTransition";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Void Esports",
  description: "Professional Esports Organization",
  icons: {
    icon: '/void.ico',
    apple: [
      { url: '/logos/apple-icon.png', sizes: '180x180' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        id="google-ads"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3190492570821815"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <body className={inter.className} suppressHydrationWarning>
        <GlobalErrorBoundary>
          <AdvancedPageTransition>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </AdvancedPageTransition>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
