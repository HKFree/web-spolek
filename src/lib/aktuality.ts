import { getCollection, type CollectionEntry } from 'astro:content';

export type Aktualita = CollectionEntry<'aktuality'>;

/** Všechny publikované aktuality, nejnovější první. */
export async function getAktuality(): Promise<Aktualita[]> {
  const all = await getCollection('aktuality', ({ data }) => (import.meta.env.PROD ? !data.draft : true));
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** "2025-12-22-ples-2026" -> "ples-2026" */
export const slugOf = (post: Aktualita) => post.id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
/** Aktualita jen s odkazem na Facebook (bez vlastního textu) nemá detail na webu. */
export const isFacebookOnly = (post: Aktualita) => !!post.data.facebook && !(post.body ?? '').trim();
export const urlOf = (post: Aktualita) => (isFacebookOnly(post) ? post.data.facebook! : `/aktuality/${slugOf(post)}/`);

const fmt = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
export const formatDate = (d: Date) => fmt.format(d);
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Krátký popis: frontmatter `description`, jinak začátek textu bez markdownu. */
export function excerptOf(post: Aktualita, max = 160): string {
  if (post.data.description) return post.data.description;
  const text = (post.body ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|~\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max)).replace(/[,.;:]$/, '') + '…';
}
