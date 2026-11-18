# spolek.hkfree.org

Web spolku hkfree.org z.s. Je to statický web v [Astro](https://astro.build) ve stejném designu jako
[druzstvo.hkfree.org](https://druzstvo.hkfree.org).

## Redakce (Keystatic)

Obsah jde upravovat v prohlížeči přes [Keystatic](https://keystatic.com) na `/keystatic`: aktuality, akce,
projekty, dílna, podporované organizace a dokumenty. Víc obrázků pod sebou bez textu se zobrazí jako galerie.
Běžný build (`npm run build`, `Containerfile`) redakci neobsahuje.

**Lokálně:** `npm run dev`, pak http://localhost:4321/keystatic. Stačí jméno a e-mail, změny se ukládají
do souborů v repozitáři a commituješ je sám.

### Dev nasazení

```sh
cp .env.example .env    # nastav ADMIN_PASSWORD
docker compose build --progress=plain
docker compose up -d
```

- `redakce` (Node + Keystatic) drží obsah v git repozitáři ve volume `repo`. Po uložení commitne
  (autor = redaktor), sestaví web, přepne ho ve volume `www` a případně pushne na GitHub.
- `web` (nginx) servíruje statiku a redakci proxuje.

První build trvá na pomalém serveru několik minut, nepřerušuj ho. Stav zveřejnění je vidět v liště redakce,
podrobnosti v `docker compose logs redakce`. Když build selže, na webu zůstane poslední verze.

**Přihlášení** (`AUTH_MODE`): `password` = jméno, e-mail a `ADMIN_PASSWORD`; `dev` = bez hesla, jen pro
uzavřenou síť. Bez nastavení je redakce zavřená.

**Za Apache s HTTPS:** `WEB_PORT=127.0.0.1:8080`, `PUBLIC_DOMAIN=<doména>` (bez něj redakce vrací 403)
a VirtualHost podle [`deploy/redakce/apache2.conf`](deploy/redakce/apache2.conf). `PUBLIC_DOMAIN` se použije
při buildu, po změně znovu `docker compose up -d --build`.

**Záloha na GitHub:** bez `GIT_REMOTE` zůstává historie jen ve volume. Jinak nastav `GIT_REMOTE`,
`GIT_PUSH=true` a deploy klíč s právem zápisu (větev `GIT_BRANCH` se případně založí):

```sh
ssh-keygen -t ed25519 -f deploy-key -N '' -C 'redakce web-spolek'
# deploy-key.pub: GitHub → Settings → Deploy keys → Allow write access
```

V `compose.yaml` odkomentuj `./deploy-key` a v `.env` nastav `GIT_SSH_COMMAND`. Před pushem se dělá
`git pull --rebase`, takže změny webu z GitHubu se dostanou do dalšího buildu. Změny redakce samotné
(`keystatic.config.ts`, `src/redakce/`) vyžadují `docker compose up -d --build`.

Volume `repo` nemaž, dokud změny nejsou na GitHubu. Po restartu se redaktoři přihlásí znovu.

### OIDC (hkfree účty)

Zatím chybí, `AUTH_MODE=oidc` redakci zavře. Doplní se `/auth/login` a `/auth/callback` v `src/redakce/`
(viz [web-druzstvo](https://github.com/HKFree/web-druzstvo)), které zavolají stávající `login()`.

## Ruční úpravy

Všechno jde upravit i bez redakce přímo v souborech.

### Nová aktualita

Stačí přidat jeden soubor `src/content/aktuality/nazev.md`:

```md
---
title: "Bruslení 2027"
date: 2027-01-15
author: "Jakub"
image: "./brusleni-2027/plakat.jpg"   # nepovinné
akce: brusleni                        # nepovinné, id akce ze src/content/akce/
---

Zveme vás na **bruslení zdarma**…

![Plakát](./brusleni-2027/plakat.jpg)
```

- Adresa článku bude `/aktuality/nazev/` (datum v názvu starších souborů se vynechá). Duplicitní adresa shodí build.
- Obrázky dej do složky se stejným názvem jako soubor. Astro je při buildu samo zmenší a převede na WebP.
- Odstavec jen z obrázků (aspoň dvou) se zobrazí jako galerie.
- `draft: true` skryje článek v produkci (v dev serveru je vidět).
- Nepovinné `description:` přepíše automatický úryvek ve výpisu.
- `facebook: "https://www.facebook.com/hkfree/posts/…"` připojí odkaz na příspěvek na FB.
  Když soubor nemá žádný text (jen hlavičku s `title`, `date`, `description` a `facebook`),
  karta ve výpisu vede rovnou na Facebook a vlastní stránka se negeneruje.

### Dokumenty

- **Přidat:** nahraj PDF do `public/dokumenty/` a přidej položku do `src/data/dokumenty.json`
  (`{ "label": "Název", "file": "/dokumenty/soubor.pdf" }`).
- **Smazat:** odeber položku z `src/data/dokumenty.json` a smaž PDF z `public/dokumenty/`.

## Vývoj

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # výstup do dist/
```

## Kontejner

Docker:

```sh
docker build -t spolek-web -f Containerfile .
docker run --rm -p 8080:80 spolek-web
```

Podman:

```sh
podman build -t spolek-web -f Containerfile .
podman run --rm -p 8080:80 spolek-web
```

Web pak běží na http://localhost:8080.

Výsledkem je nginx:alpine se statikou na portu 80. Hlavní stránky starého webu (`/zakladni-dokumenty/`, `/ples/` atd.)
se přesměrují přes 301 podle `src/pages/nginx-redirects.conf.ts`.

## Kde co je

| co | kde |
|---|---|
| texty úvodní stránky | `src/pages/index.astro` |
| akce (ples, bruslení, …) | `src/content/akce/*.yaml` (fotky ve složce se stejným názvem) |
| projekty a bastlení | `src/content/projekty/*.yaml` |
| dílna a coworking (stránka i sekce na úvodu) | `src/content/dilna.md` |
| podporované organizace | `src/data/podporujeme.json` |
| dokumenty | `src/data/dokumenty.json`, PDF v `public/dokumenty/` |
| kontakty, IČ, účet, menu | `src/consts.ts` |
| fotky v hero | `src/data/hero.ts`, `src/assets/hero/` |
| redakce | `keystatic.config.ts`, `src/redakce/`, `integrations/redakce.mjs` |
| dev nasazení | `compose.yaml`, `deploy/redakce/`, `.env.example` |
| design | `src/styles/druzstvo.css` (základ z družstva), `src/styles/spolek.css` (vlastní papírový vzhled spolku) |
