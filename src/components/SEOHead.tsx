"use client";

import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export default function SEOHead({
  title = "Void Esports - Professional Gaming Organization",
  description = "Professional esports organization dedicated to excellence in competitive gaming.",
  keywords = ["esports", "gaming", "competitive", "fortnite", "valorant"],
  image = "/logo.png",
  url = "https://www.voidesports.org",
  type = "website"
}: SEOHeadProps) {
  const fullTitle = title.includes('Void Esports') ? title : `${title} | Void Esports`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="Void Esports" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Void Esports" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@VoidEsports2x" />
      
      {/* Additional Meta */}
      <meta name="theme-color" content="#0F0F0F" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Void Esports",
            "url": "https://www.voidesports.org",
            "logo": "https://www.voidesports.org/logo.png",
            "description": description,
            "sameAs": [
              "https://twitter.com/VoidEsports2x",
              "https://discord.gg/voidesports2x",
              "https://www.twitch.tv/voidfrankenstein",
              "https://www.youtube.com/@VoidEsports1x",
              "https://www.instagram.com/voidesports2x/"
            ]
          })
        }}
      />
    </Head>
  );
}