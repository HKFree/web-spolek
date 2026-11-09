---
title: "Meteostanice GIOM 3000, jak z ní získat data?"
date: 2013-01-19
author: "Pavel Vlček"
image: "./2013-01-19-meteostanice-giom-3000-jak-z-ni-ziskat-data/multifunction-sensor-53747-29465051.jpg"
---

!

### Meteostanice GIOM3000

Ukážeme si jednoduchý postup jak získat data použitelná pro další zpracování z této meteostanice stanice. [**Giom3000 Ethernet**](http://www.mikrovlny.cz/cz/produkt/57)

Pár rad montáži meteostanice, **nezapomeňte** při montáži přesně namířit tělo stanice na sever (na stanici jsou světové strany napsané) jinak vám nebude sedět směr větru.

Výrobce píše, že se nemá používat spínaný zdroj. Stanice potom vykazuje nesmyslná data a v grafech dělá „špičky“. Ideální je obyčejné trafo a stabilizátor.

Stanice špatně počítá pociťovanou teplotu, vypočítáme ji za ni viz. dále v textu.

Pokud máme stanici už připojenou v síti i s dostupnou ip adresou, ukážeme si teď jak z ní jednoduše dostat data skrz protokol snmp.

!\
Ukázka vlastního zobrazení hodnot stanice

Jak získávat data ?

Budeme k tomu potřebovat stroj s **linux**em na kterém poběží **Apache** a dá se z něj na stanici po síti dostat (moje konfigurace je Debian a Apache5). První co musíme zkontrolovat, zda má Apache aktivní modul snmp. Stačí vytvořit jednoduchou php stránku a dát do ní. Tam uvidíme co je a není aktivní

```
<?php phpinfo(); ?>
```

Pokud není, tak ho přes apt (php5-snmp) doinstalujeme.

Potom si ze stanice zjistíme jednotlivé MIB kody, jejich seznam je přímo v administraci stanice. My si ukážeme jak vyčíst např. **rychlost větru**. Samotná hodnota ale většine lidí nic neřekne, bylo by vhodné k ní umístit i tuto [**tabulku**](http://cs.wikipedia.org/wiki/Beaufortova_stupnice) se kterou se setkáváme častěji. Případně můžeme využít toho, že stanice to umí sama spočítat a zobrazit.

!

Potřebujeme zjistit rychlost větru, použijeme tedy tento MIB.

0.1.3.6.1.4.1.21287.15.4.0

Víme tedy číslo mibu, teď ho vyčteme. Uděláme si nějakou php stránku a do něj zapíšeme:

$rychlostvetru = snmpget("IPADRESA", "public", "0.1.3.6.1.4.1.21287.15.4.0");

Místo **IPADRESA** doplnit adresu stanice, např. 192.168.1.1. Co to provede ? snmp provede skrz modul v apache dotaz na určenou ip adresu pomocí daného mibu a to co se vrátí ze stanice, načte do proměnné **$rychlostvetru**. To ovšem není tak jednoduché protože pokud si teď echem rychlostvetru zobrazíme najdeme tam např. „STRING=2,5“ ale my potřebujeme pro další práci mít v „ruce“ pouze číselnou hodnotu.\
Použijeme na to funkci **Substr**

$vysledek = SubStr ("$rychlostvetru", 8, 11);

Funkce načte proměnou **$rychlostvetru**  a vybere z ní pouze data mezi 8mou a 11tou pozicí. To znamená, že v proměnné **$vysledek** máme teď  hodnotu **„2,5“**.\
Ještě musíme odstranit uvozovky na to využijeme funkci **str\_replace**.

$rychlostvetrufinal = str\_replace('"','',$vysledek);

Tato funkce zbaví uvozovek a v proměnné **$rychlostvetrufinal** zbude hodnota **2,5** a to je to co potřebujeme :) Teď to můžeme obligátně echem vypsat do stránky.

echo "$rychlostvetrufinal";

Hurá na stránce se nám zobrazí 2,5 :) s každým zavoláním skriptu se provede nový snmp dotaz na stanici, takže hodnota se mění podle rychlosti větru venku.

Pokud to má být smysluplné tak to musíme trochu upravit a zlidštit.

$vitr = "Rychlost větru $rychlostvetrufinal m/s";

echo "$vitr";

Tohle už řekne více. Proměnnou **$vitr** jsme takto udělali schválně, protože s ní budeme dále pracovat. Vygenerujeme skrz php png obrázek kde budou textová data z meteostanice.

### Vygenerování obrázku

tento script jsem našel na internetu a upravil pro vlastní použití. Můžeme ho přidat pod scripty kterými zjišťujeme data ze stanice. Defaultně bývá tento img modul v php aktivní.

    // řekne prohlížeči, že se jedná o PNG obrázek

    header ("Content-type:image/png");

    // velikost písma

    $velikost = 3;

    // zjištění výšky textu a přidá 10px aby obrázek nebyl natěsno
( přidáme 5 px z každé strany )

    $vyska = (ImageFontHeight ($velikost)) + 10;

    // zjištění šířky jednoho písmena

    $sirka = ImageFontWidth($velikost);

    // text, který chceme vypsat na začátek obrázku

    $text = "Meteostanice";

    // počet znaků textu, který chceme vypsat

    $pocet\_znaku=strlen($text);

    // šířka všech znaků + 10 px (aby text nebyl hned na okraji -
přidáme 5 px na každé straně.

    $sirka\_cela = ($sirka \* $pocet\_znaku) + 10;

    // Vytvoří obrázek o rozměrech.

    $obrazek = ImageCreate(181,190);

    // Nastaví barvu pozadí obrázku na  bílou(RGB kód, 255,255,255).

    $barva\_bila = Imagecolorallocate ($obrazek,255,255,255);

    // Zadáme barvu textu - RGB kód barvy šedá

    $barva\_seda = Imagecolorallocate ($obrazek,000,000,000);

    // vypíšeme text do obrázku - pozice 5px z leva a 5px shora

imagestring ($obrazek, $velikost, 5,5, $text, $barva\_seda);

imagestring ($obrazek, $velikost, 5,20, $vitr , $barva\_seda);

    // Odešle prohlížeči vygenerovaný obrázek.

    Imagepng ($obrazek);

    // Uvolní systémové prostředky.

    ImageDestroy ($obrazek);

!Tento script nám tedy vytvoří PNG obrázek (ukázka vlevo) o daných rozměrech, nejdůležitější je funkce imagestring. první nám vloží do obrázku text daný v proměnné **$text** uvnitř skriptu. Další imagestring je vlastně odřádkování, a v něm je naše proměná **$vitr** s textem i číselnou hodnotou. Jak vypadá výsledek můžete vidět na této stránce vlevo pod obrázkem z webkamery.

Pokud tedy zavoláme prohlížečem náš test.php zobrazí se nám PNG obrázek s textem a aktuální hodnotou větru. S tím už můžeme pracovat jak chceme, vložit ho do nějaké stránky apod.

Stejným způsobem vyčítáme i všechny ostatní informace ze stanice. Jen u pociťované teploty (windchill) musíme ještě udělat korekci, jelikož stanice ji počítá špatně, spočítáme ji za ni.

### Windchill aneb pociťovaná teplota

Nejdříve něco o tom co to vlastně je.

Na pocit tepla nebo chladu má totiž kromě samotné teploty vliv i rychlost větru. Čím fouká silněji, tím je člověku větší zima. Tento subjektivní dojem lze podchytit i vědecky, tak zvanou efektivní teplotou; častěji se ale setkáme s původním anglickým termínem wind chill.

Jak se vítr konkrétně může projevit? Řekněme, že v absolutním měřítku je venku minus pět stupňů Celsia. Je-li bezvětří, platí to i pro wind chill. Stačí ale, aby vítr trochu zafoukal a bude se vám zdát, že je mnohem chladněji:

-   rychlost větru 5 km/h: wind chill -7 °C
-   rychlost větru 10 km/h: wind chill -9 °C
-   rychlost větru 20 km/h: wind chill -12 °C
-   rychlost větru 30 km/h: wind chill -13 °C
-   rychlost větru 50 km/h: wind chill -15 °C

Můžete si [**prohlédnout tabulku**](http://www.msc.ec.gc.ca/education/windchill/windchill_chart_e.cfm), kde jsou tyto hodnoty pro různé počáteční teploty a rychlosti větru. Na další tabulce je [**výsledkem čas**](http://www.msc.ec.gc.ca/education/windchill/minutes_freeze_table_e.cfm), za jak dlouho člověk při působení nízkých teplot doprovázených větrem prochladne a mohou vzniknout omrzliny.

Wind chill velmi podrobně [**vysvětluje Wikipedia**](http://en.wikipedia.org/wiki/Wind_chill), odkud jsem také zkopíroval vzoreček. Jím lze se znalostí absolutní teploty a rychlosti větru vypočítat, jak se budete venku cítit. Ta je teplota ve stupních Celsia, V je rychlost větru v kilometrech za hodinu:

![windchill.png](http://zive.v.mfstatic.cz/getfile.aspx?id_file=12050)

Takže jak to spočítáme ? pomocí php, takto vypadá funkce která nám to zajistí.

$windchill = (int)(13.13 + 0.62 \* $teplota - 13.95 \*
pow($rychlostvetru, 0.16) + 0.486 \* $teplota \* pow($rychlostvetru, 0.16));

proměnné **$teplota** a **$rychlost** větru jsou už zformatované předchozíma skriptama a jsou to tedy čisté číselné hodnoty. Nyní máme v hodnotě **$windchill** správný výsledek a můžeme s ním dále pracovat např. ho vložit do námi generovanému obrázku.

### Ukázky použití dat z této stanice

[**kolikjestupnu.cz**](http://www.kolikjestupnu.cz/vcetne-grafu/#meteo-5)\
[**aplikace TME pro tuto stanici**](http://teploty.lwq.cz/malinak/)\
[**webcam.hkfree.org**](http://webcam.hkfree.org/)

tento článek bude ještě doplňován

Pajavlk
