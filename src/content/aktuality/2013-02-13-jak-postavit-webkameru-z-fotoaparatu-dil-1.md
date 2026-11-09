---
title: "Jak postavit webkameru z fotoaparátu ? Díl 1."
date: 2013-02-13
author: "Pavel Vlček"
image: "./2013-02-13-jak-postavit-webkameru-z-fotoaparatu-dil-1/image001.jpg"
---

UPDATE: tento návod už není aktuální, sledujte stavbu nové webkamery na [http://pajavlk.blogspot.de](http://pajavlk.blogspot.de "http://pajavlk.blogspot.de")

!

Chtěl bych představit projekt, který má za cíl postavit kvalitní webkameru s pomocí digitálního fotoaparátu a jeho výhody i zápory. Bude to série několika článku s rozdílným tématem, chronologicky tak jak jsme jednotlivé věci řešil.

Asi hlavní důvodem proč to děláme je kvalita zobrazení a s tím i související náklady na stavbu, které jsou zlomek toho co stojí stejně obrazově kvalitní webkamery.

Začneme tedy první článkem který nás seznámí s tím co budeme potřebovat pro vlastní realizaci projektu. Software i hardware a know&how.

Budeme potřebovat počítač na kterém poběží nějaká distribuce linuxu. Já jsem použil router na kterém běží **Debian** a proto budu návod celkově psát přímo na něj. Z hlediska hardwaru budeme potřebovat digitální fotoaparát. Zde to není tak jednoduché protože, nemůžeme použít první co bude po ruce. Hlavní aplikací která se nám bude starat o ovládání fotoaparátu je **Gphoto2**. Stránky projektu jsou [http://www.gphoto.org/](http://www.gphoto.org/ "http://www.gphoto.org/") na nich je také seznam fotoaparátu které se dají použít kvůli podpoře PTP/IP. Obecně nejvíc zástupců má Canon ale pouze do roku 2008, potom Canon tuto podporu zrušil, takže většina fotoaparátu od tohoto roku už použít nelze.

!

Já jsem začal s kompaktem **Canon A85** s rozlišením 4Mpx koupeným za pár korun na bazaru. Tím máme fotoaparát, dále budeme potřebovat vhodný kryt, ideálně vyhřívaný. Sehnal jsem kryt pro průmyslové kamery, vyhřívaný (velice důležité!! pokud se nechcete po dešti koukat jen na kapky :), chlazený a dostatečně prostorný pro umístění fotoaparátu. Další věcí je napájení fotoaparátu. Bylo třeba postavit jednoduchý **stabilizátor na 5V nějaké to relátko** (k čemu, si povíme dále) kontrolní diodu a samozřejmě zdroj. Jako zdroj jsem použil obyčejný spínaný adaptér od routerboardu. Stabilizátor nám srazí napětí na 5V které potřebuje fotoaparát k činnosti.

!

Ale ouha po připojení napájení se nic nestane, foťák musím ručně zapnout tlačítkem aby nastartoval. Tady číhá první úskalí, foťák musíme zbavit všech krytů. Potom použijeme relé, **jeho cívku připojíme za stabilizátor a jeho spínací kontakty připojíme paralelně k tlačítku zapínání fotoaparátu**. Opatrně, pájí se to dost blbě a už určitě na to nechoďte s trafopájkou…. Tím docílíme toho, že při zapnutí napájení, relé přitáhne a zapne nám tak vlastní fotoaparát.

!

Další věcí je propojení s PC skrz USB. Mně dovolených 5m nestačilo, takže jsem použil **USB Extender** který mi dovolil, natáhnout ho na deset metrů a je stabilně funkční.

!

Tím máme tedy vyřešen hardware. Fotoaparát má napájení a je připojen skrz USB k PC. Poslední věcí kterou jsem musel vyřešit byl pravidelný restart. Fotoaparát po odfocení 6500 snímů zamrzl a nedal se nijak ovládat, krom vypnutí napájení. Po diskuzi s vývojáři gphoto2 bylo objeveno, že Canon A85 má chybu ve firmware která ho takto umrtví. Vyřešilo to přidání obyčejných spínacích hodin mezi zásuvku a zdroj :) Každou půlnoc se na pár minut vypne a zase zapne. V tu chvíli počítač vyrábí timestamp do snímků a také video, takže mu to trochu ulehčuji, o tom ale v dalších článcích.

!

Kryt i s fotoaparátem a zbytkem elektroniky můžeme namontovat na místo odkud má pořizovat záběry. Zapojit napájení a USB do PC. Pomocí příkazu **lsusb** si necháme vypsat připojená zařízení. Pokud uvidíme ve výpisu svůj fotoaparát, máme vyhráno.

root@zvonicka:~# lsusb
Bus 005 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
Bus 004 Device 002: ID 051d:0002 American Power Conversion Uninterruptible Power Supply
Bus 004 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
Bus 003 Device 012: ID 04a9:30b9 Canon, Inc. Powershot A85
Bus 003 Device 010: ID 1a40:0101 TERMINUS TECHNOLOGY INC. USB-2.0 4-Port HUB
Bus 003 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
Bus 002 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub

Tím bych fyzickou stránku projektu ukončil a následující návody Vás naučí, jak vyfotit a stáhnout fotku do počítače, jak ji zobrazit pro web, jak archivovat a na závěr jak vytvořit video tzv. Timelapse.

Celej funkční projekt naleznete na adrese [**http://webcam.hkfree.org**](http://webcam.hkfree.org/ "http://webcam.hkfree.org/")

Pajavlk
