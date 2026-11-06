// Klikalne paragrafy i objaśnienia skrótów w całej aplikacji. Działa na gotowym tekście ekranu:
// każdy nowy fragment w #widok jest przeszukiwany, a „§ 235 WT” staje się linkiem do oficjalnego
// tekstu Sejmu otwartego na tym paragrafie (nowa karta), „SSP” - skrótem z dymkiem.
//
//   „§ 4 i § 5 rozp. 2010” ─► nazwa aktu po łańcuchu odnośników ─► indeks.json (czy jest taki §)
//   ─► indeks_isap.json ─► api.sejm.gov.pl/…/text.html#chpt_2-para_4 albo …/text.pdf#page=3
//   brak nazwy aktu ─► akt źródła punktu (data-akt) ─► brak - zostaje zwykły tekst (nie zgadujemy)

// Nazwy aktów, jakimi posługują się teksty lekcji i materiałów → plik aktu w data/przepisy.
const AKTY_W_TEKSCIE = [
  ["KPSW|Kodeksu postępowania w sprawach o wykroczenia", "DU_2001_1148"],
  ["KW|Kodeksu wykroczeń|Kodeks wykroczeń|k\\.w\\.", "DU_1971_114"],
  ["KK|Kodeksu karnego|Kodeks karny|k\\.k\\.", "DU_1997_553"],
  ["POŚ|Prawa ochrony środowiska|Prawo ochrony środowiska", "DU_2001_627"],
  ["PB|Prawa budowlanego|Prawo budowlane", "DU_1994_414"],
  ["WT(?: 2002)?|warunków technicznych|Warunków technicznych|warunki techniczne", "DU_2002_690"],
  ["ustaw[ayie]? o PSP|ustaw[ayie]? o Państwowej Straży Pożarnej", "DU_1991_400"],
  ["ustaw[ayie]? o ochronie (?:ppoż\\.|przeciwpożarowej)", "DU_1991_351"],
  ["ustaw[ayie]? o ochronie ludności", "DU_2024_1907"],
  ["(?:rozp\\.|rozporządzeni[ae]) ATEX(?: 2010)?|ATEX 2010", "DU_2010_931"],
  ["(?:rozp\\.|rozporządzeni[ae]) (?:z )?2010(?![/\\d])", "DU_2010_719"],
  ["(?:rozp\\.|rozporządzeni[ae]) (?:z )?2009(?![/\\d])", "DU_2009_1030"],
  ["(?:rozp\\.|rozporządzeni[ae]) (?:o )?KSRG|(?:rozp\\.|rozporządzeni[ae]) 2026/872", "DU_2026_872"],
  ["(?:rozp\\.|rozporządzeni[ae]) 2023/1707|(?:rozp\\.|rozporządzeni[ae]) 2023 o (?:bazach|stacjach)", "DU_2023_1707"],
  ["(?:rozp\\.|rozporządzeni[ae]) 2023/1563|(?:rozp\\.|rozporządzeni[ae]) 2023 (?:o )?uzgadnian", "DU_2023_1563"],
  ["(?:rozp\\.|rozporządzeni[ae]) (?:z )?2015", "DU_2015_1964"],
  ["(?:rozp\\.|rozporządzeni[ae]) (?:z )?2019", "DU_2019_1316"],
  ["(?:rozp\\.|rozporządzeni[ae]) (?:z )?2020", "DU_2020_296"],
  ["(?:rozp\\.|rozporządzeni[ae]) 2005 (?:o czynnościach|kontrolno)", "DU_2005_1934"],
  ["(?:rozp\\.|rozporządzeni[ae]) 2016 o progach", "DU_2016_138"],
];
// Spacje w nazwach jako \s - tekst ma twarde spacje po spójnikach („o PSP”).
const AKTY_WZORY = AKTY_W_TEKSCIE.map(([w, plik]) => [w.replaceAll(" ", "\\s"), plik]);
const AKT_PO = AKTY_WZORY.map(([w, plik]) => [new RegExp(`^\\s*[,(]?\\s*(?:${w})(?![\\p{L}\\d])`, "u"), plik]);
const AKT_PRZED = AKTY_WZORY.map(([w, plik]) => [new RegExp(`(?:^|[^\\p{L}])(?:${w})\\s*[,:(]?\\s*$`, "u"), plik]);

// Bloki „Przepisy omówione paragraf po paragrafie” (A1-A25) - każdy o jednym akcie.
// Służą jako akt domyślny tematu i jako nazwa aktu w zapisie „(A7, § 14)”.
const AKT_BLOKU = { A1: "DU_2010_719", A2: "DU_2009_1030", A3: "DU_1991_351", A4: "DU_2023_1563", A5: "DU_2002_690", A6: "DU_2026_872",
  A7: "DU_2005_1934", A8: "DU_2015_1964", A9: "DU_2007_1002", A11: "DU_2023_1707", A15: "DU_1991_400", A16: "DU_1997_553",
  A17: "DU_2024_1907", A18: "DU_1994_414", A19: "DU_2001_627", A20: "DU_2002_690", A24: "DU_2024_1907", A25: "DU_1997_553" };
const BLOK_PRZED = /(?:^|[^\p{L}\d])(A\d+[ab]?)\s*[,:]?\s*$/u;

// Tematy Materiałów o jednym akcie (pozostałe mieszają akty - bez domyślnego).
const AKT_TEMATU = { p3: "DU_1991_351", p4: "DU_1991_351", p9: "DU_2010_719", p18: "DU_2010_719", p13: "DU_2009_1030", p23: "DU_2009_1030",
  p19: "DU_1991_351", p20: "DU_1991_400", p21: "DU_1994_414", p22: "DU_2002_690" };

function aktTematu(id) {
  return AKT_TEMATU[id] || AKT_BLOKU[id.toUpperCase()] || "";
}

// Inny akt nazwany wprost (np. „rozp. 2017”, „ustawy o wyrobach”) - wtedy nie wolno brać aktu domyślnego.
const INNY_AKT = /^\s*[,(]?\s*(?:rozp\.|rozporządzeni|ustaw[ayie]?\so\s|Kodeks|Prawa\s|Dz\.\s?U|dyrektyw)/u;
const GOLA_USTAWA = /^\s*[,(]?\s*ustaw[ayie]?(?![\p{L}])(?!\s(?:o|z)\s)/u;

// Jednostka po numerze: „ust. 4”, „pkt 3”, „lit. c”.
const CZESC = "(?:ust\\.|pkt|lit\\.)\\s?(?:\\d+[a-z]?|[a-z](?![\\p{L}]))\\)?";
const ODNOSNIK = new RegExp(`(§§?|[Aa]rt\\.)\\s?(\\d+[a-z]?)((?:\\s?${CZESC})*)`, "gu");
const LANCUCH = new RegExp(`^(?:\\s*(?:,|i|oraz|lub|albo|-|–|do|w\\szw\\.\\sz)?\\s*(?:(?:(?:§§?|[Aa]rt\\.)\\s?)?\\d+[a-z]?|${CZESC})(?:\\s?(?:${CZESC}|§\\s?\\d+[a-z]?))*)*`, "u");
const CZESC_ARTYKULU = new RegExp(`(?:art\\.|§)\\s?\\d+[a-z]?(?:\\s?${CZESC})*\\s*$`, "iu");
// „art. 82 § 1 KW” - paragraf wewnątrz artykułu kodeksu, nie osobny odnośnik.
const PARAGRAF_ARTYKULU = new RegExp(`art\\.\\s?\\d+[a-z]?(?:\\s?${CZESC})*\\s*$`, "iu");
// Między dwoma odnośnikami pada nazwa aktu - wtedy nie przenosimy aktu poprzedniego odnośnika.
const NAZWA_AKTU = /rozp\.|rozporządzeni|ustaw|Kodeks|Prawa?\s|Prawo\s|\b(?:WT|PB|KW|KK|KPSW|POŚ|ATEX)\b/u;

// Skróty z bazy wiedzy. Rozwinięcia z przepisów (WT § 8, § 209 i inne) i z materiałów kursu.
const SKROTY = {
  "ZL I": "ZL I - strefa z pomieszczeniami dla ponad 50 osób niebędących stałymi użytkownikami, nieprzeznaczona przede wszystkim dla osób o ograniczonej zdolności poruszania się (§ 209 ust. 2 WT)",
  "ZL II": "ZL II - przeznaczone przede wszystkim dla ludzi o ograniczonej zdolności poruszania się: szpitale, żłobki, przedszkola, domy dla osób starszych (§ 209 ust. 2 WT)",
  "ZL III": "ZL III - użyteczności publicznej, niezakwalifikowane do ZL I i ZL II (§ 209 ust. 2 WT)",
  "ZL IV": "ZL IV - mieszkalne (§ 209 ust. 2 WT)",
  "ZL V": "ZL V - zamieszkania zbiorowego, niezakwalifikowane do ZL I i ZL II (§ 209 ust. 2 WT)",
  ZL: "ZL - budynki mieszkalne, zamieszkania zbiorowego i użyteczności publicznej, z kategorią zagrożenia ludzi ZL I-ZL V (§ 209 WT)",
  PM: "PM - budynki i strefy produkcyjne i magazynowe; też garaże, kotłownie, rozdzielnie, stacje transformatorowe itp. (§ 209 WT)",
  IN: "IN - budynki inwentarskie, służące do hodowli inwentarza (§ 209 WT)",
  SW: "SW - budynek średniowysoki: ponad 12 m do 25 m albo mieszkalny ponad 4 do 9 kondygnacji nadziemnych, czyli od 4. do 8. piętra (§ 8 WT)",
  WW: "WW - budynek wysokościowy: powyżej 55 m nad poziomem terenu, orientacyjnie wyżej niż 17. piętro (§ 8 WT)",
  PSP: "Państwowa Straż Pożarna",
  OSP: "Ochotnicza Straż Pożarna",
  ZOSP: "Związek Ochotniczych Straży Pożarnych",
  KSRG: "krajowy system ratowniczo-gaśniczy",
  KG: "Komendant Główny PSP",
  KDR: "kierujący działaniem ratowniczym",
  JRG: "jednostka ratowniczo-gaśnicza PSP",
  WOP: "Wojskowa Ochrona Przeciwpożarowa",
  CS: "Centralna Szkoła PSP w Częstochowie (CS PSP)",
  SGSP: "Szkoła Główna Służby Pożarniczej",
  CNBOP: "Centrum Naukowo-Badawcze Ochrony Przeciwpożarowej - instytut badawczy PSP (CNBOP-PIB)",
  SWD: "System Wspomagania Decyzji PSP",
  WT: "warunki techniczne, jakim powinny odpowiadać budynki i ich usytuowanie (rozporządzenie z 2002 r.)",
  PB: "Prawo budowlane",
  KK: "Kodeks karny",
  KPSW: "Kodeks postępowania w sprawach o wykroczenia",
  KPA: "Kodeks postępowania administracyjnego",
  POŚ: "Prawo ochrony środowiska",
  IBP: "instrukcja bezpieczeństwa pożarowego",
  SSP: "system sygnalizacji pożarowej",
  CSP: "centrala sygnalizacji pożarowej",
  ROP: "ręczny ostrzegacz pożarowy",
  DSO: "dźwiękowy system ostrzegawczy",
  SUG: "stałe urządzenie gaśnicze",
  PWP: "przeciwpożarowy wyłącznik prądu",
  ZKA: "zawór kontrolno-alarmowy (instalacja tryskaczowa)",
  RTI: "wskaźnik czasu reakcji tryskacza (Response Time Index)",
  REI: "klasa odporności ogniowej: R - nośność, E - szczelność, I - izolacyjność; liczba = minuty",
  EIS: "klasa odporności ogniowej: E - szczelność, I - izolacyjność, S - dymoszczelność; liczba = minuty",
  EI: "klasa odporności ogniowej: E - szczelność, I - izolacyjność; liczba = minuty",
  RE: "klasa odporności ogniowej: R - nośność, E - szczelność; liczba = minuty",
  NRO: "nierozprzestrzeniające ognia",
  PH: "klasa ciągłości działania kabla w czasie pożaru (np. PH 90 = 90 minut)",
  MJ: "megadżul - jednostka energii (gęstość obciążenia ogniowego podaje się w MJ/m²)",
  MPa: "megapaskal - jednostka ciśnienia (1 MPa = 10 bar)",
  DN: "DN - średnica nominalna (z ang. diameter nominal): umowny rozmiar rury, zaworu lub hydrantu w milimetrach, w przybliżeniu jego średnica wewnętrzna. Hydrant zewnętrzny DN 80 daje co najmniej 10 litrów wody na sekundę, a nadziemny DN 100 - co najmniej 15 litrów na sekundę, przy ciśnieniu 0,2 MPa (§ 10 ust. 8 rozp. 2009)",
  "dm³/s": "dm³/s - decymetr sześcienny na sekundę, czyli litr na sekundę: tyle litrów wody wypływa z hydrantu lub prądownicy w każdej sekundzie (10 dm³/s = 600 litrów na minutę)",
  kPa: "kPa - kilopaskal, jednostka ciśnienia: 1000 paskali; 100 kPa to ok. 1 bar (ciśnienie atmosferyczne). Próg pomieszczenia zagrożonego wybuchem to przyrost ciśnienia ponad 5 kPa",
  HP: "HP - hydrant pożarowy; liczba po nim (25, 33, 52) to średnica węża lub nasady w milimetrach, np. HP 25 - hydrant wewnętrzny z wężem półsztywnym 25 mm",
  LPG: "gaz płynny (propan-butan)",
  ATEX: "atmosfera wybuchowa (z franc. ATmosphères EXplosibles) - przepisy i dyrektywy UE o strefach zagrożenia wybuchem",
  DZPW: "dokument zabezpieczenia przed wybuchem (rozp. ATEX 2010, § 7)",
  DGW: "dolna granica wybuchowości - najmniejsze stężenie, przy którym mieszanina może wybuchnąć",
  GGW: "górna granica wybuchowości - największe stężenie, przy którym mieszanina może wybuchnąć",
  LEL: "dolna granica wybuchowości (Lower Explosive Limit)",
  BLEVE: "wybuch rozprężających się par wrzącej cieczy (Boiling Liquid Expanding Vapour Explosion)",
  ZZR: "zakład o zwiększonym ryzyku wystąpienia poważnej awarii przemysłowej",
  ZDR: "zakład o dużym ryzyku wystąpienia poważnej awarii przemysłowej",
  WIOŚ: "wojewódzki inspektor (inspektorat) ochrony środowiska",
  GIOŚ: "Główny Inspektor (Inspektorat) Ochrony Środowiska",
  CLP: "rozporządzenie UE o klasyfikacji, oznakowaniu i pakowaniu substancji chemicznych",
  CAS: "numer rejestrowy substancji chemicznej (Chemical Abstracts Service)",
  ADR: "umowa europejska o międzynarodowym przewozie drogowym towarów niebezpiecznych",
  NDS: "najwyższe dopuszczalne stężenie (w środowisku pracy)",
  BHP: "bezpieczeństwo i higiena pracy",
  PIP: "Państwowa Inspekcja Pracy",
  UDT: "Urząd Dozoru Technicznego",
  ŚOI: "środki ochrony indywidualnej",
  PV: "fotowoltaika, instalacja fotowoltaiczna",
  DC: "prąd stały",
  AC: "prąd przemienny",
  UV: "promieniowanie nadfioletowe (ultrafiolet)",
  IR: "promieniowanie podczerwone",
  CE: "oznakowanie zgodności wyrobu z wymaganiami Unii Europejskiej",
  CPR: "rozporządzenie UE nr 305/2011 o wyrobach budowlanych (Construction Products Regulation)",
  DWU: "deklaracja właściwości użytkowych",
  EOT: "europejska ocena techniczna",
  KOT: "krajowa ocena techniczna",
  ITB: "Instytut Techniki Budowlanej",
  ETICS: "złożony system ocieplenia ścian zewnętrznych (External Thermal Insulation Composite System)",
  PN: "Polska Norma",
  PKN: "Polski Komitet Normalizacyjny",
  NFPA: "amerykańskie stowarzyszenie ochrony przeciwpożarowej (National Fire Protection Association)",
  ISAP: "Internetowy System Aktów Prawnych Sejmu - oficjalne teksty ustaw i rozporządzeń",
  BIP: "Biuletyn Informacji Publicznej",
  DCBE: "dostępny czas bezpiecznej ewakuacji (ASET)",
  WCBE: "wymagany czas bezpiecznej ewakuacji (RSET)",
  ASET: "dostępny czas bezpiecznej ewakuacji (Available Safe Egress Time)",
  RSET: "wymagany czas bezpiecznej ewakuacji (Required Safe Egress Time)",
  AED: "automatyczny defibrylator zewnętrzny",
  NOD: "nieostrożność osób dorosłych (grupa przyczyn pożarów w statystyce PSP)",
  NON: "nieostrożność osób nieletnich (grupa przyczyn pożarów w statystyce PSP)",
  OZO: "obiekty zbiorowej ochrony (schrony, ukrycia)",
  RCB: "Rządowe Centrum Bezpieczeństwa",
  ZRM: "zespół ratownictwa medycznego",
  MON: "Ministerstwo Obrony Narodowej",
  ABW: "Agencja Bezpieczeństwa Wewnętrznego",
  SOP: "Służba Ochrony Państwa",
  CBA: "Centralne Biuro Antykorupcyjne",
  NIK: "Najwyższa Izba Kontroli",
  UE: "Unia Europejska",
};

// Skróty o dwóch znaczeniach - rozstrzyga tekst tuż przed skrótem.
const DWUZNACZNE = {
  KW: (przed) => (CZESC_ARTYKULU.test(przed) ? "Kodeks wykroczeń" : "komendant wojewódzki PSP"),
  KP: (przed) => (CZESC_ARTYKULU.test(przed) ? "Kodeks pracy" : "komendant powiatowy (miejski) PSP"),
  PRM: (przed) => (/rozp\.\s*$/u.test(przed) ? "Prezes Rady Ministrów" : "Państwowe Ratownictwo Medyczne"),
};

const KATEGORIA_ZL = /^ZL\s?(IV|V|I{1,3}|[1-5])$/u;
const RZYMSKIE = ["I", "II", "III", "IV", "V"];
const KLUCZE_SKROTOW = [...Object.keys(SKROTY), ...Object.keys(DWUZNACZNE)].filter((k) => !k.startsWith("ZL ")).sort((a, b) => b.length - a.length);
const SKROT = new RegExp(`(?<![\\p{L}\\d])(ZL\\s?(?:IV|V|I{1,3}|[1-5])|${KLUCZE_SKROTOW.join("|")})(?![\\p{L}\\d])`, "gu");

const BLOK = "p,li,td,th,dd,dt,h1,h2,h3,blockquote,.row-title,.row-sub,.l-margines,.l-kontekst,span,div";
const BEZ_LINKOW = "a,button,input,textarea,select,svg,.law,.chip,.l-margines,.nav-header,.tab-bar,#dymek";
const BEZ_SKROTOW = "a,input,textarea,select,svg,.nav-header,.tab-bar,#dymek,button:not(.l-karta)";

let indeksPrzepisow = null;
let indeksIsap = {};
// Skąd wzięto akt ostatniego odnośnika: nazwa w tekście, kod bloku albo akt domyślny (do kontroli).
let skadAkt = "";

// Plik aktu dla odnośnika: nazwa po łańcuchu, nazwa tuż przed, potem akt źródła punktu.
function aktOdnosnika(tekstBloku, pocz, kon, domyslny) {
  const reszta = tekstBloku.slice(kon).replace(LANCUCH, "");
  for (const [wzor, plik] of AKT_PO) {
    if (wzor.test(reszta)) {
      skadAkt = "nazwa";
      return plik;
    }
  }
  const przed = tekstBloku.slice(Math.max(0, pocz - 60), pocz);
  const blok = przed.match(BLOK_PRZED);
  if (blok) {
    skadAkt = "blok";
    return AKT_BLOKU[blok[1]] || null;
  }
  for (const [wzor, plik] of AKT_PRZED) {
    if (wzor.test(przed)) {
      skadAkt = "nazwa";
      return plik;
    }
  }
  if (INNY_AKT.test(reszta) && !GOLA_USTAWA.test(reszta)) {
    return null;
  }
  skadAkt = "domyslny";
  return domyslny || null;
}

// Podświetlenie fragmentu na stronie Sejmu: „:~:text=początek,koniec” (Safari 16.1+, Chrome).
// Tylko słowa bez myślników i cudzysłowów - w tekście Sejmu są „–” zamiast „-”. Ta sama logika
// co dyrektywa() w skrypty/zbuduj_indeks_isap.py.
const CZYSTE_SLOWO = /^[0-9A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż.,;:()]+$/;

function zakodujDyrektywe(t) {
  return encodeURIComponent(t).replace(/-/g, "%2D");
}

function dyrektywaTekstu(t) {
  const slowa = String(t).replace(/^\s*(?:\d+[a-z]*[.)]|[a-z]\))\s*/, "").split(/\s+/).filter(Boolean);
  const czyste = slowa.map((w) => CZYSTE_SLOWO.test(w));
  const ok = (od, n) => czyste.slice(od, od + n).length === n && czyste.slice(od, od + n).every(Boolean);
  let pocz = -1;
  for (let i = 0; i <= slowa.length - 4; i++) {
    if (ok(i, 4)) {
      pocz = i;
      break;
    }
  }
  if (pocz < 0) {
    // Krótki cytat (2-3 słowa): najdłuższy ciąg czystych słów, jeśli ma co najmniej 2.
    let ciag = [];
    for (let i = 0; i < slowa.length; i++) {
      for (let k = i + 2; k <= slowa.length; k++) {
        if (czyste.slice(i, k).every(Boolean) && k - i > ciag.length) {
          ciag = slowa.slice(i, k);
        }
      }
    }
    return ciag.length ? `:~:text=${zakodujDyrektywe(ciag.join(" "))}` : "";
  }
  if (slowa.length - pocz <= 8) {
    return `:~:text=${zakodujDyrektywe(slowa.slice(pocz, pocz + 4).join(" "))}`;
  }
  let kon = -1;
  for (let i = slowa.length - 3; i > pocz + 4; i--) {
    if (ok(i, 3)) {
      kon = i;
      break;
    }
  }
  const start = zakodujDyrektywe(slowa.slice(pocz, pocz + 4).join(" "));
  return `:~:text=${start}${kon > 0 ? `,${zakodujDyrektywe(slowa.slice(kon, kon + 3).join(" "))}` : ""}`;
}

// Oficjalny adres jednostki w tekście Sejmu, otwarty na niej i z podświetleniem:
//   cytat (np. dowód zasady lub wiersz z wyszukiwarki) albo numer ustępu, inaczej pierwszy wiersz.
// Akt tylko w PDF - strona PDF bez podświetlenia (PDF w przeglądarce tego nie obsługuje).
function adresUrzedowy(plik, etykieta, opcje = {}) {
  const akt = indeksIsap[plik];
  if (!akt) {
    return "https://isap.sejm.gov.pl/";
  }
  const kotwica = (etykieta && akt.j[etykieta]) || "";
  if (akt.rodzaj !== "html" || !etykieta) {
    return akt.url + kotwica;
  }
  const teksty = (akt.t && akt.t[etykieta]) || {};
  const dyrektywa = (opcje.cytat && dyrektywaTekstu(opcje.cytat)) || (opcje.ust && teksty[opcje.ust]) || teksty[""] || "";
  return `${akt.url}${kotwica || "#"}${dyrektywa}`;
}

function celOdnosnika(plik, znak, nr, czesci) {
  const akt = indeksPrzepisow && indeksPrzepisow[plik];
  const etykieta = `${znak.startsWith("§") ? "§" : "Art."} ${nr}`;
  if (!akt || !akt[etykieta]) {
    return null;
  }
  const ust = (String(czesci || "").match(/ust\.\s?(\d+[a-z]?)/) || [])[1];
  return adresUrzedowy(plik, etykieta, { ust });
}

function pelnaNazwaSkrotu(skrot, przed) {
  const zl = skrot.match(KATEGORIA_ZL);
  if (zl) {
    const nr = /\d/.test(zl[1]) ? RZYMSKIE[Number(zl[1]) - 1] : zl[1];
    return SKROTY[`ZL ${nr}`];
  }
  return DWUZNACZNE[skrot] ? DWUZNACZNE[skrot](przed) : SKROTY[skrot];
}

// Zamienia fragmenty jednego węzła tekstu na elementy; trafienia = [{od, do, html}] posortowane.
function podmienWezel(wezel, trafienia) {
  if (!trafienia.length) {
    return;
  }
  const t = wezel.nodeValue;
  const frag = document.createDocumentFragment();
  let i = 0;
  for (const x of trafienia) {
    frag.append(t.slice(i, x.od));
    const tmp = document.createElement("template");
    tmp.innerHTML = x.html;
    frag.append(tmp.content);
    i = x.do;
  }
  frag.append(t.slice(i));
  wezel.replaceWith(frag);
}

function wezlyTekstu(korzen) {
  const lista = [];
  const w = document.createTreeWalker(korzen, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    lista.push(w.currentNode);
  }
  return lista;
}

function blokWezla(wezel) {
  return wezel.parentElement.closest(BLOK) || wezel.parentElement;
}

// Odnośniki: szukamy w tekście całego bloku (nazwa aktu bywa w innym węźle), linkujemy w węźle.
function linkujBlok(blok) {
  const wezly = wezlyTekstu(blok).filter((w) => !w.parentElement.closest(BEZ_LINKOW) && !w.parentElement.closest(".ref,.skrot"));
  if (!wezly.length) {
    return;
  }
  const calosc = blok.textContent;
  const domyslny = (blok.closest("[data-akt]") || {}).dataset?.akt;
  let szukajOd = 0;
  let poprzedni = null;
  for (const w of wezly) {
    const t = w.nodeValue;
    const start = calosc.indexOf(t, szukajOd);
    if (start < 0) {
      continue;
    }
    szukajOd = start + t.length;
    const trafienia = [];
    for (const m of t.matchAll(ODNOSNIK)) {
      const pocz = start + m.index;
      const kon = pocz + m[0].length;
      if (m[1].startsWith("§") && PARAGRAF_ARTYKULU.test(calosc.slice(Math.max(0, pocz - 40), pocz))) {
        continue;
      }
      // Goły odnośnik: najpierw akt poprzedniego odnośnika w tym samym bloku („§ 271 WT … § 232”).
      const miedzy = poprzedni ? calosc.slice(poprzedni.kon, pocz) : "";
      const przeniesiony = poprzedni && !NAZWA_AKTU.test(miedzy) ? poprzedni.plik : null;
      const plik = aktOdnosnika(calosc, pocz, kon, przeniesiony || domyslny);
      if (plik) {
        poprzedni = { plik, kon };
      }
      const cel = plik && celOdnosnika(plik, m[1], m[2], m[3]);
      if (cel) {
        trafienia.push({ od: m.index, do: m.index + m[0].length, html: `<a class="ref" href="${cel}" target="_blank" rel="noopener" data-skad="${skadAkt}">${esc(m[0])}</a>` });
      }
    }
    podmienWezel(w, trafienia);
  }
}

function skrotujWezel(w) {
  if (w.parentElement.closest(BEZ_SKROTOW) || w.parentElement.closest(".skrot")) {
    return;
  }
  const t = w.nodeValue;
  const trafienia = [];
  for (const m of t.matchAll(SKROT)) {
    const pelna = pelnaNazwaSkrotu(m[1].replace(/\s/g, " "), t.slice(Math.max(0, m.index - 40), m.index));
    if (pelna) {
      trafienia.push({ od: m.index, do: m.index + m[0].length, html: `<abbr class="skrot" tabindex="0" data-pelna="${esc(pelna)}">${esc(m[0])}</abbr>` });
    }
  }
  podmienWezel(w, trafienia);
}

function wzbogac(korzen) {
  if (!korzen.isConnected) {
    return;
  }
  const el = korzen.nodeType === Node.TEXT_NODE ? korzen.parentElement : korzen;
  if (!el || el.closest(".nav-header,.tab-bar")) {
    return;
  }
  const bloki = new Set(wezlyTekstu(el).map(blokWezla));
  if (el.matches && el.matches(BLOK)) {
    bloki.add(el);
  }
  bloki.forEach(linkujBlok);
  wezlyTekstu(el).forEach(skrotujWezel);
}

// ── Dymek z pełną nazwą: najechanie myszą albo stuknięcie palcem ──

function pokazDymek(abbr) {
  let d = document.getElementById("dymek");
  if (!d) {
    d = document.createElement("div");
    d.id = "dymek";
    document.body.appendChild(d);
  }
  d.textContent = abbr.dataset.pelna;
  d.className = "on";
  const r = abbr.getBoundingClientRect();
  const szer = Math.min(300, window.innerWidth - 24);
  d.style.width = `${szer}px`;
  d.style.left = `${Math.max(12, Math.min(r.left + r.width / 2 - szer / 2, window.innerWidth - szer - 12))}px`;
  const nad = r.top > d.offsetHeight + 70;
  d.style.top = `${nad ? r.top - d.offsetHeight - 8 : r.bottom + 8}px`;
  stan.dymekDla = abbr;
}

function schowajDymek() {
  const d = document.getElementById("dymek");
  if (d) {
    d.className = "";
  }
  stan.dymekDla = null;
}

// Tylko prawdziwa mysz - na telefonie przeglądarka udaje „najechanie” przy stuknięciu.
document.addEventListener("mouseover", (e) => {
  const a = matchMedia("(hover: hover)").matches && e.target.closest && e.target.closest(".skrot");
  if (a) {
    pokazDymek(a);
  }
});
document.addEventListener("mouseout", (e) => {
  if (e.target.closest && e.target.closest(".skrot") && matchMedia("(hover: hover)").matches) {
    schowajDymek();
  }
});
// Faza przechwytywania: stuknięcie w skrót na karcie pułapki nie odwraca karty.
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest(".skrot");
  if (!a) {
    schowajDymek();
    return;
  }
  e.stopPropagation();
  e.preventDefault();
  stan.dymekDla === a && !matchMedia("(hover: hover)").matches ? schowajDymek() : pokazDymek(a);
}, true);
window.addEventListener("scroll", schowajDymek, { passive: true });

// ── Podpięcie: wszystko, co pojawi się w #widok ──

async function startOdnosnikow() {
  try {
    [indeksPrzepisow, indeksIsap] = await Promise.all(["indeks", "indeks_isap"].map((n) => fetch(`data/przepisy/${n}.json`).then((r) => r.json())));
  } catch (e) {
    indeksPrzepisow = {};
  }
  const widokEl = document.getElementById("widok");
  const obserwator = new MutationObserver((zmiany) => {
    obserwator.disconnect();
    zmiany.forEach((z) => z.addedNodes.forEach((n) => (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE) && wzbogac(n)));
    obserwator.observe(widokEl, { childList: true, subtree: true });
  });
  wzbogac(widokEl);
  obserwator.observe(widokEl, { childList: true, subtree: true });
}

// Obietnica dla app.js: widoki rysujemy dopiero, gdy znamy oficjalne adresy przepisów.
const gotoweOdnosniki = startOdnosnikow();
