// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://spolek.hkfree.org',
  trailingSlash: 'always',
  server: { host: true, port: 4321 },
});
