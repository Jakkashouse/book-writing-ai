import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/payment/success', '/payment/fail', '/dashboard', '/profile', '/admin'],
      },
    ],
    sitemap: 'https://expert-workbook.vercel.app/sitemap.xml',
    host: 'https://expert-workbook.vercel.app',
  };
}
