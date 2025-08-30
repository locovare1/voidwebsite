import type { Metadata } from 'next';

export const revalidate = 3600; // ISR: revalidate every hour

export const metadata: Metadata = {
  title: 'Recent Placements • Void Esports',
  description: 'Explore recent placements and achievements across our esports teams.',
  openGraph: {
    title: 'Recent Placements • Void Esports',
    description: 'Explore recent placements and achievements across our esports teams.',
    images: [{ url: '/logos/icon-512.png', width: 512, height: 512, alt: 'Void' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recent Placements • Void Esports',
    description: 'Explore recent placements and achievements across our esports teams.',
    images: ['/logos/icon-512.png'],
  },
};

export default function PlacementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
