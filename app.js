// Inspektor PPOŻ - nauka na kurs inspektora ochrony przeciwpożarowej (CS PSP Częstochowa 2026).
// Części: Nauka (lekcje, nauka.js), Pytania egzaminacyjne (pytania.js), Materiały (opracowane notatki z każdego dnia kursu)
// i Przepisy (pełne teksty aktów ppoż. z bazy Sejmu). Widoki sterowane adresem po "#".
//
//   data/kurs.json ─► Nauka    data/materialy.json ─► Materiały    data/przepisy/*.json ─► Przepisy
//
// Postęp i ustawienia tylko w localStorage tego telefonu.

const KLUCZ = { motyw: "insp-motyw", nauka: "insp-nauka", styl: "insp-styl" };
const DZIEN_MS = 86400000;
const MIN_ZNAKOW_SZUKANIA = 3;
const WYNIKOW_NA_GRUPE = 30;
const ZNAKOW_PODGLADU = 140;

// Kurs: etapy i dni zajęć online (dzień kursu = sekcja Materiałów).
const KURS = [
  { od: "2026-10-26", do: "2026-10-30", co: "Zajęcia online (Clickmeeting), 8:00-15:00" },
  { od: "2026-10-31", do: "2026-11-09", co: "Praca projektowa - wysłać do 9.11 na adres z wytycznych CS PSP" },
  { od: "2026-11-16", do: "2026-11-18", co: "Zajęcia w CS PSP Częstochowa, 8:00-16:00" },
  { od: "2026-11-18", do: "2026-11-18", co: "Egzamin: 60 pytań, 75 minut, zalicza 42 poprawne" },
];
const DNI_ZAJEC = { "2026-10-26": "dzien1", "2026-10-27": "dzien2", "2026-10-28": "dzien3", "2026-10-29": "dzien4", "2026-10-30": "dzien5" };

const stan = { kurs: null, materialy: null, spis: [], przepisy: {} };
const widok = document.getElementById("widok");

// ── Pomocnicze ──

function czytaj(klucz, domyslna) {
  try {
    const v = localStorage.getItem(klucz);
    return v ? JSON.parse(v) : domyslna;
  } catch (e) {
    return domyslna;
  }
}

function zapisz(klucz, wartosc) {
  try {
    localStorage.setItem(klucz, JSON.stringify(wartosc));
  } catch (e) {
    // Tryb prywatny - postęp zostanie tylko do zamknięcia karty.
  }
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Twarda spacja po jednoliterowych spójnikach, żeby nie zostawały na końcu wiersza.
function nbsp(s) {
  return s.replace(/(^|[\s(„])([aiouwzAIOUWZ])\s/g, "$1$2 ");
}

function tekst(s) {
  return nbsp(esc(s));
}

function bezOgonkow(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");
}

function kafel(napis, kolor) {
  const emotka = /\p{Extended_Pictographic}/u.test(napis) ? " big" : "";
  const liczba = /^\d+$/.test(napis) ? " liczba" : "";
  return `<span class="row-icon${emotka}${liczba}" style="background-color:${kolor}">${esc(napis)}</span>`;
}

function wiersz(href, ikona, kolor, tytul, opis, tag) {
  return `<a class="row" href="${href}">${kafel(ikona, kolor)}<span class="row-main"><span class="row-title">${tekst(tytul)}</span>${opis ? `<span class="row-sub">${tekst(opis)}</span>` : ""}</span>${tag || ""}<span class="row-chev">›</span></a>`;
}

// Odmiana: 1 temat, 2-4 tematy, 5+ tematów (12-14 zawsze „tematów”).
function ile(n, jeden, kilka, wiele) {
  const d = n % 10;
  const s = n % 100;
  const forma = n === 1 ? jeden : d >= 2 && d <= 4 && !(s >= 12 && s <= 14) ? kilka : wiele;
  return `${n} ${forma}`;
}

function dzisIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dniDo(iso) {
  return Math.round((new Date(iso + "T00:00:00") - new Date(dzisIso() + "T00:00:00")) / DZIEN_MS);
}

function dataPl(iso) {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
}

function pokazKomunikat(t) {
  let el = document.getElementById("komunikat");
  if (!el) {
    el = document.createElement("div");
    el.id = "komunikat";
    document.body.appendChild(el);
  }
  el.textContent = t;
  el.className = "toast on";
  clearTimeout(stan.komunikatCzas);
  stan.komunikatCzas = setTimeout(() => (el.className = "toast"), 4500);
}

// ── Nawigacja ──

// Nagłówek jak w Pomocniku Strażaka: ekrany z zakładek mają duży tytuł z lewej, podstrony - „Wstecz” i tytuł na środku.
// Ikony strony głównej, wyszukiwarki i motywu są widoczne na każdym ekranie (poza tym, na którym już jesteś).
function ustawNaglowek(tytul, wstecz) {
  document.getElementById("nav-title").textContent = tytul;
  document.documentElement.classList.toggle("naglowek-duzy", !wstecz);
  const b = document.getElementById("btn-back");
  b.hidden = !wstecz;
  b.onclick = () => (wstecz === "back" && history.length > 1 ? history.back() : (location.hash = wstecz === "back" ? "#/start" : wstecz));
  const h = location.hash || "#/start";
  document.getElementById("btn-home").hidden = h === "#/start";
  document.getElementById("btn-search").hidden = h === "#/szukaj";
}

function ustawZakladke(nazwa) {
  document.querySelectorAll(".tab-item").forEach((t) => t.classList.toggle("active", t.dataset.tab === nazwa));
}

const TRASY = [
  [/^#\/start$/, () => widokStart()],
  [/^#\/materialy$/, () => widokMaterialow()],
  [/^#\/materialy\/([\w-]+)$/, (m) => widokSekcji(m[1])],
  [/^#\/m\/([\w-]+)$/, (m) => widokTematu(m[1])],
  [/^#\/przepisy$/, () => widokPrzepisow()],
  [/^#\/p\/(\w+)$/, (m) => widokAktu(m[1])],
  [/^#\/p\/(\w+)\/(\w+)$/, (m) => widokJednostki(m[1], m[2])],
  [/^#\/szukaj$/, () => widokSzukaj()],
  [/^#\/kurs$/, () => widokKursu()],
];

// Pozycja przewinięcia zapisana w historii przeglądarki - „wstecz” wraca dokładnie tam, gdzie czytałeś.
history.scrollRestoration = "manual";
let zapisPozycji;
window.addEventListener("scroll", () => {
  clearTimeout(zapisPozycji);
  zapisPozycji = setTimeout(() => history.replaceState(Object.assign({}, history.state, { y: window.scrollY }), ""), 120);
}, { passive: true });

// Po narysowaniu widoku: cel z wyszukiwarki, zapamiętana pozycja (powrót) albo góra strony.
// Drugie podejście po chwili - lekcje i przepisy dorysowują się jeszcze po pierwszej klatce.
function ustawPrzewiniecie() {
  const y = history.state && history.state.y;
  const przewin = () => {
    if (stan.celPrzewiniecia) {
      przewinDoCelu();
      return;
    }
    window.scrollTo(0, y || 0);
  };
  requestAnimationFrame(przewin);
  if (y) {
    setTimeout(() => window.scrollTo(0, y), 350);
  }
}

function trasa() {
  const h = location.hash || "#/start";
  window.scrollTo(0, 0);
  for (const [wzor, fn] of TRASY) {
    const m = h.match(wzor);
    if (m) {
      fn(m);
      ustawPrzewiniecie();
      return;
    }
  }
  widokStart();
}

// ── Start ──

// Terminy kursu - na osobnej stronie „O kursie”, nie na głównej (decyzja Tomka 27.10).
function widokKursu() {
  ustawNaglowek("O kursie", "#/start");
  ustawZakladke("start");
  const dzis = dzisIso();
  const etap = (k) => {
    const kiedy = k.od === k.do ? dataPl(k.od) : `${dataPl(k.od)}-${dataPl(k.do)}`;
    return `<div class="termin${k.do < dzis ? " minal" : ""}"><b>${kiedy}</b><span>${tekst(k.co)}</span></div>`;
  };
  widok.innerHTML = `
    <div class="section-header"><div class="section-title">O kursie</div>
    <div class="section-sub">${tekst("Szkolenie inspektorów ochrony przeciwpożarowej, CS PSP Częstochowa, 26.10-18.11.2026.")}</div></div>
    <div class="terminy" style="margin-top:20px">${KURS.map(etap).join("")}</div>
    <div class="btn-row"><a class="pastylka szara" href="#/materialy/kurs">Zasady egzaminu i zaliczenia</a></div>`;
}

function poleSzukania(wartosc) {
  return `<div class="search-wrap"><label class="search-box big">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
    <input class="search-input" id="szukaj" type="search" placeholder="Szukaj - także bez polskich liter" value="${esc(wartosc)}" autocomplete="off" autocorrect="off" spellcheck="false"></label></div>`;
}

// Na stronie głównej pisanie od razu przenosi do wyników (wyszukiwarka przejmuje wpisany tekst).
function podepnijSzukanie() {
  const pole = document.getElementById("szukaj");
  pole.addEventListener("input", () => {
    stan.fraza = pole.value;
    location.hash = "#/szukaj";
  });
}

// Kolory kafelków (jak w Pomocniku Strażaka - każda grupa swój kolor, skrót na kafelku).
const KOLORY = { nauka: "#c0392b", test: "#6c3483", fiszki: "#1e7a4c", dzial: "#2f5d8a", przepisy: "#3a3a3c", liczby: "#b9770e", zmiany: "#a04000", kurs: "#566573" };

// Strona główna: wyszukiwarka i kafelki pogrupowane według tego, co inspektor robi - uczy się, sprawdza wiedzę, szuka w przepisach.
function widokStart() {
  ustawNaglowek("Inspektor PPOŻ");
  ustawZakladke("start");
  const p = postepNauki();
  const nast = nastepnaLekcja(p);
  const liczby = stan.materialy.sekcje.find((s) => s.id === "liczby");
  const zmiany = stan.materialy.sekcje.find((s) => s.id === "nieaktualne");
  const pyt = wynikiPytan();
  const umiane = Object.values(pyt).filter((w) => w[2]).length;
  const k = (h, skrot, kolor, tytul, opis) => wiersz(h, skrot, kolor, tytul, opis);
  widok.innerHTML = `
    ${poleSzukania("")}
    <div class="section-label">Pracuj</div>
    <div class="list-group">
      ${k("#/narzedzia/obchod", "OBCH", "#0e6655", "Obchód obiektu", "Lista kontrolna: co sprawdzić, jaka wartość, jaki przepis")}
      ${k("#/analiza", "LICZ", "#c0392b", "Analiza budynku", "Kalkulator: wymagania, ocena i gotowy tekst do tabeli analizy")}
      ${k("#/poradnik", "JAK", "#2f5d8a", "Jak zrobić analizę", "Zasady do każdego budynku: jak liczyć i jakie przepisy")}
      ${k("#/narzedzia", "NARZ", "#7b241c", "Narzędzia", "Osoby i drzwi, palne rzeczy, odległości, terminy")}
    </div>
    <div class="section-label">Ucz się</div>
    <div class="list-group">
      ${k(`#/nauka/lekcja/${nast.id}`, "DALEJ", KOLORY.nauka, "Kontynuuj naukę", `Lekcja ${nast.nr}: ${nast.tytul}`)}
      ${k("#/nauka", "LEK", KOLORY.nauka, "Lekcje", `${ile(stan.kurs.bloki.length, "lekcja", "lekcje", "lekcji")} w 5 działach`)}
      ${k("#/fiszki", "FISZ", KOLORY.fiszki, "Fiszki", `Pojęcia i skróty jak słówka · opanowane ${opanowaneFiszki()}`)}
      ${k("#/poszerz", "WIĘCEJ", KOLORY.dzial, "Poszerz wiedzę", `${ile(POSZERZ.length, "temat", "tematy", "tematów")} wokół pytań: prosto, z przykładami, tabelami i rysunkami`)}
    </div>
    <div class="section-label">Sprawdź się</div>
    <div class="list-group">
      ${k("#/pytania", "TEST", KOLORY.test, "Pytania egzaminacyjne", `648 pytań z wyjaśnieniami · umiesz ${umiane}`)}
      ${k("#/nauka/egzamin", "EGZ", KOLORY.test, "Egzamin próbny", `${PYTAN_W_EGZAMINIE} pytań, 75 minut - jak na egzaminie`)}
    </div>
    <div class="section-label">Wiedza według działów</div>
    <div class="list-group">${DZIALY.map((d, i) => k(`#/materialy/dz-${d.id}`, `D${i + 1}`, KOLORY.dzial, d.nazwa, d.opis)).join("")}</div>
    <div class="section-label">Przepisy i ściągi</div>
    <div class="list-group">
      ${k("#/przepisy", "§", KOLORY.przepisy, "Przepisy ppoż.", `${ile(stan.spis.length, "akt", "akty", "aktów")} w pełnym brzmieniu, z linkami do Sejmu`)}
      ${liczby ? k(`#/m/${liczby.tematy[0]}`, "123", KOLORY.liczby, "Liczby do zapamiętania", "Odległości, terminy, progi - zbiorczo") : ""}
      ${zmiany ? k(`#/m/${zmiany.tematy[0]}`, "ZM", KOLORY.zmiany, "Zmiany w przepisach", "Co na slajdach kursu jest już nieaktualne") : ""}
      ${k("#/nauka/sciaga", "A4", KOLORY.kurs, "Ściąga na jedną kartkę", "Do wydruku")}
      ${k("#/kurs", "KURS", KOLORY.kurs, "O kursie", "Terminy, egzamin, praca zaliczeniowa")}
    </div>
    <div class="foot">${tekst("Przepisy z oficjalnej bazy Sejmu (ISAP). Aplikacja nie zastępuje oryginału - w razie wątpliwości otwórz link do ISAP.")}</div>`;
  podepnijSzukanie();
}

// ── Materiały ──

function widokMaterialow() {
  ustawNaglowek("Materiały", "");
  ustawZakladke("materialy");
  const m = stan.materialy;
  const ikony = { kurs: ["KURS", "#5e35b1"], liczby: ["123", "#248a3d"], nieaktualne: ["ZM", "#b25000"], akty: ["§", "#3a3a3c"] };
  widok.innerHTML = `
    <div class="section-header"><div class="section-title">Materiały szkolenia</div>
    <div class="section-sub">${tekst("Opracowane notatki z prezentacji i materiałów CS PSP w pięciu działach, z ramkami „Po ludzku” i sprawdzeniem z aktualnymi przepisami.")}</div></div>
    <div class="list-group" style="margin-top:12px">${m.sekcje.map((s) => {
      const [ik, kol] = ikony[s.id] || [String(s.nr), "#c0392b"];
      const liczba = ile(s.tematy.length, "temat", "tematy", "tematów");
      return wiersz(`#/materialy/${s.id}`, ik, kol, s.nazwa, s.nazwa === s.podtytul ? liczba : `${s.podtytul} · ${liczba}`);
    }).join("")}</div>
    <div class="foot">${tekst("Notatki powstają z materiałów kursu (prezentacje, opracowania) i są porównywane z aktualnym tekstem przepisów. Oryginalne pliki kursu masz na platformie elearning.cspsp.pl.")}</div>`;
}

function widokSekcji(id) {
  const s = stan.materialy.sekcje.find((x) => x.id === id);
  if (!s) {
    location.replace("#/materialy");
    return;
  }
  if (s.tematy.length === 1) {
    location.replace(`#/m/${s.tematy[0]}`);
    return;
  }
  ustawNaglowek(s.nazwa, "#/materialy");
  ustawZakladke("materialy");
  const tematy = s.tematy.map((t) => stan.materialy.tematy.find((x) => x.id === t));
  widok.innerHTML = `
    <div class="section-header"><div class="section-title" style="font-size:24px">${tekst(s.nr ? s.nazwa : s.podtytul)}</div>${s.nr ? `<div class="section-sub">${tekst(s.podtytul)}</div>` : ""}</div>
    <div class="list-group" style="margin-top:12px">${tematy.map((t) => `<a class="row" href="#/m/${t.id}"><span class="row-main"><span class="row-title small">${tekst(t.tytul)}</span>
      <span class="row-sub">${tekst(t.tekst.slice(0, ZNAKOW_PODGLADU))}…</span></span><span class="row-chev">›</span></a>`).join("")}</div>`;
}

function widokTematu(id) {
  const t = stan.materialy.tematy.find((x) => x.id === id);
  if (!t) {
    location.replace("#/materialy");
    return;
  }
  const s = stan.materialy.sekcje.find((x) => x.id === t.sekcja);
  const lista = s.tematy;
  const i = lista.indexOf(t.id);
  ustawNaglowek(s.nazwa, s.tematy.length === 1 ? "#/materialy" : `#/materialy/${s.id}`);
  ustawZakladke("materialy");
  const sasiad = (j, napis) => (lista[j] ? `<a class="btn secondary" href="#/m/${lista[j]}">${napis}</a>` : "");
  widok.innerHTML = `
    <div class="unit-head"><div class="unit-label" style="font-size:24px">${tekst(t.tytul)}</div><div class="unit-act">${tekst(s.nr ? `Dział ${s.nr} · ${s.nazwa}` : s.podtytul)}</div></div>
    <div class="mat" data-akt="${aktTematu(t.id)}">${t.html}</div>
    <div class="pager">${sasiad(i - 1, "‹ Poprzedni")}${sasiad(i + 1, "Następny ›")}</div>`;
}

// ── Przepisy ──

async function wczytajAkt(plik) {
  if (!stan.przepisy[plik]) {
    stan.przepisy[plik] = await fetch(`data/przepisy/${plik}.json`).then((r) => r.json());
  }
  return stan.przepisy[plik];
}

function plikAktu(eli) {
  return eli.replaceAll("/", "_");
}

function nazwaAktu(plik) {
  const p = stan.spis.find((x) => plikAktu(x.eli) === plik);
  return p ? p.nazwa : plik;
}

function widokPrzepisow() {
  ustawNaglowek("Przepisy", "");
  ustawZakladke("przepisy");
  const grupy = [...new Set(stan.spis.map((p) => p.grupa))];
  const kolory = { "Podstawowe": "#c0392b", "Budynki": "#2f5d8a", "Organizacja i kontrole": "#5e35b1", "Odpowiedzialność": "#3a3a3c", "Zagrożenia szczególne": "#b25000" };
  widok.innerHTML = `
    <div class="section-header"><div class="section-title">Przepisy ppoż.</div>
    <div class="section-sub">${tekst("Pełne teksty aktów z programu kursu - aktualny tekst jednolity z bazy Sejmu. Zmiany ogłoszone później są wypisane przy akcie.")}</div></div>
    ${grupy.map((g) => `<div class="section-label">${esc(g)}</div><div class="list-group">${stan.spis.filter((p) => p.grupa === g).map((p) =>
      wiersz(`#/p/${plikAktu(p.eli)}`, "§", kolory[g] || "#3a3a3c", p.nazwa, `${p.eli.replace("DU/", "Dz.U. ").replace(/\/(\d+)$/, " poz. $1")} · ${p.jednostek} przepisów`)).join("")}</div>`).join("")}
    <div class="foot">${tekst("Ustawa o ochronie ppoż. i rozporządzenia z 2009 i 2010 r. mają naniesione dosłownie zmiany ogłoszone po tekście jednolitym. Pozostałe akty - tekst jednolity z API Sejmu.")}</div>`;
}

function tekstJednostki(j) {
  return `<div class="law">${j.linie.map((l) => `<p class="l${l.p}">${tekst(l.t)}</p>`).join("")}</div>${j.uwaga ? `<div class="card amber"><p>${tekst(j.uwaga)}</p></div>` : ""}`;
}

function zmianyPo(d) {
  if (!d.zmiany_po || !d.zmiany_po.length) {
    return "";
  }
  return `<div class="card amber"><p><b>${tekst("Zmiany ogłoszone po tym tekście - nie są w nim uwzględnione:")}</b></p>
    <div class="links">${d.zmiany_po.map((z) => `<a class="chip red" href="${z.isap}" target="_blank" rel="noopener">${esc(z.eli.replace("DU/", "Dz.U. ").replace(/\/(\d+)$/, " poz. $1"))} ↗</a>`).join("")}</div></div>`;
}

async function widokAktu(plik) {
  ustawNaglowek(nazwaAktu(plik), "#/przepisy");
  ustawZakladke("przepisy");
  widok.innerHTML = `<div class="spinner">Wczytuję tekst aktu…</div>`;
  const d = await wczytajAkt(plik);
  const rozdzialy = [];
  for (const j of d.jednostki) {
    let r = rozdzialy[rozdzialy.length - 1];
    if (!r || r.nazwa !== (j.rozdzial || "")) {
      r = { nazwa: j.rozdzial || "", jedn: [] };
      rozdzialy.push(r);
    }
    r.jedn.push(j);
  }
  widok.innerHTML = `
    <div class="section-header"><div class="section-title" style="font-size:22px">${tekst(nazwaAktu(plik))}</div>
    <div class="section-sub">${tekst(d.tytul || "")}</div></div>
    ${zmianyPo(d)}
    <div class="search-wrap"><label class="search-box"><input class="search-input" id="szukaj-akt" type="search" placeholder="Szukaj w tym akcie" autocomplete="off"></label></div>
    <div id="lista-akt">${rozdzialy.map((r) => `<div class="section-label">${esc(r.nazwa || "Przepisy")}</div>
      <div class="list-group">${r.jedn.map((j) => `<a class="row" data-q="${esc(bezOgonkow(j.linie.map((l) => l.t).join(" ")))}" href="#/p/${plik}/${j.id}"><span class="row-main"><span class="row-title small">${esc(j.etykieta)}</span>
        <span class="row-sub">${tekst((j.linie[0] ? j.linie[0].t : "").slice(0, 120))}…</span></span><span class="row-chev">›</span></a>`).join("")}</div>`).join("")}</div>
    <div class="links" style="margin:16px"><a class="chip red" href="${adresUrzedowy(plik)}" target="_blank" rel="noopener">Oficjalny tekst Sejmu ↗</a></div>`;
  const pole = document.getElementById("szukaj-akt");
  pole.addEventListener("input", () => {
    const q = bezOgonkow(pole.value.trim());
    document.querySelectorAll("#lista-akt .row").forEach((r) => (r.hidden = q.length > 1 && !r.dataset.q.includes(q)));
    document.querySelectorAll("#lista-akt .list-group").forEach((g) => {
      const widoczne = [...g.children].some((r) => !r.hidden);
      g.hidden = !widoczne;
      g.previousElementSibling.hidden = !widoczne;
    });
  });
}

async function widokJednostki(plik, id) {
  ustawNaglowek(nazwaAktu(plik), `#/p/${plik}`);
  ustawZakladke("przepisy");
  const d = await wczytajAkt(plik);
  const i = d.jednostki.findIndex((j) => j.id === id);
  const j = d.jednostki[i];
  if (!j) {
    location.replace(`#/p/${plik}`);
    return;
  }
  ustawNaglowek(`${j.etykieta} · ${nazwaAktu(plik)}`, `#/p/${plik}`);
  const sasiad = (k, napis) => (d.jednostki[k] ? `<a class="btn secondary" href="#/p/${plik}/${d.jednostki[k].id}">${napis}</a>` : "");
  widok.innerHTML = `
    <div class="unit-head"><div class="unit-label">${esc(j.etykieta)}</div>
      ${j.rozdzial ? `<div class="unit-chapter">${tekst(j.rozdzial)}</div>` : ""}<div class="unit-act">${tekst(nazwaAktu(plik))}</div></div>
    ${tekstJednostki(j)}
    <div class="pager">${sasiad(i - 1, "‹ Poprzedni")}${sasiad(i + 1, "Następny ›")}</div>
    <div class="links" style="margin:0 16px 16px"><a class="chip red" href="${adresUrzedowy(plik, j.etykieta)}" target="_blank" rel="noopener">Oficjalny tekst Sejmu - ten przepis ↗</a></div>`;
}

// ── Szukaj: każde słowo osobno (bez polskich znaków i odmiany końcówek) w lekcjach, materiałach i przepisach ──

// "Drogi pożarowej" -> ["drog", "pozarow"]: słowa bez ogonków, przycięte o końcówkę, żeby łapać odmianę.
function slowaZapytania(fraza) {
  // Długie słowa tracą 2 ostatnie litery, średnie (5-6) jedną: „proba” → „prob” łapie „próbie”.
  return bezOgonkow(fraza).split(/[^a-z0-9§]+/).filter((s) => s.length >= 2).map((s) => (s.length >= 7 ? s.slice(0, -2) : s.length >= 5 ? s.slice(0, -1) : s));
}

// Słowa potoczne → słowa z przepisów (szukane razem): „winda” w przepisach to „dźwig”.
const SLOWA_ZAMIENNE = { wind: ["dzwig"], dzwig: ["wind"], czad: ["tlenek wegl", "tlenku wegl"] };
const ZAMIENNE_OPIS = { wind: "„winda” - w przepisach „dźwig”", dzwig: "„dźwig” - potocznie „winda”", czad: "„czad” - w przepisach „tlenek węgla”" };

function pasuje(tekstBez, slowa) {
  return slowa.every((s) => tekstBez.includes(s) || (SLOWA_ZAMIENNE[s] || []).some((z) => tekstBez.includes(z)));
}

// Wyszukiwarka fragmentów: każde zdanie, punkt, wiersz tabeli i ustęp przepisu to osobny wynik.
// Tomek wpisuje słowo i dostaje konkretne akapity z podświetleniem, a nie listę artykułów do przeklikania.
//
//   fragment = { gdzie, tekst, szukaj, adres }  ─► kliknięcie: lekcja/materiał przewija do akapitu,
//                                                  przepis otwiera oficjalny tekst Sejmu na paragrafie
const ZNAKOW_FRAGMENTU_MAX = 420;
const FRAGMENTOW_NA_START = 10;

function bezSpacji(s) {
  return String(s).replace(/\s+/g, " ").trim();
}

function fragmentyLekcji() {
  const lista = [];
  stan.kurs.bloki.forEach((b) => {
    const adres = `#/nauka/lekcja/${b.id}`;
    const gdzie = (co) => `Lekcja ${b.nr} · ${b.tytul} · ${co}`;
    const dodaj = (co, t, szukaj) => t && lista.push({ gdzie: gdzie(co), tekst: bezSpacji(t), szukaj: bezSpacji(szukaj || t), adres });
    dodaj("po ludzku", b.po_ludzku);
    dodaj("przykład", b.przyklad);
    b.zasady.forEach((z) => {
      dodaj("co mówi przepis", z.t);
      dodaj("po prostu", z.prosto);
    });
    (b.tabele || []).forEach((t) => t.wiersze.forEach((w) => dodaj(`tabela: ${t.tytul}`, w.filter(Boolean).join(" · "), w.slice().sort((x, y) => y.length - x.length)[0])));
    (b.sekcje || []).forEach((sek) => sek.punkty.forEach((p) => dodaj(sek.tytul, p.t)));
    (b.obliczenia || []).forEach((o) => [o.dane, ...o.kroki, o.wynik].forEach((t) => dodaj(`policz: ${o.tytul}`, t)));
    (b.pojecia || []).forEach((p) => {
      dodaj(`słowniczek: ${p.nazwa}`, `${p.nazwa} - ${p.t}`, p.t);
      dodaj(`słowniczek: ${p.nazwa} (po prostu)`, p.prosto);
    });
    b.pulapki.forEach((p) => dodaj("pułapka", `${p.blad} → ${p.prawda}`, p.prawda));
  });
  return lista;
}

// Materiały: każdy akapit, punkt listy i komórka tabeli z HTML tematu.
function fragmentyMaterialow() {
  const lista = [];
  const parser = new DOMParser();
  stan.materialy.tematy.forEach((t) => {
    const dom = parser.parseFromString(t.html, "text/html");
    const bloki = [...dom.querySelectorAll("p, li, td, dd, dt, h3, h4, blockquote")].filter((el) => !el.querySelector("p, li, td, dd, blockquote"));
    bloki.forEach((el) => {
      const tekstEl = bezSpacji(el.textContent);
      if (tekstEl.length > 2) {
        lista.push({ gdzie: `Materiały · ${t.tytul}`, tekst: tekstEl, szukaj: tekstEl, adres: `#/m/${t.id}` });
      }
    });
  });
  return lista;
}

function indeksSzukania() {
  if (!stan.indeks) {
    const wszystko = [...fragmentyLekcji(), ...fragmentyMaterialow(), ...fragmentyPoradnika()];
    wszystko.forEach((f) => (f.bez = bezOgonkow(f.tekst)));
    stan.indeks = { lekcje: wszystko.filter((f) => f.adres.startsWith("#/nauka")), materialy: wszystko.filter((f) => f.adres.startsWith("#/m/")),
      poradnik: wszystko.filter((f) => f.adres.startsWith("#/poradnik")) };
  }
  return stan.indeks;
}

// Podświetlenie: pozycje liczone na tekście bez ogonków (ta sama długość co oryginał).
function zPodswietleniem(t, slowa) {
  const bez = bezOgonkow(t);
  let od = 0;
  let do_ = t.length;
  if (t.length > ZNAKOW_FRAGMENTU_MAX) {
    const i = Math.max(0, [slowa[0], ...(SLOWA_ZAMIENNE[slowa[0]] || [])].map((s) => bez.indexOf(s)).filter((x) => x >= 0)[0] || 0);
    od = Math.max(0, i - 160);
    do_ = Math.min(t.length, od + ZNAKOW_FRAGMENTU_MAX);
  }
  const zakresy = [];
  slowa.flatMap((s) => [s, ...(SLOWA_ZAMIENNE[s] || [])]).forEach((s) => {
    let i = bez.indexOf(s, od);
    while (i >= 0 && i < do_) {
      zakresy.push([i, Math.min(do_, i + s.length)]);
      i = bez.indexOf(s, i + s.length);
    }
  });
  zakresy.sort((x, y) => x[0] - y[0]);
  let html = od ? "…" : "";
  let k = od;
  zakresy.forEach(([a, b]) => {
    if (a < k) {
      return;
    }
    html += tekst(t.slice(k, a)) + `<mark class="trafienie">${esc(t.slice(a, b))}</mark>`;
    k = b;
  });
  return pogrubLiczby(html + tekst(t.slice(k, do_)) + (do_ < t.length ? "…" : ""));
}

// Liczby z jednostkami pogrubione - w gotowym HTML, poza znacznikami.
function pogrubLiczby(html) {
  return html.split(/(<[^>]+>)/).map((c) => (c.startsWith("<") ? c : c.replace(WZOR_LICZBY, (m) => `<b class="liczba">${m}</b>`))).join("");
}

function wynikFragmentu(f, slowa, i) {
  const zewn = f.adres.startsWith("http");
  return `<a class="fragment" href="${esc(f.adres)}" ${zewn ? 'target="_blank" rel="noopener"' : `data-cel="${i}"`}>
    <span class="fragment-gdzie">${tekst(f.gdzie)}${zewn ? " ↗" : ""}</span><span class="fragment-tekst">${zPodswietleniem(f.tekst, slowa)}</span></a>`;
}

function grupaWynikow(nazwa, lista, slowa, klucz) {
  if (!lista.length) {
    return "";
  }
  const pokaz = stan.pokazWszystkie && stan.pokazWszystkie[klucz] ? lista.length : FRAGMENTOW_NA_START;
  stan.celeWynikow = stan.celeWynikow || [];
  const html = lista.slice(0, pokaz).map((f) => {
    stan.celeWynikow.push(f);
    return wynikFragmentu(f, slowa, stan.celeWynikow.length - 1);
  }).join("");
  const wiecej = lista.length > pokaz ? `<div class="btn-row"><button class="pastylka szara" onclick="stan.pokazWszystkie=Object.assign(stan.pokazWszystkie||{},{${klucz}:true});pokazWyniki(stan.fraza)">Pokaż wszystkie (${lista.length})</button></div>` : "";
  return `<div class="section-label">${nazwa} · ${lista.length}</div><div class="fragmenty">${html}</div>${wiecej}`;
}

function widokSzukaj() {
  ustawNaglowek("Szukaj", "");
  ustawZakladke("szukaj");
  const fraza = stan.fraza || "";
  widok.innerHTML = `${poleSzukania(fraza)}<div id="wyniki"></div>`;
  const pole = document.getElementById("szukaj");
  pole.focus();
  pole.setSelectionRange(fraza.length, fraza.length);
  let czas;
  pole.addEventListener("input", () => {
    clearTimeout(czas);
    czas = setTimeout(() => {
      stan.fraza = pole.value;
      stan.pokazWszystkie = {};
      pokazWyniki(stan.fraza);
    }, 200);
  });
  // Kliknięcie fragmentu z lekcji lub materiałów: zapamiętaj akapit, przewiń do niego po otwarciu strony.
  document.getElementById("wyniki").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-cel]");
    if (a) {
      stan.celPrzewiniecia = stan.celeWynikow[Number(a.dataset.cel)].szukaj;
    }
  });
  pokazWyniki(fraza);
}

// ── Kolejność i trafność wyników ──
// Kto pyta, zwykle szuka podstawy prawnej albo konkretnej wartości (metry, kg, dm³/s, minuty, klasy EI/REI).
// Dlatego: 1) „Liczby i wymagania” - najtrafniejsze fragmenty z wartościami, 2) przepisy, 3) pytania, 4) lekcje, 5) materiały.
// W każdej grupie wyniki są sortowane według trafności, a liczby z jednostkami pogrubione.
const WZOR_LICZBY = /(?:\b(?:REI|RE|EI|EIS|R|E|I)\s?\d{2,3}\b|\d+(?:[,.]\d+)?(?:\s?[-–]\s?\d+(?:[,.]\d+)?)?\s?(?:MJ\/m2|MJ\/m²|dm3\/s|dm³\/s|m3\/h|m²|m2|m³|m3|dm³|dm3|cm|mm|km|kg|kN|kW|MPa|kPa|bar|MJ|%|°C|ºC|minut\w*|min\.?|godzin\w*|h\b|osób|osoby|lat[a]?\b|dni\b|doby|miesięc\w*|m\b|l\b|s\b|Pa\b|K\b|dB|lx))/gu;
const NA_START_LICZB = 6;
const WAGA_SLOWA = 10;
const WAGA_BLISKO = 8;
const WAGA_LICZBY = 3;

function liczbWTekscie(t) {
  return (t.match(WZOR_LICZBY) || []).length;
}

// Trafność: każde słowo zapytania, słowa blisko siebie, liczba stojąca tuż przy szukanym słowie (to zwykle odpowiedź),
// przepis wyżej niż opracowanie; długie akapity w dół.
const WAGA_LICZBA_PRZY_SLOWIE = 12;
// Lekcje streszczają przepis z paragrafem - najczęściej najlepsza odpowiedź; potem główne akty ppoż.
const WAGA_ZRODLA = { lekcja: 6, glowny: 5, poradnik: 5, materialy: 3, pytanie: 2, przepis: 0 };
const AKTY_GLOWNE = ["DU_2002_690", "DU_2010_719", "DU_2009_1030", "DU_1991_351", "DU_1994_414", "DU_2023_1563"];

function zrodloFragmentu(f) {
  if (f.przepis) {
    const nr = Number((f.gdzie.match(/^§ (\d+)/) || [])[1]);
    if (f.plik === "DU_2002_690" && !(nr >= WT_PPOZ[0] && nr <= WT_PPOZ[1])) {
      return "przepis";
    }
    return AKTY_GLOWNE.includes(f.plik) ? "glowny" : "przepis";
  }
  return f.adres.startsWith("#/nauka") ? "lekcja" : f.adres.startsWith("#/poradnik") ? "poradnik" : f.adres.startsWith("#/m/") ? "materialy" : "pytanie";
}
const ZASIEG_LICZBY = 70;
const WAGA_FRAZY = 10;
const ZASIEG_FRAZY = 25;
// Dział VI WT „Bezpieczeństwo pożarowe” (§ 207-290) - przy pytaniach ppoż. ważniejszy niż reszta warunków technicznych
const WT_PPOZ = [207, 290];

function trafnosc(f, slowa) {
  if (f.liczb === undefined) {
    f.liczb = liczbWTekscie(f.tekst);
    f.gdzieLiczby = [...f.tekst.matchAll(WZOR_LICZBY)].map((m) => m.index);
  }
  const pozycje = slowa.map((w) => [w, ...(SLOWA_ZAMIENNE[w] || [])].map((x) => f.bez.indexOf(x)).filter((i) => i >= 0)[0]).filter((i) => i !== undefined);
  let wynik = pozycje.length * WAGA_SLOWA;
  if (pozycje.length > 1 && Math.max(...pozycje) - Math.min(...pozycje) < 120) {
    wynik += WAGA_BLISKO;
  }
  // Słowa obok siebie w tej samej kolejności co w pytaniu („szerokość drzwi”) - to dokładnie to, o co pytasz
  if (pozycje.length === slowa.length && pozycje.length > 1 && pozycje.every((x, i) => i === 0 || (x > pozycje[i - 1] && x - pozycje[i - 1] < ZASIEG_FRAZY))) {
    wynik += WAGA_FRAZY;
  }
  if (pozycje.some((i) => f.gdzieLiczby.some((n) => Math.abs(n - i) < ZASIEG_LICZBY))) {
    wynik += WAGA_LICZBA_PRZY_SLOWIE;
  }
  wynik += Math.min(f.liczb, 3) * WAGA_LICZBY;
  wynik += WAGA_ZRODLA[zrodloFragmentu(f)] || 0;
  return wynik - Math.min(f.tekst.length / 250, 5);
}

function posortuj(lista, slowa) {
  lista.forEach((f) => (f.ocena = trafnosc(f, slowa)));
  return lista.sort((x, y) => y.ocena - x.ocena);
}

// Przepisy: każdy ustęp, punkt i litera osobno, z tekstem ustępu nadrzędnego (np. „przy zachowaniu odległości:”),
// żeby „hydrant odległość” znalazło punkt „najbliższego hydrantu - do 75 m”. Etykieta z § / ust. / pkt.
function indeksPrzepisowSzukania() {
  if (stan.indeksPrzepisowSzukania) {
    return stan.indeksPrzepisowSzukania;
  }
  const lista = [];
  for (const p of stan.spis) {
    const plik = plikAktu(p.eli);
    const nazwa = nazwaAktu(plik);
    for (const j of stan.przepisy[plik].jednostki) {
      const rodzice = [];
      let ust = "";
      let pkt = "";
      j.linie.forEach((l) => {
        const poziom = l.p || 0;
        rodzice.length = Math.min(rodzice.length, poziom);
        const mU = l.t.match(/^(\d+[a-z]?)\.\s/);
        const mP = l.t.match(/^(\d+[a-z]?)\)\s/);
        const mL = l.t.match(/^([a-z])\)\s/);
        if (mU) {
          ust = mU[1];
          pkt = "";
        } else if (mP) {
          pkt = mP[1];
        }
        const etykieta = `${j.etykieta}${ust ? ` ust. ${ust}` : ""}${!mU && pkt ? ` pkt ${pkt}` : ""}${mL ? ` lit. ${mL[1]}` : ""}`;
        const nad = rodzice.filter(Boolean).map((r) => (r.length > 140 ? r.slice(0, 140) + "…" : r)).join(" → ");
        const tekstPelny = nad ? `${nad} → ${l.t}` : l.t;
        lista.push({ gdzie: `${etykieta} · ${nazwa}`, tekst: tekstPelny, bez: bezOgonkow(tekstPelny), przepis: true, plik, adres: adresUrzedowy(plik, j.etykieta, { cytat: l.t }) });
        rodzice[poziom] = l.t.endsWith(":") ? l.t : "";
      });
    }
  }
  stan.indeksPrzepisowSzukania = lista;
  return lista;
}

async function pokazWyniki(fraza) {
  const el = document.getElementById("wyniki");
  if (!el) {
    return;
  }
  const slowa = slowaZapytania(fraza);
  if (!slowa.length || bezOgonkow(fraza).replace(/\s/g, "").length < MIN_ZNAKOW_SZUKANIA) {
    el.innerHTML = `<p class="opis-trybu">${tekst("Wpisz, czego szukasz, np. „hydrant odległość”, „szerokość drzwi”, „gaśnice kg”, „droga pożarowa”. Najpierw pokażę konkretne liczby i przepisy, potem pytania, lekcje i materiały. Polskie znaki i końcówki nie mają znaczenia.")}</p>`;
    return;
  }
  stan.celeWynikow = [];
  el.innerHTML = `<div class="spinner">Szukam w przepisach, pytaniach i lekcjach…</div>`;
  await Promise.all(stan.spis.map((p) => wczytajAkt(plikAktu(p.eli))));
  const pytaniaWszystkie = await fragmentyPytan();
  if (slowaZapytania(stan.fraza || "").join() !== slowa.join()) {
    return;
  }
  const ind = indeksSzukania();
  const przepisy = posortuj(indeksPrzepisowSzukania().filter((f) => pasuje(f.bez, slowa)), slowa);
  const pytania = posortuj(pytaniaWszystkie.filter((f) => pasuje(f.bez, slowa)), slowa);
  const lekcje = posortuj(ind.lekcje.filter((f) => pasuje(f.bez, slowa)), slowa);
  const materialy = posortuj(ind.materialy.filter((f) => pasuje(f.bez, slowa)), slowa);
  const poradnik = posortuj(ind.poradnik.filter((f) => pasuje(f.bez, slowa)), slowa);

  // Liczby i wymagania: najtrafniejsze fragmenty z wartościami, z każdego źródła, bez powtórzeń
  const widziane = new Set();
  const liczby = [...przepisy, ...lekcje, ...poradnik, ...pytania, ...materialy].filter((f) => f.liczb > 0)
    .sort((x, y) => y.ocena - x.ocena)
    .filter((f) => {
      const klucz = f.bez.slice(-80);
      return !widziane.has(klucz) && widziane.add(klucz);
    }).slice(0, NA_START_LICZB);

  const zamienne = slowa.filter((s) => SLOWA_ZAMIENNE[s]);
  const info = zamienne.length ? `<p class="opis-trybu">${tekst(`Szukam obu słów: ${zamienne.map((s) => ZAMIENNE_OPIS[s]).join("; ")}.`)}</p>` : "";
  const brak = !przepisy.length && !pytania.length && !lekcje.length && !materialy.length && !poradnik.length;
  el.innerHTML = brak ? `<p class="opis-trybu">${tekst("Nic nie znalazłem. Spróbuj krótszego słowa albo jednego słowa zamiast kilku.")}</p>`
    : `${info}${grupaWynikow("LICZBY I WYMAGANIA", liczby, slowa, "liczby")}
      ${grupaWynikow("PRZEPISY - oficjalny tekst Sejmu", przepisy, slowa, "przepisy")}
      ${grupaWynikow("PYTANIA EGZAMINACYJNE", pytania, slowa, "pytania")}
      ${grupaWynikow("JAK ZROBIĆ ANALIZĘ", poradnik, slowa, "poradnik")}
      ${grupaWynikow("LEKCJE", lekcje, slowa, "lekcje")}
      ${grupaWynikow("MATERIAŁY", materialy, slowa, "materialy")}`;
}

// Po otwarciu lekcji lub materiału z wyników: przewiń do akapitu z szukanym tekstem i podświetl go.
function przewinDoCelu() {
  const cel = stan.celPrzewiniecia;
  if (!cel) {
    return;
  }
  stan.celPrzewiniecia = null;
  const igla = bezOgonkow(cel).slice(0, 60);
  const kandydaci = [...widok.querySelectorAll("p, li, td, th, dd, dt, h3, h4, blockquote, .row-sub")];
  const opis = bezOgonkow(cel.split(" - ").slice(1).join(" - ")).slice(0, 60);
  const el = kandydaci.find((x) => bezOgonkow(bezSpacji(x.textContent)).includes(igla))
    || (opis.length > 20 && kandydaci.find((x) => bezOgonkow(bezSpacji(x.textContent)).includes(opis)));
  if (el) {
    el.scrollIntoView({ block: "center" });
    el.classList.add("cel-wyszukiwania");
    setTimeout(() => el.classList.remove("cel-wyszukiwania"), 4000);
  }
}

// ── Start aplikacji ──

function ustawMotyw(m) {
  document.documentElement.dataset.theme = m;
  document.getElementById("btn-theme").textContent = m === "dark" ? "☀" : "☾";
  document.querySelector('meta[name="theme-color"]').content = m === "dark" ? "#000000" : "#ffffff";
}

async function init() {
  ustawMotyw(czytaj(KLUCZ.motyw, "light"));
  document.getElementById("btn-theme").onclick = () => {
    const m = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    zapisz(KLUCZ.motyw, m);
    ustawMotyw(m);
  };
  document.querySelectorAll(".tab-item").forEach((t) => (t.onclick = () => (location.hash = "#/" + t.dataset.tab)));
  document.getElementById("btn-home").onclick = () => (location.hash = "#/start");
  document.getElementById("btn-search").onclick = () => (location.hash = "#/szukaj");
  const [kurs, materialy, spis, poradnik] = await Promise.all(["kurs", "materialy", "przepisy/spis", "poradnik"].map((n) => fetch(`data/${n}.json`).then((r) => r.json())));
  Object.assign(stan, { kurs, materialy, spis, poradnik });
  ulozDzialy();
  await gotoweOdnosniki;
  window.addEventListener("hashchange", trasa);
  trasa();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

init();
