import { collection, config, fields, singleton } from '@keystatic/core';

const slugPattern = { regex: /^[a-z0-9-]+$/, message: 'Jen malá písmena bez diakritiky, číslice a pomlčky.' };

// Obrázky leží ve složce se stejným názvem jako záznam: ./<slug>/foto.jpg
const imagesOf = (dir: string) => ({ directory: dir, publicPath: './' });
const aktualitaImages = imagesOf('src/content/aktuality');

// Keystatic by soubor přejmenoval podle pole (image.jpg); necháme původní název.
function keepFilename<F extends { serialize: (value: any, args: any) => any }>(field: F): F {
  return { ...field, serialize: (value, args) => field.serialize(value, { ...args, suggestedFilenamePrefix: undefined }) };
}

const order = fields.integer({ label: 'Pořadí', description: 'Menší číslo je výš.', defaultValue: 10, validation: { isRequired: true, min: 0 } });

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'hkfree.org z.s. · redakce' },
    navigation: {
      Obsah: ['aktuality', 'akce', 'projekty'],
      Stránky: ['podporujeme', 'dokumenty'],
    },
  },
  collections: {
    aktuality: collection({
      label: 'Aktuality',
      slugField: 'title',
      path: 'src/content/aktuality/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({
          name: { label: 'Název', validation: { isRequired: true } },
          slug: {
            label: 'Adresa článku',
            description: 'Část adresy /aktuality/…/. Po zveřejnění ji neměň.',
            validation: { pattern: slugPattern },
          },
        }),
        date: fields.date({ label: 'Datum', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
        author: fields.text({ label: 'Autor' }),
        description: fields.text({
          label: 'Krátký popis',
          description: 'Do výpisu aktualit. Když ho nevyplníš, vezme se začátek textu.',
          multiline: true,
        }),
        image: keepFilename(
          fields.image({ label: 'Titulní obrázek', description: 'Do výpisu a pro sdílení na sociálních sítích.', ...aktualitaImages }),
        ),
        akce: fields.relationship({
          label: 'Patří k akci',
          description: 'Karta akce na úvodní stránce odkazuje na nejnovější aktualitu k ní.',
          collection: 'akce',
        }),
        facebook: fields.url({
          label: 'Odkaz na příspěvek na Facebooku',
          description: 'Když článek nemá žádný text, karta ve výpisu vede rovnou na Facebook.',
        }),
        draft: fields.checkbox({ label: 'Koncept (nezobrazovat na webu)', defaultValue: false }),
        content: fields.markdoc({
          label: 'Text',
          description: 'Víc obrázků pod sebou bez textu mezi nimi se zobrazí jako galerie.',
          extension: 'md',
          options: { image: aktualitaImages },
        }),
      },
    }),

    akce: collection({
      label: 'Akce',
      slugField: 'title',
      path: 'src/content/akce/*',
      format: { data: 'yaml' },
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({
          name: { label: 'Název', validation: { isRequired: true } },
          slug: { label: 'Identifikátor', description: 'Kotva na úvodní stránce (#akce-…).', validation: { pattern: slugPattern } },
        }),
        order,
        since: fields.text({ label: 'Štítek na fotce', description: 'Např. „od 2014“ nebo „připravujeme“.' }),
        text: fields.text({ label: 'Popis', multiline: true, validation: { isRequired: true } }),
        photo: keepFilename(fields.image({ label: 'Fotka', validation: { isRequired: true }, ...imagesOf('src/content/akce') })),
        href: fields.text({ label: 'Vlastní odkaz', description: 'Nepovinné, např. /dilna/.' }),
        linkLabel: fields.text({ label: 'Text vlastního odkazu' }),
      },
    }),

    projekty: collection({
      label: 'Projekty',
      slugField: 'title',
      path: 'src/content/projekty/*',
      format: { data: 'yaml' },
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Název', validation: { isRequired: true } }, slug: { validation: { pattern: slugPattern } } }),
        order,
        year: fields.text({ label: 'Rok', description: 'Např. 2016 nebo 2012–2014.', validation: { isRequired: true } }),
        text: fields.text({ label: 'Popis', multiline: true, validation: { isRequired: true } }),
        photo: keepFilename(fields.image({ label: 'Fotka', validation: { isRequired: true }, ...imagesOf('src/content/projekty') })),
        post: fields.relationship({ label: 'Aktualita o projektu', description: 'Karta projektu odkazuje na ni.', collection: 'aktuality' }),
        link: fields.url({ label: 'Odkaz na web projektu', description: 'Použije se, když není vybraná aktualita.' }),
      },
    }),
  },

  singletons: {
    podporujeme: singleton({
      label: 'Podporujeme',
      path: 'src/data/podporujeme',
      format: { data: 'json' },
      schema: {
        skupiny: fields.array(
          fields.object({
            group: fields.text({ label: 'Oblast', validation: { isRequired: true } }),
            items: fields.array(
              fields.object({
                name: fields.text({ label: 'Název', validation: { isRequired: true } }),
                url: fields.text({ label: 'Web' }),
                note: fields.text({ label: 'Poznámka' }),
              }),
              { label: 'Organizace', itemLabel: (props) => props.fields.name.value || 'Nová organizace' },
            ),
          }),
          { label: 'Oblasti', itemLabel: (props) => `${props.fields.group.value || 'Nová oblast'} (${props.fields.items.elements.length})` },
        ),
      },
    }),

    dokumenty: singleton({
      label: 'Dokumenty',
      path: 'src/data/dokumenty',
      format: { data: 'json' },
      schema: {
        dokumenty: fields.array(
          fields.object({
            label: fields.text({ label: 'Název', validation: { isRequired: true } }),
            file: keepFilename(
              fields.file({
                label: 'PDF',
                description: 'Adresa bude /dokumenty/<název souboru>. Při výměně za novou verzi pojmenuj soubor jinak.',
                directory: 'public/dokumenty',
                publicPath: '/dokumenty/',
                validation: { isRequired: true },
              }),
            ),
          }),
          { label: 'Dokumenty', description: 'Pořadí na webu měníš přetažením.', itemLabel: (props) => props.fields.label.value || 'Nový dokument' },
        ),
      },
    }),
  },
});
