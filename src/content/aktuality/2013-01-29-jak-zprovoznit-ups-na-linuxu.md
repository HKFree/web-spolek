---
title: "Jak zprovoznit UPS na linuxu?"
date: 2013-01-29
author: "Pavel Vlček"
image: "./2013-01-29-jak-zprovoznit-ups-na-linuxu/000001.jpg"
---

## !Linux vs UPS

Pokud máme u routeru UPS, můžeme ji lehce spojit se systémem a využívat výhod. Asi nejprioritnější je možnost ukončení (zahaltování) systému v případě, že ups už končí baterie a vypnutí je neodvratné. Linux moc rád vypnutí bez řádného ukončení rád nemá, tak je nanejvýš hodné mu to umožnit.

Uvedený příklad jsem použil na Debianu a Smart-UPS 750 XL, propojeno skrz USB-

Já jsem použil program APCUPSD. V Debianu se dá lehce nainstalovat z repozitáře, současně s ním nainstalujeme i ještě jeden jeho prográmek pro grafické zobrazování stavu a nakonec program pro emailovou notifikaci.

Bližší popis programu a nastavení je např. tady[\
http://www.linux.cz/noviny/2001-08/clanek07.html](http://www.linux.cz/noviny/2001-08/clanek07.html "tady")

Začneme instalací.

apt-get install apcupsd
apt-get install apcupsd-cgi
apt-get install sendemai

po instalaci editujeme **/etc/apcupsd/apcupsd.conf** a upravíme následující na hodnoty

UPSCABLE usb
UPSTYPE usb
#DEVICE /dev/ttyS0

uložíme, dále editujeme soubor **/etc/default/apcupsd** a změníme

ISCONFIGURED=yes

Teď provedeme restart služby

service apcupsd restart

tím nám běží komunikace s ups, můžeme zkontrolovat napsáním příkazu

apcaccess

jeho výpis by měl vypadat následovně

APC      : 001,043,1059
DATE     : 2013-01-29 22:03:50 +0100
HOSTNAME : zvonicka
VERSION  : 3.14.10 (13 September 2011) debian
UPSNAME  : zvonicka
CABLE    : USB Cable
DRIVER   : USB UPS Driver
UPSMODE  : Stand Alone
STARTTIME: 2013-01-27 22:44:37 +0100
MODEL    : Smart-UPS 750 XL
STATUS   : ONLINE
LINEV    : 240.4 Volts
LOADPCT  :  24.7 Percent Load Capacity
BCHARGE  : 100.0 Percent
TIMELEFT :  84.0 Minutes
MBATTCHG : 5 Percent
MINTIMEL : 3 Minutes
MAXTIME  : 0 Seconds
OUTPUTV  : 240.4 Volts
SENSE    : High
DWAKE    : -01 Seconds
DSHUTD   : 180 Seconds
LOTRANS  : 208.0 Volts
HITRANS  : 253.0 Volts
RETPCT   : 000.0 Percent
ITEMP    : 25.6 C Internal
ALARMDEL : 30 seconds
BATTV    : 27.7 Volts
LINEFREQ : 50.0 Hz
LASTXFER : No transfers since turnon
NUMXFERS : 0
TONBATT  : 0 seconds
CUMONBATT: 0 seconds
XOFFBATT : N/A
SELFTEST : NO
STESTI   : 14 days
STATFLAG : 0x07000008 Status Flag
MANDATE  : 2008-02-15
SERIALNO : AS0807211830
BATTDATE : 2012-02-03
NOMOUTV  : 230 Volts
NOMBATTV :  24.0 Volts
FIRMWARE : 680.18.I USB FW:7.3
END APC  : 2013-01-29 22:04:03 +0100

## Grafické zobrazení hodnot a stavu.

!

!

To nám zajistí druhý nainstalovaný prográmek apcupsd-cgi skrz svoje cgi skripty. Předpokládám, že apache už nainstalovaný je. Aby to správně chodilo je třeba přidat do **/etc/apache/apache2.conf** nakonec toto

ScriptAlias /cgi-bin/ /usr/lib/cgi-bin/

resetovat apache

service apache2 restart

a můžeme se podívat jak to krásně vypadá

**http://localhost/cgi-bin/apcupsd/multimon.cgi**

místo localhost si dejte ip adresu stroje ke kterému je ups připojena

takhle to vypadá u mě

[http://10.107.90.65/cgi-bin/apcupsd/multimon.cgi](http://10.107.90.65/cgi-bin/apcupsd/multimon.cgi "http://10.107.90.65/cgi-bin/apcupsd/multimon.cgi")

## Emailová notifikace

Tak ups již komunikuje a systém o ní ví. Bylo by dobré aby v případě výpadku napájení poslal dotyčný počítač varovný email. Z emailu už pak jednoduše dostanete sms na mobil a víte, že se něco děje. Na to nám poslouží třetí program **sendemail**.

Pokud si otevřete **/etc/apcupsd** je tam několik skripů, zkráceně si je popíšeme

changneme – aktivován při expiraci baterie, baterie potřebuje vyměnit\
commfailure a commok – ztráta a obnovení komunikace s ups\
off a on battery – je jasné :)

ukážeme si to na skriptu onbattery, ten se aktivuje jakmile vypadne napájení

tady je můj obsah onoho skriptu i s posíláním varovného emailu

SYSADMIN=pvlcek@seznam.cz
APCUPSD\_MAIL="/usr/bin/sendemail"

HOSTNAME=\`hostname\`
MSG="$HOSTNAME Vypadek napajeni UPS ZAPNUTA !!!"
#
(
   echo "Subject: $MSG"
   echo " "
   echo "$MSG"
   echo " "
   /sbin/apcaccess status

) | $APCUPSD\_MAIL -u "$MSG" -f pvlcek@seznam.cz -t $SYSADMIN -s smtp.hkfree.org:25
touch /etc/apcupsd/powerfail
exit 0

pokud takto upravite i ostatni skripty dostanete celkem solidni info o tom co se právě s ups děje. Do emailu se přikládá i výpis z apcaccess, takže víte kolik zbejvá času než nastane shutdown :)

článek bude průběžně doplňován novými zkušenostmi

Pajavlk
