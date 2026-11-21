// Zakładka „Wiadomości” - zagregowane wydarzenia z branży z wnioskami, źródłami i analizami,
// do tego fakt czy mit, przepisy, nowości, badania, „czy wiesz, że”, porady i baza źródeł.
// Dane: data/wiadomosci.json (uzupełniane przez prasówkę). Wygląd jak portal informacyjny, bez zdjęć.
//
//   #/wiadomosci              strona główna: najważniejsze + zajawki sekcji
//   #/wiadomosci/w/ID         pełna wiadomość
//   #/wiadomosci/s/SEKCJA     cała sekcja
//   #/wiadomosci/zrodla       baza źródeł, z których warto korzystać

// Najpierw świeże dane z repozytorium automatu, a bez internetu albo przy błędzie - kopia dołączona do aplikacji
const ADRES_WIADOMOSCI = "https://raw.githubusercontent.com/tomasz66/ppoz-wiadomosci/main/wiadomosci.json";
const PLIK_WIADOMOSCI = "data/wiadomosci.json";
const ZAJAWEK_NA_GLOWNEJ = 6;
const TEMATOW_NA_GLOWNEJ = 8;
let WIADOMOSCI = null;

const SEKCJE_WIAD = [
  ["wydarzenia", "Wydarzenia i wnioski"],
  ["faktmit", "Fakt czy mit?"],
  ["tipy", "Tipy, triki i dobre praktyki"],
  ["baterie", "Auta elektryczne, rowery, hulajnogi"],
  ["przepisy", "Przepisy - nowe i nadchodzące"],
  ["wyroki", "Wyroki i odpowiedzialność"],
  ["czywiesz", "Czy wiesz, że…"],
  ["dla_kazdego", "Dla każdego i dla klienta"],
  ["nowosci", "Nowości: sprzęt i technologie"],
  ["badania", "Badania i ciekawostki"],
];

// Baza źródeł - z czego korzystać, żeby być na bieżąco (sprawdzone 17-19.11.2026)
const ZRODLA_WIEDZY = [
  ["Polska - wiadomości i akcje", [
    ["Remiza.pl", "https://remiza.pl/", "akcje, sprzęt, OSP - codziennie"],
    ["Strazacki.pl", "https://strazacki.pl/", "akcje, taktyka, technika - codziennie"],
    ["Przegląd Pożarniczy (KG PSP)", "https://www.ppoz.pl/", "miesięcznik PSP - artykuły fachowe"],
    ["Ochrona Przeciwpożarowa (kwartalnik)", "https://ochronaprzeciwpozarowa.pl/", "kwartalnik ekspercki o bezpieczeństwie pożarowym obiektów - prenumerata"],
    ["Komenda Główna PSP", "https://www.gov.pl/web/kgpsp", "komunikaty, statystyki, kampanie"],
  ]],
  ["Polska - nauka i normy", [
    ["CNBOP-PIB", "https://cnbop.pl/", "badania, dopuszczenia, podcast „Laboratorium Bezpieczeństwa”"],
    ["Akademia Pożarnicza", "https://apoz.edu.pl/", "konferencje, publikacje naukowe"],
    ["Safety & Fire Technology", "https://journals.uafm.edu.pl/stp/", "czasopismo naukowe (dawniej BiTP), bezpłatne"],
    ["Ośrodek szkolenia KW PSP Olsztyn (cfbt.pl)", "https://cfbt.pl/", "pożary wewnętrzne, materiały szkoleniowe"],
  ]],
  ["Nauka - polscy autorzy (artykuły, także po polsku)", [
    ["Jacek Zboina (ResearchGate)", "https://www.researchgate.net/profile/Jacek-Zboina", "artykuły naukowe o ochronie przeciwpożarowej"],
    ["Jan Kielin (ResearchGate)", "https://www.researchgate.net/scientific-contributions/Jan-Kielin-2145430121", "autor poradnika o ocenie ryzyka pożarowego (CNBOP)"],
    ["Tomasz Kołodziejczyk (ResearchGate)", "https://www.researchgate.net/scientific-contributions/Tomasz-Kolodziejczyk-2306651336", "publikacje naukowe"],
    ["Ilona Majka (ResearchGate)", "https://www.researchgate.net/scientific-contributions/Ilona-Majka-2125510925", "publikacje naukowe"],
    ["Jarosław Tępiński (ResearchGate)", "https://www.researchgate.net/profile/Jaroslaw-Tepinski", "publikacje naukowe"],
    ["„Bezpieczeństwo pożarowe” (Academia.edu)", "https://www.academia.edu/37125088/Bezpieczenstwo_pozarowe", "opracowanie do pobrania"],
    ["Poradnik: ocena ryzyka pożarowego (CNBOP, J. Kielin)", "https://cnbop.pl/app/uploads/2024/11/Poradnik_ocena-ryzyka-pozarowego_Kielin_J.pdf", "PDF, 2024"],
  ]],
  ["Edukacja i książki", [
    ["Droga Ratownika", "https://drogaratownika.pl/", "platforma edukacyjna: quizy, scenariusze zbiórek, materiały szkoleniowe"],
    ["Edufire", "https://edufire.pl/", "szkolenia i blog branży pożarniczej (współpraca z CNBOP)"],
    ["Fabryka 998 - książki i podręczniki", "https://www.fabryka998.pl/ksiazki-podreczniki-c-12_3.html", "księgarnia strażacka"],
    ["„Gaszenie pożarów wewnętrznych” (książka)", "https://www.fabryka998.pl/gaszenie-pozarow-wewnetrznych-rozgorzenie-i-spalanie-gazow-pozarowych-metody-gasnicze-taktyka-dzialan-szkolenie-w-warunkach-rzeczywistych-p-168.html", "rozgorzenie, gazy pożarowe, metody gaśnicze, taktyka"],
  ]],
  ["Przepisy", [
    ["ISAP (Sejm)", "https://isap.sejm.gov.pl/", "teksty ustaw i rozporządzeń, statusy"],
    ["ELI / Dziennik Ustaw", "https://eli.gov.pl/", "oficjalne teksty aktów"],
    ["Rządowy proces legislacyjny", "https://legislacja.gov.pl/", "projekty rozporządzeń i konsultacje"],
    ["EUR-Lex", "https://eur-lex.europa.eu/", "przepisy UE (np. PFAS w pianach)"],
  ]],
  ["Świat - akcje i lekcje", [
    ["Firefighter Close Calls", "https://www.firefighterclosecalls.com/", "wypadki strażaków, rocznice dużych pożarów"],
    ["Fire Engineering", "https://www.fireengineering.com/", "akcje i taktyka (USA)"],
    ["Firefighter Nation", "https://www.firefighternation.com/", "taktyka, zdrowie strażaków"],
    ["Feuerwehr-Magazin", "https://www.feuerwehrmagazin.de/", "akcje w Niemczech"],
    ["Wildfire Today", "https://wildfiretoday.com/", "pożary lasów na świecie"],
    ["NIOSH - raporty o śmierci strażaków", "https://www.cdc.gov/niosh/firefighters/", "oficjalne analizy wypadków z zaleceniami"],
    ["Wildland Fire Lessons Learned Center", "https://www.wildfirelessons.net/", "raporty i wnioski z akcji"],
    ["Atemschutzunfälle (DE)", "https://www.atemschutzunfaelle.eu/", "wypadki w aparatach oddechowych - pasjonaci"],
  ]],
  ["Świat - nauka i technologie", [
    ["Fire Science Show", "https://www.firescienceshow.com/", "podcast Wojciecha Węgrzyńskiego - nauka o pożarach"],
    ["UL FSRI", "https://fsri.org/", "badania pożarów w skali rzeczywistej"],
    ["NIST Fire", "https://www.nist.gov/fire", "badania, warsztaty"],
    ["NIPV (Holandia)", "https://nipv.nl/", "badania i analizy zdarzeń"],
    ["IAFSS", "https://www.iafss.org/", "międzynarodowe stowarzyszenie naukowców"],
    ["NFPA", "https://www.nfpa.org/", "normy i analizy (USA)"],
    ["CTIF", "https://www.ctif.org/", "statystyki pożarów na świecie"],
    ["International Fire & Safety Journal", "https://internationalfireandsafetyjournal.com/", "technologie i rynek"],
    ["Fire Tactics (P. Grimwood)", "https://www.firetactics.com/", "taktyka i wentylacja - pasjonat"],
    ["CFBT-US (E. Hartin)", "https://www.cfbt-us.com/", "zachowanie pożaru - pasjonat"],
  ]],
];

TRASY.unshift(
  [/^#\/wiadomosci$/, () => widokWiadomosci()],
  [/^#\/wiadomosci\/w\/([\w-]+)$/, (m) => widokWiadomosci1(m[1])],
  [/^#\/wiadomosci\/s\/([\w]+)$/, (m) => widokSekcjiWiad(m[1])],
  [/^#\/wiadomosci\/zrodla$/, () => widokZrodel()],
  [/^#\/wiadomosci\/wazne$/, () => widokWaznych()],
  [/^#\/wiadomosci\/baza$/, () => widokBazy()],
  [/^#\/wiadomosci\/x\/(\w+)$/, (m) => widokDodatku(m[1])],
  [/^#\/wiadomosci\/t\/(.+)$/, (m) => widokTematuWiad(decodeURIComponent(m[1]))],
);

async function wczytajWiadomosci() {
  if (WIADOMOSCI) {
    return WIADOMOSCI;
  }
  for (const adres of [ADRES_WIADOMOSCI, PLIK_WIADOMOSCI]) {
    try {
      const odp = await fetch(adres, { cache: "no-cache" });
      if (odp.ok) {
        WIADOMOSCI = await odp.json();
        return WIADOMOSCI;
      }
    } catch (e) {
      // brak internetu albo błąd - próbuj następnego źródła
    }
  }
  WIADOMOSCI = { wydarzenia: [] };
  return WIADOMOSCI;
}

// „19.11.2026” z „2026-11-19”
function dataPL(iso) {
  if (!iso) {
    return "";
  }
  const [r, m, d] = iso.split("-");
  return `${d}.${m}.${r}`;
}

function linkiZrodel(zrodla) {
  if (!zrodla || !zrodla.length) {
    return "";
  }
  return `<p class="wd-zrodla">Źródła: ${zrodla.map(([n, u]) => `<a href="${u}"${u.startsWith("#") ? "" : ' target="_blank" rel="noopener"'}>${tekst(n)}</a>`).join(" · ")}</p>`;
}

// ── Zapisane jako ważne, notatki, przeczytane ──
// Ważne: { id: { zapisano, sekcja, tytul, tekst, link, notatka } } - kopia treści, żeby została po wypadnięciu z archiwum.

const KLUCZ_WAZNE = "insp-wiad-wazne";
const KLUCZ_PRZECZYTANE = "insp-wiad-przeczytane";
const DNI_PRZYPOMNIENIA = [7, 30, 90];
const DLUGOSC_ID = 48;

// Stałe id dla elementów sekcji bez własnego id (z nazwy sekcji i tytułu)
function idElementu(klucz, x) {
  if (x.id) {
    return x.id;
  }
  const podstawa = bezOgonkow(x.tytul || x.twierdzenie || x.tekst || "").replace(/[^a-z0-9]+/g, "-");
  return `${klucz}-${podstawa.slice(0, DLUGOSC_ID)}`;
}

function jestWazne(id) {
  return Boolean(czytaj(KLUCZ_WAZNE, {})[id]);
}

function przelaczWazne(id, klucz, przycisk) {
  const wazne = czytaj(KLUCZ_WAZNE, {});
  if (wazne[id]) {
    delete wazne[id];
  } else {
    const x = znajdzElement(id);
    wazne[id] = {
      zapisano: new Date().toISOString().slice(0, 10), sekcja: klucz,
      tytul: x ? (x.tytul || x.twierdzenie || "Czy wiesz, że…") : id,
      tekst: x ? (x.zajawka || x.tresc && [].concat(x.tresc)[0] || x.tekst || "") : "",
      link: klucz === "wydarzenia" ? `#/wiadomosci/w/${id}` : (x && x.zrodla && x.zrodla[0] ? x.zrodla[0][1] : ""),
      notatka: "",
    };
  }
  zapisz(KLUCZ_WAZNE, wazne);
  document.querySelectorAll(`[data-wazne="${id}"]`).forEach((b) => {
    b.classList.toggle("on", Boolean(wazne[id]));
    b.textContent = wazne[id] ? "★ Ważne" : "☆ Ważne";
  });
}

function zapiszNotatke(id, pole) {
  const wazne = czytaj(KLUCZ_WAZNE, {});
  if (!wazne[id]) {
    przelaczWazne(id, "wydarzenia", null);
    return zapiszNotatke(id, pole);
  }
  wazne[id].notatka = pole.value;
  zapisz(KLUCZ_WAZNE, wazne);
}

function znajdzElement(id) {
  const d = WIADOMOSCI || {};
  for (const [klucz] of SEKCJE_WIAD) {
    const x = (d[klucz] || []).find((e) => idElementu(klucz, e) === id);
    if (x) {
      return x;
    }
  }
  return null;
}

function przyciskWazne(id, klucz) {
  const on = jestWazne(id);
  return `<button class="wd-gw${on ? " on" : ""}" data-wazne="${id}" onclick="event.preventDefault();event.stopPropagation();przelaczWazne('${id}','${klucz}',this)">${on ? "★ Ważne" : "☆ Ważne"}</button>`;
}

function przeczytane() {
  return new Set(czytaj(KLUCZ_PRZECZYTANE, []));
}

function oznaczPrzeczytane(ids) {
  const zbior = przeczytane();
  ids.forEach((i) => zbior.add(i));
  zapisz(KLUCZ_PRZECZYTANE, [...zbior]);
  pokazKropke();
}

// Kropka na zakładce, gdy są nieprzeczytane wydarzenia
function pokazKropke() {
  const tab = document.querySelector('.tab-item[data-tab="wiadomosci"]');
  if (!tab || !WIADOMOSCI) {
    return;
  }
  const zbior = przeczytane();
  const nowe = (WIADOMOSCI.wydarzenia || []).filter((w) => !zbior.has(w.id)).length;
  tab.classList.toggle("ma-nowe", nowe > 0);
}

// Udostępnianie (telefon: menu systemu; komputer: kopiowanie do schowka)
async function udostepnij(tytul, tresc) {
  const url = location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title: tytul, text: tresc, url });
      return;
    }
    await navigator.clipboard.writeText(`${tytul}\n${tresc}\n${url}`);
    alert("Skopiowano do schowka.");
  } catch (e) {
    // użytkownik anulował udostępnianie
  }
}

// Przypomnienie: jedna z ważnych rzeczy zapisanych ok. 7, 30 lub 90 dni temu
function przypomnienie() {
  const wazne = Object.entries(czytaj(KLUCZ_WAZNE, {}));
  const dzis = new Date();
  const stare = wazne.filter(([, w]) => {
    const dni = Math.round((dzis - new Date(w.zapisano)) / 86400000);
    return DNI_PRZYPOMNIENIA.some((g) => dni >= g && dni < g + 7);
  });
  if (!stare.length) {
    return "";
  }
  const [id, w] = stare[dzis.getDate() % stare.length];
  return `<div class="wd-przyp"><span class="wd-kicker">Wróć do tego - zapisane ${dataPL(w.zapisano)}</span>
    <a class="wd-tyt" href="${w.link && w.link.startsWith("#") ? w.link : "#/wiadomosci/wazne"}">${tekst(w.tytul)}</a>
    ${w.notatka ? `<p class="wd-notatka-pokaz">Twoja notatka: ${tekst(w.notatka)}</p>` : ""}</div>`;
}

// ── Strona główna ──

async function widokWiadomosci() {
  ustawNaglowek("Wiadomości");
  ustawZakladke("wiadomosci");
  const d = await wczytajWiadomosci();
  zapiszOdwiedziny();
  const zbior = przeczytane();
  const wyd = d.wydarzenia || [];
  const [glowna, ...reszta] = wyd;
  const nowych = wyd.filter((w) => !zbior.has(w.id)).length;
  const ileWaznych = Object.keys(czytaj(KLUCZ_WAZNE, {})).length;
  widok.innerHTML = `
    <div class="wd-szukaj"><input type="search" placeholder="Szukaj w wiadomościach…" oninput="szukajWiad(this.value)"></div>
    ${paskiSekcji(d)}
    <div id="wd-wyniki"></div>
    <div id="wd-glowna">
    <div class="wd-pasek"><span>Aktualizacja: ${dataPL(d.aktualizacja)}${nowych ? ` · <b>${nowych} nowych</b>` : ""}</span>
      ${nowych ? `<button class="wd-link" onclick="oznaczPrzeczytane(${JSON.stringify(wyd.map((w) => w.id)).replace(/"/g, "&quot;")});widokWiadomosci()">Oznacz jako przeczytane</button>` : ""}</div>
    <a class="wd-moje" href="#/wiadomosci/wazne">★ Moje ważne <small>${ileWaznych}</small></a>
    ${przypomnienie()}
    <div id="wd-najnowsze"></div>
    ${dzisW5Minut(d, zbior)}
    <span id="wd-s-wydarzenia"></span>
    ${glowna ? `<a class="wd-hero" href="#/wiadomosci/w/${glowna.id}">
      <span class="wd-kicker">${zbior.has(glowna.id) ? "" : '<span class="wd-nowe">NOWE</span> '}${tekst(glowna.naglowek || "")}</span>
      <span class="wd-hero-tyt">${tekst(glowna.tytul)}</span>
      <span class="wd-lead">${tekst(glowna.zajawka)}</span>
      <span class="wd-meta">${tekst(glowna.kraj)} · ${dataPL(glowna.data)} · ${glowna.etykieta}</span></a>` : ""}
    <div class="wd-lista">${reszta.slice(0, ZAJAWEK_NA_GLOWNEJ).map((w) => zajawka(w, zbior)).join("")}</div>
    ${reszta.length > ZAJAWEK_NA_GLOWNEJ ? `<a class="wd-wiecej" href="#/wiadomosci/s/wydarzenia">Wszystkie wydarzenia (${wyd.length}) ›</a>` : ""}
    ${blokAkcjiMiesiaca(d)}
    ${blokPrzegladu(d)}
    ${dodatkiGora(d)}
    ${blokLiczb(d)}
    ${chipyTematow(wyd)}
    ${blokObserwuje(d, 3)}
    ${blokSekcji(d, "faktmit", 1)}
    ${blokSekcji(d, "tipy", 3)}
    ${blokSekcji(d, "baterie", 3)}
    ${blokSekcji(d, "przepisy", 3)}
    ${blokSekcji(d, "wyroki", 2)}
    ${blokSekcji(d, "czywiesz", 3)}
    ${blokSekcji(d, "dla_kazdego", 3)}
    ${dodatkiDol(d)}
    <a class="wd-zrodla-btn wd-baza-btn" href="#/wiadomosci/baza">Baza wiedzy - wszystkie wpisy, także starsze ›</a>
    <a class="wd-zrodla-btn" id="wd-s-zrodla" href="#/wiadomosci/zrodla">Baza źródeł - z czego warto korzystać ›</a></div>`;
  pokazKropke();
  pokazNajnowsze();
}

function chipyTematow(wyd) {
  const licz = {};
  wyd.forEach((w) => (w.tematy || []).forEach((t) => (licz[t] = (licz[t] || 0) + 1)));
  const lista = Object.entries(licz).sort((a, b) => b[1] - a[1]);
  if (!lista.length) {
    return "";
  }
  const chip = ([t, n]) => `<a class="ob-chip" href="#/wiadomosci/t/${encodeURIComponent(t)}">${tekst(t)} <small>${n}</small></a>`;
  const reszta = lista.slice(TEMATOW_NA_GLOWNEJ);
  return `<div class="wd-sekcja" id="wd-s-tematy"><span class="wd-sek-nag">Tematy</span></div>
    <div class="wd-tematy">${lista.slice(0, TEMATOW_NA_GLOWNEJ).map(chip).join("")}
    ${reszta.length ? `<button class="ob-chip" onclick="this.outerHTML=this.dataset.r" data-r="${esc(reszta.map(chip).join(""))}">+ ${reszta.length} więcej</button>` : ""}</div>`;
}

function zajawka(w, zbior) {
  const nowe = zbior && !zbior.has(w.id);
  return `<a class="wd-zaj" href="#/wiadomosci/w/${w.id}">
    <span class="wd-kicker">${nowe ? '<span class="wd-nowe">NOWE</span> ' : ""}${tekst(w.naglowek || "")}</span>
    <span class="wd-tyt">${tekst(w.tytul)}</span>
    <span class="wd-lead-m">${tekst(w.zajawka)}</span>
    <span class="wd-meta">${tekst(w.kraj)} · ${dataPL(w.data)}${jestWazne(w.id) ? " · ★" : ""}</span></a>`;
}

function blokSekcji(d, klucz, ile) {
  const lista = d[klucz] || [];
  if (!lista.length) {
    return "";
  }
  const nazwa = SEKCJE_WIAD.find((s) => s[0] === klucz)[1];
  return `<div class="wd-sekcja" id="wd-s-${klucz}"><a class="wd-sek-nag" href="#/wiadomosci/s/${klucz}">${nazwa} ›</a>
    ${lista.slice(0, ile).map((x) => elementSekcji(klucz, x)).join("")}</div>`;
}

// Jeden element sekcji (poza wydarzeniami) - od razu do przeczytania, z gwiazdką „Ważne”
function elementSekcji(klucz, x) {
  if (klucz === "wydarzenia") {
    return zajawka(x, przeczytane());
  }
  const id = idElementu(klucz, x);
  const gw = `<div class="wd-akcje">${przyciskWazne(id, klucz)}</div>`;
  if (klucz === "czywiesz") {
    return `<div class="wd-el"><p>${pogrubLiczby(tekst(x.tekst))}</p>${x.zrodlo ? `<p class="wd-meta">${tekst(x.zrodlo)}</p>` : ""}${gw}</div>`;
  }
  if (klucz === "faktmit") {
    return `<div class="wd-el wd-fm"><p class="wd-tyt">${tekst(x.twierdzenie)}</p><p class="wd-werdykt">${tekst(x.werdykt)}</p>
      ${x.tresc.map((t) => `<p>${pogrubLiczby(tekst(t))}</p>`).join("")}
      ${x.klientowi ? `<p class="wd-ramka"><b>Jak powiedzieć klientowi:</b> ${tekst(x.klientowi)}</p>` : ""}
      ${x.uwaga ? `<p class="wd-meta">${tekst(x.uwaga)}</p>` : ""}${linkiZrodel(x.zrodla)}${gw}</div>`;
  }
  if (klucz === "wyroki") {
    return `<div class="wd-el"><span class="wd-status">${tekst(x.sad)} · ${tekst(x.sygn)} · ${dataPL(x.data)}</span><p class="wd-tyt">${tekst(x.tytul)}</p>
      <p>${tekst(x.poludzku)}</p><p class="wd-ramka"><b>Teza:</b> ${tekst(x.teza)}</p>
      ${x.dla_inspektora ? `<div class="wd-dp"><b>Dla inspektora</b><p>${tekst(x.dla_inspektora)}</p></div>` : ""}
      ${x.uwaga ? `<p class="wd-meta">${tekst(x.uwaga)}</p>` : ""}${linkiZrodel(x.zrodla)}${gw}</div>`;
  }
  if (klucz === "dla_kazdego") {
    return elementDlaKazdego(x, WIADOMOSCI.dla_kazdego.indexOf(x), gw);
  }
  if (klucz === "przepisy") {
    return `<div class="wd-el"><span class="wd-status">${tekst(x.status)}</span><p class="wd-tyt">${tekst(x.tytul)}</p><p>${pogrubLiczby(tekst(x.tresc))}</p>${linkiZrodel(x.zrodla)}${gw}</div>`;
  }
  // nowości, badania, tipy, baterie
  const dla = x.dla === "strażak" ? ' <span class="wd-etyk">DLA STRAŻAKA</span>' : "";
  return `<div class="wd-el"><p class="wd-tyt">${tekst(x.tytul)}${x.etykieta ? ` <span class="wd-etyk">${x.etykieta}</span>` : ""}${dla}</p>
    <p>${pogrubLiczby(tekst(x.tresc))}</p>${x.zrodlo ? `<p class="wd-meta">${tekst(x.zrodlo)}</p>` : ""}${x.przepis ? `<p class="wd-meta">Przepis: ${tekst(x.przepis)}</p>` : ""}
    ${x.link ? `<a class="wd-link" href="${x.link}">Czytaj całość ›</a>` : ""}${linkiZrodel(x.zrodla)}${gw}</div>`;
}

// ── Szukanie w wiadomościach (wszystkie sekcje) ──

function szukajWiad(fraza) {
  const wyniki = document.getElementById("wd-wyniki");
  const glowna = document.getElementById("wd-glowna");
  const q = bezOgonkow(fraza.trim());
  if (q.length < 2) {
    wyniki.innerHTML = "";
    glowna.hidden = false;
    return;
  }
  glowna.hidden = true;
  const trafienia = [];
  SEKCJE_WIAD.forEach(([klucz, nazwa]) => {
    (WIADOMOSCI[klucz] || []).forEach((x) => {
      if (bezOgonkow(JSON.stringify(x)).includes(q)) {
        trafienia.push([klucz, nazwa, x]);
      }
    });
  });
  wyniki.innerHTML = `<div class="wd-sekcja"><p class="wd-meta">Znaleziono: ${trafienia.length}</p>
    ${trafienia.map(([klucz, nazwa, x]) => `<p class="wd-kicker">${tekst(nazwa)}</p>${elementSekcji(klucz, x)}`).join("")}</div>`;
}

// ── Pełna wiadomość ──

async function widokWiadomosci1(id) {
  const d = await wczytajWiadomosci();
  const arch = await wczytajArchiwum();
  const w = [...(d.wydarzenia || []), ...(arch.wydarzenia || [])].find((x) => x.id === id);
  if (!w) {
    location.hash = "#/wiadomosci";
    return;
  }
  ustawNaglowek("Wiadomość", "back");
  ustawZakladke("wiadomosci");
  oznaczPrzeczytane([w.id]);
  const notatka = (czytaj(KLUCZ_WAZNE, {})[w.id] || {}).notatka || "";
  const powiazane = (w.powiazane || []).map((n) => TAGI.find((t) => t.nazwa === n)).filter(Boolean);
  widok.innerHTML = `<article class="wd-art">
    <span class="wd-kicker">${tekst(w.naglowek || "")}</span>
    <h1 class="wd-art-tyt">${tekst(w.tytul)}</h1>
    <p class="wd-meta">${tekst(w.kraj)} · ${dataPL(w.data)} · ${w.etykieta}</p>
    <div class="wd-akcje">${przyciskWazne(w.id, "wydarzenia")}<button class="wd-gw" onclick="udostepnij(${JSON.stringify(w.tytul).replace(/"/g, "&quot;")}, ${JSON.stringify(w.zajawka).replace(/"/g, "&quot;")})">Udostępnij</button><button class="wd-gw" onclick="czytajWiadomosc('${w.id}', this)">▶ Posłuchaj</button></div>
    <p class="wd-art-lead">${tekst(w.zajawka)}</p>
    ${w.tresc.map((t) => `<p>${pogrubLiczby(tekst(t))}</p>`).join("")}
    ${w.wniosek ? `<div class="wd-wn"><b>Wniosek</b><p>${tekst(w.wniosek)}</p></div>` : ""}
    ${w.praktyka ? `<div class="wd-dp"><b>Dobra praktyka</b><p>${tekst(w.praktyka)}</p></div>` : ""}
    ${analizaAkcjiMiesiaca(w)}
    ${w.analiza ? `<a class="wd-analiza" href="${w.analiza[1]}" target="_blank" rel="noopener">Analiza: ${tekst(w.analiza[0])} ›</a>` : ""}
    ${powiazane.length ? `<p class="wd-kicker">Powiązane w aplikacji</p><div class="wd-tematy">${powiazane.map((t) => `<a class="ob-chip" href="${adresTagu(t)}">${tekst(t.nazwa)}</a>`).join("")}</div>` : ""}
    ${(w.tematy || []).length ? `<p class="wd-kicker">Tematy</p><div class="wd-tematy">${w.tematy.map((t) => `<a class="ob-chip" href="#/wiadomosci/t/${encodeURIComponent(t)}">${tekst(t)}</a>`).join("")}</div>` : ""}
    <p class="wd-kicker">Twoja notatka</p>
    <textarea class="wd-notatka" placeholder="Co z tego wykorzystasz? (zapisze się jako ważne)" onchange="zapiszNotatke('${w.id}', this)">${esc(notatka)}</textarea>
    ${linkiZrodel(w.zrodla)}
    <p class="wd-meta">MEDIA = informacja prasowa, przyczyny niepotwierdzone. RAPORT = oficjalny dokument. Wnioski i dobre praktyki to opracowanie redakcji, nie stanowisko źródeł - chyba że oznaczono RAPORT.</p>
  </article>`;
}

// ── Cała sekcja, temat, moje ważne ──

async function widokSekcjiWiad(klucz) {
  const d = await wczytajWiadomosci();
  const sek = SEKCJE_WIAD.find((s) => s[0] === klucz);
  if (!sek) {
    location.hash = "#/wiadomosci";
    return;
  }
  ustawNaglowek(sek[1], "#/wiadomosci");
  ustawZakladke("wiadomosci");
  widok.innerHTML = `<div class="wd-sekcja">${(d[klucz] || []).map((x) => elementSekcji(klucz, x)).join("")}</div>`;
}

async function widokTematuWiad(temat) {
  const d = await wczytajWiadomosci();
  ustawNaglowek(`Temat: ${temat}`, "#/wiadomosci");
  ustawZakladke("wiadomosci");
  const lista = (d.wydarzenia || []).filter((w) => (w.tematy || []).includes(temat));
  widok.innerHTML = `<div class="section-header"><div class="section-sub">${tekst(`Wszystkie wiadomości na ten temat, od najnowszych (${lista.length}).`)}</div></div>
    <div class="wd-lista">${lista.map((w) => zajawka(w, przeczytane())).join("")}</div>`;
}

async function widokWaznych() {
  await wczytajWiadomosci();
  ustawNaglowek("Moje ważne", "#/wiadomosci");
  ustawZakladke("wiadomosci");
  const wazne = Object.entries(czytaj(KLUCZ_WAZNE, {})).sort((a, b) => b[1].zapisano.localeCompare(a[1].zapisano));
  if (!wazne.length) {
    widok.innerHTML = `<div class="section-header"><div class="section-sub">${tekst("Nic jeszcze nie zapisałeś. Przy każdej wiadomości, przepisie czy poradzie stuknij „☆ Ważne” - trafi tutaj, także gdy wypadnie z prasówki.")}</div></div>`;
    return;
  }
  widok.innerHTML = `<div class="wd-sekcja">${wazne.map(([id, w]) => `<div class="wd-el">
    <span class="wd-kicker">${tekst((SEKCJE_WIAD.find((s) => s[0] === w.sekcja) || ["", ""])[1])} · zapisane ${dataPL(w.zapisano)}</span>
    ${w.link && w.link.startsWith("#") ? `<a class="wd-tyt" href="${w.link}">${tekst(w.tytul)}</a>` : `<p class="wd-tyt">${tekst(w.tytul)}</p>`}
    ${w.tekst ? `<p>${pogrubLiczby(tekst(w.tekst))}</p>` : ""}
    ${w.link && !w.link.startsWith("#") ? `<p class="wd-zrodla"><a href="${w.link}" target="_blank" rel="noopener">Źródło ›</a></p>` : ""}
    <textarea class="wd-notatka" placeholder="Twoja notatka…" onchange="zapiszNotatke('${id}', this)">${esc(w.notatka || "")}</textarea>
    <div class="wd-akcje">${przyciskWazne(id, w.sekcja)}</div></div>`).join("")}</div>`;
}

// ── Baza źródeł ──

function widokZrodel() {
  ustawNaglowek("Baza źródeł", "#/wiadomosci");
  ustawZakladke("wiadomosci");
  widok.innerHTML = `<div class="section-header"><div class="section-sub">${tekst("Sprawdzone źródła, z których powstaje prasówka. Polskich blogów prowadzonych przez pasjonatów praktycznie nie ma - wiedza pasjonatów jest głównie zagraniczna.")}</div></div>`
    + ZRODLA_WIEDZY.map(([grupa, lista]) => `<div class="section-label">${tekst(grupa)}</div><div class="nz-blok">${lista.map(([n, u, o]) =>
      `<a class="wd-zr" href="${u}" target="_blank" rel="noopener"><span class="wd-tyt">${tekst(n)}</span><span class="wd-meta">${tekst(o)}</span></a>`).join("")}</div>`).join("");
}

// Kropka „nowe” na zakładce zaraz po uruchomieniu aplikacji
wczytajWiadomosci().then(pokazKropke);


// ── Dodatki: pytanie dnia, terminy, sezon, tego dnia, obserwuję, raporty, wydarzenia, dla klienta ──

const KLUCZ_MOJE_TERMINY = "insp-wiad-moje-terminy";
const DOBA_MS = 86400000;
const DNI_HISTORII = 14;
const SEZONY = { 12: "zima", 1: "zima", 2: "zima", 3: "wiosna", 4: "wiosna", 5: "wiosna", 6: "lato", 7: "lato", 8: "lato", 9: "jesien", 10: "jesien", 11: "jesien" };
const DODATKI = {
  terminy: "Nadchodzące terminy", obserwuje: "Obserwuję - sprawy w toku", raporty: "Półka raportów",
  wydarzenia: "Szkolenia i wydarzenia", historia: "Tego dnia w historii",
  sezon: "Sezon teraz", pytania: "Pytanie dnia - wszystkie", liczby: "Polska w liczbach",
  materialy: "Materiały do pobrania", powtorka: "Powtórka tygodnia", postep: "Mój postęp",
};

function dniDoTerminu(iso) {
  const dzis = new Date(new Date().toISOString().slice(0, 10));
  return Math.round((new Date(iso) - dzis) / DOBA_MS);
}

function odliczanie(iso) {
  const n = dniDoTerminu(iso);
  if (n < 0) {
    return "minęło";
  }
  if (n === 0) {
    return "dziś";
  }
  return n === 1 ? "jutro" : `za ${n} dni`;
}

function wszystkieTerminy(d) {
  const moje = czytaj(KLUCZ_MOJE_TERMINY, []).map((t, i) => ({ ...t, moj: i }));
  return [...(d.terminy || []), ...moje].filter((t) => dniDoTerminu(t.data) >= 0).sort((a, b) => a.data.localeCompare(b.data));
}

function pytanieDnia(d) {
  const lista = d.pytania || [];
  if (!lista.length) {
    return "";
  }
  const dzien = Math.floor(Date.now() / DOBA_MS);
  const q = lista[dzien % lista.length];
  return `<details class="wd-pyt"><summary><span class="wd-kicker">Pytanie dnia</span><span class="wd-tyt">${tekst(q.p)}</span><span class="wd-meta">Stuknij, żeby zobaczyć odpowiedź</span></summary><p>${pogrubLiczby(tekst(q.o))}</p><a class="wd-link" href="#/wiadomosci/x/pytania">Wszystkie pytania ›</a></details>`;
}

function wierszTerminu(t, otwarty) {
  return `<details class="wd-termin-d"${otwarty ? " open" : ""}><summary class="wd-termin"><span class="wd-odlicz">${odliczanie(t.data)}</span><div><p class="wd-tyt">${tekst(t.tytul)}${t.moj !== undefined ? ' <span class="wd-etyk">MÓJ</span>' : ""}</p>
    <p class="wd-meta">${dataPL(t.data)}${t.opis || t.wiecej ? " · stuknij, żeby rozwinąć" : ""}</p></div></summary>
    <div class="wd-rozw">${t.opis ? `<p>${pogrubLiczby(tekst(t.opis))}</p>` : ""}${t.wiecej ? `<p>${pogrubLiczby(tekst(t.wiecej))}</p>` : ""}${linkiZrodel(t.zrodla)}
    ${t.moj !== undefined ? `<button class="wd-link" onclick="usunMojTermin(${t.moj})">Usuń</button>` : ""}</div></details>`;
}

function blokSezonu(d, pelny) {
  const klucz = SEZONY[new Date().getMonth() + 1];
  const s = (d.sezon || {})[klucz];
  if (!s) {
    return "";
  }
  const ile = pelny ? 99 : 2;
  return `<div class="wd-sezon"><span class="wd-kicker">Sezon teraz</span><p class="wd-tyt">${tekst(s.nazwa)}</p>
    <p class="wd-meta">Dla strażaka</p><ul>${s.strazak.slice(0, ile).map((x) => `<li>${tekst(x)}</li>`).join("")}</ul>
    <p class="wd-meta">Dla każdego</p><ul>${s.cywil.slice(0, ile).map((x) => `<li>${tekst(x)}</li>`).join("")}</ul>
    ${(s.tipy || []).length ? `<p class="wd-meta">Dobre praktyki i tipy</p><ul class="wd-tip">${s.tipy.slice(0, ile).map((x) => `<li>${tekst(x)}</li>`).join("")}</ul>` : ""}
    ${(s.wnioski || []).length ? `<p class="wd-meta">Wniosek</p><p class="wd-wn-mini">${tekst(s.wnioski[0])}</p>` : ""}
    ${pelny ? "" : `<a class="wd-link" href="#/wiadomosci/x/sezon">Cały sezon i inne pory roku ›</a>`}</div>`;
}

// Tego dnia: dokładna rocznica albo najbliższa w ciągu 14 dni
function tegoDnia(d) {
  const lista = d.historia || [];
  const dzis = new Date();
  const rok = dzis.getFullYear();
  const z = lista.map((h) => {
    let data = new Date(`${rok}-${h.d}`);
    if (data < new Date(dzis.toISOString().slice(0, 10))) {
      data = new Date(`${rok + 1}-${h.d}`);
    }
    return { ...h, za: Math.round((data - new Date(dzis.toISOString().slice(0, 10))) / DOBA_MS) };
  }).filter((h) => h.za <= DNI_HISTORII).sort((a, b) => a.za - b.za);
  if (!z.length) {
    return "";
  }
  const h = z[0];
  const kiedy = h.za === 0 ? "Dziś rocznica" : `Za ${h.za} dni rocznica`;
  return `<div class="wd-hist"><span class="wd-kicker">Tego dnia · ${kiedy}</span>${elementHistorii(h)}
    <a class="wd-link" href="#/wiadomosci/x/historia">Kalendarz historii ›</a></div>`;
}

function elementHistorii(h) {
  return `<details class="wd-hist-d"><summary><p class="wd-tyt">${h.d.split("-").reverse().join(".")}.${h.rok} - ${tekst(h.tytul)}</p><p>${tekst(h.tekst)}</p><p class="wd-meta">Stuknij - więcej i dłuższy artykuł</p></summary>
    <div class="wd-rozw">${h.wiecej ? `<p>${tekst(h.wiecej)}</p>` : ""}${h.link ? `<a class="wd-analiza" href="${h.link}" target="_blank" rel="noopener">Czytaj dłuższy artykuł - ${tekst(h.link_nazwa || "źródło")} ›</a>` : ""}</div></details>`;
}

function dodatkiGora(d) {
  const terminy = wszystkieTerminy(d).slice(0, 3);
  return `${terminy.length ? `<div class="wd-sekcja" id="wd-s-terminy"><a class="wd-sek-nag" href="#/wiadomosci/x/terminy">Nadchodzące terminy ›</a>${terminy.map((t) => wierszTerminu(t, false)).join("")}</div>` : ""}
    <div class="wd-sekcja" id="wd-s-sezon">${blokSezonu(d, false)}</div><div class="wd-sekcja" id="wd-s-historia">${tegoDnia(d)}</div>`;
}

function blokObserwuje(d, ile) {
  const lista = d.obserwuje || [];
  if (!lista.length) {
    return "";
  }
  return `<div class="wd-sekcja" id="wd-s-obserwuje"><a class="wd-sek-nag" href="#/wiadomosci/x/obserwuje">Obserwuję - sprawy w toku ›</a>${lista.slice(0, ile).map(elementObserwuj).join("")}</div>`;
}

function elementObserwuj(o) {
  const id = idElementu("obserwuje", o);
  return `<div class="wd-el"><p class="wd-tyt">${tekst(o.tytul)}</p><p>${tekst(o.stan)}</p><p class="wd-meta">Ostatnia informacja: ${dataPL(o.ostatnio)}</p>${linkiZrodel(o.zrodla)}<div class="wd-akcje">${przyciskWazne(id, "obserwuje")}</div></div>`;
}

function elementRaportu(r) {
  return `<div class="wd-el"><p class="wd-tyt">${tekst(r.tytul)}</p><p class="wd-meta">${tekst(r.wydawca)}</p>
    <ol class="wd-wnioski">${r.wnioski.map((w) => `<li>${tekst(w)}</li>`).join("")}</ol><a class="wd-link" href="${r.link}" target="_blank" rel="noopener">Czytaj raport ›</a></div>`;
}

function elementDlaKazdego(k, i, gw) {
  return `<div class="wd-el"><p class="wd-tyt">${tekst(k.tytul)}</p><p class="wd-ramka">${tekst(k.tekst)}</p>
    <div class="wd-akcje"><button class="wd-gw" onclick="kopiujTekstKlienta(${i}, this)">Kopiuj</button><button class="wd-gw" onclick="udostepnij(${JSON.stringify(k.tytul).replace(/"/g, "&quot;")}, ${JSON.stringify(k.tekst).replace(/"/g, "&quot;")})">Wyślij</button>${gw || ""}</div></div>`;
}

async function kopiujTekstKlienta(i, przycisk) {
  try {
    await navigator.clipboard.writeText(WIADOMOSCI.dla_kazdego[i].tekst);
    przycisk.textContent = "Skopiowano ✓";
  } catch (e) {
    przycisk.textContent = "Nie udało się";
  }
}

function dodatkiDol(d) {
  const r = d.raporty || [], m = d.materialy || [];
  return `${m.length ? `<div class="wd-sekcja" id="wd-s-materialy"><a class="wd-sek-nag" href="#/wiadomosci/x/materialy">Materiały do pobrania ›</a>${m.slice(0, 2).map(elementMaterialu).join("")}</div>` : ""}
    ${r.length ? `<div class="wd-sekcja" id="wd-s-raporty"><a class="wd-sek-nag" href="#/wiadomosci/x/raporty">Półka raportów ›</a>${r.slice(0, 2).map(elementRaportu).join("")}</div>` : ""}
    ${blokWiecej(d)}`;
}

function elementWydarzenia(w) {
  return `<div class="wd-el"><p class="wd-tyt">${tekst(w.tytul)}</p><p class="wd-meta">${dataPL(w.data)} · ${odliczanie(w.data)}</p><p>${tekst(w.opis)}</p><a class="wd-link" href="${w.link}" target="_blank" rel="noopener">Szczegóły ›</a></div>`;
}

function dodajMojTermin() {
  const data = document.getElementById("mt-data").value;
  const tytul = document.getElementById("mt-tytul").value.trim();
  if (!data || !tytul) {
    alert("Wpisz datę i opis.");
    return;
  }
  const lista = czytaj(KLUCZ_MOJE_TERMINY, []);
  lista.push({ data, tytul });
  zapisz(KLUCZ_MOJE_TERMINY, lista);
  widokDodatku("terminy");
}

function usunMojTermin(i) {
  const lista = czytaj(KLUCZ_MOJE_TERMINY, []);
  lista.splice(i, 1);
  zapisz(KLUCZ_MOJE_TERMINY, lista);
  widokDodatku("terminy");
}

async function widokDodatku(klucz) {
  const d = await wczytajWiadomosci();
  if (!DODATKI[klucz]) {
    location.hash = "#/wiadomosci";
    return;
  }
  ustawNaglowek(DODATKI[klucz], "#/wiadomosci");
  ustawZakladke("wiadomosci");
  const tresc = {
    terminy: () => `<div class="wd-sekcja">${wszystkieTerminy(d).map((t) => wierszTerminu(t, true)).join("")}</div>
      <div class="wd-sekcja"><span class="wd-sek-nag">Dodaj swój termin</span>
      <p class="wd-meta">Zostaje tylko w tym telefonie, np. ważność uprawnień, przegląd u klienta.</p>
      <input id="mt-data" class="wd-pole" type="date"><input id="mt-tytul" class="wd-pole" placeholder="Co? np. szkolenie aktualizujące">
      <button class="c-dalej wd-btn" onclick="dodajMojTermin()">Dodaj termin</button></div>`,
    obserwuje: () => `<div class="wd-sekcja">${(d.obserwuje || []).map(elementObserwuj).join("")}</div>`,
    raporty: () => `<div class="wd-sekcja">${(d.raporty || []).map(elementRaportu).join("")}</div>`,
    wydarzenia: () => `<div class="wd-sekcja">${(d.wydarzenia_branzowe || []).map(elementWydarzenia).join("")}
      <span class="wd-sek-nag">Gdzie sprawdzać kolejne</span>${(d.wydarzenia_gdzie_szukac || []).map(([n, u]) => `<p><a href="${u}" target="_blank" rel="noopener">${tekst(n)} ›</a></p>`).join("")}</div>`,
    historia: () => `<div class="wd-sekcja">${(d.historia || []).map((h) => `<div class="wd-el">${elementHistorii(h)}</div>`).join("")}</div>`,
    liczby: () => `<div class="wd-sekcja">${(d.liczby || []).map(elementLiczb).join("")}</div>`,
    materialy: () => `<div class="wd-sekcja">${(d.materialy || []).map(elementMaterialu).join("")}</div>`,
    powtorka: () => widokPowtorki(d),
    postep: () => widokPostepu(d),
    sezon: () => `<div class="wd-sekcja">${blokSezonu(d, true)}</div>` + Object.entries(d.sezon || {}).filter(([k]) => k !== SEZONY[new Date().getMonth() + 1]).map(([, s]) =>
      `<div class="wd-sekcja"><div class="wd-sezon"><p class="wd-tyt">${tekst(s.nazwa)}</p><ul>${[...s.strazak, ...s.cywil].map((x) => `<li>${tekst(x)}</li>`).join("")}</ul></div></div>`).join(""),
    pytania: () => `<div class="wd-sekcja">${(d.pytania || []).map((q) => `<details class="wd-pyt"><summary><span class="wd-tyt">${tekst(q.p)}</span></summary><p>${pogrubLiczby(tekst(q.o))}</p></details>`).join("")}</div>`,
  };
  widok.innerHTML = tresc[klucz]();
}


// ── Pasek zakładek sekcji (na górze, przyklejony przy przewijaniu) ──
// Kolejność = kolejność na stronie. Zakładka pokazuje się tylko, gdy sekcja ma treść.
const PASEK_SEKCJI = [
  ["najnowsze", "Najnowsze", () => true],
  ["dzis", "Dziś w 5 min", () => true],
  ["wydarzenia", "Wydarzenia", (d) => (d.wydarzenia || []).length],
  ["akcja", "Akcja miesiąca", (d) => d.akcja_miesiaca],
  ["przeglad", "Przegląd PSP", (d) => (d.przeglad_pigulka || []).length],
  ["terminy", "Terminy", (d) => wszystkieTerminy(d).length],
  ["sezon", "Sezon", (d) => d.sezon],
  ["historia", "Tego dnia", (d) => (d.historia || []).length],
  ["liczby", "Liczby", (d) => (d.liczby || []).length],
  ["tematy", "Tematy", (d) => (d.wydarzenia || []).some((w) => (w.tematy || []).length)],
  ["obserwuje", "Obserwuję", (d) => (d.obserwuje || []).length],
  ["faktmit", "Fakt czy mit", (d) => (d.faktmit || []).length],
  ["tipy", "Tipy i triki", (d) => (d.tipy || []).length],
  ["baterie", "Baterie i EV", (d) => (d.baterie || []).length],
  ["przepisy", "Przepisy", (d) => (d.przepisy || []).length],
  ["wyroki", "Wyroki", (d) => (d.wyroki || []).length],
  ["czywiesz", "Czy wiesz", (d) => (d.czywiesz || []).length],
  ["dla_kazdego", "Dla każdego", (d) => (d.dla_kazdego || []).length],
  ["materialy", "Materiały", (d) => (d.materialy || []).length],
  ["raporty", "Raporty", (d) => (d.raporty || []).length],
  ["wiecej", "Więcej", () => true],
  ["zrodla", "Źródła", () => true],
];

function paskiSekcji(d) {
  return `<nav class="wd-nav">${PASEK_SEKCJI.filter(([, , jest]) => jest(d)).map(([id, nazwa]) =>
    `<button class="wd-nav-b" onclick="przewinDoSekcji('${id}')">${nazwa}</button>`).join("")}
    <a class="wd-nav-b wd-nav-moje" href="#/wiadomosci/wazne">★ Ważne</a>
    <a class="wd-nav-b wd-nav-baza" href="#/wiadomosci/baza">Baza wiedzy</a></nav>`;
}

function przewinDoSekcji(id) {
  const el = document.getElementById(`wd-s-${id}`);
  if (!el) {
    return;
  }
  const naglowek = document.querySelector(".nav-header");
  const odstep = (naglowek ? naglowek.offsetHeight : 0) + 8;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - odstep, behavior: "smooth" });
}


// ── Dziś w 5 minut: najważniejsze na dziś + czytanie na głos + postęp ──

const KLUCZ_DNI = "insp-wiad-dni";
const KLUCZ_ODPOWIEDZI = "insp-wiad-odp";
const PYTAN_W_POWTORCE = 5;
const DNI_POWTORKI = 7;
const NIEDZIELA = 0;

function dzisIsoWiad() {
  return new Date().toISOString().slice(0, 10);
}

function zapiszOdwiedziny() {
  const dni = czytaj(KLUCZ_DNI, []);
  const dzis = dzisIsoWiad();
  if (!dni.includes(dzis)) {
    dni.push(dzis);
    zapisz(KLUCZ_DNI, dni.slice(-400));
  }
}

// Ile dni z rzędu (do dziś) zaglądałeś do Wiadomości
function seriaDni() {
  const dni = new Set(czytaj(KLUCZ_DNI, []));
  let n = 0;
  const d = new Date();
  while (dni.has(d.toISOString().slice(0, 10))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function idPytania(q) {
  return idElementu("pytania", { tekst: q.p });
}

function pytanieNaDzis(d) {
  const lista = d.pytania || [];
  return lista.length ? lista[Math.floor(Date.now() / DOBA_MS) % lista.length] : null;
}

function tipNaDzis(d) {
  const lista = d.tipy || [];
  return lista.length ? lista[(Math.floor(Date.now() / DOBA_MS) + 3) % lista.length] : null;
}

function dzisW5Minut(d, zbior) {
  const nowe = (d.wydarzenia || []).filter((w) => !zbior.has(w.id)).slice(0, 2);
  const wyd = nowe.length ? nowe : (d.wydarzenia || []).slice(0, 2);
  const q = pytanieNaDzis(d);
  const tip = tipNaDzis(d);
  const termin = wszystkieTerminy(d)[0];
  const odp = czytaj(KLUCZ_ODPOWIEDZI, {});
  const niedziela = new Date().getDay() === NIEDZIELA;
  return `<div class="wd-dzis" id="wd-s-dzis">
    <div class="wd-dzis-nag"><span class="wd-kicker">Dziś w 5 minut</span><button class="wd-gw" id="wd-sluchaj" onclick="czytajDzis()">▶ Posłuchaj</button></div>
    ${wyd.map((w) => `<a class="wd-dzis-w" href="#/wiadomosci/w/${w.id}"><b>${tekst(w.tytul)}</b><span>${tekst(w.zajawka)}</span></a>`).join("")}
    ${q ? `<details class="wd-pyt wd-pyt-dzis"><summary><span class="wd-kicker">Pytanie dnia</span><span class="wd-tyt">${tekst(q.p)}</span><span class="wd-meta">Stuknij, żeby zobaczyć odpowiedź</span></summary>
      <p>${pogrubLiczby(tekst(q.o))}</p>${przyciskiOdpowiedzi(q, odp)}</details>` : ""}
    ${tip ? `<p class="wd-dzis-tip"><b>Tip dnia:</b> ${tekst(tip.tytul)} - ${tekst(tip.tresc)}</p>` : ""}
    ${termin ? `<p class="wd-dzis-tip"><b>Najbliższy termin:</b> ${tekst(termin.tytul)} - ${odliczanie(termin.data)}</p>` : ""}
    <div class="wd-dzis-dol"><a class="wd-link" href="#/wiadomosci/x/postep">Twoja seria: ${seriaDni()} ${seriaDni() === 1 ? "dzień" : "dni"} z rzędu ›</a>
      <a class="wd-link${niedziela ? " wd-mocno" : ""}" href="#/wiadomosci/x/powtorka">${niedziela ? "Dziś niedziela - powtórka tygodnia ›" : "Powtórka tygodnia ›"}</a></div></div>`;
}

function przyciskiOdpowiedzi(q, odp) {
  const id = idPytania(q);
  const stan = odp[id];
  return `<div class="wd-akcje" data-pyt="${id}"><button class="wd-gw${stan === true ? " on" : ""}" onclick="zapiszOdpowiedzWiad('${id}', true, this)">Wiedziałem</button>
    <button class="wd-gw${stan === false ? " on" : ""}" onclick="zapiszOdpowiedzWiad('${id}', false, this)">Nie wiedziałem</button></div>`;
}

function zapiszOdpowiedzWiad(id, wiedzialem, przycisk) {
  const odp = czytaj(KLUCZ_ODPOWIEDZI, {});
  odp[id] = wiedzialem;
  zapisz(KLUCZ_ODPOWIEDZI, odp);
  przycisk.parentNode.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
  przycisk.classList.add("on");
}

// Czytanie na głos (głos systemowy telefonu, po polsku)
function czytajNaGlos(tresc, przycisk) {
  if (!("speechSynthesis" in window)) {
    alert("Ta przeglądarka nie umie czytać na głos.");
    return;
  }
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    przycisk.textContent = "▶ Posłuchaj";
    return;
  }
  const u = new SpeechSynthesisUtterance(tresc);
  u.lang = "pl-PL";
  const glos = speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith("pl"));
  if (glos) {
    u.voice = glos;
  }
  u.onend = () => (przycisk.textContent = "▶ Posłuchaj");
  przycisk.textContent = "■ Zatrzymaj";
  speechSynthesis.speak(u);
}

function czytajDzis() {
  const d = WIADOMOSCI;
  const zbior = przeczytane();
  const nowe = (d.wydarzenia || []).filter((w) => !zbior.has(w.id)).slice(0, 2);
  const wyd = nowe.length ? nowe : (d.wydarzenia || []).slice(0, 2);
  const q = pytanieNaDzis(d), tip = tipNaDzis(d), termin = wszystkieTerminy(d)[0];
  const czesci = ["Dziś w pięć minut."];
  wyd.forEach((w) => czesci.push(`${w.tytul}. ${w.zajawka} Wniosek: ${w.wniosek || ""}`));
  if (tip) {
    czesci.push(`Tip dnia: ${tip.tytul}. ${tip.tresc}`);
  }
  if (termin) {
    czesci.push(`Najbliższy termin: ${termin.tytul}, ${odliczanie(termin.data)}.`);
  }
  if (q) {
    czesci.push(`Pytanie dnia: ${q.p} Odpowiedź: ${q.o}`);
  }
  czytajNaGlos(czesci.join(" "), document.getElementById("wd-sluchaj"));
}

function czytajWiadomosc(id, przycisk) {
  const w = (WIADOMOSCI.wydarzenia || []).find((x) => x.id === id);
  if (!w) {
    return;
  }
  czytajNaGlos([w.tytul, w.zajawka, ...w.tresc, w.wniosek ? `Wniosek: ${w.wniosek}` : "", w.praktyka ? `Dobra praktyka: ${w.praktyka}` : ""].join(" "), przycisk);
}

// ── Akcja miesiąca ──

function blokAkcjiMiesiaca(d) {
  const a = d.akcja_miesiaca;
  const w = a && (d.wydarzenia || []).find((x) => x.id === a.id);
  if (!w) {
    return "";
  }
  return `<div class="wd-sekcja" id="wd-s-akcja"><span class="wd-sek-nag">Akcja miesiąca - ${tekst(a.miesiac)}</span>
    <a class="wd-zaj" href="#/wiadomosci/w/${w.id}"><span class="wd-kicker">${tekst(w.naglowek || "")}</span><span class="wd-tyt">${tekst(w.tytul)}</span>
    <span class="wd-lead-m">${tekst(a.analiza[0])}</span><span class="wd-link">Czytaj omówienie ›</span></a></div>`;
}

function analizaAkcjiMiesiaca(w) {
  const a = WIADOMOSCI.akcja_miesiaca;
  if (!a || a.id !== w.id) {
    return "";
  }
  return `<div class="wd-am"><span class="wd-kicker">Akcja miesiąca - omówienie</span>${a.analiza.map((t) => `<p>${pogrubLiczby(tekst(t))}</p>`).join("")}
    <p class="wd-meta">Wnioski</p><ol class="wd-wnioski">${a.wnioski.map((t) => `<li>${tekst(t)}</li>`).join("")}</ol>${linkiZrodel(a.zrodla)}</div>`;
}

// ── Polska w liczbach ──

function elementLiczb(l) {
  return `<div class="wd-el"><p class="wd-tyt">${tekst(l.tytul)}</p><p class="wd-meta">${tekst(l.okres)}</p>
    <div class="wd-liczby">${l.liczby.map(([v, o]) => `<div class="wd-liczba"><b>${tekst(v)}</b><span>${tekst(o)}</span></div>`).join("")}</div>
    ${l.komentarz ? `<p>${tekst(l.komentarz)}</p>` : ""}${linkiZrodel(l.zrodla)}</div>`;
}

function blokLiczb(d) {
  const l = d.liczby || [];
  if (!l.length) {
    return "";
  }
  return `<div class="wd-sekcja" id="wd-s-liczby"><a class="wd-sek-nag" href="#/wiadomosci/x/liczby">Polska w liczbach ›</a>${elementLiczb(l[0])}</div>`;
}

// ── Materiały do pobrania ──

function elementMaterialu(m) {
  return `<a class="wd-zr" href="${m.link}" target="_blank" rel="noopener"><span class="wd-tyt">${tekst(m.tytul)}</span><span>${tekst(m.opis)}</span><span class="wd-meta">${tekst(m.wydawca)} ›</span></a>`;
}

// ── Więcej: nowości, badania, szkolenia (zwinięte) ──

function blokWiecej(d) {
  const czesci = [
    ["Nowości: sprzęt i technologie", (d.nowosci || []).map((x) => elementSekcji("nowosci", x)).join("")],
    ["Badania i ciekawostki", (d.badania || []).map((x) => elementSekcji("badania", x)).join("")],
    ["Szkolenia i wydarzenia", (d.wydarzenia_branzowe || []).map(elementWydarzenia).join("") + `<p class="wd-meta">Kolejne terminy: ${(d.wydarzenia_gdzie_szukac || []).map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${tekst(n)}</a>`).join(" · ")}</p>`],
  ].filter(([, html]) => html);
  return `<div class="wd-sekcja" id="wd-s-wiecej"><span class="wd-sek-nag">Więcej</span>
    ${czesci.map(([nazwa, html]) => `<details class="wd-wiecej-d"><summary>${nazwa}</summary>${html}</details>`).join("")}</div>`;
}

// ── Powtórka tygodnia i postęp ──

function widokPowtorki(d) {
  const tydzien = Math.floor(Date.now() / (DOBA_MS * DNI_POWTORKI));
  const granica = new Date(Date.now() - DNI_POWTORKI * DOBA_MS).toISOString().slice(0, 10);
  let lista = (d.pytania || []).filter((q) => (q.data || "") >= granica);
  if (lista.length < PYTAN_W_POWTORCE) {
    lista = d.pytania || [];
  }
  const start = (tydzien * PYTAN_W_POWTORCE) % Math.max(lista.length, 1);
  const wybrane = [...lista.slice(start), ...lista.slice(0, start)].slice(0, PYTAN_W_POWTORCE);
  const odp = czytaj(KLUCZ_ODPOWIEDZI, {});
  return `<div class="section-header"><div class="section-sub">${tekst("5 pytań z ostatnich wiadomości. Odpowiedz w myślach, stuknij, sprawdź i zaznacz uczciwie, czy wiedziałeś.")}</div></div>
    <div class="wd-sekcja">${wybrane.map((q, i) => `<details class="wd-pyt"><summary><span class="wd-kicker">Pytanie ${i + 1} z ${wybrane.length}</span><span class="wd-tyt">${tekst(q.p)}</span></summary>
    <p>${pogrubLiczby(tekst(q.o))}</p>${przyciskiOdpowiedzi(q, odp)}</details>`).join("")}</div>
    <div class="c-dol"><a class="c-dalej" href="#/wiadomosci/x/postep">Zobacz swój postęp ›</a></div>`;
}

function widokPostepu(d) {
  const odp = czytaj(KLUCZ_ODPOWIEDZI, {});
  const wszystkie = Object.values(odp);
  const dobre = wszystkie.filter(Boolean).length;
  const dni = czytaj(KLUCZ_DNI, []);
  const doPowtorki = (d.pytania || []).filter((q) => odp[idPytania(q)] === false);
  return `<div class="wd-sekcja"><div class="wd-liczby">
      <div class="wd-liczba"><b>${seriaDni()}</b><span>dni z rzędu</span></div>
      <div class="wd-liczba"><b>${dni.length}</b><span>dni z wiadomościami</span></div>
      <div class="wd-liczba"><b>${dobre}/${wszystkie.length}</b><span>pytań - wiedziałeś</span></div>
      <div class="wd-liczba"><b>${Object.keys(czytaj(KLUCZ_WAZNE, {})).length}</b><span>zapisanych jako ważne</span></div></div></div>
    ${doPowtorki.length ? `<div class="wd-sekcja"><span class="wd-sek-nag">Do powtórki - tych nie wiedziałeś</span>${doPowtorki.map((q) => `<details class="wd-pyt"><summary><span class="wd-tyt">${tekst(q.p)}</span></summary><p>${pogrubLiczby(tekst(q.o))}</p>${przyciskiOdpowiedzi(q, odp)}</details>`).join("")}</div>` : ""}
    <p class="wd-meta wd-pad">Postęp zapisuje się tylko w tym telefonie.</p>`;
}


// ── Najnowsze z kanałów: surowe nagłówki RSS zbierane codziennie ok. 6:00 przez GitHub Actions (bez AI) ──

const ADRES_RSS = "https://raw.githubusercontent.com/tomasz66/ppoz-wiadomosci/main/rss.json";
const NAJNOWSZYCH_NA_START = 8;
let RSS_WPISY = null;

async function wczytajRss() {
  if (RSS_WPISY) {
    return RSS_WPISY;
  }
  try {
    const odp = await fetch(ADRES_RSS, { cache: "no-cache" });
    RSS_WPISY = odp.ok ? await odp.json() : { wpisy: [] };
  } catch (e) {
    RSS_WPISY = { wpisy: [] };
  }
  return RSS_WPISY;
}

// „2 godz. temu”, „wczoraj 14:05”
function kiedyWpis(iso) {
  const t = new Date(iso);
  const minut = Math.round((Date.now() - t) / 60000);
  if (minut < 60) {
    return `${Math.max(minut, 1)} min temu`;
  }
  if (minut < 24 * 60) {
    return `${Math.round(minut / 60)} godz. temu`;
  }
  return `${t.toLocaleDateString("pl-PL", { day: "numeric", month: "numeric" })} ${t.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`;
}

function wierszRss(w) {
  const obcy = w.kraj !== "PL" ? ` <span class="wd-etyk">${w.kraj === "DE" ? "DE" : w.kraj === "NL" ? "NL" : "ANG"}</span>` : "";
  return `<a class="wd-rss" href="${w.link}" target="_blank" rel="noopener">
    <span class="wd-meta">${tekst(w.zrodlo)} · ${kiedyWpis(w.data)}${obcy}</span>
    <span class="wd-tyt">${tekst(w.tytul)}</span>${w.opis ? `<span class="wd-lead-m">${tekst(w.opis)}</span>` : ""}</a>`;
}

async function pokazNajnowsze() {
  const miejsce = document.getElementById("wd-najnowsze");
  if (!miejsce) {
    return;
  }
  const r = await wczytajRss();
  const lista = r.wpisy || [];
  if (!lista.length) {
    miejsce.innerHTML = "";
    return;
  }
  miejsce.innerHTML = `<div class="wd-sekcja" id="wd-s-najnowsze"><span class="wd-sek-nag">Najnowsze z kanałów</span>
    <p class="wd-meta">Nagłówki z ${new Set(lista.map((w) => w.zrodlo)).size} źródeł, zebrane ${kiedyWpis(r.aktualizacja)}. Kliknięcie otwiera artykuł u źródła.</p>
    <div id="wd-rss-lista">${lista.slice(0, NAJNOWSZYCH_NA_START).map(wierszRss).join("")}</div>
    ${lista.length > NAJNOWSZYCH_NA_START ? `<button class="wd-wiecej wd-btn-plain" onclick="document.getElementById('wd-rss-lista').innerHTML=RSS_WPISY.wpisy.map(wierszRss).join('');this.remove()">Pokaż wszystkie (${lista.length})</button>` : ""}</div>`;
}


// ── Baza wiedzy: bieżące wpisy + archiwum (starsze wpisy przenoszone przez automat, nic nie ginie) ──

const ADRES_ARCHIWUM = "https://raw.githubusercontent.com/tomasz66/ppoz-wiadomosci/main/archiwum.json";
let ARCHIWUM = null;

const RODZAJE_BAZY = [
  ["wydarzenia", "Wydarzenia"], ["tipy", "Tipy i triki"], ["czywiesz", "Czy wiesz"], ["pytania", "Pytania"],
  ["faktmit", "Fakt czy mit"], ["baterie", "Baterie i EV"], ["przepisy", "Przepisy"], ["wyroki", "Wyroki"],
  ["nowosci", "Nowości"], ["badania", "Badania"], ["obserwuje", "Sprawy"], ["terminy", "Terminy"],
  ["przeglad_pigulka", "Przegląd PSP"],
];

async function wczytajArchiwum() {
  if (ARCHIWUM) {
    return ARCHIWUM;
  }
  try {
    const odp = await fetch(ADRES_ARCHIWUM, { cache: "no-cache" });
    ARCHIWUM = odp.ok ? await odp.json() : {};
  } catch (e) {
    ARCHIWUM = {};
  }
  return ARCHIWUM;
}

// Wpisy jednego rodzaju: bieżące + archiwalne, bez powtórzeń
function wpisyBazy(d, arch, klucz) {
  const klucz1 = (x) => x.id || x.tytul || x.twierdzenie || x.tekst || x.p || x.sygn || JSON.stringify(x);
  const widziane = new Set();
  return [...(d[klucz] || []), ...(arch[klucz] || [])].filter((x) => {
    const k = klucz1(x);
    if (widziane.has(k)) {
      return false;
    }
    widziane.add(k);
    return true;
  });
}

function elementBazy(klucz, x) {
  if (klucz === "wydarzenia") {
    return zajawka(x, przeczytane());
  }
  if (klucz === "pytania") {
    return `<details class="wd-pyt"><summary><span class="wd-tyt">${tekst(x.p)}</span>${x.data ? `<span class="wd-meta">${dataPL(x.data)}</span>` : ""}</summary><p>${pogrubLiczby(tekst(x.o))}</p></details>`;
  }
  if (klucz === "terminy") {
    return wierszTerminu(x, false);
  }
  if (klucz === "obserwuje") {
    return elementObserwuj(x);
  }
  if (klucz === "przeglad_pigulka") {
    return elementPrzegladu(x);
  }
  return elementSekcji(klucz, x);
}

let FILTR_BAZY = "";
let FRAZA_BAZY = "";

async function widokBazy() {
  ustawNaglowek("Baza wiedzy", "#/wiadomosci");
  ustawZakladke("wiadomosci");
  const d = await wczytajWiadomosci();
  const arch = await wczytajArchiwum();
  const ile = RODZAJE_BAZY.map(([k, n]) => [k, n, wpisyBazy(d, arch, k).length]).filter(([, , n]) => n);
  const razem = ile.reduce((a, [, , n]) => a + n, 0);
  widok.innerHTML = `<div class="section-header"><div class="section-sub">${tekst(`Wszystko, co pojawiło się w Wiadomościach - także starsze wpisy. Baza rośnie każdego dnia. Razem: ${razem}.`)}</div></div>
    <div class="wd-szukaj"><input type="search" placeholder="Szukaj w bazie wiedzy…" value="${esc(FRAZA_BAZY)}" oninput="FRAZA_BAZY=this.value;rysujBaze()"></div>
    <div class="wd-nav">${[["", "Wszystko", razem], ...ile].map(([k, n, c]) => `<button class="wd-nav-b${FILTR_BAZY === k ? " wd-nav-on" : ""}" onclick="FILTR_BAZY='${k}';widokBazy()">${n} <small>${c}</small></button>`).join("")}</div>
    <div id="wd-baza-lista"></div>`;
  rysujBaze();
}

function rysujBaze() {
  const d = WIADOMOSCI || {}, arch = ARCHIWUM || {};
  const q = bezOgonkow(FRAZA_BAZY.trim());
  const rodzaje = RODZAJE_BAZY.filter(([k]) => !FILTR_BAZY || k === FILTR_BAZY);
  const html = rodzaje.map(([k, nazwa]) => {
    const lista = wpisyBazy(d, arch, k).filter((x) => q.length < 2 || bezOgonkow(JSON.stringify(x)).includes(q));
    if (!lista.length) {
      return "";
    }
    return `<div class="wd-sekcja"><span class="wd-sek-nag">${nazwa} <small class="wd-meta">${lista.length}</small></span>${lista.map((x) => elementBazy(k, x)).join("")}</div>`;
  }).join("");
  document.getElementById("wd-baza-lista").innerHTML = html || `<p class="wd-meta wd-pad">Nic nie znaleziono.</p>`;
}


// ── Przegląd Pożarniczy w pigułce: streszczenia najciekawszych artykułów miesięcznika PSP ──

function elementPrzegladu(n) {
  return `<div class="wd-el"><p class="wd-tyt">Numer ${tekst(n.numer)}</p>
    ${n.artykuly.map((a) => `<div class="wd-pp"><a class="wd-tyt" href="${a.link}" target="_blank" rel="noopener">${tekst(a.tytul)} ›</a>
      ${a.autor ? `<p class="wd-meta">${tekst(a.autor)}</p>` : ""}<p>${pogrubLiczby(tekst(a.streszczenie))}</p>
      <p class="wd-wn-mini"><b>Wniosek:</b> ${tekst(a.wniosek)}</p></div>`).join("")}
    <p class="wd-meta">Streszczenia własnymi słowami - pełne artykuły na ppoz.pl. <a href="${n.link}" target="_blank" rel="noopener">Cały numer ›</a></p></div>`;
}

function blokPrzegladu(d) {
  const lista = d.przeglad_pigulka || [];
  if (!lista.length) {
    return "";
  }
  return `<div class="wd-sekcja" id="wd-s-przeglad"><span class="wd-sek-nag">Przegląd Pożarniczy w pigułce</span>${elementPrzegladu(lista[0])}</div>`;
}
