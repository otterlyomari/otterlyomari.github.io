import { defineConfig } from 'astro/config';
import { createHtmlPlugin } from "vite-plugin-html";
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({

  site: 'https://otterlyomari.com',
  output: 'server',
  adapter: cloudflare(),

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
    icon({
      include: {
        bi: ['*'],
      },
    }),
    react(),
  ],
});