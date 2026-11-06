// Nauka: 10 bloków do egzaminu (cel, po ludzku, przykład, kontekst, zasady z paragrafami, ściąga, pułapki,
// praktyka, pytania na zrozumienie, sprawdzian), egzamin próbny z pytań wszystkich bloków, plan do 18.11,
// 5 poziomów, pułapki w nauce i ściąga A4 do druku. Dane: data/kurs.json (skrypty/zbuduj_kurs.py).
//
//   blok ─► czytam ─► „Czy rozumiesz?” ─► sprawdzian (≥70%) ─► praktyka ─► wytłumacz własnymi słowami

const PROG_SPRAWDZIANU = 0.7;
const MINUT_W_GODZINIE = 60;
const PYTAN_W_EGZAMINIE = 60;

// Baza wiedzy ułożona tematycznie, nie według dni kursu (decyzja Tomka 31.10 - dni po kursie przeszkadzają).
// Każda lekcja i każdy temat Materiałów z dni należy do jednego działu; reszta dni trafia do „Kurs i egzamin”.
const DZIALY = [
  { id: "inspektor", nazwa: "Inspektor, obiekt i przepisy", opis: "Obowiązki właściciela, IBP, szkolenia, kontrole i organizacja ochrony ppoż.",
    lekcje: ["obowiazki", "ibp", "organizacja", "kontrole", "system"], materialy: ["p1", "p2", "p3", "p4", "p5", "p6", "p8", "p9", "p10", "p11", "p12", "p19", "p20", "p21", "p27"] },
  { id: "budynek", nazwa: "Budynek, ewakuacja, drogi i woda", opis: "Kategorie i strefy, odporność ogniowa, odległości, ewakuacja, drogi pożarowe, woda do gaszenia.",
    lekcje: ["budynki", "ewakuacja", "woda"], materialy: ["p16", "p22", "p15", "p31", "p13", "p23", "p33"] },
  { id: "instalacje", nazwa: "Instalacje i urządzenia", opis: "Elektryka, fotowoltaika, ogrzewanie i gaz, urządzenia przeciwpożarowe, gaśnice.",
    lekcje: ["instalacje", "ogrzewanie", "sprzet", "urzadzenia"], materialy: ["p25", "p28", "p14", "p18", "p32", "p30"] },
  { id: "zagrozenia", nazwa: "Spalanie, wybuchy i zagrożenia", opis: "Jak powstaje i rozwija się pożar, strefy zagrożenia wybuchem, prace niebezpieczne, poważne awarie.",
    lekcje: ["spalanie", "prace", "awarie"], materialy: ["p29", "p7", "p17", "p26"] },
  { id: "pozar", nazwa: "Gdy dojdzie do pożaru", opis: "Działania ratownicze, ewakuacja ludzi i mienia, ustalanie przyczyn pożaru.",
    lekcje: ["akcja", "przyczyny"], materialy: ["p34", "p35"] },
];

// Przestawia dane po wczytaniu: lekcje w kolejności działów (z nowymi numerami), sekcje Materiałów = działy.
function ulozDzialy() {
  const k = stan.kurs;
  const m = stan.materialy;
  const bloki = DZIALY.flatMap((d) => d.lekcje.map((id) => {
    const b = k.bloki.find((x) => x.id === id);
    b.dzial = d;
    return b;
  }));
  const bezDzialu = k.bloki.filter((b) => !bloki.includes(b));
  k.bloki = bloki.concat(bezDzialu);
  k.bloki.forEach((b, i) => (b.nr = i + 1));

  const wDzialach = new Set(DZIALY.flatMap((d) => d.materialy));
  const sekcjaKursu = m.sekcje.find((s) => s.id === "kurs");
  const zDni = m.sekcje.filter((s) => s.id.startsWith("dzien")).flatMap((s) => s.tematy.map((id) => {
    const t = m.tematy.find((x) => x.id === id);
    if (t && t.tytul === "Wstęp") {
      t.tytul = `${s.nazwa} - wstęp do zajęć`;
    }
    return id;
  }));
  sekcjaKursu.tematy.push(...zDni.filter((id) => !wDzialach.has(id)));
  sekcjaKursu.podtytul = "Terminy, zasady egzaminu, praca zaliczeniowa i przewodniki po dniach zajęć";
  const dzialy = DZIALY.map((d, i) => ({ id: `dz-${d.id}`, nazwa: d.nazwa, podtytul: d.opis, nr: i + 1, tematy: d.materialy }));
  const pozostale = m.sekcje.filter((s) => !s.id.startsWith("dzien") && s.id !== "kurs");
  m.sekcje = dzialy.concat(pozostale, [sekcjaKursu]);
  m.sekcje.forEach((s) => s.tematy.forEach((id) => {
    const t = m.tematy.find((x) => x.id === id);
    if (t) {
      t.sekcja = s.id;
    }
  }));
}

TRASY.push(
  [/^#\/nauka$/, () => widokNauki()],
  [/^#\/nauka\/blok\/([\w-]+)$/, (m) => widokBloku(m[1])],
  [/^#\/nauka\/sciaga$/, () => widokSciagiA4()],
  [/^#\/nauka\/plan$/, () => widokPlanu()],
  [/^#\/nauka\/poziomy$/, () => widokPoziomow()],
  [/^#\/nauka\/pulapki$/, () => widokPulapekNauki()],
  [/^#\/nauka\/egzamin$/, () => widokEgzaminu()],
);

function postepNauki() {
  return Object.assign({ przeczytane: {}, sprawdzian: {}, zrozumienie: {}, praktyka: {}, wyjasnione: {}, egzaminy: [] }, czytaj(KLUCZ.nauka, {}));
}

function zapiszPostep(zmiana) {
  const p = postepNauki();
  zmiana(p);
  zapisz(KLUCZ.nauka, p);
}

function zdanyBlok(p, id) {
  return p.sprawdzian[id] && p.sprawdzian[id].wynik >= PROG_SPRAWDZIANU;
}

// Poziom 1-5 z postępu: każdy kolejny wymaga spełnienia wcześniejszych (opis w kurs.json → poziomy).
function obecnyPoziom(p) {
  const wszystkie = (warunek) => stan.kurs.bloki.every((b) => warunek(b.id));
  const progi = [
    wszystkie((id) => p.przeczytane[id]),
    wszystkie((id) => p.zrozumienie[id]),
    wszystkie((id) => zdanyBlok(p, id)) && p.egzaminy.some((e) => e.wynik >= PROG_SPRAWDZIANU),
    wszystkie((id) => p.praktyka[id]),
    wszystkie((id) => p.wyjasnione[id]),
  ];
  let poziom = 1;
  for (const spelniony of progi) {
    if (!spelniony) {
      break;
    }
    poziom++;
  }
  return Math.min(poziom, progi.length);
}

// 75 -> "1 h 15 min", 120 -> "2 h", 45 -> "45 min"
function godziny(min) {
  const h = Math.floor(min / MINUT_W_GODZINIE);
  const m = min % MINUT_W_GODZINIE;
  if (!h) {
    return `${m} min`;
  }
  return m ? `${h} h ${m} min` : `${h} h`;
}

// Wiersz lekcji: numer, tytuł, cel i stan - bez ikon i kafelków.
function wierszLekcji(b, p) {
  const zdany = zdanyBlok(p, b.id);
  const st = p.wyjasnione[b.id] ? ["wyjaśniona ✓", "ok"] : zdany ? [`zaliczona ✓`, "ok"] : p.sprawdzian[b.id] ? [`${Math.round(p.sprawdzian[b.id].wynik * 100)}%`, ""] : [godziny(b.glowny), ""];
  return `<a class="lekcja-wiersz" href="#/nauka/lekcja/${b.id}"><span class="nr">${String(b.nr).padStart(2, "0")}</span>
    <span class="tyt">${tekst(b.tytul)}</span><span class="st ${st[1]}">${st[0]}</span><span class="cel">${tekst(b.cel)}</span></a>`;
}

// Następna lekcja do zrobienia: pierwsza niezaliczona.
function nastepnaLekcja(p) {
  return stan.kurs.bloki.find((b) => !zdanyBlok(p, b.id)) || stan.kurs.bloki[0];
}

// Dział: lekcje i odnośniki do materiałów z tego działu.
function dzialNauki(d, i, p) {
  const lekcje = d.lekcje.map((id) => stan.kurs.bloki.find((b) => b.id === id)).filter(Boolean);
  const materialy = d.materialy.map((id) => stan.materialy.tematy.find((x) => x.id === id)).filter(Boolean);
  return `<section class="dzial" id="dzial-${d.id}">
    <div class="dzial-naglowek"><span>${i + 1}</span><b>${tekst(d.nazwa)}</b></div>
    <p class="dzial-opis">${tekst(d.opis)}</p>
    ${lekcje.map((b) => wierszLekcji(b, p)).join("")}
    ${materialy.length ? `<p class="mat-linki"><span>Materiały:</span> ${materialy.map((m) => `<a href="#/m/${m.id}">${tekst(m.tytul.replace(/^\d+\.\s*/, ""))}</a>`).join("")}</p>` : ""}</section>`;
}

function widokNauki() {
  ustawNaglowek("Nauka", "");
  ustawZakladke("nauka");
  const k = stan.kurs;
  const p = postepNauki();
  const zdane = k.bloki.filter((b) => zdanyBlok(p, b.id)).length;
  const poziom = obecnyPoziom(p);
  const nast = nastepnaLekcja(p);
  const ostatni = p.egzaminy[p.egzaminy.length - 1];
  widok.innerHTML = `
    <div class="section-header"><div class="section-title">Nauka</div>
    <div class="section-sub">${tekst("Pięć działów wiedzy inspektora. W każdym lekcje (rysunek, przykłady, przepis, sprawdzian) i opracowane materiały kursu.")}</div></div>
    <div class="postep-linia"><div style="width:${(zdane / k.bloki.length) * 100}%"></div></div>
    <p class="postep-opis">${tekst(`${zdane} z ${k.bloki.length} lekcji zaliczonych · poziom ${poziom} z 5`)}</p>
    <div class="btn-row"><a class="pastylka" href="#/nauka/lekcja/${nast.id}">${tekst(zdane ? `Dalej: ${nast.tytul}` : "Zacznij od pierwszej lekcji")}</a></div>
    ${DZIALY.map((d, i) => dzialNauki(d, i, p)).join("")}
    <div class="section-label">SPRAWDŹ SIĘ</div>
    <p class="section-sub srodek" style="margin-top:0">${tekst(`${PYTAN_W_EGZAMINIE} pytań ze wszystkich lekcji, jak na egzaminie. ${ostatni ? `Ostatni wynik: ${Math.round(ostatni.wynik * 100)}%.` : ""}`)}</p>
    <div class="btn-row"><a class="pastylka szara" href="#/nauka/egzamin">Rozpocznij test</a></div>
    <div class="section-label">FISZKI</div>
    <p class="section-sub srodek" style="margin-top:0">${tekst("Pojęcia ze słowniczków i skróty - nauka jak słówek, po 10 kart.")}</p>
    <div class="btn-row"><a class="pastylka szara" href="#/fiszki">Otwórz fiszki</a></div>
    <div class="section-label">PYTANIA EGZAMINACYJNE</div>
    <p class="section-sub srodek" style="margin-top:0">${tekst("648 pytań z bazy kursu, tematami, z wyjaśnieniem każdej odpowiedzi.")}</p>
    <div class="btn-row"><a class="pastylka szara" href="#/pytania">Otwórz pytania</a></div>
    <div class="linki-tekst"><a class="link-tekst" href="#/nauka/sciaga">Ściąga A4</a><a class="link-tekst" href="#/nauka/poziomy">Poziomy</a><a class="link-tekst" href="#/nauka/pulapki">Pułapki w nauce</a></div>
    <div class="foot">${tekst("Każda zasada ma cytat z przepisu sprawdzony automatycznie. Teoria spalania pochodzi z materiałów kursu CS PSP. Przykłady są ilustracyjne.")}</div>`;
}

// Źródło: paragraf w zakładce Przepisy albo materiał kursu.
function zrodloNauki(zr) {
  if (zr.kurs) {
    return `<span class="chip">${esc(zr.kurs)}</span>`;
  }
  if (zr.zalacznik) {
    return `<a class="chip red" href="${esc(zr.url)}" target="_blank" rel="noopener">${esc(zr.zalacznik)} ›</a>`;
  }
  return `<a class="chip red" href="${esc(adresUrzedowy(zr.akt, zr.etykieta, { cytat: zr.dowod }))}" target="_blank" rel="noopener">${esc(zr.etykieta)} · ${esc(zr.nazwa)} ↗</a>`;
}

function przycisk(b, rodzaj, zrobione, napisZrobione, napis) {
  return `<button class="btn ${zrobione ? "secondary" : ""}" onclick="oznaczBlok('${b.id}','${rodzaj}')">${zrobione ? napisZrobione : napis}</button>`;
}

function widokBloku(id) {
  const b = stan.kurs.bloki.find((x) => x.id === id);
  if (!b) {
    location.replace("#/nauka");
    return;
  }
  ustawNaglowek(`Blok ${b.nr}`, "#/nauka");
  ustawZakladke("nauka");
  const p = postepNauki();
  const i = stan.kurs.bloki.indexOf(b);
  const nastepny = stan.kurs.bloki[i + 1];
  stan.odpowiedzi = {};
  stan.pytaniaBloku = b.sprawdzian.map(tasujOdpowiedzi);
  widok.innerHTML = `
    <div class="unit-head"><div class="unit-label" style="font-size:24px">${tekst(b.tytul)}</div>
      <div class="unit-act">${tekst(`Blok ${b.nr} z ${stan.kurs.bloki.length} · ${b.dzial ? b.dzial.nazwa : ""} · plan główny ${godziny(b.glowny)}, rozszerzony ${godziny(stan.kurs.czas.rozszerzony / stan.kurs.bloki.length)}`)}</div></div>
    <div class="btn-row"><a class="btn" href="#/nauka/lekcja/${b.id}">Przejdź lekcję (nowy widok)</a></div>
    <div class="card"><div class="fun-label">Cel</div><p>${tekst(b.cel)}</p>
      <div class="fun-label" style="margin-top:10px">Zakres</div><ul class="lista">${b.zakres.map((x) => `<li>${tekst(x)}</li>`).join("")}</ul></div>
    <div class="card ludzku"><div class="fun-label">Po ludzku</div><p>${tekst(b.po_ludzku)}</p></div>
    <div class="card"><div class="fun-label">Przykład</div><p>${tekst(b.przyklad)}</p></div>
    <div class="card"><div class="fun-label">Po co Ci to (egzamin i praca)</div><p>${tekst(b.kontekst)}</p></div>
    <div class="section-label">Zasady z przepisów · ${b.zasady.length}</div>
    ${b.zasady.map((z) => `<div class="card zasada"><p>${tekst(z.t)}</p><div class="links">${zrodloNauki(z.zr)}</div></div>`).join("")}
    ${(b.sekcje || []).map((sek) => `<div class="section-label">${tekst(sek.tytul)}</div>${sek.wstep ? `<p class="opis-trybu">${tekst(sek.wstep)}</p>` : ""}
      ${sek.punkty.map((x) => `<div class="card zasada"><p>${tekst(x.t)}</p><div class="links">${zrodloNauki(x.zr)}</div></div>`).join("")}`).join("")}
    ${(b.obliczenia || []).length ? `<div class="section-label">Policz krok po kroku</div>${b.obliczenia.map((o) => `<div class="card"><div class="fun-label">${tekst(o.tytul)}</div><p>${tekst(o.dane)}</p><ol class="lista">${o.kroki.map((k) => `<li>${tekst(k)}</li>`).join("")}</ol><p><b>${tekst(o.wynik)}</b></p></div>`).join("")}` : ""}
    ${(b.pojecia || []).length ? `<div class="section-label">Słowniczek</div>${b.pojecia.map((x) => `<div class="card zasada"><p><b>${tekst(x.nazwa)}</b> - ${tekst(x.t)}</p><div class="links">${zrodloNauki(x.zr)}</div></div>`).join("")}` : ""}
    <div class="card summary"><div class="fun-label">Ściąga</div><ul>${b.sciaga.map((x) => `<li>${tekst(x)}</li>`).join("")}</ul></div>
    <div class="section-label">Pułapki na teście i w terenie</div>
    ${b.pulapki.map((x) => `<div class="card amber pulapka"><p class="zle-zdanie"><span class="znacznik">Błąd</span>${tekst(x.blad)}</p><p><span class="znacznik ok">Prawda</span>${tekst(x.prawda)}</p></div>`).join("")}
    <div class="card"><div class="fun-label">Praktyka</div><p>${tekst(b.praktyka)}</p></div>
    <div class="btn-row">${przycisk(b, "praktyka", p.praktyka[b.id], "Zadanie zrobione ✓", "Zrobiłem zadanie")}</div>
    <div class="section-label">Czy rozumiesz? Odpowiedz sam, potem odsłoń</div>
    ${b.zrozumienie.map((x) => `<details class="card dopytanie"><summary>${tekst(x.q)}<span class="odslon">pokaż</span></summary><p>${tekst(x.a)}</p></details>`).join("")}
    <div class="btn-row">${przycisk(b, "zrozumienie", p.zrozumienie[b.id], "Odpowiedziałem sam ✓", "Odpowiedziałem sam, bez podglądania")}</div>
    <div class="section-label">Sprawdzian · ${b.sprawdzian.length} pytań · zalicza ${PROG_SPRAWDZIANU * 100}%</div>
    <div id="sprawdzian">${stan.pytaniaBloku.map((q, n) => pytanieTestu(q, n)).join("")}</div>
    <div class="btn-row"><button class="btn" onclick="sprawdzTest('blok','${b.id}')">Sprawdź odpowiedzi</button></div>
    <div id="wynik-testu">${p.sprawdzian[b.id] ? `<p class="opis-trybu">${tekst(`Ostatni wynik: ${Math.round(p.sprawdzian[b.id].wynik * 100)}%`)}</p>` : ""}</div>
    <div class="section-label">Wytłumacz własnymi słowami</div>
    <div class="card"><p>${tekst("Najskuteczniejszy krok: opowiedz ten blok tak, jakbyś tłumaczył znajomemu. Nauczyciel AI oceni, co jest dobrze, czego brakuje, wyjaśni lukę na innym przykładzie i poprosi o poprawkę - aż będzie dobrze.")}</p>
      <div class="btn-row" style="margin:10px 0 0"><a class="btn" href="#/nauka/wyjasnij/${b.id}">Zacznij z nauczycielem</a></div>
      <p class="pomoc">${tekst(p.wyjasnione[b.id] ? "Ten blok wyjaśniłeś z oceną „Dobrze”." : "Bez AI: opowiedz blok na głos z pamięci, porównaj z zasadami i oznacz ręcznie.")}</p>
      ${p.wyjasnione[b.id] ? "" : `<div class="btn-row" style="margin:6px 0 0"><button class="btn small secondary" onclick="oznaczBlok('${b.id}','wyjasnione')">Wyjaśniłem sam (bez AI)</button></div>`}</div>
    <div class="btn-row">${p.przeczytane[b.id] ? "" : `<button class="btn secondary" onclick="oznaczBlok('${b.id}','przeczytane')">Przeczytane</button>`}
      ${nastepny ? `<a class="btn" href="#/nauka/blok/${nastepny.id}">Blok ${nastepny.nr} ›</a>` : `<a class="btn" href="#/nauka">Wszystkie bloki</a>`}</div>`;
}

// Kopia pytania z odpowiedziami w losowej kolejności - żeby nie uczyć się „zawsze B”.
function tasujOdpowiedzi(q) {
  const kolejnosc = q.o.map((_, i) => i);
  for (let i = kolejnosc.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kolejnosc[i], kolejnosc[j]] = [kolejnosc[j], kolejnosc[i]];
  }
  return Object.assign({}, q, { o: kolejnosc.map((i) => q.o[i]), ok: kolejnosc.indexOf(q.ok) });
}

function pytanieTestu(q, n) {
  return `<div class="card pytanie-kursu" id="pk-${n}"><p><b>${n + 1}. ${tekst(q.q)}</b>${q.moje ? ` <span class="znacznik ok">Twoje zaznaczenie</span>` : ""}</p>
    ${q.o.map((o, k) => `<button class="opcja" onclick="wybierzOdp(${n},${k})" id="pk-${n}-${k}">${String.fromCharCode(65 + k)}. ${tekst(o)}</button>`).join("")}
    <div class="wyjasnienie" id="pk-${n}-w" hidden><p>${tekst(q.wyj)}</p><div class="links">${zrodloNauki(q.zr)}</div></div></div>`;
}

function wybierzOdp(n, k) {
  stan.odpowiedzi[n] = k;
  document.querySelectorAll(`#pk-${n} .opcja`).forEach((el, i) => el.classList.toggle("wybrana", i === k));
}

// Sprawdza test bloku albo egzamin próbny, pokazuje poprawne odpowiedzi i zapisuje wynik.
function sprawdzTest(tryb, id) {
  const pytania = tryb === "blok" ? stan.pytaniaBloku : stan.egzamin;
  if (Object.keys(stan.odpowiedzi).length < pytania.length) {
    pokazKomunikat("Odpowiedz najpierw na wszystkie pytania.");
    return;
  }
  let dobre = 0;
  pytania.forEach((q, n) => {
    const odp = stan.odpowiedzi[n];
    if (odp === q.ok) {
      dobre++;
    }
    document.getElementById(`pk-${n}-${q.ok}`).classList.add("dobra");
    if (odp !== q.ok) {
      document.getElementById(`pk-${n}-${odp}`).classList.add("zla");
    }
    document.getElementById(`pk-${n}-w`).hidden = false;
  });
  const wynik = dobre / pytania.length;
  zapiszPostep((p) => {
    if (tryb === "blok") {
      p.sprawdzian[id] = { wynik, kiedy: Date.now() };
      p.przeczytane[id] = true;
    } else {
      p.egzaminy.push({ wynik, dobre, razem: pytania.length, kiedy: Date.now() });
    }
  });
  const zdany = wynik >= PROG_SPRAWDZIANU;
  const rada = tryb === "blok"
    ? (zdany ? "Zaliczone. Teraz najważniejsze: wytłumacz ten blok własnymi słowami." : "Jeszcze nie. Przeczytaj wyjaśnienia przy błędnych odpowiedziach i zasady, do których prowadzą, a potem wróć do sprawdzianu.")
    : (zdany ? "Zdany. Powtórz bloki, w których się pomyliłeś (wyjaśnienia pod pytaniami)." : "Niezdany. Wróć do bloków z błędnymi odpowiedziami - link pod każdym wyjaśnieniem.");
  const el = document.getElementById("wynik-testu");
  el.innerHTML = `<div class="card ${zdany ? "summary" : "amber"}"><p><b>${tekst(`Wynik: ${dobre}/${pytania.length} (${Math.round(wynik * 100)}%)`)}</b></p><p>${tekst(rada)}</p></div>`;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}

function oznaczBlok(id, rodzaj) {
  zapiszPostep((p) => {
    p[rodzaj][id] = true;
    p.przeczytane[id] = true;
  });
  const y = window.scrollY;
  widokBloku(id);
  window.scrollTo(0, y);
}

// ── Egzamin próbny: losowe pytania ze sprawdzianów wszystkich bloków ──

function wszystkiePytania() {
  return stan.kurs.bloki.flatMap((b) => b.sprawdzian.map((q) => Object.assign({ blok: b }, q)));
}

function widokEgzaminu() {
  ustawNaglowek("Egzamin próbny", "#/nauka");
  ustawZakladke("nauka");
  const pula = wszystkiePytania();
  for (let i = pula.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pula[i], pula[j]] = [pula[j], pula[i]];
  }
  // Pytania z zaznaczeń Tomka zawsze w egzaminie (na początku puli), reszta losowo.
  const moje = pula.filter((q) => q.moje);
  const reszta = pula.filter((q) => !q.moje);
  stan.egzamin = moje.concat(reszta).slice(0, PYTAN_W_EGZAMINIE).map(tasujOdpowiedzi);
  for (let i = stan.egzamin.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stan.egzamin[i], stan.egzamin[j]] = [stan.egzamin[j], stan.egzamin[i]];
  }
  stan.odpowiedzi = {};
  const p = postepNauki();
  widok.innerHTML = `
    <div class="section-header"><div class="section-title">Egzamin próbny</div>
    <div class="section-sub">${tekst(`${stan.egzamin.length} pytań w losowej kolejności ze sprawdzianów wszystkich bloków, 3 odpowiedzi, jedna dobra - jak na prawdziwym egzaminie (60 pytań, 75 minut, zalicza 42). To pytania ułożone z przepisów i materiałów kursu, nie oficjalna pula CS PSP.`)}</div></div>
    ${p.egzaminy.length ? `<p class="opis-trybu">${tekst(`Poprzednie wyniki: ${p.egzaminy.slice(-5).map((e) => Math.round(e.wynik * 100) + "%").join(", ")}`)}</p>` : ""}
    <div id="sprawdzian" style="margin-top:12px">${stan.egzamin.map((q, n) => pytanieTestu(q, n)).join("")}</div>
    <div class="btn-row"><button class="btn" onclick="sprawdzTest('egzamin')">Zakończ i sprawdź</button></div>
    <div id="wynik-testu"></div>
    <div class="btn-row"><button class="btn secondary" onclick="widokEgzaminu();window.scrollTo(0,0)">Nowy egzamin (inne pytania)</button></div>`;
}

// ── Ściąga A4, plan, poziomy, pułapki ──

function widokSciagiA4() {
  ustawNaglowek("Ściąga A4", "#/nauka");
  ustawZakladke("nauka");
  widok.innerHTML = `
    <div class="btn-row nie-drukuj"><button class="btn" onclick="window.print()">Drukuj / zapisz PDF</button></div>
    <div class="a4">
      <h1>Inspektor ochrony ppoż. - ściąga</h1>
      <p class="a4-pod">${tekst("Kurs CS PSP 2026 · egzamin: 60 pytań, 75 min, zalicza 42 · przepisy z ISAP, stan 27.10.2026")}</p>
      <div class="a4-siatka">${stan.kurs.bloki.map((b) => `<section><h2>${b.nr}. ${tekst(b.tytul)}</h2><ul>${b.sciaga.map((x) => `<li>${tekst(x)}</li>`).join("")}</ul>
        <p class="a4-pulapka">${tekst(b.pulapki[0].prawda)}</p></section>`).join("")}</div>
      <p class="a4-pod">${tekst("Pełne zasady z paragrafami: aplikacja Inspektor PPOŻ → Nauka.")}</p>
    </div>`;
}

function widokPlanu() {
  ustawNaglowek("Plan nauki", "#/nauka");
  ustawZakladke("nauka");
  const k = stan.kurs;
  const blok = (id) => k.bloki.find((b) => b.id === id);
  widok.innerHTML = `
    <div class="section-header"><div class="section-title">Plan do egzaminu 18.11</div>
    <div class="section-sub">${tekst(`Dwa warianty: główny ${godziny(k.czas.glowny)} - tylko rdzeń, czas zależny od wagi tematu; rozszerzony ${godziny(k.czas.rozszerzony)} - 10 pełnych bloków po 2 h. 10 × 2 h to 20 h, nie 12, dlatego plan główny skraca mniej ważne bloki zamiast wszystkich po równo.`)}</div></div>
    <div class="section-label">Kiedy co</div>
    ${k.plan.map((e) => `<div class="card"><div class="fun-label">${tekst(e.kiedy)}</div><p>${tekst(e.co)}</p>
      ${e.bloki.length ? `<div class="links">${e.bloki.map(blok).filter(Boolean).map((b) => `<a class="chip red" href="#/nauka/blok/${b.id}">${b.nr}. ${esc(b.tytul)} ›</a>`).join("")}</div>` : ""}</div>`).join("")}
    <div class="section-label">Czas na blok: główny / rozszerzony</div>
    <div class="list-group">${k.bloki.map((b) => wiersz(`#/nauka/blok/${b.id}`, String(b.nr), "#5e35b1", b.tytul, `${godziny(b.glowny)} / ${godziny(k.czas.rozszerzony / k.bloki.length)}`)).join("")}</div>
    <div class="card info" style="margin-top:12px"><p>${tekst("Czas jest orientacyjny. Do następnego bloku przechodzisz, gdy zaliczysz sprawdzian, a nie gdy minie zaplanowana godzina.")}</p></div>`;
}

function widokPoziomow() {
  ustawNaglowek("Poziomy", "#/nauka");
  ustawZakladke("nauka");
  const obecny = obecnyPoziom(postepNauki());
  widok.innerHTML = `
    <div class="section-header"><div class="section-title">5 poziomów</div>
    <div class="section-sub">${tekst("Od „nic nie wiem” do „mógłbym tego uczyć”. Poziom liczy się sam z Twojego postępu - samo przeczytanie nie wystarczy.")}</div></div>
    ${stan.kurs.poziomy.map((z) => `<div class="card ${z.nr === obecny ? "summary" : ""}"><div class="fun-label">${z.nr < obecny ? "✓" : z.nr === obecny ? "→" : "·"} Poziom ${z.nr}: ${tekst(z.nazwa)}</div>
      <p><b>Będę umiał:</b> ${tekst(z.umiem)}</p><p><b>Jak:</b> ${tekst(z.jak)}</p>
      <p><b>Czas:</b> ${tekst(z.czas)}</p><p><b>Gotowy dalej, gdy:</b> ${tekst(z.gotowy)}</p></div>`).join("")}`;
}

function widokPulapekNauki() {
  ustawNaglowek("Pułapki w nauce", "#/nauka");
  ustawZakladke("nauka");
  widok.innerHTML = `
    <div class="section-header"><div class="section-title">5 pułapek w nauce</div>
    <div class="section-sub">${tekst("Najczęstsze sposoby, żeby przed tym egzaminem zmarnować czas - i co robić zamiast tego.")}</div></div>
    ${stan.kurs.pulapki.map((x, n) => `<div class="card"><div class="fun-label">${n + 1}. ${tekst(x.t)}</div>
      <p><b>Na czym polega:</b> ${tekst(x.na_czym)}</p><p><b>Dlaczego w nią wpadamy:</b> ${tekst(x.dlaczego)}</p>
      <p><b>Skutek:</b> ${tekst(x.skutek)}</p><p><b>Zamiast tego:</b> ${tekst(x.zamiast)}</p></div>`).join("")}`;
}
