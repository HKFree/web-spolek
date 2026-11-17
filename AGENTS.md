# AGENTS.md

Web spolku hkfree.org z.s. Statický web v Astro 7, výstup servíruje nginx v kontejneru na portu 80.

## Příkazy

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # výstup do dist/, vždy ověř před commitem
```

## Struktura

- `src/content/aktuality/nazev.md` (starší `RRRR-MM-DD-nazev.md`): jedna aktualita = jeden soubor, obrázky ve složce se stejným názvem. Schéma je v `src/content.config.ts`.
- `src/content/akce/`, `src/content/projekty/`: karty na úvodu (YAML + fotky ve složce se stejným názvem).
- `keystatic.config.ts`: formuláře redakce (Keystatic na `/keystatic`). Při změně schématu uprav i `src/content.config.ts`.
- `src/redakce/`, `integrations/redakce.mjs`, `src/middleware.ts`: stránky redakce a přihlášení (`AUTH_MODE`: dev / password / oidc zatím chybí).
- `compose.yaml`, `deploy/redakce/`: dev nasazení s redakcí (`REDAKCE=server` build, publikace commit → build → přepnutí → push).
- `src/pages/`: stránky (úvod, aktuality, podporujeme, dílna, kontakt, 404, RSS).
- `src/consts.ts`: kontakty, menu.
- `src/data/`: podporované organizace a dokumenty (JSON, spravuje redakce), fotky v hero.
- `src/styles/druzstvo.css`: základ převzatý z druzstvo.hkfree.org (neupravovat). Úpravy patří do `src/styles/spolek.css`.
- `public/dokumenty/`: PDF dokumenty.
- Markdown zpracovává Sätteri (výchozí v Astro 7); pluginy jsou `defineHastPlugin`/`defineMdastPlugin`, ne remark/rehype. Galerie: `src/lib/gallery-plugin.mjs`.
- `inspo/`: lokální podklady, nejsou v gitu.

## Pravidla

- Texty jsou česky a tykají.
- Internet a technická podpora patří družstvu (druzstvo.hkfree.org), ne spolku.
- Nic si nevymýšlej: roky a fakta ověřuj v aktualitách.
- Commit zprávy krátké (max. par slov), česky. Commituj jen na požádání.
- Bez dotazu neměň logo (původní „community network“), nadpis v hero ani schválené texty.
- Na `main` nikdy nedělej force push bez výslovného svolení.
