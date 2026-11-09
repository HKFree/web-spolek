// Generuje 301 přesměrování starých WordPress adres pro nginx.
// Containerfile soubor přesune z webrootu do /etc/nginx/ a nginx.conf ho includuje.
const STATIC: Record<string, string> = {
  '/stanovy-spolku-hkfree-org-platne-od-1-2-2025': '/kontakt/#dokumenty',
  '/zakladni-dokumenty': '/kontakt/#dokumenty',
  '/zakladni-dokumenty/stanovy': '/kontakt/#dokumenty',
  '/zakladni-dokumenty/gdpr': '/kontakt/#dokumenty',
  '/zakladni-dokumenty/pravidla-site': '/kontakt/#dokumenty',
  '/co-to-je-hkfree': '/#o-spolku',
  '/pozadavky-na-clena': '/#pridej-se',
  '/ples': '/#akce-ples',
  '/tabor': '/',
  '/druzstvo': 'https://druzstvo.hkfree.org/',
  '/chci-se-pripojit': 'https://druzstvo.hkfree.org/#pripojeni',
  '/helpline': 'https://druzstvo.hkfree.org/kontakt/',
  '/informacni-linka-a-linka-technicke-podpory-o-s-hkfree': 'https://druzstvo.hkfree.org/kontakt/',
  '/faq': 'https://druzstvo.hkfree.org/',
  '/category/novinky': '/aktuality/',
  '/feed': '/rss.xml',
};

export function GET() {
  const map = new Map(Object.entries(STATIC));
  const lines = [...map].map(([from, to]) => `location ~ ^${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$ { return 301 ${to}; }`);
  lines.push('location ~ ^/page/\\d+/?$ { return 301 /aktuality/; }');
  lines.push('location ~ ^/(date|author)/ { return 301 /aktuality/; }');
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
