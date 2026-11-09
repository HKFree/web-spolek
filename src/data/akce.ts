// Pravidelné akce spolku. `match` hledá v názvech aktualit,
// karta pak odkazuje na nejnovější aktualitu k dané akci.
import fotoPles from '../content/aktuality/2020-02-19-mame-fotky-z-plesu/87067861_10159815626348508_725097991186153472_o.jpg';
import fotoTabor from '../content/aktuality/2024-06-29-tabor-je-opet-tady/449363373_1018196433643537_7567353384698530130_n.jpg';
import fotoBrusleni from '../content/aktuality/2019-03-21-brusle-nazout/Image-from-iOS-1.jpg';
import fotoLan from '../content/aktuality/2019-12-23-lanparty/sean-do-EHLd2utEf68-unsplash.jpg';
import fotoDivadlo from '../content/aktuality/2019-06-21-divadelni-festival-je-tu/64587102_10158949629793508_1235241888638828544_o.jpg';
import fotoVylety from '../content/aktuality/2021-09-12-akce-2/GOPR6044.jpg';
import fotoWifi from '../content/aktuality/2019-06-21-divadelni-festival-je-tu/64549809_10158949627273508_3993860367376711680_o.jpg';

export const AKCE = [
  {
    id: 'ples',
    since: 'od 2014',
    title: 'Ples hkfree.org',
    text: 'Živá kapela, DJ v malém sále a tombola, jejíž výtěžek posíláme na dobročinné účely. V roce 2026 už 10. ročník.',
    match: /ples/i,
    photo: fotoPles,
  },
  {
    id: 'tabor',
    since: 'od 2017',
    title: 'Letní tábor Jedlová',
    text: 'Dva týdenní běhy pro děti 6–15 let v Orlických horách. Příroda, zálesáctví, sport, noční hra i spaní pod širákem.',
    match: /tábor/i,
    photo: fotoTabor,
  },
  {
    id: 'brusleni',
    since: 'od 2018',
    title: 'Bruslení zdarma',
    text: 'Pronajmeme led a pozveme všechny: členy, sousedy, děti i kamarády. Stačí přinést brusle.',
    match: /brusl/i,
    photo: fotoBrusleni,
  },
  {
    id: 'lan',
    since: 'od 2019',
    title: 'LAN party',
    text: 'Kořeny freenetů jsou v hraní po síti. Sneseme počítače, natáhneme kabely a hrajeme do rána.',
    match: /lan ?p[aá]rty/i,
    photo: fotoLan,
  },
  {
    id: 'divadlo',
    since: 'od 2019',
    title: 'Divadelní festival',
    text: 'Na kulturní akce v Hradci a okolí dodáváme konektivitu a techniku, třeba na divadelní festival.',
    match: /divadel/i,
    photo: fotoDivadlo,
  },
  {
    id: 'vylety',
    since: '',
    title: 'Výlety a setkání',
    text: 'Splutí Orlice, gril, pivo s hkfree. Pokecáme o síti, serverech, bastlení a o všem ostatním.',
    match: /^akce|pivo|gril/i,
    photo: fotoVylety,
  },
];

// Polaroidy v hero na úvodní stránce
export const HERO_FOTKY = [
  { src: fotoPles, label: 'ples 2020', href: '/#akce-ples' },
  { src: fotoTabor, label: 'tábor Jedlová 2024', href: '/#akce-tabor' },
  { src: fotoBrusleni, label: 'bruslení zdarma', href: '/#akce-brusleni' },
  { src: fotoWifi, label: 'wifi na festivalu', href: '/#akce-divadlo' },
  { src: fotoVylety, label: 'splutí Orlice', href: '/#akce-vylety' },
];
