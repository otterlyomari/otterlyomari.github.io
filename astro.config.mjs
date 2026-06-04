import { defineConfig } from 'astro/config';
import { createHtmlPlugin } from 'vite-plugin-html';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://otterlyomari.com',
  output: 'server',
  adapter: cloudflare({
    mode: 'advanced',
  }),

  vite: {
    plugins: [
      createHtmlPlugin({
        minify: true,
      }),
    ],
    build: {
      minify: 'esbuild',
      rollupOptions: {
        external: [],  // Force everything to bundle
      },
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
  ],
});