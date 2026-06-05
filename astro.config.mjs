import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://otterlyomari.com',
  output: 'static',
  
  base: '/',

  vite: {
    build: {
      minify: 'esbuild',
    },
  },
  integrations: [
    mdx(),
    icon({
      include: {
        bi: ['*'],
      },
    }),
    react(),
    sitemap(),
  ],
});