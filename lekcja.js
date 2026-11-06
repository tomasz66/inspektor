// Lekcja jako opowieść: jedna myśl na ekran, duża typografia bez pudełek, interaktywny rysunek
// (rysunki.js) zamiast zdjęć, przepisy z paragrafem, pułapki jako karty do odwrócenia i sprawdzian
// po jednym pytaniu. Dane te same co w bloku (data/kurs.json).
//
//   okładka ─► po ludzku ─► rysunek ─► przykład ─► zasady ─► sekcje ─► obliczenia ─► słowniczek
//   ─► zaznaczenia ─► pułapki ─► sprawdzian ─► ściąga   (sekcje, obliczenia, słowniczek - jeśli blok je ma)

TRASY.push([/^#\/nauka\/lekcja\/([\w-]+)$/, (m) => widokLekcji(m[1])]);

// Liczby w tekście („30 m”, „2 kg”, „100 m²”) wyróżnione markerem - oko od razu łapie to, co pada na teście.
function zMarkerem(t) {
  return tekst(t).replace(/(\d+(?:[,.]\d+)?(?:\s|&nbsp;| )?(?:m²|m³|MJ\/m²|kPa|kW|kg|m|dm³|litrów|lata|lat|rok|dni|%)(?![a-ząćęłńóśźżA-Z]))/g, '<mark class="marker">$1</mark>');
}

// Akt źródła punktu - dla gołych „§ 12” w jego treści (odnosniki.js).
function atrAktu(zr) {
  return zr && zr.akt ? ` data-akt="${esc(zr.akt)}"` : "";
}

// Źródło na marginesie: paragraf (link do przepisu), załącznik (link do ISAP) albo materiał kursu.
function marginesLekcji(zr) {
  if (zr.kurs) {
    return `materiał kursu ·<br> ${esc(zr.kurs)}`;
  }
  if (zr.zalacznik) {
    return `<a href="${esc(zr.url)}" target="_blank" rel="noopener">${esc(zr.zalacznik)}</a>`;
  }
  return `<a href="${esc(adresUrzedowy(zr.akt, zr.etykieta, { cytat: zr.dowod }))}" target="_blank" rel="noopener">${esc(zr.etykieta)} ↗</a><br>${esc(zr.nazwa)}`;
}

// Tabele lekcji: najważniejsze liczby do oglądania; źródło pod tabelą (paragraf staje się linkiem).
function ekranTabel(b) {
  if (!(b.tabele || []).length) {
    return "";
  }
  return `<section class="l-ekran l-tabele"><p class="l-znacznik">W tabelach</p>
    ${b.tabele.map((t) => `<div class="l-tabela"><h3>${tekst(t.tytul)}</h3>${t.wstep ? `<p class="l-kontekst">${tekst(t.wstep)}</p>` : ""}
      <div class="l-tabela-przewijana"><table><thead><tr>${t.naglowki.map((h) => `<th>${tekst(h)}</th>`).join("")}</tr></thead>
      <tbody>${t.wiersze.map((w) => `<tr>${w.map((c, k) => (k ? `<td>${tekst(c)}</td>` : `<th scope="row">${tekst(c)}</th>`)).join("")}</tr>`).join("")}</tbody></table></div>
      <p class="l-tabela-zrodlo">${tekst(t.zrodlo)}${t.przypis ? ` · ${tekst(t.przypis)}` : ""}</p></div>`).join("")}
  </section>`;
}

function ekranySekcji(b) {
  const sekcje = (b.sekcje || []).map((sek) => `<section class="l-ekran l-zasady">
      <p class="l-znacznik">${tekst(sek.tytul)}</p>${sek.wstep ? `<p class="l-kontekst">${tekst(sek.wstep)}</p>` : ""}
      ${sek.punkty.map((x) => `<div class="l-zasada"${atrAktu(x.zr)}><div class="l-margines">${marginesLekcji(x.zr)}</div><p>${zMarkerem(x.t)}</p></div>`).join("")}
    </section>`).join("");
  const obliczenia = (b.obliczenia || []).length ? `<section class="l-ekran l-obliczenia">
      <p class="l-znacznik">Policz krok po kroku</p>
      ${b.obliczenia.map((o) => `<div class="l-obliczenie"><h3>${tekst(o.tytul)}</h3><p class="l-dane">${zMarkerem(o.dane)}</p>
        <ol>${o.kroki.map((k) => `<li>${zMarkerem(k)}</li>`).join("")}</ol><p class="l-wynik-obl">${zMarkerem(o.wynik)}</p></div>`).join("")}
    </section>` : "";
  const pojecia = (b.pojecia || []).length ? `<section class="l-ekran l-slowniczek">
      <p class="l-znacznik">Słowniczek</p>
      <dl>${b.pojecia.map((x) => `<dt>${tekst(x.nazwa)}</dt><dd${atrAktu(x.zr)}>${zMarkerem(x.t)}${x.prosto ? `<span class="l-prosto-krotko"><b>Po prostu:</b> ${tekst(x.prosto)}</span>` : ""}<span class="l-margines">${marginesLekcji(x.zr)}</span></dd>`).join("")}</dl>
    </section>` : "";
  return sekcje + obliczenia + pojecia;
}

function widokLekcji(id) {
  const b = stan.kurs.bloki.find((x) => x.id === id);
  if (!b) {
    location.replace("#/nauka");
    return;
  }
  ustawNaglowek(`Blok ${b.nr}`, `#/nauka/blok/${b.id}`);
  ustawZakladke("nauka");
  document.documentElement.classList.add("tryb-lekcji");
  stan.lekcja = { blok: b, pytania: b.sprawdzian.map(tasujOdpowiedzi), i: 0, dobre: 0 };
  const rysunek = RYSUNKI[b.id];
  const dalsze = RYSUNKI_DALSZE[b.id] || [];
  const przyklad = b.przyklad.replace(/^\(przykład ilustracyjny\)\s*/, "");
  widok.innerHTML = `<div class="lekcja">
    <section class="l-ekran l-okladka">
      <div class="l-nr">${String(b.nr).padStart(2, "0")}</div>
      <h1 class="l-tytul">${tekst(b.tytul)}</h1>
      <p class="l-cel">${tekst(b.cel)}</p>
      <p class="l-meta">${tekst(`${b.dzial ? b.dzial.nazwa : ""} · ok. ${godziny(b.glowny)} · ${b.sprawdzian.length} pytań na końcu`)}</p>
      <div class="l-dalej">przewiń ↓</div>
    </section>
    <section class="l-ekran l-ludzku">
      <p class="l-znacznik">Po ludzku</p>
      <p class="l-duzy">${zMarkerem(b.po_ludzku)}</p>
    </section>
    ${rysunek ? rysunek[0]() : ""}
    <section class="l-ekran l-przyklad">
      <p class="l-znacznik">Przykład z praktyki <span>(ilustracyjny)</span></p>
      <p class="l-sredni">${zMarkerem(przyklad)}</p>
      <p class="l-kontekst">${tekst(b.kontekst)}</p>
    </section>
    <section class="l-ekran l-zasady">
      <p class="l-znacznik">Co mówi przepis</p>
      ${b.zasady.map((z) => `<div class="l-zasada"${atrAktu(z.zr)}><div class="l-margines">${marginesLekcji(z.zr)}</div><p>${zMarkerem(z.t)}</p>${z.prosto ? `<p class="l-prosto"><span>Po prostu</span>${zMarkerem(z.prosto)}</p>` : ""}</div>`).join("")}
    </section>
    ${ekranTabel(b)}
    ${dalsze.map((x) => x[0]()).join("")}
    ${ekranySekcji(b)}
    ${b.zaznaczenia.length ? `<section class="l-ekran l-zaznaczenia">
      <p class="l-znacznik">Z Twoich zaznaczeń</p>
      ${b.zaznaczenia.map((z) => `<div class="l-zazn">
        <blockquote>${tekst(z.fragment)}</blockquote><p class="l-zazn-zr">${tekst(z.zrodlo)}</p>
        <p class="l-zazn-status ${z.status}">${tekst({ zgodne: "Zgodne z aktualnym przepisem", uzupelnione: "Uzupełniłem z przepisu", nieaktualne: "Na slajdzie nieaktualne - poprawka niżej" }[z.status] || "")}</p>
        <p class="l-sredni">${zMarkerem(z.wyjasnienie)}</p>
        ${z.zr && z.zr.akt ? `<p class="l-margines"><a href="${esc(adresUrzedowy(z.zr.akt, z.zr.etykieta, { cytat: z.zr.dowod }))}" target="_blank" rel="noopener">${esc(z.zr.etykieta)} ↗</a> ${esc(z.zr.nazwa)}</p>` : ""}</div>`).join("")}
    </section>` : ""}
    <section class="l-ekran l-pulapki">
      <p class="l-znacznik">Pułapki · dotknij karty</p>
      <div class="l-karty">${b.pulapki.map((x) => `<button class="l-karta" onclick="this.classList.toggle('odwrocona')">
        <span class="l-przod"><small>Myślisz, że…</small>${tekst(x.blad.replace(/^„|”$/g, ""))}</span>
        <span class="l-tyl"><small>A naprawdę</small>${tekst(x.prawda)}</span></button>`).join("")}</div>
    </section>
    <section class="l-ekran l-test" id="l-test"></section>
    <section class="l-ekran l-koniec">
      <p class="l-znacznik">Zapamiętaj</p>
      <ol class="l-sciaga">${b.sciaga.map((x) => `<li>${zMarkerem(x)}</li>`).join("")}</ol>
      <div class="l-akcje"><a class="l-link" href="#/nauka/wyjasnij/${b.id}">Wytłumacz to własnymi słowami</a><a class="l-link szary" href="#/nauka/blok/${b.id}">Wszystko o tym bloku na jednej stronie</a></div>
    </section>
  </div>`;
  dalsze.forEach((x) => x[1]());
  if (rysunek) {
    rysunek[1]();
  }
  rysujPytanie();
}

function rysujPytanie() {
  const l = stan.lekcja;
  const el = document.getElementById("l-test");
  const pasek = l.pytania.map((_, k) => `<i class="${k < l.i ? "byl" : k === l.i ? "jest" : ""}"></i>`).join("");
  if (l.i >= l.pytania.length) {
    const wynik = l.dobre / l.pytania.length;
    zapiszPostep((p) => {
      p.sprawdzian[l.blok.id] = { wynik, kiedy: Date.now() };
      p.przeczytane[l.blok.id] = true;
    });
    el.innerHTML = `<p class="l-znacznik">Sprawdzian</p><div class="l-pasek">${pasek}</div>
      <div class="l-wynik-testu"><span class="l-liczba">${l.dobre}/${l.pytania.length}</span><p>${tekst(wynik >= PROG_SPRAWDZIANU ? "Zaliczone. Najlepszy następny krok: wytłumacz blok własnymi słowami." : "Jeszcze nie. Wróć do zasad i pułapek wyżej, a potem spróbuj jeszcze raz.")}</p>
      <button class="l-przycisk" onclick="stan.lekcja.i=0;stan.lekcja.dobre=0;stan.lekcja.pytania=stan.lekcja.blok.sprawdzian.map(tasujOdpowiedzi);rysujPytanie()">Jeszcze raz</button></div>`;
    return;
  }
  const q = l.pytania[l.i];
  el.innerHTML = `<p class="l-znacznik">Sprawdzian · pytanie ${l.i + 1} z ${l.pytania.length}</p><div class="l-pasek">${pasek}</div>
    <h2 class="l-pytanie">${tekst(q.q)}</h2>
    <div class="l-odpowiedzi">${q.o.map((o, k) => `<button onclick="odpowiedzLekcji(${k})">${tekst(o)}</button>`).join("")}</div>
    <div class="l-wyjasnienie" id="l-wyj" hidden></div>`;
}

function odpowiedzLekcji(k) {
  const l = stan.lekcja;
  const q = l.pytania[l.i];
  const przyciski = document.querySelectorAll(".l-odpowiedzi button");
  if (przyciski[0].disabled) {
    return;
  }
  przyciski.forEach((b, i) => {
    b.disabled = true;
    b.classList.toggle("dobra", i === q.ok);
    b.classList.toggle("zla", i === k && k !== q.ok);
  });
  if (k === q.ok) {
    l.dobre++;
  }
  const wyj = document.getElementById("l-wyj");
  wyj.hidden = false;
  wyj.innerHTML = `<p>${tekst(q.wyj)}</p><button class="l-przycisk" onclick="stan.lekcja.i++;rysujPytanie()">${l.i + 1 < l.pytania.length ? "Dalej" : "Wynik"}</button>`;
}

// Tryb lekcji wyłącza się przy wyjściu do innego widoku.
window.addEventListener("hashchange", () => {
  if (!location.hash.startsWith("#/nauka/lekcja/")) {
    document.documentElement.classList.remove("tryb-lekcji");
  }
});
