// Analiza budynku - kalkulator do tabeli analizy wg wzoru CS PSP (zastępuje „Sprawdź budynek”).
// Krok 1: dane budynku → wymagania. Krok 2 (nieobowiązkowy): co jest w budynku → ocena spełnia / nie spełnia.
// Wynik: 45 punktów jak w „Jak zrobić analizę” - wymagane, jest, ocena, przepis, „Kopiuj” i link do zasad.
//
//   #/analiza            krok 1 - budynek
//   #/analiza/budynek    krok 2 - co jest w budynku
//   #/analiza/wynik      wynik
//
// Tabele przepisów (KLASA_ZL, STREFA_ZL, DOJSCIA, ODL, WODA_PM…) i pomocnicze pola - z narzedzia.js.

TRASY.push(
  [/^#\/analiza$/, () => widokAnalizy(1)],
  [/^#\/analiza\/budynek$/, () => widokAnalizy(2)],
  [/^#\/analiza\/wynik$/, () => widokWynikuAnalizy()],
);

const KLUCZ_ANALIZY = "insp-analiza";

// Pełne tytuły aktów do kolumny „Podstawa prawna” (kod jak na końcu przepisu w aplikacji)
const AKTY_PELNE = [
  ["WT", "Rozporządzenie Ministra Infrastruktury z dnia 12 kwietnia 2002 r. w sprawie warunków technicznych, jakim powinny odpowiadać budynki i ich usytuowanie (Dz.U. z 2022 r. poz. 1225 z późn. zm.)"],
  ["rozp. 2010", "Rozporządzenie Ministra Spraw Wewnętrznych i Administracji z dnia 7 czerwca 2010 r. w sprawie ochrony przeciwpożarowej budynków, innych obiektów budowlanych i terenów (Dz.U. z 2023 r. poz. 822)"],
  ["rozp. 2009", "Rozporządzenie Ministra Spraw Wewnętrznych i Administracji z dnia 24 lipca 2009 r. w sprawie przeciwpożarowego zaopatrzenia w wodę oraz dróg pożarowych (Dz.U. Nr 124, poz. 1030)"],
  ["rozp. 2023/1563", "Rozporządzenie Ministra Spraw Wewnętrznych i Administracji z dnia 5 sierpnia 2023 r. w sprawie uzgadniania projektu zagospodarowania działki lub terenu, projektu architektoniczno-budowlanego, projektu technicznego oraz projektu urządzenia przeciwpożarowego pod względem zgodności z wymaganiami ochrony przeciwpożarowej (Dz.U. z 2023 r. poz. 1563)"],
  ["ustawy o ochronie ppoż.", "Ustawa z dnia 24 sierpnia 1991 r. o ochronie przeciwpożarowej (Dz.U. z 2025 r. poz. 188)"],
  ["Prawa budowlanego", "Ustawa z dnia 7 lipca 1994 r. - Prawo budowlane (Dz.U. z 2026 r. poz. 524)"],
];

// Kategoria do tabeli odległości § 271 WT: [ZL, IN, PM Q ≤ 1000, PM 1000-4000, PM > 4000]
const SASIEDZI = [["", "- brak -"], ["0", "Budynek ZL (dom, blok, biuro, sklep, szkoła)"], ["1", "Budynek inwentarski IN"],
  ["2", "Hala / magazyn PM - Q do 1000 MJ/m²"], ["3", "Hala / magazyn PM - Q 1000-4000 MJ/m²"], ["4", "Hala / magazyn PM - Q ponad 4000 MJ/m²"]];
const KOTLY = [["", "Brak kotłowni"], ["gaz", "Kotły gazowe"], ["olej", "Kotły olejowe"], ["stale", "Kotły na paliwo stałe"]];
// § 220 ust. 1 WT - kotłownia wymaga wydzielenia powyżej tej łącznej mocy [kW]
const PROG_KOTLOWNI = { gaz: 30, olej: 30, stale: 25 };
const ZBIORNIK_M3_NA_DM3 = 10;
const PROG_ZABUDOWY_KONTROLI = 2000;

const POLA_KROKU1 = ["a-typ", "a-kond", "a-pow", "a-wys", "a-kub", "a-miejsca", "a-osoby", "a-prac", "a-ogien", "a-q", "a-wybuch", "a-tryskacze", "a-wies",
  "a-strefy", "a-pow-strefy", "a-kociol", "a-kw"];
const POLA_KROKU2 = ["a-wyjscia", "a-przejscie", "a-h5", "a-oddym", "a-dojscie", "a-dwa", "a-szer-przejscia", "a-szer-kor", "a-os-kor", "a-drzwi-suma", "a-drzwi-min",
  "a-drzwi-zew", "a-antypanika", "a-u-ssp", "a-u-dso", "a-u-oddym", "a-u-klapy", "a-u-hyd", "a-u-osw", "a-u-pwp", "a-u-drzwippoz", "a-u-dzwig", "a-gasnice",
  "a-s1", "a-s1-odl", "a-s2", "a-s2-odl", "a-s3", "a-s3-odl", "a-droga", "a-droga-szer", "a-droga-odl", "a-hz", "a-zbiornik", "a-hz-odl1", "a-hz-odl2"];

// ── Widoki ──

function widokAnalizy(krok) {
  ustawNaglowek("Analiza budynku", krok === 1 ? "#/start" : "#/analiza");
  ustawZakladke("start");
  const d = czytaj(KLUCZ_ANALIZY, {});
  const typ = TYPY.find((t) => t[0] === d["a-typ"]) || TYPY[0];
  const pmIn = typ[2] === "PM" || typ[2] === "IN";
  const krokOpis = `<p class="pz-nr" style="margin:6px 20px 0">Krok ${krok} z 2</p>`;
  let pola;
  if (krok === 1) {
    pola = `
      <div class="section-label">Budynek</div>
      ${wybor("a-typ", "Co to za budynek?", TYPY.map((t) => [t[0], t[1]]), d["a-typ"])}
      ${pole("a-kond", "Ile kondygnacji nad ziemią (z parterem)?", d["a-kond"])}
      ${pole("a-pow", "Powierzchnia wszystkich kondygnacji razem [m²]", d["a-pow"])}
      ${pole("a-wys", "Wysokość budynku [m]", d["a-wys"], "Puste = liczę 3,5 m na kondygnację.")}
      ${pole("a-kub", "Kubatura brutto [m³]", d["a-kub"], "Puste = powierzchnia × wysokość kondygnacji.")}
      ${typ[5] ? pole("a-miejsca", typ[5], d["a-miejsca"]) : ""}
      ${pole("a-osoby", "Ile osób może być naraz - z dokumentów obiektu", d["a-osoby"], "Puste = liczę ze wskaźnika (§ 236 ust. 6 WT).")}
      ${pole("a-prac", "Ilu stałych użytkowników (pracowników)?", d["a-prac"])}
      ${pmIn ? wybor("a-ogien", "Ile jest palnych rzeczy?", OGIEN, d["a-ogien"] || "800") : ""}
      ${pmIn ? pole("a-q", "albo policzona gęstość obciążenia ogniowego Q [MJ/m²]", d["a-q"], "Policzysz w Narzędzia → „Ile palnych rzeczy”.") : ""}
      ${takNie("a-wybuch", "Jest zagrożenie wybuchem", d["a-wybuch"], "Gaz, opary paliw i rozpuszczalników, pyły palne.")}
      ${takNie("a-tryskacze", "Są tryskacze (stałe urządzenie gaśnicze wodne)", d["a-tryskacze"])}
      ${takNie("a-wies", "Budynek poza miejscowością", d["a-wies"])}
      <div class="section-label">Strefy i kotłownia</div>
      ${pole("a-strefy", "Na ile stref pożarowych podzielono budynek?", d["a-strefy"] || "1")}
      ${liczba(d["a-strefy"]) > 1 ? pole("a-pow-strefy", "Powierzchnia największej strefy [m²]", d["a-pow-strefy"]) : ""}
      ${wybor("a-kociol", "Kotłownia", KOTLY, d["a-kociol"])}
      ${d["a-kociol"] ? pole("a-kw", "Łączna moc kotłów [kW]", d["a-kw"]) : ""}`;
  } else {
    pola = `
      <p class="opis-trybu">${tekst("Wpisz tylko to, co znasz - z pomiaru lub z dokumentów. Puste pola zostaną w wyniku jako „do uzupełnienia”.")}</p>
      <div class="section-label">Wyjścia i ewakuacja</div>
      ${pole("a-wyjscia", "Ile wyjść ewakuacyjnych z budynku?", d["a-wyjscia"])}
      ${pole("a-przejscie", "Najdłuższe przejście w pomieszczeniu [m]", d["a-przejscie"], "Od najdalszego miejsca do drzwi, po rzeczywistej trasie.")}
      ${takNie("a-h5", "To pomieszczenie jest wyższe niż 5 m", d["a-h5"])}
      ${takNie("a-oddym", "Jest oddymianie uruchamiane czujkami dymu", d["a-oddym"])}
      ${pole("a-dojscie", "Najdłuższe dojście korytarzem [m]", d["a-dojscie"], "Od drzwi pomieszczenia do wyjścia na zewnątrz lub do innej strefy. Puste = brak korytarzy.")}
      ${takNie("a-dwa", "Z korytarza są dwa niezależne kierunki", d["a-dwa"])}
      ${pole("a-szer-przejscia", "Najwęższe przejście w pomieszczeniu [m]", d["a-szer-przejscia"])}
      ${pole("a-szer-kor", "Najwęższy korytarz [m]", d["a-szer-kor"])}
      ${pole("a-os-kor", "Ile osób korzysta z tego korytarza?", d["a-os-kor"], "Puste = wszyscy.")}
      ${pole("a-drzwi-suma", "Łączna szerokość wyjść z budynku [m]", d["a-drzwi-suma"])}
      ${pole("a-drzwi-min", "Najwęższe drzwi ewakuacyjne [m]", d["a-drzwi-min"], "W świetle ościeżnicy.")}
      ${takNie("a-drzwi-zew", "Drzwi wyjściowe otwierają się na zewnątrz", d["a-drzwi-zew"])}
      ${takNie("a-antypanika", "Drzwi mają zamknięcia przeciwpaniczne", d["a-antypanika"])}
      <div class="section-label">Co jest zamontowane</div>
      ${takNie("a-u-ssp", "System sygnalizacji pożarowej (SSP)", d["a-u-ssp"])}
      ${takNie("a-u-dso", "Dźwiękowy system ostrzegawczy (DSO)", d["a-u-dso"], "Zwykłe nagłośnienie to nie DSO.")}
      ${takNie("a-u-oddym", "Oddymianie klatek schodowych", d["a-u-oddym"])}
      ${takNie("a-u-klapy", "Przeciwpożarowe klapy odcinające", d["a-u-klapy"])}
      ${takNie("a-u-hyd", "Hydranty wewnętrzne", d["a-u-hyd"])}
      ${takNie("a-u-osw", "Oświetlenie ewakuacyjne", d["a-u-osw"])}
      ${takNie("a-u-pwp", "Przeciwpożarowy wyłącznik prądu", d["a-u-pwp"])}
      ${takNie("a-u-drzwippoz", "Drzwi i bramy przeciwpożarowe", d["a-u-drzwippoz"])}
      ${takNie("a-u-dzwig", "Dźwig dla ekip ratowniczych", d["a-u-dzwig"])}
      ${pole("a-gasnice", "Ile kg środka gaśniczego jest w gaśnicach razem?", d["a-gasnice"], "Np. 13 gaśnic po 4 kg = 52.")}
      <div class="section-label">Sąsiednie budynki</div>
      ${[1, 2, 3].map((i) => wybor(`a-s${i}`, `Sąsiad ${i}`, SASIEDZI, d[`a-s${i}`]) + (d[`a-s${i}`] ? pole(`a-s${i}-odl`, "Odległość między ścianami [m]", d[`a-s${i}-odl`]) : "")).join("")}
      <div class="section-label">Droga pożarowa i woda</div>
      ${takNie("a-droga", "Jest droga pożarowa", d["a-droga"])}
      ${d["a-droga"] ? pole("a-droga-szer", "Szerokość drogi [m]", d["a-droga-szer"]) + pole("a-droga-odl", "Odległość bliższej krawędzi od ściany [m]", d["a-droga-odl"]) : ""}
      ${pole("a-hz", "Ile hydrantów zewnętrznych DN 80?", d["a-hz"])}
      ${pole("a-zbiornik", "Zbiornik przeciwpożarowy [m³]", d["a-zbiornik"])}
      ${pole("a-hz-odl1", "Odległość najbliższego hydrantu od budynku [m]", d["a-hz-odl1"])}
      ${pole("a-hz-odl2", "Odległość między hydrantami [m]", d["a-hz-odl2"])}`;
  }
  const dalej = krok === 1 ? `<a class="pastylka" href="#/analiza/budynek">Dalej ›</a><a class="pastylka szara" href="#/analiza/wynik">Od razu wynik</a>`
    : `<a class="pastylka" href="#/analiza/wynik">Pokaż wynik ›</a>`;
  widok.innerHTML = `
    ${krokOpis}
    <div class="section-header"><div class="section-sub">${tekst(krok === 1 ? "Opisz budynek. Wymagania policzę z przepisów." : "Co jest w budynku - porównam z wymaganiami.")}</div></div>
    <div class="nz-formularz">${pola}</div>
    <div class="btn-row">${dalej}</div>
    ${krok === 1 ? `<div class="btn-row"><button class="pastylka szara" onclick="if(confirm('Wyczyścić dane i zacząć nowy budynek?')){zapisz(KLUCZ_ANALIZY,{});widokAnalizy(1)}">Nowy budynek</button></div>` : ""}`;
  const pola_ = krok === 1 ? POLA_KROKU1 : POLA_KROKU2;
  const zapiszPola = () => zapisz(KLUCZ_ANALIZY, Object.assign(czytaj(KLUCZ_ANALIZY, {}), zbierz(pola_), krok === 2 ? { "a-krok2": true } : {}));
  pola_.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", zapiszPola);
    }
  });
  // Pola zależne (strefy, kotłownia, sąsiedzi, droga) pokazują się po zmianie wyboru
  ["a-typ", "a-strefy", "a-kociol", "a-s1", "a-s2", "a-s3", "a-droga"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", () => {
        zapiszPola();
        const y = window.scrollY;
        widokAnalizy(krok);
        window.scrollTo(0, y);
      });
    }
  });
  if (krok === 2) {
    zapiszPola();
  }
}

function widokWynikuAnalizy() {
  ustawNaglowek("Analiza budynku", "#/analiza/budynek");
  ustawZakladke("start");
  const d = czytaj(KLUCZ_ANALIZY, {});
  if (!d["a-pow"]) {
    widok.innerHTML = `<p class="opis-trybu">${tekst("Najpierw wpisz dane budynku.")}</p><div class="btn-row"><a class="pastylka" href="#/analiza">Krok 1 - budynek</a></div>`;
    return;
  }
  const a = obliczAnalize(d);
  stan.analiza = a;
  const licz = (s) => a.punkty.filter((p) => p.stan === s).length;
  widok.innerHTML = `
    <div class="nz-blok" style="margin-top:12px">${wynik("Twój budynek", a.opis, "")}</div>
    <p class="opis-trybu">${tekst(`Spełnia: ${licz(true)} · nie spełnia: ${licz(false)} · do uzupełnienia lub opisu: ${licz(null) + licz("opis")}. Przy każdym punkcie: „Kopiuj” daje tekst do tabeli analizy, „Zasady” otwiera ten punkt w poradniku.`)}</p>
    <div class="btn-row"><a class="pastylka szara" href="#/analiza">‹ Budynek</a><a class="pastylka szara" href="#/analiza/budynek">‹ Co jest</a><button class="pastylka" onclick="kopiujAnalize()">Kopiuj całość</button></div>
    ${GRUPY_ANALIZY.map(([nazwa, od, doNr]) => {
      const pkt = a.punkty.filter((p) => p.nr >= od && p.nr <= doNr);
      return `<div class="section-label">${tekst(nazwa)}</div><div class="nz-blok">${pkt.map(kartaPunktu).join("")}</div>`;
    }).join("")}
    <p class="opis-trybu">${tekst("To zasady ogólne. Przy prawdziwym budynku kliknij przepis i przeczytaj go w całości - mogą być wyjątki (ekspertyzy, rozwiązania zamienne, zabytki).")}</p>`;
}

const GRUPY_ANALIZY = [["Budynek, klasa i strefy (1-16)", 1, 16], ["Ewakuacja (17-24)", 17, 24], ["Urządzenia przeciwpożarowe (25-35)", 25, 35],
  ["Gaśnice (36-37)", 36, 37], ["Otoczenie, droga, woda (38-42)", 38, 42], ["Instalacje i dokumenty (43-45)", 43, 45]];

function kartaPunktu(p) {
  const znak = p.stan === true ? `<span class="nz-ok">spełnia</span>` : p.stan === false ? `<span class="nz-nie">nie spełnia</span>`
    : p.stan === "dobrowolnie" ? `<span class="an-dobr">zastosowano dobrowolnie</span>` : p.stan === null ? `<span class="an-brak">do uzupełnienia</span>` : "";
  return `<div class="nz-wynik an-punkt">
    <p class="nz-co">${p.nr}. ${tekst(p.tytul)}${znak}</p>
    <p class="nz-wartosc"><span class="an-et">Wymagane:</span> ${pogrubLiczby(tekst(p.wym))}</p>
    ${p.ist ? `<p class="nz-wartosc"><span class="an-et">Jest:</span> ${pogrubLiczby(tekst(p.ist))}</p>` : ""}
    ${p.przepis ? `<p class="nz-podstawa">Przepis: ${tekst(p.przepis)}</p>` : ""}
    <div class="an-akcje"><button onclick="kopiujPunkt(${p.nr})">Kopiuj</button><a href="#/poradnik/${p.zasady}">Zasady ›</a></div></div>`;
}

// ── Kopiowanie do tabeli analizy ──

function pelnaPodstawa(przepis) {
  if (!przepis) {
    return "";
  }
  const grupy = new Map();
  przepis.split(";").map((s) => s.trim()).filter(Boolean).forEach((czesc) => {
    const akt = AKTY_PELNE.find(([kod]) => czesc.endsWith(" " + kod));
    const klucz = akt ? akt[1] : "";
    const jednostka = akt ? czesc.slice(0, -akt[0].length - 1) : czesc;
    grupy.set(klucz, [...(grupy.get(klucz) || []), jednostka]);
  });
  return [...grupy].map(([akt, jedn]) => (akt ? `${akt}: ${jedn.join(", ")}` : jedn.join(", "))).join("\n");
}

function tekstPunktu(p) {
  const ocena = { true: "Warunek spełniony.", false: "Warunek niespełniony - zalecenie: ", dobrowolnie: "Urządzenie zastosowano ponad wymagania przepisów." }[String(p.stan)] || "";
  return `${p.nr}. ${p.tytul}\nAnaliza: ${p.ist ? `Stan istniejący: ${p.ist}. ` : ""}Wymagane: ${p.wym}.${ocena ? " " + ocena : ""}\nPodstawa prawna: ${pelnaPodstawa(p.przepis)}`;
}

function doSchowka(t, napis) {
  const pokaz = () => {
    const el = document.createElement("div");
    el.className = "an-toast";
    el.textContent = napis;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(t).then(pokaz, () => prompt("Skopiuj tekst:", t));
  } else {
    prompt("Skopiuj tekst:", t);
  }
}

function kopiujPunkt(nr) {
  doSchowka(tekstPunktu(stan.analiza.punkty.find((p) => p.nr === nr)), "Skopiowano punkt " + nr);
}

function kopiujAnalize() {
  doSchowka(stan.analiza.punkty.map(tekstPunktu).join("\n\n"), "Skopiowano całą analizę");
}

// ── Obliczenia ──

function porownaj(ist, wym, kier) {
  if (!ist) {
    return null;
  }
  return kier === "max" ? ist <= wym : ist >= wym;
}

function urzadzenie(d, nr, tytul, wymagane, wymTxt, klucz, przepis, zasady) {
  const krok2 = d["a-krok2"];
  const jest = !!d[klucz];
  const ocena = !krok2 ? null : wymagane ? jest : jest ? "dobrowolnie" : true;
  const ist = krok2 ? (jest ? "występuje" : "nie występuje") : "";
  return { nr, tytul, wym: wymagane ? `TAK - ${wymTxt}` : `NIE - ${wymTxt}`, ist, stan: ocena, przepis, zasady: zasady || `p${nr}` };
}

function obliczAnalize(d) {
  const typ = TYPY.find((t) => t[0] === d["a-typ"]) || TYPY[0];
  const przezn = typ[3];
  const kond = Math.max(1, Math.round(liczba(d["a-kond"])) || 1);
  const wys = liczba(d["a-wys"]) || kond * WYS_PIETRA;
  const pow = liczba(d["a-pow"]);
  const kub = liczba(d["a-kub"]) || pow * (wys / kond);
  const strefy = Math.max(1, Math.round(liczba(d["a-strefy"])) || 1);
  const powStrefy = strefy > 1 ? liczba(d["a-pow-strefy"]) || pow : pow;
  const miejsca = liczba(d["a-miejsca"]);
  const prac = liczba(d["a-prac"]);
  let osoby = liczba(d["a-osoby"]);
  const zDokumentow = osoby > 0;
  if (!osoby) {
    osoby = typ[4] ? Math.ceil(pow / typ[4]) : miejsca + prac;
  }
  let kat = typ[2];
  if (kat === "ZL I" && osoby <= 50) {
    kat = "ZL III";
  }
  const zl = kat.startsWith("ZL");
  const pm = kat === "PM";
  const q = pm || kat === "IN" ? liczba(d["a-q"]) || liczba(d["a-ogien"]) || 800 : 0;
  const wybuch = !!d["a-wybuch"];
  const sug = !!d["a-tryskacze"];
  const grupa = grupaWysokosci(kat, wys, kond);
  const gi = GRUPY.indexOf(grupa);
  const wysoki = grupa === "W" || grupa === "WW";
  const up = ["ZL I", "ZL II", "ZL III"].includes(kat);
  const zbiorowe = kat === "ZL V";
  const krok2 = !!d["a-krok2"];
  const P = [];
  const dodaj = (nr, tytul, wym, ist, ocena, przepis, zasady) => P.push({ nr, tytul, wym, ist, stan: ocena, przepis, zasady: zasady || `p${nr}` });

  // 1-4. Budynek
  const pktKat = { "ZL I": 1, "ZL II": 2, "ZL III": 3, "ZL IV": 4, "ZL V": 5 }[kat];
  dodaj(1, "Ogólna charakterystyka budynku", "opis przeznaczenia, działalności i konstrukcji (3-5 zdań)",
    `${typ[1].toLowerCase()}; ${kond} kondygn. nadziemn.; powierzchnia ${m(pow)} m²; wysokość ${m(wys, 2)} m; kubatura ${m(kub)} m³`, "opis", "");
  dodaj(2, "Kwalifikacja ze względu na sposób użytkowania", "ZL, PM albo IN wg przeznaczenia", zl ? "ZL" : kat, "opis", "§ 209 ust. 1 WT");
  dodaj(3, "Kategoria zagrożenia ludzi i grupa wysokości", "kategoria wg przeznaczenia, grupa wg wysokości",
    `${zl ? kat : "nie dotyczy (" + kat + ")"}; budynek ${NAZWY_GRUP[grupa]}`, "opis",
    `${zl ? `§ 209 ust. 2 pkt ${pktKat} WT; ` : ""}§ 8 pkt ${gi + 1} WT`);
  dodaj(4, "Gęstość obciążenia ogniowego", zl ? "nie dotyczy - dla stref ZL nie wyznacza się" : "obliczyć wg PN-B-02852:2001",
    zl ? "" : `Q = ${m(q)} MJ/m²`, zl ? "opis" : null, zl ? "" : "PN-B-02852:2001");

  // 5-7. Materiały i wybuch
  dodaj(5, "Materiały niebezpieczne pożarowo", "wymienić gazy palne, ciecze o temperaturze zapłonu poniżej 55 °C i inne z definicji", "", "opis", "§ 2 ust. 1 pkt 1 rozp. 2010");
  dodaj(6, "Strefy zagrożenia wybuchem", wybuch ? "ocena zagrożenia wybuchem z wyznaczeniem stref (0, 1, 2 / 20, 21, 22)" : "nie wyznacza się - brak mieszanin wybuchowych",
    wybuch ? "TAK" : "NIE", "opis", "§ 37 ust. 1-3 i 9 rozp. 2010");
  dodaj(7, "Pomieszczenie zagrożone wybuchem", "pomieszczenie, w którym wybuch dałby przyrost ciśnienia ponad 5 kPa", wybuch ? "TAK - do ustalenia" : "NIE", "opis", "§ 37 ust. 7 rozp. 2010");

  // 8-10. Klasa odporności pożarowej i elementy
  let klasa;
  let klasaTxt;
  let klasaPrzepis;
  if (zl) {
    klasa = KLASA_ZL[kat][gi];
    klasaTxt = `klasa „${klasa}”`;
    klasaPrzepis = `§ 212 ust. 2 WT`;
    const obn = OBNIZENIE_ZL[kat];
    if (obn && grupa === "N" && kond <= 2 && obn[kond - 1] > klasa) {
      klasaTxt += `, obniżona do „${obn[kond - 1]}” (budynek ${kond === 1 ? "jednokondygnacyjny" : "dwukondygnacyjny, strop nad parterem do 9 m"})`;
      klasa = obn[kond - 1];
      klasaPrzepis += "; § 212 ust. 3 WT";
    }
  } else if (kat === "IN" && kub <= 1500) {
    klasa = "E";
    klasaTxt = "bez wymagań - budynek inwentarski do 1500 m³";
    klasaPrzepis = "§ 213 WT";
  } else {
    klasa = wedlugQ(KLASA_PM, q)[kond === 1 ? 0 : gi + 1];
    klasaTxt = klasa === "-" ? "budynek niedopuszczalny przy tej gęstości obciążenia ogniowego i wysokości" : `klasa „${klasa}”`;
    klasaPrzepis = "§ 212 ust. 4 WT";
  }
  dodaj(8, "Wymagana klasa odporności pożarowej", klasaTxt, "", "opis", klasaPrzepis);
  dodaj(9, "Materiały i technologia elementów budynku", "opis z dokumentacji: konstrukcja, dach, strop, ściany, przekrycie", "", "opis", "", "p9");
  const elementy = KLASY_ELEMENTOW[klasa] ? ELEMENTY.map((e, i) => `${e} ${KLASY_ELEMENTOW[klasa][i]}`).join(", ") : "-";
  dodaj(10, "Odporność ogniowa elementów - wymagana i istniejąca", `${elementy}; wszystkie elementy nierozprzestrzeniające ognia (NRO)`,
    "istniejącą wpisz z deklaracji, klasyfikacji lub projektu", null, "§ 216 ust. 1 i 2 WT");

  // 11-13. Strefy
  let dop;
  if (zl) {
    dop = STREFA_ZL[kat === "ZL II" ? "ZL II" : "inne"][kond === 1 ? 0 : Math.min(gi + 1, 3)] * (sug && !(kond > 1 && wysoki) ? 2 : 1);
  } else if (pm) {
    dop = wedlugQ(wybuch ? STREFA_PM_WYBUCH : STREFA_PM, q)[kond === 1 ? 0 : wysoki ? 2 : 1] * (sug ? 2 : 1);
  } else {
    dop = STREFA_IN[Math.min(kond, 3) - 1][0];
  }
  dodaj(11, "Liczba stref pożarowych i sposób wydzielenia", powStrefy > dop ? "podział na strefy ścianami i stropami oddzielenia przeciwpożarowego" : "jedna strefa wystarcza",
    `${strefy} ${strefy === 1 ? "strefa" : "strefy"}`, dop ? powStrefy <= dop : false, "§ 226 ust. 1 WT");
  const odd = ODDZIELENIA[klasa] || ODDZIELENIA.E;
  dodaj(12, "Odporność ogniowa elementów oddzielenia stref", strefy > 1 ? `ściany i stropy ${odd[0]}${zl ? `, stropy w ZL ${odd[1]}` : ""}, drzwi i zamknięcia ${odd[2]}` : "nie dotyczy - jedna strefa pożarowa",
    strefy > 1 ? "istniejącą wpisz z dokumentacji" : "", strefy > 1 ? null : "opis", strefy > 1 ? "§ 232 ust. 4 WT" : "");
  dodaj(13, "Powierzchnia strefy pożarowej", dop ? `najwyżej ${m(dop)} m²${sug ? " (powiększona za tryskacze)" : ""}` : "taki budynek jest niedopuszczalny",
    `${m(powStrefy)} m²`, dop ? powStrefy <= dop : false, zl ? `§ 227 ust. 1${sug ? " i 4" : ""} WT` : pm ? "§ 228 ust. 1 WT" : "§ 231 ust. 1 WT");

  // 14-15. Kotłownia
  const kociol = d["a-kociol"];
  const kw = liczba(d["a-kw"]);
  const wydziel = !!kociol && kw > PROG_KOTLOWNI[kociol];
  const kotlTxt = kociol ? `kotłownia, ${KOTLY.find((k) => k[0] === kociol)[1].toLowerCase()}, ${kw ? m(kw) + " kW" : "moc nieznana"}` : "brak kotłowni";
  dodaj(14, "Przestrzenie wydzielone pożarowo", wydziel ? "kotłownia jako pomieszczenie wydzielone pożarowo" : kociol ? `kotłownia nie wymaga wydzielenia (moc do ${PROG_KOTLOWNI[kociol]} kW)` : "nie występują",
    kotlTxt, kociol && !kw ? null : "opis", kociol ? "§ 220 ust. 1 WT" : "");
  const gazW = kociol === "gaz" && wysoki;
  dodaj(15, "Klasa odporności ogniowej wydzielenia", wydziel ? (gazW ? "ściany EI 120, strop REI 120, drzwi EI 60 z samozamykaczem" : "ściany EI 60, strop REI 60, drzwi EI 30 z samozamykaczem") : "nie dotyczy",
    wydziel ? "istniejącą wpisz z dokumentacji" : "", wydziel ? null : "opis", wydziel ? "§ 220 ust. 1 WT; § 240 ust. 6 WT" : "");

  // 16. Osoby
  const pktWsk = { 1: 1, 4: 2, 5: 3, 7: 4, 30: 5 }[typ[4]];
  dodaj(16, "Liczba osób w budynku i na kondygnacjach", zDokumentow ? "liczba z dokumentów obiektu" : typ[4] ? `wskaźnik ${typ[4]} m² na osobę` : "miejsca + pracownicy",
    osoby ? `${m(osoby)} osób${prac ? `, w tym ${m(prac)} stałych użytkowników` : ""}` : "", osoby ? "opis" : null, zDokumentow || !pktWsk ? "" : `§ 236 ust. 6 pkt ${pktWsk} WT`);

  // 17-24. Ewakuacja
  const prog = kat === "ZL II" ? 30 : 50;
  const dwa = osoby > prog || (zl && pow > 300) || (pm && q > 500 && pow > 300) || (pm && pow > 1000) || (wybuch && pow > 100);
  const klatki = kond > 1 && ((kat === "ZL II" && grupa === "N") || (["ZL I", "ZL II", "ZL III", "ZL V"].includes(kat) && grupa === "SW") || (pm && (q > 500 || wybuch) && ["N", "SW"].includes(grupa)) || wysoki);
  const wyjscia = liczba(d["a-wyjscia"]);
  dodaj(17, "Wyjścia z budynku i klatki schodowe", `${dwa ? "co najmniej 2 wyjścia, minimum 5 m od siebie" : "1 wyjście wystarcza"}${kond > 1 ? (klatki ? "; klatki obudowane, drzwi dymoszczelne, oddymianie z czujkami" : "; klatki bez obowiązku oddymiania") : "; klatki nie występują"}`,
    wyjscia ? `${m(wyjscia)} wyjść` : "", wyjscia ? wyjscia >= (dwa ? 2 : 1) : null, `§ 236 ust. 1-2 WT; § 238 WT${kond > 1 ? (wysoki ? "; § 246 WT" : "; § 245 WT") : ""}`);

  const bazaPrz = zl || wybuch ? 40 : kond > 1 && q > 500 ? 75 : 100;
  const pktPrz = zl ? 1 : kond > 1 && q > 500 ? 2 : 3;
  const mnoznik = 1 + (d["a-h5"] ? 0.25 : 0) + (sug ? 0.5 : 0) + (d["a-oddym"] ? 0.5 : 0);
  const dopPrz = bazaPrz * mnoznik;
  const powiekszenia = [d["a-h5"] && "+25% wysokość ponad 5 m", sug && "+50% tryskacze", d["a-oddym"] && "+50% oddymianie"].filter(Boolean);
  const przejscie = liczba(d["a-przejscie"]);
  dodaj(18, "Długość przejść ewakuacyjnych", `najwyżej ${m(dopPrz)} m${powiekszenia.length ? ` (${m(bazaPrz)} m ${powiekszenia.join(", ")})` : ""}; przez najwyżej 3 pomieszczenia`,
    przejscie ? `${m(przejscie, 1)} m` : "", porownaj(przejscie, dopPrz, "max"),
    `§ 237 ust. 1 pkt ${pktPrz}${wybuch ? " i ust. 2" : ""}${powiekszenia.length ? ", ust. 5-7" : ""}, ust. 8 WT`);

  const doj = DOJSCIA[wybuch ? "wybuch" : zl ? kat : q > 500 ? "pmDuze" : "pmMale"];
  const mnDoj = 1 + (sug ? 0.5 : 0) + (d["a-oddym"] ? 0.5 : 0);
  const dopDoj = doj[d["a-dwa"] ? 1 : 0] * mnDoj;
  const poziomo = !d["a-dwa"] && doj[0] >= 30 ? " (w tym najwyżej 20 m na poziomej drodze)" : "";
  const dojscie = liczba(d["a-dojscie"]);
  dodaj(19, "Długość dojść ewakuacyjnych", `najwyżej ${m(dopDoj)} m przy ${d["a-dwa"] ? "dwóch kierunkach" : "jednym kierunku"}${poziomo}${mnDoj > 1 ? " - powiększone za tryskacze/oddymianie" : ""}`,
    dojscie ? `${m(dojscie, 1)} m` : krok2 ? "brak korytarzy - wyjścia z pomieszczeń bezpośrednio na zewnątrz" : "", dojscie ? dojscie <= dopDoj : krok2 ? "opis" : null,
    `§ 256 ust. 1 i 3${mnDoj > 1 ? " i 4" : ""} WT`);

  dodaj(20, "Parametry klatki schodowej", kond > 1 ? "szerokość biegów i spoczników wg tabeli; łącznie 0,6 m na 100 osób z najliczniejszej kondygnacji" : "nie dotyczy - budynek jednokondygnacyjny, brak klatek schodowych",
    "", kond > 1 ? null : "opis", kond > 1 ? "§ 68 ust. 1 i 2 WT" : "");

  const wymPrz = Math.max(0.9, (osoby * 0.6) / 100);
  const szerPrz = liczba(d["a-szer-przejscia"]);
  dodaj(21, "Szerokość przejść ewakuacyjnych", `co najmniej ${m(wymPrz, 2)} m (0,6 m na 100 osób, min. 0,9 m)`, szerPrz ? `${m(szerPrz, 2)} m` : "", porownaj(szerPrz, wymPrz, "min"), "§ 237 ust. 10 WT");

  const osKor = liczba(d["a-os-kor"]) || osoby;
  const wymKor = osKor <= 20 ? 1.2 : Math.max(1.4, (osKor * 0.6) / 100);
  const szerKor = liczba(d["a-szer-kor"]);
  dodaj(22, "Szerokość dojść (korytarzy)", `co najmniej ${m(wymKor, 2)} m dla ${m(osKor)} osób, wysokość 2,2 m`, szerKor ? `${m(szerKor, 2)} m` : dojscie || !krok2 ? "" : "korytarze nie występują",
    szerKor ? szerKor >= wymKor : dojscie || !krok2 ? null : "opis", `§ 242 ust. 1${osKor <= 20 ? " i 2" : ""} i 3 WT`);

  const wymDrzwi = Math.max(0.9, (osoby * 0.6) / 100);
  const sumaDrzwi = liczba(d["a-drzwi-suma"]);
  const minDrzwi = liczba(d["a-drzwi-min"]);
  const naZew = osoby > 50;
  const panika = osoby > 300;
  const istDrzwi = [sumaDrzwi && `łącznie ${m(sumaDrzwi, 2)} m`, minDrzwi && `najwęższe ${m(minDrzwi, 2)} m`,
    krok2 && naZew && (d["a-drzwi-zew"] ? "otwierane na zewnątrz" : "nie otwierają się na zewnątrz"), krok2 && panika && (d["a-antypanika"] ? "z zamknięciami przeciwpanicznymi" : "bez zamknięć przeciwpanicznych")].filter(Boolean);
  const okDrzwi = !sumaDrzwi && !minDrzwi ? null : (!sumaDrzwi || sumaDrzwi >= wymDrzwi) && (!minDrzwi || minDrzwi >= 0.9) && (!naZew || !!d["a-drzwi-zew"]) && (!panika || !!d["a-antypanika"]);
  dodaj(23, "Szerokość drzwi ewakuacyjnych", `łącznie co najmniej ${m(wymDrzwi, 2)} m, każde min. 0,9 m${naZew ? ", otwierane na zewnątrz" : ""}${panika ? ", z zamknięciami przeciwpanicznymi" : ""}`,
    istDrzwi.join(", "), okDrzwi, `§ 239 ust. 1 i 5 WT${naZew ? "; § 236 ust. 4 WT; § 239 ust. 2 pkt 3 WT" : ""}${panika ? "; § 240 ust. 7 WT" : ""}`);

  dodaj(24, "Uwzględnienie stanu sprawności osób", kat === "ZL II" ? "obiekt dla osób o ograniczonej zdolności poruszania się - opisać rozwiązania techniczne i organizacyjne" : "opisać bariery i organizację pomocy przy ewakuacji",
    "", "opis", "§ 6 ust. 1 pkt 5 rozp. 2010");

  // 25-35. Urządzenia
  const h1 = przezn === "handel" && kond === 1;
  const hW = przezn === "handel" && kond > 1;
  const ssp = (h1 && powStrefy > 5000) || (hW && powStrefy > 2500) || (przezn === "teatr" && miejsca > 300) || (przezn === "kino" && miejsca > 600) || (przezn === "gastronomia" && miejsca > 300)
    || (przezn === "sport" && miejsca > 1500) || (przezn === "szpital" && miejsca > 200) || (przezn === "opieka" && miejsca > 100) || (up && wysoki) || (zbiorowe && miejsca > 50) || (przezn === "dworzec" && osoby > 500);
  P.push(urzadzenie(d, 25, "System sygnalizacji pożarowej", ssp, ssp ? "obiekt spełnia próg z listy" : "obiekt poniżej progów (np. handel 1-kondygnacyjny: strefa ponad 5000 m²)", "a-u-ssp", "§ 28 ust. 1 rozp. 2010"));
  const dso = (h1 && kat === "ZL I" && powStrefy > 8000) || (hW && kat === "ZL I" && powStrefy > 5000) || (przezn === "sport" && miejsca > 1500) || (["kino", "teatr"].includes(przezn) && miejsca > 600)
    || (przezn === "szpital" && miejsca > 200) || (up && wysoki) || (zbiorowe && (wysoki || miejsca > 200)) || (przezn === "dworzec" && osoby > 500);
  P.push(urzadzenie(d, 26, "Dźwiękowy system ostrzegawczy", dso, dso ? "obiekt spełnia próg z listy" : "obiekt poniżej progów (np. handel 1-kondygnacyjny ZL I: strefa ponad 8000 m²)", "a-u-dso", "§ 29 ust. 1 rozp. 2010"));
  P.push(urzadzenie(d, 27, "Urządzenia oddymiające", klatki, klatki ? "oddymianie klatek schodowych z uruchamianiem czujkami dymu" : "brak klatek wymagających oddymiania i brak powiększeń strefy lub przejść za oddymianie", "a-u-oddym",
    kond > 1 ? (wysoki ? "§ 246 WT" : "§ 245 WT") : "§ 245 WT"));
  P.push(urzadzenie(d, 28, "Przeciwpożarowe klapy odcinające", strefy > 1, strefy > 1 ? "w przewodach wentylacji przechodzących przez ściany i stropy oddzielenia" : "jedna strefa - przewody nie przechodzą przez oddzielenia", "a-u-klapy", "§ 268 ust. 4 WT"));
  const tryskWym = (h1 && kat === "ZL I" && powStrefy > 8000) || (hW && kat === "ZL I" && powStrefy > 5000) || (przezn === "gastronomia" && miejsca > 600) || ((up || zbiorowe) && grupa === "WW");
  P.push(urzadzenie(Object.assign({}, d, { "a-krok2": true }), 29, "Stałe urządzenia gaśnicze", tryskWym, tryskWym ? "tryskacze wymagane dla tego obiektu" : "obiekt poniżej progów", "a-tryskacze", "§ 27 ust. 1-2 rozp. 2010"));
  const hyd25 = (zl && kat !== "ZL IV" && wysoki) || (["ZL I", "ZL II", "ZL V"].includes(kat) && powStrefy > 200) || (kat === "ZL III" && ((grupa === "SW" && powStrefy > 200) || powStrefy > 1000));
  const hyd52 = pm && q > 500 && powStrefy > 200;
  P.push(urzadzenie(d, 30, "Hydranty wewnętrzne i zawory hydrantowe", hyd25 || hyd52,
    hyd25 ? "hydranty 25 (1,0 l/s), zawór na 1,35 m, zasięg wąż + 10 m (3 m w ZL wielokondygnacyjnym)" : hyd52 ? "hydranty 52 (2,5 l/s), zawór na 1,35 m" : "obiekt poniżej progów",
    "a-u-hyd", `§ 19 ust. ${hyd52 ? 3 : 1} rozp. 2010; § 20 ust. 3 rozp. 2010; § 21 ust. 1 rozp. 2010; § 22 ust. 1 rozp. 2010`));

  // Woda - potrzebna już przy hydrantach zewnętrznych
  let wodaWym;
  let wodaTxt;
  let wodaPrzepis;
  if (d["a-wies"] && kub <= 2500 && pow <= 500) {
    wodaWym = 10;
    wodaTxt = "10 l/s z zasobów w okolicy (mały budynek poza miejscowością)";
    wodaPrzepis = "§ 3 ust. 1 pkt 2 i ust. 2 rozp. 2009";
  } else if (zl && kat !== "ZL IV") {
    const male = kub <= 5000 && pow <= 1000;
    wodaWym = male ? 10 : 20;
    wodaTxt = male ? "10 l/s z co najmniej 1 hydrantu DN 80 albo zbiornik 100 m³" : "20 l/s z co najmniej 2 hydrantów DN 80 albo zbiornik 200 m³";
    wodaPrzepis = `§ 3 ust. 1 pkt 1 rozp. 2009; § 5 ust. 1 pkt ${male ? 1 : 2} rozp. 2009`;
  } else if (pm) {
    wodaWym = wedlugQ(WODA_PM, q)[WODA_PM_KOLUMNY.findIndex((g) => powStrefy <= g)];
    wodaTxt = `${wodaWym} l/s (tabela wg Q i powierzchni strefy)`;
    wodaPrzepis = "§ 6 ust. 3 rozp. 2009";
  } else {
    wodaWym = kat === "IN" ? (powStrefy > 2000 ? 15 : 10) : 0;
    wodaTxt = kat === "IN" ? `${wodaWym} l/s` : "woda z sieci w miejscowości - bez osobnego wymagania";
    wodaPrzepis = kat === "IN" ? "§ 6 ust. 9 rozp. 2009" : "§ 4 ust. 1 rozp. 2009";
  }
  const hz = liczba(d["a-hz"]);
  const zbiornik = liczba(d["a-zbiornik"]);
  const wodaJest = hz * WYDAJNOSC_HYDRANTU + zbiornik / ZBIORNIK_M3_NA_DM3;
  P.push(urzadzenie(Object.assign({}, d, { "a-hzjest": hz > 0 }), 31, "Hydranty zewnętrzne", wodaWym > 0, wodaTxt, "a-hzjest", wodaPrzepis));

  const osw = (pow > 2000 && kat !== "ZL IV") || kat === "ZL II" || ["kino", "teatr"].includes(przezn) || ((up || zbiorowe) && wysoki);
  P.push(urzadzenie(d, 32, "Oświetlenie awaryjne ewakuacyjne", osw, `${osw ? "w pomieszczeniach i na drogach z listy" : "w pomieszczeniach nie jest wymagane"}; na drogach oświetlonych tylko światłem sztucznym - zawsze; działa min. 1 godzinę`,
    "a-u-osw", "§ 181 ust. 3 i 5 WT"));
  const pwp = kub > 1000 || wybuch;
  P.push(urzadzenie(d, 33, "Przeciwpożarowy wyłącznik prądu", pwp, pwp ? "strefa ponad 1000 m³ lub zagrożenie wybuchem; przy głównym wejściu lub złączu, oznakowany" : "strefa do 1000 m³ bez zagrożenia wybuchem", "a-u-pwp", "§ 183 ust. 2-3 WT"));
  const drzwiPpoz = strefy > 1 || wydziel;
  P.push(urzadzenie(d, 34, "Drzwi i bramy przeciwpożarowe", drzwiPpoz, drzwiPpoz ? "w ścianach oddzielenia i wydzieleniach, z samozamykaczem" : "brak oddzieleń i pomieszczeń wydzielonych", "a-u-drzwippoz", "§ 232 ust. 4 WT; § 240 ust. 6 WT"));
  const dzwig = (["ZL I", "ZL II", "ZL III", "ZL V"].includes(kat) && wys > 25) || (kat === "ZL IV" && grupa === "WW");
  P.push(urzadzenie(d, 35, "Dźwigi dla ekip ratowniczych", dzwig, dzwig ? "co najmniej 1 dźwig, dojście przez przedsionek ppoż." : "brak kondygnacji powyżej 25 m", "a-u-dzwig", "§ 253 ust. 1 WT"));

  // 36-37. Gaśnice
  const gasKg = liczba(d["a-gasnice"]);
  if (kat === "ZL IV") {
    dodaj(36, "Ilość środka gaśniczego", "nie określa się dla ZL IV", "", "opis", "§ 32 ust. 3 pkt 2 rozp. 2010");
  } else {
    const co = !sug && (up || zbiorowe || (pm && q > 500) || wybuch) ? 100 : 300;
    const jedn = Math.ceil(pow / co);
    dodaj(36, "Ilość środka gaśniczego", `co najmniej ${m(jedn * KG_NA_JEDNOSTKE)} kg (${m(pow)} m² ÷ ${co} m² = ${m(pow / co, 1)} → ${jedn} jedn. × 2 kg)`, gasKg ? `${m(gasKg)} kg` : "",
      porownaj(gasKg, jedn * KG_NA_JEDNOSTKE, "min"), `§ 32 ust. 3 pkt ${co === 100 ? 1 : 2} rozp. 2010`);
  }
  dodaj(37, "Typy gaśnic i inny sprzęt", "dobrane do grup pożarów (A, B, C, D, F); do gaśnicy najwyżej 30 m, dostęp min. 1 m; gaśnice w tych samych miejscach na kondygnacjach",
    "", "opis", "§ 32 ust. 1-2 rozp. 2010; § 33 rozp. 2010");

  // 38-42. Otoczenie
  const moj = wybuch ? -1 : zl ? 0 : kat === "IN" ? 1 : q <= 1000 ? 2 : q <= 4000 ? 3 : 4;
  const sasiedzi = [1, 2, 3].filter((i) => d[`a-s${i}`]).map((i) => {
    const wym = moj < 0 ? 20 : ODL[moj][Number(d[`a-s${i}`])];
    const odl = liczba(d[`a-s${i}-odl`]);
    return { opis: SASIEDZI.find((s) => s[0] === d[`a-s${i}`])[1], wym, odl };
  });
  dodaj(38, "Odległości od budynków sąsiednich", sasiedzi.length ? sasiedzi.map((s) => `${s.opis}: min. ${s.wym} m`).join("; ") + " (więcej, gdy ściana lub dach rozprzestrzenia ogień)" : "zależą od rodzaju sąsiada: 8, 15 lub 20 m",
    sasiedzi.filter((s) => s.odl).map((s) => `${s.opis}: ${m(s.odl, 1)} m`).join("; "), sasiedzi.some((s) => s.odl) ? sasiedzi.every((s) => !s.odl || s.odl >= s.wym) : null,
    `§ 271 ust. 1${moj < 0 ? " i 3" : ""} WT`);

  const drogaWym = ["ZL I", "ZL II"].includes(kat) || (["ZL III", "ZL IV", "ZL V"].includes(kat) && grupa !== "N") || (pm && q > 500 && (powStrefy > 1000 || wybuch)) || (pm && powStrefy > 20000) || (zbiorowe && miejsca > 50);
  const dSzer = liczba(d["a-droga-szer"]);
  const dOdl = liczba(d["a-droga-odl"]);
  const dMax = zl ? 15 : 25;
  const drogaIst = !krok2 ? "" : d["a-droga"] ? [dSzer && `szerokość ${m(dSzer, 1)} m`, dOdl && `${m(dOdl, 1)} m od ściany`].filter(Boolean).join(", ") || "jest" : "brak";
  const drogaOk = !krok2 ? null : !drogaWym ? (d["a-droga"] ? "dobrowolnie" : true) : !d["a-droga"] ? false : (!dSzer || dSzer >= 4) && (!dOdl || (dOdl >= 5 && dOdl <= dMax));
  dodaj(39, "Droga pożarowa", drogaWym ? `TAK - szerokość min. 4 m, spadek do 5%, bliższa krawędź 5-${dMax} m od ściany, bez przeszkód wyższych niż 3 m, przejazd bez cofania lub plac 20 × 20 m` : "NIE - wystarczy zwykły dojazd",
    drogaIst, drogaOk, drogaWym ? "§ 12 ust. 1, 2 i 9 rozp. 2009; § 13 ust. 1 rozp. 2009" : "§ 12 ust. 1 rozp. 2009");

  dodaj(40, "Ilość wody do zewnętrznego gaszenia", wodaTxt, krok2 && (hz || zbiornik) ? `${m(wodaJest)} l/s${hz ? ` (${m(hz)} hydr. × 10 l/s)` : ""}${zbiornik ? ` + zbiornik ${m(zbiornik)} m³` : ""}` : "",
    krok2 && wodaWym ? (hz || zbiornik ? wodaJest >= wodaWym : false) : wodaWym ? null : "opis", wodaPrzepis);
  dodaj(41, "Usytuowanie źródeł wody", "opis: rodzaj hydrantów (nadziemny / podziemny, DN), sieć, dojazd, oznakowanie", "", "opis", "§ 10 ust. 1-2 i 12 rozp. 2009");
  const o1 = liczba(d["a-hz-odl1"]);
  const o2 = liczba(d["a-hz-odl2"]);
  dodaj(42, "Odległości źródeł wody", "najbliższy hydrant do 75 m od budynku, kolejne do 150 m, między hydrantami do 150 m, min. 5 m od ściany, do 15 m od jezdni",
    [o1 && `najbliższy ${m(o1)} m`, o2 && `między hydrantami ${m(o2)} m`].filter(Boolean).join(", "), o1 || o2 ? (!o1 || (o1 <= 75 && o1 >= 5)) && (!o2 || o2 <= 150) : null,
    "§ 10 ust. 6 rozp. 2009");

  // 43-45. Instalacje i dokumenty
  const zabudowa = pow / kond;
  dodaj(43, "Zabezpieczenie instalacji użytkowych", `kontrola raz w roku (gaz, przewody kominowe)${zabudowa > PROG_ZABUDOWY_KONTROLI ? ", przy zabudowie ponad 2000 m² - dwa razy w roku" : ""}; elektryczna i odgromowa co 5 lat; czyszczenie przewodów wg § 34`,
    "", "opis", `art. 62 ust. 1 pkt 1-2${zabudowa > PROG_ZABUDOWY_KONTROLI ? " i 3" : ""} Prawa budowlanego; § 34 ust. 1-2 rozp. 2010`);
  const ibp = kat !== "ZL IV" && (wybuch || kub > (kat === "IN" ? 1500 : 1000));
  const cykl = ["oswiata", "hotel", "opieka"].includes(przezn);
  dodaj(44, "Procedury ewakuacji i IBP", `${ibp ? "IBP wymagana, aktualizacja co 2 lata" : "IBP niewymagana"}; próbna ewakuacja ${cykl ? "co roku i do 3 miesięcy od przyjścia nowych użytkowników" : prac > 50 ? "co 2 lata (ponad 50 stałych użytkowników)" : "nieobowiązkowa (do 50 stałych użytkowników)"}`,
    "", "opis", `§ 6 ust. 1, 7 i 8 rozp. 2010; § 17 ust. ${cykl ? 2 : 1} rozp. 2010`);
  const rz = ["ZL I", "ZL II", "ZL V"].includes(kat) || (["ZL III", "ZL IV"].includes(kat) && grupa !== "N") || (pm && ((powStrefy > 1000 && q > 500) || powStrefy > 5000 || wybuch)) || ssp || dso || tryskWym;
  dodaj(45, "Uzgodnienie projektu z rzeczoznawcą", rz ? "TAK - obiekt istotny ze względu na ochronę ppoż." : "NIE", "", "opis", "art. 6b ustawy o ochronie ppoż.; § 3 ust. 1 rozp. 2023/1563");

  P.sort((x, y) => x.nr - y.nr);
  const opis = `${kat}${zl ? "" : pm ? ` (Q ≈ ${m(q)} MJ/m²)` : ""}, budynek ${NAZWY_GRUP[grupa]}, ${kond} kondygn., ${m(pow)} m², ${osoby ? `${m(osoby)} osób${zDokumentow ? "" : " (ze wskaźnika)"}` : "liczba osób niepodana"}, klasa odporności „${klasa}”.`;
  return { opis, punkty: P };
}
