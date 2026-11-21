// Poszerz wiedzę - tematy wokół pytań egzaminacyjnych, wytłumaczonych jak na wykładzie i jak inspektor
// tłumaczy właścicielowi firmy (prośba Tomka 2.11.2026). Liczby sprawdzone w tekstach przepisów (WT, rozp. 2010,
// rozp. 2009, rozp. 2023/1707) i tabelach z Dz.U.; paragrafy zamieniają się w linki do Sejmu (odnosniki.js).
//
//   #/poszerz        lista tematów
//   #/poszerz/ID     temat: po ludzku, dla właściciela, przykłady, tabele, rysunki, pułapki egzaminacyjne

TRASY.push(
  [/^#\/poszerz$/, () => widokPoszerz()],
  [/^#\/poszerz\/([\w-]+)$/, (m) => widokTematuPoszerz(m[1])],
);

// ── Klocki treści ──

const tab = (naglowki, wiersze) => `<div class="pz-tabela"><table><thead><tr>${naglowki.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${wiersze.map((w) => `<tr>${w.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const ludzku = (t) => `<div class="pz-ramka pz-ludzku"><p class="pz-etyk">Po ludzku</p>${t}</div>`;
const wlasciciel = (t) => `<div class="pz-ramka pz-firma"><p class="pz-etyk">Jak to powiedzieć właścicielowi firmy</p>${t}</div>`;
const pulapki = (lista) => `<div class="pz-ramka pz-pulapki"><p class="pz-etyk">Na egzaminie uważaj</p><ul>${lista.map((x) => `<li>${x}</li>`).join("")}</ul></div>`;
const rys = (svg, podpis) => `<figure class="pz-rys">${svg}<figcaption>${podpis}</figcaption></figure>`;

// Prawdziwe zdjęcia z Wikimedia Commons (wolne licencje - podpis autora i licencji jest obowiązkowy).
const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const ZDJECIA = {
  "czujka-dymu-ssp": ["Czujka dymu SSP w gnieździe na suficie: szczeliny dookoła, dioda z boku", "Georg Pik", "CC0", "Smoke_detector,_Russia_(11).jpg"],
  "czujka-dymu-adres": ["Czujka SSP z tabliczką adresu „7/2” (linia 7, czujka 2) i czerwonym przewodem", "autor nieznany", "CC BY-SA 2.0 DE", "Brandmelder_bma.jpg"],
  "czujka-ciepla": ["Czujka ciepła adresowalna: mało otworów, czujnik w środku", "Masanalv", "CC BY-SA 3.0", "Heat_Detector.jpg"],
  "czujka-wielosensorowa": ["Czujka dymu i ciepła w jednej obudowie (wielosensorowa)", "Georg Pik", "CC0", "Smoke,_heat_detector_IPK-TU.jpg"],
  "czujka-autonomiczna": ["Czujka autonomiczna dymu: bez kabla, z dużym przyciskiem TEST", "Andy Mabbett", "CC BY-SA 4.0", "FireAngel_smoke_detector_system_-_2021-07-07_-_Andy_Mabbett_-_03.jpg"],
  "czujka-czadu": ["Czujka czadu (CO) na ścianie, z wyświetlaczem", "Donald Trung Quoc Don", "CC BY-SA 4.0", "FA370_Carbon_monoxide_detector,_The_Hague_(2019)_01.jpg"],
  "czujka-plomienia": ["Czujka płomienia (nadfiolet UV) w obudowie przemysłowej", "Thomas Dohrendorf", "CC BY-SA 3.0", "UV-flame-detector-Flammenmelder-Minimax.jpg"],
  "czujka-plomienia2": ["Czujka płomienia IR/UV na uchwycie - kierowana skośnie w dół", "Vladimir19880", "CC0", "%D0%98%D0%B7%D0%B2%D0%B5%D1%89%D0%B0%D1%82%D0%B5%D0%BB%D1%8C_%D0%BF%D0%BE%D0%B6%D0%B0%D1%80%D0%BD%D1%8B%D0%B9_%D0%BF%D0%BB%D0%B0%D0%BC%D0%B5%D0%BD%D0%B8_%D0%A4%D0%B5%D0%BD%D0%B8%D0%BA%D1%81_%D0%98%D0%9A-%D0%A3%D0%A4.jpg"],
  "czujka-liniowa": ["Czujka liniowa dymu: nadajnik i odbiornik; wiązka idzie przez całą halę", "Fire Fighting Enterprises", "CC BY 3.0", "Optical_beam_smoke_detector.jpg"],
  "czujka-zasysajaca": ["Czujka zasysająca: skrzynka na ścianie, od góry wchodzi rura z otworami", "Stephan Weiß", "CC BY-SA 3.0", "ASD516.jpg"],
  "tryskacz": ["Tryskacz z czerwoną ampułką - otworzy się przy 68 °C", "Tony Webster", "CC BY-SA 4.0", "Fire_Sprinkler_Head_with_Red_Fluid_(55563049651).jpg"],
  "rop": ["Polski ręczny ostrzegacz pożarowy: „W razie pożaru wycisnąć środek szybki, wcisnąć przycisk”", "Panek", "CC BY-SA 4.0", "Alarm_w_razie_po%C5%BCaru_wycisn%C4%85%C4%87_%C5%9Brodek_szybki_wcisn%C4%85%C4%87_przycisk.jpg"],
  "beben-przedluzacza": ["Przedłużacz na bębnie - przy dużym obciążeniu rozwiń go do końca", "Fumikas Sagisavas", "CC0", "Cable_reel_extension_cord.jpg"],
  "bateria-spuchnieta": ["Spuchnięta bateria telefonu - obudowa wygięta jak poduszka", "Saimmx", "CC0", "20250807_200849_Swollen_Samsung_battery,_side.jpg"],
  "korytarz-pusty": ["Długi korytarz z wyjściem na końcu - tak wygląda dojście ewakuacyjne", "O T", "CC0", "Liminal_space_emergency_exit.jpg"],
  "korytarz-wyjscie": ["Podświetlany znak drogi ewakuacyjnej - strzałka pokazuje kierunek", "Megalesius", "CC BY-SA 3.0", "Emergency_exit.jpg"],
  "klatka-wyjscie": ["Klatka schodowa z drzwiami wyjścia - tu kończy się albo trwa dalej dojście", "诺尔0", "CC0", "Stair_Corner_with_Emergency_Exit.jpg"],
  "dzwignia-antypaniczna": ["Dźwignia antypaniczna - drzwi otwiera samo pchnięcie, bez klucza i klamki", "Jonathan Clemens", "CC BY-SA 3.0", "Panic_bar.jpg"],
  "hydrant-nadziemny": ["Hydrant nadziemny w Polsce - na wsi często stoi w trawie przy drodze", "Natalia Woltman", "CC BY-SA 4.0", "HydrantH4.jpg"],
  "hydrant-nadziemny2": ["Hydrant nadziemny w Jerutkach przy ogrodzeniu - sprawdź, czy nic go nie zasłania", "GringoPL", "CC BY-SA 3.0 PL", "Jerutki_-_hydrant.jpg"],
  "tabliczka-hydrantu": ["Tabliczka hydrantu na słupku - pokazuje, gdzie szukać hydrantu podziemnego", "Panek", "CC BY-SA 4.0", "Hydrant_na_rogu_marzycielek_i_wizjonerek.jpg"],
  "tabliczka-hydrantu2": ["Hydrant przy drodze w Poniniu - blisko jezdni, wóz podjedzie wprost do niego", "MOs810", "CC BY-SA 4.0", "Ponin_(2).jpg"],
  "hydrant-wewnetrzny2": ["Szafka hydrantu wewnętrznego z wężem i gaśnicą obok", "Downtowngal", "CC BY-SA 4.0", "Fire_hose_cabinet_on_wall.jpg"],
  "altus-katowice": ["Altus w Katowicach (ok. 125 m) - budynek wysokościowy (WW), ponad 55 m", "MichalPL", "CC BY-SA 4.0", "Altus_Skyscraper_in_Katowice,_December_2020.jpg"],
  "myszkow-kosciuszki": ["Kamienica w Myszkowie, dwie kondygnacje i poddasze - budynek niski (N), poniżej 12 m", "Kamil Czaiński", "CC BY-SA 4.0", "Myszk%C3%B3w,_ulica_Ko%C5%9Bciuszki.jpg"],
  "zawiercie-taz": ["Osiedle TAZ w Zawierciu z lotu ptaka - niska zabudowa i szkoła", "Adrian Tync", "CC BY-SA 4.0", "Zawiercie_osiedle_TAZ_aerial_2026.jpg"],
  "rozgorzenie": ["Rozgorzenie na pokazie - w kilka sekund pali się całe wnętrze", "Pabloboj", "CC BY-SA 4.0", "Flashover001.jpg"],
  "rozgorzenie-kontener": ["Ćwiczenia strażaków w kontenerze do rozgorzeń - płomienie pod sufitem", "Kenneth Norman, US Air Force", "domena publiczna", "97th_CES_fire_department_conducts_flashover_training_120828-F-QX786-116.jpg"],
  "dym-pozar-domu": ["Pożar domu - czarny dym z tworzyw widać z daleka", "Harvest", "CC BY-SA 4.0", "House_fire_with_smoke.jpg"],
  "dym-cwiczenie": ["Strażak w dymie na ćwiczeniach - widoczność spada do kilku metrów", "Staffsfire", "CC BY-SA 4.0", "Smoke_house_training.jpg"],
  "plyta-warstwowa": ["Płyty warstwowe - blacha z rdzeniem; klasę decyduje rdzeń (wełna, PIR, styropian)", "Mesadbal", "CC0", "Cold_Room_Panel.jpg"],
  "welna-mineralna": ["Wełna mineralna w płytach i rolkach - zwykle A1, materiał niepalny", "FMI Fachverband Mineralwolleindustrie", "CC BY-SA 3.0 DE", "Arrangement_Mineralwolle.jpeg"],
  "znak-ex": ["Znak „EX” - wejście do strefy zagrożenia wybuchem (żółty trójkąt z czarną obwódką)", "CEphoto, Uwe Aranas", "CC BY-SA 4.0", "Cologne_Germany_Explosion-Hazard-sign-01.jpg"],
  "kabina-lakiernicza": ["Kabina lakiernicza w warsztacie - wnętrze to strefa zagrożenia wybuchem", "Scientificranking", "CC BY 4.0", "Automotive_Paint_Booth.jpg"],
  "gasnica-pl": ["Gaśnica na ścianie, nad nią znak gaśnicy - tak ma być oznakowana", "Grzegorz W. Tężycki", "CC BY-SA 4.0", "Fire_extinguisher_100311-pl.jpg"],
  "gasnica-pl2": ["Gaśnica proszkowa 6 kg na wieszaku - najczęstsza gaśnica w firmach", "Grzegorz W. Tężycki", "CC BY-SA 4.0", "Fire_extinguisher_~20tzvopb.jpg"],
  "gasnica-proszkowa": ["Mała gaśnica proszkowa 1 kg (samochodowa)", "Beax", "CC BY-SA 3.0", "Gasnica_proszkowa_beax.jpg"],
  "koc-gasniczy": ["Koc gaśniczy w pokrowcu - wyciąga się za taśmy i przykrywa mały płonący przedmiot", "JonathanLamb", "domena publiczna", "Fire-blanket-on-display.jpg"],
  "koc-i-gasnica": ["Gaśnica pianowa i koc gaśniczy obok siebie - typowy zestaw do kuchni i małych pomieszczeń", "Sinikka Halme", "CC BY-SA 4.0", "Foam_fire_extinguisher_and_fire_blanket_01.jpg"],
  "gasnica-co2": ["Gaśnica przewoźna śniegowa (CO₂) na kółkach", "Shift", "CC BY-SA 3.0", "Carbon%E2%80%93dioxide%E2%80%93fire%E2%80%93extinguisher.jpg"],
  "droga-pozarowa": ["Oznakowanie leśnej drogi pożarowej nr 53 - w lasach drogi wyznacza nadleśnictwo, przy budynkach obowiązuje rozporządzenie z 2009 r.", "Jarosław Szczepaniak", "CC BY-SA 3.0", "Droga_Po%C5%BCarowa_nr._53_-_panoramio.jpg"],
  "spawanie": ["Spawanie łukowe - temperatura łuku i rozpryskujący metal zapalają wszystko w promieniu kilku metrów", "TWI Ltd", "CC BY-SA 4.0", "Shielded_metal_arc_welding_at_TWI_Ltd.jpg"],
  "iskry-spawanie": ["Iskry przy cięciu i spawaniu lecą daleko i wpadają w szczeliny, gdzie potrafią tlić się godzinami", "Steve Jurvetson", "CC BY 2.0", "Welding_Sparks_(3843951412).jpg"],
  "pwp": ["Przeciwpożarowy wyłącznik prądu w Polsce - czerwony przycisk pod znakiem z błyskawicą i napisem", "Sławomir Ochrem", "CC BY-SA 4.0", "Przeciwpo%C5%BCarowy_wy%C5%82%C4%85cznik_pr%C4%85du.JPG"],
  "pwp2": ["Wejście do budynku - przeciwpożarowy wyłącznik prądu wisi tuż przy drzwiach, tam gdzie wchodzi straż", "Sławomir Ochrem", "CC BY-SA 4.0", "Przeciwpo%C5%BCarowy_wy%C5%82%C4%85cznik_pr%C4%85du_2.JPG"],
  "rozdzielnica-mieszkanie": ["Rozdzielnica w mieszkaniu w Poznaniu - wyłączniki nadprądowe i różnicowoprądowe", "Koefbac", "CC0", "Rozdzielnica_elektryczna_w_mieszkaniu_na_osiedlu_Stare_%C5%BBegrze_125_w_Poznaniu_-_wrzesie%C5%84_2026.jpg"],
  "kominiarz": ["Kominiarz przy czyszczeniu komina - w firmach i budynkach wielorodzinnych tylko osoba z kwalifikacjami kominiarskimi", "Thunk", "domena publiczna", "Chimney_sweep_modern.jpg"],
  "pv-klodzko": ["Fotowoltaika na płaskim dachu budynku w Kłodzku - dziesiątki modułów i setki złączy na dachu", "Jacek Halicki", "CC BY-SA 4.0", "2024_Panele_fotowoltaiczne_przy_ul._Kusoci%C5%84skiego_w_K%C5%82odzku.jpg"],
  "pv-szkola": ["Panele na dachu Szkoły Podstawowej nr 1 w Kłodzku - przy pożarze dachu w słońcu dalej jest napięcie", "Jacek Halicki", "CC BY-SA 4.0", "2024_Szko%C5%82a_Podstawowa_Nr_1_w_K%C5%82odzku_(05).jpg"],
  "falownik": ["Falownik (inwerter) - zamienia prąd stały z paneli na zmienny; radiator nagrzewa się, nie na palnym podłożu", "Asurnipal", "CC BY-SA 4.0", "Inverter_Fronius_%3D_Sunways_NT_6000-01ASD.jpg"],
  "zniwa": ["Żniwa w Kościelnikach koło Kłodzka - kombajn przy suchym zbożu to ryzyko pożaru pola", "Jacek Halicki", "CC BY-SA 4.0", "2014_K%C5%82odzko,_%C5%BCniwa_w_Ko%C5%9Bcielnikach_03.JPG"],
  "kombajn-bizon": ["Kombajn Bizon na polu przy zabudowie - iskry z wydechu i gorące elementy zapalają słomę", "Aw58", "CC BY-SA 4.0", "Bizon_%E2%80%93_kombajn_rolniczy_DSCF4831.jpg"],
  "drzwi-strych": ["Drzwi przeciwpożarowe na klatce schodowej, oznakowane znakiem - mają być zamknięte albo zamykać się same", "Andersreilund", "CC BY-SA 4.0", "Brandd%C3%B6rrar_vindsv%C3%A5ning,_G%C3%B6teborg_(S4024074).jpg"],
  "tabliczka-drzwi": ["Tabliczka znamionowa w ościeżnicy drzwi przeciwpożarowych - tu sprawdzasz klasę (np. EI 30) i producenta", "Besserwisser123", "CC BY-SA 4.0", "2plakette_mit_typ.jpg"],
  "garaz-podziemny": ["Garaż podziemny pod biurowcem - zamknięty, oświetlony tylko sztucznie, z wentylacją mechaniczną", "Panek", "CC BY-SA 4.0", "Biurowiec_hop_gara%C5%BC_podziemny.jpg"],
  "garaz-wielopoziomowy": ["Garaż wielopoziomowy z otwartymi ścianami - przykład garażu otwartego, przewietrzanego naturalnie", "Leonhard Lenz", "CC BY-SA 4.0", "Multistorey_car_park_Stabholzgarten_03.jpg"],
  "stacja-paliw": ["Stacja paliw w Świerczowie - po prawej biały naziemny zbiornik gazu płynnego", "Patryk Duszkiewicz", "CC BY-SA 4.0", "Stacja_paliw_Orlen_w_%C5%9Awierczowie.jpg"],
  "stacja-paliw2": ["Stacja paliw w Kłodzku wciśnięta między kamienice - odległości od budynków mają tu ogromne znaczenie", "Jacek Halicki", "CC BY-SA 4.0", "2025_K%C5%82odzko,_ul._Po%C5%82abska,_stacja_paliw_Orlen_(1).jpg"],
  "cnbop-badania": ["Badanie spalania w CNBOP - pożar testowy pozwala odtworzyć, jak rozwijał się prawdziwy pożar", "pracownik CNBOP", "CC BY-SA 4.0", "Badania_spalania.JPG"],
  "sciana-ogniowa2": ["Ściana oddzielenia przeciwpożarowego między domami szeregowymi - wystaje ponad dach", "Achim Hering", "domena publiczna", "Brandwand_2.jpg"],
};

// Ramki „lekcyjne”: Z wykładu = opowieść jak stenogram z zajęć; Przykład = zadanie policzone krok po kroku.
const wyklad = (t) => `<div class="pz-ramka pz-wyklad"><p class="pz-etyk">Z wykładu</p>${t}</div>`;
const przyklad = (tytul, t) => `<div class="pz-ramka pz-przyklad"><p class="pz-etyk">Przykład: ${tytul}</p>${t}</div>`;

// Siatka zdjęć: galeria(["tryskacz", "rop"]) → kafelki z podpisem i źródłem.
const galeria = (klucze) => `<div class="pz-galeria">${klucze.map((k) => {
  const [podpis, autor, licencja, plik] = ZDJECIA[k];
  return `<figure class="pz-zdj"><img src="zdjecia/${k}.jpg" alt="${podpis}" loading="lazy"><figcaption>${podpis}<small>fot. ${autor}, ${licencja}, <a target="_blank" rel="noopener" href="${COMMONS}${plik}">Wikimedia Commons</a></small></figcaption></figure>`;
}).join("")}</div>`;

// ── Rysunki (SVG, kolory z motywu przez currentColor i klasy) ──

const SVG_HYDRANTY = `<svg viewBox="0 0 360 230" role="img" aria-label="Odległości hydrantów zewnętrznych">
  <rect x="0" y="170" width="360" height="34" class="s-droga"/><text x="180" y="191" class="s-t" text-anchor="middle">ulica</text>
  <rect x="120" y="30" width="110" height="80" class="s-bud"/><text x="175" y="75" class="s-t" text-anchor="middle">chroniony budynek</text>
  <circle cx="160" cy="150" r="7" class="s-hyd"/><text x="172" y="154" class="s-t s-czer">H1</text>
  <circle cx="20" cy="150" r="7" class="s-hyd"/><text x="32" y="154" class="s-t s-czer">H2</text>
  <line x1="160" y1="140" x2="160" y2="112" class="s-wym"/><text x="98" y="130" class="s-t">≥ 5 m od ściany</text>
  <line x1="20" y1="214" x2="160" y2="214" class="s-wym"/><text x="90" y="226" class="s-t" text-anchor="middle">między hydrantami ≤ 150 m</text>
  <line x1="245" y1="70" x2="245" y2="150" class="s-wym"/><text x="252" y="112" class="s-t">najbliższy ≤ 75 m</text>
  <line x1="300" y1="150" x2="300" y2="170" class="s-wym"/><text x="252" y="162" class="s-t">≤ 15 m od jezdni</text>
</svg>`;

const SVG_FAZY = `<svg viewBox="0 0 360 220" role="img" aria-label="Fazy pożaru - temperatura w czasie">
  <line x1="40" y1="190" x2="350" y2="190" class="s-os"/><line x1="40" y1="190" x2="40" y2="15" class="s-os"/>
  <text x="345" y="206" class="s-t" text-anchor="end">czas</text><text x="44" y="22" class="s-t">temperatura</text>
  <rect x="40" y="15" width="85" height="175" class="s-faza1"/><rect x="125" y="15" width="120" height="175" class="s-faza2"/><rect x="245" y="15" width="105" height="175" class="s-faza3"/>
  <path d="M40 185 C80 182 105 160 120 120 C125 90 135 45 160 40 L220 38 C250 40 270 90 300 140 C320 170 335 180 350 184" class="s-krzywa"/>
  <circle cx="122" cy="110" r="5" class="s-hyd"/><text x="64" y="104" class="s-t s-czer">rozgorzenie</text>
  <text x="82" y="178" class="s-t" text-anchor="middle">I faza</text><text x="82" y="166" class="s-m" text-anchor="middle">rozwój</text>
  <text x="185" y="178" class="s-t" text-anchor="middle">II faza</text><text x="185" y="166" class="s-m" text-anchor="middle">pełny rozwój</text>
  <text x="298" y="178" class="s-t" text-anchor="middle">III faza</text><text x="298" y="166" class="s-m" text-anchor="middle">wygasanie</text>
  <text x="190" y="32" class="s-m" text-anchor="middle">800-1100 °C</text>
</svg>`;

const SVG_EWAK = `<svg viewBox="0 0 360 200" role="img" aria-label="Przejście i dojście ewakuacyjne">
  <rect x="10" y="10" width="160" height="120" class="s-bud"/><text x="90" y="28" class="s-t" text-anchor="middle">pomieszczenie</text>
  <rect x="170" y="10" width="40" height="180" class="s-kor"/><text x="190" y="105" class="s-m" text-anchor="middle" transform="rotate(-90 190 105)">korytarz</text>
  <rect x="210" y="150" width="140" height="40" class="s-strefa"/><text x="280" y="175" class="s-t" text-anchor="middle">na zewnątrz / inna strefa</text>
  <circle cx="25" cy="120" r="5" class="s-hyd"/><text x="22" y="145" class="s-m">najdalsze miejsce</text>
  <path d="M25 115 L90 115 L150 70 L168 70" class="s-przejscie"/><text x="62" y="98" class="s-t s-zie">PRZEJŚCIE</text>
  <path d="M190 72 L190 170 L210 170" class="s-dojscie"/><text x="216" y="120" class="s-t s-nie">DOJŚCIE</text>
  <text x="216" y="134" class="s-m">po osi korytarza</text>
</svg>`;

const SVG_WYSOKOSCI = `<svg viewBox="0 0 360 230" role="img" aria-label="Grupy wysokości budynków">
  <line x1="10" y1="210" x2="350" y2="210" class="s-os"/>
  <rect x="25" y="170" width="50" height="40" class="s-bud"/><text x="50" y="225" class="s-t" text-anchor="middle">N</text><text x="50" y="164" class="s-m" text-anchor="middle">do 12 m</text>
  <rect x="105" y="130" width="50" height="80" class="s-bud"/><text x="130" y="225" class="s-t" text-anchor="middle">SW</text><text x="130" y="124" class="s-m" text-anchor="middle">12-25 m</text>
  <rect x="185" y="70" width="50" height="140" class="s-bud"/><text x="210" y="225" class="s-t" text-anchor="middle">W</text><text x="210" y="64" class="s-m" text-anchor="middle">25-55 m</text>
  <rect x="265" y="12" width="50" height="198" class="s-bud"/><text x="290" y="225" class="s-t" text-anchor="middle">WW</text><text x="290" y="28" class="s-m" text-anchor="middle">ponad 55 m</text>
  <text x="50" y="194" class="s-m" text-anchor="middle">≤ 4 kond.</text><text x="130" y="174" class="s-m" text-anchor="middle">5-9 kond.</text><text x="210" y="144" class="s-m" text-anchor="middle">10-18 kond.</text>
</svg>`;

const SVG_STACJA = `<svg viewBox="0 0 360 230" role="img" aria-label="Strefy zagrożenia wybuchem na stacji paliw">
  <line x1="0" y1="140" x2="360" y2="140" class="s-os"/><text x="352" y="134" class="s-m" text-anchor="end">teren</text>
  <rect x="60" y="160" width="140" height="50" rx="20" class="s-z0"/><text x="130" y="190" class="s-t" text-anchor="middle">zbiornik - wnętrze: strefa 0</text>
  <line x1="185" y1="160" x2="185" y2="40" class="s-rura"/><circle cx="185" cy="40" r="42" class="s-z2"/><text x="185" y="18" class="s-m" text-anchor="middle">odpowietrzenie: strefa 2, r = 1,5 m</text>
  <rect x="250" y="70" width="40" height="70" class="s-bud"/><rect x="254" y="100" width="32" height="38" class="s-z1"/>
  <text x="300" y="96" class="s-m">odmierzacz:</text><text x="300" y="108" class="s-m">hydraulika -</text><text x="300" y="120" class="s-m">strefa 1</text>
  <circle cx="90" cy="140" r="26" class="s-z2"/><text x="90" y="118" class="s-m" text-anchor="middle">studzienka zlewowa: strefa 2, r = 1 m</text>
  <rect x="10" y="212" width="12" height="10" class="s-z0"/><text x="26" y="221" class="s-m">0 - stale</text>
  <rect x="100" y="212" width="12" height="10" class="s-z1"/><text x="116" y="221" class="s-m">1 - czasami</text>
  <rect x="200" y="212" width="12" height="10" class="s-z2"/><text x="216" y="221" class="s-m">2 - rzadko i krótko</text>
</svg>`;

const SVG_DGW = `<svg viewBox="0 0 360 230" role="img" aria-label="Zakresy wybuchowości gazów od DGW do GGW">
  <text x="95" y="16" class="s-m">stężenie gazu w powietrzu, % objętości</text>
  <line x1="95.0" y1="28" x2="95.0" y2="194" class="s-os" stroke-dasharray="2 3"/><text x="95.0" y="206" class="s-m" text-anchor="middle">0%</text><line x1="157.5" y1="28" x2="157.5" y2="194" class="s-os" stroke-dasharray="2 3"/><text x="157.5" y="206" class="s-m" text-anchor="middle">25%</text><line x1="220.0" y1="28" x2="220.0" y2="194" class="s-os" stroke-dasharray="2 3"/><text x="220.0" y="206" class="s-m" text-anchor="middle">50%</text><line x1="282.5" y1="28" x2="282.5" y2="194" class="s-os" stroke-dasharray="2 3"/><text x="282.5" y="206" class="s-m" text-anchor="middle">75%</text><line x1="345.0" y1="28" x2="345.0" y2="194" class="s-os" stroke-dasharray="2 3"/><text x="345.0" y="206" class="s-m" text-anchor="middle">100%</text>
  <text x="88" y="45" class="s-t" text-anchor="end">wodór</text><rect x="95" y="34" width="250" height="14" class="s-droga"/><rect x="105.2" y="34" width="175.2" height="14" class="s-z0"/><text x="284.5" y="45" class="s-m">4,1-74,2%</text>
  <text x="88" y="71" class="s-t" text-anchor="end">acetylen</text><rect x="95" y="60" width="250" height="14" class="s-droga"/><rect x="101.2" y="60" width="193.8" height="14" class="s-z0"/><text x="299.0" y="71" class="s-m">2,5-80,0%</text>
  <text x="88" y="97" class="s-t" text-anchor="end">tlenek węgla</text><rect x="95" y="86" width="250" height="14" class="s-droga"/><rect x="126.2" y="86" width="154.2" height="14" class="s-z0"/><text x="284.5" y="97" class="s-m">12,5-74,2%</text>
  <text x="88" y="123" class="s-t" text-anchor="end">metan</text><rect x="95" y="112" width="250" height="14" class="s-droga"/><rect x="108.2" y="112" width="21.8" height="14" class="s-z0"/><text x="134.0" y="123" class="s-m">5,3-14,0%</text>
  <text x="88" y="149" class="s-t" text-anchor="end">propan</text><rect x="95" y="138" width="250" height="14" class="s-droga"/><rect x="101.0" y="138" width="17.8" height="14" class="s-z0"/><text x="122.8" y="149" class="s-m">2,4-9,5%</text>
  <text x="88" y="175" class="s-t" text-anchor="end">butan</text><rect x="95" y="164" width="250" height="14" class="s-droga"/><rect x="99.8" y="164" width="16.2" height="14" class="s-z0"/><text x="120.0" y="175" class="s-m">1,9-8,4%</text>
  <rect x="10" y="214" width="12" height="10" class="s-z0"/><text x="26" y="223" class="s-m">zakres wybuchowy: od DGW (lewa krawędź) do GGW (prawa)</text>
</svg>`;

const SVG_OBCHOD = `<svg viewBox="0 0 360 250" role="img" aria-label="Wartości wokół budynku przy obchodzie">
  <rect x="0" y="196" width="360" height="30" class="s-droga"/><text x="180" y="215" class="s-t" text-anchor="middle">droga pożarowa: szer. 4 m, spadek do 5%, łuk min. 11 m</text>
  <rect x="110" y="40" width="160" height="90" class="s-bud"/><text x="190" y="80" class="s-t" text-anchor="middle">budynek</text><text x="190" y="94" class="s-m" text-anchor="middle">wyłącznik prądu przy wejściu</text>
  <line x1="30" y1="130" x2="30" y2="196" class="s-wym"/><line x1="24" y1="130" x2="110" y2="130" class="s-os" stroke-dasharray="2 3"/><text x="36" y="158" class="s-t">5-15 m (ZL)</text><text x="36" y="170" class="s-t">5-25 m (inne)</text>
  <line x1="165" y1="140" x2="165" y2="190" stroke="#1e7a4c" stroke-width="5"/><text x="172" y="150" class="s-m">drzewa, płoty: do 3 m</text>
  <circle cx="320" cy="186" r="7" class="s-hyd"/><text x="310" y="172" class="s-t s-czer" text-anchor="end">hydrant ≤ 75 m</text><text x="310" y="183" class="s-m" text-anchor="end">≥ 5 m od ściany</text>
  <rect x="280" y="50" width="10" height="16" class="s-z2"/><text x="296" y="56" class="s-m">kurek gazu</text><text x="296" y="67" class="s-m">≤ 10 m od</text><text x="296" y="78" class="s-m">budynku</text>
  <rect x="112" y="10" width="60" height="22" class="s-z1"/><text x="180" y="18" class="s-m">palne pod ścianą: ≥ 5 m</text><text x="180" y="29" class="s-m">od drogi pożarowej</text>
  <line x1="352" y1="96" x2="352" y2="150" class="s-os" stroke-dasharray="5 4"/><text x="346" y="110" class="s-m" text-anchor="end">granica</text><text x="346" y="121" class="s-m" text-anchor="end">działki:</text><text x="346" y="132" class="s-m" text-anchor="end">palne ≥ 4 m</text>
  <text x="180" y="244" class="s-m" text-anchor="middle">plac do zawracania 20 × 20 m albo cofanie najwyżej 15 m</text>
</svg>`;

// ── Tematy ──

const POSZERZ = [
  {
    id: "ibp", skrot: "IBP", tytul: "Instrukcja bezpieczeństwa pożarowego - kto musi mieć",
    html: () => nbsp(`
${ludzku(`<p>IBP to „instrukcja obsługi budynku na wypadek pożaru”: co w nim jest, co może się zapalić, jak wyprowadzić ludzi, gdzie są gaśnice, hydranty, wyłącznik prądu i kurek gazu. Przepis odwraca pytanie: <b>muszą ją mieć prawie wszystkie budynki poza mieszkalnymi</b>, a zwolnione są tylko małe obiekty, w których nic nie może wybuchnąć.</p>`)}
<h3>Kto musi mieć</h3>
<p>Właściciel, zarządca lub użytkownik obiektu (albo jego części, która jest odrębną strefą pożarową) przeznaczonego na funkcję <b>użyteczności publicznej, zamieszkania zbiorowego, produkcyjną, magazynową lub inwentarską</b> (§ 6 ust. 1 rozp. 2010).</p>
<h3>Kto jest zwolniony</h3>
<p>Tylko gdy <b>nie ma strefy zagrożenia wybuchem</b> i jednocześnie (§ 6 ust. 8 rozp. 2010):</p>
${tab(["Rodzaj obiektu", "Zwolniony, gdy", "Przykład"], [
    ["budynek lub strefa (ZL, PM)", "kubatura brutto do 1000 m³", "sklepik 12 × 10 m, 3,5 m wysokości = 420 m³ - nie musi"],
    ["budynek inwentarski", "kubatura brutto do 1500 m³", "obora 1400 m³ - nie musi; 1600 m³ - musi"],
    ["obiekt niebędący budynkiem (np. plac, wiata, namiot)", "strefa do 1000 m²", "plac składowy 800 m² - nie musi"],
  ])}
${tab(["Obiekt", "IBP?", "Dlaczego"], [
    ["Blok, dom jednorodzinny", "nie", "mieszkalne nie są wymienione w § 6 ust. 1"],
    ["Sklep 40 × 25 m, 4 m wysokości (4000 m³)", "tak", "użyteczność publiczna, ponad 1000 m³"],
    ["Biuro 600 m³", "nie", "do 1000 m³, brak strefy Ex"],
    ["Mały warsztat lakierniczy 500 m³ z kabiną lakierniczą", "tak", "jest strefa zagrożenia wybuchem - zwolnienie nie działa"],
    ["Hotel, pensjonat ponad 1000 m³", "tak", "zamieszkanie zbiorowe"],
    ["Garaż podziemny w bloku jako odrębna strefa ponad 1000 m³", "sporne - zapytaj", "WT każe stosować do garaży wymagania PM (§ 209 ust. 3 WT), ale § 6 ust. 1 rozp. 2010 garaży wprost nie wymienia"],
  ])}
<h3>Co musi zawierać (§ 6 ust. 1 pkt 1-9 rozp. 2010)</h3>
<ol><li>Warunki ochrony ppoż. wynikające z przeznaczenia, technologii, magazynowania, w tym zagrożenie wybuchem.</li><li>Wyposażenie w urządzenia ppoż. i gaśnice oraz sposób ich przeglądów.</li><li>Postępowanie na wypadek pożaru i innego zagrożenia.</li><li>Zabezpieczenie prac niebezpiecznych pożarowo (spawanie itp.).</li><li>Warunki i organizację ewakuacji oraz jej praktyczne sprawdzanie.</li><li>Sposób zapoznania użytkowników i pracowników z przepisami i instrukcją.</li><li>Zadania i obowiązki stałych użytkowników.</li><li>Plany obiektu i terenu (wymiary, odległości, substancje, gęstość obciążenia ogniowego, kategorie ZL, liczba osób, strefy Ex, strefy pożarowe, ewakuacja, urządzenia, kurki gazu, hydranty, drogi pożarowe).</li><li>Kto ją opracował.</li></ol>
<h3>Ważne terminy i zasady</h3>
<ul><li>Aktualizacja <b>co najmniej co 2 lata</b> i po każdej zmianie sposobu użytkowania lub technologii (§ 6 ust. 7 rozp. 2010).</li><li>Ma leżeć w miejscu dostępnym dla ekip ratowniczych (§ 6 ust. 9 rozp. 2010).</li><li>W obiektach z obowiązkiem systemu sygnalizacji pożarowej warunki ochrony i plany przekazuje się komendantowi PSP (§ 6 ust. 2 rozp. 2010).</li><li>Napisać ją może inspektor ochrony ppoż. - to czynność z zakresu obowiązków właściciela (art. 4 ust. 1 i ust. 2b ustawy o ochronie ppoż.).</li></ul>
${wyklad(`<p>Proszę Państwa, instrukcja bezpieczeństwa pożarowego ma trzech czytelników i dla każdego musi być napisana tak, żeby zrozumiał ją w minutę. <b>Pracownik</b> chce wiedzieć, co robić, gdy zobaczy ogień: gdzie gaśnica, kogo zawiadomić, którędy wyjść. <b>Strażak</b> przyjeżdżający do akcji chce wiedzieć, gdzie wyłącznik prądu i kurek gazu, co jest w magazynie, czy są butle, ile osób może być w środku. <b>Kontrolujący</b> chce zobaczyć, że właściciel zna swój budynek i swoje obowiązki.</p>
<p>Najczęstszy błąd to instrukcja „z szablonu”: 60 stron przepisanych paragrafów, a ani słowa o tym, że w tej konkretnej hali stoją butle z propanem przy rampie. Druga wada: instrukcja aktualna 5 lat temu, a w budynku od dwóch lat jest inny najemca. Trzecia: piękna instrukcja w szafie dyrektora, której nikt z pracowników nie widział. Przepis mówi wyraźnie, że właściciel ją <b>zapewnia i wdraża</b> (§ 6 ust. 1 rozp. 2010). Wdrożyć znaczy zapoznać ludzi i mieć na to dowód.</p>
<p>Dobra instrukcja to w połowie <b>plany</b>. Strażak w nocy nie przeczyta 40 stron, ale w 10 sekund spojrzy na plan z zaznaczonym wyłącznikiem prądu, hydrantem i drogą pożarową.</p>`)}
<h3>Co muszą pokazywać plany (§ 6 ust. 1 pkt 8 rozp. 2010)</h3>
${tab(["Litera", "Co ma być na planie"], [
    ["a", "powierzchnia, wysokość i liczba kondygnacji budynku"],
    ["b", "odległości od sąsiednich obiektów"],
    ["c", "parametry pożarowe substancji palnych"],
    ["d", "gęstość obciążenia ogniowego w strefach"],
    ["e", "kategoria zagrożenia ludzi i przewidywana liczba osób na każdej kondygnacji i w pomieszczeniach"],
    ["f", "pomieszczenia i przestrzenie zewnętrzne zaliczone do stref zagrożenia wybuchem"],
    ["g", "podział na strefy pożarowe"],
    ["h", "warunki ewakuacji: kierunki i wyjścia ewakuacyjne"],
    ["i", "urządzenia przeciwpożarowe, gaśnice, kurki główne gazu, materiały niebezpieczne pożarowo, elementy sterujące urządzeniami ppoż."],
    ["j", "dojścia do dźwigów dla ekip ratowniczych"],
    ["k", "hydranty zewnętrzne i inne źródła wody do gaszenia"],
    ["l", "drogi pożarowe i inne dojazdy, z wjazdami na teren ogrodzony"],
  ])}
<h3>Kiedy IBP trafia do straży (§ 6 ust. 2-5 rozp. 2010)</h3>
<ul><li>W obiektach, które muszą mieć system sygnalizacji pożarowej (lista z § 28 ust. 1 - patrz temat o czujkach), właściciel przekazuje komendantowi powiatowemu PSP <b>warunki ochrony przeciwpożarowej</b> (pkt 1) i <b>plany</b> (pkt 8). Straż wykorzystuje je do planowania akcji.</li><li>Dokumenty mają być przechowywane tak, żeby można ich było użyć natychmiast w czasie akcji (ust. 3).</li><li>Komendant może zwolnić z przekazania albo zażądać uzupełnienia (ust. 4).</li><li>Można je przekazać elektronicznie (ust. 5).</li></ul>
<p>W zakładach produkcyjnych, magazynach i budynkach inwentarskich IBP może być częścią instrukcji technologiczno-ruchowej (§ 6 ust. 6 rozp. 2010).</p>
${przyklad("czy ten obiekt musi mieć IBP?", `${tab(["Obiekt", "Wyliczenie", "IBP"], [
    ["Hala magazynowa 30 × 20 m, wysokość 6 m", "30 × 20 × 6 = 3600 m³", "tak - ponad 1000 m³"],
    ["Kiosk-sklepik 10 × 8 m, wysokość 3,5 m", "10 × 8 × 3,5 = 280 m³", "nie - do 1000 m³, bez strefy Ex"],
    ["Warsztat samochodowy 500 m³ z kabiną lakierniczą", "jest strefa zagrożenia wybuchem", "tak - zwolnienie z ust. 8 nie działa"],
    ["Obora 1400 m³", "budynek inwentarski do 1500 m³", "nie"],
    ["Chlewnia 1600 m³", "budynek inwentarski ponad 1500 m³", "tak"],
    ["Plac składowy drewna 1200 m² (bez budynku)", "obiekt inny niż budynek ponad 1000 m²", "tak"],
    ["Dom jednorodzinny 900 m³", "mieszkalny - § 6 ust. 1 go nie wymienia", "nie"],
    ["Pensjonat 1800 m³", "zamieszkanie zbiorowe ponad 1000 m³", "tak"],
  ])}
<p>Kubaturę brutto liczysz z <b>zewnętrznych</b> wymiarów budynku. Przy dachu dwuspadowym dodajesz bryłę dachu (dla przybliżenia: połowa prostopadłościanu nad ścianami).</p>`)}
${przyklad("hotel z systemem sygnalizacji pożarowej", `<p>Hotel ma 64 miejsca noclegowe, więc musi mieć SSP (§ 28 ust. 1 pkt 12 rozp. 2010: zamieszkanie zbiorowe ponad 50 miejsc). Skoro jest na liście z § 28 ust. 1, to:</p>
<ol><li>IBP obowiązkowa (zamieszkanie zbiorowe, ponad 1000 m³).</li><li>Rozdział z warunkami ochrony przeciwpożarowej i plany trzeba <b>przekazać komendantowi powiatowemu PSP</b>, np. w PDF.</li><li>Po każdej aktualizacji, co najmniej co 2 lata, przekazujesz nową wersję.</li><li>Jeden egzemplarz leży w recepcji, w miejscu dostępnym dla ekip ratowniczych (§ 6 ust. 9).</li></ol>`)}
<h3>Układ dobrej IBP - spis treści, z którego możesz korzystać</h3>
<ol><li>Dane obiektu i właściciela, kto opracował (pkt 9).</li><li>Charakterystyka: przeznaczenie, wymiary, kubatura, kondygnacje, strefy, kategorie ZL/PM, liczba osób, substancje, gęstość obciążenia ogniowego, strefy Ex (pkt 1).</li><li>Urządzenia ppoż. i gaśnice: rodzaj, ilość, miejsce, kto i kiedy robi przeglądy (pkt 2).</li><li>Postępowanie na wypadek pożaru: alarmowanie, numer 112, pierwsze gaszenie, wyłączenie prądu i gazu (pkt 3).</li><li>Prace niebezpieczne pożarowo: kto wydaje zgodę, jak zabezpieczyć miejsce (pkt 4).</li><li>Ewakuacja: drogi, wyjścia, opiekunowie, miejsce zbiórki, próbne ewakuacje (pkt 5).</li><li>Zapoznanie pracowników: kto, kiedy, jak potwierdza (pkt 6).</li><li>Obowiązki stałych użytkowników (pkt 7).</li><li>Plany (pkt 8) i załączniki: protokoły przeglądów, wykaz gaśnic, lista zapoznania z podpisami.</li></ol>
${wlasciciel(`<p>„Pana hala ma 3000 m³, więc instrukcja jest obowiązkowa. Bez niej strażacy w razie pożaru nie wiedzą, gdzie jest wyłącznik prądu i co składujecie, a przy kontroli PSP to pierwsza rzecz, o którą zapytają. Przygotuję ją i co dwa lata zaktualizuję.”</p>`)}
${wlasciciel(`<p>„Ma Pani instrukcję z 2019 roku, a od tamtej pory doszedł magazyn farb i zmienił się najemca na piętrze. Przepis każe ją aktualizować co najmniej co dwa lata i po każdej takiej zmianie. Zrobię aktualizację, a pracownicy podpiszą, że ją przeczytali. Ten podpis to dowód, że instrukcja jest wdrożona, a nie tylko leży w szafie.”</p>`)}
${wlasciciel(`<p>„Plany w instrukcji są na kartkach A4 i nic na nich nie widać. Strażak w nocy ma 10 sekund. Zrobię plan każdej kondygnacji z wyłącznikiem prądu, kurkiem gazu, hydrantami i wyjściami, a jeden egzemplarz zostawimy w skrzynce przy wejściu.”</p>`)}
${pulapki(["Liczy się <b>kubatura brutto</b> (z zewnętrznych wymiarów), nie powierzchnia.", "Strefa zagrożenia wybuchem <b>zawsze</b> oznacza obowiązek IBP, nawet w małym obiekcie.", "Próg dla obory to 1500 m³, dla reszty 1000 m³.", "Aktualizacja co 2 lata - nie co roku i nie co 5 lat.",
    "Obiekt inny niż budynek (plac, wiata): próg <b>1000 m²</b> powierzchni strefy, nie m³.",
    "Warunki ochrony i plany przekazuje się komendantowi <b>powiatowemu</b> PSP - tylko dla obiektów z listy SSP (§ 28 ust. 1).",
    "IBP ma być <b>dostępna dla ekip ratowniczych</b> (§ 6 ust. 9).",
    "Właściciel IBP <b>zapewnia i wdraża</b> - samo posiadanie nie wystarcza.",
    "W PM i IN instrukcja może być częścią instrukcji technologiczno-ruchowej.",
  ])}`),
  },
  {
    id: "hydranty", skrot: "HYD", tytul: "Hydranty zewnętrzne i wewnętrzne - odległości na wsi, w firmie, w magazynie",
    html: () => nbsp(`
${ludzku(`<p><b>Hydrant zewnętrzny</b> to kran dla straży na ulicy - z niego wóz bojowy bierze wodę. <b>Hydrant wewnętrzny</b> to szafka z wężem na korytarzu - z niego pierwsze gaszenie robią pracownicy, zanim przyjedzie straż.</p>`)}
<h3>Hydranty zewnętrzne - odległości (§ 10 ust. 6 rozp. 2009)</h3>
${rys(SVG_HYDRANTY, "Rysunek: zasady rozmieszczenia hydrantów zewnętrznych")}
${tab(["Zasada", "Wartość"], [["najbliższy hydrant od chronionego obiektu", "do 75 m"], ["kolejne hydranty wymagane dla obiektu", "do 150 m"], ["między hydrantami", "do 150 m"], ["od krawędzi jezdni", "do 15 m"], ["od ściany budynku", "co najmniej 5 m"], ["poza miastem", "odstępy dostosowane do gęstości zabudowy (§ 10 ust. 7)"]])}
<p>Rodzaj: hydrant <b>nadziemny DN 80</b>; podziemny tylko, gdy nadziemny jest szczególnie utrudniony (§ 10 ust. 1-2). Wydajność przy ciśnieniu 0,2 MPa: <b>DN 80 - 10 litrów na sekundę</b>, nadziemny <b>DN 100 - 15 litrów na sekundę</b> (§ 10 ust. 8).</p>
<h3>Na wsi</h3>
<p>Wodę do gaszenia muszą mieć miejscowości <b>powyżej 100 mieszkańców</b>, z wyjątkiem zabudowy kolonijnej (§ 3 ust. 1 pkt 1 rozp. 2009). Ile wody - zależy od liczby mieszkańców (tabela nr 1 rozp. 2009):</p>
${tab(["Mieszkańców", "Wydajność sieci", "albo zapas w zbiorniku"], [["do 2000", "5 l/s", "50 m³"], ["2001-5000", "10 l/s", "100 m³"], ["5001-10 000", "15 l/s", "150 m³"], ["10 001-25 000", "20 l/s", "200 m³"], ["25 001-100 000", "40 l/s", "400 m³"], ["ponad 100 000", "60 l/s", "600 m³"]])}
<p>Gdy wodociąg nie daje tyle wody, dopuszcza się studnię (min. 10 l/s), staw lub rzekę ze stanowiskiem czerpania i dojazdem albo zbiornik przeciwpożarowy (§ 4 ust. 5 rozp. 2009). Pojedynczy budynek <b>poza</b> taką miejscowością potrzebuje własnej wody, gdy ma ponad 2500 m³ lub ponad 500 m² (§ 3 ust. 1 pkt 2).</p>
<h3>Firma (budynek użyteczności publicznej) i magazyn</h3>
${tab(["Obiekt", "Ile wody", "Ile hydrantów DN 80"], [["biuro, sklep do 5000 m³ i do 1000 m²", "10 l/s", "1 (albo zbiornik 100 m³)"], ["biuro, sklep większy", "20 l/s", "2 (albo zbiornik 200 m³)"], ["magazyn 2500 m², Q = 1500 MJ/m²", "30 l/s", "3"], ["magazyn 800 m², Q = 300 MJ/m²", "10 l/s", "1"]])}
<p>Podstawa: § 5 ust. 1 pkt 1-2 i § 6 ust. 3 z tabelą nr 2 rozp. 2009 (dla magazynów liczy się powierzchnia strefy i gęstość obciążenia ogniowego - patrz temat 13).</p>
<h3>Hydranty wewnętrzne (§ 19-22 rozp. 2010)</h3>
${tab(["Typ", "Gdzie obowiązkowy", "Wąż", "Wydajność"], [["hydrant 25", "ZL: budynki W i WW; w niskich i średniowysokich - ZL I, II, V ponad 200 m²; ZL III ponad 200 m² w SW i ponad 1000 m² w N", "półsztywny 25 mm, zwykle 30 m", "1,0 l/s"], ["hydrant 33", "garaże zamknięte ponad 10 stanowisk i wielokondygnacyjne", "półsztywny 33 mm", "1,5 l/s"], ["hydrant 52", "PM o Q ponad 500 MJ/m² i ponad 200 m²", "płasko składany 52 mm, zwykle 20 m", "2,5 l/s"], ["zawór 52", "budynki wysokie i wysokościowe (dla strażaków)", "bez węża - strażacy podłączają swój", "2,5 l/s"]])}
<p><b>Zasięg</b> = długość węża + efektywny rzut prądu: <b>3 m</b> w strefach ZL w budynkach wielokondygnacyjnych, <b>10 m</b> w pozostałych (§ 20 ust. 3). Zawór na wysokości 1,35 m (§ 21 ust. 1). Przeglądy co roku, węże - próba ciśnieniowa co 5 lat (§ 3 ust. 3-4).</p>
${galeria(["hydrant-nadziemny", "hydrant-nadziemny2", "tabliczka-hydrantu", "tabliczka-hydrantu2"])}
${wyklad(`<p>Proszę Państwa, hydrant zewnętrzny i hydrant wewnętrzny to dwa różne światy, choć nazwa ta sama. <b>Zewnętrzny</b> jest dla straży. Wóz bojowy wozi zwykle kilka tysięcy litrów wody, a przy pożarze hali to starcza na kilka minut. Potem strażacy muszą się „podpiąć” do sieci i wtedy liczą się metry: im dalej hydrant, tym dłuższa linia węży i tym później popłynie woda. Stąd 75 m od budynku do najbliższego hydrantu.</p>
<p><b>Wewnętrzny</b> jest dla ludzi w budynku. Ma pozwolić pracownikowi albo ochroniarzowi ugasić pożar w pierwszych minutach, zanim przyjedzie straż. Dlatego wisi przy klatkach i wyjściach, na wysokości ręki, a wąż jest półsztywny: można go rozwinąć w jedną osobę i od razu lać wodę.</p>
<p>Na obchodzie patrzycie na trzy rzeczy. Czy hydrant zewnętrzny jest <b>widoczny i dostępny</b>: nie zarośnięty, nie zastawiony autem, z tabliczką, jeśli jest podziemny. Czy hydrant wewnętrzny ma <b>aktualny przegląd</b>: naklejka i protokół nie starsze niż rok. Czy szafka <b>nie jest zastawiona</b> paletą albo regałem. Zakaz ograniczania dostępu do urządzeń ppoż. i źródeł wody jest w § 4 ust. 1 pkt 18 rozp. 2010.</p>`)}
<h3>Hydranty wewnętrzne - gdzie są obowiązkowe (§ 19 rozp. 2010)</h3>
${tab(["Rodzaj", "Gdzie obowiązkowy"], [
    ["hydrant 25", "ZL w budynkach wysokich i wysokościowych - na każdej kondygnacji (poza kondygnacjami tylko z mieszkaniami ZL IV)"],
    ["hydrant 25", "budynek niski i średniowysoki: strefa ZL I, ZL II lub ZL V ponad 200 m²"],
    ["hydrant 25", "strefa ZL III: ponad 200 m² w budynku średniowysokim, ponad 1000 m² w budynku niskim"],
    ["hydrant 33", "garaż zamknięty jednokondygnacyjny ponad 10 stanowisk; każdy garaż wielokondygnacyjny"],
    ["hydrant 52", "strefa PM: Q ponad 500 MJ/m² i ponad 200 m²"],
    ["hydrant 52", "strefa PM z Q do 500, ale z pomieszczeniem ponad 100 m² o Q ponad 1000 MJ/m²"],
    ["hydrant 52", "przy wejściu do magazynu lub pomieszczenia technicznego ponad 200 m² i Q ponad 500 w strefie ZL I, II, III, V (budynek N lub SW)"],
    ["hydrant 33 zamiast 52", "dozwolony, gdy Q nie przekracza 1000 MJ/m² (§ 19 ust. 4)"],
    ["zawór 52", "budynki wysokie i wysokościowe o więcej niż jednej kondygnacji nadziemnej"],
  ])}
<h3>Jak mają być rozmieszczone i jak działać (§ 20-23 rozp. 2010)</h3>
${tab(["Wymaganie", "Wartość", "Przepis"], [
    ["Gdzie wieszać", "przy drogach komunikacji ogólnej: przy wejściach do budynku i klatek schodowych na każdej kondygnacji, w korytarzach, przy wejściach na poddasze, przy wyjściach z hal PM", "§ 20 ust. 1"],
    ["Na każdej kondygnacji", "tak; w budynkach W i WW po 2 zawory 52 na pion na kondygnacjach podziemnych i powyżej 25 m", "§ 20 ust. 2"],
    ["Zasięg", "cała powierzchnia: długość węża + rzut prądu 3 m (ZL w budynku ponad 1 kondygnację) albo 10 m (pozostałe)", "§ 20 ust. 3"],
    ["Wysokość zaworu", "1,35 m ± 0,1 m od podłogi", "§ 21 ust. 1"],
    ["Wydajność na prądownicy", "hydrant 25 - 1,0 l/s; 33 - 1,5 l/s; 52 i zawór 52 - 2,5 l/s", "§ 22 ust. 1"],
    ["Ciśnienie na zaworze", "co najmniej 0,2 MPa; najwyżej 1,2 MPa (dla 33, 52 i zaworu 52 najwyżej 0,7 MPa)", "§ 22 ust. 2-4"],
    ["Ile hydrantów naraz", "1 - budynek N lub SW, strefa do 500 m²; 2 sąsiednie - zwykle; 4 sąsiednie - W i WW na kondygnacjach podziemnych i powyżej 25 m oraz PM Q ponad 500 i ponad 3000 m²", "§ 23"],
    ["Przegląd", "co najmniej raz w roku; węże - próba ciśnieniowa raz na 5 lat", "§ 3 ust. 3-4"],
  ])}
${galeria(["hydrant-wewnetrzny2"])}
${przyklad("szkoła w Zawierciu - czy potrzebny hydrant 25?", `<p>Szkoła podstawowa (ZL III), 3 kondygnacje, 11 m - budynek niski. Jedna strefa pożarowa 2400 m².</p>
<ol><li>ZL III w budynku niskim: hydrant 25 wymagany, gdy strefa ma ponad <b>1000 m²</b> (§ 19 ust. 1 pkt 2 lit. b).</li><li>2400 m² to ponad 1000 m², więc <b>hydranty 25 na każdej kondygnacji</b>.</li><li>Gdzie: przy wejściach na klatki na każdym piętrze i w korytarzach, tak żeby wąż (zwykle 30 m) plus 3 m rzutu prądu sięgnął każdego miejsca (§ 20 ust. 3 pkt 2 lit. a - ZL w budynku wielokondygnacyjnym).</li><li>Ile naraz: strefa ponad 500 m², więc instalacja ma dać wodę z <b>dwóch</b> sąsiednich hydrantów jednocześnie (§ 23 pkt 2).</li></ol>`)}
${przyklad("hurtownia materiałów budowlanych - 52 czy 33?", `<p>Hala parterowa, strefa PM 1800 m², gęstość obciążenia ogniowego wyliczona na 850 MJ/m².</p>
<ol><li>PM, Q ponad 500 i powierzchnia ponad 200 m² - wymagany <b>hydrant 52</b> (§ 19 ust. 3 pkt 1).</li><li>Q nie przekracza 1000 MJ/m², więc wolno zamiast niego dać <b>hydrant 33</b> (§ 19 ust. 4). Jest lżejszy i łatwiejszy w obsłudze dla pracownika.</li><li>Rzut prądu w budynku jednokondygnacyjnym: <b>10 m</b>. Przy wężu 20 m jeden hydrant „obsługuje” koło o promieniu ok. 30 m, liczonym po drodze, którą przejdzie człowiek z wężem.</li><li>Strefa do 3000 m², więc wystarczy jednoczesny pobór z <b>dwóch</b> sąsiednich hydrantów (§ 23 pkt 2).</li></ol>`)}
${przyklad("wieś na Jurze - skąd woda dla domów?", `<p>Wieś ma 380 mieszkańców i wodociąg gminny.</p>
<ol><li>Ponad 100 mieszkańców, więc wieś musi mieć wodę do gaszenia (§ 3 ust. 1 pkt 1 rozp. 2009).</li><li>Do 2000 mieszkańców: sieć o wydajności 5 l/s albo zapas 50 m³ (tabela nr 1 rozp. 2009).</li><li>Hydranty nadziemne DN 80 co najwyżej 150 m jeden od drugiego, najbliższy do 75 m od domu. Poza miastem odstępy dostosowuje się do zabudowy (§ 10 ust. 7).</li><li>Przy rozproszonej zabudowie (kolonie) obowiązek nie dotyczy, ale wtedy budynek użyteczności publicznej, zamieszkania zbiorowego, produkcyjny lub magazynowy ponad 2500 m³ lub ponad 500 m² (np. pensjonat albo hala na kolonii) potrzebuje własnego źródła wody (§ 3 ust. 1 pkt 2). Domów i obór ten punkt nie obejmuje.</li></ol>`)}
${wlasciciel(`<p>„Hydrant przy ulicy jest 60 m od hali - mieści się w 75 m. Ale hala ma ponad 5000 m³, więc potrzebne są dwa hydranty po 10 l/s. Drugi stoi 180 m dalej - za daleko. Trzeba wystąpić do wodociągów o hydrant bliżej albo zrobić zbiornik.”</p>`)}
${wlasciciel(`<p>„Szafkę hydrantu zastawiła paleta z towarem. W razie pożaru pracownik jej nie odsunie, bo nie będzie widział nic przez dym. To jest zakaz z § 4 ust. 1 pkt 18 rozporządzenia. Proszę wymalować przed szafką pas na podłodze i pilnować, żeby nic na nim nie stało.”</p>`)}
${wlasciciel(`<p>„Protokół przeglądu hydrantów jest z 2024 roku. Przegląd robi się co najmniej raz w roku, a węże raz na 5 lat sprawdza się pod ciśnieniem. Proszę zamówić firmę serwisową. Bez aktualnego przeglądu kontrolujący nie ma dowodu, że hydrant działa.”</p>`)}
${pulapki(["75 m - najbliższy hydrant od obiektu; 150 m - między hydrantami. Łatwo pomylić.", "DN 100 daje 15 l/s, DN 80 - 10 l/s.", "Hydrant 25 - 1 l/s, 33 - 1,5 l/s, 52 - 2,5 l/s.", "Hydrant co najmniej 5 m od ściany - żeby strażak nie stał w strefie spadającego gruzu.",
    "Zawór hydrantu wewnętrznego: <b>1,35 m ± 0,1 m</b> nad podłogą.",
    "Ciśnienie na zaworze hydrantu wewnętrznego co najmniej <b>0,2 MPa</b>; najwyżej 1,2 MPa (dla 33 i 52 - 0,7 MPa).",
    "Rzut prądu przy liczeniu zasięgu: <b>3 m</b> w ZL w budynku wielokondygnacyjnym, <b>10 m</b> w pozostałych.",
    "ZL III w budynku <b>niskim</b> - hydrant 25 dopiero ponad <b>1000 m²</b>; w średniowysokim ponad 200 m².",
    "Hydrant 33 zamiast 52 - tylko gdy Q nie przekracza <b>1000 MJ/m²</b>.",
    "Zawory 52 - budynki <b>wysokie i wysokościowe</b>, dla strażaków (bez węża).",
    "Woda dla wsi: obowiązek od ponad <b>100 mieszkańców</b>, nie dotyczy zabudowy kolonijnej.",
  ])}`),
  },
  {
    id: "fazy", skrot: "FAZY", tytul: "Fazy pożaru",
    html: () => nbsp(`
${ludzku(`<p>Pożar w pomieszczeniu ma trzy etapy, jak życie świeczki w słoiku: najpierw rośnie, potem szaleje na całego, a na końcu dogasa, bo brakuje paliwa albo tlenu.</p>`)}
${rys(SVG_FAZY, "Wykres: temperatura w pomieszczeniu w czasie pożaru (krzywa poglądowa)")}
${tab(["Faza", "Co się dzieje", "Dla ludzi i strażaków"], [
    ["I - rozwój (początkowa)", "zapłon, płomień rozprzestrzenia się powoli, tlenu wystarcza, temperatura rośnie, dym wypełnia pomieszczenie; zwykle ok. 15-20 minut", "czas na wykrycie i ewakuację - tu ma zadziałać czujka i gaśnica"],
    ["rozgorzenie (flashover)", "nagle zapalają się gazy i wszystkie nagrzane powierzchnie; pod sufitem ok. 500-700 °C, przy podłodze 300-400 °C", "granica przeżycia - po rozgorzeniu w pomieszczeniu nie da się przeżyć"],
    ["II - pożar w pełni rozwinięty", "pali się wszystko, temperatura maksymalna 800-1000 °C, pożar „kontrolowany przez wentylację” (decyduje dopływ powietrza), płomienie wychodzą oknami", "gaszenie z zewnątrz i obrona sąsiednich pomieszczeń"],
    ["III - wygasanie", "zaczyna się, gdy temperatura spadnie o co najmniej 1/5 maksimum; spada moc pożaru, rośnie gęstość dymu", "ryzyko ponownego zapłonu i wstecznego ciągu (backdraft) przy nagłym dopływie powietrza"],
  ])}
<p>Wartości według prezentacji T-1 i T-2 kursu CS PSP („Rozwój pożaru. Rodzaje pożarów”).</p>
${galeria(["rozgorzenie", "rozgorzenie-kontener"])}
${wyklad(`<p>Proszę Państwa, spójrzmy na pożar pokoju minuta po minucie. Zapala się kosz na śmieci pod biurkiem. Płomień ma pół metra, w pokoju jest jeszcze dużo powietrza, a gorące gazy idą do góry i rozpływają się pod sufitem. Tworzy się <b>warstwa podsufitowa</b>: gorący dym, który z każdą minutą jest grubszy i schodzi niżej. To jest faza I. Tu wystarczy gaśnica, a czujka dymu powinna już wyć.</p>
<p>Warstwa pod sufitem nagrzewa się coraz bardziej i zaczyna <b>promieniować w dół</b>, jak grill ustawiony do góry nogami. Grzeje meble, wykładzinę, zasłony. One z kolei wydzielają palne gazy, a różnica temperatur między sufitem a podłogą dochodzi do 500 °C. W pewnej chwili wszystko osiąga temperaturę samozapłonu naraz. Pokój w kilka sekund zmienia się w jedną kulę ognia. To jest <b>rozgorzenie</b>. Kto w tym momencie jest w środku, nie ma szans.</p>
<p>Po rozgorzeniu jest faza II: pali się wszystko, temperatura sięga 800-1000 °C, a o tempie pożaru decyduje już tylko to, ile powietrza wpada przez okna i drzwi. Kiedy paliwo się kończy i temperatura spada o co najmniej jedną piątą maksimum, zaczyna się faza III, czyli wygasanie. Tu czai się ostatnia pułapka: pomieszczenie zamknięte, pełne gorących gazów, mało tlenu. Ktoś otwiera drzwi, wpada powietrze i następuje wybuchowe rozpalenie, czyli <b>wsteczny ciąg</b>.</p>`)}
<h3>Po czym poznać, że zbliża się rozgorzenie</h3>
<ul><li>Gruba, gęsta warstwa gorącego dymu schodzi coraz niżej.</li><li>Gwałtowny wzrost temperatury - trzeba kucać, przy podłodze ledwo da się wytrzymać.</li><li>Pojawiają się płomienie w warstwie podsufitowej („niepełne rozgorzenie”).</li><li>Przedmioty dymią same, choć ogień ich nie dotyka - to rozkład termiczny od promieniowania z góry.</li></ul>
<p>Jak strażacy temu zapobiegają (materiały kursu): chłodzą warstwę podsufitową krótkimi seriami prądów rozproszonych, wchodzą przez jak najmniejszy otwór, poruszają się nisko, na klęczkach lub czołgając się.</p>
<h3>Strefy pożaru i przenoszenie ciepła</h3>
${tab(["Strefa pożaru", "Co to jest"], [["spalania", "samo ognisko"], ["konwekcyjna", "kolumna gorących gazów nad ogniskiem"], ["zadymienia", "obszar wypełniony dymem - zwykle dużo większy niż ognisko"], ["oddziaływania promieniowania cieplnego", "tam, gdzie ciepło grzeje materiały i konstrukcje"]])}
${tab(["Sposób przenoszenia ciepła", "Gdzie działa", "Przykład"], [["przewodzenie", "w ciałach stałych", "stalowa belka przez ścianę nagrzewa drugą stronę"], ["konwekcja", "ruch gorących gazów", "dym idzie klatką schodową na górne piętra"], ["promieniowanie", "dominuje w pożarach", "pożar jednego budynku zapala sąsiedni bez kontaktu z płomieniem - stąd odległości między budynkami"]])}
<p>Człowiek bez ochrony wytrzyma zaledwie kilka minut w 80-100 °C w suchym powietrzu i w 50-60 °C w wilgotnym (materiały kursu).</p>
${przyklad("kiedy zaczyna się faza III", `<p>Najwyższa temperatura w pomieszczeniu wyniosła 900 °C.</p><ol><li>Faza III zaczyna się, gdy temperatura spadnie o co najmniej 1/5 maksimum.</li><li>900 : 5 = 180 °C.</li><li>900 - 180 = <b>720 °C</b>.</li></ol><p>Poniżej ok. 720 °C pożar wchodzi w fazę wygasania.</p>`)}
<h3>Połączenie z odpornością ogniową</h3>
<p>Ściany i stropy bada się w piecu według <b>krzywej normowej</b> (temperatura rośnie jak w prawdziwym pożarze). Po 30 minutach w piecu jest ok. 840 °C, po 60 minutach ok. 945 °C, po 120 minutach ok. 1050 °C. Dlatego „EI 60” znaczy: ściana wytrzymuje godzinę pożaru w pełni rozwiniętego.</p>
${wlasciciel(`<p>„Czujka dymu jest po to, żeby zaalarmować ludzi w pierwszej fazie - zanim pokój zapali się cały. Faza I trwa zwykle kilkanaście minut. To cały czas, jaki mamy na wykrycie, ugaszenie gaśnicą albo wyjście.”</p>`)}
${wlasciciel(`<p>„Jeśli zobaczy Pan dym spod drzwi magazynu, proszę ich nie otwierać. Za drzwiami może być pomieszczenie pełne gorących gazów bez tlenu. Otwarcie wpuści powietrze i ogień może wybuchnąć prosto na Pana. Zamknąć, wyprowadzić ludzi, dzwonić 112 - to powinno być w instrukcji dla pracowników.”</p>`)}
${pulapki(["System sygnalizacji pożarowej ma zadziałać w <b>I fazie</b>.", "Najwyższa temperatura - <b>II faza</b>.", "Rozgorzenie to przejście między I a II fazą.", "Wsteczny ciąg (backdraft) grozi w zamkniętym pomieszczeniu z gorącymi gazami i brakiem tlenu - przy otwarciu drzwi.",
    "Faza III zaczyna się, gdy temperatura spadnie o co najmniej <b>1/5 maksimum</b>.",
    "W fazie II pożar jest „kontrolowany przez wentylację”, czyli przez dopływ powietrza.",
    "Rozgorzenie: pod sufitem ok. <b>500-700 °C</b>, przy podłodze 300-400 °C.",
    "Dominujący sposób przenoszenia ciepła w pożarze - <b>promieniowanie</b>.",
    "Strefy pożaru: spalania, konwekcyjna, zadymienia, oddziaływania promieniowania cieplnego.",
  ])}`),
  },
  {
    id: "przejscia", skrot: "EWAK", tytul: "Przejście i dojście ewakuacyjne",
    html: () => nbsp(`
${ludzku(`<p><b>Przejście</b> to droga <b>wewnątrz pomieszczenia</b> - od najdalszego kąta do drzwi. <b>Dojście</b> to dalsza droga <b>korytarzem i schodami</b> - od drzwi pomieszczenia do wyjścia na zewnątrz albo do innej strefy pożarowej (albo do obudowanej klatki schodowej z ochroną przed dymem).</p>
<p><b>Jak zapamiętać (rada wykładowcy):</b> <b>P</b>rzejście = <b>P</b>omieszczenie - oba na P. Zostaje dojście = <b>D</b>roga dalej (korytarz, schody) - oba na D.</p>`)}
${rys(SVG_EWAK, "Rysunek: przejście (w pomieszczeniu) i dojście (po korytarzu)")}
<h3>Przejście - najwyżej (§ 237 WT)</h3>
${tab(["Strefa", "Długość przejścia"], [["ZL (każda kategoria)", "40 m"], ["PM o Q ponad 500 MJ/m² w budynku wielokondygnacyjnym", "75 m"], ["PM o Q do 500 MJ/m² w budynku wielokondygnacyjnym oraz PM w budynku jednokondygnacyjnym", "100 m"], ["pomieszczenie zagrożone wybuchem", "40 m"]])}
<p>Powiększenia: pomieszczenie wyższe niż 5 m - <b>+25%</b>; tryskacze - <b>+50%</b>; oddymianie uruchamiane czujkami dymu - <b>+50%</b>; sumują się. Przejście nie może prowadzić przez więcej niż <b>3 pomieszczenia</b>. Szerokość: 0,6 m na 100 osób, nie mniej niż 0,9 m.</p>
<h3>Dojście - najwyżej (§ 256 ust. 3 WT)</h3>
${tab(["Strefa", "przy 1 dojściu", "przy 2 i więcej dojściach"], [["z pomieszczeniem zagrożonym wybuchem", "10 m", "40 m"], ["ZL I, ZL II, ZL V", "10 m", "40 m"], ["ZL III", "30 m*", "60 m"], ["ZL IV", "60 m*", "100 m"], ["PM Q ponad 500", "30 m*", "60 m"], ["PM Q do 500", "60 m*", "100 m"]])}
<p>* w tym najwyżej 20 m po poziomej drodze. Przy dwóch dojściach dłuższe może być o 100% dłuższe od krótszego, nie mogą się krzyżować. Powiększenia: tryskacze +50%, oddymianie drogi +50%, razem +100% (§ 256 ust. 4).</p>
<h3>Przykłady</h3>
${tab(["Sytuacja", "Ocena"], [["Hotel (ZL V), korytarz ślepy, od drzwi pokoju do klatki 14 m", "za długo - przy jednym dojściu w ZL V tylko 10 m"], ["Biuro (ZL III), jedno dojście 25 m, w tym 18 m korytarza", "OK - do 30 m, w tym do 20 m poziomo"], ["Sklep (ZL I), od kąta sali do drzwi 38 m między regałami", "OK - przejście do 40 m (mierzy się po drodze między regałami, nie w linii prostej)"], ["Hala PM jednokondygnacyjna, Q = 300, przejście 90 m", "OK - do 100 m"]])}
${galeria(["korytarz-pusty", "korytarz-wyjscie", "klatka-wyjscie", "dzwignia-antypaniczna"])}
${wyklad(`<p>Proszę Państwa, zanim zaczniemy liczyć metry, ustalmy jedną rzecz: ewakuacja to <b>wyścig z dymem</b>. Dym w korytarzu potrafi w dwie-trzy minuty zejść tak nisko, że nie widać własnej ręki. Wszystkie długości w przepisach - 10, 30, 40 metrów - wzięły się z jednego pytania: ile człowiek zdąży przejść, zanim dym go dogoni.</p>
<p>Drogę ucieczki dzielimy na dwa odcinki. Pierwszy to <b>przejście</b>, czyli droga w pomieszczeniu, w którym siedzisz. Mierzymy ją od <b>najdalszego miejsca, w którym może przebywać człowiek</b>, do drzwi (§ 237 ust. 1 WT). Nie od środka sali i nie w linii prostej nad regałami, tylko tak, jak naprawdę pójdzie człowiek: między biurkami, wokół lady, alejką między regałami. W pomieszczeniu jesteś blisko źródła ognia, ale masz jeszcze widoczność, dlatego wolno przejść dość dużo: w każdej strefie ZL 40 m.</p>
<p>Drugi odcinek to <b>dojście</b>: od drzwi pokoju korytarzem i schodami do wyjścia na zewnątrz albo do innej strefy pożarowej. Mierzymy je <b>wzdłuż osi drogi</b> (§ 256 ust. 1 WT), czyli środkiem korytarza i środkiem biegu schodów. Korytarz to komin dla dymu, więc tu przepis jest ostrzejszy. W hotelu, w szpitalu czy w sklepie przy jednym kierunku ucieczki wolno tylko 10 m.</p>
<p>Zapamiętajcie: <b>P</b>rzejście - <b>P</b>omieszczenie, <b>D</b>ojście - <b>D</b>roga dalej. Na egzaminie te dwa słowa podmieniają w co trzecim pytaniu o ewakuację.</p>`)}
<h3>Przejście - wszystko, co trzeba wiedzieć (§ 237 WT)</h3>
${tab(["Zasada", "Wartość", "Przepis"], [
    ["Skąd mierzysz", "od najdalszego miejsca, w którym może być człowiek, do wyjścia na drogę ewakuacyjną, do innej strefy albo na zewnątrz", "§ 237 ust. 1"],
    ["Pomieszczenie zagrożone wybuchem (w PM)", "najwyżej 40 m", "§ 237 ust. 2"],
    ["Nie wiadomo, jak będzie urządzone (np. projekt „pod wynajem”)", "projektuje się najwyżej 80% długości - w ZL 32 m zamiast 40 m", "§ 237 ust. 4"],
    ["Pomieszczenie wyższe niż 5 m", "+25%", "§ 237 ust. 5"],
    ["Tryskacze (stałe samoczynne urządzenia gaśnicze wodne)", "+50%", "§ 237 ust. 6 pkt 1"],
    ["Oddymianie uruchamiane czujkami dymu", "+50%", "§ 237 ust. 6 pkt 2"],
    ["Łączenie powiększeń", "procenty się sumują", "§ 237 ust. 7"],
    ["Ile pomieszczeń po drodze", "łącznie najwyżej 3", "§ 237 ust. 8"],
    ["Szerokość", "0,6 m na 100 osób, nie mniej niż 0,9 m; dla najwyżej 3 osób - 0,8 m", "§ 237 ust. 10"],
  ])}
${przyklad("wysoka hala magazynowa", `<p>Hala PM, jedna kondygnacja, wysokość 9 m, tryskacze, bez oddymiania.</p>
<ol><li>Podstawa: PM w budynku jednokondygnacyjnym - <b>100 m</b> (§ 237 ust. 1 pkt 3 WT).</li><li>Wysokość ponad 5 m: +25%.</li><li>Tryskacze: +50%.</li><li>Sumujemy procenty: 25% + 50% = 75%, więc 100 m × 1,75 = <b>175 m</b>.</li></ol>
<p>Uwaga: jeśli w tej hali jest pomieszczenie zagrożone wybuchem, to w nim podstawą jest <b>40 m</b>, a nie 100 m. Wtedy 40 × 1,75 = 70 m.</p>`)}
${przyklad("restauracja w Ogrodzieńcu", `<p>Sala restauracji ma 120 m², a właściciel nie wie, ile osób wpuści.</p>
<ol><li>Liczba osób ze wskaźnika: lokal gastronomiczny - <b>1 m² na osobę</b>, czyli 120 osób (§ 236 ust. 6 pkt 1 WT).</li><li>Ponad 50 osób, więc sala potrzebuje <b>dwóch wyjść</b> oddalonych o co najmniej 5 m (§ 238 pkt 1 WT).</li><li>Drzwi z sali otwierają się <b>na zewnątrz</b>, bo sala jest dla ponad 50 osób (§ 239 ust. 2 pkt 3 WT).</li><li>Łączna szerokość drzwi: 0,6 m × 1,2 = 0,72 m, ale każde drzwi co najmniej <b>0,9 m</b> w świetle ościeżnicy (§ 239 ust. 1 WT).</li><li>Przejście od najdalszego stolika do drzwi: do <b>40 m</b> (ZL).</li></ol>`)}
<h3>Ile osób przyjąć, gdy nikt tego nie wie (§ 236 ust. 6 WT)</h3>
${tab(["Pomieszczenie", "Wskaźnik", "Przykład"], [
    ["sale konferencyjne, gastronomia, rozrywka, poczekalnie, hole, świetlice", "1 m² na osobę", "sala weselna 200 m² = 200 osób"],
    ["handel i usługi", "4 m² na osobę", "sklep 240 m² = 60 osób"],
    ["biura i administracja", "5 m² na osobę", "biuro 150 m² = 30 osób"],
    ["archiwa, biblioteki", "7 m² na osobę", "biblioteka 350 m² = 50 osób"],
    ["magazyny", "30 m² na osobę", "magazyn 900 m² = 30 osób"],
  ])}
<h3>Kiedy pomieszczenie musi mieć dwa wyjścia (§ 238 WT)</h3>
${tab(["Pomieszczenie", "Dwa wyjścia, gdy"], [
    ["każde", "ponad 50 osób naraz"],
    ["w strefie ZL II (szpital, przedszkole)", "ponad 30 osób"],
    ["w strefie ZL", "ponad 300 m²"],
    ["w strefie PM, Q ponad 500 MJ/m²", "ponad 300 m²"],
    ["w strefie PM, Q do 500 MJ/m²", "ponad 1000 m²"],
    ["zagrożone wybuchem", "ponad 100 m²"],
  ])}
<p>Wyjścia muszą być oddalone od siebie o co najmniej <b>5 m</b>, żeby jeden pożar nie odciął obu naraz.</p>
<h3>Drzwi na drodze ucieczki</h3>
${tab(["Wymaganie", "Wartość", "Przepis"], [
    ["Szerokość drzwi z pomieszczenia", "0,6 m na 100 osób, każde co najmniej 0,9 m w świetle ościeżnicy (0,8 m dla najwyżej 3 osób)", "§ 239 ust. 1 WT"],
    ["Drzwi otwierane na zewnątrz pomieszczenia", "zagrożonego wybuchem; z możliwym napływem gazów trujących; dla ponad 50 osób; dla ponad 6 osób o ograniczonej zdolności poruszania się", "§ 239 ust. 2 WT"],
    ["Drzwi wyjściowe z budynku dla ponad 50 osób", "otwierane na zewnątrz (nie dotyczy zabytków)", "§ 236 ust. 4 WT"],
    ["Drzwi z klatki na zewnątrz", "nie węższe niż bieg schodów", "§ 239 ust. 4 WT"],
    ["Otwarte skrzydło", "nie może zwężać korytarza poniżej wymaganej szerokości (chyba że ma samozamykacz)", "§ 242 ust. 4 WT"],
    ["Zamykanie drzwi ewakuacyjnych na klucz w czasie pracy", "zabronione", "§ 4 ust. 1 pkt 14 rozp. 2010"],
  ])}
${wyklad(`<p>Teraz dojście. Tu jest jedna pułapka, na której łapią się nawet projektanci: <b>gdzie dojście się kończy</b>. Kończy się przy wyjściu na zewnątrz albo do innej strefy pożarowej. Wejście na klatkę schodową liczy się jak wyjście do innej strefy tylko wtedy, gdy klatka jest <b>obudowana, ma drzwi co najmniej EI 30 i urządzenia przeciw zadymieniu</b> (§ 256 ust. 2 WT). Zwykła, otwarta klatka nie kończy dojścia. Liczysz dalej: schodami w dół i do drzwi na zewnątrz.</p>
<p>Druga rzecz: przy jednym dojściu w ZL III, ZL IV i w PM w limicie jest gwiazdka, czyli najwyżej <b>20 m po poziomie</b>. Na przykład w biurze wolno 30 m, ale korytarz może mieć najwyżej 20 m, a resztę dają schody. Przepis nie podaje uzasadnienia. Łatwo to jednak zapamiętać tak: schodząc w dół, uciekasz spod dymu, a w poziomym korytarzu dym płynie pod sufitem razem z tobą.</p>
<p>Trzecia: dwa kierunki ucieczki. Dają dużo więcej metrów (w ZL I z 10 m robi się 40 m), ale tylko wtedy, gdy są naprawdę dwa. Drogi nie mogą się pokrywać ani krzyżować, wspólny może być najwyżej początek na 2 m. Dłuższa droga może być najwyżej dwa razy dłuższa od krótszej (§ 256 ust. 3 WT, odnośnik 1).</p>`)}
<h3>Korytarz - szerokość i wysokość (§ 242 WT)</h3>
${tab(["Wymaganie", "Wartość"], [
    ["Szerokość", "0,6 m na 100 osób na kondygnacji, nie mniej niż 1,4 m"],
    ["Korytarz dla najwyżej 20 osób", "może mieć 1,2 m"],
    ["Wysokość", "co najmniej 2,2 m"],
    ["Lokalne obniżenie (np. belka, kanał wentylacyjny)", "do 2 m, na długości najwyżej 1,5 m na każde 10 m drogi"],
  ])}
${przyklad("biuro w strefie ZL I - korytarz do klatki", `<p>Biuro w budynku, w którym cała strefa jest ZL I (np. hala handlowa z biurami na piętrze). Z drzwi biura korytarz prowadzi tylko w jedną stronę: 14 m do zwykłej klatki, potem schody w dół (ok. 8 m po osi) i 3 m do drzwi na zewnątrz.</p>
<ol><li>Limit dla ZL I przy jednym dojściu: <b>10 m</b> (§ 256 ust. 3 WT).</li><li>Klatka nie jest obudowana z drzwiami EI 30 i urządzeniami przeciw zadymieniu, więc dojście liczymy do drzwi na zewnątrz: 14 + 8 + 3 = <b>25 m</b>.</li><li>25 m to ponad 10 m. <b>Niezgodność</b>, chyba że: jest drugi kierunek ucieczki (wtedy limit 40 m), są tryskacze i oddymianie (+100%, czyli 20 m - nadal za mało), albo komendant wojewódzki PSP zatwierdził rozwiązanie zamienne.</li><li>Co zapisujesz: „Dojście ewakuacyjne ok. 25 m przy jednym kierunku ewakuacji w strefie ZL I - przekracza 10 m (§ 256 ust. 3 WT). Sprawdzić dokumentację: rozwiązania zamienne / drugi kierunek ewakuacji.”</li></ol>`)}
${przyklad("hotel - ślepy korytarz", `<p>Pensjonat (ZL V), pokoje po obu stronach ślepego korytarza, od drzwi ostatniego pokoju do obudowanej klatki z drzwiami EI 30 i urządzeniami przeciw zadymieniu - 13 m.</p>
<ol><li>Limit ZL V przy jednym dojściu: 10 m.</li><li>Klatka spełnia § 256 ust. 2 WT, więc dojście kończy się przy drzwiach klatki: 13 m.</li><li>13 m to ponad 10 m. Rozwiązania: oddymianie korytarza uruchamiane czujkami dymu (+50% = 15 m - wystarczy) albo drugie wyjście z końca korytarza (np. zewnętrzne schody), albo przeniesienie gości z dwóch ostatnich pokoi.</li></ol>`)}
${wlasciciel(`<p>„Z końca korytarza do schodów jest 14 metrów i nie ma drugiej drogi. Dla hotelu dopuszczalne jest 10 metrów. Albo zrobimy drugie wyjście, albo trzeba oddymiania czy tryskaczy, które pozwalają ten dystans wydłużyć.”</p>`)}
${wlasciciel(`<p>„Na korytarzu stoją dwie szafy na dokumenty. Korytarz ma 1,6 m, a po szafach zostało 1,1 m - mniej niż wymagane 1,4 m. To jest zakaz z rozporządzenia o ochronie przeciwpożarowej (§ 4 ust. 1 pkt 11). Proszę je przenieść do pokoju. Przy kontroli PSP to jedna z najczęstszych uwag.”</p>`)}
${wlasciciel(`<p>„Drzwi z sali na 120 osób otwierają się do środka. Przy panice ludzie napierają na drzwi i nikt ich nie otworzy do siebie. Przepis wymaga otwierania na zewnątrz dla sal ponad 50 osób. Wystarczy przełożyć skrzydło - to koszt kilkuset złotych, a nie remont.”</p>`)}
${pulapki(["Przejście = w pomieszczeniu (P = P); dojście = korytarzem (D = droga). Egzamin lubi zamieniać te pojęcia.", "ZL I, II i V - przy jednym dojściu tylko 10 m.", "Przejście nie przez więcej niż 3 pomieszczenia.", "Drzwi i przejście min. 0,9 m, korytarz min. 1,4 m (1,2 m dla nie więcej niż 20 osób).",
    "Przejście mierzysz od <b>najdalszego miejsca, w którym może być człowiek</b>, a nie od środka sali.",
    "Gdy nie wiadomo, jak będzie urządzone pomieszczenie, projektuje się tylko <b>80%</b> dopuszczalnej długości przejścia (§ 237 ust. 4 WT).",
    "Pomieszczenie wyższe niż <b>5 m</b>: przejście +25%. Powiększenia się <b>sumują</b> (wysokość + tryskacze + oddymianie).",
    "Dwa wyjścia z pomieszczenia muszą być od siebie co najmniej <b>5 m</b>.",
    "Drugie wyjście: ponad <b>50 osób</b> (w ZL II ponad <b>30</b>), ZL ponad <b>300 m²</b>, PM Q ponad 500 ponad 300 m², PM Q do 500 ponad <b>1000 m²</b>, zagrożone wybuchem ponad <b>100 m²</b>.",
    "Drzwi otwierają się na zewnątrz pomieszczenia m.in. dla ponad <b>50 osób</b> i dla ponad <b>6 osób</b> o ograniczonej zdolności poruszania się.",
    "Przy dwóch dojściach dłuższe może być o <b>100%</b> dłuższe od krótszego; wspólny początek najwyżej <b>2 m</b>.",
    "Korytarz: wysokość co najmniej <b>2,2 m</b>, lokalne obniżenie do <b>2 m</b> na najwyżej 1,5 m na każde 10 m drogi.",
  ])}`),
  },
  {
    id: "zjawiska", skrot: "DYM", tytul: "Parametry zjawisk pożarowych: dym, płomień, temperatura",
    html: () => nbsp(`
${ludzku(`<p>Pożar „zdradza się” trzema zjawiskami: <b>dymem</b>, <b>płomieniem</b> i <b>ciepłem</b>. Każda czujka pożarowa „łapie” jedno z nich. Zwykły pożar w budynku najpierw dymi, potem pojawia się płomień, a na końcu rośnie temperatura - dlatego czujki dymu reagują najwcześniej.</p>`)}
${tab(["Zjawisko", "Czym jest", "Czym grozi", "Czujka"], [
    ["Dym", "gazy ze spalania z drobinami sadzy i kropelkami - zasłania widok", "ludzie gubią drogę, trujące gazy: tlenek węgla (czad), cyjanowodór; najwięcej ofiar ginie od dymu, nie od ognia", "optyczna (światło odbite od dymu), jonizacyjna"],
    ["Płomień", "świecąca strefa, w której spalają się gazy; promieniuje podczerwienią i nadfioletem, migocze", "zapala sąsiednie przedmioty promieniowaniem, oparzenia", "płomienia (podczerwień IR lub nadfiolet UV)"],
    ["Temperatura (ciepło)", "przenosi się przez konwekcję (gorące gazy idą w górę), promieniowanie i przewodzenie", "rozgorzenie, utrata nośności konstrukcji (stal traci nośność ok. 500 °C)", "ciepła: nadmiarowa (próg temperatury), różniczkowa (szybki wzrost)"],
  ])}
<h3>Jaką czujkę gdzie</h3>
${tab(["Miejsce", "Czujka", "Dlaczego"], [["biuro, hotel, korytarz", "dymu (optyczna)", "pożar tli się i dymi, zanim pojawi się płomień"], ["kuchnia, kotłownia, zakurzona hala", "ciepła", "para i kurz powodowałyby fałszywe alarmy czujek dymu"], ["magazyn cieczy palnych, lakiernia", "płomienia", "pożar od razu daje płomień, bez fazy dymienia"], ["wysoka hala (np. 15 m)", "liniowa dymu lub zasysająca", "dym rozrzedza się, zanim dotrze do sufitu"]])}
${galeria(["dym-pozar-domu", "dym-cwiczenie"])}
${wyklad(`<p>Proszę Państwa, w pożarach budynków ludzie giną przede wszystkim od dymu, a nie od płomieni. Dym robi trzy rzeczy naraz. <b>Zasłania</b>: w korytarzu pełnym dymu nie widać znaku wyjścia ani własnej ręki. <b>Truje</b>: niesie tlenek węgla, cyjanowodór, chlorowodór i inne gazy. <b>Parzy</b>: gorący dym uszkadza drogi oddechowe przy pierwszym wdechu.</p>
<p>Ile dymu da pożar, zależy od tego, co się pali i ile jest tlenu. Spalanie <b>całkowite</b>, przy dużej ilości tlenu, daje głównie dwutlenek węgla i parę wodną. Spalanie <b>niecałkowite</b>, przy braku tlenu (zamknięty pokój), daje tlenek węgla i sadzę, czyli produkty dużo bardziej trujące. Drewno ma w cząsteczce 40-50% tlenu, więc dymi mniej niż tworzywa sztuczne z ropy. Kanapa z pianki i poliestru daje dużo więcej czarnego, trującego dymu niż drewniany stół.</p>
<p>Płomień to miejsce, w którym palą się gazy. Świeci, bo w płomieniu żarzą się drobiny sadzy. Ta sama sadza wysyła większość <b>promieniowania cieplnego</b>, które zapala przedmioty na odległość. Temperatura to trzeci parametr. Rośnie najpóźniej, dlatego czujka ciepła reaguje później niż czujka dymu.</p>`)}
<h3>Co jest w dymie (materiały kursu, prezentacja T-1)</h3>
${tab(["Gaz", "Skąd się bierze", "Czym grozi"], [
    ["tlenek węgla (CO, czad)", "spalanie przy braku tlenu - prawie każdy pożar w zamkniętym pomieszczeniu", "wiąże hemoglobinę we krwi, człowiek traci przytomność, nie czując zapachu"],
    ["dwutlenek węgla (CO₂)", "spalanie całkowite", "przyspiesza oddech, więc człowiek wdycha więcej trujących gazów"],
    ["cyjanowodór (HCN)", "pianki poliuretanowe, wełna, tworzywa z azotem", "bardzo szybko trujący"],
    ["chlorowodór (HCl)", "PVC: przewody, wykładziny, okna", "żrący dla dróg oddechowych i oczu"],
    ["dwutlenek siarki (SO₂), tlenki azotu", "paliwa i materiały z siarką i azotem", "drażnią i uszkadzają płuca"],
    ["akroleina", "rozkład drewna, tłuszczów, tworzyw", "silnie drażni już w małych ilościach"],
  ])}
<p>Toksyczność produktów rozkładu i spalania materiałów ocenia się wskaźnikiem toksykometrycznym WLC50SM: <b>bardzo toksyczne</b> - do 15, <b>toksyczne</b> - ponad 15 do 40, <b>umiarkowanie toksyczne</b> - ponad 40 (materiały kursu). Im mniejsza liczba, tym gorzej.</p>
${przyklad("dlaczego czujka dymu, a nie ciepła, w pokoju hotelowym", `<ol><li>W nocy gość śpi. Zapala się kołdra od papierosa albo przegrzana ładowarka.</li><li>Tli się bez płomienia, a temperatura w pokoju rośnie powoli. Za to dym z tlącej się tkaniny i pianki pojawia się od razu.</li><li>Czujka ciepła zadziałałaby dopiero przy kilkudziesięciu stopniach pod sufitem, a wtedy gość może być już nieprzytomny od tlenku węgla.</li><li>Czujka dymu wykrywa pożar w fazie tlenia, gdy człowiek jeszcze może wyjść. Dlatego § 28a rozp. 2010 wymaga w pokojach i mieszkaniach czujek <b>dymu</b>.</li></ol>`)}
${przyklad("magazyn z PVC - na co uważać", `<p>Hurtownia materiałów instalacyjnych: rury, korytka kablowe i przewody w izolacji z PVC.</p><ol><li>W pożarze PVC wydziela chlorowodór, który z wilgocią tworzy kwas solny. Niszczy płuca, a po pożarze także elektronikę i stal w całej hali.</li><li>Dla ludzi znaczy to krótszy czas na ucieczkę. Drogi ewakuacyjne muszą być krótkie i dobrze oznakowane, a ćwiczenia ewakuacji regularne.</li><li>W IBP, w parametrach pożarowych substancji (§ 6 ust. 1 pkt 8 lit. c rozp. 2010), warto wpisać, że w pożarze powstaje chlorowodór. Strażacy pracują wtedy w aparatach oddechowych także przy dogaszaniu.</li></ol>`)}
${wlasciciel(`<p>„W kuchni nie montujemy czujki dymu, bo para z garnków co chwilę włączałaby alarm i ewakuację. Tu działa czujka ciepła.”</p>`)}
${wlasciciel(`<p>„Ta sofa w recepcji jest z pianki poliuretanowej. W pożarze daje gęsty, czarny dym z cyjanowodorem i w kilka minut zadymi cały hol, czyli Pana drogę ewakuacyjną. Na drodze ewakuacyjnej meble z tworzyw to proszenie się o kłopot. Lepiej przenieść je do pomieszczenia obok.”</p>`)}
${pulapki(["Podstawowe parametry zjawisk pożarowych: <b>dym, płomień, temperatura</b>.", "Czujki najczęściej reagują na dym.", "Największą liczbę ofiar powoduje tlenek węgla (czad).", "Czujka różniczkowa reaguje na szybkość wzrostu temperatury, nadmiarowa - na przekroczenie progu.",
    "Spalanie <b>niecałkowite</b> (mało tlenu) daje CO i sadzę; całkowite - CO₂ i wodę.",
    "Drewno dymi mniej niż węglowodory, bo ma w cząsteczce 40-50% tlenu.",
    "Świecenie płomienia i większość promieniowania pochodzą od <b>cząstek sadzy</b>.",
    "WLC50SM: do 15 - bardzo toksyczne; 15-40 - toksyczne; ponad 40 - umiarkowanie toksyczne.",
  ])}`),
  },
  {
    id: "wysokosci", skrot: "N/W", tytul: "Budynki niskie, średniowysokie, wysokie i wysokościowe",
    html: () => nbsp(`
${ludzku(`<p>Im wyższy budynek, tym trudniej z niego uciec i tym trudniej strażakom go gasić (drabina sięga ok. 30-40 m). Dlatego przepisy dzielą budynki na cztery grupy wysokości i od nich zależą wymagania.</p>`)}
${rys(SVG_WYSOKOSCI, "Rysunek: grupy wysokości budynków (§ 8 WT)")}
${tab(["Grupa", "Każdy budynek", "Budynek mieszkalny", "Przykład"], [["niski (N)", "do 12 m włącznie", "do 4 kondygnacji nadziemnych", "dom, szkoła parterowa, blok: parter + 3 piętra (4 kondygnacje)"], ["średniowysoki (SW)", "ponad 12 do 25 m", "5-9 kondygnacji", "blok: parter + 8 pięter (9 kondygnacji), biurowiec 20 m"], ["wysoki (W)", "ponad 25 do 55 m", "10-18 kondygnacji", "blok: parter + 11 pięter (12 kondygnacji), biurowiec 40 m"], ["wysokościowy (WW)", "ponad 55 m", "-", "wieżowce w centrach miast"]])}
<h3>Jak mierzyć (§ 6 WT)</h3>
<p>Od poziomu terenu przy <b>najniżej położonym wejściu</b> do budynku do górnej powierzchni <b>najwyższego stropu</b> (z ociepleniem) albo najwyższego punktu stropodachu - bez maszynowni dźwigów i innych pomieszczeń technicznych ponad dachem.</p>
<h3>Trzy grupy według przeznaczenia (§ 209 WT)</h3>
${tab(["Grupa", "Co obejmuje"], [["ZL", "mieszkalne, zamieszkania zbiorowego, użyteczności publicznej - kategorie ZL I-V (temat 10)"], ["PM", "produkcyjne i magazynowe, a także garaże, kotłownie, hydrofornie, węzły cieplne, rozdzielnie, stacje transformatorowe"], ["IN", "inwentarskie - dla zwierząt"]])}
${galeria(["myszkow-kosciuszki", "zawiercie-taz", "altus-katowice"])}
${wyklad(`<p>Proszę Państwa, dlaczego akurat 12, 25 i 55 metrów? Bo te liczby to granice możliwości ratowników i ludzi. Do mniej więcej 12 m strażak dosięgnie okna drabiną przenośną albo zwykłym podnośnikiem, a człowiek zejdzie schodami w chwilę. Do 25 m sięga typowy podnośnik czy drabina mechaniczna, ale zejście trwa już dłużej. Powyżej 25 m ratujemy ludzi głównie od środka budynku: klatkami schodowymi, które muszą być wolne od dymu. Powyżej 55 m budynek musi bronić się sam przez długi czas.</p>
<p>Uwaga na słówko <b>„lub”</b> w § 8 WT. Budynek mieszkalny może być zaliczony według metrów <b>albo</b> według kondygnacji. Blok z 4 kondygnacjami nadziemnymi to budynek niski, nawet jeśli ma 13 m. Ta furtka dotyczy tylko budynków <b>mieszkalnych</b>, czyli ZL IV. Hotel, pensjonat czy akademik (ZL V) nie są mieszkalne i liczy się dla nich tylko wysokość w metrach.</p>
<p>I sposób mierzenia (§ 6 WT): od terenu przy <b>najniżej położonym wejściu</b> do budynku, które jest na pierwszej kondygnacji nadziemnej, do górnej powierzchni najwyżej położonego stropu, razem z ociepleniem i jego warstwą osłonową. Nie liczy się maszynowni dźwigów i innych pomieszczeń technicznych wystających ponad dach. Na skarpie ten sam budynek od strony ulicy może mieć 11 m, a od strony podwórza, gdzie jest niższe wejście, 13 m. Liczy się wejście najniższe.</p>`)}
<h3>Co się zmienia z wysokością - zestawienie</h3>
${tab(["Wymaganie", "N", "SW", "W", "WW", "Przepis"], [
    ["Hydrant 25 w ZL", "ZL I, II, V ponad 200 m²; ZL III ponad 1000 m²", "ZL I, II, V ponad 200 m²; ZL III ponad 200 m²", "każda kondygnacja (poza samymi mieszkaniami)", "każda kondygnacja (poza samymi mieszkaniami)", "§ 19 ust. 1 rozp. 2010"],
    ["Zawory 52 dla strażaków", "nie", "nie", "tak (ponad 1 kondygnacja)", "tak", "§ 19 ust. 6 rozp. 2010"],
    ["SSP w budynku użyteczności publicznej", "według innych progów", "według innych progów", "tak", "tak", "§ 28 ust. 1 pkt 10 rozp. 2010"],
    ["DSO (komunikat głosowy) w budynku użyteczności publicznej i zamieszkania zbiorowego", "według innych progów", "według innych progów", "tak", "tak", "§ 29 ust. 1 pkt 5-6 rozp. 2010"],
    ["Klatki obudowane, drzwi dymoszczelne, przeciw zadymieniu", "ZL II, PM Q ponad 500", "ZL I, II, III, V, PM Q ponad 500", "dwie klatki z przedsionkami przeciwpożarowymi", "dwie klatki z przedsionkami, z ochroną przed zadymieniem", "§ 245-246 WT"],
    ["Drzwi z pokoi hotelowych (ZL V) na korytarz EI 30", "nie", "tak", "tak", "tak", "§ 246 ust. 6 WT"],
    ["Klasa odporności pożarowej ZL III", "C (1 kondygnacja - D)", "B", "B", "A", "§ 212 WT"],
  ])}
${przyklad("do jakiej grupy należy budynek?", `${tab(["Budynek", "Dane", "Grupa", "Dlaczego"], [
    ["Blok mieszkalny", "4 kondygnacje nadziemne, 13,2 m", "<b>N</b>", "mieszkalny do 4 kondygnacji - działa „lub” z § 8 pkt 1"],
    ["Pensjonat", "4 kondygnacje, 13,2 m", "<b>SW</b>", "nie jest mieszkalny (ZL V), więc liczą się tylko metry: ponad 12 m"],
    ["Biurowiec", "12,0 m", "<b>N</b>", "„do 12 m włącznie”"],
    ["Biurowiec", "12,3 m", "<b>SW</b>", "ponad 12 m"],
    ["Blok mieszkalny", "10 kondygnacji, 28 m", "<b>W</b>", "mieszkalny ponad 9 do 18 kondygnacji; także ponad 25 m"],
    ["Szpital", "26 m", "<b>W</b>", "ponad 25 m - hydranty 25 na każdej kondygnacji, zawory 52, SSP, DSO"],
    ["Altus w Katowicach", "ok. 125 m", "<b>WW</b>", "ponad 55 m"],
  ])}`)}
${przyklad("budynek na skarpie w Ogrodzieńcu", `<p>Pensjonat stoi na zboczu. Od ulicy wejście główne, budynek ma tam 11,5 m do stropu nad ostatnią kondygnacją. Od strony ogrodu jest drugie wejście, 1,5 m niżej, do sali śniadaniowej na pierwszej kondygnacji nadziemnej.</p>
<ol><li>Mierzymy od <b>najniżej położonego wejścia</b> na pierwszej kondygnacji nadziemnej (§ 6 WT): 11,5 + 1,5 = <b>13 m</b>.</li><li>Pensjonat to ZL V, nie mieszkanie, więc liczą się tylko metry: ponad 12 m = <b>średniowysoki (SW)</b>.</li><li>Skutki: klatka obudowana z drzwiami dymoszczelnymi i urządzeniami przeciw zadymieniu (§ 245 pkt 2 WT), drzwi z pokoi na korytarz EI 30 (§ 246 ust. 6 WT), klasa odporności pożarowej B.</li><li>Gdyby wejście od ogrodu było na kondygnacji podziemnej, a nie nadziemnej, mierzyłoby się od wejścia od ulicy - to wymaga sprawdzenia w projekcie.</li></ol>`)}
${wlasciciel(`<p>„Pana biurowiec ma 26 m - to już budynek wysoki. Każdy metr ponad 25 ma znaczenie: wyższa klasa odporności, hydranty na każdej kondygnacji, ostrzejsze wymagania dla klatek schodowych.”</p>`)}
${wlasciciel(`<p>„Chce Pan dobudować piąte piętro do pensjonatu. Dziś budynek ma 11,8 m, więc jest niski. Po nadbudowie będzie miał ponad 12 m i stanie się średniowysoki. To nie tylko piętro więcej: klatka musi zostać obudowana i zabezpieczona przed dymem, drzwi pokoi muszą być ognioodporne. Te koszty trzeba policzyć, zanim zamówi Pan projekt.”</p>`)}
${pulapki(["„do 12 m włącznie” - 12,0 m to jeszcze niski.", "Budynek mieszkalny klasyfikuje się po <b>kondygnacjach</b>, inne - po metrach.", "Mieszkalny ponad 55 m - i tak WW.", "Mierzy się od najniżej położonego wejścia, nie od średniego poziomu terenu.",
    "Liczy się wejście na <b>pierwszej kondygnacji nadziemnej</b>, a pomiar kończy się na górnej powierzchni najwyższego stropu <b>z ociepleniem</b>.",
    "Maszynowni dźwigów i pomieszczeń technicznych ponad dachem <b>nie wlicza się</b>.",
    "Hotel, pensjonat, akademik to <b>nie</b> budynki mieszkalne - kondygnacje nic tu nie zmieniają, liczą się metry.",
    "Granice: <b>12 / 25 / 55 m</b>; dla mieszkalnych: <b>4 / 9 / 18</b> kondygnacji.",
    "Zawory 52 - dopiero w budynkach <b>wysokich i wysokościowych</b>.",
  ])}`),
  },
  {
    id: "strefy-ex", skrot: "Ex", tytul: "Strefy zagrożenia wybuchem: 0, 1, 2 i 20, 21, 22",
    html: () => nbsp(`
${ludzku(`<p>Strefa zagrożenia wybuchem to miejsce, gdzie w powietrzu może pojawić się palny gaz, opar albo pył w takiej ilości, że iskra wywoła wybuch. Numer mówi, <b>jak często</b> taka mieszanina tam jest: 0 lub 20 - stale, 1 lub 21 - czasami, 2 lub 22 - rzadko i krótko. Pierwsza cyfra „2” przy dwucyfrowych oznacza pył.</p>`)}
${tab(["Gazy, pary, mgły", "Pyły", "Jak często jest mieszanina wybuchowa", "Przykład"], [["strefa 0", "strefa 20", "stale, długo lub często", "wnętrze zbiornika paliwa; wnętrze silosu z mąką"], ["strefa 1", "strefa 21", "czasami, przy normalnej pracy", "wnętrze odmierzacza na stacji; miejsce napełniania worków mąką"], ["strefa 2", "strefa 22", "rzadko i krótko, tylko przy awarii", "okolica odpowietrzenia zbiornika; pomieszczenie obok silosu"]])}
${rys(SVG_STACJA, "Rysunek: strefy na stacji paliw (wymiary z załącznika do rozporządzenia o stacjach paliw z 2023 r.; wnętrze zbiornika - strefa 0 wg normy)")}
${tab(["Miejsce na stacji paliw", "Strefa"], [["część hydrauliczna odmierzacza i zagłębienie pod nim", "1"], ["szczelina bezpieczeństwa odmierzacza", "2"], ["zbiornik podziemny - wokół wylotu odpowietrzenia", "2, promień 1,5 m"], ["studzienka zlewowa", "2, promień 1 m od osi przewodu spustowego"], ["pompa na otwartej przestrzeni", "1 do 1,5 m, dalej 2 do kolejnych 1,5 m"]])}
<h3>Co z tego wynika w praktyce</h3>
<ul><li>W strefie wolno używać tylko urządzeń w wykonaniu przeciwwybuchowym (znak Ex): strefa 0 - kategoria 1, strefa 1 - kategoria 2, strefa 2 - kategoria 3.</li><li>Zakaz otwartego ognia, palenia i iskrzących narzędzi (§ 4 ust. 1 pkt 1 lit. a rozp. 2010).</li><li>Strefy wyznacza w ocenie zagrożenia wybuchem inwestor, projektant lub użytkownik decydujący o technologii (§ 37 ust. 4 rozp. 2010); strefę wyznacza się, gdy mieszanina może mieć co najmniej 0,01 m³ (§ 37 ust. 9).</li><li>Obiekt ze strefą Ex zawsze potrzebuje IBP i przeciwpożarowego wyłącznika prądu.</li></ul>
${galeria(["znak-ex", "kabina-lakiernicza"])}
${wyklad(`<p>Proszę Państwa, do wybuchu potrzeba trzech rzeczy naraz: <b>palnego gazu, pary albo pyłu</b> w odpowiednim stężeniu (między DGW i GGW), <b>tlenu</b> z powietrza i <b>źródła zapłonu</b>. Strefa zagrożenia wybuchem to odpowiedź na pytanie: gdzie i jak często ta pierwsza rzecz może się pojawić. Skoro tam może być mieszanina, to musimy zabrać stamtąd trzecią rzecz, czyli wszystko, co iskrzy i grzeje.</p>
<p>Dwie rodziny stref: <b>0, 1, 2</b> dla gazów, par i mgieł oraz <b>20, 21, 22</b> dla pyłów. Mała cyfra to częstsza mieszanina. Strefa 0 albo 20 to miejsce, gdzie mieszanina jest stale albo często, np. wnętrze zbiornika. Strefa 2 albo 22 to miejsce, gdzie pojawia się tylko przy awarii i na krótko.</p>
<p>Uwaga na dwa pojęcia, które brzmią podobnie. <b>Strefa zagrożenia wybuchem</b> to przestrzeń, w której może być mieszanina - wyznacza się ją od 0,01 m³ mieszaniny w zwartej przestrzeni (§ 37 ust. 9 rozp. 2010). <b>Pomieszczenie zagrożone wybuchem</b> to takie, w którym wybuch dałby przyrost ciśnienia ponad 5 kPa (§ 37 ust. 7). Pomieszczenie może mieć małą strefę, a nie być pomieszczeniem zagrożonym wybuchem. Od pomieszczenia zagrożonego wybuchem zależą wymagania budowlane: krótsze przejście (40 m), drzwi na zewnątrz, przedsionek, lekki dach.</p>`)}
<h3>Ocena zagrożenia wybuchem - co mówi przepis (§ 37 rozp. 2010)</h3>
${tab(["Ustęp", "Treść"], [
    ["ust. 1", "ocenę robi się wszędzie tam, gdzie w procesie lub magazynie są materiały mogące wytworzyć mieszaniny wybuchowe - także na terenie przy obiekcie"],
    ["ust. 2", "obejmuje: wskazanie pomieszczeń zagrożonych wybuchem, wyznaczenie stref (w pomieszczeniach i na zewnątrz) z graficzną dokumentacją klasyfikacyjną, wskazanie czynników mogących zainicjować zapłon"],
    ["ust. 3", "dokumentacja graficzna: plany z rodzajem i zasięgiem stref oraz źródłami emisji, według Polskich Norm"],
    ["ust. 4", "ocenę robi <b>inwestor, projektant lub użytkownik</b> decydujący o procesie technologicznym"],
    ["ust. 5", "może być częścią oceny ryzyka wybuchu z przepisów BHP"],
    ["ust. 6", "klasyfikację stref określa Polska Norma"],
    ["ust. 7-8", "pomieszczenie zagrożone wybuchem - przyrost ciśnienia ponad 5 kPa; sposób liczenia w załączniku nr 2"],
    ["ust. 9", "strefę wyznacza się, gdy mieszanina może mieć co najmniej 0,01 m³ w zwartej przestrzeni"],
  ])}
${przyklad("warsztat z kabiną lakierniczą w Łazach", `<ol><li>Lakier i rozpuszczalnik dają pary palne. Wnętrze kabiny podczas malowania to <b>strefa 1</b>, bo mieszanina pojawia się przy normalnej pracy.</li><li>Okolica kabiny i drzwi - zwykle strefa 2. Dokładny zasięg wynika z oceny zagrożenia wybuchem (§ 37 rozp. 2010), a nie z wyczucia.</li><li>Skutki: w strefie tylko urządzenia z oznaczeniem Ex właściwej kategorii (strefa 1 - co najmniej kategoria 2G), zakaz otwartego ognia i iskrzących narzędzi, obowiązkowa IBP nawet w małym warsztacie (§ 6 ust. 8 rozp. 2010).</li><li>Szlifowanie czy spawanie przy kabinie - tylko po pisemnym zabezpieczeniu prac i pomiarze: stężenie najwyżej 10% DGW (§ 36 ust. 2 pkt 2 rozp. 2010).</li></ol>`)}
${przyklad("piekarnia i młyn - pył też wybucha", `<ol><li>Mąka to pył palny. Wnętrze silosu i mieszalnika przy napełnianiu - strefa 20 lub 21.</li><li>Najgroźniejsza jest warstwa mąki na belkach i parapetach: mały wybuch albo podmuch podnosi ją w powietrze i wtedy następuje drugi, dużo silniejszy wybuch.</li><li>Dlatego przepis każe regularnie usuwać pył zalegający w warstwach (§ 4 ust. 6 rozp. 2010). Na obchodzie sprawdzasz, czy jest harmonogram sprzątania i czy się go przestrzega.</li></ol>`)}
${przyklad("akumulatornia wózków widłowych", `<ol><li>Przy ładowaniu akumulatorów kwasowo-ołowiowych wydziela się <b>wodór</b> (pyt. 365) - zakres wybuchowości 4,1-74,2%, bardzo szeroki.</li><li>Wodór jest lżejszy od powietrza i zbiera się pod sufitem, więc wentylacja musi odbierać powietrze górą.</li><li>Ocena zagrożenia wybuchem wskaże, czy i gdzie jest strefa. Jeśli jest - urządzenia elektryczne w tej strefie w wykonaniu Ex, a ładowarki poza strefą.</li></ol>`)}
${wlasciciel(`<p>„Przy kabinie lakierniczej jest strefa 1. Zwykła lampa, wentylator czy telefon mogą dać iskrę. Wszystko w tej strefie musi mieć oznaczenie Ex, a w instrukcji musi być plan stref.”</p>`)}
${wlasciciel(`<p>„Ocenę zagrożenia wybuchem robi ten, kto decyduje o technologii - czyli Pan albo projektant. Ja mogę ją przygotować razem z Panem, ale podpisuje ją Pan. Bez niej nikt nie wie, gdzie wolno stawiać zwykłe gniazdka, a gdzie tylko przeciwwybuchowe.”</p>`)}
${pulapki(["Strefa 21 = pył, czasami w normalnej pracy.", "Strefa 0 = gaz/pary stale; strefa 20 = pył stale.", "Strefa zagrożenia wybuchem (gdzie może być mieszanina) ≠ pomieszczenie zagrożone wybuchem (gdzie wybuch dałby ponad 5 kPa).", "Minimalna objętość mieszaniny do wyznaczenia strefy: 0,01 m³.",
    "Ocenę zagrożenia wybuchem robi <b>inwestor, projektant lub użytkownik</b> decydujący o procesie (§ 37 ust. 4).",
    "Ocena obejmuje także <b>przestrzenie zewnętrzne</b> i graficzną dokumentację klasyfikacyjną.",
    "Kategorie urządzeń: strefa 0/20 - kategoria 1; strefa 1/21 - kategoria 2; strefa 2/22 - kategoria 3. G = gazy, D = pyły.",
    "Strefa Ex w obiekcie oznacza <b>zawsze</b> obowiązek IBP.",
    "Przejście w pomieszczeniu zagrożonym wybuchem - najwyżej <b>40 m</b>; drugie wyjście - ponad <b>100 m²</b>.",
  ])}`),
  },
  {
    id: "klasy-strefy", skrot: "KLASA", tytul: "Klasa odporności pożarowej i wielkość strefy - jak ustalić",
    html: () => nbsp(`
${ludzku(`<p>Klasa odporności pożarowej (A - najlepsza, E - najsłabsza) mówi, jak długo cały budynek ma się bronić przed ogniem. Strefa pożarowa to część budynku zamknięta ścianami ogniowymi - im większa i groźniejsza, tym trudniej ją ugasić, więc przepisy ograniczają jej powierzchnię.</p>`)}
<h3>Krok po kroku</h3>
<ol><li>Ustal grupę: ZL (i kategorię I-V), PM albo IN.</li><li>Ustal wysokość: N, SW, W, WW (temat 6) i liczbę kondygnacji.</li><li>Dla PM i IN policz gęstość obciążenia ogniowego Q (temat 13).</li><li>Odczytaj klasę z tabeli.</li><li>Odczytaj wymagania dla ścian, stropów, konstrukcji (§ 216 WT).</li><li>Sprawdź, czy strefa mieści się w dopuszczalnej powierzchni.</li></ol>
<h3>Klasa dla ZL (§ 212 ust. 2 WT)</h3>
${tab(["", "ZL I", "ZL II", "ZL III", "ZL IV", "ZL V"], [["niski (N)", "B", "B", "C", "D", "C"], ["średniowysoki (SW)", "B", "B", "B", "C", "B"], ["wysoki (W)", "B", "B", "B", "B", "B"], ["wysokościowy (WW)", "A", "A", "A", "B", "A"]])}
<p>Obniżenie (§ 212 ust. 3 WT): budynek <b>1-kondygnacyjny</b> ZL I, II, III → <b>D</b>; <b>2-kondygnacyjny</b> (strop nad parterem do 9 m) ZL I i II → C, ZL III → D.</p>
<h3>Klasa dla PM i IN (§ 212 ust. 4 WT)</h3>
${tab(["Q [MJ/m²]", "1 kondygnacja", "N", "SW", "W", "WW"], [["do 500", "E", "D", "C", "B", "B"], ["500-1000", "D", "D", "C", "B", "B"], ["1000-2000", "C", "C", "C", "B", "B"], ["2000-4000", "B", "B", "B", "niedozwolone", "niedozwolone"], ["ponad 4000", "A", "A", "A", "niedozwolone", "niedozwolone"]])}
<p>Budynki inwentarskie do 1500 m³ i małe budynki z § 213 WT (np. dom jednorodzinny do 3 kondygnacji) - bez wymagań klasy.</p>
<h3>Wielkość strefy</h3>
${tab(["ZL (§ 227 WT)", "1 kondygnacja", "N", "SW", "W i WW"], [["ZL I, III, IV, V", "10 000 m²", "8000 m²", "5000 m²", "2500 m²"], ["ZL II", "8000 m²", "5000 m²", "3500 m²", "2000 m²"]])}
${tab(["PM bez zagrożenia wybuchem (§ 228 WT)", "1 kondygnacja", "N i SW", "W i WW"], [["Q do 500", "20 000 m²", "10 000 m²", "5000 m²"], ["500-1000", "15 000 m²", "8000 m²", "2500 m²"], ["1000-2000", "8000 m²", "4000 m²", "1000 m²"], ["2000-4000", "4000 m²", "2000 m²", "niedozwolone"], ["ponad 4000", "2000 m²", "1000 m²", "niedozwolone"]])}
<p>Z pomieszczeniem zagrożonym wybuchem wartości są mniejsze (np. Q do 500, 1 kondygnacja - 8000 m²). Powiększenia: ZL - tryskacze +100%, oddymianie +100%, oba +200% (§ 227 ust. 4); PM - tryskacze +100%, oddymianie +50%, oba +150% (§ 229). IN (§ 231): 1 kondygnacja - 5000 m² (hodowla ściółkowa), bez ograniczeń (bezściółkowa).</p>
<h3>Przykłady</h3>
${tab(["Budynek", "Klasa", "Strefa najwyżej"], [["Szkoła, 3 kondygnacje, 11 m (ZL III, N)", "C", "8000 m²"], ["Biurowiec 30 m (ZL III, W)", "B", "2500 m²"], ["Hurtownia parterowa z klientami (ZL I)", "B → obniżona do D", "10 000 m²"], ["Hala produkcyjna parterowa, Q = 800", "D", "15 000 m²"], ["Magazyn 2-kondygnacyjny 10 m, Q = 1500", "C", "4000 m²"]])}
${wyklad(`<p>Proszę Państwa, dwa pojęcia, które na egzaminie mylą się najczęściej. <b>Klasa odporności pożarowej</b> to ocena całego budynku, litera od A do E. <b>Klasa odporności ogniowej</b> to ocena jednego elementu: ściany, stropu, drzwi. Zapisuje się ją literami i minutami, np. REI 60. Budynek klasy B to budynek, którego elementy mają odpowiednio wysokie klasy odporności ogniowej, opisane w § 216 WT. Najpierw ustalacie literę dla budynku, a z niej odczytujecie minuty dla elementów.</p>
<p>Litery w klasie elementu: <b>R</b> - nośność (nie zawali się), <b>E</b> - szczelność (nie przepuści płomieni i gorących gazów), <b>I</b> - izolacyjność (druga strona nie nagrzeje się tak, żeby zapalić coś, co przy niej stoi). Ściana nośna między strefami musi mieć wszystkie trzy, więc REI. Drzwi nic nie dźwigają, więc EI.</p>
<p><b>Strefa pożarowa</b> to „przedział” budynku, w którym pożar ma zostać zamknięty, jak przedział wodoszczelny na statku. Strefę wydzielają ściany i stropy oddzielenia przeciwpożarowego, z materiałów niepalnych, z drzwiami przeciwpożarowymi w otworach (§ 232 ust. 1 WT). Granicą strefy może też być pas wolnego terenu, np. odległość między dwoma budynkami (§ 226 ust. 1 WT). Im strefa większa i im więcej w niej paliwa, tym trudniej ją ugasić, dlatego przepis ogranicza jej powierzchnię.</p>`)}
<h3>Ściany i stropy oddzielenia przeciwpożarowego (§ 232 WT)</h3>
${tab(["Zasada", "Wartość", "Przepis"], [
    ["Materiał", "niepalny", "§ 232 ust. 1"],
    ["Otwory", "zamykane drzwiami lub innym zamknięciem przeciwpożarowym albo przez przedsionek przeciwpożarowy", "§ 232 ust. 1"],
    ["Ile otworów w ścianie", "łącznie najwyżej 15% powierzchni ściany", "§ 232 ust. 2"],
    ["Ile otworów w stropie", "najwyżej 0,5% powierzchni stropu", "§ 232 ust. 2"],
    ["Przedsionek przeciwpożarowy", "co najmniej 1,4 × 1,4 m", "§ 232 ust. 3"],
    ["Luksfery, szkło w ścianie oddzielenia", "najwyżej 10% powierzchni ściany, z odpowiednią klasą odporności ogniowej", "§ 232 ust. 6"],
    ["Powierzchnia strefy", "powierzchnia wewnętrzna, razem z antresolą", "§ 226 ust. 3"],
    ["Kondygnacja jako osobna strefa", "możliwa, gdy klatki i szyby dźwigów spełniają wymagania § 256 ust. 2 (obudowane, EI 30, ochrona przed dymem)", "§ 226 ust. 2"],
  ])}
${galeria(["sciana-ogniowa2"])}
<h3>Nowość od 2024 r.: oznakowanie ściany oddzielenia na zewnątrz</h3>
<p>W budynkach handlowych, produkcyjnych i magazynowych, gdzie ściana oddzielenia dzieli strefy o powierzchni <b>co najmniej 2000 m² każda</b>, a ściany zewnętrzne lub dach choć jednej strefy nie są niepalne albo gęstość obciążenia ogniowego w choć jednej strefie przekracza <b>1000 MJ/m²</b>, właściciel oznakowuje z zewnątrz miejsce, w którym ściana oddzielenia styka się ze ścianą zewnętrzną i z dachem (§ 4 ust. 2 pkt 6 rozp. 2010). Wzór oznakowania jest w załączniku nr 1 do rozporządzenia albo uzgadnia się inny z komendantem powiatowym PSP. Strażak na dachu ma wiedzieć, gdzie kończy się jedna strefa i gdzie może bezpiecznie stanąć. W budynkach istniejących obowiązek działa od <b>1.01.2026</b> (§ 2 ust. 1 rozp. zmieniającego Dz.U. 2024 poz. 1716).</p>
<h3>Kiedy klasy nie ustala się wcale (§ 213 WT)</h3>
${tab(["Budynek", "Warunek"], [
    ["Dom jednorodzinny, zagrodowy, rekreacji indywidualnej", "do 3 kondygnacji nadziemnych"],
    ["Budynek turystyczny, wypoczynkowy, wolnostojący", "do 2 kondygnacji i do 1500 m³"],
    ["Budynek gospodarczy w zabudowie jednorodzinnej lub zagrodowej", "wolnostojący, do 2 kondygnacji"],
    ["Budynek usługowy lub handlowy, także z mieszkaniem", "wolnostojący, do 2 kondygnacji i do 1000 m³"],
    ["Garaż wolnostojący", "najwyżej 2 stanowiska"],
    ["Budynek inwentarski", "do 1500 m³"],
  ])}
<h3>Szczególne zasady (§ 212 ust. 5-9 WT)</h3>
<ul><li>Kondygnacje o różnych kategoriach (np. sklep na parterze, mieszkania wyżej) - klasę ustala się dla każdej kondygnacji osobno (ust. 6).</li><li>Część niżej położona nie może mieć niższej klasy niż część nad nią, a część podziemna nie niższej niż <b>C</b> (ust. 7).</li><li>Magazyn, warsztat czy pomieszczenie techniczne niepowiązane z częścią ZL ma być <b>osobną strefą</b>, z klasą ustaloną jak dla PM (ust. 8).</li><li>Pomieszczenia, które muszą działać w czasie pożaru (zbiorniki wody ppoż., pompownie, maszynownie wentylacji ppoż., rozdzielnie zasilające urządzenia ppoż.), są osobną strefą pożarową (ust. 9).</li></ul>
${przyklad("hala z kartonami za duża na jedną strefę", `<p>Hala parterowa 9000 m², magazyn kartonów, Q = 1500 MJ/m², bez zagrożenia wybuchem.</p>
<ol><li>Klasa: PM, 1 kondygnacja, Q 1000-2000 → <b>C</b> (§ 212 ust. 4 WT).</li><li>Dopuszczalna strefa: 1 kondygnacja, Q 1000-2000 → <b>8000 m²</b> (§ 228 WT).</li><li>9000 m² to więcej niż 8000 m². Opcja 1: ściana oddzielenia dzieląca halę na dwie strefy, np. 4500 + 4500 m².</li><li>Opcja 2: tryskacze dają +100%, więc strefa może mieć do 16 000 m² (§ 229 WT).</li><li>Przy podziale ścianą: strefy po 4500 m² (co najmniej 2000 m² każda) i Q ponad 1000, więc miejsce połączenia ściany oddzielenia z elewacją i dachem trzeba <b>oznakować</b> z zewnątrz (§ 4 ust. 2 pkt 6 rozp. 2010).</li></ol>`)}
${przyklad("kamienica w Myszkowie - sklep na parterze, mieszkania wyżej", `<p>Budynek 3 kondygnacje, 11 m (niski). Parter: sklep spożywczy 200 m² sali (200 : 4 = 50 osób, czyli ZL III). Piętra: mieszkania (ZL IV). Piwnica: magazyn sklepu.</p>
<ol><li>Kondygnacje mają różne kategorie, więc klasę ustala się dla każdej osobno (§ 212 ust. 6 WT).</li><li>Mieszkania ZL IV w budynku niskim: <b>D</b>. Sklep ZL III w budynku niskim: <b>C</b>.</li><li>Zasada z ust. 7: część niżej nie może mieć klasy niższej niż część nad nią. Parter C pod mieszkaniami D jest w porządku.</li><li>Piwnica pod budynkiem: nie niżej niż <b>C</b> (ust. 7).</li><li>Magazyn w piwnicy obsługuje sklep, więc jest z nim powiązany funkcjonalnie. Gdyby wynajmował go ktoś obcy, musiałby być osobną strefą (ust. 8).</li></ol>`)}
${wlasciciel(`<p>„Hala ma 9000 m² i składuje Pan kartony (Q ok. 1500). Dopuszczalna strefa to 8000 m². Trzeba albo ściany ogniowej, która podzieli halę na dwie strefy, albo tryskaczy - wtedy strefa może być dwa razy większa.”</p>`)}
${wlasciciel(`<p>„W ścianie między halą a magazynem ktoś wyciął przejście na wózek i nie ma tam drzwi przeciwpożarowych. Dla straży to znaczy, że Pana dwie strefy to w praktyce jedna, za duża. Albo drzwi przeciwpożarowe z samozamykaczem, albo zamurowanie otworu.”</p>`)}
${wlasciciel(`<p>„Drzwi przeciwpożarowe do magazynu są podparte klinem, żeby wózki jeździły swobodnie. W pożarze się nie zamkną i dym przejdzie na drugą stronę. To zakaz z § 4 ust. 1 pkt 15 rozporządzenia. Rozwiązanie: elektrotrzymacz, który zwolni drzwi, gdy zadziała czujka.”</p>`)}
${pulapki(["Klasa odporności pożarowej dotyczy <b>budynku</b> (A-E); klasa odporności ogniowej dotyczy <b>elementu</b> (np. REI 60).", "Dla PM decyduje Q i wysokość, dla ZL - kategoria i wysokość.", "Przy SUG + oddymianiu w PM powiększenie do 150%, w ZL do 200%.",
    "R - nośność, E - szczelność, I - izolacyjność. Drzwi nie mają R.",
    "Ściany i stropy oddzielenia - z materiałów <b>niepalnych</b>; otwory w ścianie najwyżej <b>15%</b>, w stropie <b>0,5%</b>.",
    "Przedsionek przeciwpożarowy - co najmniej <b>1,4 × 1,4 m</b>.",
    "Część podziemna budynku - klasa nie niższa niż <b>C</b>.",
    "Do powierzchni strefy <b>wlicza się antresolę</b>.",
    "Dom jednorodzinny do <b>3</b> kondygnacji - bez wymagań klasy odporności pożarowej.",
    "Blokowanie drzwi przeciwpożarowych (klin, sznurek) - zakazane (§ 4 ust. 1 pkt 15 rozp. 2010).",
  ])}`),
  },
  {
    id: "ewakuacja", skrot: "EWAC", tytul: "Zasady ewakuacji - kto, co, jak często i ciekawostki",
    html: () => nbsp(`
${ludzku(`<p>Ewakuacja to zorganizowane wyjście ludzi w bezpieczne miejsce, zanim zagrozi im dym albo ogień. Dobra ewakuacja nie zaczyna się w dniu pożaru, tylko na etapie projektu (wyjścia, drogi, oświetlenie) i ćwiczeń.</p>`)}
<h3>Kto za co odpowiada</h3>
${tab(["Kto", "Obowiązek", "Przepis"], [["właściciel, zarządca, użytkownik", "zapewnić bezpieczeństwo i możliwość ewakuacji, ustalić sposoby postępowania", "art. 4 ust. 1 pkt 4 i 7 ustawy o ochronie ppoż."], ["pracodawca", "wyznaczyć pracowników do zwalczania pożarów i ewakuacji", "art. 209¹ Kodeksu pracy"], ["kierujący działaniem ratowniczym (strażak)", "może zarządzić ewakuację ludzi i mienia", "art. 25 ust. 1 pkt 1 ustawy o ochronie ppoż."], ["każdy, kto zauważy pożar", "zaalarmować osoby w strefie i straż", "art. 9 ustawy o ochronie ppoż."]])}
<h3>Jak często ćwiczyć (§ 17 rozp. 2010)</h3>
${tab(["Obiekt", "Praktyczne sprawdzenie ewakuacji"], [["ponad 50 stałych użytkowników (np. biuro, zakład), nie dotyczy ZL IV", "co najmniej raz na 2 lata"], ["szkoły, przedszkola, internaty, akademiki (cyklicznie zmienia się grupa ponad 50 osób)", "co najmniej raz w roku, najpóźniej 3 miesiące od przyjścia nowych użytkowników"], ["ZL II (szpitale, domy opieki)", "zakres uzgadnia się z komendantem PSP"], ["escape roomy", "przed rozpoczęciem działalności i co najmniej raz na 2 lata, z rzeczoznawcą (§ 17a)"]])}
<p>Komendanta powiatowego PSP zawiadamia się najpóźniej <b>tydzień przed</b> ćwiczeniem (§ 17 ust. 4).</p>
<h3>Jak ewakuować</h3>
<ul><li>Kolejność: najpierw ludzie z miejsca najbardziej zagrożonego, potem z kondygnacji nad pożarem (dym idzie w górę), potem pozostali; osoby niesamodzielne - z wyznaczonymi opiekunami.</li><li>Nie korzystać ze zwykłych wind; drzwi za sobą zamykać (zatrzymują dym).</li><li>Iść znakami ewakuacyjnymi do miejsca zbiórki, sprawdzić listę obecności - informację o brakujących przekazać strażakom.</li><li>Nie wracać po rzeczy.</li></ul>
<h3>Ciekawostki, które warto znać</h3>
<ul><li><b>Ludzie wychodzą tą drogą, którą weszli</b> - nawet gdy obok jest bliższe wyjście ewakuacyjne. Dlatego ćwiczenia i dobre oznakowanie są tak ważne.</li><li><b>Czas przed ruszeniem</b> (ludzie kończą rozmowę, zbierają rzeczy, sprawdzają, „czy to na pewno pożar”) bywa dłuższy niż samo przejście do wyjścia. Komunikat głosowy skraca go bardziej niż syrena.</li><li><b>Koszalin, 2019</b> - w escape roomie zginęło pięć 15-latek, bo nie mogły wyjść z zamkniętego pomieszczenia. Po tej tragedii dopisano do przepisów § 17a o sprawdzaniu ewakuacji w escape roomach.</li><li><b>Kamień Pomorski, 2009</b> - pożar budynku socjalnego z drewnianą konstrukcją, zginęły 23 osoby; drogi ewakuacyjne były zbyt trudne do pokonania w dymie.</li><li><b>Klub „Kulawy Koń”, Perm (Rosja), 2009</b> - 156 ofiar; pirotechnika pod sufitem, jedno wąskie wyjście.</li><li><b>Klub „Kiss”, Brazylia, 2013</b> - 242 ofiary; zablokowane wyjście i brak oznakowania.</li><li><b>Grenfell Tower, Londyn, 2017</b> - 72 ofiary; palna elewacja i zasada „zostań w mieszkaniu”, która przy szybkim rozprzestrzenieniu ognia po elewacji zawiodła.</li><li><b>WTC, 2001</b> - firma Morgan Stanley regularnie ćwiczyła ewakuację z inicjatywy szefa ochrony Ricka Rescorli; z jej ok. 2700 pracowników w wieży zginęło kilkanaście osób.</li></ul>
${wyklad(`<p>Proszę Państwa, ewakuacja to rachunek dwóch zegarów. Pierwszy zegar mówi, <b>ile czasu mamy</b>, zanim warunki w budynku zabiją człowieka: dym zejdzie nisko, temperatura i trujące gazy przekroczą granicę. To jest dostępny czas bezpiecznej ewakuacji, w skrócie DCBE (po angielsku ASET). Drugi zegar mówi, <b>ile czasu potrzebujemy</b>, żeby wszyscy wyszli. To wymagany czas bezpiecznej ewakuacji, WCBE (RSET). Ewakuacja się udaje, gdy pierwszy zegar jest dłuższy od drugiego, z zapasem.</p>
<p>Czas potrzebny do wyjścia składa się z czterech kawałków: zanim czujka wykryje pożar, zanim ludzie usłyszą alarm, zanim <b>zdecydują się ruszyć</b> i wreszcie samo przejście do wyjścia. Najdłuższy bywa ten trzeci kawałek. Ludzie kończą maila, szukają kurtki, pytają kolegi, czy to na pewno nie test. Dlatego tak ważne są ćwiczenia i komunikat głosowy zamiast samej syreny. Komunikat „Uwaga, w budynku wykryto pożar, proszę opuścić budynek najbliższym wyjściem” skraca ten czas bardziej niż najgłośniejszy dzwonek.</p>
<p>Przepisy o przejściach, dojściach, szerokościach drzwi i liczbie wyjść wydłużają pierwszy zegar albo skracają drugi. Gdy rzeczoznawca proponuje rozwiązanie zamienne, w ekspertyzie pokazuje właśnie te dwa czasy policzone dla konkretnego budynku.</p>`)}
<h3>Praktyczne sprawdzenie ewakuacji - co dokładnie mówi przepis (§ 17 rozp. 2010)</h3>
${tab(["Ustęp", "Treść po ludzku"], [
    ["ust. 1", "obiekt dla ponad 50 osób, które są jego <b>stałymi użytkownikami</b> (nie ZL IV) - praktyczne sprawdzenie organizacji i warunków ewakuacji z całego obiektu co najmniej raz na 2 lata"],
    ["ust. 2", "obiekty, w których cyklicznie zmienia się grupa ponad 50 osób (szkoły, przedszkola, internaty, domy studenckie) - co najmniej raz w roku, najpóźniej 3 miesiące od przyjścia nowych użytkowników"],
    ["ust. 3", "obiekt ze strefą ZL II (szpital, dom opieki) oraz budynki dla osadzonych - zakres i obszar sprawdzenia uzgadnia się z komendantem powiatowym PSP"],
    ["ust. 4", "o terminie zawiadamia się komendanta powiatowego PSP najpóźniej tydzień wcześniej"],
  ])}
<p>Ust. 4 odsyła wprost tylko do ust. 1. Przy szkołach też warto komendanta zawiadomić. Nic to nie kosztuje, a dyrektor ma pisemny ślad, że ćwiczenie się odbyło.</p>
<p>Warunki ewakuacji i sposób ich praktycznego sprawdzania to jeden z obowiązkowych punktów instrukcji bezpieczeństwa pożarowego (§ 6 ust. 1 pkt 5 rozp. 2010). Wyniki ćwiczenia powinny więc trafić do IBP.</p>
<h3>Próbna ewakuacja krok po kroku (dobra praktyka)</h3>
<ol><li><b>Sprawdź, czy jest obowiązkowa</b> i jak często (tabela wyżej). Nawet gdy nie jest, ćwiczenie co 2 lata to dobra rada dla każdej firmy.</li><li><b>Wybierz termin</b> i zawiadom komendanta powiatowego PSP co najmniej tydzień wcześniej, pisemnie lub mailem.</li><li><b>Napisz scenariusz</b>: gdzie „wybucha pożar”, którą drogę uznajesz za odciętą dymem, kto ogłasza alarm i w jaki sposób, czy pracownicy wiedzą o dniu ćwiczenia.</li><li><b>Wyznacz obserwatorów</b> na klatkach, przy wyjściach i w miejscu zbiórki, każdy ze stoperem i kartką.</li><li><b>Ustal miejsce zbiórki</b> z dala od budynku i od drogi pożarowej. Jeden człowiek zbiera listę obecności.</li><li><b>Przeprowadź ćwiczenie</b> i zmierz czas: od alarmu do wyjścia ostatniej osoby.</li><li><b>Spisz protokół</b>: czas, liczba osób, co poszło źle (zamknięte drzwi, zastawiona droga, ludzie wracający po rzeczy, niesłyszalny alarm), wnioski i terminy poprawek.</li><li><b>Wnioski wpisz do IBP</b> i omów z pracownikami.</li></ol>
${przyklad("szkoła podstawowa w Zawierciu", `<p>420 uczniów, rok szkolny zaczyna się 1 września.</p>
<ol><li>Szkoła to obiekt, w którym cyklicznie zmienia się grupa ponad 50 osób - § 17 ust. 2 rozp. 2010.</li><li>Ćwiczenie najpóźniej <b>3 miesiące</b> od przyjścia nowych uczniów, czyli do końca listopada, i co najmniej raz w roku.</li><li>Pierwszoklasiści nie znają budynku, dlatego scenariusz zakłada odcięcie głównych schodów i ewakuację drugą klatką.</li><li>Typowe uwagi z protokołu: dzieci wracają po plecaki, nauczyciel nie ma listy klasy, drzwi zewnętrzne drugiej klatki zamknięte na klucz (to zakaz z § 4 ust. 1 pkt 14 rozp. 2010).</li></ol>`)}
${przyklad("kiedy obowiązek jest, a kiedy go nie ma", `${tab(["Obiekt", "Próbna ewakuacja", "Dlaczego"], [
    ["Biuro, 80 pracowników", "co najmniej co 2 lata", "ponad 50 stałych użytkowników (§ 17 ust. 1)"],
    ["Warsztat, 40 pracowników", "nieobowiązkowa", "do 50 stałych użytkowników - ale warto"],
    ["Szpital powiatowy (ZL II)", "tak, zakres uzgodniony z komendantem powiatowym", "§ 17 ust. 3 - zakres i obszar ćwiczenia ustala się z komendantem"],
    ["Blok mieszkalny, 200 mieszkańców", "nie", "ZL IV jest wyłączona z § 17 ust. 1"],
    ["Pensjonat, 30 miejsc, 6 pracowników", "raczej nie", "stałymi użytkownikami są pracownicy (6); czy goście się liczą, przepis nie rozstrzyga - pytanie do wykładowcy"],
    ["Przedszkole, 120 dzieci", "co roku, do 3 miesięcy od września", "§ 17 ust. 2"],
  ])}`)}
<h3>Osoby, które same nie wyjdą</h3>
<ul><li>W IBP i na liście przy wejściu: kto potrzebuje pomocy (osoba na wózku, niewidoma, kobieta w zaawansowanej ciąży, osoba po operacji) i kto jest jej <b>opiekunem</b> w czasie ewakuacji.</li><li>Drzwi z pomieszczeń dla ponad 6 osób o ograniczonej zdolności poruszania się otwierają się na zewnątrz (§ 239 ust. 2 pkt 4 WT).</li><li>W budynkach z obudowanymi klatkami osoba na wózku może czekać na strażaków w klatce lub przedsionku, a opiekun zgłasza to kierującemu akcją. To trzeba ustalić wcześniej i wpisać do IBP.</li></ul>
${wlasciciel(`<p>„Ma Pan 80 pracowników - próbna ewakuacja co najmniej raz na dwa lata, z powiadomieniem straży tydzień wcześniej. Zrobię scenariusz, wyznaczymy opiekunów pięter i zmierzymy czas. To też dowód przy kontroli, że obowiązek jest spełniony.”</p>`)}
${wlasciciel(`<p>„Pani Dyrektor, ćwiczenie musi się odbyć do końca listopada, bo pierwszaki są w szkole od września. Proponuję wtorek po drugiej lekcji. Zawiadomię straż, a nauczyciele dostaną kartkę: lista klasy, zamknąć okna, ostatni wychodzi nauczyciel i zamyka drzwi. Po ćwiczeniu dostanie Pani protokół do instrukcji.”</p>`)}
${wlasciciel(`<p>„Ewakuacja trwała 6 minut, ale 4 z nich to czekanie, aż ludzie ruszą od biurek. Sam przemarsz zajął 2 minuty. Najwięcej zyskamy nie na nowych drzwiach, tylko na tym, żeby wszyscy wiedzieli: alarm to alarm, wychodzimy od razu.”</p>`)}
${pulapki(["Próbna ewakuacja: ponad 50 <b>stałych</b> użytkowników - co 2 lata; szkoły - co rok.", "Powiadomienie PSP - tydzień przed.", "Pracodawca wyznacza osoby do ewakuacji (Kodeks pracy).", "Kierujący działaniem ratowniczym może zarządzić ewakuację, ale nie wysiedlenie.",
    "Szkoły, przedszkola, internaty: najpóźniej <b>3 miesiące</b> od przyjścia nowych użytkowników.",
    "ZL II: zakres ćwiczenia <b>uzgadnia się</b> z komendantem powiatowym PSP.",
    "Budynki mieszkalne (ZL IV) - <b>bez</b> obowiązku próbnej ewakuacji.",
    "Warunki ewakuacji i sposób ich sprawdzania - obowiązkowy punkt <b>IBP</b> (§ 6 ust. 1 pkt 5).",
    "Najdłuższy kawałek ewakuacji to często <b>czas przed ruszeniem</b>, nie samo przejście.",
  ])}`),
  },
  {
    id: "zl", skrot: "ZL", tytul: "Kategorie ZL I-V - różnice i trudne przypadki",
    html: () => nbsp(`
${ludzku(`<p>Kategoria ZL mówi, <b>kim są ludzie w budynku i jak szybko uciekną</b>. Kluczowe pytania: czy znają budynek (stali użytkownicy), czy jest ich dużo naraz (ponad 50 obcych osób w jednym pomieszczeniu), czy mogą iść sami i czy śpią w budynku.</p>`)}
${tab(["Kategoria", "Definicja (§ 209 ust. 2 WT)", "Przykłady"], [
    ["ZL I", "pomieszczenia dla ponad 50 osób naraz, które <b>nie są stałymi użytkownikami</b>, nie przede wszystkim dla osób o ograniczonej sprawności", "sklep, galeria, kino, teatr, restauracja na 100 miejsc, hala sportowa wynajmowana na imprezy, dworzec, kościół, sala weselna"],
    ["ZL II", "przede wszystkim dla osób <b>o ograniczonej zdolności poruszania się</b>", "szpital, żłobek, przedszkole, dom opieki, hospicjum"],
    ["ZL III", "użyteczności publicznej, <b>nie ZL I i nie ZL II</b>", "biuro, urząd, szkoła, przychodnia bez łóżek, mały sklep (do 50 klientów naraz), salon fryzjerski"],
    ["ZL IV", "<b>mieszkalne</b>", "blok, dom jednorodzinny, kamienica"],
    ["ZL V", "<b>zamieszkania zbiorowego</b>, nie ZL I i nie ZL II", "hotel, motel, pensjonat, internat, akademik, hostel, schronisko"],
  ])}
<h3>Jak rozstrzygać - pytania kontrolne</h3>
<ol><li>Czy budynek jest przede wszystkim dla osób, które same nie uciekną? → <b>ZL II</b>.</li><li>Czy jest pomieszczenie dla ponad 50 osób spoza stałych użytkowników? → <b>ZL I</b>.</li><li>Czy ludzie tam śpią, a nie mieszkają na stałe? → <b>ZL V</b>.</li><li>Czy to mieszkania? → <b>ZL IV</b>.</li><li>Inna użyteczność publiczna → <b>ZL III</b>.</li></ol>
<h3>Przypadki, na których łatwo się pomylić</h3>
${tab(["Sytuacja", "Kategoria", "Dlaczego"], [
    ["Sala gimnastyczna szkoły, tylko dla uczniów (100 osób)", "ZL III", "uczniowie są stałymi użytkownikami"],
    ["Ta sama sala wynajmowana na turnieje dla 70 widzów", "ZL I", "ponad 50 osób spoza stałych użytkowników"],
    ["Restauracja na 40 miejsc", "ZL III", "do 50 osób naraz"],
    ["Biurowiec z salą konferencyjną dla 80 gości", "strefa z salą - ZL I", "kategorię ma strefa; sala decyduje"],
    ["Przedszkole", "ZL II", "małe dzieci nie ewakuują się same"],
    ["Szkoła podstawowa", "ZL III", "dzieci chodzą same; nie jest „przede wszystkim” dla osób niesprawnych"],
    ["Przychodnia bez łóżek", "ZL III", "pacjenci przychodzą i wychodzą sami"],
    ["Dworzec kolejowy", "ZL I", "ponad 50 podróżnych naraz"],
    ["Hotel z restauracją dla 120 gości z zewnątrz", "ZL V i ZL I", "strefa może mieć dwie kategorie i spełnia wymagania obu (§ 209 ust. 5)"],
    ["Hala sklepu z magazynem obok, niepowiązanym z handlem", "ZL I + osobna strefa PM", "niepowiązany magazyn musi być odrębną strefą (§ 212 ust. 8)"],
  ])}
${wyklad(`<p>Proszę Państwa, kategoria ZL to <b>pierwsza rzecz, którą ustalacie w każdym budynku</b>. Wszystko inne wynika z niej: ile metrów korytarza wolno, czy klatka musi być obudowana, ile wyjść, jaka odporność ogniowa, czy trzeba instrukcji i próbnej ewakuacji. Pomylicie kategorię, a cała analiza jest do wyrzucenia.</p>
<p>Przepis patrzy na ludzi, nie na ściany. Zadaje cztery pytania. <b>Czy ludzie znają budynek?</b> Pracownik biura wie, gdzie jest druga klatka, a klient galerii nie wie. <b>Ilu ich jest naraz?</b> Granica to ponad 50 osób spoza stałych użytkowników w jednym pomieszczeniu. <b>Czy wyjdą sami?</b> Dziecko z przedszkola czy pacjent po operacji nie wyjdzie. <b>Czy śpią?</b> Człowiek obudzony w nocy w obcym hotelu reaguje wolniej niż ten sam człowiek w swoim mieszkaniu.</p>
<p>Stąd biorą się kategorie. Najostrzej traktowane są ZL II (ludzie nie wyjdą sami), ZL I (tłum obcych) i ZL V (śpiący w obcym miejscu), dlatego dla nich przy jednym kierunku ucieczki wolno tylko 10 m dojścia. ZL III, czyli biuro czy szkoła, ma 30 m, a ZL IV, czyli mieszkania, aż 60 m. Mieszkaniec zna swój blok najlepiej.</p>
<p>I jeszcze jedno: kategorię ma <b>strefa pożarowa</b>, nie cały budynek (§ 209 ust. 1 WT). W jednym budynku może być strefa ZL III z biurami i strefa PM z magazynem. Jedna strefa może też mieć dwie kategorie naraz i wtedy spełnia wymagania obu (§ 209 ust. 5 WT).</p>`)}
<h3>Co zmienia kategoria - porównanie</h3>
${tab(["Wymaganie", "ZL I", "ZL II", "ZL III", "ZL IV", "ZL V", "Przepis"], [
    ["Dojście, 1 kierunek", "10 m", "10 m", "30 m (20 m poziomo)", "60 m (20 m poziomo)", "10 m", "§ 256 ust. 3 WT"],
    ["Dojście, 2 kierunki", "40 m", "40 m", "60 m", "100 m", "40 m", "§ 256 ust. 3 WT"],
    ["Przejście w pomieszczeniu", "40 m", "40 m", "40 m", "40 m", "40 m", "§ 237 ust. 1 WT"],
    ["Drugie wyjście z pomieszczenia", "ponad 50 osób lub 300 m²", "ponad <b>30</b> osób lub 300 m²", "ponad 50 osób lub 300 m²", "ponad 50 osób lub 300 m²", "ponad 50 osób lub 300 m²", "§ 238 WT"],
    ["Klatka obudowana, drzwi dymoszczelne, przeciw zadymieniu - budynek niski", "nie wymaga", "<b>tak</b>", "nie wymaga", "nie wymaga", "nie wymaga", "§ 245 WT"],
    ["To samo - budynek średniowysoki", "tak", "tak", "tak", "nie wymaga", "tak", "§ 245 WT"],
    ["Instrukcja bezpieczeństwa pożarowego", "tak*", "tak*", "tak*", "<b>nie</b>", "tak*", "§ 6 rozp. 2010"],
    ["Próbna ewakuacja", "tak**", "tak** (zakres z PSP)", "tak**", "<b>nie</b>", "tak**", "§ 17 rozp. 2010"],
  ])}
<p>* gdy budynek lub strefa ma ponad 1000 m³ kubatury brutto albo jest w niej strefa zagrożenia wybuchem. ** gdy obiekt ma ponad 50 stałych użytkowników, a w szkołach, przedszkolach i internatach co roku.</p>
<p>W budynku średniowysokim i wyższym w ZL V drzwi z pokoi (oprócz łazienek i WC) na korytarz muszą mieć odporność ogniową co najmniej EI 30 (§ 246 ust. 6 WT).</p>
${przyklad("sklep - ZL I czy ZL III?", `<p>Ta sama ulica w Myszkowie, dwa sklepy. Nikt nie wie, ilu klientów wejdzie, więc liczysz ze wskaźnika dla handlu: <b>4 m² na osobę</b> (§ 236 ust. 6 pkt 2 WT).</p>
<ol><li>Sklep A: sala sprzedaży 180 m² → 180 : 4 = <b>45 osób</b>. To nie jest ponad 50, więc <b>ZL III</b>.</li><li>Sklep B: sala sprzedaży 240 m² → 240 : 4 = <b>60 osób</b>. Ponad 50 osób spoza stałych użytkowników, więc <b>ZL I</b>.</li><li>Skutki dla sklepu B: dojście przy jednym kierunku 10 m zamiast 30 m, drugie wyjście z sali (ponad 50 osób), drzwi otwierane na zewnątrz.</li></ol>
<p>Liczy się powierzchnia <b>sali sprzedaży</b>, a nie zaplecza. Zaplecze to inne pomieszczenie, a o ZL I decyduje pomieszczenie dla ponad 50 osób.</p>`)}
${przyklad("remiza OSP z salą", `<p>Remiza w gminie Włodowice: garaż na dwa wozy i sala 150 m² wynajmowana na wesela i zebrania.</p>
<ol><li>Sala: 1 m² na osobę (sala, lokal rozrywkowy) → 150 osób. Goście nie są stałymi użytkownikami → <b>ZL I</b>.</li><li>Garaż na wozy to wymagania PM (§ 209 ust. 3 WT: garaże jak PM).</li><li>Jeśli garaż i sala są w jednej strefie pożarowej, strefa ma spełnić wymagania obu funkcji. Zwykle rozsądniej jest je oddzielić, ale to już projekt i ekspertyza, nie Twoja decyzja na obchodzie.</li><li>Na obchodzie sprawdzasz: dwa wyjścia z sali, drzwi na zewnątrz, czy w dniu wesela nikt nie zamyka bocznych drzwi na klucz, oznakowanie, oświetlenie awaryjne, gaśnice.</li></ol>`)}
${przyklad("budynek z kilkoma funkcjami", `${tab(["Część budynku", "Kategoria", "Uwagi"], [
    ["Parter: apteka 80 m² sali", "ZL III", "80 : 4 = 20 osób"],
    ["Parter: przychodnia bez łóżek", "ZL III", "pacjenci chodzą sami"],
    ["Piętro: gabinet rehabilitacji z salą ćwiczeń dla osób po udarach", "rozważ ZL II", "„przede wszystkim” dla osób o ograniczonej zdolności poruszania się - decyduje, dla kogo jest pomieszczenie"],
    ["Poddasze: dwa mieszkania", "ZL IV", "mieszkalne"],
    ["Piwnica: kotłownia gazowa", "PM", "§ 209 ust. 3 WT - kotłownie jak PM"],
  ])}`)}
<h3>Trudne przypadki - więcej przykładów</h3>
${tab(["Sytuacja", "Kategoria", "Dlaczego"], [
    ["Kościół na 300 osób", "ZL I", "wierni nie są stałymi użytkownikami budynku"],
    ["Sala zabaw dla dzieci z rodzicami, 150 m²", "ZL I", "ponad 50 osób z zewnątrz; dzieci są z rodzicami, więc to nie budynek „przede wszystkim” dla osób niesamodzielnych"],
    ["Żłobek", "ZL II", "wymieniony w § 209 ust. 2 pkt 2 WT"],
    ["Dom pomocy społecznej", "ZL II", "„domy dla osób starszych” w § 209 ust. 2 pkt 2 WT"],
    ["Hotel pracowniczy", "ZL V", "zamieszkanie zbiorowe"],
    ["Biurowiec bez sal dla gości", "ZL III", "pracownicy są stałymi użytkownikami"],
    ["Szkoła z aulą na 200 miejsc używaną tylko przez uczniów", "ZL III", "uczniowie są stałymi użytkownikami; gdy aula służy imprezom dla gości z zewnątrz - ZL I"],
    ["Hala sportowa z trybuną na 300 widzów", "ZL I", "widzowie nie są stałymi użytkownikami"],
    ["Garaż podziemny pod blokiem", "PM", "§ 209 ust. 3 WT"],
  ])}
${wlasciciel(`<p>„Sala jest dla Pana uczniów - to ZL III. Ale jeśli zacznie Pan wynajmować ją na koncerty dla ponad 50 osób z zewnątrz, zmienia się sposób użytkowania na ZL I. To zmienia wymagania: wyjścia, oświetlenie, drogę pożarową, uzgodnienie z rzeczoznawcą.”</p>`)}
${wlasciciel(`<p>„Chce Pan powiększyć salę sprzedaży z 180 do 240 metrów, burząc ścianę zaplecza. Według przepisu to już ponad 50 klientów naraz, czyli inna kategoria budynku. Zanim przyjdzie ekipa, trzeba sprawdzić drogi ewakuacyjne i drzwi. Taniej to zrobić na papierze teraz niż przerabiać po kontroli.”</p>`)}
${wlasciciel(`<p>„Wesele na 150 osób to dla przepisów zupełnie inny budynek niż zebranie zarządu OSP na 20 osób. W dniu imprezy boczne drzwi muszą być otwarte od środka bez klucza, a gaśnice na miejscu. Proszę to wpisać do regulaminu wynajmu sali.”</p>`)}
${pulapki(["„Ponad 50 osób” - 50 to jeszcze nie ZL I.", "Liczą się osoby <b>niebędące stałymi użytkownikami</b>.", "Kategorię ma <b>strefa pożarowa</b>, a o ZL I decyduje pomieszczenie w niej.", "Przedszkole - ZL II; szkoła - ZL III.",
    "Szpitale, żłobki, przedszkola, domy dla osób starszych - przykłady ZL II wymienione wprost w § 209 ust. 2 pkt 2 WT.",
    "Garaże, kotłownie, hydrofornie, węzły ciepłownicze, rozdzielnie, stacje transformatorowe - wymagania <b>PM</b> (§ 209 ust. 3 WT).",
    "Strefa z dwiema kategoriami spełnia wymagania <b>każdej</b> z nich (§ 209 ust. 5 WT).",
    "ZL II - drugie wyjście już przy ponad <b>30</b> osobach, nie 50.",
    "Liczbę osób w handlu liczysz <b>4 m²/os.</b>, w biurze <b>5</b>, w gastronomii i salach <b>1</b>, w magazynie <b>30</b>.",
  ])}`),
  },
  {
    id: "materialy", skrot: "MAT", tytul: "Materiały niepalne, niezapalne, trudno zapalne, łatwo zapalne",
    html: () => nbsp(`
${ludzku(`<p>Przepisy używają starych, polskich słów (niepalny, trudno zapalny…), a producenci podają klasy europejskie (A1, B-s1,d0…). Załącznik nr 3 do warunków technicznych łączy jedno z drugim. Litera mówi, jak materiał się pali; „s” - ile dymi (s1 mało, s3 dużo); „d” - czy kapie płonącymi kroplami (d0 nie, d2 tak).</p>`)}
${tab(["Określenie w przepisach", "Klasy europejskie (PN-EN 13501-1)", "Jak się zachowuje", "Przykłady (typowo - sprawdź deklarację)"], [
    ["niepalny", "A1; A2-s1,d0; A2-s2,d0; A2-s3,d0", "nie pali się", "beton, cegła, stal, szkło, wełna mineralna (A1), płyta gipsowo-kartonowa (A2-s1,d0)"],
    ["niezapalny", "A2 z d1 lub d2; wszystkie klasy B", "prawie się nie pali", "płyty warstwowe z rdzeniem PIR (często B-s2,d0), drewno z dobrą impregnacją ogniochronną"],
    ["trudno zapalny", "wszystkie klasy C; D-s1 (d0, d1, d2)", "pali się tylko, gdy działa płomień; po zabraniu płomienia gaśnie", "niektóre płyty drewnopochodne ognioodporne, część wykładzin"],
    ["łatwo zapalny", "D-s2 i D-s3; E; F", "pali się dalej sam", "drewno lite i OSB (zwykle D-s2,d0), styropian (E), papa (E), zwykłe tworzywa"],
  ])}
<p>Dodatkowe określenia: <b>niekapiący</b> - klasy z d0; <b>samogasnący</b> - co najmniej E; <b>intensywnie dymiący</b> - klasy z s3 oraz E-d2, E, F. Dla posadzek są osobne klasy z dopiskiem „fl” (np. Bfl-s1 - trudno zapalna wykładzina).</p>
<h3>Rozprzestrzenianie ognia przez elementy budynku</h3>
${tab(["Element", "Z czego", "Skrót"], [["nierozprzestrzeniający ognia", "A1, A2 z d0, B z d0 (izolacja w środku co najmniej E)", "NRO"], ["słabo rozprzestrzeniający ogień", "C z d0, D-s1,d0", "SRO"], ["łatwo rozprzestrzeniający ogień", "reszta", "ŁRO"]])}
<h3>Gdzie to ma znaczenie</h3>
<ul><li>Na drogach ewakuacyjnych nie wolno stosować materiałów łatwo zapalnych; wykładziny na drogach ewakuacyjnych - co najmniej trudno zapalne.</li><li>Elementy budynku z klasą odporności (A-D) muszą być nierozprzestrzeniające ognia (§ 216 ust. 2 WT).</li><li>Ocieplenie powyżej 25 m - tylko niepalne (§ 216 ust. 8 WT).</li></ul>
${galeria(["welna-mineralna", "plyta-warstwowa"])}
${wyklad(`<p>Proszę Państwa, na obchodzie nie podpalicie ściany zapalniczką, żeby sprawdzić, jak się pali. Klasę materiału znacie tylko z <b>papieru</b>: z deklaracji właściwości użytkowych, którą producent wystawia do wyrobu z oznakowaniem CE, albo z krajowej deklaracji. Jest tam zapis typu „reakcja na ogień: B-s1,d0”. Tę klasę tłumaczycie na język przepisów tabelą z załącznika nr 3 do WT (§ 208a WT).</p>
<p>Jak czytać taki zapis. Pierwsza litera to klasa główna: A1 nie pali się wcale, F nie jest w ogóle zbadana. „s” to dym: s1 mało, s3 dużo. „d” to płonące krople: d0 brak, d2 dużo. Krople są groźne, bo spadają na ludzi uciekających pod spodem i zapalają rzeczy niżej. Dopisek „fl” oznacza podłogę (z angielskiego floor), a „L” izolację rur.</p>
<p>Druga sprawa: przepis rozróżnia <b>materiał</b> i <b>element budynku</b>. Materiał ma klasę reakcji na ogień (niepalny, trudno zapalny…). Element - ściana, dach, strop złożony z kilku materiałów - ocenia się inaczej: czy rozprzestrzenia ogień (NRO, SRO, ŁRO). Ściana z płyt warstwowych może mieć blachę z obu stron, ale w środku piankę. O tym, jak się zachowa w pożarze, decyduje rdzeń i sposób połączeń, a to widać dopiero w badaniu całego elementu.</p>`)}
<h3>Gdzie przepis zakazuje materiałów łatwo zapalnych</h3>
${tab(["Zasada", "Przepis"], [
    ["W strefach ZL I, II, III i V zakazane do wykończenia wnętrz są materiały łatwo zapalne, których produkty rozkładu są bardzo toksyczne lub intensywnie dymią", "§ 258 ust. 1 WT"],
    ["Zasłony, kotary, draperie, kurtyny, żaluzje - za łatwo zapalne uważa się te, które nie przechodzą badania zapalności według Polskiej Normy (m.in. czas zapalenia co najmniej 4 s, czas palenia do 30 s, bez płonących kropli)", "§ 258 ust. 1a WT"],
    ["Na drogach komunikacji ogólnej służących ewakuacji - zakaz materiałów i wyrobów łatwo zapalnych", "§ 258 ust. 2 WT"],
    ["Dach o powierzchni ponad 1000 m² - nierozprzestrzeniający ognia; palna izolacja oddzielona od wnętrza przegrodą co najmniej RE 15", "§ 219 ust. 1 WT"],
    ["Ściana oddzielenia przy dachu rozprzestrzeniającym ogień - wyprowadzona co najmniej 0,3 m ponad pokrycie albo pas niepalny 1 m szerokości EI 60 pod pokryciem", "§ 235 WT"],
    ["Ocieplenie ścian zewnętrznych budynku ponad 25 m - tylko niepalne", "§ 216 ust. 8 WT"],
    ["Gazowy ogrzewacz pomieszczeń z osłoną ponad 60 °C - co najmniej 0,3 m od otynkowanej ściany łatwo zapalnej i 0,6 m od nieotynkowanej", "§ 173 WT"],
  ])}
${przyklad("sala weselna w Mirowie - dekoracje", `<p>Sala ZL I na 150 osób. Organizator wiesza na suficie tiule i kotary, a przy wyjściu stawia ściankę z gałązek i słomy.</p>
<ol><li>Kotary i tiule to materiały luźno zwisające. Muszą przejść badanie zapalności (§ 258 ust. 1a WT). Właściciel powinien mieć atest albo deklarację, że tkanina jest trudno zapalna.</li><li>Słoma i suche gałązki przy wyjściu to materiał łatwo zapalny na drodze ewakuacyjnej - <b>zakazane</b> (§ 258 ust. 2 WT) i dodatkowo zwęża wyjście (§ 4 ust. 1 pkt 11 rozp. 2010).</li><li>Rozwiązanie: dekoracje tylko z atestem, nic palnego przy wyjściach i nad nimi, świeczki tylko w zamkniętych osłonach. Najlepiej wpisać to do regulaminu wynajmu sali.</li></ol>`)}
${przyklad("hala z płyt warstwowych", `<p>Hala magazynowa 2400 m² z płyt warstwowych. W dokumentach: płyty z rdzeniem PIR, klasa reakcji na ogień B-s2,d0.</p>
<ol><li>B-s2,d0 to według załącznika nr 3 WT materiał <b>niezapalny</b> (klasy B).</li><li>Dach ma ponad 1000 m², więc przekrycie musi być <b>nierozprzestrzeniające ognia</b> (§ 219 ust. 1 WT). Tego nie da się wyczytać z samej klasy materiału - potrzebne jest badanie całego dachu (klasa B<sub>ROOF</sub>(t1)) w dokumentacji.</li><li>Jeśli hala jest podzielona ścianą oddzielenia, a dach rozprzestrzenia ogień, ściana musi wystawać co najmniej 0,3 m ponad dach albo pod pokryciem musi być niepalny pas szerokości 1 m (§ 235 WT).</li></ol>`)}
${przyklad("korytarz w pensjonacie", `${tab(["Co jest na korytarzu ewakuacyjnym", "Klasa z deklaracji", "Ocena"], [
    ["wykładzina dywanowa", "Cfl-s1", "trudno zapalna - <b>dopuszczalna</b>"],
    ["tania wykładzina z tworzywa", "Efl", "łatwo zapalna - <b>zakazana</b> na drodze ewakuacyjnej"],
    ["boazeria z desek sosnowych bez impregnacji", "D-s2,d0", "łatwo zapalna - <b>zakazana</b> na drodze ewakuacyjnej"],
    ["płyta gipsowo-kartonowa", "A2-s1,d0", "niepalna - dopuszczalna"],
    ["boazeria z impregnatem ogniochronnym, z atestem", "B-s1,d0", "niezapalna - dopuszczalna, gdy jest dokument"],
  ])}`)}
${wlasciciel(`<p>„Wykładzina na korytarzu ewakuacyjnym ma deklarację Dfl - łatwo zapalna. Trzeba wymienić na co najmniej Cfl-s1. Proszę zawsze żądać od wykonawcy deklaracji właściwości użytkowych - tam jest klasa.”</p>`)}
${wlasciciel(`<p>„Ta drewniana boazeria na korytarzu wygląda pięknie, ale bez impregnatu to materiał łatwo zapalny na drodze ucieczki. Nie musi Pan jej zrywać: można ją zaimpregnować środkiem ogniochronnym. Ważne, żeby firma dała dokument z klasą po impregnacji, bo tylko on się liczy przy kontroli.”</p>`)}
${wlasciciel(`<p>„Na suficie sali chce Pani powiesić tkaninę. Proszę kupić taką, która ma atest trudnej zapalności. Zwykły tiul pali się jak papier, a spada płonącymi kawałkami prosto na gości.”</p>`)}
${pulapki(["Materiał trudno zapalny gaśnie po usunięciu źródła ognia.", "Euroklasy: A1, A2, B, C, D, E, F + s (dym) i d (krople).", "Niepalny = A1 i A2-s?,d0. Drewno lite to zwykle łatwo zapalne (D).", "NRO / SRO / ŁRO dotyczą elementów, a nie samych materiałów.",
    "Na drogach ewakuacyjnych - <b>zakaz materiałów łatwo zapalnych</b> (§ 258 ust. 2 WT).",
    "„fl” = posadzki (floor); klasy posadzek mają tylko „s”, bez „d”.",
    "Dach ponad <b>1000 m²</b> - nierozprzestrzeniający ognia.",
    "Ściana oddzielenia nad dachem palnym - co najmniej <b>0,3 m</b> ponad pokrycie.",
    "Klasę materiału znasz z <b>deklaracji właściwości użytkowych</b>, nie z wyglądu.",
  ])}`),
  },
  {
    id: "skroty-hydranty", skrot: "DN", tytul: "DN 100 i inne skróty przy hydrantach",
    html: () => nbsp(`
${ludzku(`<p><b>DN</b> to <b>średnica nominalna</b> (z angielskiego „diameter nominal”) - umowny rozmiar rury, zaworu albo hydrantu w milimetrach, w przybliżeniu jego średnica wewnętrzna. <b>DN 100</b> oznacza hydrant na rurze o rozmiarze ok. 100 mm. Im większe DN, tym więcej wody.</p>`)}
${tab(["Skrót", "Pełna nazwa", "Co oznacza w praktyce"], [
    ["DN 80, DN 100, DN 150", "średnica nominalna 80, 100, 150 mm", "rozmiar hydrantu lub rury; hydrant DN 80 daje min. 10 litrów wody na sekundę, nadziemny DN 100 - min. 15 litrów na sekundę przy ciśnieniu 0,2 MPa (§ 10 ust. 8 rozp. 2009)"],
    ["dm³/s", "decymetr sześcienny na sekundę", "to samo co litr na sekundę: 10 dm³/s = 10 litrów co sekundę = 600 litrów na minutę"],
    ["MPa", "megapaskal", "ciśnienie wody; 0,2 MPa = 2 bary (jak w oponie roweru); 1 MPa = 10 barów"],
    ["hydrant 25, 33, 52 (HP 25 itd.)", "hydrant wewnętrzny z wężem 25, 33 lub 52 mm", "25 i 33 - wąż półsztywny (zawsze okrągły, da się gasić bez rozwijania całego), 52 - wąż płasko składany (trzeba rozwinąć cały)"],
    ["zawór 52", "zawór hydrantowy z nasadą 52 mm, bez węża", "w budynkach wysokich - strażacy podłączają do niego swój wąż"],
    ["nasada 25 / 52 / 75 / 110", "łącznik węża strażackiego o danym rozmiarze", "52 - linie gaśnicze z prądownicą, 75 - linie główne, 110 - węże ssawne do pobierania wody ze zbiornika"],
    ["tabliczka „H”", "oznakowanie hydrantu", "na tabliczce: litera H, średnica DN i odległości w metrach do hydrantu (zwłaszcza podziemnego, ukrytego pod pokrywą w jezdni)"],
    ["hydrant nadziemny / podziemny", "-", "nadziemny - słupek nad ziemią (zasada); podziemny - pod pokrywą w ziemi, gdy słupek przeszkadza; strażak wkręca do niego stojak hydrantowy"],
  ])}
<h3>Przykład opisu w dokumencie</h3>
<p>Zamiast „H1 DN100” napisz: <i>„Hydrant H1 - zewnętrzny nadziemny o średnicy nominalnej 100 mm (DN 100), na miejskiej sieci wodociągowej, 40 m od budynku, wydajność co najmniej 15 litrów na sekundę przy ciśnieniu 0,2 MPa.”</i></p>
${galeria(["tabliczka-hydrantu", "hydrant-nadziemny2"])}
${wyklad(`<p>Proszę Państwa, skróty przy hydrantach to język, w którym rozmawiają projektant, wodociągi i straż. Wy musicie ten język przetłumaczyć właścicielowi na „ile wody i skąd”. Dwie liczby są najważniejsze: <b>wydajność</b> w litrach na sekundę i <b>ciśnienie</b> w megapaskalach.</p>
<p>Litr na sekundę brzmi niewinnie, ale policzmy. Hydrant DN 80 daje co najmniej 10 litrów na sekundę, czyli 600 litrów na minutę. Wóz z kilkoma tysiącami litrów w zbiorniku opróżnia się przy takim poborze w kilka minut. Dlatego sieć wodociągowa jest dla straży tak ważna.</p>
<p>Ciśnienie: 0,2 MPa to 2 bary. Tyle ma zapewnić hydrant zewnętrzny przy poborze wody (§ 10 ust. 8 rozp. 2009) i tyle co najmniej musi być na zaworze hydrantu wewnętrznego (§ 22 ust. 2 rozp. 2010). Za małe ciśnienie to woda, która z prądownicy „sika” na metr zamiast na 10.</p>`)}
${przyklad("ile wody daje hydrant w czasie akcji", `<ol><li>Hydrant DN 80: co najmniej <b>10 l/s</b>.</li><li>Na minutę: 10 × 60 = <b>600 litrów</b>.</li><li>Na godzinę: 600 × 60 = <b>36 000 litrów = 36 m³</b>.</li><li>Na 2 godziny gaszenia: <b>72 m³</b>. Dla porównania: przepis pozwala zastąpić jeden hydrant 10 l/s zbiornikiem <b>100 m³</b> (patrz temat o hydrantach).</li><li>Hydrant DN 100 nadziemny: 15 l/s, czyli 900 l/min.</li></ol>`)}
${przyklad("jak czytać zapis w projekcie", `${tab(["Zapis", "Po polsku"], [
    ["H1 DN80 nadz.", "hydrant zewnętrzny nr 1, nadziemny, średnica nominalna 80 mm"],
    ["Hp DN80", "hydrant podziemny 80 mm - pod pokrywą w ziemi; szukaj tabliczki"],
    ["HW 25, 30 m", "hydrant wewnętrzny 25 z wężem półsztywnym 30 m"],
    ["HW 52, 20 m", "hydrant wewnętrzny 52 z wężem płasko składanym 20 m"],
    ["Z52", "zawór hydrantowy 52 bez węża, dla straży (budynki wysokie)"],
    ["Q = 20 dm³/s", "wymagana ilość wody do gaszenia: 20 litrów na sekundę"],
    ["p = 0,2 MPa", "ciśnienie 2 bary"],
  ])}<p>Oznaczenia typu „HW”, „Hp”, „Z52” to skróty spotykane w projektach, a nie nazwy z przepisów. W dokumentach dla klienta pisz pełnymi słowami.</p>`)}
${wlasciciel(`<p>„Hydrant przed firmą to DN 80 - daje 10 litrów na sekundę. Dla Pana budynku potrzeba 20, więc wystarczą dwa takie hydranty w zasięgu 150 m albo jeden duży plus zbiornik.”</p>`)}
${wlasciciel(`<p>„Hydrant podziemny jest pod pokrywą w trawniku, a tabliczka na płocie wyblakła. Straż w nocy będzie go szukać kilka minut. Proszę zgłosić to do wodociągów albo gminy - wymiana tabliczki to drobiazg, a tych minut nikt potem nie odzyska.”</p>`)}
${pulapki(["DN 100 - 15 dm³/s, DN 80 - 10 dm³/s.", "Hydranty wewnętrzne: 25 - 1 l/s, 33 - 1,5 l/s, 52 - 2,5 l/s.", "Wąż półsztywny - hydranty 25 i 33; płasko składany - hydrant 52.",
    "1 dm³ = 1 litr; 10 dm³/s = <b>600 l/min</b>.",
    "0,2 MPa = <b>2 bary</b>.",
    "Hydrant nadziemny to zasada; podziemny tylko, gdy nadziemny jest szczególnie utrudniony.",
    "DN to <b>średnica nominalna</b>, a nie dokładna średnica wewnętrzna.",
  ])}`),
  },
  {
    id: "obciazenie", skrot: "Qd", tytul: "Obciążenie ogniowe - jak liczyć, z przykładami",
    html: () => nbsp(`
${ludzku(`<p>Gęstość obciążenia ogniowego mówi, <b>ile energii wydzieli się, jeśli spali się wszystko, co leży na każdym metrze kwadratowym podłogi</b>. To jak „kaloryczność” pomieszczenia. Dużo kartonów, palet i tworzyw - wysoka liczba; puste hale z metalem - niska.</p>`)}
<h3>Wzór (PN-B-02852)</h3>
<p class="pz-wzor">Q<sub>d</sub> = (masa₁ × ciepło spalania₁ + masa₂ × ciepło spalania₂ + …) ÷ powierzchnia</p>
<p>Masa w kg, ciepło spalania w MJ/kg, powierzchnia w m², wynik w MJ/m².</p>
${tab(["Materiał", "Ciepło spalania (orientacyjnie)"], [["drewno, palety", "18 MJ/kg"], ["papier, karton", "16 MJ/kg"], ["tworzywa sztuczne (średnio)", "42 MJ/kg"], ["guma, opony", "37 MJ/kg"], ["olej napędowy, opałowy", "43 MJ/kg"], ["tekstylia bawełniane", "17 MJ/kg"]])}
<h3>Przykład 1 - pokój biurowy 20 m²</h3>
${tab(["Co", "Masa", "× ciepło", "= energia"], [["meble drewniane", "120 kg", "18", "2160 MJ"], ["papiery w szafach", "300 kg", "16", "4800 MJ"], ["krzesła, komputery (tworzywa)", "35 kg", "42", "1470 MJ"], ["<b>razem</b>", "", "", "<b>8430 MJ</b>"]])}
<p>Q = 8430 ÷ 20 = <b>ok. 420 MJ/m²</b> → przedział do 500.</p>
<h3>Przykład 2 - magazyn kartonów 500 m²</h3>
${tab(["Co", "Masa", "× ciepło", "= energia"], [["kartony z towarem papierowym", "40 000 kg", "16", "640 000 MJ"], ["palety drewniane (200 × 20 kg)", "4000 kg", "18", "72 000 MJ"], ["folia stretch", "500 kg", "44", "22 000 MJ"], ["<b>razem</b>", "", "", "<b>734 000 MJ</b>"]])}
<p>Q = 734 000 ÷ 500 = <b>ok. 1470 MJ/m²</b> → przedział 1000-2000: klasa C, strefa w budynku parterowym do 8000 m², gaśnice co 100 m², hydranty 52.</p>
<h3>Przykład 3 - skład opon 1000 m²</h3>
<p>50 000 kg opon × 37 = 1 850 000 MJ; palety 2000 kg × 18 = 36 000 MJ; razem 1 886 000 MJ ÷ 1000 m² = <b>ok. 1890 MJ/m²</b>.</p>
<h3>Sztuczka do zapamiętania</h3>
<p><b>500 MJ/m² ≈ 28 kg drewna albo 31 kg papieru na każdym metrze kwadratowym.</b> Jeśli w magazynie leży więcej niż ok. 30 kg kartonów na m², prawie na pewno przekraczasz 500 - a to granica, od której rosną wymagania (klasa, hydranty 52, gaśnice co 100 m², droga pożarowa).</p>
<h3>Po co to liczyć</h3>
${tab(["Od Q zależy", "Przepis"], [["klasa odporności pożarowej PM", "§ 212 ust. 4 WT"], ["dopuszczalna wielkość strefy", "§ 228 ust. 1 WT"], ["długość przejścia i dojścia", "§ 237 ust. 1, § 256 ust. 3 WT"], ["odległość od innych budynków", "§ 271 ust. 1 WT"], ["hydranty 52 (Q ponad 500)", "§ 19 ust. 3 rozp. 2010"], ["gaśnice co 100 m² (Q ponad 500)", "§ 32 ust. 3 rozp. 2010"], ["woda do gaszenia", "§ 6 ust. 3 rozp. 2009"], ["droga pożarowa (Q ponad 500 i strefa ponad 1000 m²)", "§ 12 ust. 1 pkt 3 rozp. 2009"]])}
${wyklad(`<p>Proszę Państwa, wyobraźcie sobie, że zbieracie z hali wszystko, co może się spalić: kartony, palety, folię, opony, olej. Ważycie to i mnożycie przez to, ile energii daje kilogram każdej rzeczy. Wychodzi ogromna liczba megadżuli: to <b>obciążenie ogniowe</b>, czyli cała energia, jaka wydzieli się w pożarze. Teraz dzielicie ją przez powierzchnię podłogi i macie <b>gęstość obciążenia ogniowego</b>, czyli ile energii przypada na metr kwadratowy. W przepisach wszędzie chodzi o gęstość, w MJ/m².</p>
<p>Po co to dzielić? Bo dwie hale z taką samą ilością kartonów są różnie groźne. W hali 500 m² kartony stoją ciasno i pożar szybko obejmie wszystko. W hali 5000 m² ta sama ilość jest rozproszona i pożar rozwija się wolniej. Gęstość mówi, jak „gęsto naładowana” jest podłoga.</p>
<p>Ważne: gęstość obciążenia ogniowego liczy się dla stref <b>PM i IN</b>. Dla ZL przepisy patrzą na ludzi, nie na paliwo. Liczy się ją według Polskiej Normy PN-B-02852, powołanej w warunkach technicznych. Na co dzień wystarczą Wam trzy rzeczy: masa, ciepło spalania z tabeli i powierzchnia.</p>`)}
<h3>Co zmienia przekroczenie progów - jedna tabela</h3>
${tab(["Próg Q", "Co się zmienia", "Przepis"], [
    ["ponad 500 MJ/m²", "przejście w budynku wielokondygnacyjnym 75 m zamiast 100 m", "§ 237 ust. 1 WT"],
    ["ponad 500 MJ/m²", "dojście 30/60 m zamiast 60/100 m", "§ 256 ust. 3 WT"],
    ["ponad 500 MJ/m²", "drugie wyjście z pomieszczenia już od 300 m², nie od 1000 m²", "§ 238 WT"],
    ["ponad 500 MJ/m² i strefa ponad 200 m²", "hydrant 52 (albo 33, gdy Q do 1000)", "§ 19 ust. 3-4 rozp. 2010"],
    ["ponad 500 MJ/m² i strefa ponad 3000 m²", "jednoczesny pobór wody z 4 sąsiednich hydrantów", "§ 23 pkt 3 rozp. 2010"],
    ["ponad 500 MJ/m²", "gaśnice: 2 kg środka na każde 100 m² zamiast 300 m²", "§ 32 ust. 3 rozp. 2010"],
    ["ponad 500 MJ/m²", "klatki obudowane z drzwiami dymoszczelnymi w budynkach N i SW", "§ 245 pkt 3 WT"],
    ["ponad 1000 MJ/m²", "odległość od innych budynków 15 m zamiast 8 m", "§ 271 WT"],
    ["ponad 1000 MJ/m²", "obowiązek oznakowania ściany oddzielenia na zewnątrz (gdy strefy co najmniej 2000 m²)", "§ 4 ust. 2 pkt 6 rozp. 2010"],
    ["ponad 1000 MJ/m²", "hydrant 33 już nie wystarczy - tylko 52", "§ 19 ust. 4 rozp. 2010"],
    ["ponad 2000 MJ/m²", "budynek PM tylko do budynku średniowysokiego; strefa w parterowym do 4000 m²", "§ 212 ust. 4, § 228 WT"],
    ["ponad 4000 MJ/m²", "odległość od innych budynków 20 m; strefa w parterowym do 2000 m²", "§ 271, § 228 WT"],
  ])}
${przyklad("stolarnia w Pilicy", `<p>Hala 400 m², jedna kondygnacja. Na podłodze: 15 000 kg desek i kantówki, 5000 kg płyt meblowych (liczymy jak drewno), 300 kg folii i tworzyw.</p>
${tab(["Co", "Masa", "× ciepło spalania", "= energia"], [["deski, kantówka", "15 000 kg", "18 MJ/kg", "270 000 MJ"], ["płyty meblowe", "5000 kg", "18 MJ/kg", "90 000 MJ"], ["folia, tworzywa", "300 kg", "42 MJ/kg", "12 600 MJ"], ["<b>razem</b>", "", "", "<b>372 600 MJ</b>"]])}
<ol><li>Q = 372 600 ÷ 400 = <b>ok. 930 MJ/m²</b>, czyli przedział 500-1000.</li><li>Klasa odporności pożarowej: PM, 1 kondygnacja, 500-1000 → <b>D</b>.</li><li>Hydrant: ponad 500 i ponad 200 m² → hydrant 52; Q nie przekracza 1000, więc wolno <b>hydrant 33</b>.</li><li>Gaśnice: 2 kg środka na każde <b>100 m²</b>.</li><li>Uwaga: w stolarni jest pył drzewny. Trzeba ocenić, czy przy maszynach i odciągu wiórów nie ma <b>strefy zagrożenia wybuchem</b> (pył - strefy 20, 21, 22). To zmienia wszystko: IBP zawsze, przejście w pomieszczeniu zagrożonym wybuchem 40 m, urządzenia Ex.</li></ol>`)}
${przyklad("warsztat samochodowy w Kroczycach", `<p>Warsztat 300 m², jedna kondygnacja.</p>
${tab(["Co", "Masa", "× ciepło spalania", "= energia"], [["opony", "1500 kg", "37 MJ/kg", "55 500 MJ"], ["olej silnikowy i przekładniowy", "400 kg", "43 MJ/kg", "17 200 MJ"], ["części z tworzyw", "600 kg", "42 MJ/kg", "25 200 MJ"], ["regały i stoły drewniane", "800 kg", "18 MJ/kg", "14 400 MJ"], ["<b>razem</b>", "", "", "<b>112 300 MJ</b>"]])}
<ol><li>Q = 112 300 ÷ 300 = <b>ok. 375 MJ/m²</b>, do 500.</li><li>Klasa PM, 1 kondygnacja, do 500 → <b>E</b>.</li><li>Gaśnice: 2 kg środka na każde <b>300 m²</b>, ale w warsztacie i tak warto więcej.</li><li>Hydrant 52 nie jest wymagany (Q do 500), chyba że jest pomieszczenie ponad 100 m² z Q ponad 1000, np. magazyn opon (§ 19 ust. 3 pkt 2 rozp. 2010).</li><li>Jeśli w warsztacie jest kabina lakiernicza - strefa zagrożenia wybuchem i obowiązkowa IBP mimo małej kubatury.</li></ol>`)}
${przyklad("jak oszacować masę w terenie", `<ol><li>Zapytaj o <b>dokumenty</b>: faktury, WZ, stany magazynowe - tam są kilogramy albo liczba palet.</li><li>Policz palety i <b>zważ albo sprawdź w dokumentach jedną typową</b>. Przemnóż.</li><li>Sama paleta drewniana to też paliwo - dolicz ją osobno.</li><li>Licz dla stanu <b>najgorszego</b>: przed świętami, w szczycie sezonu, a nie w dniu wizyty.</li><li>Zapisz w IBP założenia: „przyjęto 120 palet po 400 kg kartonów, stan maksymalny w grudniu”. Gdy właściciel zwiększy składowanie, widać od razu, że trzeba przeliczyć.</li></ol>`)}
${wlasciciel(`<p>„Ma Pan na każdym metrze ok. 80 kg kartonów - to prawie 1300 MJ/m². Od tej liczby zależy, ile gaśnic, jakie hydranty i jak duża może być hala bez ściany ogniowej. Jeśli zwiększy Pan składowanie, muszę to przeliczyć.”</p>`)}
${wlasciciel(`<p>„Dziś w magazynie wychodzi 900 MJ/m². Jeśli w grudniu dołoży Pan jeszcze połowę towaru, przekroczy Pan 1000. Wtedy hydrant 33, który Pan ma, przestaje wystarczać, bo powyżej 1000 przepis wymaga hydrantu 52. Lepiej teraz ustalić, ile maksymalnie wolno składować, i zapisać to w instrukcji.”</p>`)}
${wlasciciel(`<p>„Po przebudowie biuro i magazyn będą jedną strefą. Dla biura obciążenia się nie liczy, ale dla magazynu tak, i to ono ustawi wymagania dla całej strefy. Rozsądniej oddzielić magazyn ścianą i drzwiami przeciwpożarowymi - wtedy biuro nie płaci za wymagania magazynu.”</p>`)}
${pulapki(["Jednostka: MJ/m².", "Potrzebne: masa materiałów i ich ciepło spalania (nie skład chemiczny).", "Dla ZL gęstości obciążenia ogniowego się nie liczy - tylko PM i IN.", "Dziel przez powierzchnię strefy lub pomieszczenia, nie całego terenu.",
    "Obciążenie ogniowe = cała energia (MJ); <b>gęstość</b> obciążenia ogniowego = energia na m² (MJ/m²).",
    "Norma do obliczeń: <b>PN-B-02852</b>.",
    "Najważniejsze progi: <b>500, 1000, 2000, 4000 MJ/m²</b>.",
    "Q ponad 500 i ponad 200 m² - hydrant <b>52</b>; do 1000 można 33.",
    "Odległość PM od innych budynków: <b>8 m</b> (do 1000), <b>15 m</b> (1000-4000), <b>20 m</b> (ponad 4000 albo zagrożenie wybuchem).",
  ])}`),
  },
  {
    id: "dgw", skrot: "DGW", tytul: "DGW i GGW - granice wybuchowości gazów, par i pyłów",
    html: () => nbsp(`
${ludzku(`<p>Gaz palny wybucha tylko wtedy, gdy jest go w powietrzu <b>w odpowiedniej proporcji</b>. Za mało gazu - iskra nic nie zrobi, bo mieszanina jest <b>za uboga</b>. Za dużo gazu - też nic, bo brakuje tlenu, mieszanina jest <b>za bogata</b>. Wybuch jest możliwy tylko pomiędzy tymi dwiema granicami.</p>
<p><b>DGW - dolna granica wybuchowości</b> - najmniejsze stężenie gazu lub par w powietrzu, przy którym zapłon już jest możliwy. <b>GGW - górna granica wybuchowości</b> - największe stężenie, przy którym zapłon jest jeszcze możliwy. Podaje się je w <b>procentach objętości</b> (% obj.): ile litrów gazu jest w 100 litrach mieszaniny z powietrzem.</p>`)}
<h3>Porównanie, które każdy zrozumie</h3>
<p>Silnik samochodu. Gdy paliwa jest za mało, silnik gaśnie. Gdy zalejesz go paliwem, też nie odpali. Działa tylko przy właściwej proporcji paliwa i powietrza. Z gazem w pomieszczeniu jest tak samo - tylko zamiast pracy silnika masz wybuch.</p>
${rys(SVG_DGW, "Zakres wybuchowości (od DGW do GGW) wybranych gazów w % objętości. Wartości z materiałów kursu (instalacje gazowe).")}
${tab(["Gaz", "DGW", "GGW", "Co to znaczy w praktyce"], [
    ["metan (gaz ziemny z sieci)", "5,3%", "14,0%", "lżejszy od powietrza - zbiera się pod sufitem"],
    ["propan", "2,4%", "9,5%", "cięższy od powietrza - spływa w dół, do piwnic, studzienek i kanałów"],
    ["butan", "1,9%", "8,4%", "cięższy od powietrza; razem z propanem tworzy gaz płynny LPG"],
    ["wodór", "4,1%", "74,2%", "bardzo szeroki zakres - wybucha prawie w każdej proporcji (akumulatornie, ładowanie wózków)"],
    ["acetylen", "2,5%", "80,0%", "najszerszy zakres w tabeli - butle do spawania i cięcia"],
    ["tlenek węgla (czad)", "12,5%", "74,2%", "trudno o wybuch, ale wcześniej zabija - groźny dla ludzi już przy ułamku procenta"],
    ["etan", "3,2%", "12,5%", "składnik gazu ziemnego"],
  ])}
<h3>Dwie reguły do zapamiętania</h3>
<p><b>Im niższa DGW, tym groźniejsza substancja</b> - mniej jej trzeba, żeby zrobiło się niebezpiecznie. Butan (1,9%) jest pod tym względem groźniejszy niż metan (5,3%).</p>
<p><b>Im szerszy zakres między DGW i GGW, tym groźniejsza substancja</b> - trudniej „wyjść” z wybuchowej proporcji. Dlatego wodór i acetylen są tak niebezpieczne.</p>
<h3>Przykład 1 - kuchnia z butlą gazu</h3>
<p>Kuchnia 12 m² o wysokości 2,5 m ma 30 m³ powietrza. Propan wybucha od 2,4%. 2,4% z 30 m³ to <b>0,72 m³ gazu</b>, czyli ok. 1,4 kg propanu - mniej niż 1/7 butli 11 kg. Pełna butla 11 kg to ok. 5,5 m³ gazu. To wystarczy, żeby zrobić ponad <b>200 m³ mieszaniny wybuchowej</b>.</p>
<p>Ponieważ propan i butan są cięższe od powietrza, gaz nie rozkłada się równo, tylko tworzy „jezioro” przy podłodze. Wybuchowe stężenie przy podłodze pojawia się dużo szybciej, niż wynikałoby z rachunku dla całej kuchni.</p>
<h3>Przykład 2 - spawanie przy pustej beczce</h3>
<p>W „pustej” beczce po benzynie zostają pary. W zamkniętej beczce stężenie bywa powyżej GGW - mieszanina za bogata, nic się nie dzieje. Gdy ktoś beczkę otworzy albo zacznie ciąć, wpada powietrze. Stężenie spada i przechodzi przez zakres wybuchowy. Dlatego pusty zbiornik po paliwie bywa groźniejszy niż pełny.</p>
<h3>Przykład 3 - pomiar eksplozymetrem przed pracami</h3>
<p>Eksplozymetr (miernik gazów wybuchowych) pokazuje wynik w <b>% DGW</b>, a nie w % objętości. 100% DGW na wyświetlaczu oznacza, że w powietrzu jest dokładnie tyle gazu, ile wynosi dolna granica. Dla metanu 10% DGW to tylko 0,53% objętości metanu w powietrzu.</p>
<p>Prace pożarowo niebezpieczne (spawanie, cięcie, szlifowanie) w pomieszczeniu zagrożonym wybuchem wolno prowadzić <b>tylko wtedy, gdy stężenie nie przekracza 10% DGW</b> (§ 36 ust. 2 pkt 2 rozp. 2010). Czyli z dziesięciokrotnym zapasem bezpieczeństwa.</p>
<h3>Pyły - inaczej niż gazy</h3>
<p>Dla pyłów (mąka, cukier, pył drzewny, pył aluminium) DGW podaje się w <b>gramach na metr sześcienny (g/m³)</b>, rzadko w % objętości. <b>Górnej granicy dla pyłów się nie uwzględnia</b>: przy takim stężeniu nie widać własnej ręki, więc w praktyce nie da się jej osiągnąć (materiały kursu T-1).</p>
<p>Warstwa pyłu leżąca na belkach i maszynach sama nie wybucha. Groźna jest wtedy, gdy coś ją podniesie w powietrze, np. pierwszy, mały wybuch albo podmuch. Przykładowy rachunek: warstwa pyłu grubości ok. 1 mm (mniej więcej grubość karty płatniczej) na podłodze, poderwana w pomieszczeniu wysokim na 5 m, daje stężenie rzędu 100 g/m³. To dużo powyżej DGW wielu pyłów, która zwykle wynosi kilkadziesiąt g/m³ (wartość orientacyjna z literatury). Dlatego przepis każe regularnie sprzątać pył zalegający w warstwach (§ 4 ust. 6 rozp. 2010).</p>
<h3>Gdzie DGW pojawia się w przepisach i dokumentach</h3>
${tab(["Sytuacja", "Co z DGW", "Źródło"], [
    ["prace pożarowo niebezpieczne", "dopuszczalne do 10% DGW", "§ 36 ust. 2 pkt 2 rozp. 2010"],
    ["wyznaczanie stref zagrożenia wybuchem", "przestrzeń, poza którą stężenie spada poniżej 0,25 DGW (emisja ciągła i pierwszego stopnia) lub 0,5 DGW (emisja drugiego stopnia)", "materiały kursu „Zagrożenie wybuchem”, norma PN-EN 60079-10-1"],
    ["pomieszczenie zagrożone wybuchem", "możliwy wybuch dający przyrost ciśnienia ponad 5 kPa", "§ 37 ust. 7 rozp. 2010"],
    ["strefa zagrożenia wybuchem w pomieszczeniu", "możliwa mieszanina wybuchowa o objętości co najmniej 0,01 m³ w zwartej przestrzeni", "§ 37 ust. 9 rozp. 2010"],
    ["ocena zagrożenia wybuchem, instrukcja bezpieczeństwa pożarowego", "parametry pożarowe substancji, w tym granice wybuchowości", "§ 6 ust. 1 pkt 8 lit. c, § 37 rozp. 2010"],
  ])}
<p>Granice wybuchowości nie są stałe. Zależą od temperatury, ciśnienia i obecności gazów obojętnych: w wyższej temperaturze zakres się poszerza, a dodanie azotu albo dwutlenku węgla go zawęża. Na tym opiera się inertyzacja, czyli wypełnianie zbiorników gazem obojętnym.</p>
${wlasciciel(`<p>„Gaz z butli jest cięższy od powietrza. Jeśli butla stoi w piwnicy i puści zawór, gaz zbierze się przy podłodze, a do wybuchu wystarczy niecałe 1,5 kg z 11 kg w butli. Dlatego butle nie mogą stać w piwnicy - nawet puste.”</p>
<p>„Zanim spawacz zacznie pracę przy zbiorniku, ktoś musi zmierzyć gaz eksplozymetrem. Wynik musi być poniżej 10% dolnej granicy wybuchowości. Bez pomiaru nie ma spawania.”</p>`)}
${pulapki([
    "DGW - dolna, GGW - górna granica wybuchowości; między nimi jest zakres wybuchowy.",
    "Gazy i pary - w % objętości; pyły - w g/m³.",
    "Dla pyłów GGW się nie uwzględnia.",
    "Prace pożarowo niebezpieczne w strefie zagrożonej wybuchem - stężenie nie więcej niż 10% DGW.",
    "Im niższa DGW i szerszy zakres, tym substancja groźniejsza.",
    "Poniżej DGW mieszanina jest za uboga, powyżej GGW - za bogata.",
    "Pomieszczenie zagrożone wybuchem: przyrost ciśnienia ponad 5 kPa; strefa: od 0,01 m³ mieszaniny.",
    "Eksplozymetr pokazuje <b>% DGW</b>, nie % objętości.",
    "Metan lżejszy od powietrza - zbiera się <b>pod sufitem</b>; propan i butan cięższe - <b>przy podłodze</b>.",
  ])}
${wyklad(`<p>Proszę Państwa, eksplozymetr to Wasz najważniejszy przyjaciel przy pracach niebezpiecznych pożarowo. Zanim ktoś zacznie spawać przy zbiorniku albo w kanale, ktoś inny mierzy powietrze. I tu trzy zasady z praktyki.</p>
<p><b>Mierz tam, gdzie gaz się zbiera.</b> Metan z sieci idzie do góry, więc mierzysz pod sufitem i w najwyższym punkcie zbiornika. Propan i butan spływają w dół, więc mierzysz przy podłodze, w studzienkach i kanałach. Pomiar „na wysokości nosa” może pokazać zero, a pół metra niżej jest mieszanina wybuchowa.</p>
<p><b>Mierz przed pracą i w trakcie.</b> Spawanie grzeje resztki w zbiorniku, a te parują dalej. Wynik sprzed godziny nic nie znaczy.</p>
<p><b>Granica to 10% DGW.</b> Powyżej - prace przerywasz i wietrzysz (§ 36 ust. 2 pkt 2 rozp. 2010). To zapas dziesięciokrotny, bo stężenie w jednym miejscu może być dużo wyższe niż w miejscu pomiaru.</p>`)}
${przyklad("co znaczy wynik z eksplozymetru", `<p>Pomiar przy studzience z rurą gazową (gaz ziemny, metan). Eksplozymetr pokazuje <b>8% DGW</b>.</p>
<ol><li>DGW metanu = 5,3% objętości.</li><li>8% z 5,3% = 0,08 × 5,3 = <b>0,42% objętości</b> metanu w powietrzu.</li><li>To poniżej 10% DGW - prace wolno prowadzić, ale z ciągłym pomiarem i wentylacją.</li><li>Gdyby wynik wynosił 12% DGW (ok. 0,64% objętości) - przerwać prace, wywietrzyć, szukać nieszczelności.</li></ol>`)}`),
  },
  {
    id: "obchod", skrot: "OBCH", tytul: "Wartości przy obchodzie - na zewnątrz i wewnątrz budynku, ZL, PM i IN",
    html: () => nbsp(`
${ludzku(`<p>Tu masz wszystkie liczby, na które patrzysz, idąc wokół budynku i przez budynek. Ułożone są w kolejności obchodu: dokumenty, teren, wejście, drogi ewakuacyjne, znaki i oświetlenie, gaśnice, hydranty, urządzenia, porządek. Ta sama lista jest w narzędziu <a href="#/narzedzia/obchod">Obchód obiektu</a> - tam możesz odhaczać punkty i zbierać uwagi do protokołu.</p>`)}
<h3>Najważniejsze różnice: ZL, PM i IN</h3>
<p>ZL to budynki dla ludzi (sklepy, biura, szkoły, hotele, mieszkania). PM to produkcja i magazyny - tam decyduje gęstość obciążenia ogniowego Q. IN to budynki inwentarskie (obory, chlewnie, stajnie).</p>
${tab(["Co sprawdzasz", "ZL", "PM", "IN (inwentarskie)"], [
    ["Przejście w pomieszczeniu do wyjścia", "40 m", "75 m (wielokondygnacyjny, Q ponad 500), 100 m (pozostałe); z zagrożeniem wybuchem 40 m", "-"],
    ["Dojście korytarzem (1 / 2 kierunki)", "ZL I, II, V: 10 / 40 m; ZL III: 30 / 60 m; ZL IV: 60 / 100 m", "Q ponad 500: 30 / 60 m; Q do 500: 60 / 100 m; z zagrożeniem wybuchem 10 / 40 m", "-"],
    ["Drugie wyjście z pomieszczenia", "ponad 300 m² albo ponad 50 osób (ZL II - ponad 30)", "Q ponad 500 - ponad 300 m²; Q do 500 - ponad 1000 m²; zagrożone wybuchem - ponad 100 m²", "-"],
    ["Gaśnice: 2 kg środka na", "100 m² (ZL I, II, III, V); w ZL IV brak wymogu", "100 m² przy Q ponad 500 lub zagrożeniu wybuchem; 300 m² w pozostałych", "300 m²"],
    ["Hydranty wewnętrzne", "hydrant 25", "hydrant 52 (Q ponad 500 i ponad 200 m²); garaże - hydrant 33", "-"],
    ["Odległość drogi pożarowej od ściany", "5-15 m", "5-25 m", "5-25 m"],
    ["Instrukcja bezpieczeństwa pożarowego", "budynki UP i ZZ od 1000 m³; budynki mieszkalne (ZL IV) - nie wymagana", "od 1000 m³ albo zawsze przy strefie wybuchowej", "od 1500 m³"],
    ["Awaryjne oświetlenie ewakuacyjne", "sale ponad 200 osób, pomieszczenia ponad 2000 m², drogi bez okien", "pomieszczenia ponad 2000 m², drogi bez okien", "-"],
    ["Odległość od sąsiedniego budynku", "8 m (15 lub 20 m, gdy obok stoi PM o dużym Q)", "8 m (Q do 1000), 15 m (Q 1000-4000), 20 m (Q ponad 4000 lub zagrożenie wybuchem)", "8 m (jak ZL)"],
  ])}
<p>Myślnik w tabeli oznacza, że przepis nie podaje tu osobnej wartości dla tej kategorii. Wtedy sięgasz do zasad ogólnych albo do narzędzia <a href="#/narzedzia/obiekt">Sprawdź budynek</a>.</p>
${rys(SVG_OBCHOD, "Wokół budynku: droga pożarowa, drzewa, hydranty, składowanie i kurek gazu. Wartości z § 12-13 i § 10 rozp. 2009 oraz § 4 rozp. 2010.")}
${OBCHOD.map((d) => `<h3>${tekst(d.dzial)}</h3>${tab(["Co sprawdzasz", "Wymagana wartość", "Przepis"], d.punkty.map(([co, war, prz, dla]) => [`<b>${tekst(co)}</b>${dla ? ` <span class="ob-dla">${dla}</span>` : ""}`, pogrubLiczby(tekst(war)), tekst(prz)]))}`).join("")}
${wyklad(`<p>Proszę Państwa, obchód robicie zawsze w tej samej kolejności, żeby niczego nie pominąć. Zaczynacie od <b>dokumentów</b>, bo z nich wiecie, czego szukać: IBP, ocena zagrożenia wybuchem, protokoły przeglądów, postanowienia o rozwiązaniach zamiennych. Potem <b>teren wokół</b>: droga pożarowa, hydranty, odległości, składowanie pod ścianą, kurek gazu. Potem <b>drogą strażaka do środka</b>: wejście, wyłącznik prądu, klatki, korytarze, drzwi. Na końcu <b>pomieszczenia</b>: gaśnice, hydranty wewnętrzne, czujki, porządek, instalacje.</p>
<p>Zasada druga: <b>notujecie fakt, a nie opinię</b>. Nie „korytarz zastawiony”, tylko „na korytarzu II piętra dwie szafy, wolna szerokość 1,1 m przy wymaganych 1,4 m”. Nie „gaśnica stara”, tylko „gaśnica GP-6x ABC nr 123, ostatni przegląd 03.2024”. Fakt plus wymaganie plus przepis - tak pisze się protokół, którego nikt nie podważy.</p>
<p>Zasada trzecia: <b>zdjęcie każdej niezgodności</b>, za zgodą właściciela. Po tygodniu nikt nie pamięta, które drzwi były podparte klinem.</p>`)}
${przyklad("wpisy do protokołu z obchodu", `${tab(["Co widzisz", "Jak zapisać"], [
    ["Szafka hydrantu zastawiona paletą", "Hydrant wewnętrzny 25 przy klatce B, parter - dostęp ograniczony paletą z towarem (§ 4 ust. 1 pkt 18 lit. a rozp. 2010). Zalecenie: usunąć natychmiast, oznaczyć pole przed szafką."],
    ["Drzwi przeciwpożarowe podparte klinem", "Drzwi przeciwpożarowe między halą a magazynem zablokowane w pozycji otwartej klinem (§ 4 ust. 1 pkt 15 rozp. 2010). Zalecenie: usunąć klin; jeśli drzwi mają być otwarte - elektrotrzymacz sterowany z czujek."],
    ["Gaśnica bez przeglądu", "Gaśnica proszkowa przy wejściu, ostatni przegląd 03.2024 - termin przekroczony (§ 3 ust. 3 rozp. 2010: co najmniej raz w roku). Zalecenie: przegląd przez serwis."],
    ["Wyjście ewakuacyjne zamknięte na klucz", "Drzwi wyjścia ewakuacyjnego z sali zamknięte na klucz w czasie pracy (§ 4 ust. 1 pkt 14 rozp. 2010). Zalecenie: zamek z funkcją otwierania od środka bez klucza."],
    ["Butla z propanem w piwnicy", "W piwnicy butla gazowa 11 kg (§ 4 ust. 1 pkt 13 rozp. 2010 - zakaz przechowywania butli z gazem palnym w piwnicach). Zalecenie: usunąć natychmiast."],
  ])}`)}
${wlasciciel(`<p>„Na obchodzie patrzę na trzy rzeczy: czy straż dojedzie i dostanie wodę, czy ludzie wyjdą, czy sprzęt działa. Liczby, które Panu podaję, to minimum z przepisów - nie moje widzimisię.”</p>`)}
${wlasciciel(`<p>„Z dzisiejszego obchodu mam 7 uwag. Trzy są do zrobienia dziś i nic nie kosztują: klin pod drzwiami, paleta przed hydrantem, klucz w drzwiach wyjścia. Dwie to serwis, czyli przeglądy gaśnic i hydrantów. Dwie wymagają pieniędzy i projektu. Ułożę je od najpilniejszej i wpiszę terminy, a za miesiąc sprawdzimy razem, co zrobione.”</p>`)}
${pulapki([
    "Droga pożarowa: 4 m szerokości, 5-15 m od ściany ZL, 5-25 m od innych, łuk min. 11 m, plac 20 × 20 m, cofanie do 15 m, nic wyższego niż 3 m pomiędzy.",
    "Hydrant zewnętrzny: do 75 m od budynku, co 150 m, do 15 m od jezdni, min. 5 m od ściany.",
    "Gaśnice: do 30 m od każdego miejsca, dostęp 1 m, przegląd co rok.",
    "Materiały palne: 0,5 m od urządzeń nagrzewających się ponad 100 °C; 4 m od granicy działki; 5 m od drogi pożarowej pod ścianą.",
    "Awaryjne oświetlenie ewakuacyjne: działa co najmniej 1 godzinę.",
    "Protokół: <b>fakt + wymaganie + przepis + zalecenie</b> - nie opinia.",
  ])}`),
  },

  // Tematy z 16.11.2026 (prośba Tomka po 1. dniu zajęć stacjonarnych). Liczby i daty z § 28-29 i § 28a rozp. 2010
  // oraz § 2 rozp. zmieniającego Dz.U. 2024 poz. 1716 (sprawdzone w PDF z Dz.U.).
  {
    id: "czujki-gdzie", skrot: "CZUJ", tytul: "Czujki dymu i czadu - gdzie muszą być, a gdzie nie (dom, urząd, hotel, szpital)",
    html: () => nbsp(`
${ludzku(`<p>Są dwa różne światy. <b>System sygnalizacji pożarowej (SSP)</b> to czujki połączone kablem z centralą, która alarmuje obsługę i często straż. Przepis wymaga go tylko w dużych albo szczególnych budynkach (§ 28 rozp. 2010). <b>Czujka autonomiczna</b> to mały krążek na baterię, który sam piszczy. Od 2024 r. musi być w każdym mieszkaniu i w każdym pokoju hotelowym (§ 28a rozp. 2010). Do tego dochodzi <b>czujka czadu</b> tam, gdzie w lokalu coś się pali: piec, kominek, piecyk gazowy z otwartą komorą.</p>`)}
<h3>Czujka dymu autonomiczna - gdzie obowiązkowa (§ 28a ust. 1-2 rozp. 2010)</h3>
${tab(["Gdzie", "Ile", "Od kiedy w istniejących"], [
    ["pokój albo „jednostka mieszkalna” w hotelu, pensjonacie, schronisku i w każdym innym miejscu, gdzie wynajmuje się noclegi (usługi hotelarskie)", "co najmniej 1 czujka dymu w każdym", "<b>30.06.2026</b> - już obowiązuje"],
    ["lokal mieszkalny (mieszkanie)", "co najmniej 1 czujka dymu", "<b>1.01.2030</b>"],
    ["nowe pokoje i mieszkania (oddane po 23.12.2024)", "jak wyżej", "od razu"],
  ])}
<p><b>Wyjątek:</b> czujki autonomicznej dymu nie trzeba, gdy pomieszczenie chroni SSP albo stałe samoczynne urządzenie gaśnicze, np. tryskacze (§ 28a ust. 2). Ten wyjątek dotyczy tylko czujki dymu, nie czadu.</p>
<h3>Czujka czadu (tlenku węgla) - gdzie obowiązkowa (§ 28a ust. 3-4 rozp. 2010)</h3>
${tab(["Gdzie", "Kiedy NIE trzeba", "Od kiedy w istniejących"], [
    ["pomieszczenie, w którym spala się paliwo stałe, ciekłe lub gazowe (kominek, piec węglowy, kocioł, piecyk gazowy) - w mieszkaniu", "urządzenie z zamkniętą komorą spalania; kuchenka gazowa", "<b>1.01.2030</b>"],
    ["takie samo pomieszczenie w lokalu użytkowym, w którym przebywają ludzie, w strefie ZL (np. kawiarnia z kominkiem, biuro z piecem)", "jak wyżej", "<b>30.06.2026</b> - już obowiązuje"],
  ])}
<p>Daty dla istniejących budynków są w § 2 ust. 2-4 rozporządzenia zmieniającego (<a target="_blank" rel="noopener" href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001716">Dz.U. 2024 poz. 1716</a>). Czujek autonomicznych nie obejmują coroczne przeglądy z § 3 ust. 1-3. Montuje się je, konserwuje i wymienia według instrukcji producenta (§ 3 ust. 3a rozp. 2010). Czujka ma spełniać Polską Normę: dla dymu jest to PN-EN 14604, dla czadu PN-EN 50291-1.</p>
<h3>A dom jednorodzinny?</h3>
<p>Przepis mówi o „lokalu mieszkalnym”, a nie wprost o domu. Prawo budowlane opisuje jednak dom jednorodzinny jako budynek, w którym można wydzielić najwyżej dwa lokale mieszkalne (art. 3 pkt 2a PB). Warunki techniczne mówią wprost o „budynkach mieszkalnych jednorodzinnych stanowiących jeden lokal mieszkalny” (§ 267 ust. 1a WT). Dlatego <b>moim zdaniem dom też jest objęty obowiązkiem</b>, a istniejące domy mają czas do 1.01.2030. W materiałach kursu nie ma oficjalnej interpretacji, więc warto o to zapytać wykładowcę.</p>
<p>W praktyce nikt tego w domu nie sprawdzi: strażak kontrolujący nie ma prawa wstępu do części mieszkalnej (art. 23 ust. 11 ustawy o PSP). Czujka za 50-80 zł to jednak najtańszy sposób na przeżycie nocnego pożaru, bo dym zabija we śnie, zanim ktokolwiek poczuje swąd.</p>
<h3>Gdzie musi być SSP (§ 28 ust. 1 rozp. 2010) - pełna lista progów</h3>
${tab(["Obiekt", "SSP wymagany, gdy"], [
    ["handel, wystawy - 1 kondygnacja", "strefa pożarowa ponad 5000 m²"],
    ["handel, wystawy - wiele kondygnacji", "strefa pożarowa ponad 2500 m²"],
    ["teatr", "ponad 300 miejsc"],
    ["kino", "ponad 600 miejsc"],
    ["gastronomia", "ponad 300 miejsc w budynku"],
    ["sala widowiskowa lub sportowa", "ponad 1500 miejsc"],
    ["szpital (nie psychiatryczny), sanatorium", "ponad 200 łóżek w budynku"],
    ["szpital psychiatryczny", "ponad 100 łóżek w budynku"],
    ["dom pomocy społecznej, ośrodek rehabilitacji dla niepełnosprawnych", "ponad 100 łóżek w budynku"],
    ["zakład pracy", "ponad 100 osób niepełnosprawnych w budynku"],
    ["budynek użyteczności publicznej (urząd, szkoła, biuro)", "tylko gdy wysoki lub wysokościowy"],
    ["zamieszkanie zbiorowe z pobytem ponad 3 doby (akademik, internat, hotel pracowniczy)", "ponad 200 miejsc noclegowych"],
    ["pozostałe zamieszkanie zbiorowe (hotel, pensjonat, schronisko)", "ponad 50 miejsc noclegowych"],
    ["garaż podziemny", "strefa ponad 1500 m² albo więcej niż 1 kondygnacja podziemna"],
    ["dworzec, port", "ponad 500 osób jednocześnie"],
    ["bank", "strefa z salą operacyjną ponad 500 m²"],
    ["archiwa, muzea i zabytki wyznaczone, biblioteki z narodowym zasobem, ośrodki przetwarzania danych, duże centrale telefoniczne, metro", "zawsze (gdy wyznaczone lub spełniają opis z przepisu)"],
  ])}
<p>Obiekt ze stałymi urządzeniami gaśniczymi może nie mieć SSP, chyba że SSP jest potrzebny do uruchomienia innych urządzeń, np. oddymiania (§ 30 rozp. 2010). Głośniki DSO z komunikatem głosowym to osobna lista (§ 29 rozp. 2010).</p>
<h3>Przykłady: musi czy nie musi?</h3>
${tab(["Obiekt", "SSP", "Czujki autonomiczne"], [
    ["Urząd gminy, 3 kondygnacje (budynek niski)", "nie - urząd tylko, gdy wysoki", "nie - to nie mieszkanie ani hotel"],
    ["Szkoła, przedszkole (budynek niski)", "nie", "nie"],
    ["Szpital powiatowy, 180 łóżek w budynku", "nie - próg to ponad 200", "nie"],
    ["DPS, 120 łóżek w budynku", "tak - ponad 100", "nie wynika z § 28a - to nie mieszkanie ani hotel"],
    ["Pensjonat na Jurze, 30 miejsc noclegowych", "nie - próg to ponad 50", "<b>tak, w każdym pokoju, od 30.06.2026</b>"],
    ["Hotel, 60 miejsc noclegowych", "tak - ponad 50", "nie trzeba, bo chroni SSP"],
    ["Akademik, 150 miejsc (pobyt ponad 3 doby)", "nie - próg to ponad 200", "nie wynika z § 28a, chyba że latem wynajmuje pokoje turystom"],
    ["Restauracja, 250 miejsc", "nie - próg to ponad 300", "nie; czujka czadu, jeśli jest kominek z otwartym paleniskiem"],
    ["Mieszkanie w bloku z piecykiem gazowym w łazience (otwarta komora)", "nie", "czujka dymu + czujka czadu w łazience (istniejące - do 1.01.2030)"],
    ["Dom z kominkiem z otwartym paleniskiem", "nie", "czujka dymu + czujka czadu przy kominku (moim zdaniem - patrz wyżej)"],
  ])}
${wyklad(`<p>Proszę Państwa, przez lata w Polsce czujki były obowiązkowe tylko tam, gdzie wymagano całego systemu z centralą: w dużych hotelach, szpitalach, galeriach. Mieszkania i małe pensjonaty zostawały bez niczego, a to tam ludzie giną najczęściej - w nocy, we śnie, od dymu. Zmiana z 2024 r. (§ 28a rozp. 2010) zamyka tę lukę najtańszym środkiem: krążkiem na baterię za kilkadziesiąt złotych.</p>
<p>Zwróćcie uwagę na konstrukcję przepisu. Nie ma w nim progów ani metrów. Jest prosto: <b>każde</b> mieszkanie, <b>każdy</b> pokój hotelowy - co najmniej jedna czujka dymu. Do tego czujka czadu tam, gdzie w lokalu pali się paliwo w otwartej komorze. Są dwa wyjątki: czujki dymu nie trzeba, gdy pomieszczenie chroni SSP albo tryskacze, a czujki czadu - przy zamkniętej komorze spalania i przy kuchence gazowej.</p>
<p>I jeszcze sprawa przeglądów. Czujki autonomiczne zostały celowo wyjęte spod obowiązku corocznego przeglądu przez serwis (§ 3 ust. 3a rozp. 2010). Montuje się je, konserwuje i wymienia według instrukcji producenta. Dla właściciela pensjonatu oznacza to: przycisk TEST zgodnie z instrukcją, wymiana baterii lub całej czujki po terminie z naklejki, i zapis, że to zrobiono.</p>`)}
${przyklad("kamienica: sklep na dole, mieszkania na górze, piec węglowy", `<p>Budynek w Myszkowie: na parterze sklep z zapleczem, na piętrach 4 mieszkania. W dwóch mieszkaniach jest piec kaflowy na węgiel, w jednym kocioł gazowy z zamkniętą komorą, w czwartym ogrzewanie miejskie. W sklepie, w zapleczu, stoi koza na drewno.</p>
${tab(["Pomieszczenie", "Czujka dymu", "Czujka czadu", "Od kiedy"], [
    ["każde z 4 mieszkań", "tak, co najmniej 1", "-", "1.01.2030"],
    ["pokój z piecem kaflowym (2 mieszkania)", "-", "tak, w tym pokoju", "1.01.2030"],
    ["łazienka z kotłem z zamkniętą komorą", "-", "nie (§ 28a ust. 4)", "-"],
    ["zaplecze sklepu z kozą", "nie wymaga (sklep to nie mieszkanie ani hotel)", "tak - lokal użytkowy na pobyt ludzi w strefie ZL", "30.06.2026 - już obowiązuje"],
  ])}`)}
${wlasciciel(`<p>„Ma Pan pensjonat z 12 pokojami. Od 30 czerwca 2026 r. w każdym pokoju musi wisieć czujka dymu zgodna z normą PN-EN 14604. To 12 czujek po ok. 60 zł, razem mniej niż jedna doba wynajmu całego pensjonatu. Sprawdzamy je przyciskiem TEST według instrukcji producenta i zapisujemy w zeszycie. Jeśli kiedyś przekroczy Pan 50 miejsc noclegowych, potrzebny będzie już cały system sygnalizacji z centralą.”</p>`)}
${pulapki([
    "Teatr ponad <b>300</b> miejsc, kino ponad <b>600</b>, gastronomia ponad <b>300</b>, sala sportowa ponad <b>1500</b>.",
    "Szpital ponad <b>200</b> łóżek, psychiatryczny i DPS ponad <b>100</b> (pyt. 491: „szpital psychiatryczny ponad 100 łóżek”).",
    "Hotel, pensjonat: ponad <b>50</b> miejsc; akademik, internat (pobyt ponad 3 doby): ponad <b>200</b>.",
    "SSP ma <b>wykryć</b> pożar, nie gasić (pyt. 422) i zadziałać w <b>I fazie</b> pożaru (pyt. 617).",
    "Czujki dymu najczęściej reagują na <b>dym</b>, bo zwykły pożar najpierw dymi (pyt. 221).",
    "Daty dla istniejących: pokoje hotelowe i lokale użytkowe - <b>30.06.2026</b>; mieszkania - <b>1.01.2030</b>.",
    "Czujka czadu NIE jest wymagana przy kotle z zamkniętą komorą spalania ani przy kuchence gazowej.",
  ])}`),
  },
  {
    id: "czujki-wyglad", skrot: "SUFIT", tytul: "Jak rozpoznać czujki i inne urządzenia, patrząc na sufit",
    html: () => nbsp(`
${ludzku(`<p>Na suficie wisi wiele okrągłych „krążków” i nie każdy z nich jest czujką pożarową. Przy obchodzie zadajesz sobie trzy pytania. <b>Ma kabel czy baterię?</b> Kabel oznacza SSP, bateria czujkę autonomiczną. <b>Ma szczeliny dookoła?</b> Wtedy łapie dym. <b>Gdzie wisi?</b> Na środku sufitu jest zwykle czujka, w narożniku ściany czujka ruchu od alarmu włamaniowego, a na ścianie przy drzwiach ręczny ostrzegacz.</p>`)}
${galeria(["czujka-dymu-ssp", "czujka-dymu-adres", "czujka-ciepla", "czujka-wielosensorowa", "czujka-autonomiczna", "czujka-czadu"])}
<h3>Czujki SSP i czujki autonomiczne</h3>
${tab(["Urządzenie", "Jak wygląda", "Gdzie najczęściej"], [
    ["Czujka dymu optyczna (punktowa)", "biały krążek ok. 10 cm wkręcony w gniazdo przykręcone do sufitu; dookoła szczeliny (dym musi wejść do komory); mała dioda - w alarmie świeci na czerwono", "biura, korytarze, pokoje hotelowe w obiektach z SSP"],
    ["Czujka dymu jonizacyjna", "podobna do optycznej; często naklejka z symbolem promieniowania (w środku izotop ameryk-241); dziś wycofywana", "starsze instalacje"],
    ["Czujka ciepła", "krążek z mniejszą liczbą szczelin, w środku widać mały czujnik temperatury osłonięty kratką", "kuchnie, kotłownie, garaże, pralnie - tam, gdzie para i spaliny dawałyby fałszywe alarmy czujce dymu"],
    ["Czujka wielosensorowa", "wygląda jak dymu, ale ma też widoczny czujnik temperatury - łapie dym i ciepło", "tam, gdzie trzeba ograniczyć fałszywe alarmy"],
    ["Czujka autonomiczna dymu", "nieco większy krążek, <b>bez kabla</b>, z dużym przyciskiem TEST; gdy kończy się bateria, krótko piszczy co kilkadziesiąt sekund", "mieszkania, pokoje w pensjonatach"],
    ["Czujka czadu (CO)", "zwykle na ścianie albo wtyczka do gniazdka, napis CO, czasem wyświetlacz", "przy piecu, kominku, piecyku gazowym - wysokość podaje instrukcja producenta"],
  ])}
${galeria(["czujka-plomienia", "czujka-plomienia2", "czujka-liniowa", "czujka-zasysajaca"])}
<h3>Czujki w halach i magazynach</h3>
${tab(["Urządzenie", "Jak wygląda", "Gdzie najczęściej"], [
    ["Czujka płomienia (podczerwień IR lub nadfiolet UV)", "skrzynka na ścianie lub pod dachem, skierowana skośnie w dół; z przodu szybka, za nią „oko” czujnika", "magazyny cieczy palnych, lakiernie, hangary - tam, gdzie od razu pojawia się płomień bez dymu (pyt. 555)"],
    ["Czujka liniowa dymu", "na jednej ścianie nadajnik z odbiornikiem, na przeciwległej odbłyśnik (płytka z pryzmatami) albo osobny odbiornik; między nimi niewidoczna wiązka pod dachem", "wysokie hale, atria, kościoły (pyt. 82: „liniowa dymu”)"],
    ["Czujka zasysająca", "cienkie rury pod sufitem z małymi otworami, prowadzące do skrzynki na ścianie; skrzynka zasysa powietrze i bada je", "serwerownie, chłodnie, magazyny wysokiego składowania, zabytki (otwory prawie niewidoczne)"],
    ["Czujka liniowa ciepła", "kabel sensoryczny wzdłuż rur lub tras kablowych", "tunele kablowe, taśmociągi, parkingi"],
  ])}
<h3>Rzeczy, które łatwo pomylić z czujką</h3>
${galeria(["tryskacz", "rop"])}
${tab(["Co to jest", "Jak odróżnić"], [
    ["Tryskacz", "metalowa końcówka rury z małą <b>kolorową szklaną ampułką</b>; otwiera się sam od temperatury, SSP go nie uruchamia (pyt. 63, 281). Kolor = temperatura: pomarańczowy 57 °C, czerwony 68 °C, żółty 79 °C, zielony 93 °C, niebieski 141 °C, fioletowy 182 °C, czarny 204-260 °C"],
    ["Zraszacz", "podobny do tryskacza, ale <b>bez ampułki</b> - jest zawsze otwarty, woda płynie po otwarciu zaworu"],
    ["Głośnik DSO", "większa okrągła kratka, płaska w suficie; nadaje komunikat „Uwaga, ogłaszamy ewakuację…”"],
    ["Czujka ruchu (alarm włamaniowy)", "w <b>narożniku ściany</b>, z mlecznym okienkiem, skierowana w pomieszczenie - to nie jest urządzenie ppoż."],
    ["Ręczny ostrzegacz pożarowy (ROP)", "<b>czerwona</b> kwadratowa skrzynka na ścianie, zwykle przy wyjściach i na klatkach (pyt. 556)"],
    ["Przycisk awaryjnego otwarcia drzwi", "<b>zielona</b> skrzynka przy drzwiach z kontrolą dostępu - otwiera drzwi, nie alarmuje straży"],
    ["Przycisk PWP (przeciwpożarowy wyłącznik prądu)", "czerwony przycisk z opisem, zwykle przy głównym wejściu (pyt. 279)"],
  ])}
<h3>Na co patrzysz przy obchodzie</h3>
<ul><li>Czy czujka nie jest <b>zaklejona</b> folią lub kapturkiem po remoncie albo malowaniu - to częsty błąd.</li><li>Czy nie jest zamalowana i czy szczeliny nie są zatkane kurzem.</li><li>Czy w pokoju z nowym sufitem podwieszanym czujka nie została nad sufitem.</li><li>Czy przy czujce SSP jest naklejka z numerem lub adresem, a w obiekcie leży protokół przeglądu nie starszy niż rok (§ 3 ust. 3 rozp. 2010).</li><li>Czy tryskacze nie są pomalowane i czy towar nie stoi tuż pod nimi.</li><li>Czujka autonomiczna: naciśnij TEST (za zgodą właściciela) i sprawdź datę ważności na spodzie - zwykle do wymiany po ok. 10 latach.</li></ul>
${wyklad(`<p>Proszę Państwa, czujkę dobiera się do tego, <b>jak zaczyna się pożar</b> w danym miejscu i <b>co może dać fałszywy alarm</b>. W biurze pożar zaczyna się od tlenia i dymu, więc czujka dymu. W kuchni para z garnków co chwilę włączałaby alarm, więc czujka ciepła. W magazynie benzyny pożar od razu daje płomień bez fazy dymienia, więc czujka płomienia. W hali na 15 metrów dym rozrzedza się, zanim dojdzie do sufitu, więc czujka liniowa albo zasysająca, która „łapie” dym niżej albo w wielu punktach.</p>
<p>Na obchodzie nie musicie umieć zaprojektować SSP. Musicie umieć zauważyć, że coś jest nie tak: czujka zaklejona, zamalowana, schowana nad nowym sufitem podwieszanym, czujka dymu w kuchni, która „ciągle wyje” i dlatego ktoś ją odłączył. Każda wyłączona czujka to dziura w systemie i warto zapytać, od kiedy jest wyłączona i kto o tym wie.</p>`)}
${przyklad("hotel po remoncie", `<ol><li>W korytarzu zrobiono nowy sufit podwieszany 30 cm niżej. Czujki zostały nad nim, w przestrzeni między stropem a sufitem.</li><li>Dym z korytarza zatrzyma się pod nowym sufitem i do czujek nie dotrze, więc korytarz jest bez ochrony.</li><li>Do tego dochodzi przestrzeń nad sufitem: tam biegną kable. Czy według projektu też ma być chroniona, sprawdza projektant SSP.</li><li>Zalecenie: przegląd i dostosowanie instalacji SSP przez firmę z uprawnieniami, z protokołem. Do tego czasu właściciel powinien wiedzieć, że korytarz nie jest chroniony.</li></ol>`)}
${wlasciciel(`<p>„Ta czujka w korytarzu ma jeszcze kapturek ochronny po malowaniu. Dla systemu jej nie ma: dym przejdzie obok, a centrala nic nie zobaczy. Proszę zdjąć kapturek dziś, a firmę od przeglądów poprosić o sprawdzenie całej linii.”</p>`)}
${pulapki([
    "Czujka optyczna punktowa działa na zasadzie <b>odbicia (rozproszenia) światła</b> od cząstek dymu (pyt. 133). Liniowa działa odwrotnie: dym <b>pochłania</b> wiązkę.",
    "Jonizacyjna to czujka <b>dymu</b> (pyt. 528, 648), nie płomienia.",
    "Czujka płomienia reaguje na <b>wybrany fragment widma</b> promieniowania (pyt. 285).",
    "<b>Różniczkowa</b> reaguje na szybki wzrost temperatury, <b>nadmiarowa</b> na przekroczenie progu (pyt. 83). „Różnicowa” to podpucha.",
    "Miejsce powstania pożaru wskazuje <b>czujka</b>, nie centrala (pyt. 58).",
    "Czujka dymu i ciepła w jednej obudowie to czujka <b>wielosensorowa</b> (pyt. 90).",
  ])}`),
  },
  {
    id: "normy", skrot: "PN", tytul: "Normy - polskie, europejskie, amerykańskie i rozwiązania zamienne rzeczoznawcy",
    html: () => nbsp(`
${ludzku(`<p><b>Przepis</b> (ustawa, rozporządzenie) mówi, CO trzeba osiągnąć, i jest obowiązkowy. <b>Norma</b> to techniczna instrukcja, JAK to zrobić dobrze: jak zbadać drzwi, jak zaprojektować tryskacze, jak przeglądać gaśnicę. Polska Norma sama z siebie jest <b>dobrowolna</b>. Obowiązkowa staje się wtedy, gdy przepis ją przywołuje. Trzeba wtedy zrobić tak, jak w niej napisano.</p>`)}
<h3>Kiedy norma jest dobrowolna, a kiedy obowiązkowa</h3>
${tab(["Zasada", "Podstawa"], [
    ["Stosowanie Polskich Norm jest dobrowolne", `art. 5 ust. 3 <a target="_blank" rel="noopener" href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20150001483">ustawy o normalizacji</a>`],
    ["Przepisy mogą powoływać Polskie Normy (po polsku) - wtedy trzeba je stosować", "art. 5 ust. 4 ustawy o normalizacji"],
    ["Wykaz norm powołanych w warunkach technicznych jest w załączniku nr 1 do WT (np. PN-B-02852 - obciążenie ogniowe)", "§ 9 ust. 5 WT"],
    ["Przeglądy urządzeń ppoż. i gaśnic - według Polskich Norm, dokumentacji techniczno-ruchowej i instrukcji producenta, co najmniej raz w roku", "§ 3 ust. 2-3 rozp. 2010"],
    ["Węże hydrantów wewnętrznych - próba ciśnieniowa raz na 5 lat według Polskiej Normy", "§ 3 ust. 4 rozp. 2010"],
    ["Czujki autonomiczne - zgodne z Polską Normą", "§ 28a rozp. 2010"],
  ])}
<h3>Skąd pochodzą normy - jak czytać oznaczenie</h3>
${tab(["Oznaczenie", "Co to znaczy", "Przykład z ppoż."], [
    ["PN-B-…, PN-N-…", "czysto polska norma", "PN-B-02852 (obciążenie ogniowe), PN-N-01256 (dawne znaki)"],
    ["PN-EN …", "norma europejska przyjęta w Polsce - ta sama w całej UE", "PN-EN 3 (gaśnice), PN-EN 671 (hydranty wewnętrzne), PN-EN 12845 (tryskacze), PN-EN 54 (SSP), PN-EN 13501 (klasyfikacja ogniowa), PN-EN 14604 (czujki autonomiczne dymu), PN-EN 60079 (strefy Ex)"],
    ["PN-EN ISO …, PN-ISO …", "norma światowa (ISO) przyjęta w Polsce", "PN-EN ISO 7010 (znaki bezpieczeństwa)"],
    ["PKN-CEN/TS …", "specyfikacja techniczna - wytyczne, nie pełna norma", "PKN-CEN/TS 54-14 (projektowanie i przeglądy SSP)"],
    ["N SEP-E-…", "norma branżowa Stowarzyszenia Elektryków Polskich, nie Polska Norma", "N SEP-E-005 (przeciwpożarowy wyłącznik prądu)"],
    ["NFPA, FM Global (USA), VdS (Niemcy), BS (Wielka Brytania)", "normy i wytyczne zagraniczne - w Polsce nie są obowiązkowe", "NFPA 13 (tryskacze), NFPA 92 (oddymianie), VdS CEA 4001 (tryskacze), BS 7974 (inżynieria bezpieczeństwa pożarowego), wytyczne FM Global dla magazynów"],
  ])}
<h3>Dlaczego rzeczoznawca sięga po normy z USA czy Wielkiej Brytanii</h3>
<p>Polskie przepisy są <b>nakazowe</b>: podają gotowe liczby, np. „dojście do 40 m”, „ściana EI 60”, „korytarz co najmniej 1,4 m”. Kiedy budynek nie spełnia którejś liczby, prawo pozwala zastosować <b>rozwiązanie zamienne</b>. Trzeba jednak wykazać, że ludzie będą równie bezpieczni. Polskie przepisy nie mówią, jak to policzyć. Robi się to metodami <b>inżynierii bezpieczeństwa pożarowego</b>: oblicza się, ile czasu ludzie mają na ucieczkę (ASET) i ile czasu ucieczka zajmie (RSET), robi się symulacje dymu i ewakuacji. Te metody opisują właśnie normy i wytyczne zagraniczne: amerykańskie NFPA, brytyjskie BS, niemieckie VdS. Rzeczoznawca opiera na nich swoją ekspertyzę.</p>
${rys(SVG_ZAMIENNE, "Rysunek: droga rozwiązania zamiennego - od niespełnionego wymagania do postanowienia komendanta wojewódzkiego PSP.")}
<h3>Jak to wygląda formalnie</h3>
${tab(["Krok", "Kto", "Podstawa"], [
    ["1. Budynek nie spełnia wymagania (np. za długie dojście, za mała odporność ogniowa stropu)", "projektant, właściciel, inspektor przy obchodzie", "-"],
    ["2. Ekspertyza techniczna: co zamiast i dlaczego to wystarczy (np. tryskacze, oddymianie, dodatkowe drzwi dymoszczelne, SSP)", "rzeczoznawca do spraw zabezpieczeń przeciwpożarowych", "art. 6a ust. 2 ustawy o ochronie ppoż."],
    ["3. Rozwiązanie zamienne musi: ograniczać powstanie pożaru, zachować nośność konstrukcji, ograniczać rozprzestrzenianie ognia i dymu w budynku i na sąsiadów, zapewnić ewakuację, uwzględnić bezpieczeństwo ratowników", "rzeczoznawca wykazuje w ekspertyzie", "art. 6a ust. 1 pkt 1-5 ustawy o ochronie ppoż."],
    ["4. Postanowienie: zgoda, zgoda z dodatkowymi warunkami albo odmowa; przysługuje zażalenie", "<b>komendant wojewódzki</b> PSP", "art. 6a ust. 2 ustawy o ochronie ppoż."],
    ["5a. Budynek istniejący (przebudowa, zmiana użytkowania, usuwanie zagrożenia życia) - wystarczy postanowienie komendanta", "-", "art. 9 ust. 6 PB; § 2 ust. 2 i 3a WT"],
    ["5b. Nowy budynek - dodatkowo zgoda na odstępstwo od organu architektoniczno-budowlanego po upoważnieniu ministra", "starosta / wojewoda + minister", "art. 9 ust. 1-3 PB"],
    ["Wyjątek: w rozp. 2010 rozwiązania zamienne są możliwe tylko dla wybranych paragrafów (m.in. hydranty, woda, stałe urządzenia gaśnicze, SSP)", "rzeczoznawca + komendant wojewódzki", "§ 1 ust. 2 rozp. 2010"],
  ])}
<h3>Dobre zasady przy normach zagranicznych</h3>
<ul><li>Normę zagraniczną stosuje się <b>w całości i spójnie</b>, nie wybiera się z niej tylko tego, co pasuje. Komendant może odmówić, jeśli ekspertyza „żongluje” normami.</li><li>Norma zagraniczna nie zastępuje polskiego przepisu. Służy do wykazania, że rozwiązanie zamienne jest równie bezpieczne.</li><li>W magazynach wysokiego składowania często decyduje <b>ubezpieczyciel</b>: wymaga tryskaczy według FM Global albo VdS, nawet gdy polski przepis ich nie wymaga.</li></ul>
<h3>Co to oznacza dla Ciebie jako inspektora</h3>
<p>Ekspertyz i rozwiązań zamiennych <b>nie robisz</b>, to zadanie rzeczoznawcy. Musisz je jednak znać. Gdy obiekt ma postanowienie komendanta wojewódzkiego, wpisujesz je do IBP i przy obchodzie sprawdzasz, czy <b>zamiennik działa</b>. Jeśli tryskacze „zastępują” wymaganą odporność ogniową, a ich przegląd się przeterminował, budynek jest poniżej wymagań.</p>
<p><b>Ciekawostka:</b> normy są płatne i chronione jak utwory (art. 5 ust. 5 ustawy o normalizacji). Trybunał Sprawiedliwości UE w wyroku C-588/21 P z 5.03.2024 r. uznał, że normy zharmonizowane są częścią prawa UE i trzeba do nich zapewnić dostęp.</p>
${wyklad(`<p>Proszę Państwa, ludzie często mylą trzy rzeczy: przepis, normę i wytyczne. <b>Przepis</b> uchwala Sejm albo wydaje minister. Jest w Dzienniku Ustaw, za darmo, i trzeba go przestrzegać. <b>Polska Norma</b> wydaje Polski Komitet Normalizacyjny, jest płatna i dobrowolna, chyba że przepis ją powoła. <b>Wytyczne</b> (CNBOP, ITB, SITP, ubezpieczycieli) to dobre rady fachowców. Nie są obowiązkowe, ale pokazują, co branża uważa za dobrą praktykę.</p>
<p>W praktyce inspektora największe znaczenie mają normy powołane w przepisach. Gdy rozporządzenie mówi „przeglądy według Polskich Norm” (§ 3 ust. 2 rozp. 2010), to norma o przeglądach gaśnic czy hydrantów staje się dla właściciela obowiązkiem. Gdy WT każą liczyć obciążenie ogniowe, robi się to według PN-B-02852, bo jest powołana w załączniku do WT.</p>`)}
${przyklad("czy ten dokument jest obowiązkowy?", `${tab(["Dokument", "Obowiązkowy?", "Dlaczego"], [
    ["Rozporządzenie MSWiA o ochronie ppoż. budynków (2010)", "tak", "akt prawny w Dzienniku Ustaw"],
    ["PN-B-02852 (obciążenie ogniowe)", "tak, przy liczeniu Q do WT", "powołana w załączniku nr 1 do WT"],
    ["Norma o przeglądach gaśnic", "tak, w zakresie przeglądów", "§ 3 ust. 2 rozp. 2010 każe robić przeglądy według Polskich Norm"],
    ["PN-EN 12845 (tryskacze)", "dobrowolna, chyba że przywołana w projekcie uzgodnionym przez rzeczoznawcę", "art. 5 ust. 3 ustawy o normalizacji"],
    ["NFPA 13 (tryskacze, USA)", "nie", "norma zagraniczna; może być podstawą ekspertyzy"],
    ["Wytyczne CNBOP", "nie", "dobra praktyka, nie akt prawny"],
  ])}`)}
${wlasciciel(`<p>„Dojście w Pana hotelu ma 14 m, a przepis pozwala na 10 m. Nie musi Pan od razu burzyć ścian. Rzeczoznawca może zaproponować np. oddymianie korytarza i drzwi dymoszczelne, a komendant wojewódzki straży to zatwierdzi postanowieniem. Od tej chwili te urządzenia muszą być sprawne zawsze, bo to one „wydłużają” Pana korytarz.”</p>`)}
${pulapki([
    "Zgodę na rozwiązania zamienne wydaje komendant <b>wojewódzki</b> PSP (nie powiatowy) w formie <b>postanowienia</b>, na wniosek z <b>ekspertyzą</b> rzeczoznawcy.",
    "Przeglądy urządzeń i gaśnic: według Polskich Norm <b>oraz</b> dokumentacji techniczno-ruchowej <b>oraz</b> instrukcji producenta (pyt. 316 - odpowiedź z wszystkimi trzema).",
    "Węże hydrantów: próba ciśnieniowa <b>raz na 5 lat</b> według Polskiej Normy (pyt. 11).",
    "Badanie stopnia rozprzestrzeniania ognia - według <b>Polskich Norm</b> (pyt. 389).",
    "PN-EN ISO 7010 zastąpiła <b>PN-N-01256-1</b> (pyt. 76).",
    "Polska Norma jest dobrowolna, dopóki nie powoła jej przepis.",
  ])}`),
  },
  {
    id: "ladowanie", skrot: "Li-ion", tytul: "Ładowarki, przedłużacze, powerbanki i baterie - pożary w domu i firmie",
    html: () => nbsp(`
${ludzku(`<p>Akumulator litowo-jonowy (telefon, powerbank, hulajnoga, rower elektryczny, wkrętarka) to dużo energii w małej puszce. Gdy jest uszkodzony, przegrzany albo źle ładowany, może wejść w <b>niekontrolowany wzrost temperatury</b> (po angielsku „thermal runaway”). Ogniwo samo się nagrzewa, wydziela palne i trujące gazy i zapala sąsiednie ogniwa. Pali się jak raca, czasem z wybuchem, i potrafi zapalić się ponownie po kilku godzinach. <b>Przedłużacz zwinięty w kłębek</b> to inny problem. Prąd zawsze grzeje przewód. Rozwinięty przewód oddaje ciepło do powietrza, a zwinięty grzeje sam siebie, aż topi się izolacja i dochodzi do zwarcia.</p>`)}
${galeria(["beben-przedluzacza", "bateria-spuchnieta"])}
<h3>Co mówią przepisy</h3>
<p>Nie ma osobnego przepisu o ładowaniu telefonu czy powerbanku. Inspektor korzysta z ogólnych zakazów:</p>
${tab(["Zakaz lub wymaganie", "Przykład", "Podstawa"], [
    ["Nie wolno używać urządzeń niesprawnych albo niezgodnie z warunkami producenta, jeśli może to wywołać pożar", "spuchnięty powerbank w użyciu; bęben przedłużacza zwinięty przy grzejniku, choć producent każe go rozwinąć", "§ 4 ust. 1 pkt 2 rozp. 2010"],
    ["Elektryczne urządzenia grzewcze nie mogą stać bezpośrednio na podłożu palnym (chyba że producent na to pozwala)", "farelka na wykładzinie", "§ 4 ust. 1 pkt 7 rozp. 2010"],
    ["Gniazd, wyłączników i lamp nie montuje się bezpośrednio na podłożu palnym, jeśli ich konstrukcja go nie chroni", "listwa przykręcona do sklejki pod biurkiem", "§ 4 ust. 1 pkt 10 rozp. 2010"],
    ["Nie wolno zwężać drogi ewakuacyjnej przedmiotami", "hulajnogi i rowery elektryczne ładowane na klatce schodowej", "§ 4 ust. 1 pkt 11 rozp. 2010"],
    ["Stacje ładowania samochodów: zakaz używania przedłużaczy przewodu ładowania", "auto ładowane przez przedłużacz z bębna", "§ 10 rozp. 2019 (dotyczy stacji i punktów objętych tym rozporządzeniem; w domu to też dobra zasada)"],
    ["Pojazd w pomieszczeniu do tego nieprzeznaczonym - tylko z pustym zbiornikiem i odłączonym akumulatorem", "motorower w piwnicy (pyt. 461)", "§ 4 ust. 1 pkt 3 rozp. 2010"],
  ])}
<h3>Bezpieczne ładowanie - zasady dla domu i firmy</h3>
${tab(["Zasada", "Dlaczego"], [
    ["Ładuj na twardym, niepalnym podłożu (blat, płytki), nigdy na łóżku, kanapie ani pod poduszką", "ciepło nie ma ujścia, a pościel zapali się od pierwszej iskry"],
    ["Nie zostawiaj ładowania hulajnogi, roweru elektrycznego czy powerbanku na noc ani po wyjściu z domu", "pożar baterii rozwija się w kilka minut"],
    ["Używaj oryginalnej albo markowej ładowarki z oznaczeniem CE; nie kupuj najtańszych zamienników", "tanie ładowarki często nie mają zabezpieczeń przed przeładowaniem i przegrzaniem"],
    ["Spuchnięta bateria (wybrzuszona obudowa, odklejający się ekran) - natychmiast przestań używać i ładować; nie przebijaj, nie zgniataj", "to pierwszy objaw rozkładu ogniwa"],
    ["Nie zostawiaj telefonu ani powerbanku w nagrzanym aucie, na kaloryferze, w pełnym słońcu", "wysoka temperatura przyspiesza uszkodzenie ogniwa"],
    ["Hulajnogi i rowery elektryczne ładuj w wyznaczonym miejscu, poza drogą ucieczki, w pomieszczeniu z czujką dymu", "płonąca bateria na korytarzu odcina jedyne wyjście"],
    ["Zużyte baterie i powerbanki oddawaj do pojemnika w sklepie albo do punktu selektywnej zbiórki (PSZOK), nigdy do śmieci; bieguny baterii litowych i 9 V zaklej taśmą", "zgniecione w śmieciarce lub sortowni zapalają się - to częsta przyczyna pożarów składowisk"],
  ])}
<h3>Przedłużacze i listwy</h3>
<ul><li>Na bębnie przedłużacza producent zwykle podaje <b>dwie moce</b>: dla przewodu zwiniętego (mniejszą) i rozwiniętego (większą). Przy czajniku, grzejniku czy odkurzaczu rozwiń bęben do końca.</li><li>Nie łącz przedłużaczy i listew jedna w drugą.</li><li>Nie podłączaj grzejnika ani czajnika do listwy, tylko bezpośrednio do gniazdka w ścianie.</li><li>Nie prowadź przewodu pod dywanem ani nie przytrzaskuj go drzwiami.</li><li>Ciepła wtyczka, zapach topionego plastiku albo przebarwione gniazdo to sygnał, żeby od razu wyłączyć i wymienić.</li></ul>
<h3>Ile energii jest w powerbanku - prosty rachunek</h3>
<p>Energia (Wh) = pojemność (Ah) × napięcie (V). Powerbank 20 000 mAh = 20 Ah × 3,7 V ≈ <b>74 Wh</b>. Dlatego linie lotnicze każą przewozić powerbanki tylko w bagażu podręcznym, gdzie załoga może zareagować na pożar. Zwykle bez zgody przewoźnika można zabrać powerbanki do 100 Wh.</p>
<h3>Gdy bateria się zapali</h3>
<ul><li>Nie dotykaj jej gołymi rękami. Dym jest trujący, więc wyprowadź ludzi, zamknij drzwi do pomieszczenia i dzwoń pod 112.</li><li>Mały przedmiot (telefon, powerbank) można schłodzić <b>dużą ilością wody</b>. Gaśnica proszkowa zgasi płomień, ale nie schłodzi ogniwa, więc może się ono zapalić ponownie.</li><li>Po ugaszeniu nie zostawiaj takiej baterii w mieszkaniu. Może zapalić się ponownie po kilku godzinach.</li></ul>
${wyklad(`<p>Proszę Państwa, typowe przyczyny pożaru mieszkania znacie: papieros, świeczka, zostawiona patelnia. Do tej listy doszło ładowanie akumulatorów. W każdym domu leży dziś kilka akumulatorów litowych: telefony, laptop, powerbanki, hulajnoga, rower, odkurzacz, wkrętarka. Każdy z nich to mała, szczelnie zamknięta porcja energii.</p>
<p>Taki pożar ma trzy cechy, które musicie znać. <b>Zaczyna się nagle</b>, często bez żadnego ostrzeżenia, czasem kilka godzin po tym, jak urządzenie spadło albo zostało zgniecione. <b>Rozwija się bardzo szybko</b> i daje gęsty, trujący dym. <b>Trudno go ugasić na stałe</b>, bo ogniwa grzeją się od środka i zapalają ponownie. Dlatego najważniejsza jest profilaktyka: gdzie i jak się ładuje.</p>`)}
${przyklad("biuro rachunkowe w Zawierciu - przegląd stanowisk", `${tab(["Co widzisz", "Ocena", "Co zalecić"], [
    ["Listwa z 6 gniazdami pod biurkiem, w niej czajnik i grzejnik", "przeciążenie listwy, grzejnik i czajnik pobierają dużo mocy", "czajnik i grzejnik do gniazdek w ścianie"],
    ["Listwa wpięta w drugą listwę", "łączenie przedłużaczy szeregowo", "jedna listwa na jedno gniazdo"],
    ["Przewód przytrzaśnięty drzwiami szafy", "uszkodzenie izolacji, ryzyko zwarcia", "przełożyć, wymienić uszkodzony"],
    ["Powerbank ładowany na stercie papierów", "ładowanie na podłożu palnym", "ładować na blacie, z dala od papieru"],
    ["Farelka na wykładzinie", "§ 4 ust. 1 pkt 7 rozp. 2010 - chyba że producent pozwala", "sprawdzić instrukcję; ustawić na podłożu niepalnym"],
  ])}`)}
${wlasciciel(`<p>„Pracownicy ładują hulajnogi na korytarzu przy wyjściu. Jeśli jedna bateria się zapali, dym w kilka minut zablokuje jedyną drogę ucieczki z piętra. Proponuję wyznaczyć miejsce ładowania w pomieszczeniu z czujką dymu, z gniazdem w ścianie zamiast przedłużacza, i wpisać tę zasadę do instrukcji bezpieczeństwa pożarowego.”</p>`)}
${pulapki([
    "Przy ładowaniu akumulatora <b>kwasowo-ołowiowego</b> (samochodowy, wózek widłowy) wydziela się <b>wodór</b> (pyt. 365). To dotyczy akumulatorowni, nie telefonów.",
    "Garażowanie pojazdu w pomieszczeniu nieprzeznaczonym (np. motorower w piwnicy) - dopuszczalne tylko z <b>opróżnionym zbiornikiem i odłączonym akumulatorem</b> (pyt. 461).",
    "Grzejnik elektryczny na podłożu palnym - zakazany, chyba że producent na to pozwala (§ 4 ust. 1 pkt 7 rozp. 2010).",
    "Przedłużacz przy stacji ładowania samochodu - zakazany (§ 10 rozp. 2019).",
  ])}`),
  },

  // Nowe tematy z 16.11.2026 (noc) - od razu w formacie wykładowym. Liczby z § 3, 32-33 rozp. 2010 i § 12-16 rozp. 2009.
  {
    id: "gasnice", skrot: "GAŚ", tytul: "Gaśnice - ile, jakie, gdzie i jak często przegląd",
    html: () => nbsp(`
${ludzku(`<p>Gaśnica to pierwsza pomoc przy pożarze: ma ugasić ogień, póki jest mały, w fazie I. Przepis mówi trzy rzeczy: <b>ile</b> środka gaśniczego na powierzchnię, <b>jaki rodzaj</b> do tego, co może się palić, i <b>gdzie</b> powiesić, żeby każdy dobiegł w kilka sekund.</p>`)}
${galeria(["gasnica-pl", "gasnica-pl2", "gasnica-proszkowa", "gasnica-co2"])}
${wyklad(`<p>Proszę Państwa, gaśnice liczy się nie w sztukach, tylko w <b>jednostkach środka gaśniczego</b>. Jedna jednostka to 2 kg proszku albo innego środka, albo 3 litry, jeśli środek jest płynny (§ 32 ust. 3 rozp. 2010). Gaśnica proszkowa 6 kg to trzy jednostki, gaśnica 2 kg to jedna.</p>
<p>Ile jednostek? Zależy od tego, jak groźna jest strefa. W strefach dla ludzi (ZL I, II, III, V), w PM z gęstością obciążenia ogniowego ponad 500 MJ/m² i w strefach z pomieszczeniem zagrożonym wybuchem - jedna jednostka na każde <b>100 m²</b>. W pozostałych strefach - na każde <b>300 m²</b>. Mieszkania (ZL IV) są wyłączone. Strefa chroniona stałym urządzeniem gaśniczym, np. tryskaczami, do wyliczenia na 100 m² nie wchodzi.</p>
<p>Ale uwaga: sama liczba kilogramów to nie wszystko. Drugi warunek to <b>30 metrów</b>. Z każdego miejsca, gdzie może być człowiek, do najbliższej gaśnicy ma być najwyżej 30 m (§ 33 ust. 2 rozp. 2010). W długiej hali często to odległość, a nie kilogramy, decyduje o liczbie gaśnic.</p>`)}
<h3>Grupy pożarów - jaką gaśnicą co gasić (§ 32 ust. 2 rozp. 2010)</h3>
${tab(["Grupa", "Co się pali", "Przykład", "Typowa gaśnica"], [
    ["A", "ciała stałe organiczne, spalające się z żarem", "drewno, papier, tekstylia, opony", "proszkowa ABC, wodno-pianowa"],
    ["B", "ciecze i topiące się ciała stałe", "benzyna, olej, lakiery, parafina, niektóre tworzywa", "proszkowa ABC lub BC, pianowa, śniegowa (CO₂)"],
    ["C", "gazy", "propan-butan, metan, acetylen", "proszkowa ABC lub BC - najpierw odciąć dopływ gazu"],
    ["D", "metale", "magnez, aluminium w wiórach, sód", "specjalna gaśnica z proszkiem do metali"],
    ["F", "tłuszcze i oleje w urządzeniach kuchennych", "frytownica, olej na patelni", "gaśnica do grupy F (płyn do tłuszczów); <b>nigdy woda</b>"],
  ])}
<p>Oznaczenia na gaśnicach: <b>GP-6 ABC</b> - gaśnica proszkowa, 6 kg proszku do grup A, B, C. <b>GS-5</b> - gaśnica śniegowa, 5 kg dwutlenku węgla. <b>GWP-6</b> - gaśnica wodno-pianowa, 6 litrów. Duże gaśnice na kółkach (np. 25 kg proszku) to gaśnice przewoźne.</p>
<h3>Gdzie wieszać (§ 33 rozp. 2010)</h3>
${tab(["Zasada", "Wartość"], [
    ["Miejsca", "łatwo dostępne i widoczne: przy wejściach do budynków, na klatkach schodowych, na korytarzach, przy wyjściach z pomieszczeń na zewnątrz"],
    ["Czego unikać", "miejsc narażonych na uszkodzenia i ciepło (piece, grzejniki)"],
    ["Budynek wielokondygnacyjny", "w tych samych miejscach na każdej kondygnacji, jeśli się da"],
    ["Odległość", "z każdego miejsca, gdzie może być człowiek, do najbliższej gaśnicy - najwyżej 30 m"],
    ["Dostęp", "wolne przejście co najmniej 1 m szerokości"],
    ["Przegląd i konserwacja", "według Polskich Norm, dokumentacji i instrukcji producenta, w okresach podanych przez producenta, ale co najmniej raz w roku (§ 3 ust. 2-3)"],
    ["Oznakowanie", "znakiem zgodnym z Polską Normą - właściciel oznakowuje miejsca usytuowania gaśnic (§ 4 ust. 2 pkt 4 lit. b rozp. 2010)"],
    ["Sprawność", "gaśnice w stanie pełnej sprawności technicznej (§ 4 ust. 2 pkt 1 rozp. 2010)"],
  ])}
${przyklad("biuro rachunkowe 450 m²", `<ol><li>Biuro to ZL III, więc jedna jednostka (2 kg) na każde 100 m².</li><li>450 : 100 = 4,5 → zaokrąglamy w górę: <b>5 jednostek = 10 kg środka</b>.</li><li>Dwie gaśnice GP-6 dają 12 kg - kilogramów wystarczy.</li><li>Ale biuro ma kształt litery L i od najdalszego pokoju do gaśnicy przy wejściu jest 38 m. Trzeba <b>trzeciej gaśnicy</b> w drugim skrzydle, żeby spełnić warunek 30 m.</li><li>Wniosek: kilogramy mówią „co najmniej”, a odległość mówi „gdzie”.</li></ol>`)}
${przyklad("hala magazynowa 2400 m², Q = 1500 MJ/m²", `<ol><li>PM z Q ponad 500 → jedna jednostka na każde 100 m².</li><li>2400 : 100 = <b>24 jednostki = 48 kg środka</b>.</li><li>Gaśnice GP-6 (6 kg): 48 : 6 = <b>8 gaśnic</b>.</li><li>Rozmieszczenie: przy każdym wyjściu i wzdłuż alejek tak, żeby z każdego miejsca było najwyżej 30 m. W hali 60 × 40 m przy 8 gaśnicach to zwykle wystarczy, ale trzeba to sprawdzić na planie.</li><li>Ta sama hala z Q = 300: jedna jednostka na każde 300 m² → 8 jednostek = 16 kg, czyli 3 gaśnice GP-6. O ich liczbie i tak zdecyduje warunek 30 m.</li></ol>`)}
${przyklad("restauracja z kuchnią", `<ol><li>Sala restauracji (ZL) - gaśnice proszkowe ABC według wyliczenia na 100 m².</li><li>Kuchnia z frytownicami - gaśnica do <b>grupy F</b> przy stanowisku smażenia. Proszek ABC nie ochłodzi rozgrzanego oleju, a woda wylana na płonący olej powoduje wybuchowy wyrzut ognia.</li><li>Rozdzielnia elektryczna - gaśnica śniegowa (CO₂) nie zostawia proszku w urządzeniach.</li></ol>`)}
${wlasciciel(`<p>„Gaśnicę mają Państwo schowaną w szafce pod zlewem, za koszem. W razie pożaru nikt jej tam nie znajdzie. Ma wisieć przy wyjściu, oznakowana znakiem, z wolnym dojściem metrowej szerokości.”</p>`)}
${wlasciciel(`<p>„Na naklejce przeglądu jest data sprzed dwóch lat. Przegląd gaśnic robi się co najmniej raz w roku. Gaśnica bez przeglądu może nie wyrzucić proszku, bo zbił się w grudę albo uszło ciśnienie. Proszę zamówić serwis dla wszystkich gaśnic naraz.”</p>`)}
${wlasciciel(`<p>„W kuchni wisi tylko gaśnica proszkowa. Na płonący olej we frytownicy potrzebna jest gaśnica do tłuszczów, oznaczona literą F. To jedna gaśnica, a może uratować całą restaurację.”</p>`)}
${pulapki([
    "Jednostka środka gaśniczego: <b>2 kg</b> albo <b>3 dm³</b>.",
    "Na <b>100 m²</b>: ZL I, II, III, V; PM z Q ponad 500; strefy z pomieszczeniem zagrożonym wybuchem. Na <b>300 m²</b>: pozostałe. ZL IV - bez wymogu.",
    "Do najbliższej gaśnicy najwyżej <b>30 m</b>; dostęp co najmniej <b>1 m</b>.",
    "Grupy pożarów: A (ciała stałe z żarem), B (ciecze i topiące się ciała stałe), C (gazy), D (metale), F (tłuszcze w kuchni). Grupy E nie ma.",
    "Przegląd gaśnic - co najmniej <b>raz w roku</b> (§ 3 ust. 3 rozp. 2010).",
    "Gaśnice w tych samych miejscach na każdej kondygnacji.",
    "Miejsce omłotów: dodatkowo pojemnik z wodą co najmniej <b>200 dm³</b> (§ 32 ust. 5).",
    "Gaśnice dla magazynów butli LPG i stacji paliw - według odrębnych przepisów o stacjach paliw (§ 32 ust. 4).",
  ])}`),
  },
  {
    id: "drogi-pozarowe", skrot: "DROGA", tytul: "Droga pożarowa - kiedy wymagana, jaka szeroka, jak daleko od budynku",
    html: () => nbsp(`
${ludzku(`<p>Droga pożarowa to utwardzony dojazd, po którym ciężki wóz strażacki i podnośnik dojadą do budynku o każdej porze roku, także w roztopy, i ustawią się tak, żeby sięgnąć elewacji. Nie każdy budynek jej potrzebuje, ale wszystkie duże i groźne - tak.</p>`)}
${galeria(["droga-pozarowa"])}
${wyklad(`<p>Proszę Państwa, wyobraźcie sobie podnośnik o masie kilkunastu ton, który ma stanąć przy budynku, rozłożyć podpory i wysunąć kosz na 25 metrów. Potrzebuje do tego twardego podłoża, które się nie zapadnie, równego terenu i miejsca: ani za blisko ściany, bo nie rozłoży wysięgnika i dostanie gruzem, ani za daleko, bo nie sięgnie okien. Stąd liczby z rozporządzenia: 5-15 m od budynku ZL, szerokość 4 m, nachylenie do 5%, nacisk osi 100 kN.</p>
<p>Druga rzecz to <b>przeszkody</b>. Między drogą a ścianą nie może być drzew, krzewów ani stałych elementów wyższych niż 3 m (§ 12 ust. 2 rozp. 2009). Pięknie rosnący żywopłot czy wiata śmietnikowa potrafią unieważnić całą drogę pożarową.</p>
<p>Trzecia: droga musi dawać <b>wyjazd</b>. Wóz nie może się zakopać w ślepej uliczce. Albo przejazd na wylot, albo plac 20 × 20 m do zawrócenia, albo krótki odcinek najwyżej 15 m, z którego wyjeżdża się tyłem.</p>`)}
<h3>Kiedy droga pożarowa jest wymagana (§ 12 ust. 1 rozp. 2009)</h3>
${tab(["Obiekt", "Warunek"], [
    ["budynek ze strefą ZL I lub ZL II", "zawsze"],
    ["budynek ZL III, ZL IV, ZL V", "gdy średniowysoki, wysoki lub wysokościowy"],
    ["budynek niski ze strefą ZL III", "gdy strefa ma ponad 1000 m² i obejmuje kondygnację inną niż pierwsza nadziemna"],
    ["budynek niski ze strefą ZL V", "gdy ma ponad 50 miejsc noclegowych"],
    ["strefa PM (także plac składowy, wiata, urządzenia na zewnątrz)", "Q ponad 500 MJ/m² i (strefa ponad 1000 m² albo pomieszczenie zagrożone wybuchem)"],
    ["strefa PM z Q poniżej 500 MJ/m²", "strefa ponad 20 000 m²"],
    ["obiekt niebędący budynkiem (UP, zamieszkanie zbiorowe)", "ponad 50 osób w strefie"],
    ["stanowisko czerpania wody do celów ppoż.", "zawsze"],
  ])}
<h3>Jaka ma być (§ 12-16 rozp. 2009)</h3>
${tab(["Wymaganie", "Wartość", "Przepis"], [
    ["Przebieg", "wzdłuż dłuższego boku budynku na całej długości; gdy krótszy bok ma ponad 60 m - z dwóch stron", "§ 12 ust. 2"],
    ["Odległość od ściany", "5-15 m dla ZL, 5-25 m dla pozostałych", "§ 12 ust. 2"],
    ["Przeszkody między drogą a ścianą", "nic wyższego niż 3 m (drzewa, krzewy, stałe elementy)", "§ 12 ust. 2"],
    ["Gdy nie da się poprowadzić wzdłuż boku", "dostęp do 30% obwodu (budynek do 60 m szerokości), 50% (ponad 60 m), 100% elewacji frontowej (zabudowa pierzejowa)", "§ 12 ust. 3"],
    ["Dojście od drogi do wyjść z budynku", "co najmniej 1,5 m szerokości, najwyżej 50 m długości", "§ 12 ust. 4"],
    ["Budynek do 3 kondygnacji i do 12 m", "zamiast drogi wzdłuż boku wystarczy utwardzone dojście 1,5 m, najwyżej 30 m", "§ 12 ust. 7"],
    ["Zawracanie", "przejazd bez cofania albo plac 20 × 20 m; ślepy odcinek z cofaniem najwyżej 15 m", "§ 12 ust. 9-10"],
    ["Łuk", "promień zewnętrzny co najmniej 11 m", "§ 12 ust. 11"],
    ["Szerokość przy budynku", "co najmniej 4 m, nachylenie do 5% (także 10 m przed i za tym odcinkiem)", "§ 13 ust. 1"],
    ["Szerokość dojazdowa i nacisk osi", "miasto i działki z PM: 3,5 m, 100 kN; pozostałe tereny: 3 m, 50 kN", "§ 13 ust. 2-3"],
    ["Przejazd przez budynek na dziedziniec", "wysokość 4,2 m (jednorodzinne 3,2 m), szerokość 3,6 m, jezdnia 3 m, przejazdy co najwyżej 150 m", "§ 14"],
    ["Wiadukty, kładki nad drogą", "prześwit co najmniej 4,5 m wysokości i szerokości", "§ 15"],
    ["Teren ponad 5 ha", "co najmniej dwa wjazdy, oddalone o co najmniej 75 m", "§ 16"],
  ])}
${przyklad("czy ten budynek potrzebuje drogi pożarowej?", `${tab(["Budynek", "Droga pożarowa?", "Dlaczego"], [
    ["Sklep spożywczy ZL I, parterowy, 400 m²", "<b>tak</b>", "ZL I zawsze"],
    ["Przedszkole parterowe", "<b>tak</b>", "ZL II zawsze"],
    ["Szkoła, 2 kondygnacje, strefa 2400 m²", "<b>tak</b>", "ZL III w budynku niskim, strefa ponad 1000 m² obejmuje piętro"],
    ["Biuro parterowe 1500 m²", "nie", "ZL III, strefa tylko na pierwszej kondygnacji"],
    ["Pensjonat 30 miejsc, budynek niski", "nie", "ZL V do 50 miejsc noclegowych"],
    ["Pensjonat 64 miejsca, budynek niski", "<b>tak</b>", "ZL V ponad 50 miejsc"],
    ["Blok mieszkalny 4 kondygnacje (N)", "nie", "ZL IV w budynku niskim"],
    ["Blok 10 kondygnacji (W)", "<b>tak</b>", "ZL IV w budynku wysokim"],
    ["Hala PM 1500 m², Q = 800", "<b>tak</b>", "Q ponad 500 i strefa ponad 1000 m²"],
    ["Hala PM 1500 m², Q = 300", "nie", "Q poniżej 500 i strefa do 20 000 m²"],
  ])}`)}
${przyklad("droga pożarowa do hali w Zawierciu", `<p>Hala PM 80 × 40 m, Q = 900 MJ/m². Projekt: droga wzdłuż dłuższego boku, 8 m od ściany, szerokość 4 m, na końcu ślepy odcinek 25 m bez placu.</p>
<ol><li>Wymagana: Q ponad 500, strefa 3200 m² → tak.</li><li>Krótszy bok 40 m, czyli nie ponad 60 m, więc wystarczy droga z jednej strony.</li><li>Odległość 8 m mieści się w 5-25 m dla PM. Szerokość 4 m - dobrze.</li><li>Ślepy odcinek 25 m to ponad 15 m, a brak placu 20 × 20 m. <b>Niezgodność</b> (§ 12 ust. 9-10) - trzeba placu manewrowego albo przejazdu na wylot.</li><li>Na planie zaznaczono też nasadzenia tui wzdłuż hali. Gdy urosną ponad 3 m, zablokują dostęp podnośnika do elewacji.</li></ol>`)}
${wlasciciel(`<p>„Na drodze pożarowej przy hali parkują ciężarówki czekające na rozładunek. Gdy przyjedzie straż, nie dojedzie do ściany. Proszę wyznaczyć parking gdzie indziej i oznakować drogę zakazem postoju.”</p>`)}
${wlasciciel(`<p>„Chce Pan posadzić wzdłuż hali szpaler drzew. Między drogą pożarową a ścianą nie może rosnąć nic wyższego niż 3 m, bo podnośnik nie sięgnie elewacji. Proszę posadzić drzewa po drugiej stronie drogi albo wybrać niskie krzewy.”</p>`)}
${wlasciciel(`<p>„Droga do hali jest z kostki, ale na końcu ma tylko 3 m szerokości i ostry zakręt. Wóz bojowy potrzebuje łuku o promieniu co najmniej 11 m. Zanim położy Pan nową kostkę, sprawdźmy na planie, czy wóz w ogóle tam zawróci.”</p>`)}
${pulapki([
    "Odległość drogi od ściany: <b>5-15 m</b> dla ZL, <b>5-25 m</b> dla pozostałych.",
    "Szerokość przy budynku <b>4 m</b>, nachylenie do <b>5%</b>; dojazd: 3,5 m (miasto, PM) lub 3 m.",
    "Nacisk osi: <b>100 kN</b> w mieście i przy PM, <b>50 kN</b> na innych terenach.",
    "Plac manewrowy <b>20 × 20 m</b>; ślepy odcinek z cofaniem najwyżej <b>15 m</b>; łuk co najmniej <b>11 m</b>.",
    "Przeszkody między drogą a ścianą - najwyżej <b>3 m</b> wysokości.",
    "Dojście od drogi do wyjść: <b>1,5 m</b> szerokości, do <b>50 m</b> (dla małych budynków do 30 m).",
    "Przejazd przez budynek: <b>4,2 m</b> wysokości (jednorodzinne 3,2 m), <b>3,6 m</b> szerokości.",
    "Prześwit pod wiaduktem nad drogą pożarową: <b>4,5 m</b>.",
    "Teren ponad <b>5 ha</b>: dwa wjazdy co najmniej <b>75 m</b> od siebie.",
    "ZL I i ZL II - droga pożarowa <b>zawsze</b>, niezależnie od wysokości.",
  ])}`),
  },
  {
    id: "prace-niebezpieczne", skrot: "PNP", tytul: "Prace niebezpieczne pożarowo - spawanie, cięcie, szlifowanie",
    html: () => nbsp(`
${ludzku(`<p>Prace niebezpieczne pod względem pożarowym to wszystko, co daje płomień, iskry albo gorący metal w miejscu, gdzie są rzeczy palne: spawanie, cięcie palnikiem, szlifowanie szlifierką kątową, lutowanie, zgrzewanie papy palnikiem. Przepis mówi, co trzeba zrobić <b>przed</b>, <b>w trakcie</b> i <b>po</b> takich pracach (§ 36 rozp. 2010).</p>`)}
${galeria(["spawanie", "iskry-spawanie"])}
${wyklad(`<p>Proszę Państwa, wiele dużych pożarów hal, dachów i zabytków zaczęło się od prac remontowych. Scenariusz jest często ten sam. Ekipa spawa albo tnie przy dachu lub ścianie. Iskra wpada w szczelinę, w ocieplenie, za płytę, pod papę. Ekipa kończy o 15:00, zwija sprzęt i jedzie do domu. Iskra tli się w ociepleniu godzinę albo dwie, a wieczorem pali się cały dach.</p>
<p>Dlatego przepis kładzie taki nacisk na <b>kontrolę po zakończeniu prac</b> (§ 36 ust. 2 pkt 4). Nie wystarczy spojrzeć - trzeba wrócić i sprawdzić miejsce i okolicę jeszcze po jakimś czasie, dotknąć, popatrzeć w szczeliny, najlepiej z kamerą termowizyjną. Wiele firm pisze w swoich zasadach konkretny czas dozoru po pracach. Przepis go nie podaje, ale to dobra praktyka.</p>
<p>Drugi kluczowy punkt: <b>to właściciel obiektu odpowiada</b> za przygotowanie prac, nie tylko ekipa. To on ocenia zagrożenie, wskazuje osoby odpowiedzialne i zapoznaje wykonawców z zagrożeniami (§ 36 ust. 1). W praktyce robi się to pisemnym zezwoleniem na prace niebezpieczne pożarowo. Sposób zabezpieczania takich prac jest też obowiązkowym punktem instrukcji bezpieczeństwa pożarowego (§ 6 ust. 1 pkt 4 rozp. 2010).</p>`)}
<h3>Obowiązki krok po kroku (§ 36 rozp. 2010)</h3>
${tab(["Kiedy", "Co trzeba zrobić", "Przepis"], [
    ["PRZED", "ocenić zagrożenie pożarowe w miejscu prac", "§ 36 ust. 1 pkt 1"],
    ["PRZED", "ustalić środki, które nie dopuszczą do pożaru i wybuchu", "§ 36 ust. 1 pkt 2"],
    ["PRZED", "wskazać osoby odpowiedzialne za przygotowanie miejsca, przebieg i zabezpieczenie po pracy", "§ 36 ust. 1 pkt 3"],
    ["PRZED", "dopuścić tylko osoby upoważnione, z kwalifikacjami (np. uprawnienia spawacza)", "§ 36 ust. 1 pkt 4"],
    ["PRZED", "zaznajomić wykonawców z zagrożeniami w rejonie prac", "§ 36 ust. 1 pkt 5"],
    ["W TRAKCIE", "zabezpieczyć materiały palne w miejscu prac i w okolicy, także konstrukcję i instalacje", "§ 36 ust. 2 pkt 1"],
    ["W TRAKCIE", "w pomieszczeniach zagrożonych wybuchem albo po pracach z cieczami i gazami palnymi - tylko przy stężeniu do 10% DGW", "§ 36 ust. 2 pkt 2"],
    ["W TRAKCIE", "mieć na miejscu sprzęt do gaszenia", "§ 36 ust. 2 pkt 3"],
    ["W TRAKCIE", "używać tylko sprawnego sprzętu, zabezpieczonego przed wywołaniem pożaru", "§ 36 ust. 2 pkt 5"],
    ["PO", "skontrolować miejsce prac i rejony przyległe", "§ 36 ust. 2 pkt 4"],
  ])}
${przyklad("zezwolenie na spawanie w hali magazynowej", `<p>Ekipa ma przyspawać wspornik do słupa stalowego w hali z kartonami. Zezwolenie przygotowane przez właściciela (dobra praktyka, wzór do IBP):</p>
<ol><li><b>Miejsce i czas:</b> słup C-7, 18.11, godz. 8:00-12:00.</li><li><b>Ocena zagrożenia:</b> kartony na regale 2 m od słupa, wełna mineralna w ścianie obok (niepalna), brak strefy Ex.</li><li><b>Zabezpieczenie:</b> regał w promieniu ok. 10 m opróżniony albo osłonięty kocem lub plandeką niepalną; podłoga zamieciona; szczeliny w posadzce zakryte.</li><li><b>Sprzęt gaśniczy przy stanowisku:</b> 2 gaśnice GP-6 ABC, hydrant 52 w zasięgu.</li><li><b>Osoby:</b> wykonawca - spawacz z uprawnieniami; nadzór - kierownik magazynu; dozór po pracy - magazynier.</li><li><b>Po pracy:</b> kontrola miejsca i okolicy zaraz po zakończeniu i ponownie po pewnym czasie, wpis z godziną i podpisem.</li></ol>
<p>Promień 10 m i długość dozoru po pracy to <b>dobra praktyka</b>, a nie liczby z rozporządzenia. Przepis mówi ogólnie: zabezpieczyć materiały palne w miejscu prac i w rejonach przyległych.</p>`)}
${przyklad("zbiornik po oleju napędowym", `<ol><li>Rolnik chce przeciąć szlifierką stary zbiornik po oleju napędowym.</li><li>W „pustym” zbiorniku zostają pary. Szlifierka to źródło zapłonu.</li><li>Najpierw opróżnić, przewietrzyć albo przepłukać, a potem zmierzyć eksplozymetrem. Dopiero wynik do 10% DGW pozwala zacząć (§ 36 ust. 2 pkt 2 rozp. 2010).</li><li>Patrz też temat o DGW - zamknięty zbiornik bywa powyżej górnej granicy wybuchowości, a otwarcie przeprowadza mieszaninę przez zakres wybuchowy.</li></ol>`)}
${wlasciciel(`<p>„Ekipa dekarzy będzie zgrzewać papę palnikiem na Pana dachu. Proszę ustalić z nimi na piśmie: kto pilnuje gaśnicy przy palniku, kto sprawdza dach po skończonej pracy i po jakimś czasie jeszcze raz. Najwięcej pożarów dachów zaczyna się po wyjeździe ekipy, a nie w trakcie pracy.”</p>`)}
${wlasciciel(`<p>„Za przygotowanie prac spawalniczych odpowiada Pan jako właściciel, nawet jeśli spawa firma zewnętrzna. Dlatego zrobię Panu wzór zezwolenia na prace niebezpieczne pożarowo i wpiszę zasady do instrukcji bezpieczeństwa pożarowego. Każda ekipa podpisze, że je zna.”</p>`)}
${pulapki([
    "Prace niebezpieczne w pomieszczeniu zagrożonym wybuchem - tylko przy stężeniu do <b>10% DGW</b>.",
    "Przygotowanie prac to obowiązek <b>właściciela, zarządcy lub użytkownika</b> obiektu.",
    "Po pracach - <b>kontrola</b> miejsca prac i rejonów przyległych.",
    "Prace wykonują tylko osoby <b>upoważnione, z kwalifikacjami</b>.",
    "Sposoby zabezpieczania prac niebezpiecznych - obowiązkowy punkt IBP (§ 6 ust. 1 pkt 4).",
    "Na miejscu prac musi być <b>sprzęt do gaszenia</b>.",
  ])}`),
  },
  {
    id: "butle-lpg", skrot: "LPG", tytul: "Butle z gazem płynnym - w domu, w lokalu i w magazynie",
    html: () => nbsp(`
${ludzku(`<p>Gaz płynny (propan-butan, LPG) jest <b>cięższy od powietrza</b>. Gdy wycieknie, nie ulatuje do góry, tylko spływa w dół i zbiera się przy podłodze, w piwnicach, studzienkach i kanałach. Dlatego wszystkie przepisy o butlach kręcą się wokół jednego: żeby gaz nie miał gdzie się gromadzić i żeby nic nie dało mu iskry.</p>`)}
${wyklad(`<p>Proszę Państwa, butla 11 kg to nie zabawka. Z jej zawartości można zrobić ponad 200 m³ mieszaniny wybuchowej z powietrzem (rachunek jest w temacie o DGW). Kuchnia ma zwykle około 30 m³. Wystarczy niecałe 1,5 kg gazu, czyli mniej niż jedna siódma butli, żeby cała kuchnia była w zakresie wybuchowym, a przy podłodze stanie się to jeszcze szybciej.</p>
<p>Stąd trzy zakazy, które musicie znać na pamięć. <b>Nie w piwnicy</b>, bo gaz spłynie i zostanie. <b>Nie na strychu ani na nieużytkowym poddaszu</b>, bo tam nikt nie zauważy wycieku, a pożar dachu rozwija się szybko. I to dotyczy butli <b>pełnych, niepełnych i pustych</b> (§ 4 ust. 1 pkt 13 rozp. 2010). Pusta butla nie jest pusta: zostaje w niej faza gazowa.</p>`)}
<h3>Butla w mieszkaniu, warsztacie, lokalu (§ 177 WT)</h3>
${tab(["Wymaganie", "Wartość"], [
    ["Wielkość butli", "nominalnie do 11 kg gazu"],
    ["Ile butli", "najwyżej 2 w jednym mieszkaniu, warsztacie lub lokalu użytkowym"],
    ["Temperatura w pomieszczeniu", "niższa niż 35 °C"],
    ["Pozycja", "wyłącznie pionowo"],
    ["Odległość od urządzenia grzewczego (promieniującego ciepło)", "co najmniej 1,5 m"],
    ["Odległość od urządzeń iskrzących", "co najmniej 1 m"],
    ["Wąż do urządzenia", "elastyczny, najwyżej 3 m, wytrzymałość co najmniej 300 kPa"],
    ["Urządzenie ponad 10 kW", "między wężem a urządzeniem rura stalowa co najmniej 0,5 m"],
    ["Zakaz", "piwnice, strychy, nieużytkowe poddasza - butle pełne, niepełne i puste (§ 4 ust. 1 pkt 13 rozp. 2010)"],
  ])}
<h3>Magazyn butli - np. w hurtowni, na stacji, w sklepie (rozp. 2023/1707, rozdział 3)</h3>
${tab(["Wymaganie", "Wartość", "Przepis"], [
    ["Najwięcej gazu w butlach w pomieszczeniach", "5500 kg", "§ 79"],
    ["Gdzie składować", "utwardzone place otwarte, pod zadaszeniem albo w budynkach do tego przystosowanych", "§ 80 ust. 1"],
    ["Plac otwarty, butle luzem", "stosy co najmniej 1,5 m od siebie, do 5500 kg gazu w stosie", "§ 80 ust. 2"],
    ["Plac otwarty, butle w paletach lub ażurowych kontenerach", "stosy co najmniej 2,5 m od siebie, do 15 000 kg w stosie", "§ 80 ust. 3"],
    ["Składowisko", "nie poniżej terenu, bez studzienek i otworów do piwnic w pobliżu", "§ 80 ust. 4"],
    ["Magazyn", "parterowy, otwory wywiewne najwyżej 0,15 m nad podłogą (gaz spływa w dół)", "§ 81 ust. 1 pkt 1"],
    ["Gaśnice", "proszkowe 9 kg: 1 szt. do 440 kg gazu; 2 szt. od 441 do 5500 kg; +1 na każde 10 000 kg powyżej 5500 kg (zamiast 9 kg proszkowej - 2 śniegowe po 5 kg)", "§ 81 ust. 1 pkt 2, ust. 2"],
    ["Hydranty zewnętrzne (ponad 440 kg gazu)", "10 dm³/s do 25 000 kg; 20 dm³/s powyżej", "§ 81 ust. 3"],
    ["Pełne i puste", "ponad 1350 kg - składowane oddzielnie, w miejscach oznakowanych", "§ 77 ust. 2"],
    ["Odległość od budynków mieszkalnych, zamieszkania zbiorowego, użyteczności publicznej", "co najmniej 30 m", "§ 82 ust. 1"],
    ["Odległość od innych budynków i od krawędzi jezdni", "co najmniej połowa, czyli 15 m", "§ 82 ust. 2"],
  ])}
${przyklad("butla w domu jednorodzinnym", `<ol><li>Kuchenka gazowa zasilana z butli 11 kg w kuchni - dozwolone, jeśli butla stoi pionowo, 1,5 m od pieca i 1 m od kontaktów i lodówki.</li><li>Zapasowa butla trzymana w piwnicy - <b>zakazane</b> (§ 4 ust. 1 pkt 13 rozp. 2010).</li><li>Trzecia butla do grilla na tarasie - w lokalu wolno najwyżej dwie, trzecią trzymać na zewnątrz, w przewiewnym miejscu, nie przy studzience.</li><li>Wąż dłuższy niż 3 m albo popękany - do wymiany.</li></ol>`)}
${przyklad("sklep wiejski z wymianą butli", `<p>Sklep w gminie Żarki sprzedaje butle 11 kg. Na zapleczu trzyma 30 pełnych i 20 pustych butli.</p>
<ol><li>Gaz w pełnych butlach: 30 × 11 = <b>330 kg</b>. Puste butle nie zwiększają tej masy, ale mają w środku resztki gazu, więc obowiązują dla nich te same zakazy (piwnica, strych) i składa się je osobno od pełnych.</li><li>Do 440 kg: <b>1 gaśnica proszkowa 9 kg</b> w magazynie (§ 81 ust. 1 pkt 2 lit. a).</li><li>Magazyn parterowy, z otworami wywiewnymi przy podłodze (najwyżej 0,15 m) - zaplecze w piwnicy odpada.</li><li>Lepsze rozwiązanie: ażurowa klatka na butle na zewnątrz, na utwardzonym placu, z dala od studzienek i okienek piwnicznych.</li><li>Do 440 kg hydranty z § 81 ust. 3 nie są wymagane.</li></ol>`)}
${wlasciciel(`<p>„Puste butle w piwnicy też są zakazane. Każda „pusta” butla ma w środku gaz, który przy nieszczelnym zaworze spłynie po podłodze piwnicy. Proszę je przenieść do ażurowej klatki na zewnątrz.”</p>`)}
${wlasciciel(`<p>„Trzyma Pan na zapleczu 600 kg gazu w butlach. Według przepisu potrzebne są dwie gaśnice proszkowe po 9 kg, wentylacja przy podłodze i hydrant zewnętrzny o wydajności 10 litrów na sekundę. Jeśli tego nie ma, prościej ograniczyć zapas do 440 kg albo przenieść butle na zewnątrz.”</p>`)}
${pulapki([
    "Gaz płynny jest <b>cięższy od powietrza</b> - otwory wentylacyjne przy podłodze (do 0,15 m).",
    "Butle w lokalu: najwyżej <b>2 × 11 kg</b>, temperatura poniżej <b>35 °C</b>, pionowo, <b>1,5 m</b> od grzejnika, <b>1 m</b> od iskrzących urządzeń.",
    "Wąż do butli najwyżej <b>3 m</b>; urządzenie ponad 10 kW - rura stalowa co najmniej 0,5 m.",
    "Zakaz butli w piwnicach, na strychach i nieużytkowych poddaszach - <b>także pustych</b>.",
    "W pomieszczeniach najwyżej <b>5500 kg</b> gazu w butlach.",
    "Gaśnice w magazynie butli: <b>1 × 9 kg</b> do 440 kg gazu, <b>2 × 9 kg</b> od 441 do 5500 kg.",
    "Magazyn butli od budynków mieszkalnych i użyteczności publicznej - co najmniej <b>30 m</b>.",
  ])}`),
  },
  {
    id: "znaki-oswietlenie", skrot: "ZNAK", tytul: "Znaki bezpieczeństwa i oświetlenie awaryjne - co musi świecić, gdy zgaśnie prąd",
    html: () => nbsp(`
${ludzku(`<p>Gdy w budynku wybucha pożar, często pierwsze, co znika, to prąd i widoczność. Ludzie muszą wtedy znaleźć wyjście w ciemności i w dymie. Pomagają im w tym <b>znaki ewakuacyjne</b> (zielone, ze strzałką i biegnącym człowiekiem) i <b>oświetlenie awaryjne</b>, które samo się włącza, gdy zgaśnie zwykłe światło.</p>`)}
${galeria(["korytarz-wyjscie", "gasnica-pl"])}
${wyklad(`<p>Proszę Państwa, kolory znaków to język, który każdy rozumie bez czytania. <b>Zielony</b> - droga ucieczki i pierwsza pomoc: wyjście, strzałka, apteczka. <b>Czerwony</b> - sprzęt przeciwpożarowy: gaśnica, hydrant, ręczny ostrzegacz, przycisk wyłącznika prądu. <b>Żółty</b> - ostrzeżenie: strefa Ex, materiały łatwo palne. <b>Niebieski</b> - nakaz. Czerwone kółko z przekreśleniem - zakaz: palenia, otwartego ognia, gaszenia wodą. Znaki według normy PN-EN ISO 7010 (pyt. 76: zastąpiła ona PN-N-01256-1).</p>
<p>Oświetlenie awaryjne to dwie różne rzeczy. <b>Zapasowe</b> pozwala dalej pracować albo bezpiecznie skończyć pracę, np. na sali operacyjnej. <b>Ewakuacyjne</b> pozwala wyjść: oświetla drogę i znaki. Gdy jest wymagane, musi działać co najmniej <b>1 godzinę</b> od zaniku zwykłego światła (§ 181 ust. 5 WT).</p>
<p>Obowiązek oznakowania jest po stronie właściciela. Musi oznakować drogi i wyjścia ewakuacyjne (poza budynkami mieszkalnymi), pomieszczenia, które muszą mieć dwa wyjścia, miejsca gaśnic i urządzeń ppoż., elementy sterujące, kurki gazu, nasady do zasilania instalacji wodnej i materiały niebezpieczne pożarowo (§ 4 ust. 2 pkt 4 rozp. 2010). Musi też wywiesić instrukcję postępowania na wypadek pożaru z telefonami alarmowymi (§ 4 ust. 2 pkt 3).</p>`)}
<h3>Gdzie wymagane jest awaryjne oświetlenie ewakuacyjne (§ 181 ust. 3 WT)</h3>
${tab(["Gdzie", "Warunek"], [
    ["widownie kin, teatrów, filharmonii, inne sale widowiskowe", "zawsze"],
    ["audytoria, sale konferencyjne, czytelnie, lokale rozrywkowe, sale sportowe", "dla ponad 200 osób"],
    ["sale wystawowe w muzeach", "zawsze"],
    ["garaże oświetlone tylko sztucznie", "pomieszczenia ponad 1000 m² netto"],
    ["budynki użyteczności publicznej, zamieszkania zbiorowego, PM", "pomieszczenia ponad 2000 m² netto"],
    ["drogi ewakuacyjne z tych pomieszczeń", "zawsze"],
    ["drogi ewakuacyjne oświetlone tylko sztucznie (bez okien)", "zawsze"],
    ["drogi ewakuacyjne w szpitalach i budynkach dla osób o ograniczonej zdolności poruszania się", "zawsze"],
    ["drogi ewakuacyjne w budynkach wysokich i wysokościowych UP i ZZ", "zawsze"],
  ])}
<p>Czas działania: co najmniej <b>1 godzina</b> (§ 181 ust. 5). Wykonanie według Polskich Norm (§ 181 ust. 7), w praktyce PN-EN 1838 i PN-EN 50172.</p>
${przyklad("hotel na Jurze - co oznakować i oświetlić", `<ol><li>Korytarze między pokojami bez okien - droga ewakuacyjna oświetlona tylko sztucznie → <b>oświetlenie ewakuacyjne</b>.</li><li>Sala bankietowa na 150 osób - poniżej 200, więc sama sala nie musi go mieć z tego powodu, ale jeśli nie ma okien, droga z niej i tak jest „tylko sztucznie oświetlona”.</li><li>Znaki: kierunek ewakuacji na korytarzach (zielone), wyjście, gaśnice i hydranty (czerwone), przycisk przeciwpożarowego wyłącznika prądu, kurek gazu w kotłowni.</li><li>Instrukcja postępowania na wypadek pożaru z numerem 112 - w widocznym miejscu, np. na drzwiach pokoi i w recepcji.</li></ol>`)}
${przyklad("test oświetlenia awaryjnego", `<ol><li>Wyłącz zasilanie oświetlenia podstawowego na korytarzu (za zgodą właściciela, poza godzinami szczytu).</li><li>Sprawdź, czy oprawy awaryjne się zapaliły i czy znaki są podświetlone.</li><li>Odczekaj czas testu podany w dokumentacji - pełny test pokazuje, czy akumulatory wytrzymają godzinę.</li><li>Zapisz wynik w książce lub protokole. Oprawa, która gaśnie po 20 minutach, nie spełnia wymogu 1 godziny.</li></ol>`)}
${wlasciciel(`<p>„Strzałka nad drzwiami prowadzi do magazynu, który jest zamknięty na klucz. W dymie ludzie pójdą tam, gdzie pokazuje znak. Albo zmieniamy znak, albo otwieramy przejście - znak nie może prowadzić w ślepy zaułek.”</p>`)}
${wlasciciel(`<p>„Na korytarzu bez okien nie ma oświetlenia awaryjnego. Przy zaniku prądu w czasie pożaru będzie tam zupełna ciemność. Przepis wymaga, żeby takie oświetlenie działało co najmniej godzinę. To jedna z tańszych inwestycji, a ratuje najwięcej.”</p>`)}
${pulapki([
    "Oświetlenie ewakuacyjne działa co najmniej <b>1 godzinę</b>.",
    "Sale konferencyjne, sportowe, lokale rozrywkowe - oświetlenie ewakuacyjne dla ponad <b>200 osób</b>.",
    "Pomieszczenia ponad <b>2000 m²</b> (UP, ZZ, PM); garaże ponad <b>1000 m²</b>.",
    "Drogi ewakuacyjne <b>bez okien</b> - zawsze.",
    "Zapasowe = dalsza praca; ewakuacyjne = bezpieczne wyjście.",
    "Kolory: zielony - ewakuacja; czerwony - sprzęt ppoż.; żółty - ostrzeżenie; niebieski - nakaz.",
    "PN-EN ISO 7010 zastąpiła PN-N-01256-1 (pyt. 76).",
    "Budynki mieszkalne - bez obowiązku oznakowania dróg ewakuacyjnych z § 4 ust. 2 pkt 4 lit. a.",
  ])}`),
  },
  {
    id: "mandaty", skrot: "KARY", tytul: "Mandaty i odpowiedzialność - wykroczenia i przestępstwa przeciwpożarowe",
    html: () => nbsp(`
${ludzku(`<p>Za łamanie przepisów przeciwpożarowych grozi odpowiedzialność na trzech poziomach. <b>Wykroczenie</b> to mandat od strażaka przy kontroli albo grzywna z sądu. <b>Przestępstwo</b> to sprawa karna, gdy ktoś sprowadzi pożar albo niebezpieczeństwo pożaru dla wielu osób. Do tego dochodzi <b>decyzja administracyjna</b> komendanta PSP, która każe usunąć nieprawidłowości.</p>`)}
${wyklad(`<p>Proszę Państwa, na egzaminie i w życiu musicie rozróżniać dwie grupy wykroczeń z art. 82 Kodeksu wykroczeń. <b>Paragraf 1</b> to czyny każdego człowieka: palenie tam, gdzie nie wolno, spawanie bez zabezpieczenia, zastawianie dróg ewakuacyjnych, garażowanie motoroweru w piwnicy z paliwem w baku. Paragraf 2 dotyczy tego, <b>kto jest obowiązany</b> zapewnić ochronę przeciwpożarową obiektu, czyli właściciela, zarządcy, użytkownika, i nie robi tego: nie ma gaśnic, nie oznakował wyjść, nie czyści kominów.</p>
<p>Za te wykroczenia grozi kara aresztu, ograniczenia wolności albo grzywny. W postępowaniu mandatowym strażak upoważniony do kontroli może nałożyć grzywnę (art. 23 ust. 6 ustawy o PSP), a od 2026 r. za wykroczenia z art. 82 § 1-5 KW mandat może wynosić <b>do 5000 zł</b>, a przy zbiegu kilku wykroczeń więcej (art. 96 § 1ad KPSW).</p>
<p>Przestępstwo to inna liga. Kto sprowadza pożar zagrażający życiu lub zdrowiu wielu osób albo mieniu w wielkich rozmiarach - od roku do 10 lat więzienia, a nieumyślnie od 3 miesięcy do 5 lat (art. 163 KK). Samo <b>bezpośrednie niebezpieczeństwo</b> takiego pożaru - od 6 miesięcy do 8 lat, nieumyślnie do 3 lat (art. 164 KK). Dlatego właściciel, który świadomie trzyma zamknięte wyjścia w sali na 200 osób, ryzykuje dużo więcej niż mandat.</p>`)}
<h3>Art. 82 Kodeksu wykroczeń - najważniejsze punkty</h3>
${tab(["Paragraf", "Za co", "Przykład"], [
    ["§ 1 pkt 1", "niedozwolone używanie otwartego ognia, palenie tytoniu", "papieros w magazynie z tabliczką zakazu"],
    ["§ 1 pkt 2", "prace niebezpieczne pożarowo bez zabezpieczenia", "spawanie przy kartonach bez zezwolenia i gaśnicy"],
    ["§ 1 pkt 3", "niesprawne lub niekontrolowane instalacje i urządzenia, używanie niezgodne z instrukcją", "farelka z przetartym kablem"],
    ["§ 1 pkt 4", "napełnianie butli gazem w miejscach do tego nieprzeznaczonych", "przelewanie gazu na stacji do butli turystycznej"],
    ["§ 1 pkt 5", "nieprzestrzeganie zasad przy materiałach niebezpiecznych pożarowo, w tym butlach", "butle w piwnicy"],
    ["§ 1 pkt 6", "garażowanie pojazdu w nieprzeznaczonym miejscu z paliwem i podłączonym akumulatorem", "skuter w piwnicy bloku (pyt. 461)"],
    ["§ 1 pkt 7-8", "składowanie na drogach ewakuacyjnych, na nieużytkowych poddaszach, w piwnicznych korytarzach", "meble na klatce schodowej"],
    ["§ 1 pkt 10-11", "ograniczanie dostępu do urządzeń ppoż., gaśnic, wyłączników, kurków gazu, źródeł wody", "paleta przed hydrantem"],
    ["§ 2", "obowiązany do zapewnienia ochrony ppoż. nie zapewnia: ewakuacji, urządzeń i gaśnic, przeglądów, instrukcji, oznakowania, dróg pożarowych, czyszczenia przewodów dymowych", "brak przeglądu gaśnic, brak znaków, niedrożna droga pożarowa"],
    ["§ 3", "rozniecanie ognia w lesie i do 100 m od lasu, łąk, torfowisk poza wyznaczonymi miejscami", "ognisko przy lesie"],
    ["§ 4", "wypalanie traw i pozostałości roślinnych bliżej niż 100 m od zabudowań, lasów, zboża", "wypalanie łąki wiosną"],
    ["§ 6", "pozostawienie dziecka do lat 7 tam, gdzie może wzniecić pożar", "dziecko samo z zapałkami"],
  ])}
<p>Art. 82a KW: kara za niezawiadomienie o pożarze osób w strefie zagrożenia i służb, niepodporządkowanie się kierującemu działaniem ratowniczym oraz utrudnianie dojazdu straży.</p>
${przyklad("kontrola PSP w hurtowni - co grozi", `${tab(["Ustalenie", "Podstawa", "Skutek"], [
    ["Wyjście ewakuacyjne zastawione paletami", "art. 82 § 1 pkt 7 KW", "mandat dla osoby odpowiedzialnej"],
    ["Gaśnice bez przeglądu od 2 lat", "art. 82 § 2 KW (obowiązany do zapewnienia ochrony)", "mandat dla właściciela lub zarządcy"],
    ["Brak IBP w obiekcie, który musi ją mieć", "art. 82 § 2 KW", "mandat i decyzja nakazująca opracowanie"],
    ["Drzwi wyjścia zamknięte na kłódkę w czasie pracy przy 120 osobach na sali", "art. 82 § 1 i § 2 KW; przy realnym zagrożeniu - możliwe art. 164 KK", "mandat; przy bezpośrednim niebezpieczeństwie dla wielu osób - sprawa karna"],
  ])}<p>Ile wyniesie mandat w konkretnej sprawie - decyduje kontrolujący w granicach przepisów. Ta tabela nie przesądza o kwocie.</p>`)}
${wlasciciel(`<p>„Mandat za zastawione wyjście to najmniejszy problem. Jeśli w czasie pożaru ktoś przez to nie wyjdzie, rozmowa przenosi się do prokuratury, a tam chodzi o kodeks karny, nie o grzywnę. Dlatego wolę to wyłapać teraz, zanim zrobi to kontrola albo pożar.”</p>`)}
${wlasciciel(`<p>„Jako inspektor nie nakładam mandatów - to robi strażak PSP przy kontroli. Moja rola jest taka, żeby przy tej kontroli nie było czego zapisać. Każde moje zalecenie dostaje Pan na piśmie z terminem. Dzięki temu też Pan może wykazać, że działał.”</p>`)}
${pulapki([
    "Wykroczenia przeciwpożarowe - <b>art. 82 Kodeksu wykroczeń</b>; czyny przy pożarze i utrudnianie akcji - art. 82a.",
    "Mandat za art. 82 § 1-5 KW - <b>do 5000 zł</b> (art. 96 § 1ad KPSW), przy zbiegu więcej.",
    "Mandat nakłada strażak upoważniony do czynności kontrolno-rozpoznawczych (art. 23 ust. 6 ustawy o PSP).",
    "Sprowadzenie pożaru zagrażającego wielu osobom - art. 163 KK: <b>1-10 lat</b>, nieumyślnie <b>3 miesiące - 5 lat</b>.",
    "Bezpośrednie niebezpieczeństwo pożaru - art. 164 KK: <b>6 miesięcy - 8 lat</b>, nieumyślnie <b>do 3 lat</b>.",
    "Ognisko w lesie i do <b>100 m</b> od lasu poza wyznaczonym miejscem - art. 82 § 3 KW.",
    "Wypalanie traw bliżej niż <b>100 m</b> od zabudowań i lasów - art. 82 § 4 KW.",
    "Inspektor ochrony ppoż. <b>nie nakłada</b> mandatów - to uprawnienie strażaków PSP przy kontroli.",
  ])}`),
  },
  {
    id: "elektryka-pwp", skrot: "PWP", tytul: "Instalacja elektryczna i przeciwpożarowy wyłącznik prądu",
    html: () => nbsp(`
${ludzku(`<p>Prąd to jedna z najczęstszych przyczyn pożarów, a dla strażaka gaszącego wodą - śmiertelne zagrożenie. Dlatego przepisy mówią dwie rzeczy: instalacja ma mieć zabezpieczenia, które same wyłączą prąd przy usterce, a duży budynek ma mieć <b>przeciwpożarowy wyłącznik prądu (PWP)</b>, którym strażak jednym ruchem odetnie zasilanie przed gaszeniem.</p>`)}
${galeria(["pwp", "pwp2", "rozdzielnica-mieszkanie"])}
${wyklad(`<p>Proszę Państwa, przeciwpożarowy wyłącznik prądu to nie zwykły wyłącznik główny w rozdzielni. To przycisk albo dźwignia przy <b>wejściu do obiektu</b> lub przy złączu, oznakowany, który odcina prąd we wszystkich obwodach oprócz tych, które muszą działać w pożarze (§ 183 ust. 2-3 WT). Strażak nie musi szukać rozdzielni w piwnicy pełnej dymu.</p>
<p>Wymagany jest w strefach pożarowych o kubaturze ponad <b>1000 m³</b> albo ze strefą zagrożenia wybuchem. Uwaga na słowo „z wyjątkiem”. Po wciśnięciu PWP muszą działać m.in. oświetlenie awaryjne, system sygnalizacji pożarowej, oddymianie, pompy instalacji gaśniczej, dźwigi dla ekip ratowniczych. Jednocześnie wyłącznik nie może samoczynnie załączyć drugiego źródła prądu, np. agregatu, chyba że zasila tylko oświetlenie awaryjne (§ 183 ust. 4 WT).</p>
<p>Druga rzecz to zabezpieczenia w instalacji. Wyłącznik nadprądowy chroni przewód przed przeciążeniem i zwarciem. Wyłącznik <b>różnicowoprądowy</b> wykrywa upływ prądu, np. przez uszkodzoną izolację, i wyłącza zasilanie. Przepis wprost mówi, że chroni nie tylko przed porażeniem, ale i <b>przed powstaniem pożaru</b> (§ 183 ust. 1 pkt 3 WT).</p>`)}
<h3>Co musi mieć instalacja elektryczna (§ 183 ust. 1 WT)</h3>
${tab(["Element", "Po co"], [
    ["złącze z możliwością odłączenia budynku od sieci, w dostępnym miejscu", "odcięcie całego budynku"],
    ["oddzielny przewód ochronny i neutralny", "bezpieczeństwo przy uszkodzeniu"],
    ["wyłączniki różnicowoprądowe", "ochrona przed porażeniem i <b>przed pożarem</b> - wyłączają prąd przy upływie"],
    ["wyłączniki nadprądowe w obwodach odbiorczych", "ochrona przed przeciążeniem i zwarciem"],
    ["selektywność zabezpieczeń", "wyłącza się tylko uszkodzony obwód, a nie cały budynek"],
    ["przeciwpożarowe wyłączniki prądu", "odcięcie prądu przez straż"],
    ["połączenia wyrównawcze", "metalowe rury, kominy, szyby dźwigów połączone z przewodem ochronnym"],
    ["przewody prowadzone w liniach prostych", "żeby przy wierceniu nie trafić w przewód"],
    ["przewody miedziane do 10 mm²", "aluminium w małych przekrojach łatwiej się grzeje na połączeniach"],
    ["ochrona przeciwprzepięciowa", "przed skutkami wyładowań i przepięć"],
  ])}
<h3>Przeciwpożarowy wyłącznik prądu (§ 183 ust. 2-4 WT)</h3>
${tab(["Zasada", "Wartość"], [
    ["Gdzie wymagany", "strefy pożarowe ponad 1000 m³ albo ze strefą zagrożenia wybuchem"],
    ["Co odcina", "wszystkie obwody poza tymi, które muszą działać w pożarze"],
    ["Gdzie umieścić", "blisko głównego wejścia do obiektu albo złącza; oznakowany"],
    ["Czego nie może robić", "włączać automatycznie drugiego źródła prądu (agregatu), poza zasilaniem oświetlenia awaryjnego"],
    ["Badanie instalacji elektrycznej i piorunochronnej", "co najmniej raz na 5 lat (art. 62 ust. 1 pkt 2 PB)"],
    ["Przycisk PWP - kolor (pyt. 279)", "czerwony (według N SEP-E-005)"],
  ])}
${przyklad("hala z fotowoltaiką na dachu", `<ol><li>Hala 6000 m³ → PWP obowiązkowy.</li><li>PWP odcina prąd z sieci, ale panele na dachu w dzień nadal produkują prąd stały - w przewodach DC jest napięcie nawet do 1000 V (materiały kursu o PV).</li><li>Dlatego przy instalacjach PV stosuje się wyłączniki po stronie prądu stałego, a strażacy muszą wiedzieć, gdzie biegną przewody DC. Informacja o PV i miejscu wyłączników powinna być w IBP i na planach.</li><li>Na obchodzie: czy przy wejściu jest oznakowanie, że na dachu jest instalacja PV, i czy w dokumentach jest schemat.</li></ol>`)}
${przyklad("co sprawdzić w rozdzielni na obchodzie", `${tab(["Co widzisz", "Ocena"], [
    ["Brak wyłącznika różnicowoprądowego w starym budynku", "instalacja nie spełnia dzisiejszego § 183 WT - zalecić modernizację po badaniu elektryka"],
    ["Rozdzielnia zastawiona kartonami", "zakaz ograniczania dostępu do tablic rozdzielczych (§ 4 ust. 1 pkt 18 lit. f rozp. 2010)"],
    ["Materiały palne bliżej niż 0,5 m od rozdzielnicy powyżej 400 V", "§ 4 ust. 1 pkt 8 lit. b rozp. 2010"],
    ["Brak protokołu pomiarów elektrycznych z ostatnich 5 lat", "art. 62 ust. 1 pkt 2 PB"],
    ["Przewody na „kostkę” i taśmę izolacyjną", "do naprawy przez elektryka z uprawnieniami"],
  ])}`)}
${wlasciciel(`<p>„Wyłącznik przeciwpożarowy jest w rozdzielni w piwnicy, za drzwiami na klucz. Straż go tam nie znajdzie, a tym bardziej nie zejdzie po niego przez dym. Musi być przy głównym wejściu, oznakowany, z przyciskiem albo dźwignią dostępną bez klucza.”</p>`)}
${wlasciciel(`<p>„Ostatnie pomiary instalacji elektrycznej były 7 lat temu. Prawo budowlane wymaga ich co najmniej co 5 lat. Elektryk z uprawnieniami sprawdzi przy okazji, czy wszędzie są wyłączniki różnicowoprądowe - one wyłączają prąd, zanim uszkodzony przewód zdąży się zapalić.”</p>`)}
${pulapki([
    "PWP wymagany w strefach ponad <b>1000 m³</b> albo ze strefą zagrożenia wybuchem.",
    "PWP umieszcza się <b>przy głównym wejściu lub złączu</b>, oznakowany.",
    "PWP <b>nie odcina</b> obwodów niezbędnych w pożarze (oświetlenie awaryjne, SSP, oddymianie, pompy).",
    "Wyłącznik różnicowoprądowy chroni także <b>przed pożarem</b>.",
    "Przewody do <b>10 mm²</b> - tylko miedziane.",
    "Badanie instalacji elektrycznej i piorunochronnej - co najmniej co <b>5 lat</b>.",
    "Przycisk PWP - <b>czerwony</b> (pyt. 279).",
  ])}`),
  },
  {
    id: "kominy", skrot: "KOMIN", tytul: "Kominy i przewody - czyszczenie, kontrola i pożary sadzy",
    html: () => nbsp(`
${ludzku(`<p>W kominie od pieca na węgiel czy drewno osadza się sadza i smoła. Gdy jest jej dużo, może się zapalić. Pożar sadzy w kominie to temperatura ponad tysiąc stopni, huk, iskry z komina i pękające ściany komina. Do tego dochodzi czad, który przez nieszczelny komin wchodzi do mieszkań. Dlatego przewody czyści się regularnie, a raz w roku sprawdza.</p>`)}
${galeria(["kominiarz"])}
${wyklad(`<p>Proszę Państwa, przy kominach są dwa różne obowiązki i często się je myli. <b>Czyszczenie</b> - z rozporządzenia o ochronie przeciwpożarowej (§ 34 rozp. 2010). Częstotliwość zależy od paliwa: im brudniej się pali, tym częściej. <b>Kontrola stanu technicznego</b> - z Prawa budowlanego, co najmniej raz w roku (art. 62 ust. 1 pkt 1 lit. c PB). Czyszczenie usuwa sadzę, a kontrola sprawdza, czy komin jest szczelny, drożny i ma ciąg.</p>
<p>Kto może czyścić? Co do zasady osoba z <b>kwalifikacjami kominiarskimi</b> (§ 34 ust. 3). Wyjątek: domy jednorodzinne, budownictwo zagrodowe i letniskowe - tam właściciel może wyczyścić komin sam (§ 34 ust. 4). Kontrolę z Prawa budowlanego i tak robi uprawniona osoba.</p>
<p>A gdy komin się zapali? Nie lejemy wody do komina, bo gwałtowne odparowanie może go rozsadzić. To wiecie z praktyki strażackiej. Dla właściciela: zamknąć dopływ powietrza do pieca, dzwonić 112, nie gasić samemu.</p>`)}
<h3>Jak często czyścić (§ 34 rozp. 2010)</h3>
${tab(["Przewody", "Częstotliwość"], [
    ["dymowe i spalinowe od palenisk w gastronomii i zbiorowym żywieniu", "co najmniej raz w miesiącu (jeśli przepisy miejscowe nie mówią inaczej)"],
    ["od palenisk na paliwo stałe (węgiel, drewno, pellet)", "co najmniej raz na 3 miesiące"],
    ["od palenisk na paliwo ciekłe i gazowe", "co najmniej raz na 6 miesięcy"],
    ["przewody wentylacyjne", "co najmniej raz w roku"],
    ["kto czyści", "osoby z kwalifikacjami kominiarskimi; wyjątek - domy jednorodzinne, zagrodowe, letniskowe"],
    ["kontrola stanu technicznego przewodów kominowych", "co najmniej raz w roku (art. 62 ust. 1 pkt 1 lit. c PB)"],
  ])}
${przyklad("pensjonat z kominkiem i kotłem na pellet", `<ol><li>Kocioł na pellet (paliwo stałe) - przewód dymowy czyścić co najmniej <b>raz na 3 miesiące</b> w sezonie grzewczym.</li><li>Kominek w sali - też paliwo stałe, też co 3 miesiące, gdy jest używany.</li><li>Kuchnia pensjonatu z okapem nad kuchnią gazową - przewód wentylacyjny co najmniej <b>raz w roku</b>. Gdyby kuchnia działała jak restauracja z własnym paleniskiem, np. piecem do pizzy, przewód od paleniska - co miesiąc.</li><li>Pensjonat to nie dom jednorodzinny, więc czyści <b>kominiarz z kwalifikacjami</b>, z protokołem.</li><li>Raz w roku kontrola przewodów kominowych z Prawa budowlanego, a od 30.06.2026 czujka czadu w pomieszczeniu z kominkiem, jeśli to lokal na pobyt ludzi w strefie ZL (§ 28a rozp. 2010).</li></ol>`)}
${przyklad("dom jednorodzinny z kotłem węglowym", `<ol><li>Czyszczenie przewodu dymowego co najmniej co 3 miesiące w okresie użytkowania. Właściciel może zrobić je sam (§ 34 ust. 4).</li><li>Kontrola stanu technicznego - raz w roku, przez uprawnioną osobę.</li><li>Czujka czadu w kotłowni domowej - od 1.01.2030, jeśli kocioł ma otwartą komorę spalania (§ 28a; patrz temat o czujkach).</li></ol>`)}
${wlasciciel(`<p>„Restauracja ma piec opalany drewnem. Przewód od takiego paleniska czyści się co najmniej raz w miesiącu, a nie raz w roku jak wentylację. Tłuszcz i sadza z pieca do pizzy to idealne paliwo na pożar komina. Proszę ustalić z kominiarzem stały termin i zbierać protokoły.”</p>`)}
${wlasciciel(`<p>„Na strychu przy kominie leżą deski i stare krzesła. Komin się nagrzewa, a jeśli kiedyś zapali się w nim sadza, ściany komina rozgrzeją się jeszcze bardziej. Składowanie palnych rzeczy na nieużytkowym strychu jest zabronione (§ 4 ust. 1 pkt 12 rozporządzenia). Proszę to uprzątnąć.”</p>`)}
${pulapki([
    "Gastronomia - czyszczenie co <b>miesiąc</b>; paliwo stałe - co <b>3 miesiące</b>; ciekłe i gazowe - co <b>6 miesięcy</b>; wentylacja - co <b>rok</b>.",
    "Czyszczenie: § 34 rozp. 2010; kontrola stanu technicznego: art. 62 PB - <b>raz w roku</b>.",
    "Czyszczą osoby z <b>kwalifikacjami kominiarskimi</b>, poza domami jednorodzinnymi, zagrodowymi i letniskowymi.",
    "Niezapewnienie czyszczenia przewodów dymowych i spalinowych - wykroczenie z <b>art. 82 § 2 pkt 7 KW</b>.",
  ])}`),
  },
  {
    id: "kontrola-psp", skrot: "KONTR", tytul: "Kontrola PSP krok po kroku - jak przebiega i co może komendant",
    html: () => nbsp(`
${ludzku(`<p>Kontrola straży pożarnej to po urzędowemu „czynności kontrolno-rozpoznawcze”. Strażak z upoważnieniem przychodzi, sprawdza obiekt, spisuje protokół, może nałożyć mandat, a komendant powiatowy może potem wydać decyzję: usunąć uchybienia w terminie albo nawet wstrzymać użytkowanie. Jako inspektor jesteś po drugiej stronie stołu: przygotowujesz klienta tak, żeby kontrola przeszła spokojnie.</p>`)}
${wyklad(`<p>Proszę Państwa, kontrola nie bierze się znikąd. Podstawy są w art. 23 ust. 2 ustawy o PSP: roczny plan kontroli, zlecenie starosty, polecenie sądu, prokuratora albo NIK, zgłoszenie obiektu, który wymaga opinii straży, zawiadomienie wójta o zagrożeniu, nowe ważne okoliczności. W praktyce właściciel najczęściej dowiaduje się o kontroli z <b>upoważnienia</b> doręczonego co najmniej 7 dni wcześniej.</p>
<p>Kiedy można przyjść bez uprzedzenia? Gdy jest informacja o zagrożeniu życia ludzi albo bezpośrednim niebezpieczeństwie pożaru lub poważnej awarii, albo gdy trzeba na gorąco ustalić okoliczności pożaru. Wtedy upoważnienie doręcza się w chwili rozpoczęcia kontroli (art. 23 ust. 7).</p>
<p>W czasie kontroli właściciel musi udostępnić obiekt, dokumenty, dać wyjaśnienia, pozwolić na zdjęcia i kopie (art. 23 ust. 10). Kontrolujący ma prawo wejść wszędzie, <b>poza częścią mieszkalną</b> i obiektami niektórych służb oraz misji dyplomatycznych (art. 23 ust. 11). Na końcu jest protokół. Kontrolowany może wnieść zastrzeżenia przed podpisaniem, a gdy odmówi podpisu, kontrolujący robi o tym wzmiankę (art. 23 ust. 13-15).</p>`)}
<h3>Przebieg kontroli - oś czasu (art. 23 ustawy o PSP)</h3>
${tab(["Etap", "Co się dzieje", "Przepis"], [
    ["Podstawa", "plan roczny, zlecenie starosty, polecenie sądu/prokuratora/NIK, zgłoszenie obiektu, zawiadomienie wójta, nowe okoliczności", "art. 23 ust. 2"],
    ["Upoważnienie", "doręczone co najmniej <b>7 dni</b> przed kontrolą (przy zgłoszeniu obiektu - <b>3 dni</b>); w nagłych przypadkach - w chwili rozpoczęcia", "art. 23 ust. 7"],
    ["Co jest w upoważnieniu", "podstawa prawna, organ, data, kontrolujący i nr legitymacji, kontrolowany, zakres, termin, pouczenie", "art. 23 ust. 8"],
    ["Rozpoczęcie", "strażak okazuje legitymację, inna osoba - dowód tożsamości", "art. 23 ust. 9"],
    ["Obowiązki kontrolowanego", "informacje i wyjaśnienia, zgoda na zdjęcia, dostęp do obiektów i dokumentów, kopie, warunki do pracy", "art. 23 ust. 10"],
    ["Gdzie kontrolujący nie wejdzie", "część mieszkalna; obiekty MON, Policji, ABW i innych służb; misje dyplomatyczne", "art. 23 ust. 11"],
    ["Mandat", "strażak może nałożyć grzywnę w drodze mandatu za naruszenie przepisów ppoż.", "art. 23 ust. 6"],
    ["Protokół", "podpisują kontrolujący i kontrolowany; zastrzeżenia przed podpisaniem; przy odmowie - wzmianka", "art. 23 ust. 13-15"],
    ["Decyzja komendanta powiatowego", "nakaz usunięcia uchybień w terminie albo wstrzymanie robót, zakaz używania maszyn i eksploatacji obiektu przy zagrożeniu życia", "art. 26 ust. 1"],
    ["Wykonanie", "decyzja o wstrzymaniu lub zakazie - natychmiast wykonalna", "art. 26 ust. 2"],
    ["Odwołanie", "do komendanta <b>wojewódzkiego</b> PSP", "art. 27"],
  ])}
${przyklad("przygotowanie hurtowni do zapowiedzianej kontroli", `<ol><li><b>Dokumenty na jeden stół:</b> IBP z datą aktualizacji (nie starsza niż 2 lata), protokoły przeglądów gaśnic, hydrantów i SSP (nie starsze niż rok), pomiary elektryczne (5 lat), kontrola kominów i instalacji gazowej (rok), ocena zagrożenia wybuchem, jeśli dotyczy, lista zapoznania pracowników z IBP, protokół z próbnej ewakuacji.</li><li><b>Obchód dzień wcześniej:</b> drogi i wyjścia ewakuacyjne wolne, drzwi przeciwpożarowe bez klinów, gaśnice i hydranty dostępne i oznakowane, PWP oznakowany, nic palnego przy rozdzielni, droga pożarowa wolna.</li><li><b>Osoba do kontaktu:</b> ktoś, kto zna obiekt i ma klucze do wszystkich pomieszczeń.</li><li><b>W czasie kontroli:</b> odpowiadać rzeczowo, nie dyskutować o oczywistych uchybieniach, uwagi zgłaszać jako zastrzeżenia do protokołu przed podpisem.</li><li><b>Po kontroli:</b> plan usunięcia uchybień z terminami. Jeśli przyjdzie decyzja z nakazem - dotrzymać terminu albo przed jego upływem poprosić o przedłużenie z uzasadnieniem.</li></ol>`)}
${wlasciciel(`<p>„Dostał Pan upoważnienie do kontroli na przyszły wtorek. Mamy tydzień. W poniedziałek zrobię obchód i sprawdzimy dokumenty z listy. To, co da się poprawić od ręki - poprawimy. Reszta trafi do planu z terminami, który pokaże Pan kontrolującemu. Strażak widzi wtedy, że właściciel pracuje nad problemem, a nie go ukrywa.”</p>`)}
${wlasciciel(`<p>„Jeśli nie zgadza się Pan z którymś zapisem w protokole, proszę to wpisać jako zastrzeżenie <b>przed podpisaniem</b>. Po podpisie jest już za późno. A jeśli przyjdzie decyzja komendanta powiatowego, odwołanie składa się do komendanta wojewódzkiego.”</p>`)}
${pulapki([
    "Upoważnienie doręcza się co najmniej <b>7 dni</b> przed kontrolą; przy zgłoszeniu obiektu - <b>3 dni</b>.",
    "Bez uprzedzenia - przy zagrożeniu życia, bezpośrednim niebezpieczeństwie pożaru lub poważnej awarii, przy ustalaniu przyczyn pożaru.",
    "Kontrolujący nie wchodzi do <b>części mieszkalnej</b>.",
    "Zastrzeżenia do protokołu - <b>przed jego podpisaniem</b>.",
    "Decyzje: wydaje komendant <b>powiatowy</b> (miejski); odwołanie do komendanta <b>wojewódzkiego</b>.",
    "Decyzja o wstrzymaniu robót lub zakazie eksploatacji - <b>natychmiast wykonalna</b>.",
  ])}`),
  },
  {
    id: "odleglosci", skrot: "ODL", tytul: "Odległości między budynkami i od lasu - 8, 12, 15, 20 metrów",
    html: () => nbsp(`
${ludzku(`<p>Pożar przeskakuje z budynku na budynek głównie przez <b>promieniowanie cieplne</b>: płonąca ściana grzeje sąsiednią tak mocno, że ta się zapala, chociaż ogień jej nie dotknął. Dlatego między budynkami musi być odstęp albo ściana, która ogień zatrzyma.</p>`)}
${wyklad(`<p>Proszę Państwa, podstawowa liczba to <b>8 metrów</b> między budynkami ZL. Rośnie, gdy obok stoi magazyn z dużą ilością paliwa, i dochodzi do <b>20 metrów</b>, gdy w jednym z budynków jest pomieszczenie zagrożone wybuchem (§ 271 ust. 3 WT).</p>
<p>Odległość zwiększamy o połowę, gdy ściana albo dach jednego budynku <b>rozprzestrzenia ogień</b>, a o 100%, gdy dotyczy to obu budynków (§ 271 ust. 2). Zwiększamy też, gdy w ścianie jest dużo okien. Jeśli mniej niż 65%, ale co najmniej 30% ściany ma odporność ogniową, odległość rośnie o 50%. Jeśli poniżej 30% - o 100% (§ 271 ust. 4-5). Okno to „dziura” w ochronie.</p>
<p>Zmniejszamy, gdy są tryskacze: o 50%, gdy chronią strefy przy obu ścianach, i o 25%, gdy chronią strefy przy jednej (§ 271 ust. 6-7). A <b>las</b>? Las traktujemy jak budynek ZL z dachem rozprzestrzeniającym ogień (§ 271 ust. 8). Stąd znane z egzaminu <b>12 metrów</b>: 8 m powiększone o 50%.</p>`)}
<h3>Odległości podstawowe (§ 271 ust. 1 WT, tabela)</h3>
${tab(["Budynek obok", "Odległość"], [
    ["ZL od ZL, IN od ZL lub IN", "8 m"],
    ["PM z Q do 1000 MJ/m²", "8 m"],
    ["PM z Q ponad 1000 do 4000 MJ/m²", "15 m"],
    ["PM z Q ponad 4000 MJ/m²", "20 m"],
    ["którykolwiek z pomieszczeniem zagrożonym wybuchem", "20 m (§ 271 ust. 3)"],
  ])}
<h3>Zwiększenia i zmniejszenia</h3>
${tab(["Sytuacja", "Zmiana", "Przepis"], [
    ["ściana lub dach <b>jednego</b> budynku rozprzestrzenia ogień", "+50%", "§ 271 ust. 2"],
    ["ściany lub dachy <b>obu</b> budynków rozprzestrzeniają ogień", "+100%", "§ 271 ust. 2"],
    ["odporność ogniowa na 30-65% powierzchni ściany (dużo okien)", "+50%", "§ 271 ust. 4"],
    ["odporność ogniowa na mniej niż 30% ściany", "+100%", "§ 271 ust. 5"],
    ["tryskacze we wszystkich strefach przy <b>obu</b> ścianach", "-50%", "§ 271 ust. 6"],
    ["tryskacze we wszystkich strefach przy <b>jednej</b> ścianie", "-25%", "§ 271 ust. 7"],
    ["małe budynki z § 213, bez otworów, ściany i dachy nierozprzestrzeniające ognia", "-25%", "§ 271 ust. 9"],
    ["las - jak budynek ZL z dachem rozprzestrzeniającym ogień", "zwykle 8 m + 50% = 12 m", "§ 271 ust. 8"],
    ["otwarte składowisko", "traktuje się jak budynek PM", "§ 271 ust. 13"],
    ["składowanie materiałów palnych poza budynkami", "co najmniej 4 m od granicy działki sąsiedniej", "§ 4 ust. 1 pkt 6 rozp. 2010"],
  ])}
${przyklad("pensjonat przy lesie na Jurze", `<ol><li>Pensjonat (ZL) z dachem nierozprzestrzeniającym ognia, obok granica lasu.</li><li>Las = budynek ZL z dachem rozprzestrzeniającym ogień (§ 271 ust. 8).</li><li>Podstawa ZL-ZL: 8 m. Jeden „budynek” (las) rozprzestrzenia ogień: +50% → <b>12 m</b>.</li><li>Gdyby dach pensjonatu był z palnego gontu (rozprzestrzeniający ogień), oba „budynki” rozprzestrzeniałyby ogień: +100% → <b>16 m</b>.</li><li>Dla domów jednorodzinnych z § 213 jest wyjątek z § 271 ust. 8a: przy spełnieniu warunków co do materiałów i przeznaczenia terenu w planie - 4 m od lasu na sąsiedniej działce.</li></ol>`)}
${przyklad("hurtownia i nowy magazyn opon", `<ol><li>Hurtownia (PM, Q = 800) i obok planowany magazyn opon z Q = 1890 MJ/m² (przykład z tematu o obciążeniu ogniowym).</li><li>Odległość wyznacza groźniejszy z budynków: magazyn z Q 1000-4000 → <b>15 m</b>.</li><li>Ściana magazynu z płyt z rdzeniem rozprzestrzeniającym ogień: +50% → <b>22,5 m</b>.</li><li>Tryskacze w obu budynkach przy tych ścianach: -50% → wróciłoby do ok. 11,25 m.</li><li>Alternatywa: ściana oddzielenia przeciwpożarowego spełniająca wymagania dla obu budynków (§ 271 ust. 12).</li></ol>`)}
${wlasciciel(`<p>„Chce Pan postawić wiatę na palety 6 metrów od pensjonatu. Otwarte składowisko traktuje się jak budynek PM. Palety drewniane to dużo paliwa, a wiata z blachy na drewnianej konstrukcji rozprzestrzenia ogień. Bezpieczniej postawić ją co najmniej 12 metrów dalej albo zamiast tego zrobić ścianę oddzielenia.”</p>`)}
${wlasciciel(`<p>„Drewno opałowe składuje Pan pod płotem sąsiada. Przepis wymaga, żeby materiały palne poza budynkami leżały co najmniej 4 metry od granicy działki. Proszę przenieść stos bliżej swojej szopy, z dala od granicy.”</p>`)}
${pulapki([
    "ZL od ZL - <b>8 m</b>; PM z Q 1000-4000 - <b>15 m</b>; ponad 4000 lub zagrożenie wybuchem - <b>20 m</b>.",
    "Od lasu - jak od budynku ZL z dachem rozprzestrzeniającym ogień → zwykle <b>12 m</b>.",
    "Jedna ściana rozprzestrzeniająca ogień: <b>+50%</b>; obie: <b>+100%</b>.",
    "Tryskacze przy obu ścianach: <b>-50%</b>; przy jednej: <b>-25%</b>.",
    "Otwarte składowisko traktuje się jak budynek <b>PM</b>.",
    "Materiały palne poza budynkiem - co najmniej <b>4 m</b> od granicy działki.",
    "Główny mechanizm przerzutu ognia między budynkami - <b>promieniowanie</b>.",
  ])}`),
  },
  {
    id: "sug", skrot: "SUG", tytul: "Tryskacze i inne stałe urządzenia gaśnicze - gdzie obowiązkowe",
    html: () => nbsp(`
${ludzku(`<p>Stałe urządzenie gaśnicze (SUG) to instalacja na stałe w budynku, która sama zaczyna gasić pożar we wczesnej fazie. Najpopularniejsze są <b>tryskacze</b>: rury pod sufitem z dyszami zamkniętymi szklaną ampułką. Gdy temperatura pod sufitem wzrośnie, ampułka pęka i woda leje się tylko nad ogniem.</p>`)}
${galeria(["tryskacz"])}
${wyklad(`<p>Proszę Państwa, najczęstszy mit o tryskaczach to filmowa scena, w której ktoś zapala papierosa i cały budynek zostaje zalany. W rzeczywistości otwiera się tylko ten tryskacz, nad którym jest gorąco, czyli zwykle jeden do kilku. Reszta zostaje zamknięta. Tryskacza nie uruchamia system sygnalizacji pożarowej: otwiera go temperatura (pyt. 63, 281). SSP może tylko sygnalizować, że woda płynie.</p>
<p>Inne stałe urządzenia to: <b>zraszacze</b> (dysze otwarte, woda płynie ze wszystkich naraz po otwarciu zaworu - np. przy zbiornikach), <b>mgła wodna</b>, <b>gazy gaśnicze</b> w serwerowniach i archiwach, <b>piana</b> w magazynach cieczy palnych. Przy gazach trzeba chronić ludzi, bo niektóre gazy wypierają tlen (§ 27 ust. 3 rozp. 2010).</p>
<p>SUG to też waluta w przepisach. Tryskacze pozwalają wydłużyć przejścia i dojścia (+50%), powiększyć strefy pożarowe (+100%), zmniejszyć odległości między budynkami, zwalniają z czujek autonomicznych w pokojach hotelowych (§ 28a ust. 2), a gaśnice w chronionej strefie liczy się na 300 m² zamiast na 100 m² (§ 32 ust. 3). Dlatego tak często są elementem rozwiązań zamiennych.</p>`)}
<h3>Gdzie stałe urządzenia gaśnicze są obowiązkowe (§ 27 rozp. 2010)</h3>
${tab(["Obiekt", "Jakie urządzenie", "Warunek"], [
    ["archiwa wyznaczone przez Naczelnego Dyrektora Archiwów Państwowych", "stałe urządzenie gaśnicze (dowolny środek)", "zawsze"],
    ["muzea i zabytki wyznaczone przez Generalnego Konserwatora Zabytków", "stałe urządzenie gaśnicze", "zawsze"],
    ["ośrodki elektronicznego przetwarzania danych o znaczeniu krajowym", "stałe urządzenie gaśnicze", "zawsze"],
    ["budynek handlowy lub wystawowy jednokondygnacyjny", "<b>wodne</b> (tryskacze)", "strefa ZL I ponad <b>8000 m²</b>"],
    ["budynek handlowy lub wystawowy wielokondygnacyjny", "wodne", "strefa ZL I ponad <b>5000 m²</b>"],
    ["gastronomia", "wodne", "ponad <b>600</b> miejsc w budynku"],
    ["budynki użyteczności publicznej i zamieszkania zbiorowego", "wodne", "<b>wysokościowe</b> (ponad 55 m)"],
  ])}
<h3>Kolory ampułek tryskaczy (materiały kursu, PN-EN 12845)</h3>
${tab(["Kolor", "Temperatura otwarcia"], [["pomarańczowy", "57 °C"], ["czerwony", "68 °C"], ["żółty", "79 °C"], ["zielony", "93 °C"], ["niebieski", "141 °C"], ["fioletowy", "182 °C"], ["czarny", "204-260 °C"]])}
<p>Temperatura otwarcia ma być ok. 30 °C wyższa od najwyższej temperatury spodziewanej w pomieszczeniu (materiały kursu). W zwykłym biurze - czerwona 68 °C, pod dachem hali latem - często wyższa.</p>
${przyklad("galeria handlowa i restauracja", `${tab(["Obiekt", "Tryskacze obowiązkowe?", "Dlaczego"], [
    ["Market parterowy, sala sprzedaży (ZL I) 6000 m²", "nie", "1 kondygnacja - próg ponad 8000 m²"],
    ["Galeria 2-kondygnacyjna, strefa ZL I 6000 m²", "<b>tak</b>", "wielokondygnacyjna - próg ponad 5000 m²"],
    ["Restauracja na 400 miejsc", "nie", "próg ponad 600 miejsc"],
    ["Hala koncertowo-bankietowa na 800 miejsc gastronomicznych", "<b>tak</b>", "ponad 600 miejsc"],
    ["Hotel 40 m (wysoki)", "nie z § 27", "tylko wysokościowe (ponad 55 m)"],
  ])}`)}
${wlasciciel(`<p>„Pod tryskaczami stoją regały z towarem do samego sufitu. Tryskacz musi mieć wolną przestrzeń pod sobą, żeby woda rozprysła się na ogień. Jeśli towar jest zbyt blisko dyszy, woda trafi tylko w górny karton, a pożar rozwinie się niżej. Odstęp ustala projekt instalacji - sprawdźmy go i oznaczmy na regałach linię maksymalnego składowania.”</p>`)}
${wlasciciel(`<p>„Ktoś pomalował tryskacze razem z sufitem. Farba na ampułce i na mechanizmie może sprawić, że tryskacz otworzy się za późno albo wcale. Pomalowane tryskacze trzeba wymienić - to robota dla firmy serwisowej, nie dla malarza.”</p>`)}
${pulapki([
    "Tryskacze w handlu ZL I: <b>ponad 8000 m²</b> (1 kondygnacja), <b>ponad 5000 m²</b> (wielokondygnacyjny).",
    "Gastronomia: tryskacze ponad <b>600</b> miejsc (SSP już ponad 300).",
    "UP i zamieszkanie zbiorowe - tryskacze tylko w budynkach <b>wysokościowych</b>.",
    "Tryskacz otwiera <b>temperatura</b>, a nie SSP.",
    "Czerwona ampułka = <b>68 °C</b>.",
    "Zraszacz = dysza otwarta, bez ampułki.",
    "Przy gaszeniu gazem - warunki bezpieczeństwa dla ludzi według norm (§ 27 ust. 3).",
  ])}`),
  },
  {
    id: "obowiazki-wlasciciela", skrot: "OBOW", tytul: "Obowiązki właściciela obiektu - lista z ustawy i rozporządzenia",
    html: () => nbsp(`
${ludzku(`<p>Za ochronę przeciwpożarową budynku odpowiada <b>właściciel</b>. Może przekazać obowiązki zarządcy albo najemcy umową. Gdy umowy nie ma, odpowiada ten, kto faktycznie budynkiem włada. Ty jako inspektor pomagasz te obowiązki wykonać - ale nie przejmujesz odpowiedzialności właściciela.</p>`)}
${wyklad(`<p>Proszę Państwa, cała ochrona przeciwpożarowa obiektu stoi na jednym artykule: art. 4 ustawy o ochronie przeciwpożarowej. Ustęp 1 wymienia siedem obowiązków właściciela. Wszystko inne w rozporządzeniach - gaśnice, hydranty, instrukcja, ewakuacja - to rozwinięcie tych siedmiu punktów. Warto je znać na pamięć, bo na nich budujesz ofertę dla klienta.</p>
<p>Ustęp 1a mówi, kto odpowiada, gdy właściciel nie jest użytkownikiem. Zarządca albo użytkownik przejmuje odpowiedzialność w całości lub w części na podstawie <b>umowy cywilnoprawnej</b>. Gdy umowy nie ma, odpowiada <b>faktycznie władający</b> budynkiem. W praktyce przy najmie hal warto w umowie najmu wprost napisać, kto robi przeglądy gaśnic i kto aktualizuje IBP.</p>
<p>Ustępy 2a i 2b mówią, kto może te czynności wykonywać za właściciela. Osoba spoza jednostek ochrony ppoż. wykonująca czynności z ust. 1 musi mieć co najmniej wykształcenie średnie i uprawnienia <b>inspektora ochrony przeciwpożarowej</b> albo kwalifikacje technika pożarnictwa. Szerszy zakres zapobiegania pożarom wymaga tytułu inżyniera pożarnictwa. To jest podstawa Twojego zawodu.</p>`)}
<h3>7 obowiązków właściciela (art. 4 ust. 1 ustawy o ochronie ppoż.)</h3>
${tab(["Nr", "Obowiązek", "Rozwinięcie w przepisach (przykłady)"], [
    ["1", "przestrzegać przeciwpożarowych wymagań techniczno-budowlanych, instalacyjnych i technologicznych", "WT, rozp. 2010 § 4 - zakazy"],
    ["2", "wyposażyć obiekt w wymagane urządzenia przeciwpożarowe i gaśnice", "§ 19-33 rozp. 2010"],
    ["3", "zapewnić przeglądy, konserwacje i naprawy urządzeń i gaśnic", "§ 3 rozp. 2010 - co najmniej raz w roku"],
    ["4", "zapewnić bezpieczeństwo i możliwość ewakuacji", "drogi ewakuacyjne WT, § 17 rozp. 2010"],
    ["5", "przygotować obiekt do prowadzenia akcji ratowniczej", "drogi pożarowe, woda (rozp. 2009), PWP, plany w IBP"],
    ["6", "zapoznać pracowników z przepisami przeciwpożarowymi", "§ 6 ust. 1 pkt 6 rozp. 2010 - w IBP"],
    ["7", "ustalić sposoby postępowania na wypadek pożaru i innych zagrożeń", "IBP, instrukcje przy wejściach (§ 4 ust. 2 pkt 3)"],
  ])}
<h3>Obowiązki z § 4 ust. 2 rozp. 2010 (poza domami jednorodzinnymi)</h3>
${tab(["Pkt", "Obowiązek"], [
    ["1", "utrzymywać urządzenia ppoż. i gaśnice w pełnej sprawności"],
    ["2", "wyposażyć obiekt w przeciwpożarowe wyłączniki prądu"],
    ["3", "wywiesić w widocznych miejscach instrukcje postępowania na wypadek pożaru z telefonami alarmowymi"],
    ["4", "oznakować: drogi i wyjścia ewakuacyjne, urządzenia ppoż. i gaśnice, elementy sterujące, kurki gazu, nasady, materiały niebezpieczne, drabiny i miejsca zbiórki, dźwigi dla straży, źródła wody, drzwi przeciwpożarowe, drogi pożarowe, strefy zagrożenia wybuchem"],
    ["5", "przy wjazdach do garaży podziemnych - informacja, czy wolno parkować auta na gaz"],
    ["6", "oznakować z zewnątrz miejsce połączenia ściany oddzielenia z elewacją i dachem (duże strefy handlowe, produkcyjne, magazynowe - od 2024 r.)"],
    ["7", "oznakować punkty schronienia (od 2026 r.)"],
  ])}
${przyklad("hala wynajmowana firmie", `<ol><li>Właściciel hali (spółka) wynajmuje ją hurtowni. Umowa najmu nic nie mówi o ppoż.</li><li>Brak umowy w tym zakresie - odpowiada <b>faktycznie władający</b>, czyli w praktyce najemca, który użytkuje halę (art. 4 ust. 1a). Spory są tu częste.</li><li>Dobra praktyka: aneks do umowy - właściciel odpowiada za instalacje stałe (hydranty, SSP, PWP, drogi pożarowe), najemca za gaśnice, porządek, IBP, szkolenie pracowników, próbne ewakuacje.</li><li>Inspektor przygotowuje IBP dla tego, kto zgodnie z umową za nią odpowiada.</li></ol>`)}
${wlasciciel(`<p>„Zanim zacznę, ustalmy jedną rzecz: kto w Pana firmie odpowiada za ochronę przeciwpożarową - Pan jako właściciel budynku czy najemca? To zależy od umowy. Jeśli umowa milczy, odpowiada ten, kto budynek faktycznie użytkuje. Dobrze to zapisać czarno na białym, zanim przyjdzie kontrola albo, nie daj Boże, pożar.”</p>`)}
${wlasciciel(`<p>„Mogę wykonywać za Pana czynności z zakresu ochrony przeciwpożarowej, bo mam uprawnienia inspektora - tak mówi art. 4 ustawy. Ale odpowiedzialność za budynek zostaje przy Panu. Moja rola: powiedzieć, co jest nie tak, napisać to na papierze z terminem i pomóc to załatwić.”</p>`)}
${pulapki([
    "Obowiązki właściciela - <b>art. 4 ust. 1</b> ustawy o ochronie ppoż. (7 punktów).",
    "Przejęcie odpowiedzialności przez zarządcę lub użytkownika - na podstawie <b>umowy cywilnoprawnej</b>; bez umowy - <b>faktycznie władający</b>.",
    "Inspektor ochrony ppoż. - co najmniej <b>wykształcenie średnie</b> + uprawnienia (art. 4 ust. 2b).",
    "Obowiązki z § 4 ust. 2 rozp. 2010 <b>nie dotyczą</b> budynków mieszkalnych jednorodzinnych.",
    "Instrukcja postępowania na wypadek pożaru z telefonami alarmowymi - w <b>widocznych miejscach</b>.",
  ])}`),
  },
  {
    id: "fotowoltaika", skrot: "PV", tytul: "Fotowoltaika - uzgodnienia, zagrożenia i co sprawdzić na dachu",
    html: () => nbsp(`
${ludzku(`<p>Panele fotowoltaiczne produkują prąd, dopóki świeci słońce. Wyłączenie prądu w budynku <b>nie wyłącza</b> paneli na dachu. Między panelami a falownikiem płynie prąd stały o napięciu, które w dużych instalacjach dochodzi do 1000 V (materiały kursu). Dla strażaka gaszącego dach to realne zagrożenie, a dla budynku - dodatkowe źródło pożaru.</p>`)}
${galeria(["pv-klodzko", "pv-szkola", "falownik"])}
${wyklad(`<p>Proszę Państwa, prawo przy fotowoltaice ma trzy progi i warto je mieć w jednym zdaniu. <b>Do 150 kW</b> montaż nie wymaga pozwolenia na budowę ani zgłoszenia (art. 29 PB). Ale <b>ponad 6,5 kW</b> projekt trzeba uzgodnić z rzeczoznawcą do spraw zabezpieczeń przeciwpożarowych. Po montażu zawiadamia się Państwową Straż Pożarną o zakończeniu instalowania i przekazuje <b>plan urządzenia fotowoltaicznego dla ekip ratowniczych</b>. Osobno: obiekt budowlany z instalacją PV <b>ponad 50 kW</b> należy do obiektów, których projekt budowlany wymaga uzgodnienia ppoż. (§ 3 rozp. 2023 o uzgadnianiu).</p>
<p>Skąd biorą się pożary instalacji? Według materiałów kursu najczęściej z błędów wykonania: szybkozłączki DC różnych producentów, które do siebie nie pasują i dają łuk elektryczny, źle dobrane bezpieczniki DC, źle dokręcone zaciski, falownik na palnym podłożu (radiator ok. 80 °C). Do tego tzw. <b>hot spot</b>: ogniwo w półcieniu albo z mikropęknięciem nagrzewa się mocniej od reszty, według niektórych producentów nawet ponad 250 °C. Każde dodatkowe złącze na dachu to dodatkowe ryzyko. Dobrze zaprojektowana i wykonana instalacja jest bezpieczna.</p>
<p>W budynkach ze strefą ponad 1000 m³, czyli tam, gdzie jest przeciwpożarowy wyłącznik prądu, materiały kursu wymieniają dodatkowe zabezpieczenia. Rozłącznik po stronie prądu stałego, który obniża napięcie na dachu. Przewody DC prowadzone jak obwody pracujące w pożarze. Falownik poza strefą albo w osobnej strefie. Odstęp co najmniej 15 cm między przewodami plus i minus. Do tego część o PV w instrukcji bezpieczeństwa pożarowego.</p>`)}
<h3>Progi prawne - zestawienie</h3>
${tab(["Moc instalacji", "Co trzeba", "Podstawa"], [
    ["do 6,5 kW", "bez pozwolenia, bez zgłoszenia, bez uzgodnienia ppoż.", "art. 29 PB"],
    ["ponad 6,5 kW (do 150 kW)", "bez pozwolenia i zgłoszenia, ale: uzgodnienie projektu z rzeczoznawcą ds. zabezpieczeń ppoż. + zawiadomienie PSP o zakończeniu montażu + plan instalacji dla ekip ratowniczych", "art. 29 PB"],
    ["ponad 50 kW", "obiekt z taką instalacją - projekt budowlany wymaga uzgodnienia ppoż.", "§ 3 rozp. 2023/1563"],
    ["ponad 150 kW", "już nie mieści się w zwolnieniu z art. 29 PB - procedura budowlana", "art. 29 PB"],
  ])}
${przyklad("dom jednorodzinny z instalacją 9,9 kW", `<ol><li>9,9 kW to ponad 6,5 kW → <b>uzgodnienie projektu z rzeczoznawcą ds. zabezpieczeń ppoż.</b></li><li>Po montażu - <b>zawiadomienie PSP</b> o zakończeniu instalowania i rozpoczęciu użytkowania, z planem instalacji dla ekip ratowniczych.</li><li>Pozwolenia na budowę i zgłoszenia nie trzeba (do 150 kW).</li><li>Dobra praktyka: przy złączu albo wejściu oznakowanie, że na dachu jest instalacja PV - strażak od razu wie, z czym ma do czynienia.</li></ol>`)}
${przyklad("hala z instalacją 120 kW - obchód", `${tab(["Co sprawdzasz", "Dlaczego"], [
    ["czy jest uzgodnienie projektu PV z rzeczoznawcą i zawiadomienie PSP z planem", "art. 29 PB"],
    ["czy obiekt z PV ponad 50 kW miał uzgodniony projekt budowlany", "§ 3 rozp. 2023/1563"],
    ["gdzie wisi falownik - czy nie na palnej ścianie, czy nie w strefie z materiałami palnymi", "radiator ok. 80 °C"],
    ["czy jest rozłącznik DC i czy straż wie, gdzie", "PWP nie wyłącza napięcia z paneli"],
    ["czy IBP ma część o PV: moc, przebieg przewodów DC, falowniki, rozłączniki", "§ 6 ust. 1 pkt 1-3 i 8 rozp. 2010"],
    ["czy protokoły odbioru i przeglądów instalacji są dostępne", "kontrola instalacji elektrycznej - art. 62 PB"],
  ])}`)}
${wlasciciel(`<p>„Wyłącznik przeciwpożarowy odetnie prąd z sieci, ale panele na dachu w słońcu dalej dają napięcie. Strażak musi wiedzieć, gdzie jest rozłącznik po stronie prądu stałego i którędy biegną przewody. Dlatego plan instalacji powinien leżeć przy wejściu i być w instrukcji bezpieczeństwa pożarowego.”</p>`)}
${wlasciciel(`<p>„Falownik wisi na ścianie z płyty OSB w garażu. Jego radiator nagrzewa się do kilkudziesięciu stopni, a płyta jest łatwo zapalna. Proszę przenieść go na ścianę murowaną albo podłożyć płytę niepalną - instalator zrobi to w godzinę.”</p>`)}
${pulapki([
    "PV ponad <b>6,5 kW</b>: uzgodnienie projektu z rzeczoznawcą ppoż. + zawiadomienie PSP + plan dla ekip ratowniczych.",
    "PV do <b>150 kW</b>: bez pozwolenia na budowę i bez zgłoszenia.",
    "Obiekt z PV ponad <b>50 kW</b>: projekt budowlany wymaga uzgodnienia ppoż.",
    "PWP <b>nie wyłącza</b> napięcia stałego na panelach.",
    "Typowe przyczyny pożarów PV: niepasujące szybkozłączki DC (łuk), złe bezpieczniki DC, luźne zaciski, falownik na palnym podłożu, hot spot.",
  ])}`),
  },
  {
    id: "lasy-zniwa", skrot: "LAS", tytul: "Lasy, żniwa i sterty - ogień na wsi i przy lesie",
    html: () => nbsp(`
${ludzku(`<p>Na Jurze lasy, pola i zabudowa stykają się na każdym kroku. Rozporządzenie o ochronie przeciwpożarowej ma osobne rozdziały o lasach (§ 38-40) i o żniwach i stertach (§ 41-43). To typowe pytania egzaminacyjne z liczbami: 100 m, 30 m, 10 m, 5 m.</p>`)}
${galeria(["zniwa", "kombajn-bizon"])}
${wyklad(`<p>Proszę Państwa, zacznijmy od lasu. W lesie, na terenach śródleśnych, na łąkach, torfowiskach i wrzosowiskach oraz <b>do 100 m od granicy lasu</b> nie wolno rozniecać ognia poza miejscami wyznaczonymi przez właściciela lub zarządcę lasu i nie wolno palić tytoniu, poza drogami utwardzonymi i miejscami do pobytu ludzi (§ 40). To samo jest wykroczeniem z art. 82 § 3 KW.</p>
<p>Duże kompleksy leśne, ponad <b>300 ha</b>, mają osobne obowiązki: obserwacja i patrole, źródła wody, dojazdy pożarowe, bazy sprzętu, uzgadnianie planów urządzenia lasu z komendantem wojewódzkim dla lasów I i II kategorii zagrożenia pożarowego (§ 39). Odległość od dowolnego miejsca w lesie do punktu poboru wody: do 3 km w I kategorii, do 5 km w II kategorii.</p>
<p>Żniwa. Tu liczby są proste, ale łatwo je pomylić. Silnik spalinowy - na podłożu niepalnym, co najmniej <b>10 m</b> od stert i budynków palnych. Napęd elektryczny - co najmniej <b>5 m</b>. Paliwo - najwyżej na dzień pracy, w zamkniętych nietłukących się naczyniach, 10 m od omłotów. Otwarty ogień i papierosy - nie bliżej niż 10 m od omłotów i płodów rolnych. Przy maszynach i w transporcie płodów palenie zabronione w ogóle (§ 41). Wypalanie słomy i pozostałości roślinnych na polach - zabronione całkowicie (§ 43).</p>`)}
<h3>Sterty, stogi i brogi (§ 42 rozp. 2010)</h3>
${tab(["Zasada", "Wartość"], [
    ["Wielkość jednej strefy (sterty, stogu, brogu)", "do 1000 m² albo do 5000 m³"],
    ["Od budynków palnych", "30 m"],
    ["Od budynków niepalnych z pokryciem co najmniej trudno zapalnym", "20 m"],
    ["Od dróg publicznych i torów kolejowych", "30 m"],
    ["Od dróg wewnętrznych i granicy działki", "10 m"],
    ["Od linii elektrycznych wysokiego napięcia", "30 m"],
    ["Od lasów i terenów zalesionych", "100 m"],
    ["Między stertami (odrębnymi strefami)", "30 m"],
    ["Pas bez materiałów palnych", "szerokość co najmniej 2 m, w odległości 3 m od obrysu sterty"],
    ["Samozapalenie", "składować tak, żeby nie doszło do samozapalenia; niedosuszone - okresowo mierzyć temperaturę"],
  ])}
<h3>Żniwa i omłoty (§ 41 i § 32 ust. 5 rozp. 2010)</h3>
${tab(["Zasada", "Wartość"], [
    ["Silnik elektryczny od stert, stogów i budynków palnych", "co najmniej 5 m"],
    ["Silnik spalinowy", "na podłożu niepalnym, co najmniej 10 m od stert, stogów, budynków palnych"],
    ["Wydech silnika", "zabezpieczony przed wylotem iskier"],
    ["Paliwo", "najwyżej dobowe zapotrzebowanie, zamknięte nietłukące się naczynia, co najmniej 10 m od omłotów i płodów"],
    ["Ogień i palenie", "zakaz bliżej niż 10 m od omłotów i płodów; przy obsłudze maszyn i w transporcie - zakaz palenia"],
    ["Wyposażenie", "gaśnice w miejscach omłotów, stertowania i kombajnowania; w razie potrzeby sprzęt do wykonania pasów"],
    ["Miejsce omłotów - dodatkowo", "pojemnik z wodą co najmniej 200 dm³ z wiadrem (§ 32 ust. 5)"],
    ["Wypalanie słomy i pozostałości roślinnych na polach", "zakazane (§ 43)"],
  ])}
<h3>Lasy - najważniejsze liczby (§ 38-40)</h3>
${tab(["Zasada", "Wartość"], [
    ["Zakaz ognia (poza miejscami wyznaczonymi) i palenia", "w lesie i do 100 m od jego granicy, także łąki, torfowiska, wrzosowiska"],
    ["Gałęzie, chrust, odpady przy torach i drogach publicznych utwardzonych", "zakaz pozostawiania bliżej niż 30 m"],
    ["Kompleks leśny z dodatkowymi obowiązkami", "ponad 300 ha"],
    ["Źródło wody w lesie", "zbiornik co najmniej 50 m³ (albo dwa po min. 20 m³), ciek min. 10 dm³/s, hydranty min. 5 dm³/s, studnia z pompą min. 10 dm³/s"],
    ["Głębokość poboru", "do 4 m od lustra wody"],
    ["Stanowisko czerpania wody", "co najmniej 4 × 12 m"],
    ["Odległość do punktu poboru wody", "I kategoria - do 3 km; II kategoria - do 5 km"],
    ["Przegląd zbiorników sztucznych i studni", "raz w roku, od 1 marca do 30 kwietnia"],
  ])}
${przyklad("gospodarstwo w gminie Ogrodzieniec - żniwa", `<ol><li>Rolnik stawia stóg słomy 25 m od drewnianej stodoły. Budynek palny → wymagane <b>30 m</b>. Za blisko.</li><li>Ten sam stóg 60 m od lasu. Wymagane <b>100 m</b>. Za blisko.</li><li>Agregat spalinowy do suszarki stoi na słomie 6 m od stogu. Wymagane: podłoże niepalne i co najmniej <b>10 m</b>.</li><li>Kanister z paliwem na tydzień przy stogu - wolno najwyżej dobowe zapotrzebowanie, 10 m od płodów.</li><li>Po żniwach syn chce wypalić ściernisko - <b>zakazane</b> (§ 43) i jest wykroczeniem (art. 82 § 4 KW przy wypalaniu bliżej niż 100 m od zabudowań i lasów).</li></ol>`)}
${wlasciciel(`<p>„Stóg ustawił Pan 60 metrów od lasu. Przepis wymaga stu. Gdy stóg się zapali - a słoma potrafi zapalić się sama, jeśli jest wilgotna - iskry polecą do lasu. Lepiej przesunąć go na drugi koniec pola, niż potem tłumaczyć się z pożaru lasu.”</p>`)}
${wlasciciel(`<p>„Słoma z tego roku była zbierana po deszczu. Wilgotna słoma w stogu potrafi się nagrzewać od środka, aż się zapali. Przepis każe w takiej sytuacji okresowo mierzyć temperaturę. Wystarczy długi termometr wbity w środek stogu raz na kilka dni.”</p>`)}
${pulapki([
    "Zakaz ognia i palenia - w lesie i do <b>100 m</b> od granicy lasu.",
    "Sterta: od budynków palnych <b>30 m</b>, niepalnych <b>20 m</b>, od lasu <b>100 m</b>, od dróg publicznych i torów <b>30 m</b>, od granicy działki <b>10 m</b>.",
    "Strefa sterty - do <b>1000 m²</b> lub <b>5000 m³</b>.",
    "Pas wokół sterty: <b>2 m</b> szerokości, <b>3 m</b> od obrysu.",
    "Silnik spalinowy przy żniwach - <b>10 m</b>; elektryczny - <b>5 m</b>.",
    "Miejsce omłotów - beczka z wodą co najmniej <b>200 dm³</b>.",
    "Wypalanie słomy i pozostałości roślinnych na polach - <b>zakazane</b>.",
    "Kompleks leśny ponad <b>300 ha</b> - dodatkowe obowiązki (patrole, woda, dojazdy, bazy sprzętu).",
  ])}`),
  },
  {
    id: "oddymianie-drzwi", skrot: "DYM-D", tytul: "Oddymianie i drzwi przeciwpożarowe - jak trzymać dym z dala od ludzi",
    html: () => nbsp(`
${ludzku(`<p>Skoro ludzie giną głównie od dymu, to budynek musi z dymem walczyć na dwa sposoby. <b>Oddymianie</b> wyciąga dym na zewnątrz (klapy w dachu, wentylatory) albo nie wpuszcza go na klatkę schodową (nadciśnienie). <b>Drzwi przeciwpożarowe i dymoszczelne</b> zamykają dym i ogień w jednej strefie. Ale działają tylko wtedy, gdy są zamknięte.</p>`)}
${galeria(["drzwi-strych", "tabliczka-drzwi"])}
${wyklad(`<p>Proszę Państwa, drzwi przeciwpożarowe to element ściany oddzielenia. Ściana może być betonowa i mieć 2 godziny odporności, ale jeśli drzwi w niej są podparte klinem, cała strefa pożarowa przestaje istnieć. Dlatego blokowanie drzwi przeciwpożarowych w sposób uniemożliwiający ich samoczynne zamknięcie jest wprost zakazane (§ 4 ust. 1 pkt 15 rozp. 2010). A drzwi przeciwpożarowe trzeba oznakować (§ 4 ust. 2 pkt 4 lit. i).</p>
<p>Na obchodzie przy każdych drzwiach przeciwpożarowych sprawdzacie cztery rzeczy. <b>Tabliczka</b> w ościeżnicy: jest klasa, np. EI 30, i producent. <b>Samozamykacz</b>: otwórz i puść - drzwi mają się same zamknąć i zatrzasnąć, a w drzwiach dwuskrzydłowych najpierw jedno skrzydło, potem drugie. <b>Uszczelki</b>: nie wyrwane, nie zamalowane. <b>Nic nie blokuje</b>: klin, krzesło, sznurek, gaśnica pod skrzydłem.</p>
<p>A jeśli drzwi mają być na co dzień otwarte, bo jeżdżą przez nie wózki? Wtedy stosuje się <b>elektrotrzymacz</b> albo samozamykacz z funkcją przytrzymania, sterowany z czujek lub z systemu sygnalizacji pożarowej. Przy pożarze puszcza i drzwi się zamykają. To legalne, a klin nie jest.</p>`)}
<h3>Oddymianie - po co i co daje w przepisach</h3>
${tab(["Rola oddymiania", "Wartość", "Przepis"], [
    ["Instalacja ma usuwać dym tak, żeby w czasie ewakuacji na drogach nie było zadymienia ani temperatury, która ją uniemożliwi", "-", "§ 270 ust. 1 WT"],
    ["Musi mieć stały dopływ powietrza uzupełniającego", "bez napływu powietrza dym nie wyjdzie", "§ 270 ust. 1 pkt 2 WT"],
    ["Wydłuża przejście ewakuacyjne", "+50% (oddymianie uruchamiane czujkami dymu)", "§ 237 ust. 6 WT"],
    ["Wydłuża dojście ewakuacyjne", "+50% (oddymianie drogi ewakuacyjnej z czujkami dymu)", "§ 256 ust. 4 WT"],
    ["Powiększa strefę pożarową ZL", "+100%", "§ 227 WT"],
    ["Powiększa strefę pożarową PM", "+50%", "§ 229 WT"],
    ["Klatki schodowe ZL II w budynku N, ZL I-III i V w SW, PM Q ponad 500", "obudowane, drzwi dymoszczelne, urządzenia zapobiegające zadymieniu lub oddymiające z czujkami dymu", "§ 245 WT"],
    ["Klapy dymowe - klasa", "B300 30 (otwierane automatycznie), B600 30 (tylko ręcznie)", "§ 270 ust. 5 WT"],
    ["Wentylatory oddymiające - klasa", "F600 60 przy dymie ponad 400 °C, w pozostałych F400 120", "§ 270 ust. 4 WT"],
  ])}
<p>Oznaczenia: <b>S</b> przy klasie drzwi lub przewodu to dymoszczelność. Drzwi dymoszczelne nie muszą być ognioodporne, ale nie przepuszczają dymu. Drzwi „EI 30-S” są i ognioodporne, i dymoszczelne.</p>
${przyklad("obchód drzwi w szkole", `${tab(["Co widzisz", "Ocena"], [
    ["Drzwi na klatkę podparte gaśnicą, „bo dzieci biegają”", "zakaz z § 4 ust. 1 pkt 15 rozp. 2010; dodatkowo gaśnica nie na swoim miejscu"],
    ["Samozamykacz odkręcony", "drzwi nie zamkną się same - do naprawy"],
    ["Brak tabliczki znamionowej", "nie wiadomo, czy to drzwi przeciwpożarowe - żądać dokumentów (deklaracja, protokół odbioru)"],
    ["Drzwi dwuskrzydłowe zamykają się w złej kolejności i stają uchylone", "brak lub uszkodzony regulator kolejności zamykania"],
    ["Szyba w drzwiach pęknięta i zastąpiona zwykłym szkłem", "drzwi straciły klasę odporności"],
  ])}`)}
${przyklad("magazyn z ruchem wózków", `<ol><li>Drzwi przeciwpożarowe między magazynem a halą produkcyjną są cały dzień otwarte, bo jeżdżą wózki widłowe.</li><li>Zamiast klina: elektrotrzymacz połączony z czujkami dymu po obu stronach drzwi (albo z SSP).</li><li>Na podłodze w świetle drzwi - pas, na którym nie wolno stawiać palet.</li><li>Raz na jakiś czas test: wyzwolenie czujki i sprawdzenie, czy drzwi się zamknęły. Wynik w książce przeglądów.</li></ol>`)}
${wlasciciel(`<p>„Drzwi przeciwpożarowe podparte klinem to w praktyce brak drzwi. Pożar z magazynu przejdzie na biura w kilka minut. Rozumiem, że wózki muszą przejeżdżać - dlatego proponuję elektrotrzymacz: drzwi stoją otwarte, a gdy czujka wykryje dym, same się zamkną.”</p>`)}
${wlasciciel(`<p>„Klapy dymowe w dachu hali mają przegląd z 2023 roku. Urządzenia przeciwpożarowe przegląda się co najmniej raz w roku. Klapa, która się nie otworzy, nie wypuści dymu i ludzie w hali stracą widoczność, zanim dojdą do wyjścia.”</p>`)}
${pulapki([
    "Blokowanie drzwi przeciwpożarowych uniemożliwiające samoczynne zamknięcie - <b>zakazane</b> (§ 4 ust. 1 pkt 15).",
    "Drzwi przeciwpożarowe trzeba <b>oznakować</b> (§ 4 ust. 2 pkt 4 lit. i).",
    "S = <b>dymoszczelność</b>; E = szczelność ogniowa; I = izolacyjność.",
    "Oddymianie z czujkami dymu: przejście i dojście <b>+50%</b>; strefa ZL <b>+100%</b>, PM <b>+50%</b>.",
    "Instalacja oddymiająca potrzebuje <b>dopływu powietrza uzupełniającego</b>.",
    "Klapy dymowe: B300 30 automatyczne, B600 30 tylko ręczne.",
    "Przedsionek przeciwpożarowy - co najmniej <b>1,4 × 1,4 m</b>.",
  ])}`),
  },
  {
    id: "szkolenia", skrot: "SZKOL", tytul: "Szkolenie pracowników z ochrony przeciwpożarowej - jak, jak często, jak udokumentować",
    html: () => nbsp(`
${ludzku(`<p>Właściciel musi <b>zapoznać pracowników z przepisami przeciwpożarowymi</b> (art. 4 ust. 1 pkt 6 ustawy o ochronie ppoż.). Szczegółowego rozporządzenia o tym, jak i jak często szkolić, <b>nie ma</b>. Dlatego to, jak zrobisz szkolenie, ustalasz w instrukcji bezpieczeństwa pożarowego i dokumentujesz tak, żeby przy kontroli albo po wypadku było widać, że obowiązek wykonano.</p>`)}
${wyklad(`<p>Proszę Państwa, to jest temat, w którym przepis milczy, a wykładowcy kursu mówią wprost: tu wszystko zależy od Was. Jedyna podstawa to art. 4 ust. 1 pkt 6 ustawy. Nie ma rozporządzenia z programem, nie ma terminów, nie ma gotowych wzorów. Zapoznawanie z przepisami to jednak czynność z zakresu ochrony przeciwpożarowej, więc powinna ją wykonywać osoba z kwalifikacjami: inspektor, technik albo inżynier pożarnictwa (art. 4 ust. 2a-2b).</p>
<p>Zasady szkoleń zapisuje się w IBP, w punkcie o sposobie zapoznania użytkowników i pracowników z przepisami i treścią instrukcji (§ 6 ust. 1 pkt 6 rozp. 2010). Wykładowca radził pisać ten rozdział szczególnie starannie, bo to pierwsza rzecz, którą sprawdza się po pożarze z ofiarami: czy ludzie wiedzieli, co robić.</p>
<p>Najważniejszy szczegół dokumentu: w zaświadczeniu albo oświadczeniu pracownika musi paść „ustawowy” zwrot - <b>„zapoznany z przepisami przeciwpożarowymi”</b>. Samo „przeszkolony z obsługi gaśnicy” nie wystarczy. Podpisują szkolący i szkolony, a dokument trafia do akt osobowych.</p>`)}
<h3>Dokumentacja szkolenia (materiały kursu CS PSP)</h3>
${tab(["Dokument", "Co zawiera"], [
    ["Program", "przygotowany indywidualnie dla tego obiektu i tych pracowników"],
    ["Lista obecności", "data, temat, podpisy uczestników"],
    ["Dane prowadzącego", "imię, nazwisko, kwalifikacje (np. uprawnienia inspektora ochrony ppoż.)"],
    ["Zaświadczenie lub oświadczenie pracownika", "zwrot o zapoznaniu z przepisami przeciwpożarowymi, podpis szkolącego i szkolonego; do akt osobowych"],
  ])}
<h3>Jak często - propozycje z kursu (przepis nie określa)</h3>
${tab(["Propozycja", "Uzasadnienie"], [
    ["co 2 lata i po zmianach w użytkowaniu lub technologii", "tak często co najmniej aktualizuje się IBP (wykładowca)"],
    ["co rok - stanowiska podwyższonego ryzyka (np. tankowanie na stacji paliw)", "slajd prezentacji „Szkolenia p.poż.”"],
    ["co 3 lata - pracownicy „średniego szczebla”", "jak wyżej"],
    ["co 6 lat - kierownicy", "jak wyżej"],
    ["zawsze ponownie - po istotnej zmianie przepisów lub w obiekcie", "jak wyżej"],
  ])}
<p>Częstotliwość, którą wybierzesz, wpisz do IBP. Od tej chwili jest obowiązkiem dla tego zakładu.</p>
<h3>Program szkolenia - przykład dla hurtowni (1,5-2 godziny)</h3>
<ol><li>Zagrożenia pożarowe w tym obiekcie: co się pali, gdzie są strefy Ex, butle, akumulatornia.</li><li>Zakazy z § 4 rozp. 2010 na przykładach z hali: drogi ewakuacyjne, drzwi przeciwpożarowe, składowanie.</li><li>Postępowanie na wypadek pożaru: alarm, 112, kto wyłącza prąd i gaz, kto prowadzi ewakuację.</li><li>Drogi ewakuacyjne i miejsce zbiórki - przejście ich w terenie.</li><li>Gaśnice i hydranty: rodzaje, rozmieszczenie, <b>praktyczne gaszenie</b> próbnego ogniska.</li><li>Prace niebezpieczne pożarowo - kto wydaje zezwolenie.</li><li>Pytania, test kilku pytań, podpisanie oświadczeń.</li></ol>
${przyklad("nowy pracownik w biurze", `<ol><li>Pierwszego dnia - krótkie zapoznanie: gdzie wyjścia, miejsce zbiórki, gaśnice, numer alarmowy, instrukcja na ścianie.</li><li>W najbliższym terminie - pełne szkolenie według programu z IBP.</li><li>Oświadczenie: „Zostałem zapoznany z przepisami przeciwpożarowymi oraz treścią instrukcji bezpieczeństwa pożarowego obowiązującej w …” - podpis pracownika i szkolącego, do akt.</li></ol>`)}
${wlasciciel(`<p>„Szkolenie BHP to co innego niż zapoznanie z przepisami przeciwpożarowymi. Obowiązek z ustawy o ochronie przeciwpożarowej trzeba udokumentować osobno, z jasnym zapisem w oświadczeniu. Inaczej po pożarze trudno będzie wykazać, że pracownicy zostali zapoznani z przepisami.”</p>`)}
${wlasciciel(`<p>„Najlepsza część szkolenia to dziesięć minut z gaśnicą na placu. Kto raz pociągnął zawleczkę i zgasił ognisko w tacy, ten w prawdziwym pożarze nie będzie szukał instrukcji na etykiecie.”</p>`)}
${pulapki([
    "Obowiązek zapoznania pracowników z przepisami ppoż. - <b>art. 4 ust. 1 pkt 6</b> ustawy o ochronie ppoż.",
    "Brak rozporządzenia o programie i częstotliwości - zasady ustala się w <b>IBP</b> (§ 6 ust. 1 pkt 6).",
    "W oświadczeniu musi być zwrot o <b>zapoznaniu z przepisami przeciwpożarowymi</b>.",
    "Oświadczenie przechowuje się w <b>aktach osobowych</b> pracownika (wykładowca).",
    "Szkolenie prowadzi osoba z kwalifikacjami: <b>inspektor</b>, technik albo inżynier pożarnictwa.",
  ])}`),
  },
  {
    id: "zamienne", skrot: "ZAMIEN", tytul: "Rozwiązania zamienne w praktyce - przypadki, normy zagraniczne, rachunek czasu ewakuacji",
    html: () => nbsp(`
${ludzku(`<p>Rozwiązanie zamienne to sytuacja, w której budynek <b>nie spełnia</b> jakiegoś wymagania z przepisu, a zamiast niego dostaje <b>inne zabezpieczenie</b>, które daje co najmniej taki sam poziom bezpieczeństwa. Nie jest to „ulga” ani „łagodniejsza wersja”. Przepis mówi wprost: rozwiązanie ma zapewnić <b>niepogorszenie</b> warunków ochrony przeciwpożarowej. Wymyśla je rzeczoznawca w ekspertyzie, a zatwierdza komendant wojewódzki PSP.</p>`)}
${wyklad(`<p>Proszę Państwa, zacznijmy od tego, czego rozwiązanie zamienne <b>musi</b> dowieść. Art. 6a ust. 1 ustawy o ochronie przeciwpożarowej wymienia pięć celów. Zamiennik ma ograniczać możliwość powstania pożaru, a jeśli pożar wybuchnie, ma: zachować nośność konstrukcji przez określony czas, ograniczyć rozprzestrzenianie się ognia i dymu w budynku, ograniczyć przerzut pożaru na sąsiadów, zapewnić ewakuację ludzi albo ich uratowanie w inny sposób i uwzględnić bezpieczeństwo ratowników. Jeśli ekspertyza poprawia jedno, a psuje drugie, komendant odmówi.</p>
<p>Druga rzecz: nie każde „tryskacze zamiast czegoś” to rozwiązanie zamienne. Wiele zamian jest <b>wpisanych w same przepisy</b>. Tryskacze wydłużają dojście o 50% (§ 256 ust. 4 WT), powiększają strefę o 100% (§ 227 i 229 WT), zmniejszają odległość między budynkami (§ 271 ust. 6-7 WT). Jeśli projekt mieści się w tych powiększeniach, żadnej ekspertyzy ani postanowienia nie trzeba, bo przepis jest spełniony. Rozwiązanie zamienne zaczyna się dopiero tam, gdzie przepis się kończy.</p>
<p>Trzecia: rozwiązanie zamienne to nie jednorazowy papier. To <b>zobowiązanie na całe życie budynku</b>. Jeśli komendant zgodził się na dłuższy korytarz pod warunkiem oddymiania, to oddymianie musi działać zawsze. Na obchodzie najpierw pytacie: czy obiekt ma postanowienie o rozwiązaniach zamiennych? Jeśli tak - jakie warunki? I potem sprawdzacie każdy z nich.</p>`)}
<h3>Gdzie przepisy dopuszczają rozwiązania zamienne i kto je zatwierdza</h3>
${tab(["Sytuacja", "Kto zatwierdza", "Podstawa"], [
    ["Ogólna zasada - każde wymaganie ochrony ppoż. w przypadkach określonych w przepisach", "komendant <b>wojewódzki</b> PSP, postanowienie (zażalenie), na wniosek z ekspertyzą techniczną", "art. 6a ust. 1-2 ustawy o ochronie ppoż."],
    ["Nowy budynek - odstępstwo od przepisów techniczno-budowlanych", "organ architektoniczno-budowlany po upoważnieniu ministra; w części ppoż. ekspertyza rzeczoznawcy + postanowienie komendanta wojewódzkiego", "art. 9 ust. 1-3 PB"],
    ["Istniejący budynek: przebudowa, rozbudowa, zmiana sposobu użytkowania, usuwanie zagrożenia życia", "wystarczy postanowienie komendanta wojewódzkiego - bez odstępstwa od ministra", "art. 9 ust. 6 PB"],
    ["Warunki techniczne - przebudowa, nadbudowa, rozbudowa, zmiana użytkowania", "ekspertyza rzeczoznawcy uzgodniona z komendantem wojewódzkim (zabytki - także z konserwatorem)", "§ 2 ust. 2, 3a i 4 WT"],
    ["Hydranty, woda, instalacja wodociągowa ppoż., stałe urządzenia gaśnicze, SSP, DSO i inne wymienione paragrafy rozp. 2010", "ekspertyza rzeczoznawcy + uzgodnienie z komendantem wojewódzkim", "§ 1 ust. 2 rozp. 2010"],
    ["Woda do zewnętrznego gaszenia - gdy wymagań nie da się spełnić", "komendant wojewódzki", "§ 8 ust. 3 rozp. 2009"],
    ["Brak źródła wody - <b>zastępcze źródło na czas określony</b> (zbiornik, studnia, ciek)", "komendant <b>powiatowy</b>", "§ 8 ust. 1 rozp. 2009"],
    ["Droga pożarowa - gdy nie da się jej doprowadzić", "komendant wojewódzki", "§ 13 ust. 4 rozp. 2009"],
  ])}
${wyklad(`<p>Teraz rachunek, na którym opiera się większość ekspertyz dotyczących ewakuacji. Dwa czasy z prezentacji T-3 kursu. <b>DCBE</b> (po angielsku ASET) - dostępny czas bezpiecznej ewakuacji: ile minut mija, zanim pierwszy parametr w budynku osiągnie wartość groźną dla człowieka. Może to być temperatura, grubość warstwy dymu, widoczność, trujące gazy, promieniowanie albo zawalenie konstrukcji. <b>WCBE</b> (RSET) - wymagany czas bezpiecznej ewakuacji: ile potrzeba, żeby wszyscy wyszli. Składa się z pięciu kawałków: detekcja, alarm, rozpoznanie, reakcja i przemieszczanie.</p>
<p>Warunek jest jeden: <b>WCBE musi być krótszy niż DCBE</b>. Rzeczoznawca liczy DCBE prostymi wzorami z norm brytyjskich (BS) i amerykańskich (NFPA) albo symulacją komputerową dymu (programy CFD, np. FDS). WCBE liczy z prędkości ruchu ludzi i przepustowości drzwi i schodów. Jeśli wychodzi źle, zamiennik ma albo wydłużyć DCBE (oddymianie, tryskacze), albo skrócić WCBE (wcześniejsze wykrycie przez SSP, komunikat głosowy DSO zamiast syreny, dodatkowe wyjście).</p>`)}
${przyklad("rachunek czasu ewakuacji (liczby z materiałów kursu)", `<ol><li>Detekcja 60 s + alarm 30 s + rozpoznanie 30 s + reakcja 60 s + przemieszczanie 120 s = <b>300 s = 5 min</b> (WCBE).</li><li>Symulacja dymu pokazuje DCBE = <b>4 min</b>.</li><li>5 min jest dłuższe niż 4 min → ewakuacja <b>nie jest bezpieczna</b>.</li><li>Zamiennik A: SSP z czujkami dymu skraca detekcję z 60 do 20 s, a komunikat głosowy DSO skraca rozpoznanie i reakcję o 40 s → WCBE ≈ 3 min 40 s.</li><li>Zamiennik B: oddymianie korytarza wydłuża DCBE z 4 do 7 min.</li><li>Najczęściej ekspertyza łączy oba, żeby mieć zapas.</li></ol><p>Liczby w punktach 4-5 są poglądowe - w ekspertyzie każdą z nich trzeba uzasadnić obliczeniem albo symulacją.</p>`)}
<h3>Skąd rzeczoznawca bierze metody - normy i wytyczne zagraniczne</h3>
${tab(["Kraj / źródło", "Co z niego się bierze", "Przykład użycia"], [
    ["USA - NFPA 92", "projektowanie systemów sterowania dymem", "oddymianie atrium, hali, korytarza w ekspertyzie dłuższego dojścia"],
    ["USA - NFPA 13, FM Global", "tryskacze, magazyny wysokiego składowania", "strefa magazynowa większa niż w WT - tryskacze projektowane według FM Global (często wymaganie ubezpieczyciela)"],
    ["USA - NFPA 101", "zasady bezpieczeństwa życia ludzi, ewakuacja", "przepustowość wyjść, liczenie czasu przejścia"],
    ["USA - FDS (program NIST)", "symulacja rozwoju pożaru i dymu (CFD)", "wyznaczenie DCBE"],
    ["Wielka Brytania - BS 7974, BS 9999", "inżynieria bezpieczeństwa pożarowego, projektowanie oparte na analizie", "rachunek DCBE/WCBE w ekspertyzie"],
    ["Niemcy - VdS CEA 4001", "projektowanie i utrzymanie instalacji tryskaczowych (wytyczne ubezpieczycieli)", "tryskacze w hali, która zastępują wymaganą ścianę oddzielenia lub powiększają strefę"],
    ["Niemcy - DIN 18232", "oddymianie grawitacyjne (klapy dymowe) i mechaniczne", "dobór powierzchni klap w hali"],
    ["Czechy - ČSN 73 08xx", "czeskie normy projektowania pożarowego budynków", "w Polsce stosowane <b>rzadko</b> - spotkasz je raczej w literaturze niż w ekspertyzach"],
  ])}
<p>Zasada przy normach zagranicznych: rzeczoznawca stosuje wybraną normę <b>w całości i spójnie</b>, nie wybiera z kilku norm tylko tego, co mu pasuje. Norma zagraniczna nie zastępuje polskiego przepisu. Służy do udowodnienia, że zamiennik jest równie bezpieczny.</p>
<h3>Przypadki z praktyki (uproszczone, do nauki)</h3>
${przyklad("1. Hotel - za długie dojście", `<p><b>Problem:</b> pensjonat (ZL V), ślepy korytarz 16 m do klatki, a przy jednym dojściu wolno 10 m. Oddymianie korytarza dałoby +50% (15 m) - wciąż za mało, więc samo powiększenie z WT nie wystarczy.</p><p><b>Możliwy zamiennik w ekspertyzie:</b> oddymianie korytarza z czujkami dymu, drzwi z pokoi EI 30 z samozamykaczami, SSP z DSO, obudowa klatki z drzwiami dymoszczelnymi; rachunek DCBE/WCBE według BS lub NFPA.</p><p><b>Twoja rola:</b> w IBP warunki z postanowienia; na obchodzie: przegląd oddymiania (raz w roku), samozamykacze, drzwi do pokoi niepodparte, test DSO.</p>`)}
${przyklad("2. Hala magazynowa - strefa za duża", `<p><b>Problem:</b> parterowa hala PM, Q = 1500 MJ/m², 24 000 m² w jednej strefie. Limit z § 228 WT: 8000 m²; z tryskaczami i oddymianiem +150% (§ 229 WT) = 20 000 m². Wciąż za dużo.</p><p><b>Możliwy zamiennik:</b> tryskacze projektowane według FM Global lub VdS dla konkretnego sposobu składowania, oddymianie według DIN 18232 lub NFPA 92, SSP z monitoringiem do straży, dodatkowe hydranty i drogi pożarowe z dwóch stron, ograniczenie wysokości składowania.</p><p><b>Twoja rola:</b> pilnować warunków z postanowienia, zwłaszcza wysokości składowania i rodzaju towaru. Jeśli najemca zmieni towar z kartonów na opony, założenia ekspertyzy przestają obowiązywać.</p>`)}
${przyklad("3. Zabytkowy dworek przerobiony na pensjonat", `<p><b>Problem:</b> jedna drewniana, otwarta klatka schodowa, brak możliwości dobudowy drugiej, drzwi wejściowe otwierane do środka. Zmiana sposobu użytkowania na ZL V.</p><p><b>Możliwy zamiennik:</b> SSP w całym budynku z DSO, drzwi do pokoi EI 30, zewnętrzne schody ewakuacyjne od strony ogrodu, ograniczenie liczby gości, impregnacja ogniochronna drewnianej klatki. Ekspertyzę uzgadnia się z komendantem wojewódzkim i z wojewódzkim konserwatorem zabytków (§ 2 ust. 4 WT). Drzwi wyjściowe w zabytku mogą zostać otwierane do środka (§ 236 ust. 4 WT).</p><p><b>Twoja rola:</b> SSP i DSO z aktualnymi przeglądami, schody zewnętrzne odśnieżone i niezastawione, liczba gości zgodna z ekspertyzą.</p>`)}
${przyklad("4. Droga pożarowa w zwartej zabudowie miasteczka", `<p><b>Problem:</b> nowy sklep ZL I w rynku małego miasta na Jurze. Drogi pożarowej wzdłuż dłuższego boku nie da się zrobić, bo z obu stron stoją kamienice.</p><p><b>Najpierw przepis:</b> przy zabudowie pierzejowej wystarczy dostęp do 100% elewacji frontowej (§ 12 ust. 3 pkt 3 rozp. 2009) - może się okazać, że rozwiązanie zamienne nie jest potrzebne.</p><p><b>Gdy i to niemożliwe:</b> rozwiązanie zamienne uzgodnione z komendantem wojewódzkim (§ 13 ust. 4 rozp. 2009), np. SSP z monitoringiem, dodatkowe hydranty wewnętrzne, przejście dla ratowników z tyłu przez bramę.</p>`)}
${przyklad("5. Brak wody do gaszenia na wsi", `<p><b>Problem:</b> nowa hala PM, wymagane 20 dm³/s, a wiejski wodociąg daje 5 dm³/s.</p><p><b>Droga szybka:</b> komendant <b>powiatowy</b> może na czas określony dopuścić zastępcze źródło wody - zbiornik, studnię albo ciek ze stanowiskiem czerpania i dojazdem (§ 8 ust. 1 rozp. 2009).</p><p><b>Droga stała:</b> zbiornik przeciwpożarowy - dla hali PM o pojemności równej brakującej wydajności wodociągu pomnożonej przez czas trwania pożaru według Polskiej Normy (§ 6 ust. 10 pkt 1 rozp. 2009) albo rozwiązanie zamienne uzgodnione z komendantem wojewódzkim (§ 8 ust. 3).</p><p><b>Twoja rola:</b> sprawdzić, czy zbiornik jest pełny, dojazd wolny, stanowisko czerpania utwardzone, a termin „czasowego” źródła nie minął.</p>`)}
${przyklad("6. Za mała odległość od sąsiada", `<p><b>Problem:</b> rozbudowa hali (PM, Q = 1200) zbliża ją na 10 m do sąsiedniej hali, a wymagane jest 15 m (§ 271 WT).</p><p><b>Najpierw przepis:</b> tryskacze w strefach przy obu ścianach dają -50% (7,5 m), przy jednej -25% (11,25 m) - § 271 ust. 6-7. Albo ściana zewnętrzna wykonana jak ściana oddzielenia przeciwpożarowego (§ 271 ust. 10-12).</p><p><b>Gdy to niemożliwe:</b> rozwiązanie zamienne, np. kurtyna wodna (zraszacze) na ścianie, uzasadnione obliczeniem promieniowania cieplnego.</p>`)}
<h3>Na obchodzie - lista kontrolna obiektu z rozwiązaniami zamiennymi</h3>
<ol><li>Czy jest <b>postanowienie</b> komendanta wojewódzkiego i ekspertyza? Poproś o kopie.</li><li>Wypisz <b>warunki</b> z postanowienia, punkt po punkcie.</li><li>Czy warunki są w <b>IBP</b>?</li><li>Czy każde urządzenie zamiennika ma <b>aktualny przegląd</b> (co najmniej raz w roku)?</li><li>Czy nie zmieniło się <b>użytkowanie</b>: towar, liczba osób, wysokość składowania, układ ścian? Każda zmiana może unieważnić założenia ekspertyzy.</li></ol>
${wlasciciel(`<p>„Pana hala ma postanowienie komendanta wojewódzkiego: zamiast ściany oddzielenia są tryskacze i oddymianie. To znaczy, że te urządzenia są dla budynku tym, czym dla samochodu hamulce. Jeśli tryskacze nie mają przeglądu, to formalnie nie ma Pan ani ściany, ani tryskaczy.”</p>`)}
${wlasciciel(`<p>„Chce Pan wynająć część hali firmie z oponami. Ekspertyza, na której opiera się Pana postanowienie, zakładała kartony do 6 m wysokości. Opony to zupełnie inne obciążenie ogniowe. Zanim podpisze Pan umowę, rzeczoznawca musi sprawdzić, czy założenia nadal są spełnione.”</p>`)}
${pulapki([
    "Rozwiązania zamienne zatwierdza komendant <b>wojewódzki</b> PSP w drodze <b>postanowienia</b>, na które służy <b>zażalenie</b>.",
    "Podstawą wniosku jest <b>ekspertyza techniczna</b> rzeczoznawcy do spraw zabezpieczeń przeciwpożarowych.",
    "Zastępcze źródło wody na czas określony dopuszcza komendant <b>powiatowy</b> (§ 8 ust. 1 rozp. 2009).",
    "Zamiennik musi zapewnić <b>niepogorszenie</b> warunków ochrony ppoż. i spełnić 5 celów z art. 6a ust. 1.",
    "Istniejący budynek - wystarczy postanowienie komendanta; nowy - dodatkowo odstępstwo z art. 9 PB.",
    "Ewakuacja jest bezpieczna, gdy <b>WCBE &lt; DCBE</b> (pyt. z prezentacji T-3).",
    "Powiększenia z WT (tryskacze, oddymianie) to <b>nie</b> rozwiązania zamienne - to spełnienie przepisu.",
  ])}`),
  },
  {
    id: "garaze", skrot: "GAR", tytul: "Garaże - od domowego po podziemny pod blokiem",
    html: () => nbsp(`
${ludzku(`<p>Dla przepisów przeciwpożarowych garaż to strefa <b>PM</b>, jak magazyn (§ 209 ust. 3 WT). Samochód to kilkadziesiąt litrów paliwa, opony, tworzywa, a coraz częściej duży akumulator. Pożar w garażu podziemnym daje gęsty dym, który nie ma gdzie uciec. Dlatego im większy i głębszy garaż, tym więcej wymagań.</p>`)}
${galeria(["garaz-podziemny", "garaz-wielopoziomowy"])}
${wyklad(`<p>Proszę Państwa, w garażach rozróżniamy dwie rzeczy: <b>zamknięty i otwarty</b> oraz <b>nadziemny i podziemny</b>. W garażu otwartym przewietrzanie naturalne musi spełniać trzy warunki: niezamykane otwory na co najmniej 35% powierzchni ścian na każdej kondygnacji, ściany z otworami nie dalej niż 100 m od siebie, posadzka zagłębiona najwyżej 0,6 m pod terenem, a przy głębszym - fosa (§ 108 ust. 2 WT). Dym i spaliny uciekają tam same. Garaż zamknięty potrzebuje wentylacji: naturalnej w małych garażach, grawitacyjnej w ogrzewanych do 10 stanowisk, mechanicznej sterowanej czujkami tlenku węgla w pozostałych (§ 108 ust. 1).</p>
<p>Gaz płynny w autach to osobna historia. Propan-butan jest cięższy od powietrza i w garażu podziemnym zebrałby się przy posadzce. Dlatego jeśli wolno tam parkować auta na LPG, wentylacja mechaniczna musi być sterowana czujkami propanu-butanu (§ 108 ust. 1 pkt 4 WT), a przy wjeździe ma wisieć czytelna informacja, czy auta na gaz wolno wjeżdżać, czy nie (§ 4 ust. 2 pkt 5 rozp. 2010).</p>
<p>Garaż w domu? Wolnostojący garaż do 2 stanowisk w ogóle nie musi spełniać wymagań klasy odporności pożarowej (§ 213 WT). Ale już motorower czy skuter w piwnicy bloku z paliwem w baku i podłączonym akumulatorem - to zakaz (§ 4 ust. 1 pkt 3 rozp. 2010) i wykroczenie (art. 82 § 1 pkt 6 KW).</p>`)}
<h3>Wymagania dla garaży - zestawienie</h3>
${tab(["Wymaganie", "Kiedy", "Przepis"], [
    ["Wymagania jak dla PM", "każdy garaż będący odrębną strefą", "§ 209 ust. 3 WT"],
    ["Hydranty 33", "garaż zamknięty jednokondygnacyjny ponad 10 stanowisk; każdy garaż wielokondygnacyjny", "§ 19 ust. 2 rozp. 2010"],
    ["System sygnalizacji pożarowej", "garaż podziemny - strefa ponad 1500 m² albo więcej niż 1 kondygnacja podziemna", "§ 28 ust. 1 pkt 17 rozp. 2010"],
    ["Oświetlenie awaryjne ewakuacyjne", "garaże oświetlone tylko sztucznie, pomieszczenia ponad 1000 m² netto", "§ 181 ust. 3 WT"],
    ["Wentylacja mechaniczna z czujkami CO", "garaże zamknięte inne niż małe (do 10 stanowisk) i kanały rewizyjne w warsztatach", "§ 108 ust. 1 pkt 3 WT"],
    ["Wentylacja z czujkami propanu-butanu", "garaż podziemny, w którym wolno parkować auta na LPG", "§ 108 ust. 1 pkt 4 WT"],
    ["Informacja przy wjeździe o autach na LPG", "garaż zamknięty z posadzką poniżej terenu", "§ 4 ust. 2 pkt 5 rozp. 2010"],
    ["Garaż wolnostojący do 2 stanowisk", "bez wymagań klasy odporności pożarowej", "§ 213 pkt 3 WT"],
    ["Pojazd w pomieszczeniu nieprzeznaczonym", "tylko z pustym zbiornikiem i odłączonym akumulatorem", "§ 4 ust. 1 pkt 3 rozp. 2010"],
  ])}
${przyklad("garaż podziemny pod blokiem w Zawierciu", `<p>Jedna kondygnacja podziemna, 1200 m², 45 miejsc, zamknięty.</p>
<ol><li>Strefa PM, jedna kondygnacja podziemna, 1200 m² - <b>SSP nie jest wymagany</b> (próg: ponad 1500 m² albo więcej niż jedna kondygnacja podziemna).</li><li>Wielostanowiskowy, zamknięty → <b>hydranty 33</b> (ponad 10 stanowisk).</li><li>Oświetlony tylko sztucznie, ponad 1000 m² → <b>oświetlenie ewakuacyjne</b> co najmniej 1 godzinę.</li><li>Wentylacja mechaniczna z czujkami <b>tlenku węgla</b>.</li><li>Wspólnota pozwala parkować auta na LPG → wentylacja z czujkami <b>propanu-butanu</b> i informacja przy wjeździe.</li><li>Gaśnice: PM z Q zwykle do 500 MJ/m², więc 2 kg środka na każde 300 m² → 4 jednostki = 8 kg; o liczbie zdecyduje i tak zasada 30 m.</li></ol>`)}
${przyklad("samochody elektryczne w garażu", `<ol><li>Przepisy WT nie mają osobnych wymagań dla aut elektrycznych w garażach.</li><li>Stacje i punkty ładowania objęte rozporządzeniem z 2019 r.: zakaz przedłużaczy przewodu ładowania (§ 10 rozp. 2019), wyłącznik główny, wyłącznik różnicowoprądowy, ochrona przed najechaniem (materiały kursu).</li><li>Na obchodzie: czy punkt ładowania nie stoi na drodze ewakuacyjnej, czy jest oznakowany i czy straż wie, gdzie w garażu są auta elektryczne i jak wyłączyć ładowanie.</li><li>Pożar akumulatora auta trudno ugasić i może się powtarzać - patrz temat o ładowarkach i bateriach.</li></ol>`)}
${wlasciciel(`<p>„W garażu pod blokiem czujki tlenku węgla mają przegląd sprzed trzech lat. Jeśli wentylacja nie ruszy, spaliny zbiorą się przy porannym wyjeździe aut, a przy pożarze dym zostanie w garażu. To instalacja, którą przegląda się co najmniej raz w roku - proszę wpisać ją do planu przeglądów wspólnoty.”</p>`)}
${wlasciciel(`<p>„Przy wjeździe nie ma żadnej tabliczki, czy wolno wjeżdżać autem na gaz. Przepis wymaga czytelnej informacji. Jeśli instalacja nie ma czujek propanu-butanu, tabliczka musi mówić wprost: zakaz wjazdu pojazdów zasilanych gazem LPG.”</p>`)}
${pulapki([
    "Garaż = wymagania <b>PM</b> (§ 209 ust. 3 WT).",
    "Hydranty <b>33</b>: zamknięty jednokondygnacyjny ponad <b>10</b> stanowisk; każdy wielokondygnacyjny.",
    "SSP w garażu podziemnym: ponad <b>1500 m²</b> albo więcej niż <b>1</b> kondygnacja podziemna.",
    "Oświetlenie ewakuacyjne w garażu oświetlonym sztucznie: pomieszczenia ponad <b>1000 m²</b>.",
    "Garaż otwarty: otwory co najmniej <b>35%</b> ścian, ściany z otworami do <b>100 m</b>, zagłębienie do <b>0,6 m</b>.",
    "LPG w garażu podziemnym: wentylacja z czujkami <b>propanu-butanu</b> + informacja przy wjeździe.",
    "Motorower w piwnicy - tylko z <b>opróżnionym zbiornikiem i odłączonym akumulatorem</b> (pyt. 461).",
  ])}`),
  },
  {
    id: "stacje-paliw", skrot: "CPN", tytul: "Stacje paliw - odmierzacze, zbiorniki, gaz płynny i sprzęt gaśniczy",
    html: () => nbsp(`
${ludzku(`<p>Stacja paliw to mały zakład z dużą ilością cieczy i gazów palnych tuż przy drodze i ludziach. Wymagania są w rozporządzeniu o bazach i stacjach paliw z 2023 r. (Dz.U. 2023 poz. 1707). Inspektor nie projektuje stacji, ale musi umieć sprawdzić podstawy: strefy Ex przy odmierzaczach, sprzęt gaśniczy, odległości, porządek przy studzienkach.</p>`)}
${galeria(["stacja-paliw", "stacja-paliw2"])}
${wyklad(`<p>Proszę Państwa, na stacji najgroźniejsze są <b>pary</b>, nie ciecz. Benzyna paruje, pary są cięższe od powietrza i spływają do najniższych miejsc: do studzienek, kanałów, otworów piwnicznych. Dlatego w promieniu 5 m od odmierzacza nie może być studzienek kanalizacyjnych, wodociągowych i ciepłowniczych ani otworów do pomieszczeń z podłogą poniżej terenu (§ 118 rozp. 2023/1707). Przy zbiornikach i odmierzaczach gazu płynnego ta odległość wynosi 8 m dla niezasyfonowanych studzienek (§ 123).</p>
<p>Strefy zagrożenia wybuchem przy odmierzaczach i zbiornikach wynikają z załącznika do rozporządzenia. Część hydrauliczna odmierzacza to strefa 1, okolica odpowietrzenia zbiornika strefa 2 (patrz temat o strefach Ex). Pawilon stacji ma stać <b>poza strefą zagrożenia wybuchem</b> i być z elementów nierozprzestrzeniających ognia (§ 104).</p>
<p>W pawilonie stacji sprzedaje się też płyny. Ciecze z temperaturą zapłonu 55 °C i niższą, np. rozpuszczalniki, wolno trzymać w magazynku tylko w opakowaniach do 1 litra i łącznie do 50 litrów (§ 105). Wyższa temperatura zapłonu, np. oleje silnikowe - bez ograniczeń ilości.</p>`)}
<h3>Sprzęt gaśniczy na stacji paliw (§ 120 rozp. 2023/1707)</h3>
${tab(["Sprzęt", "Ilość"], [
    ["gaśnice przewoźne po 25 kg", "2"],
    ["gaśnice przenośne proszkowe po 6 kg", "2"],
    ["koce gaśnicze", "3"],
    ["na każde stanowisko wydawania gazu płynnego", "dodatkowo 2 gaśnice proszkowe 6 kg i koc gaśniczy"],
  ])}
<p>Gaśnice na stacjach paliw i w magazynach butli LPG określa to rozporządzenie, a nie ogólny § 32 rozp. 2010 (§ 32 ust. 4 rozp. 2010 odsyła do przepisów o stacjach).</p>
<h3>Gaz płynny na stacji (§ 122-124)</h3>
${tab(["Wymaganie", "Wartość"], [
    ["Zbiorniki podziemne", "do 20 m³ każdy, łącznie do 40 m³"],
    ["Zbiorniki naziemne", "do 5 m³ każdy, łącznie do 10 m³"],
    ["Butle w magazynie stacji", "łącznie do 1350 kg gazu"],
    ["Teren", "nieosłonięty, bez zagłębień; zbiorników podziemnych nie wolno lokować pod drogami i parkingami"],
    ["Odległość od budynku stacji", "10 m"],
    ["Od miejsc postojowych, granicy działki, krawędzi jezdni", "10 m"],
    ["Od domów jednorodzinnych", "30 m"],
    ["Od obiektów użyteczności publicznej, bloków, budynków zamieszkania zbiorowego", "60 m"],
    ["Od innych budynków i od granicy lasu", "20 m"],
    ["Zmniejszenie o połowę (pkt 1-5)", "ściana oddzielenia REI 120 (nie dla domów i UP), butle do 440 kg w ażurowych kontenerach, zbiorniki podziemne"],
  ])}
${przyklad("obchód małej stacji z LPG na Jurze", `${tab(["Co widzisz", "Ocena"], [
    ["Przy wysepce studzienka kanalizacyjna 3 m od odmierzacza", "niezgodność - w promieniu 5 m nie może być studzienek (§ 118)"],
    ["Za pawilonem palety z węglem drzewnym na sprzedaż przy zbiorniku LPG", "materiały palne przy zbiorniku i w strefie - usunąć"],
    ["Jedna gaśnica przewoźna 25 kg z przeglądem z 2024 r.", "wymagane 2 przewoźne + 2 przenośne + 3 koce; przegląd co rok"],
    ["Stanowisko LPG bez gaśnic", "wymagane 2 gaśnice proszkowe 6 kg i koc na każde stanowisko gazu"],
    ["Na półce w pawilonie 80 litrów rozpuszczalnika w butelkach 1 l", "ponad 50 litrów cieczy o temperaturze zapłonu do 55 °C (§ 105)"],
    ["Klient napełnia butlę turystyczną z odmierzacza LPG", "zakaz napełniania butli na stacjach (§ 4 ust. 1 pkt 19 rozp. 2010) i wykroczenie (art. 82 § 1 pkt 4 KW)"],
  ])}`)}
${wlasciciel(`<p>„Studzienka trzy metry od dystrybutora to miejsce, gdzie pary benzyny spłyną i zostaną. Wystarczy niedopałek wrzucony przez kierowcę. Przepis wymaga 5 metrów. Jeśli studzienki nie da się przenieść, trzeba sprawdzić z projektantem, czy da się ją zasyfonować i uszczelnić - ale to już temat na ekspertyzę.”</p>`)}
${wlasciciel(`<p>„Kierowcy proszą o napełnienie butli do grilla z dystrybutora LPG. Proszę wywiesić kartkę, że to zabronione, i przeszkolić pracowników, żeby odmawiali. Za takie napełnienie grozi mandat, a butla turystyczna napełniona z dystrybutora może być przepełniona i wybuchnąć w samochodzie klienta.”</p>`)}
${pulapki([
    "Sprzęt na stacji: <b>2 × 25 kg</b> przewoźne, <b>2 × 6 kg</b> przenośne, <b>3 koce</b>; + 2 × 6 kg i koc na każde stanowisko LPG.",
    "Studzienki i otwory do piwnic - nie bliżej niż <b>5 m</b> od odmierzacza paliw płynnych.",
    "Niezasyfonowane studzienki - nie bliżej niż <b>8 m</b> od zbiorników i odmierzaczy LPG.",
    "Zbiorniki LPG na stacji: podziemne do <b>20 m³</b> (łącznie 40), naziemne do <b>5 m³</b> (łącznie 10).",
    "Zbiornik LPG od domów jednorodzinnych <b>30 m</b>, od obiektów UP i bloków <b>60 m</b>.",
    "Napełnianie butli na stacji paliw - <b>zakazane</b>.",
    "Pawilon stacji - poza strefą Ex, z elementów nierozprzestrzeniających ognia.",
  ])}`),
  },
  {
    id: "awarie-przemyslowe", skrot: "ZZR", tytul: "Poważne awarie przemysłowe - zakłady o zwiększonym i dużym ryzyku",
    html: () => nbsp(`
${ludzku(`<p>Niektóre zakłady trzymają tyle substancji niebezpiecznych (gaz, paliwa, chlor, toksyczne chemikalia), że ich awaria może zagrozić całej okolicy. Prawo ochrony środowiska dzieli je na dwie grupy: <b>ZZR</b> - zakład o zwiększonym ryzyku i <b>ZDR</b> - zakład o dużym ryzyku wystąpienia poważnej awarii przemysłowej. O zaliczeniu decyduje rodzaj i ilość substancji, a progi są w rozporządzeniu z 2016 r. (dyrektywa unijna Seveso).</p>`)}
${wyklad(`<p>Proszę Państwa, dla inspektora to temat „na granicy”. Dokumentów Seveso dla dużych zakładów zwykle nie pisze się samodzielnie, tylko w zespole z technologami i specjalistami od ochrony środowiska. Musicie jednak wiedzieć trzy rzeczy. Po pierwsze, jak sprawdzić, czy klient w ogóle jest ZZR albo ZDR - przy hurtowni gazu czy składzie paliw to realne pytanie. Po drugie, jakie dokumenty go obowiązują. Po trzecie, kto z PSP się nim zajmuje: dla ZZR komendant powiatowy, dla ZDR komendant wojewódzki.</p>
<p>Zaliczenie zaczyna się od listy substancji i ich maksymalnych ilości - nie tego, co jest dziś, tylko tego, co <b>może być</b> w normalnej pracy. Jeśli któraś substancja przekroczy próg z tabeli, sprawa jest prosta. Jeśli żadna osobno nie przekracza, liczy się <b>sumę ilorazów</b>: ilość podzielona przez próg, dla każdej substancji, osobno w trzech grupach zagrożeń - dla zdrowia (H), fizycznych (P) i dla środowiska (E). Suma 1 lub więcej oznacza zaliczenie.</p>`)}
<h3>Obowiązki ZZR i ZDR (Prawo ochrony środowiska - według materiałów kursu)</h3>
${tab(["Obowiązek", "ZZR", "ZDR"], [
    ["Zgłoszenie zakładu do PSP (kopia do WIOŚ)", "tak - nowy 30 dni przed uruchomieniem, inny w ciągu roku", "tak"],
    ["Program zapobiegania awariom", "tak - opiniuje komendant powiatowy", "tak"],
    ["System zarządzania bezpieczeństwem", "tak", "tak"],
    ["Raport o bezpieczeństwie", "-", "tak - zatwierdza komendant wojewódzki decyzją; analiza co 5 lat"],
    ["Wewnętrzny plan operacyjno-ratowniczy", "-", "tak - przećwiczenie co najmniej co 3 lata"],
    ["Informacje do planu zewnętrznego (sporządza komendant wojewódzki)", "-", "tak"],
    ["Wykaz substancji co roku (stan na 31 grudnia, do końca stycznia)", "-", "tak"],
    ["Informowanie społeczeństwa", "strona internetowa", "strona + szkoły, placówki co najmniej co 5 lat"],
    ["Kontrole planowe PSP z WIOŚ", "co najmniej raz na 3 lata", "co najmniej raz w roku"],
  ])}
<h3>Przykładowe progi (tabela 2 rozporządzenia z 2016 r. - wybrane)</h3>
${tab(["Substancja", "ZZR", "ZDR"], [
    ["gaz płynny i gaz ziemny", "50 t", "200 t"],
    ["produkty ropopochodne (benzyny, nafty, oleje napędowe i opałowe)", "2500 t", "25 000 t"],
    ["chlor", "10 t", "25 t"],
  ])}
${przyklad("rozlewnia i hurtownia gazu - czy to ZZR?", `<p>Zakład przechowuje: gaz płynny w zbiornikach - maksymalnie 30 t; olej napędowy - maksymalnie 1000 t. Żadna substancja osobno nie przekracza progu ZZR.</p>
<ol><li>Gaz płynny: 30 / 50 = <b>0,6</b>.</li><li>Olej napędowy: 1000 / 2500 = <b>0,4</b>.</li><li>Obie substancje są w grupie zagrożeń fizycznych (palne), więc sumujemy: 0,6 + 0,4 = <b>1,0</b>.</li><li>Suma ≥ 1 z progami ZZR → zakład jest <b>ZZR</b>, choć żadna substancja osobno nie przekroczyła progu.</li><li>Sprawdzamy jeszcze progi ZDR: 30/200 + 1000/25 000 = 0,15 + 0,04 = 0,19 → poniżej 1, więc nie ZDR.</li></ol><p>Przykład ma pokazać zasadę sumowania. W prawdziwej ocenie trzeba sprawdzić kategorie substancji w kartach charakterystyki i dokładne pozycje w tabelach rozporządzenia.</p>`)}
${przyklad("przy awarii - kto co robi", `<ol><li>Każdy, kto zauważy awarię: niezwłocznie zawiadamia ludzi w strefie zagrożenia oraz PSP albo Policję albo wójta.</li><li>Zakład: natychmiast zawiadamia PSP i wojewódzkiego inspektora ochrony środowiska, przekazuje informacje o substancjach, skutkach i działaniach; uruchamia wewnętrzny plan operacyjno-ratowniczy (ZDR).</li><li>PSP: prowadzi działania z zakładem, zbiera dane do analizy awarii, wydaje zalecenia na przyszłość.</li><li>Kto nie zawiadomi o awarii - kara grzywny; niedopełnienie obowiązków ZZR/ZDR - areszt, ograniczenie wolności albo grzywna.</li></ol>`)}
${wlasciciel(`<p>„Chce Pan zwiększyć zapas gazu w zbiornikach z 30 do 45 ton. Razem z olejem napędowym przekroczy Pan próg zakładu o zwiększonym ryzyku. To nie jest kwestia jednej tabliczki - dochodzi zgłoszenie do straży 30 dni przed zmianą, program zapobiegania awariom i system zarządzania bezpieczeństwem. Policzmy to przed zamówieniem zbiornika.”</p>`)}
${pulapki([
    "ZZR - właściwy komendant <b>powiatowy</b>; ZDR - komendant <b>wojewódzki</b>.",
    "Raport o bezpieczeństwie i wewnętrzny plan operacyjno-ratowniczy - tylko <b>ZDR</b>.",
    "Plan zewnętrzny sporządza komendant <b>wojewódzki</b> (zakład daje dane i płaci).",
    "Kontrole planowe: ZZR co najmniej raz na <b>3 lata</b>, ZDR co najmniej raz w <b>roku</b>.",
    "Zgłoszenie nowego zakładu - co najmniej <b>30 dni</b> przed uruchomieniem.",
    "Sumowanie: q₁/Q₁ + q₂/Q₂ + … ≥ 1 osobno w grupach H, P i E.",
    "Liczy się <b>maksymalna możliwa</b> ilość substancji, nie stan z dnia kontroli.",
  ])}`),
  },
  {
    id: "akcja-ratownicza", skrot: "AKCJA", tytul: "Akcja ratownicza - co robią ludzie w budynku, zanim przyjedzie straż, i potem",
    html: () => nbsp(`
${ludzku(`<p>Pierwsze minuty pożaru należą do ludzi w budynku. Od tego, czy ktoś szybko zaalarmuje, wezwie straż, użyje gaśnicy i wyprowadzi ludzi, zależy często więcej niż od całej późniejszej akcji. Gdy przyjedzie straż, dowodzenie przejmuje <b>kierujący działaniem ratowniczym</b>, a pracownicy wykonują jego polecenia i przekazują mu informacje.</p>`)}
${wyklad(`<p>Proszę Państwa, jako inspektor piszecie instrukcję, według której ludzie będą działać w najgorszych minutach swojego życia. Musi więc być prosta. Cztery kroki z materiałów kursu: <b>zachowaj spokój</b>, <b>zaalarmuj ludzi</b> w strefie i ochronę, <b>wezwij straż - 112</b>, <b>powiadom administrację</b>. Potem gaszenie podręcznym sprzętem, wyłączenie prądu w pomieszczeniach objętych pożarem, wyniesienie z zasięgu ognia materiałów palnych i dokumentów, pomoc zagrożonym, ewakuacja. Gdy pożar rośnie albo gwałtownie przybywa dymu - wychodzisz.</p>
<p>Zgłoszenie do 112 ma swój porządek: <b>gdzie</b> (adres, nazwa, piętro), <b>co się pali</b>, <b>czy są zagrożeni ludzie</b>, kto dzwoni i z jakiego numeru. Słuchawkę odkłada się dopiero po potwierdzeniu przyjęcia zgłoszenia, a potem czeka chwilę na ewentualne oddzwonienie.</p>
<p>Do przyjazdu straży akcją kieruje kierownik zakładu, właściciel, główny użytkownik, osoba wyznaczona, pracownik ochrony albo po prostu ktoś najbardziej opanowany. To warto wpisać w IBP z nazwiskami albo stanowiskami.</p>`)}
<h3>Uprawnienia kierującego działaniem ratowniczym (materiały kursu, ustawa o ochronie ppoż.)</h3>
${tab(["Kierujący może", "Przykład"], [
    ["zarządzić ewakuację ludzi i mienia", "ewakuacja całego bloku przy pożarze piwnicy"],
    ["wstrzymać ruch drogowy i zakazać przebywania osób trzecich", "zamknięcie ulicy przy pożarze hali"],
    ["przejąć na czas akcji nieruchomości, pojazdy, sprzęt, ujęcia wody i środki gaśnicze", "koparka z sąsiedniej budowy, staw sąsiada"],
    ["żądać pomocy od instytucji, firm i osób", "wózek widłowy i operator z zakładu"],
    ["odstąpić od zasad uznanych za bezpieczne", "w sytuacji ratowania życia"],
  ])}
<p>Kolejność ratowania: <b>ludzie, zwierzęta, środowisko, mienie</b>. Osoby wezwane przez kierującego do pomocy korzystają z ochrony jak funkcjonariusze publiczni.</p>
<h3>Skala zdarzeń (materiały kursu)</h3>
${tab(["Pożar", "Powierzchnia lub kubatura", "Lasy, uprawy, trawy"], [
    ["mały", "do 70 m² lub do 350 m³", "do 1 ha"],
    ["średni", "71-300 m² lub 351-1500 m³", "1-10 ha"],
    ["duży", "301-1000 m² lub 1501-5000 m³", "10-100 ha"],
    ["bardzo duży", "więcej", "więcej"],
  ])}
${tab(["Siły", "Skład"], [["rota", "2 ratowników"], ["zastęp", "2-6 ratowników z dowódcą i pojazdem"], ["sekcja", "2 zastępy"], ["pluton", "3-4 zastępy"], ["kompania", "8-16 zastępów"], ["batalion", "3-5 kompanii"]])}
<h3>Gaszenie podręcznym sprzętem - zasady (materiały kursu)</h3>
<ul><li>Urządzenia pod napięciem: najpierw wyłącz prąd; jeśli się nie da - gaśnica śniegowa, proszkowa albo piasek, <b>nigdy woda ani piana</b>.</li><li>Gaś z wiatrem; płonącą powierzchnię - od brzegu; ściany i rzeczy pionowe oraz ciecze kapiące - z góry na dół; przedmioty - od zewnątrz do środka.</li><li>Kilka gaśnic naraz, nie jedna po drugiej. Uważaj na ponowne rozpalenie.</li><li>Zużytej gaśnicy nie odwieszaj na miejsce - najpierw do napełnienia.</li><li>Gaz: przewietrzyć, nie włączać i nie wyłączać światła, nie telefonować w strefie, zamknąć zawór przy gazomierzu, wyprowadzić ludzi, wezwać pogotowie gazowe 992 lub straż.</li></ul>
${przyklad("co przygotować dla straży w IBP hali", `<ol><li>Plan z drogą pożarową, hydrantami, wyłącznikiem prądu, kurkiem gazu, magazynem butli i strefami Ex (§ 6 ust. 1 pkt 8 rozp. 2010).</li><li>Lista osób, które przekazują informacje kierującemu: kto zna obiekt i ma klucze.</li><li>Informacja o fotowoltaice, akumulatorni, chemikaliach - z kartami charakterystyki pod ręką.</li><li>Miejsce zbiórki i lista obecności - kierujący pierwsze pytanie zada: czy ktoś został w środku?</li></ol><p>Sztab kierującego zbiera właśnie takie dokumenty: dane o dojeździe i wodzie, zabezpieczenia, IBP lub jej wyciąg, plan operacyjno-ratowniczy. To dokumenty, które Ty przygotowujesz.</p>`)}
${wlasciciel(`<p>„Kiedy przyjedzie straż, dowódca zapyta w pierwszej minucie: czy wszyscy wyszli i gdzie jest wyłącznik prądu. Jeśli ktoś z Pana ludzi stanie przy bramie z listą obecności i planem budynku, oszczędzi strażakom kilka minut szukania. Zapiszmy w instrukcji, kto to robi na każdej zmianie.”</p>`)}
${pulapki([
    "Kolejność ratowania: <b>ludzie → zwierzęta → środowisko → mienie</b>.",
    "Urządzeń pod napięciem nie gasi się <b>wodą ani pianą</b>.",
    "Ściany i powierzchnie pionowe - z góry na dół (technika PSP).",
    "Pożar mały do <b>70 m²</b>, średni 71-300 m², duży 301-1000 m².",
    "Zastęp: <b>2-6</b> ratowników; sekcja: 2 zastępy; kompania: 8-16 zastępów.",
    "Kierujący może zarządzić <b>ewakuację</b>, przejąć sprzęt i wodę, żądać pomocy od firm i osób.",
    "Pogotowie gazowe - <b>992</b>; numer alarmowy - <b>112</b>.",
  ])}`),
  },
  {
    id: "przyczyny-pozarow", skrot: "PRZYCZ", tytul: "Przyczyny pożarów i jak się je ustala - od zwarcia po podpalenie",
    html: () => nbsp(`
${ludzku(`<p>Po każdym pożarze pada pytanie: <b>dlaczego?</b> Wstępną przyczynę wpisuje kierujący akcją, ale ostateczną ustalają Policja, prokuratura i sąd na podstawie opinii biegłego. Dla inspektora wiedza o przyczynach jest bezcenna z innego powodu: pokazuje, gdzie w obiekcie klienta szukać zagrożeń, zanim cokolwiek się zapali.</p>`)}
${galeria(["cnbop-badania"])}
${wyklad(`<p>Proszę Państwa, kluczowe zdanie z materiałów o badaniu przyczyn: <b>bez ustalenia miejsca powstania pożaru nie da się ustalić jego przyczyny</b>. Ognisko pożaru znajduje się po śladach. Podstawowy ślad to <b>stożek pożaru</b>, czyli linie jednakowego zniszczenia na ścianach i suficie, rozchodzące się w górę od ogniska. Nad ogniskiem jest najgłębsze przepalenie belek i dziura w dachu. Im dalej od ogniska, tym zniszczenia wyżej i mniejsze, a drewno jest płycej zwęglone.</p>
<p>Kto co ustala? <b>Kierujący akcją</b> - przypuszczalną przyczynę do dokumentacji. <b>PSP w czynnościach kontrolno-rozpoznawczych</b> - wstępnie nieprawidłowości, które przyczyniły się do pożaru (tu upoważnienie można doręczyć od razu, bez 7 dni wyprzedzenia). <b>Organy procesowe</b> - Policja, prokuratura, sąd - czy było przestępstwo. <b>Biegły sądowy</b> - końcową opinię. Przyczyna wpisana przez strażaka jest zawsze tylko wstępna, bo strażacy nie przesłuchują świadków i nie zabezpieczają dowodów procesowo.</p>
<p>Kodeks karny rozróżnia „pożar” z art. 163, czyli zagrażający życiu lub zdrowiu wielu osób albo mieniu w wielkich rozmiarach, od spalenia rzeczy, gdy ogień nie mógł się rozprzestrzenić - to zniszczenie cudzej rzeczy z art. 288.</p>`)}
<h3>Najczęstsze grupy przyczyn i ich ślady (materiały kursu)</h3>
${tab(["Przyczyna", "Mechanizm", "Na co patrzy inspektor przy obchodzie"], [
    ["Instalacja i urządzenia elektryczne", "przeciążenia, zwarcia, łuk elektryczny (ok. 3000-15000 °C), iskrzenie, prądy upływu, złe połączenia", "rozdzielnie, pomiary co 5 lat, listwy i przedłużacze, wyłączniki różnicowoprądowe"],
    ["Urządzenia mechaniczne", "tarcie - uszkodzone łożysko, brak smaru; elementy do 600-800 °C zapalają smar, farbę, pył", "konserwacja maszyn, porządek wokół napędów, pył na maszynach"],
    ["Samozapalenie", "samonagrzewanie biologiczne lub chemiczne, nawet miesiącami - siano, ziarno, nawozy azotowe, saletry, tytoń", "wilgotność i temperatura stert, składowanie nawozów"],
    ["Tlenie", "powolne spalanie bez płomienia - papieros, pianka PU, trociny, miał - nawet tygodniami", "palarnie, pojemniki na niedopałki, odpady w stolarni"],
    ["Prace niebezpieczne pożarowo", "iskry i gorący metal wpadające w szczeliny", "zezwolenia na prace, kontrola po pracach"],
    ["Podpalenie", "zapałki, ciecze palne, chemikalia; motywy: zemsta, wyłudzenie odszkodowania, ukrycie przestępstwa, piromania", "kilka ognisk naraz, ślady przyspieszaczy - to już sprawa dla Policji"],
  ])}
<h3>Jak zaczyna się spalanie (materiały kursu)</h3>
${tab(["Pojęcie", "Co znaczy", "Przykład"], [
    ["zapłon", "bodziec punktowy", "zapałka, iskra"],
    ["samozapłon", "bodziec ciągły - materiał nagrzewa się od zewnętrznego źródła", "szmata na grzałce"],
    ["samozapalenie", "procesy w samym materiale", "mokre siano w stogu, szmaty nasączone olejem lnianym"],
  ])}
${przyklad("obchód stolarni - szukanie przyczyn, zanim zdarzy się pożar", `${tab(["Co widzisz", "Możliwa przyczyna pożaru"], [
    ["Gruba warstwa pyłu na silnikach maszyn", "przegrzanie silnika i zapalenie pyłu; dodatkowo zagrożenie wybuchem pyłu"],
    ["Szmaty z bejcą i olejem w otwartym koszu", "samozapalenie szmat nasączonych olejami schnącymi"],
    ["Popielniczka na stercie wiórów", "tlenie i zapłon od niedopałka"],
    ["Przedłużacz bębnowy zwinięty, zasila odciąg wiórów", "przegrzanie przewodu - patrz temat o ładowarkach i przedłużaczach"],
    ["Brak wyłącznika różnicowoprądowego w obwodzie maszyn", "upływ prądu i zapalenie izolacji"],
  ])}`)}
${wlasciciel(`<p>„Szmaty z olejem do drewna składa Pan do otwartego kosza. Te oleje schną, utleniając się, i przy tym się grzeją. Zwinięte w kłębek potrafią zapalić się same w nocy. Proszę kupić metalowy pojemnik z pokrywą i wynosić go codziennie na zewnątrz.”</p>`)}
${pulapki([
    "Bez ustalenia <b>miejsca powstania pożaru</b> nie da się ustalić przyczyny.",
    "Podstawowy ślad - <b>stożek pożaru</b>.",
    "Przyczyna wpisana przez straż jest <b>wstępna</b>; ostateczną ustalają organy procesowe na podstawie opinii biegłego.",
    "Przy ustalaniu przyczyn pożaru upoważnienie do kontroli można doręczyć <b>od razu</b>.",
    "Art. 163 KK - pożar zagrażający wielu osobom; art. 288 KK - spalenie rzeczy bez możliwości rozprzestrzenienia.",
    "Zapłon - bodziec punktowy; samozapłon - bodziec ciągły; samozapalenie - procesy w samym materiale.",
    "Łuk elektryczny: ok. <b>3000-15000 °C</b>.",
  ])}`),
  },
  {
    id: "budynek-zagrazajacy", skrot: "§ 16", tytul: "Budynek zagrażający życiu ludzi - 6 kryteriów z § 16 i co dalej",
    html: () => nbsp(`
${ludzku(`<p>Stare budynki nie muszą spełniać dzisiejszych warunków technicznych - ocenia się je według przepisów, na podstawie których je zbudowano. Jest jeden wyjątek: gdy z budynku <b>nie da się bezpiecznie uciec</b>. Wtedy budynek uznaje się za <b>zagrażający życiu ludzi</b> (§ 16 rozp. 2010) i właściciel musi go poprawić do poziomu dzisiejszych przepisów albo uzgodnić rozwiązania zamienne.</p>`)}
${wyklad(`<p>Proszę Państwa, § 16 to najmocniejsze narzędzie przy starych budynkach. Ustęp 1 mówi ogólnie: budynek zagraża życiu ludzi, gdy warunki techniczne nie zapewniają możliwości ewakuacji. Ustęp 2 podaje sześć konkretnych kryteriów, które <b>mogą być podstawą</b> takiego stwierdzenia. Ważne z prezentacji T-3: <b>wystarczy jedno kryterium</b>, nie muszą wystąpić wszystkie naraz.</p>
<p>Zwróćcie uwagę na liczby w dwóch pierwszych kryteriach. Przepis nie mówi „korytarz za wąski”, tylko „węższy o <b>ponad jedną trzecią</b> od wymaganego”. Nie mówi „dojście za długie”, tylko „dłuższe o <b>ponad 100%</b>”. To duży margines. Stary budynek z korytarzem 1,2 m zamiast 1,4 m nie jest jeszcze budynkiem zagrażającym życiu ludzi. Z korytarzem 0,9 m - już tak.</p>
<p>Co dalej? Właściciel musi zastosować rozwiązania spełniające dzisiejsze przepisy (§ 16 ust. 3), a jeśli się nie da - rozwiązania zamienne. Przy usuwaniu stanu zagrożenia życia wystarczy postanowienie komendanta wojewódzkiego PSP, bez odstępstwa od ministra (art. 9 ust. 6 PB). Gdy zagrożenie jest bezpośrednie, komendant powiatowy może decyzją zakazać eksploatacji obiektu lub jego części, z natychmiastową wykonalnością (art. 26 ustawy o PSP).</p>`)}
<h3>6 kryteriów z § 16 ust. 2 rozp. 2010</h3>
${tab(["Nr", "Kryterium", "Przykład"], [
    ["1", "szerokość przejścia, dojścia, wyjścia ewakuacyjnego albo biegu lub spocznika klatki schodowej <b>mniejsza o ponad 1/3</b> od wymaganej", "korytarz 0,9 m przy wymaganych 1,4 m"],
    ["2", "długość przejścia lub dojścia <b>większa o ponad 100%</b> od wymaganej", "dojście 25 m w hotelu przy dopuszczalnych 10 m"],
    ["3", "w strefie ZL I, ZL II, ZL V (w pomieszczeniu) albo na drodze ewakuacyjnej: <b>sufit</b> lub sufit podwieszony łatwo zapalny albo kapiący, <b>wykładzina podłogowa</b> łatwo zapalna; <b>okładzina ścienna</b> łatwo zapalna na drodze ewakuacyjnej bez dwóch kierunków ewakuacji", "sufit z płyt styropianowych na korytarzu pensjonatu"],
    ["4", "niewydzielona ewakuacyjna klatka schodowa w budynku <b>wysokim</b> (innym niż mieszkalny) lub <b>wysokościowym</b>", "biurowiec 30 m z otwartą klatką"],
    ["5", "niezabezpieczenie przed zadymieniem dróg ewakuacyjnych wymienionych w przepisach", "brak oddymiania klatki tam, gdzie WT go wymaga"],
    ["6", "brak wymaganego <b>oświetlenia awaryjnego</b> w strefie ZL I, ZL II, ZL V albo na drodze ewakuacyjnej z niej", "sala weselna na 250 osób bez oświetlenia ewakuacyjnego"],
  ])}
${przyklad("stary budynek szkoły - czy zagraża życiu ludzi? (liczby z materiałów kursu)", `<p>Budynek sprzed 1995 r., ZL III. Wymagany korytarz 1,4 m, faktycznie 0,9 m. Wymagane dojście 60 m, faktycznie 110 m.</p>
<ol><li><b>Szerokość:</b> 1,4 m - 1/3 × 1,4 m ≈ 0,93 m. Korytarz 0,9 m jest węższy niż 0,93 m → kryterium nr 1 <b>spełnione</b>.</li><li><b>Długość:</b> 60 m + 100% = 120 m. Dojście 110 m jest krótsze niż 120 m → kryterium nr 2 <b>nie</b> jest spełnione.</li><li>Wystarczy jedno kryterium → budynek <b>może zostać uznany za zagrażający życiu ludzi</b>.</li></ol>`)}
${przyklad("pensjonat w dawnym domu wczasowym", `${tab(["Co widzisz", "Kryterium § 16 ust. 2", "Ocena"], [
    ["Korytarz 1,2 m (wymagane 1,4 m)", "pkt 1: próg to poniżej ok. 0,93 m", "nie spełnia kryterium - korytarz węższy, ale nie o ponad 1/3"],
    ["Ślepy korytarz 18 m (ZL V - wolno 10 m)", "pkt 2: próg to ponad 20 m", "nie spełnia kryterium, ale blisko granicy"],
    ["Sufit podwieszony z płyt styropianowych w jadalni (ZL V)", "pkt 3", "<b>spełnia</b> - jedno kryterium wystarczy"],
    ["Brak oświetlenia awaryjnego na korytarzu bez okien", "pkt 6", "<b>spełnia</b>"],
  ])}<p>Wniosek: dwa kryteria (pkt 3 i 6) - budynek może zostać uznany za zagrażający życiu ludzi. Najszybsze działania: zdjęcie sufitu styropianowego i montaż oświetlenia awaryjnego. Korytarze - do sprawdzenia w ekspertyzie.</p>`)}
${wlasciciel(`<p>„Budynek ma 60 lat i nikt nie każe Panu przebudowywać go według dzisiejszych przepisów. Ale ten styropianowy sufit w jadalni to coś innego - przy pożarze kapie płonącymi kroplami na gości. Przepis wprost wymienia go jako podstawę do uznania budynku za zagrażający życiu ludzi. Zdjęcie go to kilka dni pracy, a usuwa najpoważniejszy problem.”</p>`)}
${wlasciciel(`<p>„Gdy straż uzna budynek za zagrażający życiu ludzi, komendant może nakazać poprawki w terminie, a przy bezpośrednim zagrożeniu nawet zakazać użytkowania części obiektu. Lepiej, żebyśmy to wyłapali i poprawili teraz, na naszych warunkach.”</p>`)}
${pulapki([
    "Wystarczy <b>jedno</b> kryterium z § 16 ust. 2 - nie muszą wystąpić wszystkie.",
    "Szerokość mniejsza o <b>ponad 1/3</b> od wymaganej.",
    "Długość większa o <b>ponad 100%</b> od wymaganej.",
    "Materiały łatwo zapalne / kapiące - kryterium dotyczy stref <b>ZL I, ZL II, ZL V</b> i dróg ewakuacyjnych.",
    "Niewydzielona klatka - tylko budynki <b>wysokie</b> (poza mieszkalnymi) i <b>wysokościowe</b>.",
    "Brak oświetlenia awaryjnego - w strefach <b>ZL I, II, V</b> i na drogach z nich.",
    "Właściciel musi doprowadzić budynek do wymagań WT (§ 16 ust. 3) albo uzgodnić rozwiązania zamienne.",
  ])}`),
  },
  {
    id: "srodki-gasnicze", skrot: "WODA", tytul: "Środki gaśnicze - woda, piana, proszek, gazy i koc: jak gaszą i czego nimi nie gasić",
    html: () => nbsp(`
${ludzku(`<p>Pożar potrzebuje trzech rzeczy: paliwa, tlenu i ciepła. Każdy środek gaśniczy zabiera jedną z nich albo przerywa samą reakcję spalania. Woda chłodzi, piana odcina powietrze, proszek przerywa reakcję w płomieniu, gaz wypiera tlen, a koc przykrywa ogień.</p>`)}
${galeria(["koc-gasniczy", "koc-i-gasnica", "gasnica-co2"])}
${wyklad(`<p>Proszę Państwa, materiały kursu wymieniają cztery sposoby przerwania spalania: <b>ochładzanie</b>, <b>rozcieńczanie</b> (mniej tlenu), <b>izolowanie</b> (odcięcie powietrza) i <b>hamowanie chemiczne</b>, czyli inhibicja. Każdy środek gaśniczy działa jednym lub kilkoma z tych sposobów.</p>
<p><b>Woda</b> to mistrz chłodzenia. Kilogram wody, żeby się nagrzać i odparować, zabiera ogromną ilość ciepła: ciepło parowania to 2257 kJ/kg. Z jednego litra wody robi się ok. 1720 litrów pary, która dodatkowo rozrzedza powietrze. Najlepiej gasi woda, która odparuje w strefie spalania, czyli rozpylona, a nie lana strumieniem w ścianę.</p>
<p><b>Proszek</b> działa inaczej. Chmura drobnych ziaren w płomieniu „wyłapuje” wolne rodniki i przerywa reakcję - dlatego proszek gasi płomień błyskawicznie. Ale nie chłodzi. Gdy żar pod spodem jest gorący, ogień może wrócić. Stąd zasada: po zgaszeniu proszkiem pilnuj miejsca.</p>
<p><b>Piana</b> przykrywa płonącą ciecz i nie przepuszcza par do płomienia, a woda z piany chłodzi. Warunek sukcesu: szybko pokryć <b>całą</b> powierzchnię szczelną warstwą. <b>Gazy</b> (CO₂, azot, mieszaniny gazów obojętnych) wypierają tlen. Większość materiałów przestaje się palić przy 12-16% tlenu w powietrzu, a w powietrzu jest go 21%.</p>`)}
<h3>Który środek do czego (materiały kursu)</h3>
${tab(["Środek", "Jak gasi", "Do czego", "Czego NIE gasić"], [
    ["woda", "chłodzi; para rozrzedza powietrze", "grupa A: drewno, papier, tekstylia", "urządzenia pod napięciem, metale, rozgrzana stal konstrukcyjna, substancje reagujące z wodą, rozlane ciecze lżejsze od wody, oleje i tłuszcze"],
    ["piana", "izoluje powierzchnię, woda z piany chłodzi (najlepiej piana ciężka)", "grupy A i B - ciecze palne", "urządzenia pod napięciem, substancje reagujące z wodą"],
    ["proszek BC", "hamowanie chemiczne w płomieniu", "grupy B i C", "nie chłodzi - możliwy ponowny zapłon"],
    ["proszek ABC", "hamowanie + powłoka izolująca na ciałach stałych", "grupy A, B, C", "zostawia brud w urządzeniach i elektronice"],
    ["proszek do metali (D)", "warstwa izolująca 2-4 cm, podawana łagodnie", "magnez, aluminium w wiórach, sód, potas", "nie zwykłym proszkiem, nie wodą ani pianą"],
    ["CO₂ (śniegowa)", "wypiera tlen, trochę chłodzi", "ciecze, gazy, urządzenia elektryczne do 1000 V; najlepiej w zamkniętych pomieszczeniach", "na otwartej przestrzeni wiatr go rozwiewa; niebezpieczny dla ludzi w małych pomieszczeniach"],
    ["koc gaśniczy", "odcina powietrze", "mały płonący przedmiot, garnek, ubranie na człowieku", "większe pożary"],
    ["gaśnica do grupy F", "specjalny roztwór na tłuszcz", "olej we frytownicy i na patelni", "-"],
  ])}
<h3>Oznaczenia gaśnic i kontrola na obchodzie</h3>
<ul><li><b>„x”</b> w oznaczeniu (np. GP-6x ABC) - gaśnica <b>stale pod ciśnieniem</b>, z manometrem: wskazówka na zielonym polu = sprawna. <b>„z”</b> - gaśnica z nabojem gazu wyrzutowego w osobnym zbiorniczku.</li><li>Podręczny sprzęt gaśniczy musi mieć dopuszczenie (świadectwo CNBOP, najwyżej na 5 lat).</li><li>Kontrola wzrokowa: gaśnica na miejscu, niezastawiona, instrukcja czytelna, plomba i zawleczka całe, manometr na zielonym, właściwy typ do grupy pożarów.</li><li>Gaśnicę zabraną do serwisu zastępuje się gaśnicą tego samego typu i o takiej samej zdolności gaszenia. Mocno skorodowaną wycofuje się.</li></ul>
${przyklad("dobór środków w warsztacie i biurze", `${tab(["Miejsce", "Co może się palić", "Środek"], [
    ["biuro", "papier, meble (A), komputery pod napięciem", "gaśnica proszkowa ABC; przy serwerowni - śniegowa CO₂"],
    ["warsztat samochodowy", "olej, benzyna (B), opony (A), instalacja elektryczna", "proszkowa ABC, przy stanowisku z paliwem - większa gaśnica"],
    ["kuchnia restauracji", "olej we frytownicy (F)", "gaśnica do grupy F + koc gaśniczy"],
    ["warsztat obróbki aluminium i magnezu", "wióry metali (D)", "gaśnica do metali albo suchy piasek; <b>nie woda</b>"],
    ["kotłownia gazowa", "gaz (C) - najpierw odciąć dopływ", "proszkowa ABC lub BC"],
  ])}`)}
${wlasciciel(`<p>„W serwerowni wisi gaśnica proszkowa. Zgasi pożar, ale proszek wejdzie w każdy wentylator i płytę - po akcji sprzęt nadaje się do wyrzucenia. Do serwerowni lepsza jest gaśnica śniegowa, która nie zostawia śladu. Proszkowa może zostać na korytarzu.”</p>`)}
${wlasciciel(`<p>„Wióry magnezu przy frezarce to grupa D. Jeśli ktoś poleje je wodą, powstanie wodór i dojdzie do wybuchu. Przy tym stanowisku musi stać gaśnica do metali albo pojemnik suchego piasku z łopatką, a pracownicy muszą wiedzieć, że wody tu nie wolno.”</p>`)}
${pulapki([
    "Cztery sposoby przerwania spalania: <b>chłodzenie, rozcieńczanie, izolowanie, inhibicja</b>.",
    "Z 1 litra wody - ok. <b>1720 litrów</b> pary; ciepło parowania <b>2257 kJ/kg</b>.",
    "Proszek BC działa głównie <b>inhibicyjnie</b>; nie chłodzi.",
    "Metali (D) nie gasi się <b>wodą ani pianą</b> - wybuchowa mieszanina wodoru i tlenu.",
    "Gaśnica śniegowa CO₂ - urządzenia elektryczne do <b>1000 V</b>.",
    "Większość materiałów przestaje się palić przy <b>12-16%</b> tlenu.",
    "„x” - stale pod ciśnieniem (manometr); „z” - z nabojem.",
    "Świadectwo dopuszczenia CNBOP - na najwyżej <b>5 lat</b>.",
  ])}`),
  },
  {
    id: "kotlownie-gaz", skrot: "KOCIOŁ", tytul: "Kotłownie, piece, kominki i instalacje gazowe - odległości i moce",
    html: () => nbsp(`
${ludzku(`<p>Kotły, piece i kominki to w budynku miejsca, gdzie <b>celowo</b> pali się ogień. Przepisy mówią, gdzie wolno je postawić (zależnie od mocy i paliwa), jak daleko od palnych ścian i jak zapewnić powietrze do spalania i odprowadzenie spalin. Gdy coś tu nie gra, kończy się to pożarem albo zatruciem czadem.</p>`)}
${wyklad(`<p>Proszę Państwa, przy kotłowniach patrzymy na trzy rzeczy: <b>moc</b>, <b>paliwo</b> i <b>miejsce</b>. Im większa moc, tym bardziej kotłownia musi być wydzielona: od zwykłego pomieszczenia pomocniczego, przez wydzielone pomieszczenie techniczne, aż po budynek wolnostojący. Kotłownia jest też dla przepisów strefą typu PM, jak warsztat czy magazyn (§ 209 ust. 3 WT).</p>
<p>Druga sprawa to <b>powietrze i spaliny</b>. Kocioł z otwartą komorą spalania bierze powietrze z pomieszczenia. Jeśli w tym samym pomieszczeniu działa wentylator wyciągowy, np. okap albo wentylator w łazience, może zassać spaliny z powrotem z komina. Ten tzw. ciąg wsteczny to czad w mieszkaniu. Dlatego w takim pomieszczeniu nie wolno stosować mechanicznej wentylacji wyciągowej (materiały kursu). A od 2024 r. - czujka czadu (§ 28a rozp. 2010).</p>
<p>Trzecia: <b>odległości od palnych elementów</b>. Rozgrzany piec metalowy przez lata „wypieka” drewnianą ścianę obok, aż ta zapali się w niskiej temperaturze. Stąd liczby 0,6 m, 0,3 m, 0,15 m z materiałów kursu.</p>`)}
<h3>Gdzie można postawić kocioł (materiały kursu, WT)</h3>
${tab(["Kocioł", "Moc", "Gdzie"], [
    ["gazowy", "do 30 kW", "pomieszczenia nieprzeznaczone na stały pobyt ludzi"],
    ["gazowy", "30-60 kW", "pomieszczenie techniczne"],
    ["gazowy", "60-2000 kW", "pomieszczenie techniczne wyłącznie na kotłownię, bez gazomierza, z odrębnym przewodem gazowym"],
    ["gazowy", "ponad 2000 kW", "tylko wolnostojąca kotłownia"],
    ["olejowy", "do 30 kW", "pomieszczenia nie na stały pobyt (też pomocnicze w mieszkaniu)"],
    ["olejowy", "30-2000 kW", "wydzielone pomieszczenie tylko na kotłownię w piwnicy lub na najniższej kondygnacji albo budynek wolnostojący"],
    ["na paliwo stałe", "do 25 kW", "wydzielone pomieszczenie techniczne (w małych domach do 10 kW - na poziomie ogrzewanych pomieszczeń, nie w pokojach, min. 30 m³)"],
  ])}
<p>Wydzielenie kotłowni (z tabeli § 220 WT w materiałach kursu): kotłownia na paliwo stałe ponad 25 kW, olejowa i gazowa ponad 30 kW w budynku niskim i średniowysokim - ściany EI 60, stropy REI 60, drzwi EI 30.</p>
<h3>Odległości od palnych elementów (materiały kursu)</h3>
${tab(["Co", "Odległość"], [
    ["piec metalowy i rury od nieosłoniętych łatwo zapalnych części budynku", "0,6 m"],
    ["piec metalowy od części łatwo zapalnych osłoniętych tynkiem 25 mm", "0,3 m"],
    ["piec murowany i przewody dymowe - od nieosłoniętych / osłoniętych", "0,3 m / 0,15 m"],
    ["palenisko - podłoże niepalne", "co najmniej 0,15 m (piec metalowy bez nóżek - 0,3 m)"],
    ["przed drzwiczkami paleniska na palnej podłodze", "pas niepalny co najmniej 0,3 m, wystający po 0,3 m z boków"],
    ["palenisko otwarte od łatwo zapalnych części budynku", "0,6 m; tylko tam, gdzie nie ma zagrożenia wybuchem"],
    ["wylot przewodu spalinowego lub dymowego od korony drzew", "co najmniej 6 m"],
    ["materiały palne od urządzeń nagrzewających się ponad 100 °C", "0,5 m (§ 4 ust. 1 pkt 8 rozp. 2010)"],
  ])}
<h3>Kominki i gaz (materiały kursu)</h3>
<ul><li>Kominek na drewno - tylko w domach jednorodzinnych, zagrodowych, rekreacji indywidualnej i w niskich budynkach wielorodzinnych. Pomieszczenie: 4 m³ na 1 kW mocy, co najmniej 30 m³; dopływ powietrza - co najmniej 10 m³/h na 1 kW (kominek zamknięty).</li><li>Trzon kuchenny, kocioł na paliwo stałe i kominek - tylko do własnego, samodzielnego przewodu dymowego.</li><li>Ciśnienie gazu w budynku przed urządzeniami - najwyżej 5 kPa.</li><li>Instalacja na gaz płynny - tylko w budynkach niskich; nie łączy się w jednym budynku gazu płynnego i sieciowego.</li><li>Budynek ponad 25 m - instalacja gazowa wymaga pozytywnej opinii komendanta wojewódzkiego PSP; ponad 35 m - gaz tylko do pomieszczeń technicznych.</li><li>Kontrola instalacji gazowej i przewodów kominowych - co najmniej raz w roku (art. 62 PB).</li></ul>
${przyklad("pensjonat - kocioł gazowy 45 kW w piwnicy", `<ol><li>Gaz, 30-60 kW → <b>pomieszczenie techniczne</b>, nie korytarz ani pralnia.</li><li>Ponad 30 kW w budynku niskim → kotłownia <b>wydzielona</b>: ściany EI 60, strop REI 60, drzwi EI 30.</li><li>Kocioł z otwartą komorą → w tym pomieszczeniu bez wentylatora wyciągowego; w lokalu w strefie ZL od 30.06.2026 czujka czadu (§ 28a rozp. 2010).</li><li>Kontrola instalacji gazowej i przewodu spalinowego - raz w roku; czyszczenie przewodu spalinowego (gaz) - co 6 miesięcy.</li><li>W kotłowni nie składujemy: drewna, kartonów, mebli z remontu.</li></ol>`)}
${przyklad("piec typu koza w warsztacie", `${tab(["Co widzisz", "Ocena"], [
    ["Koza stoi 0,4 m od drewnianej ściany bez osłony", "piec metalowy - wymagane 0,6 m od nieosłoniętych łatwo zapalnych części"],
    ["Pod kozą deski", "palenisko na podłożu niepalnym co najmniej 0,15 m, przed drzwiczkami pas niepalny 0,3 m"],
    ["Obok kozy stos trocin", "materiały palne co najmniej 0,5 m od urządzeń ponad 100 °C"],
    ["Rura od kozy wpięta do przewodu wentylacyjnego", "piec tylko do własnego przewodu dymowego - zagrożenie czadem i pożarem"],
  ])}`)}
${wlasciciel(`<p>„Koza grzeje drewnianą ścianę z odległości 40 cm. Przez lata drewno się przesusza i może zapalić się w dużo niższej temperaturze niż świeże. Wystarczy przesunąć piec na 60 cm albo osłonić ścianę blachą z pustką powietrzną i płytą niepalną.”</p>`)}
${pulapki([
    "Kotłownia = wymagania <b>PM</b> (§ 209 ust. 3 WT).",
    "Kocioł gazowy do <b>30 kW</b> - pomieszczenie nie na stały pobyt; ponad <b>2000 kW</b> - wolnostojąca kotłownia.",
    "Piec metalowy: <b>0,6 m</b> od nieosłoniętych łatwo zapalnych elementów, <b>0,3 m</b> od osłoniętych.",
    "Wylot komina co najmniej <b>6 m</b> od korony drzew.",
    "Kominek: pomieszczenie <b>4 m³ na 1 kW</b>, co najmniej <b>30 m³</b>.",
    "Ciśnienie gazu przed urządzeniami w budynku - najwyżej <b>5 kPa</b>.",
    "Gaz w budynku ponad 25 m - opinia komendanta <b>wojewódzkiego</b>.",
  ])}`),
  },
  {
    id: "organizacja-ochrony", skrot: "KSRG", tytul: "Organizacja ochrony przeciwpożarowej - PSP, OSP, KSRG i kto czym rządzi",
    html: () => nbsp(`
${ludzku(`<p>Ochrona przeciwpożarowa to nie tylko straż. To system, w którym są: <b>właściciele</b> budynków z obowiązkami z art. 4 ustawy, <b>Państwowa Straż Pożarna</b> (zawodowa), <b>ochotnicze straże pożarne</b>, inne służby i samorządy. Wszyscy razem tworzą <b>krajowy system ratowniczo-gaśniczy (KSRG)</b>.</p>`)}
${wyklad(`<p>Proszę Państwa, struktura PSP ma trzy piętra, a na egzaminie pytania kręcą się wokół tego, kto kogo powołuje i do kogo się odwołuje. Na górze <b>Komendant Główny PSP</b> - centralny organ administracji rządowej, podległy ministrowi spraw wewnętrznych. Powołuje go Prezes Rady Ministrów na wniosek ministra. Dalej <b>komendant wojewódzki</b> - powołuje go minister na wniosek Komendanta Głównego po zgodzie wojewody. Na dole <b>komendant powiatowy (miejski)</b> - powołuje go komendant wojewódzki w porozumieniu ze starostą.</p>
<p>W sprawach administracyjnych pierwszą instancją jest zwykle <b>komendant powiatowy</b>. Od niego odwołanie idzie do <b>wojewódzkiego</b>, a od wojewódzkiego do <b>Komendanta Głównego</b>. To ważne dla Was przy decyzjach po kontroli i przy postanowieniach o rozwiązaniach zamiennych.</p>
<p>KSRG to sieć: jednostki PSP (JRG), jednostki OSP włączone do systemu, a także inne służby i podmioty, które umową zgodziły się współdziałać. Kieruje nim Komendant Główny, a na poziomie województwa i powiatu - wojewoda i starosta przy pomocy komendantów. Wójt koordynuje KSRG w gminie w zakresie ustalonym przez wojewodę.</p>`)}
<h3>Kto co robi (materiały kursu, ustawy o ochronie ppoż. i o PSP)</h3>
${tab(["Organ", "Najważniejsze zadania dla inspektora"], [
    ["Komendant Główny PSP", "kieruje KSRG; <b>powołuje i odwołuje rzeczoznawców</b> do spraw zabezpieczeń ppoż.; <b>zatwierdza program szkolenia inspektorów</b> ochrony ppoż. - Twojego kursu"],
    ["Komendant wojewódzki", "rozwiązania zamienne (postanowienia), raporty i plany ZDR, kontrola uzgadniania projektów, plany ratownicze województwa; organ odwoławczy od komendanta powiatowego"],
    ["Komendant powiatowy (miejski)", "czynności kontrolno-rozpoznawcze, decyzje po kontroli, JRG i akcje ratownicze, plany ratownicze powiatu; nadzór nad obiektami zbiorowej ochrony; inspekcje gotowości OSP"],
    ["Rada powiatu", "co najmniej raz w roku rozpatruje informację komendanta o stanie bezpieczeństwa ppoż."],
    ["Wójt, burmistrz, starosta", "przy bezpośrednim zagrożeniu może wydać komendantowi polecenie działań, ale nie konkretnej czynności służbowej"],
    ["Właściciel obiektu", "obowiązki z art. 4 ustawy - patrz temat o obowiązkach właściciela"],
  ])}
${przyklad("do kogo z czym - ściąga dla klienta", `${tab(["Sprawa klienta", "Do kogo"], [
    ["kontrola PSP w jego firmie, mandat, decyzja nakazująca", "komendant powiatowy; odwołanie od decyzji - do komendanta wojewódzkiego"],
    ["rozwiązanie zamienne (np. za długi korytarz)", "komendant wojewódzki - wniosek z ekspertyzą rzeczoznawcy"],
    ["zastępcze źródło wody na czas określony", "komendant powiatowy"],
    ["zawiadomienie o próbnej ewakuacji", "komendant powiatowy - tydzień wcześniej"],
    ["warunki ochrony i plany z IBP dla obiektu z obowiązkowym SSP", "komendant powiatowy"],
    ["uzgodnienie projektu budowlanego pod względem ppoż.", "rzeczoznawca do spraw zabezpieczeń ppoż. (powołany przez Komendanta Głównego)"],
    ["zakład o zwiększonym ryzyku (ZZR) / o dużym ryzyku (ZDR)", "komendant powiatowy / komendant wojewódzki"],
  ])}`)}
${wlasciciel(`<p>„Decyzję po kontroli wydał komendant powiatowy. Jeśli uważa Pan, że jest błędna, odwołanie składa się do komendanta wojewódzkiego, w terminie wskazanym w pouczeniu. Ale najpierw sprawdźmy, czy rzeczywiście jest błędna - często szybciej jest poprawić uchybienie niż się odwoływać.”</p>`)}
${pulapki([
    "Komendanta Głównego PSP powołuje <b>Prezes Rady Ministrów</b> na wniosek ministra spraw wewnętrznych.",
    "Komendanta wojewódzkiego powołuje <b>minister</b> na wniosek Komendanta Głównego, po zgodzie wojewody.",
    "Komendanta powiatowego powołuje <b>komendant wojewódzki</b> w porozumieniu ze starostą.",
    "Organ I instancji w sprawach PSP - zwykle <b>komendant powiatowy</b>; odwołanie do wojewódzkiego.",
    "Rzeczoznawców do spraw zabezpieczeń ppoż. powołuje <b>Komendant Główny</b>.",
    "Program szkolenia inspektorów ochrony ppoż. zatwierdza <b>Komendant Główny</b>.",
    "Rada powiatu rozpatruje informację o stanie bezpieczeństwa ppoż. co najmniej <b>raz w roku</b>.",
  ])}`),
  },
];

// ── Rysunki do tematów z 16.11.2026 ──

const SVG_ZAMIENNE = `<svg viewBox="0 0 360 215" role="img" aria-label="Droga rozwiązania zamiennego">
  ${[["1. Budynek nie spełnia wymagania", "np. dojście 14 m zamiast 10 m"], ["2. Ekspertyza rzeczoznawcy", "proponuje zamiennik i wykazuje, że jest bezpiecznie"], ["3. Postanowienie komendanta wojewódzkiego PSP", "zgoda, zgoda z warunkami albo odmowa"], ["4. Zamiennik musi zawsze działać", "np. oddymianie korytarza + drzwi dymoszczelne"]].map(([a, b], i) => `
  <rect x="40" y="${8 + i * 46}" width="280" height="36" rx="6" class="${i === 2 ? "s-strefa" : "s-bud"}"/>
  <text x="180" y="${23 + i * 46}" class="s-t" text-anchor="middle">${a}</text><text x="180" y="${36 + i * 46}" class="s-m" text-anchor="middle">${b}</text>
  ${i < 3 ? `<line x1="180" y1="${44 + i * 46}" x2="180" y2="${54 + i * 46}" class="s-os"/>` : ""}`).join("")}
  <text x="180" y="208" class="s-m" text-anchor="middle">art. 6a ustawy o ochronie ppoż. · przy nowym budynku także odstępstwo z art. 9 PB</text>
</svg>`;


// ── Widoki ──

function widokPoszerz() {
  ustawNaglowek("Poszerz wiedzę", "#/start");
  ustawZakladke("nauka");
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Tematy wokół pytań egzaminacyjnych wytłumaczone prosto: jak na wykładzie, jak inspektor właścicielowi firmy, z przykładami, tabelami i rysunkami.")}</div></div>
    <div class="list-group" style="margin-top:12px">${POSZERZ.map((t, i) => wiersz(`#/poszerz/${t.id}`, t.skrot, "#2f5d8a", `${i + 1}. ${t.tytul}`, "")).join("")}</div>`;
}

function widokTematuPoszerz(id) {
  const i = POSZERZ.findIndex((t) => t.id === id);
  if (i < 0) {
    location.replace("#/poszerz");
    return;
  }
  const t = POSZERZ[i];
  ustawNaglowek("Wyjaśnienia", `#/wiedza/${dzialTematuPoszerz(id)}`);
  ustawZakladke("nauka");
  const sasiad = (j, napis) => (POSZERZ[j] ? `<a class="btn secondary" href="#/poszerz/${POSZERZ[j].id}">${napis}</a>` : "");
  widok.innerHTML = `<article class="pz">
    <p class="pz-nr">Temat ${i + 1} z ${POSZERZ.length}</p><h2 class="pz-tytul">${tekst(t.tytul)}</h2>
    ${t.html()}</article>
    <div class="pager">${sasiad(i - 1, "‹ Poprzedni")}${sasiad(i + 1, "Następny ›")}</div>`;
}
