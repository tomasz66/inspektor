// Układ aplikacji (8.11.2026): cztery zakładki - Praca, Wiedza, Szukaj, Przepisy. Każda rzecz ma jedno miejsce.
// Egzamin próbny, „O kursie” i ściąga A4 są schowane (dane zostają w bazie i w wyszukiwarce).
//
//   #/praca          obchód, analiza budynku, zasady, szybkie obliczenia
//   #/wiedza         5 działów + pytania z wyjaśnieniami + fiszki
//   #/wiedza/DZIAL   w jednym miejscu: lekcje, wyjaśnienia („Poszerz wiedzę”) i materiały z kursu
//   stare adresy (#/start, #/nauka, #/materialy, #/narzedzia, #/poszerz, #/kurs) przekierowują tutaj

// Wcześniej niż trasy z innych plików - te same adresy dostają nowy układ
TRASY.unshift(
  [/^#\/praca$/, () => widokPracy()],
  [/^#\/wiedza$/, () => widokWiedzy()],
  [/^#\/wiedza\/([\w-]+)$/, (m) => widokDzialuWiedzy(m[1])],
  [/^#\/(start|narzedzia)$/, () => location.replace("#/praca")],
  [/^#\/(nauka|materialy|poszerz|kurs|nauka\/sciaga|nauka\/egzamin)$/, () => location.replace("#/wiedza")],
  [/^#\/materialy\/dz-([\w-]+)$/, (m) => location.replace(`#/wiedza/${m[1]}`)],
);

// Tematy „Poszerz wiedzę” w działach wiedzy
const POSZERZ_W_DZIALACH = {
  inspektor: ["obowiazki-wlasciciela", "organizacja-ochrony", "ibp", "szkolenia", "normy", "zamienne", "mandaty", "kontrola-psp"],
  budynek: ["wysokosci", "zl", "klasy-strefy", "obciazenie", "materialy", "przejscia", "budynek-zagrazajacy", "oddymianie-drzwi", "hydranty", "drogi-pozarowe", "odleglosci", "znaki-oswietlenie", "garaze", "obchod"],
  instalacje: ["skroty-hydranty", "czujki-gdzie", "czujki-wyglad", "gasnice", "srodki-gasnicze", "sug", "elektryka-pwp", "fotowoltaika", "kominy", "kotlownie-gaz"],
  zagrozenia: ["fazy", "zjawiska", "strefy-ex", "dgw", "ladowanie", "prace-niebezpieczne", "butle-lpg", "stacje-paliw", "lasy-zniwa", "awarie-przemyslowe"],
  pozar: ["ewakuacja", "akcja-ratownicza", "przyczyny-pozarow"],
};

function dzialTematuPoszerz(id) {
  return Object.keys(POSZERZ_W_DZIALACH).find((d) => POSZERZ_W_DZIALACH[d].includes(id)) || "";
}

function dzialLekcji(id) {
  const d = DZIALY.find((x) => x.lekcje.includes(id));
  return d ? d.id : "";
}

// Strona główna - wariant A wybrany przez Tomka 17.11.2026: szukaj → hashtagi → w terenie → nauka.
// Wszystkie dawne odnośniki zostają (obchód, analiza, poradnik, 4 kalkulatory jako małe przyciski).
async function widokPracy() {
  await wczytajPytania();
  ustawNaglowek("Inspektor PPOŻ");
  ustawZakladke("praca");
  const k = (h, s, kolor, t, o) => wiersz(h, s, kolor, t, o);
  const kalk = [["#/narzedzia/osoby", "Ile osób i jakie drzwi"], ["#/narzedzia/obciazenie", "Ile palnych rzeczy"],
    ["#/narzedzia/odleglosci", "Odległość od sąsiada"], ["#/narzedzia/terminy", "Terminy przeglądów"]];
  widok.innerHTML = `
    ${poleSzukania("")}
    <div class="section-label">Najczęstsze tematy</div>${chmuraTagow()}${spisHasel()}
    <div class="section-label">W terenie</div>
    <div class="list-group">
      ${k("#/narzedzia/obchod", "OBCH", "#0e6655", "Obchód obiektu", "Lista kontrolna: co sprawdzić, jaka wartość, jaki przepis")}
      ${k("#/analiza", "LICZ", "#c0392b", "Analiza budynku", "Wymagania, ocena i gotowy tekst do tabeli analizy")}
      ${k("#/narzedzia/fotowoltaika", "PV", "#b7791f", "Fotowoltaika - ocena ryzyka", "Lista kontrolna wg poradnika CNBOP i wynik ryzyka")}
      ${k("#/poradnik", "JAK", "#2f5d8a", "Jak zrobić analizę", "Zasady do każdego budynku: jak liczyć i jakie przepisy")}
    </div>
    <div class="section-label">Szybkie obliczenia</div>
    <div class="tagi">${kalk.map(([h, t]) => `<a class="tag" href="${h}">${esc(t)}</a>`).join("")}</div>
    <div class="section-label">Nauka</div>
    <div class="list-group">
      ${k("#/pytania", "PYT", KOLORY.test, "Pytania egzaminacyjne", "648 pytań z wyjaśnieniami")}
      ${k("#/wiedza", "LEK", KOLORY.dzial, "Lekcje i wykłady", `17 lekcji · ${POSZERZ.length} tematów z przykładami`)}
      ${k("#/fiszki", "FISZ", KOLORY.fiszki, "Fiszki", "Pojęcia i skróty")}
      ${k("#/porownania", "≈", "#6b4fa0", "Liczby po ludzku", "Ciśnienie, wydajność, nacisk - przełożone na obrazy z życia")}
    </div>
    <div class="foot">${tekst("Przepisy z oficjalnej bazy Sejmu (ISAP). Aplikacja nie zastępuje oryginału - w razie wątpliwości otwórz link do ISAP.")}</div>`;
  podepnijSzukanie();
}

function widokWiedzy() {
  ustawNaglowek("Wiedza", "");
  ustawZakladke("wiedza");
  const pyt = wynikiPytan();
  const umiane = Object.values(pyt).filter((w) => w[2]).length;
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Baza wiedzy inspektora w pięciu działach. W każdym dziale: lekcje, wyjaśnienia z przykładami i materiały z kursu.")}</div></div>
    <div class="section-label">Działy</div>
    <div class="list-group">${DZIALY.map((d, i) => {
      const ileTem = d.lekcje.length + (POSZERZ_W_DZIALACH[d.id] || []).length + d.materialy.length;
      return wiersz(`#/wiedza/${d.id}`, `D${i + 1}`, KOLORY.dzial, d.nazwa, `${d.opis} · ${ile(ileTem, "temat", "tematy", "tematów")}`);
    }).join("")}</div>
    <div class="section-label">Utrwalanie</div>
    <div class="list-group">
      ${wiersz("#/pytania", "PYT", KOLORY.test, "Pytania z wyjaśnieniami", `648 pytań tematami, z wyjaśnieniem każdej odpowiedzi · umiesz ${umiane}`)}
      ${wiersz("#/pytania/t/t2026", "60", KOLORY.test, "Pytania inspektor ppoż. 2026", "Test z kursu, Częstochowa 2026 r.")}
      ${wiersz("#/fiszki", "FISZ", KOLORY.fiszki, "Fiszki", `Pojęcia i skróty jak słówka · opanowane ${opanowaneFiszki()}`)}
    </div>`;
}

function widokDzialuWiedzy(id) {
  const i = DZIALY.findIndex((d) => d.id === id);
  if (i < 0) {
    location.replace("#/wiedza");
    return;
  }
  const d = DZIALY[i];
  ustawNaglowek(d.nazwa, "#/wiedza");
  ustawZakladke("wiedza");
  const p = postepNauki();
  const lekcje = d.lekcje.map((x) => stan.kurs.bloki.find((b) => b.id === x)).filter(Boolean);
  const poszerz = (POSZERZ_W_DZIALACH[d.id] || []).map((x) => POSZERZ.find((t) => t.id === x)).filter(Boolean);
  const materialy = d.materialy.map((x) => stan.materialy.tematy.find((t) => t.id === x)).filter(Boolean);
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst(d.opis)}</div></div>
    <div class="section-label">Lekcje</div>
    <div class="dzial">${lekcje.map((b) => wierszLekcji(b, p)).join("")}</div>
    ${poszerz.length ? `<div class="section-label">Wyjaśnienia z przykładami</div>
    <div class="list-group">${poszerz.map((t) => wiersz(`#/poszerz/${t.id}`, t.skrot, "#2f5d8a", t.tytul, "")).join("")}</div>` : ""}
    <div class="section-label">Materiały z kursu</div>
    <div class="list-group">${materialy.map((t) => `<a class="row" href="#/m/${t.id}"><span class="row-main"><span class="row-title small">${tekst(t.tytul.replace(/^\d+\.\s*/, ""))}</span></span><span class="row-chev">›</span></a>`).join("")}</div>`;
}
