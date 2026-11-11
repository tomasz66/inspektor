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
    html: () => `
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
${wlasciciel(`<p>„Pana hala ma 3000 m³, więc instrukcja jest obowiązkowa. Bez niej strażacy w razie pożaru nie wiedzą, gdzie jest wyłącznik prądu i co składujecie, a przy kontroli PSP to pierwsza rzecz, o którą zapytają. Przygotuję ją i co dwa lata zaktualizuję.”</p>`)}
${pulapki(["Liczy się <b>kubatura brutto</b> (z zewnętrznych wymiarów), nie powierzchnia.", "Strefa zagrożenia wybuchem <b>zawsze</b> oznacza obowiązek IBP, nawet w małym obiekcie.", "Próg dla obory to 1500 m³, dla reszty 1000 m³.", "Aktualizacja co 2 lata - nie co roku i nie co 5 lat."])}`,
  },
  {
    id: "hydranty", skrot: "HYD", tytul: "Hydranty zewnętrzne i wewnętrzne - odległości na wsi, w firmie, w magazynie",
    html: () => `
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
${wlasciciel(`<p>„Hydrant przy ulicy jest 60 m od hali - mieści się w 75 m. Ale hala ma ponad 5000 m³, więc potrzebne są dwa hydranty po 10 l/s. Drugi stoi 180 m dalej - za daleko. Trzeba wystąpić do wodociągów o hydrant bliżej albo zrobić zbiornik.”</p>`)}
${pulapki(["75 m - najbliższy hydrant od obiektu; 150 m - między hydrantami. Łatwo pomylić.", "DN 100 daje 15 l/s, DN 80 - 10 l/s.", "Hydrant 25 - 1 l/s, 33 - 1,5 l/s, 52 - 2,5 l/s.", "Hydrant co najmniej 5 m od ściany - żeby strażak nie stał w strefie spadającego gruzu."])}`,
  },
  {
    id: "fazy", skrot: "FAZY", tytul: "Fazy pożaru",
    html: () => `
${ludzku(`<p>Pożar w pomieszczeniu ma trzy etapy, jak życie świeczki w słoiku: najpierw rośnie, potem szaleje na całego, a na końcu dogasa, bo brakuje paliwa albo tlenu.</p>`)}
${rys(SVG_FAZY, "Wykres: temperatura w pomieszczeniu w czasie pożaru (krzywa poglądowa)")}
${tab(["Faza", "Co się dzieje", "Dla ludzi i strażaków"], [
    ["I - rozwój (początkowa)", "zapłon, pali się jeden przedmiot, rośnie warstwa gorącego dymu pod sufitem, tlenu jeszcze dużo", "czas na wykrycie i ewakuację - tu ma zadziałać czujka i gaśnica"],
    ["rozgorzenie (flashover)", "gorące gazy pod sufitem (ok. 500-600 °C) nagrzewają wszystko promieniowaniem - całe pomieszczenie zapala się w kilka sekund", "granica przeżycia - po rozgorzeniu w pomieszczeniu nie da się przeżyć"],
    ["II - pożar w pełni rozwinięty", "pali się wszystko, najwyższa temperatura 800-1100 °C, pożar ograniczony dopływem tlenu, płomienie wychodzą oknami", "gaszenie z zewnątrz i obrona sąsiednich pomieszczeń"],
    ["III - wygasanie", "paliwo się kończy, temperatura spada, żarzenie", "ryzyko ponownego zapłonu i wstecznego ciągu (backdraft) przy nagłym otwarciu zamkniętego pomieszczenia"],
  ])}
<h3>Połączenie z odpornością ogniową</h3>
<p>Ściany i stropy bada się w piecu według <b>krzywej normowej</b> (temperatura rośnie jak w prawdziwym pożarze). Po 30 minutach w piecu jest ok. 840 °C, po 60 minutach ok. 945 °C, po 120 minutach ok. 1050 °C. Dlatego „EI 60” znaczy: ściana wytrzymuje godzinę pożaru w pełni rozwiniętego.</p>
${wlasciciel(`<p>„Czujka dymu jest po to, żeby zaalarmować ludzi w pierwszej fazie - zanim pokój zapali się cały. Od małego ognia do rozgorzenia mija często tylko kilka minut.”</p>`)}
${pulapki(["System sygnalizacji pożarowej ma zadziałać w <b>I fazie</b>.", "Najwyższa temperatura - <b>II faza</b>.", "Rozgorzenie to przejście między I a II fazą.", "Wsteczny ciąg (backdraft) grozi w zamkniętym pomieszczeniu z gorącymi gazami i brakiem tlenu - przy otwarciu drzwi."])}`,
  },
  {
    id: "przejscia", skrot: "EWAK", tytul: "Przejście i dojście ewakuacyjne",
    html: () => `
${ludzku(`<p><b>Przejście</b> to droga <b>wewnątrz pomieszczenia</b> - od najdalszego kąta do drzwi. <b>Dojście</b> to dalsza droga <b>korytarzem i schodami</b> - od drzwi pomieszczenia do wyjścia na zewnątrz albo do innej strefy pożarowej (albo do obudowanej klatki schodowej z ochroną przed dymem).</p>`)}
${rys(SVG_EWAK, "Rysunek: przejście (w pomieszczeniu) i dojście (po korytarzu)")}
<h3>Przejście - najwyżej (§ 237 WT)</h3>
${tab(["Strefa", "Długość przejścia"], [["ZL (każda kategoria)", "40 m"], ["PM o Q ponad 500 MJ/m² w budynku wielokondygnacyjnym", "75 m"], ["PM o Q do 500 MJ/m² w budynku wielokondygnacyjnym oraz PM w budynku jednokondygnacyjnym", "100 m"], ["pomieszczenie zagrożone wybuchem", "40 m"]])}
<p>Powiększenia: pomieszczenie wyższe niż 5 m - <b>+25%</b>; tryskacze - <b>+50%</b>; oddymianie uruchamiane czujkami dymu - <b>+50%</b>; sumują się. Przejście nie może prowadzić przez więcej niż <b>3 pomieszczenia</b>. Szerokość: 0,6 m na 100 osób, nie mniej niż 0,9 m.</p>
<h3>Dojście - najwyżej (§ 256 ust. 3 WT)</h3>
${tab(["Strefa", "przy 1 dojściu", "przy 2 i więcej dojściach"], [["z pomieszczeniem zagrożonym wybuchem", "10 m", "40 m"], ["ZL I, ZL II, ZL V", "10 m", "40 m"], ["ZL III", "30 m*", "60 m"], ["ZL IV", "60 m*", "100 m"], ["PM Q ponad 500", "30 m*", "60 m"], ["PM Q do 500", "60 m*", "100 m"]])}
<p>* w tym najwyżej 20 m po poziomej drodze. Przy dwóch dojściach dłuższe może być o 100% dłuższe od krótszego, nie mogą się krzyżować. Powiększenia: tryskacze +50%, oddymianie drogi +50%, razem +100% (§ 256 ust. 4).</p>
<h3>Przykłady</h3>
${tab(["Sytuacja", "Ocena"], [["Hotel (ZL V), korytarz ślepy, od drzwi pokoju do klatki 14 m", "za długo - przy jednym dojściu w ZL V tylko 10 m"], ["Biuro (ZL III), jedno dojście 25 m, w tym 18 m korytarza", "OK - do 30 m, w tym do 20 m poziomo"], ["Sklep (ZL I), od kąta sali do drzwi 38 m między regałami", "OK - przejście do 40 m (mierzy się po drodze między regałami, nie w linii prostej)"], ["Hala PM jednokondygnacyjna, Q = 300, przejście 90 m", "OK - do 100 m"]])}
${wlasciciel(`<p>„Z końca korytarza do schodów jest 14 metrów i nie ma drugiej drogi. Dla hotelu dopuszczalne jest 10 metrów. Albo zrobimy drugie wyjście, albo trzeba oddymiania czy tryskaczy, które pozwalają ten dystans wydłużyć.”</p>`)}
${pulapki(["Przejście = w pomieszczeniu; dojście = korytarzem. Egzamin lubi zamieniać te pojęcia.", "ZL I, II i V - przy jednym dojściu tylko 10 m.", "Przejście nie przez więcej niż 3 pomieszczenia.", "Drzwi i przejście min. 0,9 m, korytarz min. 1,4 m (1,2 m dla nie więcej niż 20 osób)."])}`,
  },
  {
    id: "zjawiska", skrot: "DYM", tytul: "Parametry zjawisk pożarowych: dym, płomień, temperatura",
    html: () => `
${ludzku(`<p>Pożar „zdradza się” trzema zjawiskami: <b>dymem</b>, <b>płomieniem</b> i <b>ciepłem</b>. Każda czujka pożarowa „łapie” jedno z nich. Zwykły pożar w budynku najpierw dymi, potem pojawia się płomień, a na końcu rośnie temperatura - dlatego czujki dymu reagują najwcześniej.</p>`)}
${tab(["Zjawisko", "Czym jest", "Czym grozi", "Czujka"], [
    ["Dym", "gazy ze spalania z drobinami sadzy i kropelkami - zasłania widok", "ludzie gubią drogę, trujące gazy: tlenek węgla (czad), cyjanowodór; najwięcej ofiar ginie od dymu, nie od ognia", "optyczna (światło odbite od dymu), jonizacyjna"],
    ["Płomień", "świecąca strefa, w której spalają się gazy; promieniuje podczerwienią i nadfioletem, migocze", "zapala sąsiednie przedmioty promieniowaniem, oparzenia", "płomienia (podczerwień IR lub nadfiolet UV)"],
    ["Temperatura (ciepło)", "przenosi się przez konwekcję (gorące gazy idą w górę), promieniowanie i przewodzenie", "rozgorzenie, utrata nośności konstrukcji (stal traci nośność ok. 500 °C)", "ciepła: nadmiarowa (próg temperatury), różniczkowa (szybki wzrost)"],
  ])}
<h3>Jaką czujkę gdzie</h3>
${tab(["Miejsce", "Czujka", "Dlaczego"], [["biuro, hotel, korytarz", "dymu (optyczna)", "pożar tli się i dymi, zanim pojawi się płomień"], ["kuchnia, kotłownia, zakurzona hala", "ciepła", "para i kurz powodowałyby fałszywe alarmy czujek dymu"], ["magazyn cieczy palnych, lakiernia", "płomienia", "pożar od razu daje płomień, bez fazy dymienia"], ["wysoka hala (np. 15 m)", "liniowa dymu lub zasysająca", "dym rozrzedza się, zanim dotrze do sufitu"]])}
${wlasciciel(`<p>„W kuchni nie montujemy czujki dymu, bo para z garnków co chwilę włączałaby alarm i ewakuację. Tu działa czujka ciepła.”</p>`)}
${pulapki(["Podstawowe parametry zjawisk pożarowych: <b>dym, płomień, temperatura</b>.", "Czujki najczęściej reagują na dym.", "Największą liczbę ofiar powoduje tlenek węgla (czad).", "Czujka różniczkowa reaguje na szybkość wzrostu temperatury, nadmiarowa - na przekroczenie progu."])}`,
  },
  {
    id: "wysokosci", skrot: "N/W", tytul: "Budynki niskie, średniowysokie, wysokie i wysokościowe",
    html: () => `
${ludzku(`<p>Im wyższy budynek, tym trudniej z niego uciec i tym trudniej strażakom go gasić (drabina sięga ok. 30-40 m). Dlatego przepisy dzielą budynki na cztery grupy wysokości i od nich zależą wymagania.</p>`)}
${rys(SVG_WYSOKOSCI, "Rysunek: grupy wysokości budynków (§ 8 WT)")}
${tab(["Grupa", "Każdy budynek", "Budynek mieszkalny", "Przykład"], [["niski (N)", "do 12 m włącznie", "do 4 kondygnacji nadziemnych", "dom, szkoła parterowa, blok: parter + 3 piętra (4 kondygnacje)"], ["średniowysoki (SW)", "ponad 12 do 25 m", "5-9 kondygnacji", "blok: parter + 8 pięter (9 kondygnacji), biurowiec 20 m"], ["wysoki (W)", "ponad 25 do 55 m", "10-18 kondygnacji", "blok: parter + 11 pięter (12 kondygnacji), biurowiec 40 m"], ["wysokościowy (WW)", "ponad 55 m", "-", "wieżowce w centrach miast"]])}
<h3>Jak mierzyć (§ 6 WT)</h3>
<p>Od poziomu terenu przy <b>najniżej położonym wejściu</b> do budynku do górnej powierzchni <b>najwyższego stropu</b> (z ociepleniem) albo najwyższego punktu stropodachu - bez maszynowni dźwigów i innych pomieszczeń technicznych ponad dachem.</p>
<h3>Trzy grupy według przeznaczenia (§ 209 WT)</h3>
${tab(["Grupa", "Co obejmuje"], [["ZL", "mieszkalne, zamieszkania zbiorowego, użyteczności publicznej - kategorie ZL I-V (temat 10)"], ["PM", "produkcyjne i magazynowe, a także garaże, kotłownie, hydrofornie, węzły cieplne, rozdzielnie, stacje transformatorowe"], ["IN", "inwentarskie - dla zwierząt"]])}
${wlasciciel(`<p>„Pana biurowiec ma 26 m - to już budynek wysoki. Każdy metr ponad 25 ma znaczenie: wyższa klasa odporności, hydranty na każdej kondygnacji, ostrzejsze wymagania dla klatek schodowych.”</p>`)}
${pulapki(["„do 12 m włącznie” - 12,0 m to jeszcze niski.", "Budynek mieszkalny klasyfikuje się po <b>kondygnacjach</b>, inne - po metrach.", "Mieszkalny ponad 55 m - i tak WW.", "Mierzy się od najniżej położonego wejścia, nie od średniego poziomu terenu."])}`,
  },
  {
    id: "strefy-ex", skrot: "Ex", tytul: "Strefy zagrożenia wybuchem: 0, 1, 2 i 20, 21, 22",
    html: () => `
${ludzku(`<p>Strefa zagrożenia wybuchem to miejsce, gdzie w powietrzu może pojawić się palny gaz, opar albo pył w takiej ilości, że iskra wywoła wybuch. Numer mówi, <b>jak często</b> taka mieszanina tam jest: 0 lub 20 - stale, 1 lub 21 - czasami, 2 lub 22 - rzadko i krótko. Pierwsza cyfra „2” przy dwucyfrowych oznacza pył.</p>`)}
${tab(["Gazy, pary, mgły", "Pyły", "Jak często jest mieszanina wybuchowa", "Przykład"], [["strefa 0", "strefa 20", "stale, długo lub często", "wnętrze zbiornika paliwa; wnętrze silosu z mąką"], ["strefa 1", "strefa 21", "czasami, przy normalnej pracy", "wnętrze odmierzacza na stacji; miejsce napełniania worków mąką"], ["strefa 2", "strefa 22", "rzadko i krótko, tylko przy awarii", "okolica odpowietrzenia zbiornika; pomieszczenie obok silosu"]])}
${rys(SVG_STACJA, "Rysunek: strefy na stacji paliw (wymiary z załącznika do rozporządzenia o stacjach paliw z 2023 r.; wnętrze zbiornika - strefa 0 wg normy)")}
${tab(["Miejsce na stacji paliw", "Strefa"], [["część hydrauliczna odmierzacza i zagłębienie pod nim", "1"], ["szczelina bezpieczeństwa odmierzacza", "2"], ["zbiornik podziemny - wokół wylotu odpowietrzenia", "2, promień 1,5 m"], ["studzienka zlewowa", "2, promień 1 m od osi przewodu spustowego"], ["pompa na otwartej przestrzeni", "1 do 1,5 m, dalej 2 do kolejnych 1,5 m"]])}
<h3>Co z tego wynika w praktyce</h3>
<ul><li>W strefie wolno używać tylko urządzeń w wykonaniu przeciwwybuchowym (znak Ex): strefa 0 - kategoria 1, strefa 1 - kategoria 2, strefa 2 - kategoria 3.</li><li>Zakaz otwartego ognia, palenia i iskrzących narzędzi (§ 4 ust. 1 pkt 1 lit. a rozp. 2010).</li><li>Strefy wyznacza w ocenie zagrożenia wybuchem inwestor, projektant lub użytkownik decydujący o technologii (§ 37 ust. 4 rozp. 2010); strefę wyznacza się, gdy mieszanina może mieć co najmniej 0,01 m³ (§ 37 ust. 9).</li><li>Obiekt ze strefą Ex zawsze potrzebuje IBP i przeciwpożarowego wyłącznika prądu.</li></ul>
${wlasciciel(`<p>„Przy kabinie lakierniczej jest strefa 1. Zwykła lampa, wentylator czy telefon mogą dać iskrę. Wszystko w tej strefie musi mieć oznaczenie Ex, a w instrukcji musi być plan stref.”</p>`)}
${pulapki(["Strefa 21 = pył, czasami w normalnej pracy.", "Strefa 0 = gaz/pary stale; strefa 20 = pył stale.", "Strefa zagrożenia wybuchem (gdzie może być mieszanina) ≠ pomieszczenie zagrożone wybuchem (gdzie wybuch dałby ponad 5 kPa).", "Minimalna objętość mieszaniny do wyznaczenia strefy: 0,01 m³."])}`,
  },
  {
    id: "klasy-strefy", skrot: "KLASA", tytul: "Klasa odporności pożarowej i wielkość strefy - jak ustalić",
    html: () => `
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
${wlasciciel(`<p>„Hala ma 9000 m² i składuje Pan kartony (Q ok. 1500). Dopuszczalna strefa to 8000 m². Trzeba albo ściany ogniowej, która podzieli halę na dwie strefy, albo tryskaczy - wtedy strefa może być dwa razy większa.”</p>`)}
${pulapki(["Klasa odporności pożarowej dotyczy <b>budynku</b> (A-E); klasa odporności ogniowej dotyczy <b>elementu</b> (np. REI 60).", "Dla PM decyduje Q i wysokość, dla ZL - kategoria i wysokość.", "Przy SUG + oddymianiu w PM powiększenie do 150%, w ZL do 200%."])}`,
  },
  {
    id: "ewakuacja", skrot: "EWAC", tytul: "Zasady ewakuacji - kto, co, jak często i ciekawostki",
    html: () => `
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
${wlasciciel(`<p>„Ma Pan 80 pracowników - próbna ewakuacja co najmniej raz na dwa lata, z powiadomieniem straży tydzień wcześniej. Zrobię scenariusz, wyznaczymy opiekunów pięter i zmierzymy czas. To też dowód przy kontroli, że obowiązek jest spełniony.”</p>`)}
${pulapki(["Próbna ewakuacja: ponad 50 <b>stałych</b> użytkowników - co 2 lata; szkoły - co rok.", "Powiadomienie PSP - tydzień przed.", "Pracodawca wyznacza osoby do ewakuacji (Kodeks pracy).", "Kierujący działaniem ratowniczym może zarządzić ewakuację, ale nie wysiedlenie."])}`,
  },
  {
    id: "zl", skrot: "ZL", tytul: "Kategorie ZL I-V - różnice i trudne przypadki",
    html: () => `
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
${wlasciciel(`<p>„Sala jest dla Pana uczniów - to ZL III. Ale jeśli zacznie Pan wynajmować ją na koncerty dla ponad 50 osób z zewnątrz, zmienia się sposób użytkowania na ZL I. To zmienia wymagania: wyjścia, oświetlenie, drogę pożarową, uzgodnienie z rzeczoznawcą.”</p>`)}
${pulapki(["„Ponad 50 osób” - 50 to jeszcze nie ZL I.", "Liczą się osoby <b>niebędące stałymi użytkownikami</b>.", "Kategorię ma <b>strefa pożarowa</b>, a o ZL I decyduje pomieszczenie w niej.", "Przedszkole - ZL II; szkoła - ZL III."])}`,
  },
  {
    id: "materialy", skrot: "MAT", tytul: "Materiały niepalne, niezapalne, trudno zapalne, łatwo zapalne",
    html: () => `
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
${wlasciciel(`<p>„Wykładzina na korytarzu ewakuacyjnym ma deklarację Dfl - łatwo zapalna. Trzeba wymienić na co najmniej Cfl-s1. Proszę zawsze żądać od wykonawcy deklaracji właściwości użytkowych - tam jest klasa.”</p>`)}
${pulapki(["Materiał trudno zapalny gaśnie po usunięciu źródła ognia.", "Euroklasy: A1, A2, B, C, D, E, F + s (dym) i d (krople).", "Niepalny = A1 i A2-s?,d0. Drewno lite to zwykle łatwo zapalne (D).", "NRO / SRO / ŁRO dotyczą elementów, a nie samych materiałów."])}`,
  },
  {
    id: "skroty-hydranty", skrot: "DN", tytul: "DN 100 i inne skróty przy hydrantach",
    html: () => `
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
${wlasciciel(`<p>„Hydrant przed firmą to DN 80 - daje 10 litrów na sekundę. Dla Pana budynku potrzeba 20, więc wystarczą dwa takie hydranty w zasięgu 150 m albo jeden duży plus zbiornik.”</p>`)}
${pulapki(["DN 100 - 15 dm³/s, DN 80 - 10 dm³/s.", "Hydranty wewnętrzne: 25 - 1 l/s, 33 - 1,5 l/s, 52 - 2,5 l/s.", "Wąż półsztywny - hydranty 25 i 33; płasko składany - hydrant 52."])}`,
  },
  {
    id: "obciazenie", skrot: "Qd", tytul: "Obciążenie ogniowe - jak liczyć, z przykładami",
    html: () => `
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
${wlasciciel(`<p>„Ma Pan na każdym metrze ok. 80 kg kartonów - to prawie 1300 MJ/m². Od tej liczby zależy, ile gaśnic, jakie hydranty i jak duża może być hala bez ściany ogniowej. Jeśli zwiększy Pan składowanie, muszę to przeliczyć.”</p>`)}
${pulapki(["Jednostka: MJ/m².", "Potrzebne: masa materiałów i ich ciepło spalania (nie skład chemiczny).", "Dla ZL gęstości obciążenia ogniowego się nie liczy - tylko PM i IN.", "Dziel przez powierzchnię strefy lub pomieszczenia, nie całego terenu."])}`,
  },
  {
    id: "dgw", skrot: "DGW", tytul: "DGW i GGW - granice wybuchowości gazów, par i pyłów",
    html: () => `
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
  ])}`,
  },
  {
    id: "obchod", skrot: "OBCH", tytul: "Wartości przy obchodzie - na zewnątrz i wewnątrz budynku, ZL, PM i IN",
    html: () => `
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
${wlasciciel(`<p>„Na obchodzie patrzę na trzy rzeczy: czy straż dojedzie i dostanie wodę, czy ludzie wyjdą, czy sprzęt działa. Liczby, które Panu podaję, to minimum z przepisów - nie moje widzimisię.”</p>`)}
${pulapki([
    "Droga pożarowa: 4 m szerokości, 5-15 m od ściany ZL, 5-25 m od innych, łuk min. 11 m, plac 20 × 20 m, cofanie do 15 m, nic wyższego niż 3 m pomiędzy.",
    "Hydrant zewnętrzny: do 75 m od budynku, co 150 m, do 15 m od jezdni, min. 5 m od ściany.",
    "Gaśnice: do 30 m od każdego miejsca, dostęp 1 m, przegląd co rok.",
    "Materiały palne: 0,5 m od urządzeń nagrzewających się ponad 100 °C; 4 m od granicy działki; 5 m od drogi pożarowej pod ścianą.",
    "Awaryjne oświetlenie ewakuacyjne: działa co najmniej 1 godzinę.",
  ])}`,
  },
];

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
