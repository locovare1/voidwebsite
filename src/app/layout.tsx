import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Void Esports",
  description: "Professional Esports Organization",
  icons: {
    icon: [
      { url: '/logos/favicon.ico' },
      { url: '/logos/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/logos/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/logos/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
