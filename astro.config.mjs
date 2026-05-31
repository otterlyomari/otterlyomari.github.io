import { defineConfig } from 'astro/config';
import { createHtmlPlugin } from "vite-plugin-html";
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

  vite: {
    plugins: [
      createHtmlPlugin({
        minify: true
      })
    ],
    build: {
      minify: "esbuild"
    }
  },

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