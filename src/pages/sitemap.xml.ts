import { getCollection } from 'astro:content';

export async function GET() {
  const library = await getCollection('library');

const entries = library.map(entry => `
    <url>
      <loc>https://otterlyomari.com/library/${entry.id}</loc>
      <lastmod>${entry.data.pubDate ? new Date(entry.data.pubDate).toISOString() : new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `).join('');

   const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://otterlyomari.com/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://otterlyomari.com/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://otterlyomari.com/gallery</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://otterlyomari.com/library</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    ${entries}
    </urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  });
}