import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://voidwebsite-smoky.vercel.app';
  const routes = ['/', '/about', '/news', '/placements', '/teams', '/shop', '/contact', '/ambassadors', '/schedule', '/careers', '/live-stream'];
  const now = new Date();
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
