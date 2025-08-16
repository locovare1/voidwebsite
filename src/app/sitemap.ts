import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.voidesports.org';
  
  const routes = [
    '',
    '/about',
    '/teams',
    '/news',
    '/shop',
    '/placements',
    '/schedule',
    '/live-stream',
    '/ambassadors',
    '/careers',
    '/contact'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}