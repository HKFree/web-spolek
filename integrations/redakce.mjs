import react from '@astrojs/react';

// Redakce (Keystatic) a přihlášení. Routy se přidávají do vývojového serveru
// (npm run dev) a do serverového buildu (REDAKCE=server). Běžný build zůstává statický.
export default function redakce({ server = false } = {}) {
  return {
    name: 'hkfree-redakce',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, updateConfig }) => {
        if (command !== 'dev' && !server) return;
        updateConfig({
          integrations: [react()],
          // Keystatic volá adresy bez lomítka na konci (/api/keystatic/tree).
          trailingSlash: 'ignore',
          vite: { optimizeDeps: { entries: ['keystatic.config.ts', 'src/redakce/*.tsx'] } },
        });
        const route = (pattern, entrypoint) => injectRoute({ pattern, entrypoint, prerender: false });
        route('/keystatic', './src/redakce/keystatic.astro');
        route('/keystatic/[...params]', './src/redakce/keystatic.astro');
        route('/api/keystatic/[...params]', './src/redakce/api.ts');
        route('/api/redakce/status', './src/redakce/status.ts');
        route('/auth/login', './src/redakce/login.astro');
        route('/auth/logout', './src/redakce/logout.ts');
      },
    },
  };
}
