// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import node from '@astrojs/node';
import redakce from './integrations/redakce.mjs';
import gallery from './src/lib/gallery-plugin.mjs';

// REDAKCE=server sestaví Node server s redakcí (viz deploy/). Bez toho je výstup čistě statický.
const server = process.env.REDAKCE === 'server';
// Veřejná doména dev nasazení; Astro pak věří X-Forwarded-* hlavičkám od nginx.
const domain = process.env.PUBLIC_DOMAIN;

export default defineConfig({
  site: 'https://spolek.hkfree.org',
  trailingSlash: 'always',
  server: { host: true, port: 4321 },
  integrations: [redakce({ server })],
  markdown: { processor: satteri({ hastPlugins: [gallery] }) },
  ...(server && {
    adapter: node({ mode: 'standalone', bodySizeLimit: 32 * 1024 * 1024 }),
    security: {
      allowedDomains: [{ hostname: 'localhost' }, { hostname: '127.0.0.1' }, ...(domain ? [{ hostname: domain }] : [])],
    },
  }),
});
