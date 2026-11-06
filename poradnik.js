// „Jak zrobić analizę” - baza zasad do każdego budynku: metodyka, 45 punktów analizy wg wzoru CS PSP, kontrola na koniec.
// Treść: data/poradnik.json (budowana skryptem skrypty/zbuduj_poradnik_app.py z „Baza zasad/BAZA ZASAD ... .md”).
//
//   #/poradnik        spis: Zanim zaczniesz / Punkty analizy / Na koniec
//   #/poradnik/ID     jeden temat (w1…, p1…p45, p25-35, k1…), z poprzednim i następnym

TRASY.push(
  [/^#\/poradnik$/, () => widokPoradnika()],
  [/^#\/poradnik\/([\w-]+)$/, (m) => widokTematuPoradnika(m[1])],
);

const KOLOR_PORADNIKA = "#2f5d8a";

async function wczytajPoradnik() {
  if (!stan.poradnik) {
    stan.poradnik = await fetch("data/poradnik.json").then((r) => r.json());
  }
  return stan.poradnik;
}

function tematyPoradnika() {
  return stan.poradnik.grupy.flatMap((g) => g.tematy);
}

// Krótka etykieta kafelka: numer punktu albo skrót grupy
function skrotTematu(t) {
  const nr = t.id.match(/^p([\d-]+)$/);
  return nr ? nr[1] : t.id.startsWith("w") ? "WSTĘP" : "FINAŁ";
}

async function widokPoradnika() {
  ustawNaglowek("Jak zrobić analizę", "#/start");
  ustawZakladke("start");
  await wczytajPoradnik();
  const opisy = {
    "Zanim zaczniesz": "Akty prawne, kolejność pracy, jak pisać i jak oceniać.",
    "Punkty analizy": "Każdy punkt tabeli: co ustalasz, jak liczysz, który przepis, pułapki.",
    "Na koniec": "Rysunki, kontrola spójności, pytania na obronę.",
  };
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Zasady do każdego budynku. Do liczenia użyj „Analizy budynku” - przy każdym jej punkcie jest link do tych zasad.")}</div></div>
    <div class="list-group" style="margin-top:12px">${wiersz("#/analiza", "LICZ", "#c0392b", "Analiza budynku - kalkulator", "Wpisz dane budynku, a policzę wymagania i ocenię, co spełnia")}</div>
    ${stan.poradnik.grupy.map((g) => `<div class="section-label">${tekst(g.tytul)}</div>
      <p class="opis-trybu" style="margin-top:0">${tekst(opisy[g.tytul] || "")}</p>
      <div class="list-group">${g.tematy.map((t) => wiersz(`#/poradnik/${t.id}`, skrotTematu(t), KOLOR_PORADNIKA, t.tytul.replace(/^[\d-]+\. /, ""), "")).join("")}</div>`).join("")}`;
}

async function widokTematuPoradnika(id) {
  await wczytajPoradnik();
  const lista = tematyPoradnika();
  const i = lista.findIndex((t) => t.id === id);
  if (i < 0) {
    location.replace("#/poradnik");
    return;
  }
  const t = lista[i];
  ustawNaglowek("Jak zrobić analizę", "#/poradnik");
  ustawZakladke("start");
  const sasiad = (j, napis) => (lista[j] ? `<a class="btn secondary" href="#/poradnik/${lista[j].id}">${napis}</a>` : "");
  widok.innerHTML = `<article class="pz pr">
    <p class="pz-nr">${tekst(stan.poradnik.grupy.find((g) => g.tematy.includes(t)).tytul)}</p>
    <h2 class="pz-tytul">${tekst(t.tytul)}</h2>
    ${t.html}</article>
    <div class="pager">${sasiad(i - 1, "‹ Poprzedni")}${sasiad(i + 1, "Następny ›")}</div>`;
}

// Do wyszukiwarki: każdy akapit, punkt listy i komórka tabeli poradnika
function fragmentyPoradnika() {
  if (!stan.poradnik) {
    return [];
  }
  const lista = [];
  const parser = new DOMParser();
  tematyPoradnika().forEach((t) => {
    lista.push({ gdzie: "Jak zrobić analizę", tekst: t.tytul, szukaj: t.tytul, adres: `#/poradnik/${t.id}` });
    const dom = parser.parseFromString(t.html, "text/html");
    [...dom.querySelectorAll("p, li, td")].filter((el) => !el.querySelector("p, li, td")).forEach((el) => {
      const tekstEl = bezSpacji(el.textContent);
      if (tekstEl.length > 2) {
        lista.push({ gdzie: `Jak zrobić analizę · ${t.tytul}`, tekst: tekstEl, szukaj: tekstEl, adres: `#/poradnik/${t.id}` });
      }
    });
  });
  return lista;
}
