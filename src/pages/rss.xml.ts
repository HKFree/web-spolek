import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAktuality, urlOf, excerptOf } from '../lib/aktuality';

export async function GET(context: APIContext) {
  const posts = await getAktuality();
  return rss({
    title: 'Aktuality hkfree.org z.s.',
    description: 'Zprávy a pozvánky na akce spolku hkfree.org z Hradce Králové.',
    site: context.site!,
    items: posts.slice(0, 30).map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: excerptOf(p, 300),
      link: urlOf(p),
    })),
    customData: '<language>cs</language>',
  });
}
