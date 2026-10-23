// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { legacyRedirects } from './src/legacy-redirects.mjs';

// https://astro.build/config
export default defineConfig({
  site: "https://onesmiledentalcare.com",
  base: "/",
  trailingSlash: "always",
  // Static hosting emits immediate HTML redirects rather than HTTP 301s.
  redirects: legacyRedirects,
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap({
    filter: (page) => !Object.hasOwn(legacyRedirects, new URL(page).pathname)
  })]
});
