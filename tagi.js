// Hashtagi tematów (prośba Tomka 17.11.2026): klik w temat → wszystko o nim z całej aplikacji.
// Styl macOS, bez ikon, alfabetycznie. Tag = nazwa + rdzenie słów (bez polskich znaków) + tematy „Poszerz wiedzę” + lekcje.
//
//   #/start-a, #/start-b, #/start-c   warianty strony głównej do wyboru przez Tomka (podgląd lokalny)

const TAGI = [
  { nazwa: "Butle LPG", slowa: /butl|gaz\w* plynn|propan/, tematy: ["butle-lpg", "stacje-paliw"], lekcje: ["ogrzewanie"] },
  { nazwa: "Czujki i SSP", slowa: /czujk|sygnalizacji pozar|\bssp\b/, tematy: ["czujki-gdzie", "czujki-wyglad"], lekcje: ["sprzet"] },
  { nazwa: "Drogi pożarowe", slowa: /drog\w* pozarow/, tematy: ["drogi-pozarowe"], lekcje: ["woda"] },
  { nazwa: "Elektryka i PWP", slowa: /wylacznik\w* pradu|\bpwp\b|instalac\w* elektryczn|odgromow/, tematy: ["elektryka-pwp", "ladowanie"], lekcje: ["instalacje"] },
  { nazwa: "Ewakuacja", slowa: /ewakuac/, tematy: ["przejscia", "ewakuacja", "budynek-zagrazajacy"], lekcje: ["ewakuacja", "organizacja"] },
  { nazwa: "Fotowoltaika", slowa: /fotowolt/, tematy: ["fotowoltaika"], lekcje: ["instalacje"] },
  { nazwa: "Garaże", slowa: /garaz/, tematy: ["garaze"], lekcje: [] },
  { nazwa: "Gaśnice", slowa: /gasnic(?!z)\w*|koc\w* gasnicz\w*/, tematy: ["gasnice", "srodki-gasnicze"], lekcje: ["urzadzenia"] },
  { nazwa: "Hydranty", slowa: /hydrant/, tematy: ["hydranty", "skroty-hydranty"], lekcje: ["woda", "sprzet"] },
  { nazwa: "IBP", slowa: /instrukcj\w* bezpieczenstwa pozar|\bibp\b/, tematy: ["ibp"], lekcje: ["ibp"] },
  { nazwa: "Klasy odporności pożarowej", slowa: /klas\w* odpornosci/, tematy: ["klasy-strefy", "wysokosci"], lekcje: ["budynki"] },
  { nazwa: "Strefy pożarowe", slowa: /stref\w* pozarow|oddzieleni\w* przeciwpozar|sciana oddzielenia/, tematy: ["klasy-strefy", "odleglosci"], lekcje: ["budynki"] },
  { nazwa: "Kominy i kotłownie", slowa: /komin|kotlown|kociol|kotl[aoy]\b|przewod\w* (dymow|spalinow)|palenisk/, tematy: ["kominy", "kotlownie-gaz"], lekcje: ["ogrzewanie"] },
  { nazwa: "Kontrole i mandaty", slowa: /kontrolno|mandat|wykroczen|decyzj/, tematy: ["kontrola-psp", "mandaty"], lekcje: ["kontrole"] },
  { nazwa: "Lasy i żniwa", slowa: /\blas(u|ow|ach|em|y)?\b|lesn|zniw|stert|stog|omlot/, tematy: ["lasy-zniwa"], lekcje: [] },
  { nazwa: "Materiały budowlane", slowa: /niepaln|zapaln|rozprzestrzeni|reakcj\w* na ogien/, tematy: ["materialy"], lekcje: ["budynki"] },
  { nazwa: "Obciążenie ogniowe", slowa: /obciazeni\w* ogniow|mj\/m/, tematy: ["obciazenie"], lekcje: ["budynki"] },
  { nazwa: "Obowiązki właściciela", slowa: /wlasciciel/, tematy: ["obowiazki-wlasciciela", "organizacja-ochrony"], lekcje: ["obowiazki", "system"] },
  { nazwa: "Oddymianie i drzwi ppoż.", slowa: /oddymia|drzwi\w* przeciwpozar|dymoszczel/, tematy: ["oddymianie-drzwi"], lekcje: ["sprzet"] },
  { nazwa: "Odległości", slowa: /odleglosc/, tematy: ["odleglosci"], lekcje: ["budynki"] },
  { nazwa: "Prace niebezpieczne", slowa: /prac\w* niebezpieczn|spawa/, tematy: ["prace-niebezpieczne"], lekcje: ["prace"] },
  { nazwa: "Przyczyny pożarów", slowa: /przyczyn/, tematy: ["przyczyny-pozarow"], lekcje: ["przyczyny"] },
  { nazwa: "Rozwiązania zamienne", slowa: /rozwiazan\w* zamienn|odstepstw|rzeczoznawc/, tematy: ["zamienne", "normy"], lekcje: ["ewakuacja"] },
  { nazwa: "Spalanie i pożar", slowa: /spalani|rozgorzen|plomien|\bdym/, tematy: ["fazy", "zjawiska"], lekcje: ["spalanie"] },
  { nazwa: "Stacje paliw", slowa: /stacj\w* paliw|odmierzacz/, tematy: ["stacje-paliw"], lekcje: [] },
  { nazwa: "Strefy Ex i wybuch", slowa: /wybuch|\bdgw\b/, tematy: ["strefy-ex", "dgw"], lekcje: ["spalanie"] },
  { nazwa: "Szkolenia", slowa: /szkoleni|zapoznan/, tematy: ["szkolenia"], lekcje: ["organizacja"] },
  { nazwa: "Tryskacze", slowa: /tryskacz|stal\w* urzadzen\w* gasnicz|\bsug\b/, tematy: ["sug"], lekcje: ["sprzet"] },
  { nazwa: "Woda do gaszenia", slowa: /wod\w* do (celow )?przeciwpozar|wody do gaszenia|dm3\/s|zbiornik\w* przeciwpozar/, tematy: ["hydranty"], lekcje: ["woda"] },
  { nazwa: "Wysokość budynku", slowa: /\bnisk|sredniowysok|wysokosciow|budyn\w* wysok/, tematy: ["wysokosci"], lekcje: ["budynki"] },
  { nazwa: "ZL i kategorie", slowa: /\bzl ?(i|ii|iii|iv|v)\b|zagrozenia ludzi/, tematy: ["zl"], lekcje: ["budynki"] },
  { nazwa: "Wodór", slowa: /wodor/, tematy: ["dgw", "ladowanie", "strefy-ex"], lekcje: ["spalanie"] },
  { nazwa: "Tlenek węgla (czad)", slowa: /tlen\w* wegla|\bczad/, tematy: ["czujki-gdzie", "zjawiska", "kotlownie-gaz"], lekcje: ["ogrzewanie"] },
  { nazwa: "Gaz ziemny (metan)", slowa: /gaz\w* ziemn|metan/, tematy: ["dgw", "kotlownie-gaz"], lekcje: ["ogrzewanie"] },
  { nazwa: "Propan-butan", slowa: /propan|butan/, tematy: ["butle-lpg", "dgw", "garaze", "stacje-paliw"], lekcje: ["ogrzewanie"] },
  { nazwa: "Acetylen", slowa: /acetylen/, tematy: ["dgw", "prace-niebezpieczne"], lekcje: ["prace"] },
  { nazwa: "Benzyna i ciecze palne", slowa: /benzyn|ciecz\w* paln|olej\w* napedow|temperatur\w* zaplonu/, tematy: ["stacje-paliw", "dgw", "strefy-ex"], lekcje: ["spalanie"] },
  { nazwa: "Pyły", slowa: /\bpyl/, tematy: ["strefy-ex", "dgw"], lekcje: ["spalanie"] },
  { nazwa: "Akumulatory i baterie", slowa: /akumulator|bateri/, tematy: ["ladowanie"], lekcje: ["instalacje"] },
  { nazwa: "Znaki i oświetlenie", slowa: /znak\w* (bezpiecz|ewakuac)|oswietleni\w* (awaryjn|ewakuac)/, tematy: ["znaki-oswietlenie"], lekcje: ["instalacje"] },
].sort((a, b) => a.nazwa.localeCompare(b.nazwa, "pl"));

// ── Wszystkie hasła A-Ż: pojęcia ze słowniczków lekcji + skróty z odnosniki.js (Tomek: pełna nomenklatura) ──

// Wzorzec z nazwy pojęcia: rdzenie słów, np. „strefa pożarowa” → /stref\w*\W+(\w+\W+)?pozaro/.
function wzorzecZNazwy(nazwa, skrot) {
  if (skrot) {
    return new RegExp(`\\b${bezOgonkow(nazwa).replace(/[^a-z0-9]+/g, "\\W*")}\\b`);
  }
  const slowa = bezOgonkow(nazwa).replace(/\(.*?\)/g, " ").split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
  if (!slowa.length) {
    return null;
  }
  const rdzenie = slowa.slice(0, 3).map((w) => (w.length <= 4 ? w : w.slice(0, Math.max(4, Math.min(7, w.length - 2)))));
  return new RegExp(rdzenie.join("\\w*\\W+(?:\\w+\\W+)?"));
}

function wszystkieHasla() {
  if (stan.hasla) {
    return stan.hasla;
  }
  const zajete = new Set(TAGI.map((t) => bezOgonkow(t.nazwa)));
  const hasla = [...TAGI];
  stan.kurs.bloki.forEach((b) => (b.pojecia || []).forEach((p) => {
    const klucz = bezOgonkow(p.nazwa);
    const slowa = wzorzecZNazwy(p.nazwa, false);
    if (zajete.has(klucz) || !slowa) {
      return;
    }
    zajete.add(klucz);
    hasla.push({ nazwa: p.nazwa, slowa, tematy: [], lekcje: [b.id], definicja: { t: p.prosto || p.t, fachowo: p.prosto ? p.t : "", zr: p.zr } });
  }));
  Object.entries(SKROTY).forEach(([skrot, opis]) => {
    const klucz = bezOgonkow(skrot);
    if (zajete.has(klucz)) {
      return;
    }
    zajete.add(klucz);
    hasla.push({ nazwa: skrot, slowa: wzorzecZNazwy(skrot, true), tematy: [], lekcje: [], definicja: { t: opis, fachowo: "", zr: null } });
  });
  stan.hasla = hasla.sort((a, b) => a.nazwa.localeCompare(b.nazwa, "pl"));
  return stan.hasla;
}

// Rozwijany spis A-Ż z podziałem na litery.
function spisHasel() {
  const hasla = wszystkieHasla();
  const litery = {};
  hasla.forEach((h) => {
    const l = h.nazwa[0].toLocaleUpperCase("pl");
    (litery[l] = litery[l] || []).push(h);
  });
  return `<details class="tag-spis"><summary>Wszystkie hasła A-Ż · ${hasla.length}</summary>
    ${Object.keys(litery).sort((a, b) => a.localeCompare(b, "pl")).map((l) => `<p class="tag-litera">${esc(l)}</p>
      <div class="tagi">${litery[l].map((t) => `<a class="tag" href="${adresTagu(t)}">${esc(t.nazwa)}</a>`).join("")}</div>`).join("")}
  </details>`;
}

// Czy tekst pytania pasuje do tagu (porównanie bez polskich znaków).
function pasujeDoTagu(tag, tekstZrodla) {
  const t = bezOgonkow(tekstZrodla);
  return tag.slowa.test(t);
}

// Liczba materiałów pod tagiem: tematy + lekcje + pytania egzaminacyjne z jego słowami.
function liczTag(tag) {
  const tematy = tag.tematy.filter((id) => POSZERZ.some((p) => p.id === id)).length;
  const pytania = stan.pytania ? stan.pytania.pytania.filter((q) => pasujeDoTagu(tag, `${q.pytanie} ${q.odp.map((o) => o.t).join(" ")}`)).length : 0;
  return tematy + tag.lekcje.length + pytania;
}

function adresTagu(tag) {
  return `#/tag/${encodeURIComponent(bezOgonkow(tag.nazwa).replace(/[^a-z0-9]+/g, "-"))}`;
}

function chmuraTagow() {
  return `<div class="tagi">${TAGI.map((t) => `<a class="tag" href="${adresTagu(t)}">${esc(t.nazwa)}<small>${liczTag(t)}</small></a>`).join("")}</div>`;
}

// ── Strona hashtagu: liczby na górze, potem wszystkie odnośniki z całej aplikacji ──

const bezZnacznikow = (html) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");

// Wiersze tabeli „Liczby do zapamiętania” (materiały kursu) pasujące do tagu.
function liczbyTagu(tag) {
  const tabela = stan.materialy.tematy.find((t) => t.id === "liczby-0");
  if (!tabela) {
    return [];
  }
  return [...tabela.html.matchAll(/<tr><td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td><\/tr>/g)]
    .map((m) => m.slice(1, 4))
    .filter((w) => pasujeDoTagu(tag, bezZnacznikow(w.join(" "))));
}

// Główne tematy: przypisane ręcznie albo (hasła ze słowniczka) te z hasłem w tytule.
function idTematow(tag) {
  return tag.tematy.length ? tag.tematy : POSZERZ.filter((p) => pasujeDoTagu(tag, p.tytul)).map((p) => p.id);
}

// Punkty „Na egzaminie uważaj” z głównych tematów tagu - konkretne liczby i paragrafy.
function pulapkiTagu(tag) {
  const punkty = [];
  idTematow(tag).forEach((id) => {
    const t = POSZERZ.find((p) => p.id === id);
    const ramka = t ? (t.html().match(/pz-pulapki">[\s\S]*?<ul>([\s\S]*?)<\/ul>/) || [])[1] : "";
    (ramka || "").split("</li>").forEach((li) => {
      const czysty = li.replace(/^\s*<li>/, "").trim();
      if (czysty && pasujeDoTagu(tag, bezZnacznikow(czysty)) && !punkty.includes(czysty)) {
        punkty.push(czysty);
      }
    });
  });
  return punkty;
}

// Wiersze tabel z głównych tematów tagu, w których pada jego słowo (np. „wodór 4,1% / 74,2%”).
function wierszeTabelTagu(tag) {
  const wiersze = [];
  idTematow(tag).forEach((id) => {
    const t = POSZERZ.find((p) => p.id === id);
    if (!t) {
      return;
    }
    [...t.html().matchAll(/<table>([\s\S]*?)<\/table>/g)].forEach((tabela) => {
      const naglowki = [...tabela[1].matchAll(/<th>([\s\S]*?)<\/th>/g)].map((h) => bezZnacznikow(h[1]).trim());
      [...tabela[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].forEach((m) => {
        const komorki = [...m[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((k) => k[1]);
        const tekstWiersza = bezZnacznikow(komorki.join(" "));
        if (!komorki.length || !pasujeDoTagu(tag, tekstWiersza)) {
          return;
        }
        // „propan · DGW: 2,4% · GGW: 9,5%” - pierwsza komórka pogrubiona, reszta z nazwą kolumny
        const linia = `<b>${komorki[0]}</b>${komorki.slice(1).map((c, i) => ` · ${naglowki[i + 1] ? `<small>${naglowki[i + 1]}:</small> ` : ""}${c}`).join("")}<br><small>${t.tytul}</small>`;
        if (!wiersze.includes(linia)) {
          wiersze.push(linia);
        }
      });
    });
  });
  return wiersze.slice(0, 15);
}

// Powiązane hasła - dobrane ręcznie dla tematów głównych (Tomek: „musisz dobrze te tematy ze sobą połączyć”).
const POWIAZANE = {
  "Acetylen": ["Prace niebezpieczne", "Strefy Ex i wybuch", "Butle LPG", "Gaśnice"],
  "Akumulatory i baterie": ["Wodór", "Elektryka i PWP", "Fotowoltaika", "Garaże"],
  "Benzyna i ciecze palne": ["Stacje paliw", "Strefy Ex i wybuch", "Obciążenie ogniowe", "Gaśnice"],
  "Butle LPG": ["Propan-butan", "Strefy Ex i wybuch", "Stacje paliw", "Kominy i kotłownie"],
  "Czujki i SSP": ["Tlenek węgla (czad)", "Tryskacze", "Oddymianie i drzwi ppoż.", "Elektryka i PWP"],
  "Drogi pożarowe": ["Hydranty", "Woda do gaszenia", "Odległości", "Wysokość budynku"],
  "Elektryka i PWP": ["Fotowoltaika", "Akumulatory i baterie", "Znaki i oświetlenie", "Czujki i SSP"],
  "Ewakuacja": ["Znaki i oświetlenie", "Oddymianie i drzwi ppoż.", "ZL i kategorie", "Rozwiązania zamienne"],
  "Fotowoltaika": ["Elektryka i PWP", "Akumulatory i baterie", "IBP"],
  "Garaże": ["Propan-butan", "Hydranty", "Czujki i SSP", "Akumulatory i baterie"],
  "Gaśnice": ["Hydranty", "Tryskacze", "Obciążenie ogniowe", "Kontrole i mandaty"],
  "Gaz ziemny (metan)": ["Kominy i kotłownie", "Strefy Ex i wybuch", "Tlenek węgla (czad)", "Propan-butan"],
  "Hydranty": ["Woda do gaszenia", "Drogi pożarowe", "Gaśnice", "Obciążenie ogniowe"],
  "IBP": ["Obowiązki właściciela", "Ewakuacja", "Szkolenia", "Kontrole i mandaty"],
  "Klasy odporności pożarowej": ["Strefy pożarowe", "Wysokość budynku", "ZL i kategorie", "Materiały budowlane", "Obciążenie ogniowe"],
  "Kominy i kotłownie": ["Tlenek węgla (czad)", "Gaz ziemny (metan)", "Propan-butan", "Przyczyny pożarów"],
  "Kontrole i mandaty": ["Obowiązki właściciela", "IBP", "Rozwiązania zamienne"],
  "Lasy i żniwa": ["Odległości", "Przyczyny pożarów", "Woda do gaszenia"],
  "Materiały budowlane": ["Klasy odporności pożarowej", "Strefy pożarowe", "Oddymianie i drzwi ppoż.", "Spalanie i pożar"],
  "Obciążenie ogniowe": ["Strefy pożarowe", "Klasy odporności pożarowej", "Hydranty", "Gaśnice", "Odległości"],
  "Obowiązki właściciela": ["IBP", "Szkolenia", "Kontrole i mandaty", "Ewakuacja"],
  "Oddymianie i drzwi ppoż.": ["Ewakuacja", "Strefy pożarowe", "Czujki i SSP", "Spalanie i pożar"],
  "Odległości": ["Strefy pożarowe", "Obciążenie ogniowe", "Lasy i żniwa", "Drogi pożarowe"],
  "Prace niebezpieczne": ["Acetylen", "Strefy Ex i wybuch", "Gaśnice", "Przyczyny pożarów"],
  "Propan-butan": ["Butle LPG", "Gaz ziemny (metan)", "Garaże", "Stacje paliw", "Strefy Ex i wybuch"],
  "Przyczyny pożarów": ["Spalanie i pożar", "Elektryka i PWP", "Prace niebezpieczne", "Kontrole i mandaty"],
  "Pyły": ["Strefy Ex i wybuch", "Spalanie i pożar", "Prace niebezpieczne"],
  "Rozwiązania zamienne": ["Ewakuacja", "Strefy pożarowe", "Tryskacze", "Oddymianie i drzwi ppoż.", "Drogi pożarowe"],
  "Spalanie i pożar": ["Tlenek węgla (czad)", "Oddymianie i drzwi ppoż.", "Przyczyny pożarów", "Materiały budowlane"],
  "Stacje paliw": ["Benzyna i ciecze palne", "Propan-butan", "Strefy Ex i wybuch", "Gaśnice"],
  "Strefy Ex i wybuch": ["Pyły", "Wodór", "Acetylen", "Gaz ziemny (metan)", "Propan-butan", "Prace niebezpieczne"],
  "Strefy pożarowe": ["Klasy odporności pożarowej", "Obciążenie ogniowe", "Tryskacze", "Oddymianie i drzwi ppoż.", "Odległości"],
  "Szkolenia": ["IBP", "Obowiązki właściciela", "Ewakuacja", "Gaśnice"],
  "Tlenek węgla (czad)": ["Czujki i SSP", "Kominy i kotłownie", "Gaz ziemny (metan)", "Spalanie i pożar"],
  "Tryskacze": ["Strefy pożarowe", "Czujki i SSP", "Woda do gaszenia", "Rozwiązania zamienne"],
  "Woda do gaszenia": ["Hydranty", "Drogi pożarowe", "Tryskacze", "Lasy i żniwa"],
  "Wodór": ["Akumulatory i baterie", "Strefy Ex i wybuch", "Gaz ziemny (metan)"],
  "Wysokość budynku": ["Klasy odporności pożarowej", "ZL i kategorie", "Hydranty", "Drogi pożarowe"],
  "ZL i kategorie": ["Ewakuacja", "Klasy odporności pożarowej", "Wysokość budynku", "Czujki i SSP"],
  "Znaki i oświetlenie": ["Ewakuacja", "Elektryka i PWP", "Gaśnice"],
};

// Kalkulatory pasujące do tematu.
const NARZEDZIA_TAGU = {
  "Odległości": [["#/narzedzia/odleglosci", "Kalkulator: odległość od sąsiada"]],
  "Obciążenie ogniowe": [["#/narzedzia/obciazenie", "Kalkulator: ile palnych rzeczy"]],
  "Ewakuacja": [["#/narzedzia/osoby", "Kalkulator: ile osób i jakie drzwi"]],
  "ZL i kategorie": [["#/narzedzia/osoby", "Kalkulator: ile osób i jakie drzwi"]],
  "Gaśnice": [["#/narzedzia/terminy", "Terminy przeglądów"]],
  "Hydranty": [["#/narzedzia/terminy", "Terminy przeglądów"]],
  "Kominy i kotłownie": [["#/narzedzia/terminy", "Terminy przeglądów"]],
  "Kontrole i mandaty": [["#/narzedzia/obchod", "Obchód obiektu - lista kontrolna"]],
  "Klasy odporności pożarowej": [["#/analiza", "Analiza budynku"]],
  "Strefy pożarowe": [["#/analiza", "Analiza budynku"]],
};

// Hasła ze słowniczka: powiązane = hasła główne dzielące lekcję lub temat (najwięcej wspólnych na początku).
function powiazaneHasla(tag) {
  const wszystkie = wszystkieHasla();
  const reczne = (POWIAZANE[tag.nazwa] || []).map((n) => wszystkie.find((h) => h.nazwa === n)).filter(Boolean);
  if (reczne.length) {
    return reczne;
  }
  const tematy = idTematow(tag);
  return TAGI.filter((t) => t.nazwa !== tag.nazwa)
    .map((t) => ({ t, wynik: t.lekcje.filter((l) => tag.lekcje.includes(l)).length + idTematow(t).filter((x) => tematy.includes(x)).length * 2 }))
    .filter((x) => x.wynik > 0)
    .sort((a, b) => b.wynik - a.wynik)
    .slice(0, 5)
    .map((x) => x.t);
}

// Ćwiczenie pytań hasła: kod „h_slug” (podkreślenia zamiast myślników - trasa pytań przyjmuje tylko \w).
function kodCwiczenia(tag) {
  return `h_${adresTagu(tag).replace("#/tag/", "").replace(/-/g, "_")}`;
}

function tagZKodu(kod) {
  return wszystkieHasla().find((t) => kodCwiczenia(t) === kod);
}

function pytaniaHasla(tag) {
  return tag ? stan.pytania.pytania.filter((q) => pasujeDoTagu(tag, `${q.pytanie} ${q.odp.map((o) => o.t).join(" ")} ${q.wyjasnienie || ""}`)) : [];
}

// Ustępy przepisów (22 akty z bazy aplikacji), w których pada hasło - pogrupowane według aktu.
async function przepisyHasla(tag) {
  await Promise.all(stan.spis.map((p) => wczytajAkt(plikAktu(p.eli))));
  const grupy = {};
  indeksPrzepisowSzukania().filter((f) => tag.slowa.test(f.bez)).forEach((f) => {
    const [etykieta, akt] = f.gdzie.split(" · ");
    (grupy[akt] = grupy[akt] || []).push({ etykieta, tekst: f.tekst, adres: f.adres });
  });
  return grupy;
}

// ── Strona hashtagu = ściąga: wszystkie zdania z hasłem, pogrupowane według źródła, link „czytaj całość” przy grupie ──
// Tomek 17.11: „chcę od razu wszystkie wartościowe zdania z kontekstem, a link do artykułu dopiero dalej”.

const MAKS_ZDAN_W_GRUPIE = 8;
const MAKS_USTEPOW_AKTU = 10;
const MAKS_GRUP = 5;
const MAKS_PYTAN = 5;
const MAKS_ZDAN_LISTY = 25;

// Pierwsze n elementów widoczne, reszta pod „pokaż jeszcze N” - żeby duże hasła (np. Gaśnice) nie miały kilometrowej strony.
function zwin(elementy, n, opak = (h) => h) {
  const reszta = elementy.slice(n);
  return opak(elementy.slice(0, n).join("")) + (reszta.length ? `<details class="tag-wiecej tag-wiecej-sekcji"><summary>pokaż jeszcze ${reszta.length}</summary>${opak(reszta.join(""))}</details>` : "");
}
const DLUGI_AKAPIT = 350;

// HTML → lista akapitów/punktów/wierszy tabel jako czysty tekst.
function blokiZHtml(html) {
  return html
    .replace(/<\/td>/g, " · ")
    .replace(/<\/(p|li|tr|h3|h4|figcaption|summary|div)>|<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"")
    .split("\n")
    .map((t) => t.replace(/\s+/g, " ").replace(/\s*·\s*$/, "").trim())
    .filter((t) => t.length > 15);
}

// Z tekstów zostają te z hasłem; długi akapit skracany do zdań, w których hasło pada.
function zdaniaZHaslem(tag, teksty) {
  const wynik = [];
  teksty.forEach((t) => {
    if (!t || !pasujeDoTagu(tag, t)) {
      return;
    }
    const fragment = t.length <= DLUGI_AKAPIT ? t : t.split(/(?<=[.!?])\s+/).filter((z) => pasujeDoTagu(tag, z)).join(" ");
    if (fragment && !wynik.includes(fragment)) {
      wynik.push(fragment);
    }
  });
  return wynik;
}

// Podświetla hasło w tekście. Porównanie bez polskich znaków - znak po znaku, więc pozycje się zgadzają.
function podswietl(tag, t) {
  const znaki = [...t];
  const norm = znaki.map((c) => bezOgonkow(c) || c).join("");
  if (norm.length !== znaki.length) {
    return esc(t);
  }
  const wzor = new RegExp(tag.slowa.source, "g");
  let out = "";
  let od = 0;
  for (const m of norm.matchAll(wzor)) {
    if (!m[0]) {
      break;
    }
    out += esc(znaki.slice(od, m.index).join("")) + `<mark>${esc(znaki.slice(m.index, m.index + m[0].length).join(""))}</mark>`;
    od = m.index + m[0].length;
  }
  return out + esc(znaki.slice(od).join(""));
}

// Wszystkie teksty lekcji: po ludzku, przykład, zasady, sekcje, pojęcia, pułapki, obliczenia, ściąga.
function tekstyLekcji(b) {
  const t = [b.po_ludzku, b.przyklad, b.kontekst];
  (b.zasady || []).forEach((z) => t.push(z.t));
  (b.sekcje || []).forEach((s) => (s.punkty || []).forEach((p) => t.push(p.t)));
  (b.pojecia || []).forEach((p) => t.push(`${p.nazwa}: ${p.prosto || p.t}`));
  (b.pulapki || []).forEach((p) => t.push(p.prawda));
  (b.obliczenia || []).forEach((o) => t.push(`${o.tytul}: ${o.dane} → ${o.wynik}`));
  (b.sciaga || []).forEach((s) => t.push(s));
  return t.filter(Boolean).map((x) => String(x).replace(/\s+/g, " ").trim());
}

// Zdanie z liczbą, jednostką albo paragrafem - takie idą na początek (układ 2 i 3).
const maLiczbe = (z) => /\d|§/.test(z);
const kluczZdania = (z) => bezOgonkow(z).replace(/[^a-z0-9]/g, "").slice(0, 120);

// Grupa: nagłówek źródła + zdania z hasłem + „czytaj całość”. Ponad 8 zdań - reszta pod „jeszcze N”.
function grupaZdan(tag, tytul, href, zdania) {
  const li = (z) => `<li>${podswietl(tag, z)}</li>`;
  const pierwsze = zdania.slice(0, MAKS_ZDAN_W_GRUPIE).map(li).join("");
  const reszta = zdania.slice(MAKS_ZDAN_W_GRUPIE);
  return `<div class="tag-grupa">
      <a class="tag-zrodlo" href="${href}">${esc(tytul)}<span>czytaj całość ›</span></a>
      <ul class="tag-zdania">${pierwsze}</ul>
      ${reszta.length ? `<details class="tag-wiecej"><summary>jeszcze ${reszta.length}</summary><ul class="tag-zdania">${reszta.map(li).join("")}</ul></details>` : ""}
    </div>`;
}

// Układy zdań do wyboru przez Tomka (punkt 3): /1 grupy jak było, /2 grupy bez powtórzeń z liczbami na początku,
// /3 jedna lista najważniejszych zdań bez grup, źródło drobnym drukiem pod zdaniem.
function ukladZdan(tag, zrodla, uklad) {
  if (uklad === "1") {
    return zwin(zrodla.map((z) => grupaZdan(tag, z.tytul, z.href, z.zdania)), MAKS_GRUP);
  }
  const widziane = new Set();
  const bezPowtorzen = zrodla.map((z) => ({
    ...z,
    zdania: z.zdania.filter((s) => !widziane.has(kluczZdania(s)) && widziane.add(kluczZdania(s)))
      .sort((a, b) => (maLiczbe(b) ? 1 : 0) - (maLiczbe(a) ? 1 : 0)),
  })).filter((z) => z.zdania.length);
  if (uklad === "2") {
    return zwin(bezPowtorzen.map((z) => grupaZdan(tag, z.tytul, z.href, z.zdania)), MAKS_GRUP);
  }
  const wszystkie = bezPowtorzen.flatMap((z) => z.zdania.map((s) => ({ s, z })))
    .sort((a, b) => (maLiczbe(b.s) ? 1 : 0) - (maLiczbe(a.s) ? 1 : 0));
  return zwin(wszystkie.map(({ s, z }) => `<li>${podswietl(tag, s)}<br><a class="tag-podpis" href="${z.href}">${esc(z.tytul)} ›</a></li>`), MAKS_ZDAN_LISTY, (h) => `<ul class="tag-zdania tag-jedna-lista">${h}</ul>`);
}

TRASY.unshift([/^#\/tag\/([\w-]+?)(?:\/(\d))?$/, (m) => widokTagu(m[1], m[2] || "1")]);

async function widokTagu(slug, uklad) {
  const tag = wszystkieHasla().find((t) => adresTagu(t) === `#/tag/${slug}`);
  if (!tag) {
    location.replace("#/praca");
    return;
  }
  czekaj();
  await wczytajPytania();
  ustawNaglowek(`#${tag.nazwa}`, "#/praca");
  ustawZakladke("praca");

  // Źródła zdań: wykłady (najpierw główne tematy hasła), lekcje (najpierw przypisane), materiały kursu.
  const idGlownych = idTematow(tag);
  const wyklady = [...idGlownych.map((id) => POSZERZ.find((p) => p.id === id)).filter(Boolean),
    ...POSZERZ.filter((p) => !idGlownych.includes(p.id))]
    .map((p) => ({ tytul: p.tytul, href: `#/poszerz/${p.id}`, zdania: zdaniaZHaslem(tag, blokiZHtml(p.html())) }))
    .filter((x) => x.zdania.length);
  const lekcje = stan.kurs.bloki
    .map((b) => ({ b, tytul: `Lekcja ${b.nr}. ${b.tytul}`, href: `#/nauka/lekcja/${b.id}`, zdania: zdaniaZHaslem(tag, tekstyLekcji(b)) }))
    .filter((x) => x.zdania.length)
    .sort((x, y) => (tag.lekcje.includes(y.b.id) ? 1 : 0) - (tag.lekcje.includes(x.b.id) ? 1 : 0));
  const materialy = stan.materialy.tematy
    .filter((t) => !t.id.startsWith("liczby"))
    .map((t) => ({ tytul: t.tytul.replace(/^\d+\.\s*/, ""), href: `#/m/${t.id}`, zdania: zdaniaZHaslem(tag, blokiZHtml(t.html)) }))
    .filter((x) => x.zdania.length);
  const pytania = pytaniaHasla(tag);
  const przepisy = await przepisyHasla(tag);
  const liczby = liczbyTagu(tag);
  const pulapki = pulapkiTagu(tag);
  const zTabel = wierszeTabelTagu(tag);
  const zdjecia = Object.keys(ZDJECIA).filter((k) => pasujeDoTagu(tag, ZDJECIA[k][0])).slice(0, 6);
  const powiazane = powiazaneHasla(tag);
  const narzedzia = NARZEDZIA_TAGU[tag.nazwa] || [];

  const sekcja = (tytul, tresc) => (tresc ? `<div class="section-label">${tytul}</div>${tresc}` : "");
  const odpowiedz = (q) => {
    const o = q.odp.find((x) => x.lit === q.poprawna);
    return o ? `<b>Odpowiedź: ${esc(o.t.replace(/[,.;\s]+$/, ""))}</b>` : "";
  };
  const def = tag.definicja;
  const akty = Object.keys(przepisy);
  const ustep = (u) => `<li><b>${esc(u.etykieta)}</b> ${podswietl(tag, u.tekst)} <a href="${esc(u.adres)}" target="_blank" rel="noopener">ISAP ↗</a></li>`;

  widok.innerHTML = `
    ${def ? `<div class="pz-ramka pz-ludzku tag-pulapki"><p class="pz-etyk">Co to jest</p><p>${tekst(def.t)}</p>${def.fachowo ? `<p><small>${tekst(def.fachowo)}</small></p>` : ""}${def.zr && def.zr.etykieta ? `<p><small>${esc(def.zr.etykieta)} ${esc(def.zr.nazwa || "")}</small></p>` : ""}</div>` : ""}
    ${sekcja("Liczby, które musisz znać",
      (pulapki.length ? `<div class="pz-ramka pz-pulapki tag-pulapki"><p class="pz-etyk">Na egzaminie uważaj</p><ul>${pulapki.map((x) => `<li>${x}</li>`).join("")}</ul></div>` : "")
      + (zTabel.length ? `<ul class="tag-wiersze">${zTabel.map((l) => `<li>${l}</li>`).join("")}</ul>` : "")
      + (liczby.length ? `<ul class="tag-zdania tag-liczby-lista">${liczby.map(([a, b, c]) => `<li><b>${a}</b> - ${b} <small>${c}</small></li>`).join("")}</ul>` : ""))}
    ${zdjecia.length ? `<div class="section-label">Jak to wygląda</div>${galeria(zdjecia)}` : ""}
    ${pytania.length ? `<div class="tag-cwicz"><a class="btn" href="#/pytania/cw/${kodCwiczenia(tag)}">Ćwicz pytania z tego hasła · ${pytania.length}</a></div>` : ""}
    ${narzedzia.length ? `<div class="tagi">${narzedzia.map(([h, t]) => `<a class="tag" href="${h}">${esc(t)}</a>`).join("")}</div>` : ""}
    ${uklad === "3"
      ? sekcja("Najważniejsze zdania", ukladZdan(tag, [...wyklady, ...lekcje, ...materialy], "3"))
      : sekcja(`Z wykładów · ${wyklady.length}`, ukladZdan(tag, wyklady, uklad))
        + sekcja(`Z lekcji · ${lekcje.length}`, ukladZdan(tag, lekcje, uklad))
        + sekcja(`Z materiałów kursu · ${materialy.length}`, ukladZdan(tag, materialy, uklad))}
    ${sekcja(`Z pytań egzaminacyjnych · ${pytania.length}`, zwin(pytania.map((q) => `<div class="tag-grupa">
        <a class="tag-zrodlo" href="#/pytania/p/${q.nr}">Pytanie ${q.nr}<span>otwórz ›</span></a>
        <ul class="tag-zdania"><li>${podswietl(tag, q.pytanie)}<br>${odpowiedz(q)}${q.wyjasnienie ? `<br><small>${podswietl(tag, q.wyjasnienie)}</small>` : ""}</li></ul>
      </div>`), MAKS_PYTAN))}
    ${sekcja(`Przepisy · ${akty.length} ${akty.length === 1 ? "akt" : "akty"}`, zwin(akty.map((a) => `<div class="tag-grupa">
        <p class="tag-zrodlo">${esc(a)}</p>
        <ul class="tag-zdania">${przepisy[a].slice(0, MAKS_USTEPOW_AKTU).map(ustep).join("")}</ul>
        ${przepisy[a].length > MAKS_USTEPOW_AKTU ? `<details class="tag-wiecej"><summary>jeszcze ${przepisy[a].length - MAKS_USTEPOW_AKTU}</summary><ul class="tag-zdania">${przepisy[a].slice(MAKS_USTEPOW_AKTU).map(ustep).join("")}</ul></details>` : ""}
      </div>`), MAKS_GRUP))}
    ${powiazane.length ? `<div class="section-label">Zobacz też</div><div class="tagi">${powiazane.map((t) => `<a class="tag" href="${adresTagu(t)}">#${esc(t.nazwa)}</a>`).join("")}</div>` : ""}`;
}
