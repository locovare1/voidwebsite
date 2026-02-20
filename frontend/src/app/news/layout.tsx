import type { Metadata } from 'next';

export const revalidate = 3600; // ISR: revalidate every hour

export const metadata: Metadata = {
  title: 'News • Void Esports',
  description: 'Latest updates, announcements, and achievements from Void Esports.',
  openGraph: {
    title: 'News • Void Esports',
    description: 'Latest updates, announcements, and achievements from Void Esports.',
    images: [{ url: '/logos/new-logo.png', width: 512, height: 512, alt: 'Void' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News • Void Esports',
    description: 'Latest updates, announcements, and achievements from Void Esports.',
    images: ['/logos/new-logo.png']
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
