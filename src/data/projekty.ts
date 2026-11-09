// Technické projekty a bastlení členů spolku. `post` = id aktuality (název souboru bez .md).
import fotoWebkamera from '../content/aktuality/2014-11-22-webkamera-cernigov/latest-originals.jpg';
import fotoMeteo from '../content/aktuality/2014-02-25-mereni-radiacniho-pozadi/intenzimetr.jpg';
import fotoSdr from '../content/aktuality/2016-03-01-websdr/4.jpg';
import fotoAdsb from '../content/aktuality/2016-01-13-projekty-vznikajici-v-hkfree-org/00006.jpg';

export const PROJEKTY = [
  {
    title: 'Webkamera nad Hradcem',
    year: '2012–2014',
    text: 'Z fotoaparátu ve vyhřívaném pouzdře jsme postavili webkameru ve vysokém rozlišení. Snímá panorama města z vodojemu a z Černigova.',
    photo: fotoWebkamera,
    post: '2014-02-15-webkamera-online',
    link: 'https://webcam.hkfree.org',
  },
  {
    title: 'Meteostanice a radiace',
    year: '2013–2014',
    text: 'Vlastní meteostanice a měření přírodního radiačního pozadí. Data se ukazují přímo v obrazu webkamery.',
    photo: fotoMeteo,
    post: '2014-02-25-mereni-radiacniho-pozadi',
  },
  {
    title: 'WebSDR rádio',
    year: '2016',
    text: 'Softwarové rádio, které si kdokoliv ladí v prohlížeči. Poslech leteckého provozu z letišť kolem Hradce, nonstop.',
    photo: fotoSdr,
    post: '2016-03-01-websdr',
  },
  {
    title: 'Sledování letadel ADS-B',
    year: '2016',
    text: 'Přijímací stanice členů v Hradci a Pardubicích sbírají signály z letadel a server je kreslí do mapy.',
    photo: fotoAdsb,
    post: '2016-01-13-projekty-vznikajici-v-hkfree-org',
  },
];
