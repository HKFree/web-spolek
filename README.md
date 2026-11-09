# spolek.hkfree.org

Web spolku hkfree.org z.s. Je to statický web v [Astro](https://astro.build) ve stejném designu jako
[druzstvo.hkfree.org](https://druzstvo.hkfree.org).

## Nová aktualita

Stačí přidat jeden soubor `src/content/aktuality/RRRR-MM-DD-nazev.md`:

```md
---
title: "Bruslení 2027"
date: 2027-01-15
author: "Jakub"
image: "./2027-01-15-brusleni-2027/plakat.jpg"   # nepovinné
---

Zveme vás na **bruslení zdarma**…

![Plakát](./2027-01-15-brusleni-2027/plakat.jpg)
```

- Adresa článku bude `/aktuality/nazev/` (název souboru bez data).
- Obrázky dejte do složky se stejným názvem jako soubor. Astro je při buildu samo zmenší a převede na WebP.
- `draft: true` skryje článek v produkci (v dev serveru je vidět).
- Nepovinné `description:` přepíše automatický úryvek ve výpisu.
- `facebook: "https://www.facebook.com/hkfree/posts/…"` připojí odkaz na příspěvek na FB.
  Když soubor nemá žádný text (jen hlavičku s `title`, `date`, `description` a `facebook`),
  karta ve výpisu vede rovnou na Facebook a vlastní stránka se negeneruje.

## Dokumenty

- **Přidat:** nahraj PDF do `public/dokumenty/` a přidej řádek do `DOKUMENTY` v `src/consts.ts`
  (`{ href: '/dokumenty/soubor.pdf', label: 'Název' }`).
- **Smazat:** odeber řádek z `DOKUMENTY` a smaž PDF z `public/dokumenty/`.

## Vývoj

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # výstup do dist/
```

## Kontejner

```sh
podman build -t spolek-web -f Containerfile .
podman run --rm -p 8080:80 spolek-web
```

Výsledkem je nginx:alpine se statikou na portu 80. Staré WordPress adresy (`/ples-2026-4240/` atd.) se přesměrují
přes 301 podle `legacyUrl` v aktualitách (`src/pages/nginx-redirects.conf.ts`).

## Kde co je

| co | kde |
|---|---|
| texty úvodní stránky | `src/pages/index.astro` |
| akce (ples, tábor, …) | `src/data/akce.ts` |
| podporované organizace | `src/data/podporujeme.json` |
| kontakty, IČ, účet, menu, dokumenty | `src/consts.ts` |
| PDF dokumenty | `public/dokumenty/` |
| fotky v hero a u akcí | `src/data/akce.ts` (`HERO_FOTKY`, `photo`) |
| design | `src/styles/druzstvo.css` (základ z družstva), `src/styles/spolek.css` (vlastní papírový vzhled spolku) |
