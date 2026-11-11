// Pytania egzaminacyjne - baza 648 pytań z kursu, sprawdzona z przepisami (egzamin/WERYFIKACJA PYTAN).
// Każde pytanie ma prawidłową odpowiedź, wyjaśnienie „dlaczego” i fragmenty bazy wiedzy z lekcji.
//
//   #/pytania            ─► tematy + postęp + „Ćwicz” / „Moje trudne”
//   #/pytania/t/KOD      ─► lista pytań tematu: odpowiedź zaznaczona, „Wyjaśnij” rozwija więcej
//   #/pytania/cw/KOD     ─► ćwiczenie: pytanie po pytaniu, wynik zapisany (KOD = temat, wszystkie, trudne)
//   #/pytania/p/NR       ─► jedno pytanie (z wyszukiwarki)
//
// Postęp: localStorage „insp-pytania” = { nr: [dobrych, złych, ostatnia_dobra 1/0] }.

const KLUCZ_PYTAN = "insp-pytania";
const PYTAN_W_CWICZENIU = 20;
const WSZYSTKIE = "wszystkie";
const TRUDNE = "trudne";
const KLUCZ_OSTATNICH = "insp-pytania-ostatnie";
const PAMIEC_OSTATNICH = 60;
const LITERY = "abcd";
// Wyjaśnienie odwołuje się do litery („b) Typ C”) - takiego pytania nie tasujemy.
const ODWOLANIE_DO_LITERY = /(^|[^\p{L}])[a-d]\)/u;

// Uwagi z weryfikacji - co znaczy dana ocena dla kogoś, kto uczy się do egzaminu.
const OCENY = {
  "BŁĄD": "W kluczu z kursu zaznaczono inną odpowiedź - to błąd klucza.",
  "BRAK ZAZNACZENIA": "W pliku z kursu nie zaznaczono żadnej odpowiedzi.",
  "NIEAKTUALNE": "Odpowiedź z klucza opiera się na przepisie, który się zmienił.",
  "SPORNE": "Odpowiedź z klucza budzi wątpliwości - warto dopytać wykładowcę.",
  "NIEPOTWIERDZONE": "Nie udało się potwierdzić tej odpowiedzi w materiałach ani przepisach - przyjęta odpowiedź z klucza.",
};

TRASY.push(
  [/^#\/pytania$/, () => widokPytan()],
  [/^#\/pytania\/t\/(\w+)$/, (m) => widokTematuPytan(m[1])],
  [/^#\/pytania\/cw\/(\w+)$/, (m) => widokCwiczenia(m[1])],
  [/^#\/pytania\/p\/(\d+)$/, (m) => widokJednegoPytania(Number(m[1]))],
);

async function wczytajPytania() {
  if (!stan.pytania) {
    stan.pytania = await fetch("data/pytania.json").then((r) => r.json());
  }
  return stan.pytania;
}

function wynikiPytan() {
  return czytaj(KLUCZ_PYTAN, {});
}

function zapiszOdpowiedz(nr, dobra) {
  const w = wynikiPytan();
  const [d, z] = w[nr] || [0, 0, 0];
  w[nr] = dobra ? [d + 1, z, 1] : [d, z + 1, 0];
  zapisz(KLUCZ_PYTAN, w);
}

// Stan pytania: „umiem” (ostatnio dobrze), „trudne” (ostatnio źle), „nowe” (jeszcze nie ćwiczone).
function stanPytania(w, nr) {
  if (!w[nr]) {
    return "nowe";
  }
  return w[nr][2] ? "umiem" : "trudne";
}

function pytaniaTematu(kod) {
  const p = stan.pytania.pytania;
  if (kod === WSZYSTKIE) {
    return p;
  }
  if (kod === TRUDNE) {
    const w = wynikiPytan();
    return p.filter((q) => stanPytania(w, q.nr) === "trudne");
  }
  return p.filter((q) => q.temat === kod);
}

function nazwaTematu(kod) {
  if (kod === WSZYSTKIE) {
    return "Wszystkie tematy";
  }
  if (kod === TRUDNE) {
    return "Moje trudne pytania";
  }
  const t = stan.pytania.tematy.find((x) => x.kod === kod);
  return t ? t.nazwa : kod;
}

function licznikStanow(lista) {
  const w = wynikiPytan();
  const l = { umiem: 0, trudne: 0, nowe: 0 };
  lista.forEach((q) => l[stanPytania(w, q.nr)]++);
  return l;
}

function pasekStanow(l, razem) {
  const proc = (n) => `${(n / razem) * 100}%`;
  return `<div class="pb-pasek" aria-hidden="true"><i class="umiem" style="width:${proc(l.umiem)}"></i><i class="trudne" style="width:${proc(l.trudne)}"></i></div>`;
}

function czekaj() {
  widok.innerHTML = `<div class="spinner">Wczytuję pytania…</div>`;
}

// ── Lista tematów ──

async function widokPytan() {
  ustawNaglowek("Pytania z wyjaśnieniami", "#/wiedza");
  ustawZakladke("pytania");
  czekaj();
  const d = await wczytajPytania();
  const l = licznikStanow(d.pytania);
  const tematy = d.tematy.map((t) => ({ t, lista: d.pytania.filter((q) => q.temat === t.kod) })).filter((x) => x.lista.length);
  widok.innerHTML = `
    <div class="section-header"><div class="section-title">Pytania egzaminacyjne</div>
    <div class="section-sub">${tekst(`${d.pytania.length} pytań z bazy kursu, ułożonych tematami. Przy każdym prawidłowa odpowiedź, wyjaśnienie „dlaczego” i fragmenty z lekcji, żebyś umiał to wytłumaczyć innym.`)}</div></div>
    <div class="pb-podsumowanie">
      ${pasekStanow(l, d.pytania.length)}
      <p><b class="umiem">${l.umiem}</b> umiesz · <b class="trudne">${l.trudne}</b> do powtórki · <b>${l.nowe}</b> jeszcze nie ćwiczone</p>
    </div>
    <div class="btn-row"><a class="pastylka" href="#/pytania/cw/${WSZYSTKIE}">Ćwicz ${PYTAN_W_CWICZENIU} pytań</a>
      ${l.trudne ? `<a class="pastylka szara" href="#/pytania/cw/${TRUDNE}">Moje trudne (${l.trudne})</a>` : ""}</div>
    <p class="opis-trybu">${tekst("Ćwiczenie najpierw daje pytania, które ostatnio poszły źle, potem nowe. Postęp zostaje tylko na tym telefonie.")}</p>
    <div class="section-label">TEMATY</div>
    <div class="list-group">${tematy.map(({ t, lista }) => {
      const lt = licznikStanow(lista);
      return wiersz(`#/pytania/t/${t.kod}`, String(lista.length), KOLORY.test, t.nazwa,
        `${ile(lista.length, "pytanie", "pytania", "pytań")} · umiesz ${lt.umiem}${lt.trudne ? ` · do powtórki ${lt.trudne}` : ""}`);
    }).join("")}</div>
    <div class="foot">${tekst("Odpowiedzi sprawdzone z aktualnymi przepisami (1.11.2026). Przy pytaniach, gdzie klucz z kursu jest błędny, sporny albo nieaktualny, jest wyraźna uwaga.")}</div>`;
}

// ── Jedno pytanie z odpowiedziami i wyjaśnieniem ──

function uwagaPytania(q) {
  if (q.ocena === "OK") {
    return "";
  }
  const klucz = q.klucz && q.klucz !== q.poprawna ? ` W kluczu kursu: ${q.klucz}), prawidłowo: ${q.poprawna}).` : "";
  return `<div class="pb-uwaga"><b>${esc(q.ocena)}</b><p>${tekst(OCENY[q.ocena] + klucz)}</p><p>${tekst(q.uwaga)}</p></div>`;
}

// Tekst do odszukania akapitu w lekcji. Wiersz tabeli („Tytuł: komórka · komórka”) i pojęcie
// („nazwa - opis”) są w lekcji rozbite na komórki, więc szukamy najdłuższej komórki / samego opisu.
function iglaFragmentu(t) {
  if (t.includes(": ") && t.includes(" · ")) {
    return t.slice(t.indexOf(": ") + 2).split(" · ").sort((a, b) => b.length - a.length)[0];
  }
  return t;
}

// Fragmenty bazy wiedzy - kliknięcie otwiera lekcję przewiniętą do tego akapitu.
function powiazanePytania(q) {
  if (!q.powiazane.length) {
    return "";
  }
  const f = q.powiazane.map((i) => stan.pytania.fragmenty[i]);
  return `<p class="pb-etykieta">Więcej z bazy wiedzy</p>${f.map((x) => `<div class="pb-fragment">
    <p>${tekst(x.t)}</p>${x.prosto ? `<p class="pb-prosto"><b>Po ludzku:</b> ${tekst(x.prosto)}</p>` : ""}
    <p class="pb-zrodlo">${tekst(x.zrodlo)} · <a href="#/nauka/lekcja/${x.lekcja}" data-cel-tekst="${esc(iglaFragmentu(x.t))}">otwórz lekcję ›</a></p></div>`).join("")}`;
}

function wyjasnieniePytania(q) {
  const wlasne = q.ocena === "OK" || q.wyjasnienie !== q.uwaga ? `<p class="pb-dlaczego">${tekst(q.wyjasnienie)}</p>` : "";
  return `${uwagaPytania(q)}${wlasne}${powiazanePytania(q)}`;
}

function odpowiedziPytania(q, zakryte) {
  return `<ol class="pb-odp${zakryte ? " zakryte" : ""}">${q.odp.map((o) => {
    const dobra = o.lit === q.poprawna;
    const zKlucza = q.klucz && o.lit === q.klucz && !dobra;
    return `<li class="${dobra ? "dobra" : ""}${zKlucza ? " klucz" : ""}"><span class="lit">${esc(o.lit)})</span><span>${tekst(o.t)}${zKlucza ? ` <em>(w kluczu kursu)</em>` : ""}</span></li>`;
  }).join("")}</ol>`;
}

function kartaPytania(q, zakryte, otwarte) {
  return `<article class="pb-pytanie" id="pyt-${q.nr}" data-nr="${q.nr}">
    <p class="pb-nr">Pytanie ${q.nr}${q.ocena !== "OK" ? ` · <span class="pb-flaga">${esc(q.ocena.toLowerCase())}</span>` : ""}</p>
    <h3>${tekst(q.pytanie)}</h3>
    ${odpowiedziPytania(q, zakryte)}
    <button class="pb-rozwin" onclick="rozwinPytanie(${q.nr})" aria-expanded="${otwarte}">${otwarte ? "Zwiń" : "Wyjaśnij"}</button>
    <div class="pb-wyjasnienie" id="wyj-${q.nr}"${otwarte ? "" : " hidden"}>${otwarte ? wyjasnieniePytania(q) : ""}</div>
  </article>`;
}

// Rozwinięcie dorysowuje wyjaśnienie dopiero na żądanie - lista 78 pytań zostaje lekka.
function rozwinPytanie(nr) {
  const q = stan.pytania.pytania.find((x) => x.nr === nr);
  const el = document.getElementById(`wyj-${nr}`);
  const przycisk = el.previousElementSibling;
  const otworz = el.hidden;
  if (otworz && !el.innerHTML) {
    el.innerHTML = wyjasnieniePytania(q);
  }
  el.hidden = !otworz;
  przycisk.textContent = otworz ? "Zwiń" : "Wyjaśnij";
  przycisk.setAttribute("aria-expanded", otworz);
  // Zakryte odpowiedzi odsłaniają się razem z wyjaśnieniem.
  if (otworz) {
    document.querySelector(`#pyt-${nr} .pb-odp`).classList.remove("zakryte");
  }
}

// Kliknięcie „otwórz lekcję” - lekcja przewinie się do tego akapitu (jak z wyszukiwarki).
widok.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("a[data-cel-tekst]");
  if (a) {
    stan.celPrzewiniecia = a.dataset.celTekst;
  }
});

// ── Lista pytań tematu ──

async function widokTematuPytan(kod) {
  ustawNaglowek("Pytania", "#/pytania");
  ustawZakladke("pytania");
  czekaj();
  await wczytajPytania();
  const lista = pytaniaTematu(kod);
  if (!lista.length) {
    location.replace("#/pytania");
    return;
  }
  const zakryte = czytaj("insp-pytania-zakryte", false);
  widok.innerHTML = `
    <div class="section-header"><div class="section-title" style="font-size:24px">${tekst(nazwaTematu(kod))}</div>
    <div class="section-sub">${tekst(`${ile(lista.length, "pytanie", "pytania", "pytań")}. Prawidłowa odpowiedź jest zaznaczona. „Wyjaśnij” pokazuje, dlaczego, i co jeszcze warto wiedzieć.`)}</div></div>
    <div class="btn-row"><a class="pastylka" href="#/pytania/cw/${kod}">Ćwicz</a>
      <button class="pastylka szara" onclick="przelaczZakrycie()">${zakryte ? "Pokaż odpowiedzi" : "Zakryj odpowiedzi"}</button></div>
    <div class="pb-lista">${lista.map((q) => kartaPytania(q, zakryte, false)).join("")}</div>`;
}

function przelaczZakrycie() {
  zapisz("insp-pytania-zakryte", !czytaj("insp-pytania-zakryte", false));
  const y = window.scrollY;
  trasa();
  window.scrollTo(0, y);
}

async function widokJednegoPytania(nr) {
  ustawNaglowek("Pytanie", "back");
  ustawZakladke("pytania");
  czekaj();
  await wczytajPytania();
  const q = stan.pytania.pytania.find((x) => x.nr === nr);
  if (!q) {
    location.replace("#/pytania");
    return;
  }
  widok.innerHTML = `<div class="pb-lista pojedyncze">${kartaPytania(q, false, true)}</div>
    <div class="btn-row"><a class="pastylka szara" href="#/pytania/t/${q.temat}">${tekst(`Wszystkie z tematu: ${nazwaTematu(q.temat)}`)}</a></div>`;
}

// ── Ćwiczenie: pytanie po pytaniu ──

// Kolejność: najpierw pytania niedawno niewidziane, w nich ostatnio błędne, nowe, umiane - losowo.
// Pytania z poprzedniej rundy idą na sam koniec, więc „Kolejne 20” daje inny zestaw
// (w małym temacie te same pytania, ale w innej kolejności i z przetasowanymi odpowiedziami).
function ulozCwiczenie(lista) {
  const w = wynikiPytan();
  const waga = { trudne: 0, nowe: 1, umiem: 2 };
  const ostatnie = czytaj(KLUCZ_OSTATNICH, []);
  const kara = (nr) => {
    const poz = ostatnie.indexOf(nr);
    if (poz < 0) {
      return 0;
    }
    return poz < PYTAN_W_CWICZENIU ? 6 : 3;
  };
  const wybrane = lista.map((q) => ({ q, k: kara(q.nr) + waga[stanPytania(w, q.nr)] + Math.random() }))
    .sort((a, b) => a.k - b.k).slice(0, PYTAN_W_CWICZENIU).map((x) => tasujPytanie(x.q));
  const pamiec = [...new Set(wybrane.map((q) => q.nr).concat(ostatnie))].slice(0, PAMIEC_OSTATNICH);
  zapisz(KLUCZ_OSTATNICH, pamiec);
  return wybrane;
}

// Kopia pytania z odpowiedziami w losowej kolejności i nowymi literami a, b, c
// (prawidłowa i ta z klucza kursu przeliczone na nowe litery).
function tasujPytanie(q) {
  if (ODWOLANIE_DO_LITERY.test(`${q.wyjasnienie} ${q.uwaga}`)) {
    return q;
  }
  const odp = q.odp.slice();
  for (let i = odp.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [odp[i], odp[j]] = [odp[j], odp[i]];
  }
  const nowa = (lit) => (lit ? LITERY[odp.findIndex((o) => o.lit === lit)] : lit);
  return Object.assign({}, q, {
    odp: odp.map((o, i) => ({ lit: LITERY[i], t: o.t })),
    poprawna: nowa(q.poprawna),
    klucz: nowa(q.klucz),
  });
}

async function widokCwiczenia(kod) {
  ustawZakladke("pytania");
  czekaj();
  await wczytajPytania();
  ustawNaglowek(nazwaTematu(kod), "#/pytania");
  const lista = pytaniaTematu(kod);
  if (!lista.length) {
    location.replace("#/pytania");
    return;
  }
  stan.cwiczenie = { kod, pytania: ulozCwiczenie(lista), i: 0, dobre: 0, bledne: [] };
  rysujCwiczenie();
}

function rysujCwiczenie() {
  const c = stan.cwiczenie;
  const pasek = c.pytania.map((_, k) => `<i class="${k < c.i ? "byl" : k === c.i ? "jest" : ""}"></i>`).join("");
  if (c.i >= c.pytania.length) {
    rysujWynikCwiczenia(pasek);
    return;
  }
  const q = c.pytania[c.i];
  widok.innerHTML = `<div class="pb-cwiczenie">
    <p class="pb-nr">Pytanie ${c.i + 1} z ${c.pytania.length} · nr ${q.nr}</p><div class="pb-kroki">${pasek}</div>
    <h3>${tekst(q.pytanie)}</h3>
    <div class="pb-wybor">${q.odp.map((o) => `<button data-lit="${esc(o.lit)}" onclick="odpowiedzCwiczenia('${esc(o.lit)}')"><span class="lit">${esc(o.lit)})</span><span>${tekst(o.t)}</span></button>`).join("")}</div>
    <div id="cw-wyj" hidden></div></div>`;
  window.scrollTo(0, 0);
}

function odpowiedzCwiczenia(lit) {
  const c = stan.cwiczenie;
  const q = c.pytania[c.i];
  const przyciski = [...document.querySelectorAll(".pb-wybor button")];
  if (przyciski[0].disabled) {
    return;
  }
  const dobra = lit === q.poprawna;
  przyciski.forEach((b) => {
    b.disabled = true;
    b.classList.toggle("dobra", b.dataset.lit === q.poprawna);
    b.classList.toggle("zla", b.dataset.lit === lit && !dobra);
  });
  zapiszOdpowiedz(q.nr, dobra);
  if (dobra) {
    c.dobre++;
  } else {
    c.bledne.push(q);
  }
  const el = document.getElementById("cw-wyj");
  el.hidden = false;
  // „Dalej” od razu pod odpowiedziami - wyjaśnienie niżej, dla chętnych.
  el.innerHTML = `<div class="pb-po-odp">
      <p class="pb-werdykt ${dobra ? "umiem" : "trudne"}">${dobra ? "Dobrze." : `Źle. Prawidłowo: ${esc(q.poprawna)})`}</p>
      <button class="pastylka pb-dalej" onclick="stan.cwiczenie.i++;rysujCwiczenie()">${c.i + 1 < c.pytania.length ? "Dalej" : "Wynik"}</button>
    </div>
    <div class="pb-wyjasnienie">${wyjasnieniePytania(q)}</div>`;
  el.firstElementChild.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function rysujWynikCwiczenia(pasek) {
  const c = stan.cwiczenie;
  const razem = c.pytania.length;
  const proc = Math.round((c.dobre / razem) * 100);
  const rada = proc >= PROG_SPRAWDZIANU * 100
    ? "Na egzaminie to by wystarczyło (zalicza 70%). Przeczytaj jeszcze wyjaśnienia przy błędach - to najszybszy sposób, żeby je zapamiętać."
    : "Na egzaminie to jeszcze za mało (zalicza 70%). Przeczytaj wyjaśnienia przy błędach poniżej, a potem przećwicz „Moje trudne”.";
  widok.innerHTML = `<div class="pb-cwiczenie">
    <p class="pb-nr">Wynik</p><div class="pb-kroki">${pasek}</div>
    <p class="pb-liczba">${c.dobre}/${razem}</p><p class="pb-rada">${tekst(rada)}</p>
    <div class="btn-row" style="margin:16px 0"><button class="pastylka" onclick="widokCwiczenia(stan.cwiczenie.kod)">Kolejne ${PYTAN_W_CWICZENIU}</button>
      <a class="pastylka szara" href="#/pytania">Tematy</a></div></div>
    ${c.bledne.length ? `<div class="section-label">BŁĘDY · ${c.bledne.length}</div><div class="pb-lista">${c.bledne.map((q) => kartaPytania(q, false, false)).join("")}</div>` : ""}`;
  window.scrollTo(0, 0);
}

// ── Wyszukiwarka: pytania jako osobna grupa wyników ──

async function fragmentyPytan() {
  const d = await wczytajPytania();
  if (!stan.indeksPytan) {
    stan.indeksPytan = d.pytania.map((q) => {
      const odp = (q.odp.find((o) => o.lit === q.poprawna) || {}).t || "";
      const t = `${q.pytanie} Odpowiedź: ${odp}. ${q.wyjasnienie}`;
      return { gdzie: `Pytanie ${q.nr} · ${nazwaTematu(q.temat)}`, tekst: t, szukaj: q.pytanie, adres: `#/pytania/p/${q.nr}`, bez: bezOgonkow(t) };
    });
  }
  return stan.indeksPytan;
}
