import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const pages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/dashboard', changefreq: 'weekly', priority: 0.8 },
    { url: '/auth/login', changefreq: 'monthly', priority: 0.6 },
    { url: '/auth/register', changefreq: 'monthly', priority: 0.6 },
    { url: '/landing-v3', changefreq: 'weekly', priority: 0.9 },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>https://your-domain.com${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};