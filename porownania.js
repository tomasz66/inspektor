// Liczby po ludzku - porównania z życia dla wartości z jednostkami (ciśnienie, wydajność, nacisk, obciążenie
// ogniowe, oświetlenie, kubatura, powierzchnia, odległość, stężenie CO). Pomysł z zajęć: „1 bar to jak 1 kg na 1 cm²”.
//
// 1) W całej aplikacji: liczba z jednostką dostaje kropkowane podkreślenie, stuknięcie pokazuje dymek z porównaniem
//    (ten sam dymek co przy skrótach - klasa .skrot, odnosniki.js).
// 2) Strona #/porownania - najważniejsze wartości do nauki.
//
// Przeliczniki są przybliżone i zaokrąglone - mają pomagać wyobrazić sobie wielkość, nie zastępują obliczeń.

const KG_NA_CM2_NA_BAR = 1.02;          // 1 bar ≈ 1,02 kg na 1 cm²
const METRY_WODY_NA_BAR = 10.2;          // 1 bar ≈ 10,2 m słupa wody
const METRY_NA_PIETRO = 3;
const LITRY_WANNY = 150;
const LITRY_WIADRA = 10;
const LITRY_KANISTRA = 20;
const MJ_NA_KG_DREWNA = 17;              // suche drewno - przybliżenie z literatury pożarniczej
const KW_CZAJNIKA = 2;
const M2_KORTU = 260;                    // kort tenisowy z wybiegami ok. 260 m²
const M2_BOISKA = 7000;                  // pełnowymiarowe boisko piłkarskie ok. 7000 m²
const METRY_NA_KROK = 0.75;
const KN_NA_TONE = 10;                   // 10 kN ≈ ciężar 1 tony

// Liczba z jednostką; bierze pierwszą liczbę z zakresu („5-15 m” → 5)
const WZOR_POROWNANIA = /(\d+(?:[,.]\d+)?)(?:\s?[-–]\s?\d+(?:[,.]\d+)?)?\s?(MPa|kPa|bar|dm3\/s|dm³\/s|l\/s|m3\/h|m³\/h|kN|MJ\/m2|MJ\/m²|kW|lx|ppm|m3|m³|m2|m²|dm3|dm³|l|m)(?![\wąćęłńóśźż])/gu;

function liczbaPor(tekstLiczby) {
  return parseFloat(tekstLiczby.replace(",", "."));
}

function zaokr(x) {
  if (x >= 100) {
    return Math.round(x).toLocaleString("pl-PL");
  }
  if (x >= 10) {
    return String(Math.round(x));
  }
  return String(Math.round(x * 10) / 10).replace(".", ",");
}

// Polska odmiana: [1, 2-4, 5+, ułamek] - np. odm(3.4, PIETRA) → „3,4 piętra”, odm(5, PIETRA) → „5 pięter”
const PIETRA = ["piętro", "piętra", "pięter", "piętra"];
const BUTELKI = ["butelka", "butelki", "butelek", "butelki"];
const WIADRA = ["wiadro", "wiadra", "wiader", "wiadra"];
const KORTY = ["kort tenisowy", "korty tenisowe", "kortów tenisowych", "kortu tenisowego"];
const BOISKA = ["boisko piłkarskie", "boiska piłkarskie", "boisk piłkarskich", "boiska piłkarskiego"];
const KANISTRY = ["kanister", "kanistry", "kanistrów", "kanistra"];
const CZAJNIKI = ["czajnik", "czajniki", "czajników", "czajnika"];
const SWIECZKI = ["świeczka", "świeczki", "świeczek", "świeczki"];
const KROKI = ["krok", "kroki", "kroków", "kroku"];
const WANNY = ["wanna", "wanny", "wanien", "wanny"];

function odm(x, formy) {
  const z = zaokr(x);
  const n = Number(z.replace(/\s/g, "").replace(",", "."));
  if (!Number.isInteger(n)) {
    return `${z} ${formy[3]}`;
  }
  const d = n % 10, s = n % 100;
  if (n === 1) {
    return `${z} ${formy[0]}`;
  }
  return `${z} ${d >= 2 && d <= 4 && !(s >= 12 && s <= 14) ? formy[1] : formy[2]}`;
}

function porownanieCisnienia(bar) {
  const metry = bar * METRY_WODY_NA_BAR;
  return `≈ ${zaokr(bar)} bar - jakby ${zaokr(bar * KG_NA_CM2_NA_BAR)} kg naciskało na każdy cm² (paznokieć). Podnosi wodę na ok. ${zaokr(metry)} m, czyli ok. ${odm(metry / METRY_NA_PIETRO, PIETRA)}.`;
}

function porownanieWydajnosci(ls) {
  const naMin = ls * 60;
  const obraz = ls >= LITRY_WIADRA ? `jak ${odm(ls / LITRY_WIADRA, WIADRA)} 10 l co sekundę` : `jak ${odm(ls, BUTELKI)} 1 l co sekundę`;
  return `≈ ${obraz} - ${zaokr(naMin)} l na minutę, ${zaokr(ls * 3.6)} m³ na godzinę. Wannę (150 l) napełnia w ok. ${zaokr(LITRY_WANNY / ls)} s.`;
}

// Zwraca tekst porównania albo pusty, gdy dla danej wartości nie ma sensownego obrazu
function porownanie(wartosc, jednostka) {
  const x = liczbaPor(wartosc);
  if (!x) {
    return "";
  }
  switch (jednostka) {
    case "MPa": return porownanieCisnienia(x * 10);
    case "kPa": return porownanieCisnienia(x / 100);
    case "bar": return porownanieCisnienia(x);
    case "dm3/s": case "dm³/s": case "l/s": return porownanieWydajnosci(x);
    case "m3/h": case "m³/h": return porownanieWydajnosci(x / 3.6);
    case "kN": return `≈ ciężar ok. ${zaokr(x / KN_NA_TONE)} t${x >= 80 ? " - tyle mniej więcej naciska oś ciężkiego wozu gaśniczego" : ""}.`;
    case "MJ/m2": case "MJ/m²": return `≈ tyle energii, ile w ok. ${zaokr(x / MJ_NA_KG_DREWNA)} kg suchego drewna leżącego na każdym m² podłogi.`;
    case "kW": return `≈ moc ok. ${odm(x / KW_CZAJNIKA, CZAJNIKI)} elektrycznych pracujących naraz.`;
    case "lx": return x <= 1 ? "≈ światło jednej świeczki z odległości 1 m - wystarczy, żeby zobaczyć drogę, ale nie przeczytać tekstu." : `≈ jak ${odm(x, SWIECZKI)} z odległości 1 m.`;
    case "ppm": return `= ${(x / 10000).toLocaleString("pl-PL", { maximumFractionDigits: 4 })}% powietrza - ${zaokr(x)} cząsteczek na milion. ${x >= 100 ? "Przy dłuższym oddychaniu - ból głowy i zawroty." : ""}`.trim();
    case "m3": case "m³": return `= ${zaokr(x * 1000)} l - ${x < 50 ? `jak pokój ok. ${zaokr(Math.cbrt(x))} × ${zaokr(Math.cbrt(x))} × ${zaokr(Math.cbrt(x))} m` : `ok. ${odm(x * 1000 / LITRY_WANNY, WANNY)} wody`}.`;
    case "m2": case "m²":
      if (x < 100) {
        return `≈ pokój ok. ${zaokr(Math.sqrt(x))} × ${zaokr(Math.sqrt(x))} m.`;
      }
      return x < M2_BOISKA / 2 ? `≈ ${odm(x / M2_KORTU, KORTY)}.` : `≈ ${odm(x / M2_BOISKA, BOISKA)}.`;
    case "dm3": case "dm³": case "l": return x >= LITRY_KANISTRA ? `≈ ${odm(x / LITRY_KANISTRA, KANISTRY)} 20 l.` : x >= 5 ? `≈ ${odm(x / LITRY_WIADRA, WIADRA)} 10 l.` : "";
    case "m": return x >= 3 && x <= 300 ? `≈ ${odm(Math.round(x / METRY_NA_KROK), KROKI)}${x >= 6 && x <= 60 ? `; w pionie - ok. ${odm(x / METRY_NA_PIETRO, PIETRA)}` : ""}.` : "";
    default: return "";
  }
}

// Podpięcie do odnosniki.js: wywoływane dla każdego węzła tekstu w #widok
const BEZ_POROWNAN = "a,input,textarea,select,svg,button,.nav-header,.tab-bar,#dymek,.skrot,code";
function porownajWezel(w) {
  if (!w.parentElement || w.parentElement.closest(BEZ_POROWNAN)) {
    return;
  }
  const t = w.nodeValue;
  const trafienia = [];
  for (const m of t.matchAll(WZOR_POROWNANIA)) {
    const opis = porownanie(m[1], m[2]);
    if (opis) {
      trafienia.push({ od: m.index, do: m.index + m[0].length, html: `<abbr class="skrot por" tabindex="0" data-pelna="${esc(opis)}">${esc(m[0])}</abbr>` });
    }
  }
  podmienWezel(w, trafienia);
}

// ── Strona do nauki ──

const POROWNANIA_NAUKA = [
  ["Ciśnienie", [
    ["1 bar", "0,1 MPa"], ["Hydrant wewnętrzny - minimum na zaworze", "0,2 MPa"], ["Hydrant - maksimum (25)", "1,2 MPa"], ["Hydrant zewnętrzny przy poborze", "0,2 MPa"],
  ]],
  ["Wydajność wody", [
    ["Hydrant wewnętrzny 25", "1 l/s"], ["Hydrant wewnętrzny 52", "2,5 l/s"], ["Hydrant zewnętrzny DN 80", "10 l/s"], ["Woda do gaszenia - większa strefa ZL", "20 l/s"],
  ]],
  ["Nacisk i ciężar", [
    ["Nacisk osi na drogę pożarową w mieście", "100 kN"], ["Nacisk osi poza miastem", "50 kN"],
  ]],
  ["Ogień i energia", [
    ["Próg gęstości obciążenia ogniowego", "500 MJ/m²"], ["Duże obciążenie ogniowe", "1000 MJ/m²"], ["Kocioł na paliwo stałe (próg kotłowni)", "25 kW"],
  ]],
  ["Światło i powietrze", [
    ["Oświetlenie awaryjne na osi drogi", "1 lx"], ["Oświetlenie przy gaśnicy i hydrancie", "5 lx"], ["Czad zmierzony w Bielsku po wietrzeniu", "100 ppm"],
  ]],
  ["Przestrzeń i odległości", [
    ["Najmniejsza kubatura pomieszczenia z kotłem gazowym", "8 m³"], ["Strefa wymagająca 2 wyjść (ZL)", "300 m²"], ["Duża strefa pożarowa (oznakowanie ściany)", "2000 m²"],
    ["Dojście do gaśnicy - maksimum", "30 m"], ["Przejście ewakuacyjne w strefie ZL", "40 m"], ["Hydrant zewnętrzny od budynku", "75 m"],
  ]],
];

TRASY.unshift([/^#\/porownania$/, () => widokPorownan()]);

function widokPorownan() {
  ustawNaglowek("Liczby po ludzku", "back");
  ustawZakladke("wiedza");
  widok.innerHTML = `<div class="section-header"><div class="section-sub">${tekst("Najważniejsze wartości z przepisów przełożone na obrazy z życia. W całej aplikacji możesz też stuknąć podkreśloną liczbę z jednostką - pokaże się takie porównanie. Przeliczenia są przybliżone.")}</div></div>`
    + POROWNANIA_NAUKA.map(([grupa, lista]) => `<div class="section-label">${tekst(grupa)}</div><div class="nz-blok">${lista.map(([co, wartosc]) => {
      const m = [...wartosc.matchAll(WZOR_POROWNANIA)][0];
      return `<div class="por-w"><p class="nz-co">${tekst(co)}: <b class="liczba">${esc(wartosc)}</b></p><p class="por-opis">${m ? esc(porownanie(m[1], m[2])) : ""}</p></div>`;
    }).join("")}</div>`).join("");
}
