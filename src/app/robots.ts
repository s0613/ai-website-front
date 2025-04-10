import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/my/',
        '/private/',
      ],
    },
    sitemap: 'https://localhost:3000/sitemap.xml',
  };
}