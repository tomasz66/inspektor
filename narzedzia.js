// Narzędzia inspektora - kalkulatory wymagań z podstawą prawną (paragraf, ustęp, punkt).
// Tabele przepisane z tekstu aktów i sprawdzone 1.11.2026 (WT 2002 § 8, 212, 216, 220, 227, 228, 231, 232, 237, 256, 271;
// rozp. 2010 § 6, 17, 19, 27-29, 32-33; rozp. 2009 § 3, 5, 6 z tabelą nr 2, 10, 12-13; rozp. 2023/1563 § 3).
//
//   #/narzedzia                 lista narzędzi
//   #/narzedzia/obiekt          „Sprawdź budynek” - kilka prostych pytań → wszystkie wymagania naraz
//   #/narzedzia/osoby           ile osób i jakie drzwi
//   #/narzedzia/obciazenie      ile palnych rzeczy (gęstość obciążenia ogniowego)
//   #/narzedzia/odleglosci      odległość od sąsiedniego budynku
//   #/narzedzia/terminy         terminy przeglądów, kontroli, aktualizacji
//
// Dane wpisane w formularzach zostają w telefonie (localStorage), żeby wrócić do obiektu w terenie.

const KLUCZ_OBIEKTU = "insp-obiekt";
const KLUCZ_OSOB = "insp-osoby";
const KLUCZ_MATERIALOW = "insp-materialy";
const KLUCZ_ODLEGLOSCI = "insp-odleglosci";

TRASY.push(
  [/^#\/narzedzia$/, () => widokNarzedzi()],
  [/^#\/narzedzia\/obiekt$/, () => location.replace("#/analiza")],
  [/^#\/narzedzia\/osoby$/, () => widokOsob()],
  [/^#\/narzedzia\/obciazenie$/, () => widokObciazenia()],
  [/^#\/narzedzia\/odleglosci$/, () => widokOdleglosci()],
  [/^#\/narzedzia\/terminy$/, () => widokTerminow()],
);

// ── Tabele z przepisów ──

const GRUPY = ["N", "SW", "W", "WW"];
const NAZWY_GRUP = { N: "niski (N)", SW: "średniowysoki (SW)", W: "wysoki (W)", WW: "wysokościowy (WW)" };

// WT § 212 ust. 2 - klasa odporności pożarowej ZL [N, SW, W, WW]
const KLASA_ZL = { "ZL I": "BBBA", "ZL II": "BBBA", "ZL III": "CBBA", "ZL IV": "DCBB", "ZL V": "CBBA" };
// WT § 212 ust. 3 - dopuszczalne obniżenie: 1 kondygnacja / 2 kondygnacje (strop nad 1. ≤ 9 m)
const OBNIZENIE_ZL = { "ZL I": ["D", "C"], "ZL II": ["D", "C"], "ZL III": ["D", "D"] };
// WT § 212 ust. 4 - PM i IN: [1 kondygnacja, N, SW, W, WW]; null - budynek niedopuszczalny (§ 228 ust. 1)
const KLASA_PM = [[500, "EDCBB"], [1000, "DDCBB"], [2000, "CCCBB"], [4000, "BBB--"], [Infinity, "AAA--"]];
// WT § 216 ust. 1 - wymagania dla elementów
const ELEMENTY = ["główna konstrukcja nośna", "konstrukcja dachu", "strop", "ściana zewnętrzna", "ściana wewnętrzna", "przekrycie dachu"];
const KLASY_ELEMENTOW = {
  A: ["R 240", "R 30", "R E I 120", "E I 120", "E I 60", "R E 30"],
  B: ["R 120", "R 30", "R E I 60", "E I 60", "E I 30", "R E 30"],
  C: ["R 60", "R 15", "R E I 60", "E I 30", "E I 15", "R E 15"],
  D: ["R 30", "(-)", "R E I 30", "E I 30", "(-)", "(-)"],
  E: ["(-)", "(-)", "(-)", "(-)", "(-)", "(-)"],
};
// WT § 232 ust. 4 - elementy oddzielenia: ściany i stropy (poza stropami w ZL), stropy w ZL, drzwi
const ODDZIELENIA = { A: ["R E I 240", "R E I 120", "E I 120"], B: ["R E I 120", "R E I 60", "E I 60"], C: ["R E I 120", "R E I 60", "E I 60"],
  D: ["R E I 60", "R E I 30", "E I 30"], E: ["R E I 60", "R E I 30", "E I 30"] };
// WT § 227 ust. 1 - strefy ZL [1 kondygnacja, N, SW, W i WW]
const STREFA_ZL = { inne: [10000, 8000, 5000, 2500], "ZL II": [8000, 5000, 3500, 2000] };
// WT § 228 ust. 1 - strefy PM [1 kondygnacja, N i SW, W i WW]; 0 - niedopuszczalne
const STREFA_PM_WYBUCH = [[500, [8000, 3000, 1000]], [1000, [6000, 2000, 500]], [2000, [4000, 1000, 0]], [4000, [2000, 0, 0]], [Infinity, [1000, 0, 0]]];
const STREFA_PM = [[500, [20000, 10000, 5000]], [1000, [15000, 8000, 2500]], [2000, [8000, 4000, 1000]], [4000, [4000, 2000, 0]], [Infinity, [2000, 1000, 0]]];
// WT § 231 ust. 1 - strefy IN [ściółkowa, bezściółkowa] wg liczby kondygnacji; Infinity - nie ogranicza się
const STREFA_IN = [[5000, Infinity], [2500, 5000], [1000, 2500]];
// WT § 256 ust. 3 - dojścia [jedno, co najmniej dwa]
const DOJSCIA = { wybuch: [10, 40], pmDuze: [30, 60], pmMale: [60, 100], "ZL I": [10, 40], "ZL II": [10, 40], "ZL V": [10, 40], "ZL III": [30, 60], "ZL IV": [60, 100] };
// Rozp. 2009, tabela nr 2 (§ 6 ust. 3) - woda dla PM [dm³/s]; kolumny: strefa do 500, 1000, 2000, 3000, 4000, 5000, ponad 5000 m²
const WODA_PM_KOLUMNY = [500, 1000, 2000, 3000, 4000, 5000, Infinity];
const WODA_PM = [[200, [10, 10, 10, 10, 15, 15, 20]], [500, [10, 10, 10, 20, 20, 30, 30]], [1000, [10, 10, 20, 20, 30, 30, 40]],
  [2000, [10, 20, 20, 30, 30, 40, 40]], [4000, [20, 20, 30, 30, 40, 40, 50]], [Infinity, [20, 30, 30, 40, 40, 50, 60]]];
const WYDAJNOSC_HYDRANTU = 10;
const ZBIORNIK_NA_DM3 = 10;

// Rozp. 2010 § 32 ust. 3 - jednostka masy środka gaśniczego
const KG_NA_JEDNOSTKE = 2;

// WT § 236 ust. 6 - m² na osobę
const WSKAZNIKI = [["handlowo-usługowe", 4, 2], ["administracyjno-biurowe", 5, 3], ["sala konferencyjna, gastronomia, poczekalnia, hol, świetlica", 1, 1],
  ["archiwum, biblioteka", 7, 4], ["magazyn", 30, 5], ["liczba miejsc znana (podaj osoby)", 0, 0]];

// WT § 271 ust. 1 - odległości [ZL, IN, PM ≤1000, PM 1000-4000, PM >4000]
const RODZAJE_ODL = ["ZL", "IN", "PM Q ≤ 1000 MJ/m²", "PM 1000 < Q ≤ 4000 MJ/m²", "PM Q > 4000 MJ/m²"];
const ODL = [[8, 8, 8, 15, 20], [8, 8, 8, 15, 20], [8, 8, 8, 15, 20], [15, 15, 15, 15, 20], [20, 20, 20, 20, 20]];

// Ciepło spalania - wartości orientacyjne do szybkiej oceny (do pracy: PN-B-02852, karty charakterystyki)
const CIEPLO = [["Drewno, palety, płyty drewnopochodne", 18], ["Papier, tektura, karton", 16], ["Tworzywa sztuczne (średnio)", 42],
  ["Polietylen, polipropylen (folie)", 44], ["Polistyren (styropian)", 40], ["PVC", 20], ["Guma, opony", 37], ["Tekstylia (bawełna)", 17],
  ["Tekstylia syntetyczne", 30], ["Olej napędowy, opałowy", 43], ["Benzyna", 44], ["Alkohol etylowy", 27], ["Żywność sucha (zboże, mąka, cukier)", 16]];

// ── Pomocnicze ──
// Zasada (Tomek 1.11): proste pytania zamiast fachowych pól, wynik zwykłym językiem, przepis drobnym drukiem.

function liczba(v) {
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function m(x, miejsca = 0) {
  return x.toLocaleString("pl-PL", { maximumFractionDigits: miejsca, minimumFractionDigits: miejsca });
}

function pole(id, etykieta, wartosc, opis) {
  return `<label class="nz-pole"><span>${tekst(etykieta)}</span><input id="${id}" type="text" inputmode="decimal" value="${esc(wartosc ?? "")}">${opis ? `<small>${tekst(opis)}</small>` : ""}</label>`;
}

function wybor(id, etykieta, opcje, wartosc, opis) {
  return `<label class="nz-pole"><span>${tekst(etykieta)}</span><select id="${id}">${opcje.map(([v, t]) => `<option value="${esc(v)}"${String(v) === String(wartosc) ? " selected" : ""}>${tekst(t)}</option>`).join("")}</select>${opis ? `<small>${tekst(opis)}</small>` : ""}</label>`;
}

function takNie(id, pytanie, wartosc, opis) {
  return `<label class="nz-check"><input id="${id}" type="checkbox"${wartosc ? " checked" : ""}><span>${tekst(pytanie)}${opis ? `<small>${tekst(opis)}</small>` : ""}</span></label>`;
}

// Jedna odpowiedź: pytanie, odpowiedź zwykłym językiem, przepis drobnym drukiem, znaczek „OK / za dużo”.
function wynik(co, wartosc, podstawa, stan) {
  const znak = stan === true ? `<span class="nz-ok">OK</span>` : stan === false ? `<span class="nz-nie">nie spełnia</span>` : "";
  return `<div class="nz-wynik"><p class="nz-co">${tekst(co)}${znak}</p><p class="nz-wartosc">${pogrubLiczby(tekst(wartosc))}</p>${podstawa ? `<p class="nz-podstawa">Przepis: ${tekst(podstawa)}</p>` : ""}</div>`;
}

function blok(tytul, zawartosc) {
  return zawartosc ? `<div class="section-label">${tekst(tytul)}</div><div class="nz-blok">${zawartosc}</div>` : "";
}

function zbierz(ids) {
  const o = {};
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      o[id] = el.type === "checkbox" ? el.checked : el.value;
    }
  });
  return o;
}

function podepnij(ids, klucz, licz) {
  const odswiez = () => {
    const d = Object.assign(czytaj(klucz, {}), zbierz(ids));
    zapisz(klucz, d);
    document.getElementById("nz-wyniki").innerHTML = licz(d);
  };
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", odswiez);
    }
  });
  odswiez();
}

function wedlugQ(tabela, q) {
  return tabela.find(([gora]) => q <= gora)[1];
}

// ── Lista narzędzi ──

function widokNarzedzi() {
  ustawNaglowek("Narzędzia", "#/start");
  ustawZakladke("start");
  const k = (h, s, kolor, t, o) => wiersz(h, s, kolor, t, o);
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Odpowiedz na kilka prostych pytań - dostaniesz wymagania zwykłymi słowami, a pod spodem przepis. Wpisane dane zostają w telefonie.")}</div></div>
    <div class="list-group" style="margin-top:12px">
      ${k("#/narzedzia/obchod", "OBCH", "#0e6655", "Obchód obiektu", "Lista kontrolna na obchód: przy każdym punkcie wartość i przepis, na końcu uwagi do protokołu")}
      ${k("#/analiza", "LICZ", "#c0392b", "Analiza budynku", "Kalkulator: wymagania, ocena i gotowy tekst do tabeli analizy")}
      ${k("#/narzedzia/osoby", "OSOBY", "#2f5d8a", "Ile osób i jakie drzwi", "Ile osób zmieści się w pomieszczeniach i jak szerokie mają być wyjścia")}
      ${k("#/narzedzia/obciazenie", "OGIEŃ", "#b9770e", "Ile palnych rzeczy", "Obciążenie ogniowe magazynu lub hali - z wagi towaru")}
      ${k("#/narzedzia/odleglosci", "ODL", "#566573", "Odległość od sąsiada", "Jak daleko musi stać budynek obok")}
      ${k("#/narzedzia/terminy", "TERM", "#1e7a4c", "Terminy przeglądów", "Co ile robić przeglądy, czyszczenie kominów, próbną ewakuację")}
    </div>`;
}

// ── Sprawdź budynek ──

// Rodzaj budynku → kategoria, przeznaczenie, m² na osobę (§ 236 ust. 6 WT) i o jakie „miejsca” pytać.
const TYPY = [
  ["sklep", "Sklep, hurtownia, galeria handlowa", "ZL I", "handel", 4, ""],
  ["restauracja", "Restauracja, bar, kawiarnia", "ZL I", "gastronomia", 1, "Ile miejsc przy stolikach?"],
  ["kino", "Kino", "ZL I", "kino", 1, "Ile miejsc na widowni?"],
  ["teatr", "Teatr, sala koncertowa", "ZL I", "teatr", 1, "Ile miejsc na widowni?"],
  ["sport", "Hala sportowa, sala widowiskowa", "ZL I", "sport", 1, "Ile miejsc dla widzów?"],
  ["dworzec", "Dworzec, port", "ZL I", "dworzec", 1, ""],
  ["biuro", "Biuro, urząd, bank, usługi", "ZL III", "biuro", 5, ""],
  ["szkola", "Szkoła, uczelnia", "ZL III", "oswiata", 0, "Ilu uczniów i pracowników naraz?"],
  ["szpital", "Szpital, sanatorium", "ZL II", "szpital", 0, "Ile łóżek?"],
  ["opieka", "Przedszkole, żłobek, dom opieki", "ZL II", "opieka", 0, "Ile dzieci / mieszkańców?"],
  ["hotel", "Hotel, pensjonat, internat, akademik", "ZL V", "hotel", 0, "Ile miejsc noclegowych?"],
  ["mieszkalny", "Blok, dom mieszkalny", "ZL IV", "mieszkalny", 0, ""],
  ["produkcja", "Hala produkcyjna, warsztat", "PM", "produkcja", 30, ""],
  ["magazyn", "Magazyn (bez klientów)", "PM", "magazyn", 30, ""],
  ["obora", "Obora, chlewnia, kurnik", "IN", "inwentarski", 0, ""],
];
// Gęstość obciążenia ogniowego dla PM - wybór słowami, środek przedziału
const OGIEN = [["300", "Mało (metal, szkło, maszyny)"], ["800", "Średnio (warsztat, magazyn mieszany)"],
  ["1500", "Dużo (kartony, drewno, meble)"], ["3000", "Bardzo dużo (tworzywa, opony, papier)"], ["5000", "Ekstremalnie (paliwa, rozpuszczalniki)"]];
const WYS_PIETRA = 3.5;

const POLA_OBIEKTU = ["ob-typ", "ob-kond", "ob-wys", "ob-pow", "ob-kub", "ob-ogien", "ob-q", "ob-miejsca", "ob-osoby", "ob-prac", "ob-wybuch", "ob-tryskacze", "ob-wies"];

function widokObiektu() {
  ustawNaglowek("Sprawdź budynek", "#/praca");
  ustawZakladke("start");
  const d = czytaj(KLUCZ_OBIEKTU, {});
  if (!d["ob-typ"]) {
    Object.assign(d, { "ob-typ": "sklep", "ob-kond": "1", "ob-wys": "8,88", "ob-pow": "2520", "ob-kub": "21596", "ob-prac": "25", "ob-ogien": "800" });
  }
  const typ = TYPY.find((t) => t[0] === d["ob-typ"]) || TYPY[0];
  const pmIn = typ[2] === "PM";
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Na start wpisana hurtownia z Twojej pracy zaliczeniowej - zmień na swój budynek.")}</div></div>
    <div class="nz-formularz">
      ${wybor("ob-typ", "1. Co to za budynek?", TYPY.map((t) => [t[0], t[1]]), d["ob-typ"])}
      ${pole("ob-kond", "2. Ile pięter nad ziemią (z parterem)?", d["ob-kond"])}
      ${pole("ob-pow", "3. Powierzchnia wszystkich pięter razem [m²]", d["ob-pow"], "Gdy budynek dzieli się ścianami ogniowymi na części - wpisz jedną część.")}
      ${pole("ob-wys", "4. Wysokość budynku [m] - jeśli wiesz", d["ob-wys"], "Puste = liczę 3,5 m na piętro.")}
      ${pole("ob-kub", "5. Kubatura [m³] - jeśli wiesz", d["ob-kub"], "Puste = powierzchnia × wysokość piętra.")}
      ${typ[5] ? pole("ob-miejsca", `6. ${typ[5]}`, d["ob-miejsca"]) : ""}
      ${pole("ob-osoby", `${typ[5] ? 7 : 6}. Ile osób może być naraz - jeśli wiesz`, d["ob-osoby"], "Puste = liczę z przepisu (np. sklep: 1 osoba na 4 m²).")}
      ${pole("ob-prac", "Ilu pracowników?", d["ob-prac"])}
      ${pmIn ? wybor("ob-ogien", "Ile jest palnych rzeczy?", OGIEN, d["ob-ogien"], "Dokładnie policzysz w narzędziu „Ile palnych rzeczy”.") : ""}
      ${pmIn ? pole("ob-q", "albo wpisz policzone obciążenie ogniowe [MJ/m²]", d["ob-q"]) : ""}
      ${takNie("ob-wybuch", "Czy coś może wybuchnąć?", d["ob-wybuch"], "Gaz, opary paliw lub rozpuszczalników, pył (mąka, drewno), ładowanie akumulatorów kwasowych.")}
      ${takNie("ob-tryskacze", "Czy są tryskacze (instalacja gaśnicza na suficie)?", d["ob-tryskacze"])}
      ${takNie("ob-wies", "Budynek stoi na odludziu (poza miejscowością)", d["ob-wies"])}
    </div>
    <div class="btn-row"><button class="pastylka szara" onclick="document.getElementById('nz-wyniki').scrollIntoView({behavior:'smooth'})">Pokaż wynik ↓</button></div>
    <div id="nz-wyniki"></div>`;
  document.getElementById("ob-typ").addEventListener("change", () => {
    zapisz(KLUCZ_OBIEKTU, Object.assign(czytaj(KLUCZ_OBIEKTU, {}), zbierz(POLA_OBIEKTU)));
    widokObiektu();
  });
  podepnij(POLA_OBIEKTU, KLUCZ_OBIEKTU, liczObiekt);
}

function grupaWysokosci(kat, wys, kond) {
  if (wys > 55) {
    return "WW";
  }
  if (kat === "ZL IV") {
    return kond <= 4 ? "N" : kond <= 9 ? "SW" : kond <= 18 ? "W" : "WW";
  }
  return wys <= 12 ? "N" : wys <= 25 ? "SW" : "W";
}

const OPIS_GRUP = { N: "niski (do 12 m)", SW: "średniowysoki (12-25 m)", W: "wysoki (25-55 m)", WW: "wysokościowy (ponad 55 m)" };
const OPIS_KAT = { "ZL I": "dużo osób z zewnątrz (ponad 50 naraz)", "ZL II": "osoby, które same nie uciekną (chorzy, dzieci, starsi)", "ZL III": "biuro, szkoła, mały lokal",
  "ZL IV": "mieszkalny", "ZL V": "nocleg dla obcych osób", PM: "produkcja lub magazyn", IN: "dla zwierząt" };

function liczObiekt(d) {
  const typ = TYPY.find((t) => t[0] === d["ob-typ"]) || TYPY[0];
  const przezn = typ[3];
  const kond = Math.max(1, Math.round(liczba(d["ob-kond"])) || 1);
  const wys = liczba(d["ob-wys"]) || kond * WYS_PIETRA;
  const pow = liczba(d["ob-pow"]);
  const kub = liczba(d["ob-kub"]) || pow * (wys / kond);
  const miejsca = liczba(d["ob-miejsca"]);
  const prac = liczba(d["ob-prac"]);
  let osoby = liczba(d["ob-osoby"]);
  let osobySkad = "";
  if (!osoby) {
    osoby = typ[4] ? Math.ceil(pow / typ[4]) : miejsca + prac;
    osobySkad = typ[4] ? ` (całość liczona jak ${typ[4] === 30 ? "magazyn" : "główne pomieszczenie"}: 1 osoba na ${typ[4]} m²; dokładniej - narzędzie „Ile osób i jakie drzwi”)` : " (miejsca + pracownicy)";
  }
  let kat = typ[2];
  let katUwaga = "";
  if (kat === "ZL I" && osoby <= 50) {
    kat = "ZL III";
    katUwaga = " - przy najwyżej 50 osobach z zewnątrz to ZL III";
  }
  const zl = kat.startsWith("ZL");
  const pm = kat === "PM";
  const q = pm || kat === "IN" ? liczba(d["ob-q"]) || liczba(d["ob-ogien"]) || 300 : 0;
  const wybuch = d["ob-wybuch"];
  const sug = d["ob-tryskacze"];
  const grupa = grupaWysokosci(kat, wys, kond);
  const gi = GRUPY.indexOf(grupa);
  const wysoki = grupa === "W" || grupa === "WW";
  const up = ["ZL I", "ZL II", "ZL III"].includes(kat);
  const zbiorowe = kat === "ZL V";
  const out = [];

  // Jaki to budynek
  out.push(blok("Twój budynek", wynik("Rodzaj", `${kat} - ${OPIS_KAT[kat]}${katUwaga}. Budynek ${OPIS_GRUP[grupa]}. Osób naraz: ${m(osoby)}${osobySkad}.`,
    "§ 209 ust. 2, § 8, § 236 ust. 6 WT")));

  // Odporność na ogień
  let klasa;
  let klasaTxt;
  if (zl) {
    klasa = KLASA_ZL[kat][gi];
    klasaTxt = `Klasa „${klasa}”`;
    const obn = OBNIZENIE_ZL[kat];
    if (obn && grupa === "N" && kond <= 2 && obn[kond - 1] > klasa) {
      klasaTxt += ` - ale przy ${kond === 1 ? "1 piętrze" : "2 piętrach (strop nad parterem do 9 m)"} wolno obniżyć do „${obn[kond - 1]}”`;
      klasa = obn[kond - 1];
    }
  } else if (kat === "IN" && kub <= 1500) {
    klasa = "E";
    klasaTxt = "Mały budynek dla zwierząt (do 1500 m³) - bez wymagań";
  } else {
    klasa = wedlugQ(KLASA_PM, q)[kond === 1 ? 0 : gi + 1];
    klasaTxt = klasa === "-" ? "Przy tak dużej ilości palnych rzeczy taki wysoki budynek jest niedozwolony" : `Klasa „${klasa}”`;
  }
  let elem = "";
  if (KLASY_ELEMENTOW[klasa] && klasa !== "E") {
    const czas = (s) => (s === "(-)" ? "" : `${s.match(/\d+/)[0]} min`);
    const el = ELEMENTY.map((e, i) => [e, czas(KLASY_ELEMENTOW[klasa][i])]).filter(([, c]) => c);
    elem = ` Ile minut mają wytrzymać ogień: ${el.map(([e, c]) => `${e} ${c}`).join(", ")}. Materiały nierozprzestrzeniające ognia.`;
  }
  out.push(blok("Odporność na ogień", wynik("Jak ognioodporny ma być budynek", klasaTxt + "." + elem, zl ? "§ 212 ust. 2 i 3, § 216 ust. 1 WT" : "§ 212 ust. 4, § 216 ust. 1 WT")));

  // Strefa
  let dop;
  if (zl) {
    dop = STREFA_ZL[kat === "ZL II" ? "ZL II" : "inne"][kond === 1 ? 0 : Math.min(gi + 1, 3)];
    if (sug && !(kond > 1 && wysoki)) {
      dop *= 2;
    }
  } else if (pm) {
    dop = wedlugQ(wybuch ? STREFA_PM_WYBUCH : STREFA_PM, q)[kond === 1 ? 0 : wysoki ? 2 : 1] * (sug ? 2 : 1);
  } else {
    dop = STREFA_IN[Math.min(kond, 3) - 1][0];
  }
  const strefaTxt = dop ? `Jedna część budynku bez ścian ogniowych może mieć najwyżej ${m(dop)} m²${sug ? " (z tryskaczami)" : ""}. Twój: ${m(pow)} m².${pow > dop ? " Trzeba podzielić budynek ścianami ogniowymi." : ""}` : "Taki przypadek jest niedozwolony.";
  out.push(blok("Wielkość strefy pożarowej", wynik("Jak duża może być jedna strefa", strefaTxt, zl ? "§ 227 ust. 1 i 4 WT" : pm ? "§ 228 ust. 1, § 229 WT" : "§ 231 ust. 1 WT", dop ? pow <= dop : false)));

  // Ewakuacja
  const przejscie = (zl || wybuch ? 40 : kond > 1 && q > 500 ? 75 : 100) * (sug ? 1.5 : 1);
  const doj = DOJSCIA[wybuch ? "wybuch" : zl ? kat : q > 500 ? "pmDuze" : "pmMale"].map((x) => x * (sug ? 1.5 : 1));
  const prog = kat === "ZL II" ? 30 : 50;
  const dwa = osoby > prog || (zl && pow > 300) || (pm && q > 500 && pow > 300) || (pm && pow > 1000) || (wybuch && pow > 100);
  const drzwi = Math.max(0.9, (osoby * 0.6) / 100);
  let ew = wynik("Jak daleko do wyjścia", `W pomieszczeniu: od najdalszego miejsca do drzwi najwyżej ${m(przejscie)} m. Korytarzem do wyjścia na zewnątrz: najwyżej ${m(doj[0])} m, gdy jest jedna droga, ${m(doj[1])} m, gdy są dwie.`,
    "§ 237 ust. 1 i 6, § 256 ust. 3 i 4 WT");
  ew += wynik("Wyjścia i drzwi", `${dwa ? "Co najmniej 2 wyjścia, minimum 5 m od siebie. " : ""}Drzwi razem co najmniej ${m(drzwi, 2)} m szerokości, każde min. 90 cm.${osoby > 50 ? " Otwierane na zewnątrz." : ""}${osoby > 300 ? " Z drążkiem antypanicznym." : ""} Korytarz min. ${m(Math.max(1.4, drzwi), 2)} m szerokości i 2,2 m wysokości.`,
    "§ 238, § 239 ust. 1-2, § 236 ust. 4, § 240 ust. 7, § 242 ust. 1-3 WT");
  const klatki = (kat === "ZL II" && grupa === "N") || (["ZL I", "ZL II", "ZL III", "ZL V"].includes(kat) && grupa === "SW") || (pm && (q > 500 || wybuch) && ["N", "SW"].includes(grupa)) || wysoki;
  if (kond > 1) {
    ew += wynik("Klatki schodowe", klatki ? "Zamknięte ścianami i drzwiami dymoszczelnymi, z oddymianiem włączanym przez czujki dymu." : "Nie muszą mieć oddymiania.", wysoki ? "§ 246 WT" : "§ 245 WT");
  }
  out.push(blok("Ewakuacja", ew));

  // Gaśnice
  if (kat === "ZL IV") {
    out.push(blok("Gaśnice", wynik("Ile gaśnic", "W budynku mieszkalnym przepis nie wymaga określonej liczby gaśnic.", "§ 32 ust. 3 pkt 2 rozp. 2010")));
  } else {
    const co = !sug && (up || zbiorowe || (pm && q > 500) || wybuch) ? 100 : 300;
    const jedn = Math.ceil(pow / co);
    out.push(blok("Gaśnice", wynik("Ile gaśnic", `${jedn * KG_NA_JEDNOSTKE} kg środka gaśniczego (2 kg na każde ${co} m²) - np. ${ile(Math.ceil(jedn / 3), "gaśnica", "gaśnice", "gaśnic")} po 6 kg. Z każdego miejsca do gaśnicy najwyżej 30 m, przejście do niej min. 1 m.`,
      `§ 32 ust. 3 pkt ${co === 100 ? 1 : 2}, § 33 ust. 2 rozp. 2010`)));
  }

  // Woda i dojazd
  let woda;
  if (d["ob-wies"] && kub <= 2500 && pow <= 500) {
    woda = wynik("Woda dla straży", "Mały budynek na odludziu - wystarczy woda dostępna w okolicy, min. 10 litrów na sekundę.", "§ 3 ust. 1 pkt 2 i ust. 2 rozp. 2009");
  } else if (zl && kat !== "ZL IV") {
    const male = kub <= 5000 && pow <= 1000;
    woda = wynik("Woda dla straży", male ? "10 litrów na sekundę z 1 hydrantu albo zbiornik 100 m³." : "20 litrów na sekundę z 2 hydrantów albo zbiornik 200 m³.", `§ 5 ust. 1 pkt ${male ? 1 : 2} rozp. 2009`);
  } else if (pm) {
    const l = wedlugQ(WODA_PM, q)[WODA_PM_KOLUMNY.findIndex((g) => pow <= g)];
    woda = wynik("Woda dla straży", `${l} litrów na sekundę - ${Math.ceil(l / WYDAJNOSC_HYDRANTU)} hydranty (po 10 l/s); brakującą wodę uzupełnia zbiornik.`, "§ 6 ust. 3 i tabela nr 2 rozp. 2009");
  } else {
    woda = wynik("Woda dla straży", kat === "IN" ? "10 l/s, a przy budynku ponad 2000 m² - 15 l/s." : "Woda z sieci w miejscowości - bez osobnych wymagań dla budynku.", kat === "IN" ? "§ 6 ust. 9 rozp. 2009" : "§ 4 ust. 1 rozp. 2009");
  }
  woda += wynik("Hydranty", "Najbliższy najwyżej 75 m od budynku, następne do 150 m. Hydrant co najmniej 5 m od ściany.", "§ 10 ust. 6 rozp. 2009");
  const droga = ["ZL I", "ZL II"].includes(kat) || (["ZL III", "ZL IV", "ZL V"].includes(kat) && grupa !== "N") || (pm && q > 500 && (pow > 1000 || wybuch)) || (pm && pow > 20000) || (zbiorowe && miejsca > 50);
  woda += wynik("Dojazd dla straży", droga ? "Potrzebna droga pożarowa: utwardzona, min. 4 m szerokości, wzdłuż dłuższej ściany, 5-15 m od budynku, bez drzew i płotów wyższych niż 3 m; przejazd na wylot albo plac do zawracania 20 × 20 m." : "Osobna droga pożarowa nie jest wymagana - wystarczy zwykły dojazd.",
    droga ? "§ 12 ust. 1, 2 i 9, § 13 ust. 1 rozp. 2009" : "§ 12 ust. 1 rozp. 2009");
  out.push(blok("Woda i dojazd dla straży", woda));

  // Co musi być zamontowane
  const h1 = przezn === "handel" && kond === 1;
  const hW = przezn === "handel" && kond > 1;
  const potrzebne = [];
  const niepotrzebne = [];
  const dodaj = (warunek, nazwa, przepis) => (warunek ? potrzebne.push([nazwa, przepis]) : niepotrzebne.push(nazwa));
  dodaj((h1 && pow > 5000) || (hW && pow > 2500) || (przezn === "teatr" && miejsca > 300) || (przezn === "kino" && miejsca > 600) || (przezn === "gastronomia" && miejsca > 300)
    || (przezn === "sport" && miejsca > 1500) || (przezn === "szpital" && miejsca > 200) || (przezn === "opieka" && miejsca > 100) || (up && wysoki) || (zbiorowe && miejsca > 50) || (przezn === "dworzec" && osoby > 500),
  "system sygnalizacji pożaru (czujki dymu w całym budynku)", "§ 28 ust. 1 rozp. 2010");
  dodaj((h1 && kat === "ZL I" && pow > 8000) || (hW && kat === "ZL I" && pow > 5000) || (przezn === "sport" && miejsca > 1500) || (["kino", "teatr"].includes(przezn) && miejsca > 600)
    || (przezn === "szpital" && miejsca > 200) || (up && wysoki) || (zbiorowe && (wysoki || miejsca > 200)) || (przezn === "dworzec" && osoby > 500), "nagłośnienie alarmowe z komunikatami głosowymi (DSO)", "§ 29 ust. 1 rozp. 2010");
  dodaj((h1 && kat === "ZL I" && pow > 8000) || (hW && kat === "ZL I" && pow > 5000) || (przezn === "gastronomia" && miejsca > 600) || ((up || zbiorowe) && grupa === "WW"), "tryskacze", "§ 27 ust. 2 rozp. 2010");
  const hyd = (zl && kat !== "ZL IV" && wysoki) || (["ZL I", "ZL II", "ZL V"].includes(kat) && pow > 200) || (kat === "ZL III" && ((grupa === "SW" && pow > 200) || pow > 1000));
  dodaj(hyd, "hydranty w budynku (z wężem półsztywnym 25)", "§ 19 ust. 1 rozp. 2010");
  dodaj(pm && q > 500 && pow > 200, "hydranty w budynku 52 (duże)", "§ 19 ust. 3 rozp. 2010");
  dodaj(kub > 1000 || wybuch, "wyłącznik prądu dla strażaków przy wejściu", "§ 183 ust. 2 WT");
  dodaj((pow > 2000 && kat !== "ZL IV") || kat === "ZL II" || ["kino", "teatr"].includes(przezn) || ((up || zbiorowe) && wysoki), "oświetlenie awaryjne (świeci min. 1 godzinę po zaniku prądu)", "§ 181 ust. 3 i 5 WT");
  dodaj((["ZL I", "ZL II", "ZL III", "ZL V"].includes(kat) && wys > 25) || (kat === "ZL IV" && grupa === "WW"), "winda dla strażaków", "§ 253 ust. 1 WT");
  out.push(blok("Co musi być zamontowane",
    (potrzebne.length ? potrzebne.map(([n, p]) => wynik(n.charAt(0).toUpperCase() + n.slice(1), "Wymagane.", p)).join("") : wynik("Urządzenia", "Z tych danych żadne urządzenie nie jest wymagane.", ""))
    + wynik("Nie trzeba", niepotrzebne.join(", ") + ". Oświetlenie awaryjne i tak jest potrzebne w korytarzach bez okien.", "§ 27-29 rozp. 2010; § 181, 183, 253 WT")));

  // Dokumenty
  let dok = wynik("Instrukcja bezpieczeństwa pożarowego (IBP)", kat === "ZL IV" ? "Niewymagana dla budynków mieszkalnych." : wybuch || kub > (kat === "IN" ? 1500 : 1000) ? "Potrzebna. Aktualizacja co 2 lata." : "Niewymagana (mały budynek, nic nie wybucha).", "§ 6 ust. 1, 7 i 8 rozp. 2010");
  if (kat !== "ZL IV") {
    const cykl = ["oswiata", "hotel", "opieka"].includes(przezn);
    dok += wynik("Próbna ewakuacja", cykl ? "Co roku i do 3 miesięcy od przyjścia nowych uczniów / gości." : prac > 50 ? "Co 2 lata (ponad 50 pracowników)." : "Nieobowiązkowa (do 50 pracowników), ale warto.",
      "§ 17 ust. 1 i 2 rozp. 2010" + (cykl || prac > 50 ? "; strażaków powiadomić tydzień wcześniej (§ 17 ust. 4 rozp. 2010)" : ""));
  }
  const rz = ["ZL I", "ZL II", "ZL V"].includes(kat) || (["ZL III", "ZL IV"].includes(kat) && grupa !== "N") || (pm && ((pow > 1000 && q > 500) || pow > 5000 || wybuch)) || potrzebne.some(([n]) => /sygnalizacji|DSO|tryskacze/.test(n));
  dok += wynik("Projekt do sprawdzenia przez rzeczoznawcę ppoż.", rz ? "Tak - projekt budynku musi uzgodnić rzeczoznawca ds. zabezpieczeń przeciwpożarowych." : "Nie jest wymagane.", "art. 6b ust. 1 ustawy o ochronie ppoż.; § 3 ust. 1 rozp. 2023/1563");
  out.push(blok("Dokumenty", dok));

  return out.join("") + `<p class="opis-trybu">${tekst("To ogólne zasady. Przy prawdziwym budynku kliknij przepis i przeczytaj go w całości - mogą być wyjątki (ekspertyzy, zabytki, garaże).")}</p>`;
}

// ── Ile osób i jakie drzwi ──

const RODZAJE_POM = [["Sklep, sala sprzedaży, usługi", 4], ["Biuro", 5], ["Sala, restauracja, poczekalnia, hol", 1], ["Archiwum, biblioteka", 7], ["Magazyn", 30], ["Znam liczbę osób", 0]];

function widokOsob() {
  ustawNaglowek("Ile osób i jakie drzwi", "#/praca");
  ustawZakladke("start");
  stan.pomieszczeniaOsob = czytaj(KLUCZ_OSOB, [{ n: "Sala sprzedaży", r: 0, p: "1759" }, { n: "Biuro", r: 1, p: "40" }, { n: "Magazyn", r: 4, p: "406" }]);
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Dodaj pomieszczenia. Wybierz, czym są, i wpisz m² - liczbę osób policzę z przepisu. Szatni i WC nie dodawaj, bo są w nich te same osoby.")}</div></div>
    <div id="nz-pomieszczenia"></div>
    <div class="btn-row"><button class="pastylka szara" onclick="stan.pomieszczeniaOsob.push({n:'',r:0,p:''});rysujPomieszczenia()">+ Dodaj pomieszczenie</button></div>
    <div id="nz-wyniki"></div>`;
  rysujPomieszczenia();
}

function rysujPomieszczenia() {
  document.getElementById("nz-pomieszczenia").innerHTML = stan.pomieszczeniaOsob.map((r, i) => {
    const znam = !RODZAJE_POM[Number(r.r)][1];
    return `<div class="nz-wiersz">
      <div class="nz-dwa"><input data-i="${i}" data-k="n" value="${esc(r.n || "")}" placeholder="Nazwa, np. sala"><button class="nz-usun" onclick="stan.pomieszczeniaOsob.splice(${i},1);rysujPomieszczenia()" aria-label="Usuń">✕</button></div>
      <select data-i="${i}" data-k="r">${RODZAJE_POM.map(([t], j) => `<option value="${j}"${Number(r.r) === j ? " selected" : ""}>${tekst(t)}</option>`).join("")}</select>
      <input data-i="${i}" data-k="p" inputmode="decimal" value="${esc(r.p || "")}" placeholder="${znam ? "Ile osób?" : "Ile m²?"}"></div>`;
  }).join("");
  document.querySelectorAll("#nz-pomieszczenia [data-i]").forEach((el) => el.addEventListener("input", () => {
    stan.pomieszczeniaOsob[el.dataset.i][el.dataset.k] = el.value;
    if (el.dataset.k === "r") {
      rysujPomieszczenia();
      return;
    }
    liczOsoby();
  }));
  liczOsoby();
}

function liczOsoby() {
  const lista = stan.pomieszczeniaOsob;
  zapisz(KLUCZ_OSOB, lista);
  let suma = 0;
  const wiersze = lista.map((r) => {
    const wsk = RODZAJE_POM[Number(r.r)][1];
    const osoby = Math.ceil(wsk ? liczba(r.p) / wsk : liczba(r.p));
    suma += osoby;
    const drzwi = Math.max(osoby <= 3 ? 0.8 : 0.9, (osoby * 0.6) / 100);
    const extra = [osoby > 50 || (wsk && liczba(r.p) > 300) ? "potrzebne 2 wyjścia (min. 5 m od siebie)" : "", osoby > 50 ? "drzwi otwierane na zewnątrz" : "", osoby > 300 ? "drążek antypaniczny" : ""].filter(Boolean);
    return wynik(r.n || RODZAJE_POM[Number(r.r)][0], `${ile(osoby, "osoba", "osoby", "osób")} → drzwi razem min. ${m(drzwi, 2)} m${extra.length ? "; " + extra.join(", ") : ""}.`, "");
  }).join("");
  document.getElementById("nz-wyniki").innerHTML = blok("Wynik", wiersze
    + wynik("Cały budynek / piętro", `${ile(suma, "osoba", "osoby", "osób")} → korytarz min. ${m(Math.max(suma <= 20 ? 1.2 : 1.4, (suma * 0.6) / 100), 2)} m szerokości, wyjście z budynku razem min. ${m(Math.max(0.9, (suma * 0.6) / 100), 2)} m.`,
      "§ 236 ust. 6, § 237 ust. 10, § 238, § 239 ust. 1-2, § 240 ust. 7, § 242 ust. 1-2 WT")
    + wynik("Zasada", "60 cm szerokości na każde 100 osób. Drzwi nie węższe niż 90 cm (80 cm dla 3 osób), wysokie na 2 m. Nie wolno: drzwi obrotowych i podnoszonych na drodze ucieczki.", "§ 237 ust. 10, § 239 ust. 1, § 240 ust. 3 WT"));
}

// ── Ile palnych rzeczy ──

function widokObciazenia() {
  ustawNaglowek("Ile palnych rzeczy", "#/praca");
  ustawZakladke("start");
  stan.materialyQ = czytaj(KLUCZ_MATERIALOW, { F: "2520", lista: [{ r: 1, m: "17550" }, { r: 0, m: "24200" }, { r: 2, m: "24100" }] });
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Wpisz, co leży w pomieszczeniu i ile to waży (razem z opakowaniami i paletami). Policzę, ile energii dałby pożar na każdy m² podłogi.")}</div></div>
    <div class="nz-formularz">${pole("nz-F", "Powierzchnia pomieszczenia [m²]", stan.materialyQ.F)}</div>
    <div id="nz-materialy"></div>
    <div class="btn-row"><button class="pastylka szara" onclick="stan.materialyQ.lista.push({r:0,m:''});rysujMaterialy()">+ Dodaj materiał</button></div>
    <div id="nz-wyniki"></div>`;
  document.getElementById("nz-F").addEventListener("input", (e) => {
    stan.materialyQ.F = e.target.value;
    liczObciazenie();
  });
  rysujMaterialy();
}

function rysujMaterialy() {
  document.getElementById("nz-materialy").innerHTML = stan.materialyQ.lista.map((r, i) => `<div class="nz-wiersz">
    <div class="nz-dwa"><select data-i="${i}" data-k="r">${CIEPLO.map(([t], j) => `<option value="${j}"${Number(r.r) === j ? " selected" : ""}>${tekst(t)}</option>`).join("")}</select>
    <button class="nz-usun" onclick="stan.materialyQ.lista.splice(${i},1);rysujMaterialy()" aria-label="Usuń">✕</button></div>
    <input data-i="${i}" data-k="m" inputmode="decimal" value="${esc(r.m || "")}" placeholder="Ile kg?"></div>`).join("");
  document.querySelectorAll("#nz-materialy [data-i]").forEach((el) => el.addEventListener("input", () => {
    stan.materialyQ.lista[el.dataset.i][el.dataset.k] = el.value;
    liczObciazenie();
  }));
  liczObciazenie();
}

function liczObciazenie() {
  const d = stan.materialyQ;
  zapisz(KLUCZ_MATERIALOW, d);
  const F = liczba(d.F);
  let suma = 0;
  const linie = d.lista.map((r) => {
    const [nazwa, c] = CIEPLO[Number(r.r)];
    suma += liczba(r.m) * c;
    return `${nazwa}: ${m(liczba(r.m))} kg × ${c} MJ/kg`;
  });
  const q = F ? suma / F : 0;
  const slowo = q <= 500 ? "mało" : q <= 1000 ? "średnio" : q <= 2000 ? "dużo" : q <= 4000 ? "bardzo dużo" : "ekstremalnie dużo";
  document.getElementById("nz-wyniki").innerHTML = blok("Wynik",
    wynik("Obciążenie ogniowe", `${m(q)} MJ/m² - ${slowo} palnych rzeczy.`, "PN-B-02852:2001")
    + wynik("Jak policzone", `${linie.join("; ")}. Razem ${m(suma)} MJ ÷ ${m(F)} m².`, "")
    + wynik("Co dalej", `Wpisz ${m(q)} w „Analizie budynku” (dla hali lub magazynu) - od tej liczby zależy ognioodporność, wielkość strefy, długość dojścia, gaśnice i woda dla straży. Ciepło spalania jest orientacyjne - w dokumentach weź wartość z normy lub karty produktu.`, ""));
}

// ── Odległość od sąsiada ──

const POLA_ODL = ["od-a", "od-b", "od-rozp", "od-okna", "od-wybuch", "od-sug"];
const RODZAJE_SASIADA = [[0, "Zwykły budynek (dom, blok, biuro, sklep, szkoła, obora)"], [2, "Hala lub magazyn - mało palnych rzeczy"], [3, "Hala lub magazyn - dużo palnych rzeczy"], [4, "Hala lub magazyn - ekstremalnie dużo"]];

function widokOdleglosci() {
  ustawNaglowek("Odległość od sąsiada", "#/praca");
  ustawZakladke("start");
  const d = czytaj(KLUCZ_ODLEGLOSCI, { "od-a": "0", "od-b": "3", "od-rozp": "0", "od-okna": "0", "od-sug": "0" });
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Jak daleko od siebie muszą stać dwa budynki, żeby ogień nie przeszedł z jednego na drugi.")}</div></div>
    <div class="nz-formularz">
      ${wybor("od-a", "Twój budynek", RODZAJE_SASIADA, d["od-a"])}
      ${wybor("od-b", "Budynek obok", RODZAJE_SASIADA, d["od-b"])}
      ${wybor("od-okna", "Ile okien jest w ścianie od strony sąsiada?", [[0, "Mało - ściana prawie pełna"], [1, "Sporo - ok. połowa to okna"], [2, "Prawie same okna lub przeszklenie"]], d["od-okna"])}
      ${wybor("od-rozp", "Czy ściana lub dach łatwo się palą (np. płyty ze styropianem, papa na deskach)?", [[0, "Nie"], [1, "Tak, w jednym budynku"], [2, "Tak, w obu"]], d["od-rozp"])}
      ${takNie("od-wybuch", "W którymś budynku coś może wybuchnąć", d["od-wybuch"])}
      ${wybor("od-sug", "Tryskacze", [[0, "Nie ma"], [1, "W jednym budynku"], [2, "W obu"]], d["od-sug"])}
    </div>
    <div id="nz-wyniki"></div>`;
  podepnij(POLA_ODL, KLUCZ_ODLEGLOSCI, (x) => {
    const baza = ODL[Number(x["od-a"])][Number(x["od-b"])];
    let w = baza * [1, 1.5, 2][Number(x["od-rozp"])] * [1, 1.5, 2][Number(x["od-okna"])];
    if (x["od-wybuch"] && w < 20) {
      w = 20;
    }
    w *= [1, 0.75, 0.5][Number(x["od-sug"])];
    return blok("Wynik", wynik("Najmniejsza odległość", `${m(w, 1)} m między ścianami budynków.`, "§ 271 ust. 1-7 WT")
      + wynik("Las", "Od lasu - tak jak od budynku z łatwopalnym dachem.", "§ 271 ust. 8 WT")
      + wynik("Gdy jest za blisko", "Ściana od strony sąsiada musi być ścianą ogniową (oddzielenia przeciwpożarowego).", "§ 271 ust. 12 WT"));
  });
}

// ── Terminy i obowiązki okresowe ──

const TERMINY = [
  ["Urządzenia przeciwpożarowe i gaśnice - przegląd i konserwacja", "wg producenta, nie rzadziej niż raz w roku", "§ 3 ust. 3 rozp. 2010"],
  ["Węże hydrantów wewnętrznych - próba ciśnieniowa", "raz na 5 lat", "§ 3 ust. 4 rozp. 2010"],
  ["Przewody dymowe i spalinowe - paliwo stałe", "co najmniej raz na 3 miesiące", "§ 34 ust. 1 pkt 2 rozp. 2010"],
  ["Przewody spalinowe - paliwo płynne i gazowe", "co najmniej raz na 6 miesięcy", "§ 34 ust. 1 pkt 3 rozp. 2010"],
  ["Przewody od palenisk gastronomii", "co najmniej raz w miesiącu", "§ 34 ust. 1 pkt 1 rozp. 2010"],
  ["Przewody wentylacyjne - czyszczenie", "co najmniej raz w roku", "§ 34 ust. 2 rozp. 2010"],
  ["Kontrola stanu technicznego: instalacje gazowe, przewody kominowe, elementy narażone na wpływy atmosferyczne", "co najmniej raz w roku", "art. 62 ust. 1 pkt 1 Prawa budowlanego"],
  ["Badanie instalacji elektrycznej i piorunochronnej", "co najmniej raz na 5 lat", "art. 62 ust. 1 pkt 2 Prawa budowlanego"],
  ["Instrukcja bezpieczeństwa pożarowego - aktualizacja", "co najmniej raz na 2 lata i po zmianie użytkowania lub technologii", "§ 6 ust. 7 rozp. 2010"],
  ["Praktyczne sprawdzenie ewakuacji - ponad 50 stałych użytkowników", "co najmniej raz na 2 lata", "§ 17 ust. 1 rozp. 2010"],
  ["Praktyczne sprawdzenie ewakuacji - szkoły, przedszkola, internaty, akademiki", "co najmniej raz w roku, do 3 miesięcy od przyjścia nowej grupy", "§ 17 ust. 2 rozp. 2010"],
  ["Zawiadomienie komendanta PSP o sprawdzeniu ewakuacji", "nie później niż tydzień przed", "§ 17 ust. 4 rozp. 2010"],
  ["Oświetlenie awaryjne ewakuacyjne - czas działania", "co najmniej 1 godzina", "§ 181 ust. 5 WT"],
  ["Doręczenie upoważnienia do czynności kontrolno-rozpoznawczych PSP", "co najmniej 7 dni przed (3 dni przy obiektach zgłoszonych do odbioru)", "art. 23 ust. 7 ustawy o PSP"],
];

function widokTerminow() {
  ustawNaglowek("Terminy przeglądów", "#/praca");
  ustawZakladke("start");
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Okresowe obowiązki, o które pyta kontrola PSP i które wpisujesz do IBP. Klik w paragraf otwiera oficjalny tekst.")}</div></div>
    <div class="nz-blok">${TERMINY.map(([co, kiedy, p]) => wynik(co, kiedy, p)).join("")}</div>`;
}
