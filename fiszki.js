// Fiszki - pojęcia i skróty do nauczenia jak słówka (wzór: fiszki w Pomocniku Strażaka).
//
//   #/fiszki         talie: 5 działów (pojęcia ze słowniczków lekcji) + skróty z bazy wiedzy
//   #/fiszki/TALIA   sesja 10 kart: pojęcie → wybierz właściwe znaczenie z 4, potem pełne wyjaśnienie i źródło
//
// Postęp: localStorage „insp-fiszki” = { klucz karty: seria dobrych odpowiedzi z rzędu }; opanowana = 2 z rzędu.

const KLUCZ_FISZEK = "insp-fiszki";
const KART_W_SESJI = 10;
const OPANOWANA = 2;
const ODPOWIEDZI = 4;

TRASY.push(
  [/^#\/fiszki$/, () => widokFiszek()],
  [/^#\/fiszki\/([\w-]+)$/, (m) => widokSesjiFiszek(m[1])],
);

// Talie budowane z danych lekcji - nowe pojęcie w lekcji samo trafia do fiszek.
function talieFiszek() {
  if (stan.talie) {
    return stan.talie;
  }
  const talie = DZIALY.map((d, i) => {
    const widziane = new Set();
    const karty = d.lekcje.flatMap((id) => {
      const b = stan.kurs.bloki.find((x) => x.id === id);
      return b ? b.pojecia.map((p) => ({ p, b })) : [];
    }).filter(({ p }) => !widziane.has(p.nazwa) && widziane.add(p.nazwa)).map(({ p, b }) => ({
      klucz: `p:${p.nazwa}`, przod: p.nazwa, tyl: p.prosto || p.t, fachowo: p.prosto ? p.t : "",
      zrodlo: p.zr && p.zr.etykieta ? `${p.zr.etykieta} ${p.zr.nazwa || ""}`.trim() : "", lekcja: b.id, lekcjaNr: b.nr,
    }));
    return { id: d.id, skrot: `D${i + 1}`, nazwa: d.nazwa, opis: "Pojęcia ze słowniczków lekcji działu", karty };
  });
  talie.push({
    id: "skroty", skrot: "ABC", nazwa: "Skróty", opis: "Skróty używane w przepisach i na kursie",
    karty: Object.entries(SKROTY).map(([s, opis]) => ({ klucz: `s:${s}`, przod: s, tyl: opis.replace(/^.+? - /, ""), fachowo: "", zrodlo: "", lekcja: "" })),
  });
  stan.talie = talie;
  return talie;
}

function wynikiFiszek() {
  return czytaj(KLUCZ_FISZEK, {});
}

function opanowaneFiszki() {
  const w = wynikiFiszek();
  return Object.values(w).filter((n) => n >= OPANOWANA).length;
}

function losowo(lista) {
  return lista.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}

// ── Lista talii ──

function widokFiszek() {
  ustawNaglowek("Fiszki", "#/wiedza");
  ustawZakladke("nauka");
  const w = wynikiFiszek();
  const talie = talieFiszek();
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Pojęcie na karcie - wybierz właściwe znaczenie. Karta jest opanowana po dwóch dobrych odpowiedziach z rzędu. Sesja ma 10 kart, najpierw te jeszcze nieopanowane.")}</div></div>
    <div class="section-label">Talie</div>
    <div class="list-group">${talie.map((t) => {
      const op = t.karty.filter((k) => (w[k.klucz] || 0) >= OPANOWANA).length;
      return `<a class="row" href="#/fiszki/${t.id}">${kafel(t.skrot, t.id === "skroty" ? "#566573" : KOLORY.fiszki)}
        <span class="row-main"><span class="row-title">${tekst(t.nazwa)}</span><span class="row-sub">${tekst(`${t.opis} · opanowane ${op}/${t.karty.length}`)}</span>
        <span class="fiszki-pasek"><i style="width:${(op / t.karty.length) * 100}%"></i></span></span><span class="row-chev">›</span></a>`;
    }).join("")}</div>`;
}

// ── Sesja ──

function widokSesjiFiszek(id) {
  const talia = talieFiszek().find((t) => t.id === id);
  if (!talia) {
    location.replace("#/fiszki");
    return;
  }
  ustawNaglowek(talia.nazwa, "#/fiszki");
  ustawZakladke("nauka");
  const w = wynikiFiszek();
  const karty = losowo(talia.karty).sort((a, b) => Math.min(w[a.klucz] || 0, OPANOWANA) - Math.min(w[b.klucz] || 0, OPANOWANA)).slice(0, KART_W_SESJI);
  stan.fiszki = { talia, karty, i: 0, dobre: 0 };
  rysujFiszke();
}

function rysujFiszke() {
  const f = stan.fiszki;
  if (f.i >= f.karty.length) {
    widok.innerHTML = `<div class="fiszki-sesja"><div class="fiszki-karta">
      <p class="fiszki-kicker">Koniec sesji</p><p class="fiszki-nazwa">${f.dobre} / ${f.karty.length}</p>
      <p class="fiszki-podpis">${tekst(`Opanowane w talii: ${f.talia.karty.filter((k) => (wynikiFiszek()[k.klucz] || 0) >= OPANOWANA).length} z ${f.talia.karty.length}`)}</p></div>
      <div class="btn-row"><button class="pastylka" onclick="widokSesjiFiszek('${f.talia.id}')">Kolejne ${KART_W_SESJI}</button><a class="pastylka szara" href="#/fiszki">Talie</a></div></div>`;
    window.scrollTo(0, 0);
    return;
  }
  const k = f.karty[f.i];
  const inne = losowo(f.talia.karty.filter((x) => x.tyl !== k.tyl)).slice(0, ODPOWIEDZI - 1);
  f.opcje = losowo([k, ...inne]);
  widok.innerHTML = `<div class="fiszki-sesja">
    <div class="fiszki-postep"><i style="width:${(f.i / f.karty.length) * 100}%"></i></div>
    <div class="fiszki-karta">
      <p class="fiszki-kicker">${tekst(`${f.talia.nazwa} · karta ${f.i + 1} z ${f.karty.length}`)}</p>
      <p class="fiszki-nazwa">${tekst(k.przod)}</p>
      <p class="fiszki-podpis">Co to znaczy?</p>
      <div class="fiszki-opcje">${f.opcje.map((o, n) => `<button class="fiszki-opcja" onclick="odpowiedzFiszki(${n})">${tekst(o.tyl)}</button>`).join("")}</div>
      <div id="fiszki-wyj"></div>
    </div></div>`;
  window.scrollTo(0, 0);
}

function odpowiedzFiszki(n) {
  const f = stan.fiszki;
  const k = f.karty[f.i];
  const przyciski = [...document.querySelectorAll(".fiszki-opcja")];
  if (przyciski[0].disabled) {
    return;
  }
  const dobra = f.opcje[n] === k;
  przyciski.forEach((b, j) => {
    b.disabled = true;
    b.classList.toggle("dobra", f.opcje[j] === k);
    b.classList.toggle("zla", j === n && !dobra);
  });
  const w = wynikiFiszek();
  w[k.klucz] = dobra ? (w[k.klucz] || 0) + 1 : 0;
  zapisz(KLUCZ_FISZEK, w);
  if (dobra) {
    f.dobre++;
  }
  const lekcja = k.lekcja ? `<a href="#/nauka/lekcja/${k.lekcja}" data-cel-tekst="${esc(k.przod)}">otwórz lekcję ${k.lekcjaNr} ›</a>` : "";
  document.getElementById("fiszki-wyj").innerHTML = `<div class="fiszki-szczegoly">
    <p class="fiszki-werdykt ${dobra ? "dobrze" : "zle"}">${dobra ? "Dobrze" : "Nie tym razem"}</p>
    ${k.fachowo ? `<p><b>Fachowo:</b> ${tekst(k.fachowo)}</p>` : ""}
    ${k.zrodlo || lekcja ? `<p class="fiszki-zrodlo">${tekst(k.zrodlo)}${k.zrodlo && lekcja ? " · " : ""}${lekcja}</p>` : ""}
    </div><button class="pastylka fiszki-dalej" onclick="stan.fiszki.i++;rysujFiszke()">${f.i + 1 < f.karty.length ? "Dalej" : "Wynik"}</button>`;
}
