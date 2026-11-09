import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Jedna aktualita = jeden soubor src/content/aktuality/RRRR-MM-DD-nazev.md
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
      draft: z.boolean().default(false),
      // odkaz na příspěvek na Facebooku; bez textu vede karta rovnou na FB
      facebook: z.url().optional(),
      // původní adresa na starém WordPressu (pro přesměrování)
      legacyUrl: z.string().optional(),
    }),
});

export const collections = { aktuality };
