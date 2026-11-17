import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Obsah spravuje redakce (Keystatic, viz keystatic.config.ts); jde upravovat i ručně.

// Jedna aktualita = jeden soubor src/content/aktuality/nazev.md (starší mají v názvu i datum).
// Obrázky patří do složky se stejným názvem vedle souboru.
const aktuality = defineCollection({
  loader: glob({ base: './src/content/aktuality', pattern: '*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      author: z.string().optional(),
      // krátký popis do výpisu; když chybí, vezme se začátek textu
      description: z.string().optional(),
      // titulní obrázek do výpisu a na sociální sítě
      image: image().optional(),
      // id akce (src/content/akce), ke které aktualita patří
      akce: z.string().optional(),
      draft: z.boolean().default(false),
      // odkaz na příspěvek na Facebooku; bez textu vede karta rovnou na FB
      facebook: z.url().optional(),
    }),
});

// Karty akcí na úvodní stránce, src/content/akce/<id>.yaml
const akce = defineCollection({
  loader: glob({ base: './src/content/akce', pattern: '*.yaml' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number().default(10),
      since: z.string().optional(),
      text: z.string(),
      photo: image(),
      href: z.string().optional(),
      linkLabel: z.string().optional(),
    }),
});

// Technické projekty a bastlení, src/content/projekty/<id>.yaml
const projekty = defineCollection({
  loader: glob({ base: './src/content/projekty', pattern: '*.yaml' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number().default(10),
      year: z.string(),
      text: z.string(),
      photo: image(),
      // id aktuality o projektu
      post: z.string().optional(),
      link: z.string().optional(),
    }),
});

export const collections = { aktuality, akce, projekty };
