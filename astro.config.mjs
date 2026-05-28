import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://otterlyomari.github.io',

  // IMPORTANT for Cloudflare Pages (static hosting)
  output: 'server',
  adapter: cloudflare(),

  // no base needed unless you're deploying under a subpath
  base: '/',

  integrations: [
    mdx(),
    sitemap(),
    icon({
      include: {
        bi: ['*'],
      },
    }),
    react(),
  ],
});