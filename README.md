# spolek.hkfree.org

Web spolku hkfree.org z.s. Je to statický web v [Astro](https://astro.build) ve stejném designu jako
[druzstvo.hkfree.org](https://druzstvo.hkfree.org).

## Redakce (Keystatic)

Obsah webu jde upravovat v prohlížeči přes [Keystatic](https://keystatic.com) na `/keystatic`.

- **Aktuality:** název, datum, autor, krátký popis, titulní obrázek, akce, odkaz na Facebook, koncept a text.
  Víc obrázků vložených pod sebe bez textu mezi nimi se zobrazí jako galerie.
- **Akce** a **Projekty:** karty na úvodní stránce (fotka, popis, pořadí). Aktualita se ke kartě akce
  přiřadí polem „Patří k akci“, projekt odkazuje na vybranou aktualitu.
- **Podporujeme:** oblasti a organizace na stránce `/podporujeme/` a na úvodu.
- **Dokumenty:** seznam PDF (nahrávají se do `public/dokumenty/`). Pořadí měníš přetažením.

Běžný build (`npm run build`, `Containerfile`) redakci neobsahuje, výsledek je dál čistě statický.

### Lokálně

`npm run dev` a otevři http://localhost:4321/keystatic. Stačí vyplnit jméno a e-mail, nic se neověřuje.
Redakce ukládá přímo do souborů v repozitáři, změny pak commitni sám.

### Dev nasazení (docker compose)

Pro testování s dalšími lidmi na serveru. Spustí dva kontejnery:

- `redakce`: Node server s Keystaticem. Obsah drží v git repozitáři ve volume `repo`. Po každém uložení
  (s pauzou 3 s pro další změny) udělá commit s redaktorem jako autorem, sestaví web
  (asi 10 s) a atomicky ho přepne ve volume `www`. Volitelně pushne na GitHub.
- `web`: nginx, servíruje statiku z `www` a `/keystatic`, `/api/keystatic`, `/auth/` předává redakci.

```sh
cp .env.example .env        # nastav aspoň ADMIN_PASSWORD
docker compose up -d --build
docker compose logs -f redakce
```

Web pak běží na `http://server:8080` (`WEB_PORT`), redakce na `/keystatic`. Přihlašuje se jménem, e-mailem
a sdíleným heslem `ADMIN_PASSWORD` (`AUTH_MODE=password`). Bez hesla zůstane redakce zavřená.
`AUTH_MODE=dev` přihlašuje jen jménem a e-mailem bez hesla, hodí se jen tam, kam se nedostane nikdo cizí.
Za HTTPS proxy (Apache apod.) nastav `PUBLIC_DOMAIN` na veřejnou doménu a předávej `X-Forwarded-Proto`.
`PUBLIC_DOMAIN` se použije při buildu, po změně spusť znovu `docker compose up -d --build`.

V liště vlevo dole redakce ukazuje stav: „Zveřejňuji…“, „Web aktuální (čas)“, nebo „Zveřejnění selhalo“
(podrobnosti v tooltipu a v `docker compose logs redakce`). Když build selže, na webu zůstává poslední funkční verze.

**Záloha na GitHub:** bez `GIT_REMOTE` se repozitář založí ze zdrojáků v image a historie zůstává jen ve volume.
Pro zálohu nastav `GIT_REMOTE=git@github.com:HKFree/web-spolek.git`, větev `GIT_BRANCH` (výchozí `redakce-dev`;
když na GitHubu není, založí se prvním pushem), `GIT_PUSH=true` a deploy klíč s právem zápisu:

```sh
ssh-keygen -t ed25519 -f deploy-key -N '' -C 'redakce web-spolek'
# deploy-key.pub přidej v GitHubu: Settings → Deploy keys → Allow write access
```

V `compose.yaml` odkomentuj připojení `./deploy-key` a v `.env` nastav
`GIT_SSH_COMMAND=ssh -i /run/secrets/deploy-key -o StrictHostKeyChecking=accept-new`.
Před pushem redakce udělá `git pull --rebase`, takže změny z GitHubu (třeba úpravy kódu webu) se dostanou
do dalšího buildu. Změny redakce samotné (`keystatic.config.ts`, `src/redakce/`) se projeví až po
`docker compose up -d --build`.

Volume `repo` nemaž (`docker compose down -v`), dokud změny nejsou na GitHubu. Relace jsou jen v paměti,
po restartu se redaktoři přihlásí znovu.

### Přihlášení přes hkfree účet (OIDC)

Zatím není hotové. `AUTH_MODE=oidc` redakci zavře. Až budou údaje, doplní se `/auth/login` a
`/auth/callback` v `src/redakce/` (jako u [web-druzstvo](https://github.com/HKFree/web-druzstvo)).
Po přihlášení se zavolá stejné `login()` ze `src/redakce/auth.ts`, takže relace, autor commitu ani
zbytek redakce se nemění.

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

- Adresa článku bude `/aktuality/nazev/`. Starší články mají v názvu souboru i datum (`2019-03-21-brusle-nazout.md`),
  to se z adresy vynechá. Když by dva články měly stejnou adresu, build skončí chybou.
- Obrázky dej do složky se stejným názvem jako soubor. Astro je při buildu samo zmenší a převede na WebP.
- Odstavec složený jen z obrázků (aspoň dvou, každý na vlastním řádku) se zobrazí jako galerie.
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
| podporované organizace | `src/data/podporujeme.json` |
| dokumenty | `src/data/dokumenty.json`, PDF v `public/dokumenty/` |
| kontakty, IČ, účet, menu | `src/consts.ts` |
| fotky v hero | `src/data/hero.ts`, `src/assets/hero/` |
| redakce | `keystatic.config.ts` (formuláře), `src/redakce/` (stránky a přihlášení), `integrations/redakce.mjs` |
| dev nasazení | `compose.yaml`, `deploy/redakce/` (image, start a publikace, nginx), `.env.example` |
| design | `src/styles/druzstvo.css` (základ z družstva), `src/styles/spolek.css` (vlastní papírový vzhled spolku) |
