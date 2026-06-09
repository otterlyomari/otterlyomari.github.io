import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import playformCompress from '@playform/compress';

import purgecss from 'astro-purgecss';
import remarkSlug from "remark-slug";
import remarkAutolinkHeadings from "remark-autolink-headings";

export default defineConfig({
  site: 'https://otterlyomari.com',
  output: 'static',
  
  base: '/',

  vite: {
    build: {
      minify: 'esbuild',
      cssCodeSplit: false,
    },
  },
  markdown: {
    remarkPlugins: [
      remarkSlug,
      [
        remarkAutolinkHeadings,
        {
          behavior: "wrap"
        }
      ]
    ]
  },
  integrations: [mdx(), icon({
    include: {
      bi: ['*'],
    },
  }), react(), sitemap(), playformCompress(), purgecss()]
});