import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

export const metadata: Metadata = {
  title: {
    default: "Void Esports - Professional Gaming Organization",
    template: "%s | Void Esports"
  },
  description: "Professional esports organization dedicated to excellence in competitive gaming. Home to elite teams across multiple gaming titles.",
  keywords: ["esports", "gaming", "competitive", "fortnite", "valorant", "professional gaming"],
  authors: [{ name: "Void Esports" }],
  creator: "Void Esports",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.voidesports.org",
    siteName: "Void Esports",
    title: "Void Esports - Professional Gaming Organization",
    description: "Professional esports organization dedicated to excellence in competitive gaming.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Void Esports Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Void Esports - Professional Gaming Organization",
    description: "Professional esports organization dedicated to excellence in competitive gaming.",
    creator: "@VoidEsports2x",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/void.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0F0F0F" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="antialiased bg-[#0F0F0F] text-white">
        <ErrorBoundary>
          <ScrollRevealProvider />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}