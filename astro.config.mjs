import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import metaTags from "astro-meta-tags";
import react from "@astrojs/react";

import qwikdev from "@qwikdev/astro";

// https://astro.build/config
export default defineConfig({
  site: 'https://otterlyomari.github.io',
  integrations: [mdx(), sitemap(), icon({
    include: {
      // Include all brand icons
      bi: ['*']
    }
  }), metaTags(), react(), qwikdev()]
});