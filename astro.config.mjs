import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: 'https://otterlyomari.github.io',
  base: '/',
  
  integrations: [mdx(), sitemap(), icon({
    include: {
      // Include all brand icons
      bi: ['*']
    }
  }),  react()]
});