import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import metaTags from "astro-meta-tags";
import react from "@astrojs/react";
import qwikdev from "@qwikdev/astro";

import jopSoftwarecookieconsent from "@jop-software/astro-cookieconsent";

// https://astro.build/config
export default defineConfig({
  site: 'https://otterlyomari.github.io',
  integrations: [mdx(), sitemap(), icon({
    include: {
      // Include all brand icons
      bi: ['*']
    }
  }), metaTags(), react(), qwikdev(),
    jopSoftwarecookieconsent({
      // ...
      guiOptions: {
        consentModal: {
          layout: 'cloud',
          position: 'bottom center',
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "box",
          position: "right",
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      // ...
  })]
});