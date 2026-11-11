// Interaktywne rysunki do lekcji - zamiast zdjęć. Każdy pokazuje jedną zasadę z przepisu tak,
// żeby ją zobaczyć i „przekręcić” suwakiem, a nie wkuwać. Liczby tylko ze sprawdzonych paragrafów.
//
//   RYSUNKI[id bloku] = [html(), podepnij()]  ─► lekcja.js wstawia html i wywołuje podepnij()

const KG_JEDNOSTKI = 2;
const ZASIEG_GASNICY_M = 30;
const KG_GASNICY = 6;
const DNI_POWIADOMIENIA = 7;
const MIESIECY_SZKOLA = 3;
const LAT_OGOLNIE = 2;

function sekcjaRysunku(znacznik, tytul, srodek, przypis) {
  return `<section class="l-ekran l-rysunek"><p class="l-znacznik">${tekst(znacznik)}</p><h2 class="l-h2">${tekst(tytul)}</h2>${srodek}
    ${przypis ? `<p class="l-przypis">${tekst(przypis)}</p>` : ""}</section>`;
}

function przelacznik(id, opcje) {
  return `<div class="l-strefy" id="${id}" style="grid-template-columns:repeat(${opcje.length},1fr)">${opcje.map((o, i) => `<button class="${i ? "" : "on"}" data-i="${i}"><b>${esc(o[0])}</b>${o[1] ? `<span>${esc(o[1])}</span>` : ""}</button>`).join("")}</div>`;
}

function podepnijPrzelacznik(id, naZmiane) {
  document.querySelectorAll(`#${id} button`).forEach((b) => (b.onclick = () => {
    document.querySelectorAll(`#${id} button`).forEach((x) => x.classList.toggle("on", x === b));
    naZmiane(Number(b.dataset.i));
  }));
}

function wynik(pary, opis) {
  return `${pary.map(([liczba, jedn]) => `<div><span class="l-liczba">${liczba}</span><span class="l-jedn">${esc(jedn)}</span></div>`).join("")}${opis ? `<p>${tekst(opis)}</p>` : ""}`;
}

// ── 1. Obowiązki właściciela: lista do odhaczenia (art. 4 ust. 1 ustawy) ──

const OBOWIAZKI = [
  ["Przestrzegać wymagań techniczno-budowlanych, instalacyjnych i technologicznych", "Czy nikt nie przerobił klatki schodowej, czy drzwi przeciwpożarowe same się domykają."],
  ["Wyposażyć w wymagane urządzenia przeciwpożarowe i gaśnice", "Czy są gaśnice i urządzenia, których budynek wymaga (np. hydranty, wyłącznik prądu)."],
  ["Zapewnić przeglądy, konserwacje i naprawy urządzeń i gaśnic", "Data przeglądu na gaśnicy, protokoły hydrantów i instalacji."],
  ["Zapewnić bezpieczeństwo i możliwość ewakuacji", "Drożne wyjścia, oznakowanie, oświetlenie awaryjne."],
  ["Przygotować obiekt do akcji ratowniczej", "Dojazd dla straży, dostęp do wyłącznika prądu i kurka gazu."],
  ["Zapoznać pracowników z przepisami przeciwpożarowymi", "Szkolenie i podpisy pracowników."],
  ["Ustalić sposoby postępowania na wypadek pożaru", "Instrukcja z numerami alarmowymi, IBP."],
];

function rysObowiazki() {
  return sekcjaRysunku("Sprawdź na liście", "7 rzeczy, które sprawdzasz u każdego klienta",
    `<ol class="l-lista7" id="l-lista7">${OBOWIAZKI.map(([o, p], i) => `<li><button data-i="${i}"><span class="l-ptaszek"></span><b>${tekst(o)}</b><small>${tekst(p)}</small></button></li>`).join("")}</ol>
    <div class="l-wynik l-wynik-1" id="l-wynik7"></div>`,
    "Lista to art. 4 ust. 1 ustawy o ochronie ppoż. Szare zdania pod spodem to przykłady, na co patrzysz w terenie - moje, nie z przepisu.");
}

function podObowiazki() {
  const pokaz = () => {
    const n = document.querySelectorAll("#l-lista7 li.ok").length;
    document.getElementById("l-wynik7").innerHTML = wynik([[`${n}/7`, "sprawdzone"]], n === OBOWIAZKI.length ? "Cały art. 4 ust. 1 - to mapa każdego Twojego przeglądu." : "Dotknij obowiązku, gdy wiesz, co u klienta sprawdzisz.");
  };
  document.querySelectorAll("#l-lista7 button").forEach((b) => (b.onclick = () => {
    b.parentElement.classList.toggle("ok");
    pokaz();
  }));
  pokaz();
}

// ── 2. Próbna ewakuacja: termin z § 17 rozp. 2010 ──

function rysEwakuacja() {
  return sekcjaRysunku("Policz termin", "Do kiedy próbna ewakuacja?",
    `${przelacznik("l-ewak", [["Biuro, zakład", "ponad 50 stałych użytkowników"], ["Szkoła, internat", "co roku nowa grupa"]])}
    <label class="l-suwak"><span id="l-ewak-etyk">Ostatnia próbna ewakuacja</span><input type="date" id="l-ewak-data" class="l-data"></label>
    <div class="l-wynik" id="l-ewak-wynik"></div>`,
    "§ 17 ust. 1-2 i 4 rozp. 2010. Powiadomienie PSP liczy się od dnia ćwiczenia - jeśli robisz je wcześniej, powiadamiasz wcześniej.");
}

function podEwakuacja() {
  const pole = document.getElementById("l-ewak-data");
  const etykieta = document.getElementById("l-ewak-etyk");
  let szkola = false;
  const fmt = (d) => d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
  const licz = () => {
    const start = pole.value ? new Date(pole.value + "T12:00:00") : null;
    if (!start) {
      document.getElementById("l-ewak-wynik").innerHTML = "";
      return;
    }
    const termin = new Date(start);
    if (szkola) {
      termin.setMonth(termin.getMonth() + MIESIECY_SZKOLA);
    } else {
      termin.setFullYear(termin.getFullYear() + LAT_OGOLNIE);
    }
    const powiadom = new Date(termin.getTime() - DNI_POWIADOMIENIA * DZIEN_MS);
    document.getElementById("l-ewak-wynik").innerHTML = `<div class="l-wynik-wiersz"><span class="l-jedn">Ćwiczenie najpóźniej</span><span class="l-data-wynik">${fmt(termin)}</span></div>
      <div class="l-wynik-wiersz"><span class="l-jedn">Powiadom PSP najpóźniej</span><span class="l-data-wynik">${fmt(powiadom)}</span></div>
      <p>${tekst(szkola ? "Szkoły, przedszkola, internaty, akademiki: co najmniej raz w roku, ale nie później niż 3 miesiące od przyjścia nowych użytkowników." : "Obiekt dla ponad 50 stałych użytkowników (poza ZL IV): co najmniej raz na 2 lata.")}</p>`;
  };
  podepnijPrzelacznik("l-ewak", (i) => {
    szkola = i === 1;
    etykieta.textContent = szkola ? "Pierwszy dzień nowych uczniów (np. 1 września)" : "Ostatnia próbna ewakuacja";
    pole.value = szkola ? `${new Date().getFullYear()}-09-01` : dzisIso();
    licz();
  });
  pole.value = dzisIso();
  pole.addEventListener("input", licz);
  licz();
}

// ── 3. Trójkąt spalania: zabierz jeden bok (materiał kursu T-1) ──

const BOKI = [
  ["Materiał palny", "Zabierasz paliwo: zakręcasz gaz, odsuwasz to, co może się zapalić."],
  ["Tlen", "Odcinasz powietrze: koc gaśniczy, piana, zamknięcie dopływu powietrza (np. przy pożarze sadzy)."],
  ["Ciepło", "Schładzasz: woda zabiera ciepło szybciej, niż ogień je wytwarza."],
];

function rysSpalanie() {
  return sekcjaRysunku("Dotknij boku trójkąta", "Zabierz jeden składnik - ogień gaśnie",
    `<svg class="l-plan" viewBox="0 0 340 250" id="l-trojkat">
      <line x1="170" y1="30" x2="40" y2="220" data-i="0" class="l-bok"/><line x1="170" y1="30" x2="300" y2="220" data-i="1" class="l-bok"/><line x1="40" y1="220" x2="300" y2="220" data-i="2" class="l-bok"/>
      <text x="92" y="122" class="l-bok-tekst" text-anchor="end">Materiał palny</text><text x="250" y="122" class="l-bok-tekst" text-anchor="start">Tlen</text><text x="170" y="244" class="l-bok-tekst" text-anchor="middle">Ciepło</text>
      <text x="170" y="160" class="l-ogien" id="l-ogien" text-anchor="middle">pali się</text></svg>
    <div class="l-wynik l-wynik-1" id="l-trojkat-wynik"><p>${tekst("Dotknij jednego z boków.")}</p></div>`,
    "Trójkąt spalania - materiał kursu T-1 „Podstawowe pojęcia dotyczące spalania, pożarów i wybuchów” (CS PSP).");
}

function podSpalanie() {
  document.querySelectorAll("#l-trojkat .l-bok").forEach((l) => (l.onclick = () => {
    const i = Number(l.dataset.i);
    document.querySelectorAll("#l-trojkat .l-bok").forEach((x) => x.classList.toggle("zabrany", x === l));
    document.getElementById("l-ogien").textContent = "zgaszone";
    document.getElementById("l-ogien").classList.add("zgaszone");
    document.getElementById("l-trojkat-wynik").innerHTML = `<p><b>${tekst(BOKI[i][0])}:</b> ${tekst(BOKI[i][1])}</p>`;
  }));
}

// ── 4. Grupy wysokości budynków (§ 8 WT) ──

function grupaWysokosci(h) {
  if (h <= 12) {
    return ["N", "niski", "do 12 m włącznie"];
  }
  if (h <= 25) {
    return ["SW", "średniowysoki", "ponad 12 m do 25 m"];
  }
  if (h <= 55) {
    return ["W", "wysoki", "ponad 25 m do 55 m"];
  }
  return ["WW", "wysokościowy", "powyżej 55 m"];
}

function rysBudynki() {
  return sekcjaRysunku("Przesuń suwak", "Jak wysoki jest ten budynek dla straży?",
    `<svg class="l-plan" viewBox="0 0 340 250" id="l-budynek"></svg>
    <label class="l-suwak"><span>Wysokość nad terenem</span><input type="range" id="l-wys" min="3" max="80" step="1" value="10"></label>
    <div class="l-wynik" id="l-wys-wynik"></div>`,
    "§ 8 WT 2002. Budynki mieszkalne liczy się też kondygnacjami: N do 4, SW ponad 4 do 9, W ponad 9 do 18 kondygnacji nadziemnych.");
}

function podBudynki() {
  const suwak = document.getElementById("l-wys");
  const rysuj = () => {
    const h = Number(suwak.value);
    const [kod, nazwa, zakres] = grupaWysokosci(h);
    const skala = 2.6;
    const wys = h * skala;
    const kondygnacje = Math.max(1, Math.round(h / 3));
    let pietra = "";
    for (let k = 1; k < kondygnacje; k++) {
      pietra += `<line x1="135" x2="205" y1="${230 - k * (wys / kondygnacje)}" y2="${230 - k * (wys / kondygnacje)}" class="l-pietro"/>`;
    }
    const prog = (m, opis) => `<line x1="40" x2="300" y1="${230 - m * skala}" y2="${230 - m * skala}" class="l-prog"/><text x="300" y="${226 - m * skala}" text-anchor="end" class="l-wymiar">${opis}</text>`;
    document.getElementById("l-budynek").innerHTML = `<line x1="20" x2="320" y1="230" y2="230" class="l-sciana"/>
      ${prog(12, "12 m")}${prog(25, "25 m")}${prog(55, "55 m")}
      <rect x="135" y="${230 - wys}" width="70" height="${wys}" class="l-bryla"/>${pietra}`;
    document.getElementById("l-wys-wynik").innerHTML = wynik([[kod, nazwa], [`${h} m`, "nad terenem"], [`ok. ${kondygnacje}`, "kondygnacji"], [kondygnacje > 1 ? `${kondygnacje - 1}.` : "parter", kondygnacje > 1 ? "piętro na górze" : "tylko parter"]],
      `Grupa ${kod}: ${zakres}. Piętra orientacyjnie, przy ok. 3 m na kondygnację (dla bloków mieszkalnych przepis liczy kondygnacje wprost). Im wyżej, tym dłuższa ewakuacja i trudniejsze gaszenie z zewnątrz - stąd ostrzejsze wymagania.`);
  };
  suwak.addEventListener("input", rysuj);
  rysuj();
}

// ── 5. Droga pożarowa: odległość od ściany (§ 12 rozp. 2009) ──

function rysWoda() {
  return sekcjaRysunku("Przesuń drogę", "Gdzie może biec droga pożarowa?",
    `${przelacznik("l-droga-typ", [["Budynek ZL", "ludzie: biura, hotele…"], ["Inny obiekt", "np. magazyn"]])}
    <svg class="l-plan" viewBox="0 0 340 200" id="l-droga"></svg>
    <label class="l-suwak"><span>Odległość bliższej krawędzi drogi od ściany</span><input type="range" id="l-droga-m" min="0" max="35" step="1" value="10"></label>
    <div class="l-wynik l-wynik-1" id="l-droga-wynik"></div>`,
    "§ 12 rozp. 2009: 5-15 m od ściany dla obiektów ZL, 5-25 m dla pozostałych. Hydrant: najbliższy do 75 m od obiektu, co najmniej 5 m od ściany (§ 10).");
}

function podWoda() {
  const suwak = document.getElementById("l-droga-m");
  let maks = 15;
  const rysuj = () => {
    const m = Number(suwak.value);
    const px = 110 / 35;
    const y = 70 + m * px;
    const ok = m >= 5 && m <= maks;
    document.getElementById("l-droga").innerHTML = `
      <rect x="60" y="20" width="220" height="50" class="l-bryla"/><text x="170" y="50" text-anchor="middle" class="l-wymiar">budynek</text>
      <rect x="40" y="${70 + 5 * px}" width="260" height="${(maks - 5) * px + 16}" class="l-pas-ok"/>
      <rect x="20" y="${y}" width="300" height="16" class="l-jezdnia ${ok ? "" : "zle"}"/>
      <line x1="300" x2="300" y1="70" y2="${y}" class="l-prog"/><text x="306" y="${(70 + y) / 2 + 4}" class="l-wymiar">${m} m</text>`;
    document.getElementById("l-droga-wynik").innerHTML = `<p>${ok ? `<b>Zgodnie z przepisem.</b> ${tekst(`Bliższa krawędź ${m} m od ściany - w przedziale 5-${maks} m.`)}` : `<b class="l-zle">Niezgodnie.</b> ${tekst(m < 5 ? "Za blisko ściany - minimum to 5 m." : `Za daleko - dla tego obiektu maksimum to ${maks} m.`)}`}</p>`;
  };
  podepnijPrzelacznik("l-droga-typ", (i) => {
    maks = i ? 25 : 15;
    rysuj();
  });
  suwak.addEventListener("input", rysuj);
  rysuj();
}

// ── 6. Gaśnice: plan budynku i zasięg 30 m (§ 32-33 rozp. 2010) ──

const STREFY_GASNIC = [
  { nazwa: "Biuro", opis: "ZL III", m2: 100 },
  { nazwa: "Hotel", opis: "ZL V", m2: 100 },
  { nazwa: "Magazyn", opis: "do 500 MJ/m²", m2: 300 },
  { nazwa: "Magazyn", opis: "ponad 500 MJ/m²", m2: 100 },
];

function rysGasnice() {
  return sekcjaRysunku("Sprawdź na rysunku", "Ile gaśnic potrzebuje ten budynek?",
    `${przelacznik("l-strefy", STREFY_GASNIC.map((s) => [s.nazwa, s.opis]))}
    <svg class="l-plan" id="l-plan" viewBox="0 0 340 240" role="img" aria-label="Plan budynku z zasięgiem gaśnic"></svg>
    <label class="l-suwak"><span>Powierzchnia strefy</span><input type="range" id="l-pow" min="100" max="3000" step="50" value="400"></label>
    <div class="l-wynik" id="l-wynik"></div>`,
    "Jedna jednostka = 2 kg środka (§ 32 ust. 3). Przepis mówi „na każde 100 (300) m²” - rozpoczęte 100 m² liczy się w praktyce jako całe (zaokrąglenie w górę). Kółka to zasięg 30 m (§ 33) w linii prostej; w budynku liczy się realna droga dojścia, więc rozmieszczenie jest orientacyjne.");
}

function podGasnice() {
  let strefa = 0;
  const suwak = document.getElementById("l-pow");
  const rysuj = () => {
    const s = STREFY_GASNIC[strefa];
    const pow = Number(suwak.value);
    const bok = Math.sqrt(pow);
    const jednostek = Math.ceil(pow / s.m2);
    const kg = jednostek * KG_JEDNOSTKI;
    // Siatka n×n: przekątna komórki nie większa niż 2 × zasięg - każdy punkt w kółku najbliższej gaśnicy.
    const n = Math.max(1, Math.ceil(bok / (ZASIEG_GASNICY_M * Math.SQRT2)));
    const poKg = Math.ceil(kg / KG_GASNICY);
    const sztuk = Math.max(n * n, poKg);
    const skala = 200 / Math.max(bok, 60);
    const w = bok * skala;
    const x0 = (340 - w) / 2;
    const y0 = (240 - w) / 2;
    const krok = w / n;
    let gasnice = "";
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const cx = x0 + krok * (i + 0.5);
        const cy = y0 + krok * (j + 0.5);
        gasnice += `<circle cx="${cx}" cy="${cy}" r="${ZASIEG_GASNICY_M * skala}" class="l-zasieg"/><rect x="${cx - 4}" y="${cy - 7}" width="8" height="14" rx="3" class="l-gasnica"/>`;
      }
    }
    document.getElementById("l-plan").innerHTML = `<defs><clipPath id="l-klip"><rect x="${x0}" y="${y0}" width="${w}" height="${w}"/></clipPath></defs>
      <rect x="${x0}" y="${y0}" width="${w}" height="${w}" class="l-sciana"/><g clip-path="url(#l-klip)">${gasnice}</g>
      <text x="${x0}" y="${y0 - 8}" class="l-wymiar">${Math.round(bok)} m × ${Math.round(bok)} m</text>`;
    document.getElementById("l-wynik").innerHTML = wynik([[kg, "kg środka"], [sztuk, `${sztuk === 1 ? "gaśnica" : sztuk < 5 ? "gaśnice" : "gaśnic"} po 6 kg`]],
      `${pow} m² - ${s.nazwa.toLowerCase()} (${s.opis}): 1 jednostka na każde ${s.m2} m² → ${jednostek} × 2 kg.${n * n > poKg ? " Tu o liczbie decyduje zasięg 30 m, a nie kilogramy." : ""}`);
  };
  podepnijPrzelacznik("l-strefy", (i) => {
    strefa = i;
    rysuj();
  });
  suwak.addEventListener("input", rysuj);
  rysuj();
}

// ── 7. Czyszczenie przewodów - rok na osi (§ 34 rozp. 2010) ──

const PRZEWODY = [
  ["Gastronomia", "paleniska", 1, "co najmniej raz w miesiącu"],
  ["Paliwo stałe", "piec, kocioł", 3, "co najmniej raz na 3 miesiące"],
  ["Olej, gaz", "paleniska", 6, "co najmniej raz na 6 miesięcy"],
  ["Wentylacja", "przewody", 12, "co najmniej raz w roku"],
];
const MIESIACE = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function rysInstalacje() {
  return sekcjaRysunku("Wybierz przewód", "Jak często kominiarz?",
    `${przelacznik("l-przewod", PRZEWODY.map((p) => [p[0], p[1]]))}
    <div class="l-rok" id="l-rok"></div>
    <div class="l-wynik" id="l-przewod-wynik"></div>`,
    "§ 34 ust. 1-2 rozp. 2010. Kontrola stanu technicznego przewodów kominowych i instalacji gazowej - co rok (art. 62 Prawa budowlanego).");
}

function podInstalacje() {
  const rysuj = (i) => {
    const [nazwa, , co, opis] = PRZEWODY[i];
    document.getElementById("l-rok").innerHTML = MIESIACE.map((m, k) => `<div class="${k % co === 0 ? "on" : ""}"><i></i><span>${m}</span></div>`).join("");
    document.getElementById("l-przewod-wynik").innerHTML = wynik([[12 / co, "razy w roku"]], `${nazwa}: ${opis}.`);
  };
  podepnijPrzelacznik("l-przewod", rysuj);
  rysuj(0);
}

// ── 7a. Wyłącznik ppoż. (§ 183 WT) i obowiązki przy fotowoltaice (art. 29 PB, rozp. 2023) ──

const PROG_PWP_M3 = 1000;
const PV_UZGODNIENIE_KW = 6.5;
const PV_PROJEKT_KW = 50;
const PV_BEZ_POZWOLENIA_KW = 150;

function rysPwp() {
  return sekcjaRysunku("Policz sam", "Czy potrzebny wyłącznik ppoż.?",
    `${przelacznik("l-pwp-wybuch", [["Bez strefy wybuchu", ""], ["Jest strefa wybuchu", ""]])}
    <div class="l-wymiary">
      <label>Długość strefy, m<input type="number" id="l-pwp-a" min="0" step="0.1" value="20" class="l-data"></label>
      <label>Szerokość, m<input type="number" id="l-pwp-b" min="0" step="0.1" value="10" class="l-data"></label>
      <label>Wysokość, m<input type="number" id="l-pwp-h" min="0" step="0.1" value="4" class="l-data"></label>
    </div>
    <div class="l-wynik" id="l-pwp-wynik"></div>`,
    "§ 183 ust. 2 WT: strefa pożarowa ponad 1000 m³ albo ze strefą zagrożenia wybuchem. Liczy się kubatura strefy pożarowej, nie całego terenu.")
    + sekcjaRysunku("Przesuń suwak", "Fotowoltaika - co trzeba załatwić?",
    `<label class="l-suwak"><span>Moc instalacji PV</span><input type="range" id="l-pv" min="1" max="200" step="0.5" value="9.5"></label>
    <div class="l-wynik l-wynik-1" id="l-pv-wynik"></div>`,
    "Art. 29 ust. 4 pkt 3 lit. c Prawa budowlanego i § 3 ust. 1 pkt 12 rozp. 2023 o uzgadnianiu. Slajdy z 2021 r. podają 50 kW jako próg bez pozwolenia - dziś 150 kW.");
}

function podPwp() {
  let wybuch = false;
  const liczba = (id) => Math.max(0, Number(document.getElementById(id).value) || 0);
  const licz = () => {
    const v = liczba("l-pwp-a") * liczba("l-pwp-b") * liczba("l-pwp-h");
    const pokazana = `${Math.round(v * 10) / 10} m³`;
    const potrzebny = wybuch || v > PROG_PWP_M3;
    let opis = `${pokazana} nie przekracza ${PROG_PWP_M3} m³ i nie ma strefy wybuchu - wyłącznik nie jest wymagany z § 183.`;
    if (wybuch) {
      opis = "Strefa zawiera strefę zagrożenia wybuchem - wyłącznik wymagany bez względu na kubaturę.";
    } else if (potrzebny) {
      opis = `${pokazana} przekracza ${PROG_PWP_M3} m³ - wyłącznik wymagany, przy głównym wejściu lub złączu, oznakowany.`;
    }
    document.getElementById("l-pwp-wynik").innerHTML = wynik([[potrzebny ? "TAK" : "NIE", "wyłącznik"], [pokazana, "kubatura strefy"]], opis);
  };
  const pv = () => {
    const kw = Number(document.getElementById("l-pv").value);
    const lista = [];
    if (kw <= PV_UZGODNIENIE_KW) {
      lista.push("Do 6,5 kW - bez uzgodnienia z rzeczoznawcą i bez zawiadamiania PSP.");
    } else {
      lista.push("Ponad 6,5 kW - projekt PV uzgadnia rzeczoznawca ds. zabezpieczeń ppoż.");
      lista.push("Po montażu - zawiadomienie PSP i plan urządzenia PV dla ekip ratowniczych.");
    }
    if (kw > PV_PROJEKT_KW) {
      lista.push("Ponad 50 kW - obiekt z taką PV jest na liście obiektów, których projekty budowlane wymagają uzgodnienia ppoż. (rozp. 2023).");
    }
    lista.push(kw <= PV_BEZ_POZWOLENIA_KW ? "Do 150 kW - montaż bez pozwolenia na budowę i bez zgłoszenia." : "Ponad 150 kW - zwolnienie z pozwolenia i zgłoszenia już nie działa.");
    document.getElementById("l-pv-wynik").innerHTML = `${wynik([[`${kw} kW`, "moc PV"]], "")}<ul class="l-pv-lista">${lista.map((x) => `<li>${tekst(x)}</li>`).join("")}</ul>`;
  };
  podepnijPrzelacznik("l-pwp-wybuch", (i) => {
    wybuch = i === 1;
    licz();
  });
  ["l-pwp-a", "l-pwp-b", "l-pwp-h"].forEach((id) => document.getElementById(id).addEventListener("input", licz));
  document.getElementById("l-pv").addEventListener("input", pv);
  licz();
  pv();
}

// ── 8. Prace pożarowo niebezpieczne: przed, w trakcie, po (§ 36 rozp. 2010) ──

const ETAPY_PRAC = [
  ["Przed", ["Ocenić zagrożenie pożarowe w miejscu prac", "Ustalić, jak nie dopuścić do pożaru", "Wskazać osoby odpowiedzialne", "Tylko upoważnieni z kwalifikacjami", "Zaznajomić wykonawców z zagrożeniami"]],
  ["W trakcie", ["Zabezpieczyć materiały palne, także w rejonach przyległych", "W strefie wybuchu: max 10% dolnej granicy wybuchowości", "Sprzęt do gaszenia na miejscu", "Tylko sprawny sprzęt"]],
  ["Po", ["Skontrolować miejsce prac", "Skontrolować rejony przyległe"]],
];

function rysPrace() {
  return sekcjaRysunku("Przełącz etap", "Spawanie w obiekcie - co i kiedy",
    `${przelacznik("l-etap", ETAPY_PRAC.map((e) => [e[0], `${e[1].length} kroki`.replace("5 kroki", "5 kroków")]))}
    <ul class="l-ptaszki" id="l-etap-lista"></ul>`,
    "§ 36 ust. 1-2 rozp. 2010. Za przygotowanie odpowiada właściciel, zarządca lub użytkownik obiektu.");
}

function podPrace() {
  const rysuj = (i) => {
    document.getElementById("l-etap-lista").innerHTML = ETAPY_PRAC[i][1].map((x) => `<li>${tekst(x)}</li>`).join("");
  };
  podepnijPrzelacznik("l-etap", rysuj);
  rysuj(0);
}

// ── 9. Poważne awarie: suma q/Q (rozp. 2016/138) ──

const SUBSTANCJE = [
  { nazwa: "Gaz płynny", zzr: 50, zdr: 200, max: 260, krok: 5, start: 30 },
  { nazwa: "Benzyny i oleje", zzr: 2500, zdr: 25000, max: 30000, krok: 100, start: 1500 },
];

function rysAwarie() {
  return sekcjaRysunku("Przesuń ilości", "ZZR, ZDR czy zwykły zakład?",
    `${SUBSTANCJE.map((s, i) => `<label class="l-suwak"><span>${esc(s.nazwa)}: <b id="l-q${i}"></b> t <small>(próg ZZR ${s.zzr} t, ZDR ${s.zdr} t)</small></span>
      <input type="range" id="l-s${i}" min="0" max="${s.max}" step="${s.krok}" value="${s.start}"></label>`).join("")}
    <div class="l-wynik" id="l-awaria-wynik"></div>`,
    "Progi: rozp. 2016/138, tabela 2 (poz. 18 i 34). Uproszczenie: obie substancje liczone razem jako zagrożenia fizyczne (P). Suma q/Q ≥ 1 oznacza zakład w kategorii, nawet gdy żadna substancja osobno nie przekracza progu.");
}

function podAwarie() {
  const licz = () => {
    const q = SUBSTANCJE.map((s, i) => Number(document.getElementById(`l-s${i}`).value));
    q.forEach((v, i) => (document.getElementById(`l-q${i}`).textContent = v.toLocaleString("pl-PL")));
    const sumaZzr = q.reduce((s, v, i) => s + v / SUBSTANCJE[i].zzr, 0);
    const sumaZdr = q.reduce((s, v, i) => s + v / SUBSTANCJE[i].zdr, 0);
    const kat = sumaZdr >= 1 ? ["ZDR", "duże ryzyko - nadzoruje komendant wojewódzki"] : sumaZzr >= 1 ? ["ZZR", "zwiększone ryzyko - nadzoruje komendant powiatowy"] : ["-", "poza kategoriami ZZR i ZDR"];
    document.getElementById("l-awaria-wynik").innerHTML = wynik([[sumaZzr.toFixed(2).replace(".", ","), "suma q/Q dla ZZR"], [kat[0], "kategoria"]], `${kat[1][0].toUpperCase()}${kat[1].slice(1)}.`);
  };
  SUBSTANCJE.forEach((_, i) => document.getElementById(`l-s${i}`).addEventListener("input", licz));
  licz();
}

// ── 10. Kontrola PSP krok po kroku (art. 23 i 26 ustawy o PSP) ──

const KROKI_KONTROLI = [
  ["Upoważnienie", "Doręczone co najmniej 7 dni przed kontrolą (3 dni, gdy obiekt sam wystąpił o opinię PSP). Bez zapowiedzi tylko w wyjątkach, np. przy zagrożeniu życia."],
  ["Kontrola", "W obecności kontrolowanego albo osoby przez niego upoważnionej. Strażak sprawdza obiekt według wzoru protokołu."],
  ["Protokół", "Kontrolowany może wnieść zastrzeżenia przed podpisaniem. Odmowa podpisu - kontrolujący robi wzmiankę w protokole."],
  ["Decyzja", "Komendant powiatowy nakazuje usunięcie uchybień w terminie albo wstrzymuje prace czy zakazuje używania maszyn."],
  ["Odwołanie", "Od decyzji komendanta powiatowego - do komendanta wojewódzkiego PSP."],
  ["Egzekucja", "Gdy obowiązek nie jest wykonany: upomnienie, tytuł wykonawczy, grzywna w celu przymuszenia."],
];

function rysKontrole() {
  return sekcjaRysunku("Dotknij kroku", "Kontrola straży od zapowiedzi do egzekucji",
    `<ol class="l-os" id="l-os">${KROKI_KONTROLI.map(([k], i) => `<li><button data-i="${i}" class="${i ? "" : "on"}"><span>${i + 1}</span>${esc(k)}</button></li>`).join("")}</ol>
    <div class="l-wynik l-wynik-1" id="l-os-wynik"></div>`,
    "Art. 23 i 26 ustawy o PSP; odwołanie i egzekucja - prezentacja „Kontrole w zakładzie pracy” (CS PSP).");
}

function podKontrole() {
  const pokaz = (i) => {
    document.querySelectorAll("#l-os button").forEach((b) => b.classList.toggle("on", Number(b.dataset.i) === i));
    document.getElementById("l-os-wynik").innerHTML = `<p><b>${tekst(KROKI_KONTROLI[i][0])}.</b> ${tekst(KROKI_KONTROLI[i][1])}</p>`;
  };
  document.querySelectorAll("#l-os button").forEach((b) => (b.onclick = () => pokaz(Number(b.dataset.i))));
  pokaz(0);
}

// ── 11. Czy obiekt potrzebuje IBP? (§ 6 ust. 1 i 8 rozp. 2010) ──

const PROG_KUBATURY_M3 = 1000;
const PROG_INWENTARSKI_M3 = 1500;
const PROG_POWIERZCHNI_M2 = 1000;
const RODZAJE_IBP = [["Budynek", ""], ["Inwentarski", "obora, chlewnia"], ["Inny niż budynek", "wiata, plac"]];

function rysIbp() {
  return sekcjaRysunku("Policz sam", "Czy ten obiekt potrzebuje IBP?",
    `${przelacznik("l-ibp-funkcja", [["Funkcja z § 6 ust. 1", "publiczna, zbiorowa, PM"], ["Poza listą", "np. mieszkalny"]])}
    ${przelacznik("l-ibp-rodzaj", RODZAJE_IBP)}
    ${przelacznik("l-ibp-wybuch", [["Bez strefy wybuchu", ""], ["Jest strefa wybuchu", ""]])}
    <div class="l-wymiary">
      <label>Długość, m<input type="number" id="l-ibp-a" min="0" step="0.1" value="20" class="l-data"></label>
      <label>Szerokość, m<input type="number" id="l-ibp-b" min="0" step="0.1" value="10" class="l-data"></label>
      <label id="l-ibp-h-etyk">Wysokość brutto, m<input type="number" id="l-ibp-h" min="0" step="0.1" value="4" class="l-data"></label>
    </div>
    <div class="l-wynik" id="l-ibp-wynik"></div>`,
    "Wymiary po zewnętrznym obrysie (tak liczy się kubaturę brutto - § 3 pkt 24 WT). Budynek wielokondygnacyjny: zsumuj kubatury kondygnacji. Dla budynku i budynku inwentarskiego liczy się kubatura brutto (m³), dla obiektu innego niż budynek - powierzchnia strefy pożarowej (m²).");
}

function podIbp() {
  const st = { funkcja: 0, rodzaj: 0, wybuch: 0 };
  const liczba = (id) => Math.max(0, Number(document.getElementById(id).value) || 0);
  const licz = () => {
    const obiekt = st.rodzaj === 2;
    document.getElementById("l-ibp-h-etyk").hidden = obiekt;
    const pole = liczba("l-ibp-a") * liczba("l-ibp-b");
    const wartosc = obiekt ? pole : pole * liczba("l-ibp-h");
    const prog = [PROG_KUBATURY_M3, PROG_INWENTARSKI_M3, PROG_POWIERZCHNI_M2][st.rodzaj];
    const jedn = obiekt ? "m²" : "m³";
    const pokazana = `${Math.round(wartosc * 10) / 10} ${jedn}`;
    const el = document.getElementById("l-ibp-wynik");

    if (st.funkcja === 1) {
      el.innerHTML = wynik([["NIE", "wymagana"], [pokazana, obiekt ? "powierzchnia" : "kubatura brutto"]], "Funkcji nie ma na liście § 6 ust. 1 (użyteczność publiczna, zamieszkanie zbiorowe, produkcja, magazyn, inwentarskie), więc obowiązek IBP z § 6 nie powstaje.");
      return;
    }
    if (st.wybuch === 1) {
      el.innerHTML = wynik([["TAK", "wymagana"], [pokazana, obiekt ? "powierzchnia" : "kubatura brutto"]], "Jest strefa zagrożenia wybuchem, więc zwolnienie z § 6 ust. 8 nie działa - bez względu na wielkość.");
      return;
    }
    const potrzebna = wartosc > prog;
    el.innerHTML = wynik([[potrzebna ? "TAK" : "NIE", "wymagana"], [pokazana, `próg ${prog} ${jedn}`]],
      potrzebna ? `${pokazana} przekracza ${prog} ${jedn} (§ 6 ust. 8 pkt ${st.rodzaj + 1}) - IBP jest wymagana.` : `${pokazana} nie przekracza ${prog} ${jedn} i nie ma strefy wybuchu - IBP nie jest wymagana (§ 6 ust. 8 pkt ${st.rodzaj + 1}). Równo ${prog} ${jedn} też jest zwolnione.`);
  };
  podepnijPrzelacznik("l-ibp-funkcja", (i) => { st.funkcja = i; licz(); });
  podepnijPrzelacznik("l-ibp-rodzaj", (i) => { st.rodzaj = i; licz(); });
  podepnijPrzelacznik("l-ibp-wybuch", (i) => { st.wybuch = i; licz(); });
  ["l-ibp-a", "l-ibp-b", "l-ibp-h"].forEach((id) => document.getElementById(id).addEventListener("input", licz));
  licz();
}

// ── 12. Ewakuacja: szerokości i długość przejścia (§ 237, § 239, § 240, § 242 WT) ──

const STREFY_EWAKUACJI = [
  { nazwa: "ZL", opis: "ludzie", m: 40 },
  { nazwa: "PM > 500", opis: "MJ/m², kilka kondygnacji", m: 75 },
  { nazwa: "PM pozostałe", opis: "lub 1 kondygnacja", m: 100 },
];
const DODATKI_EWAKUACJI = [
  ["Wysokość > 5 m", "+25%", 0.25],
  ["Tryskacze", "+50%", 0.5],
  ["Oddymianie", "+50%", 0.5],
];
const M_NA_100_OSOB = 0.6;
const DRZWI_MIN_M = 0.9;
const DRZWI_DO_3_OSOB_M = 0.8;
const KORYTARZ_MIN_M = 1.4;
const KORYTARZ_DO_20_OSOB_M = 1.2;

function metry(x) {
  return (Math.ceil(x * 100) / 100).toFixed(2).replace(".", ",");
}

function rysDrogi() {
  return sekcjaRysunku("Sprawdź na rysunku", "Jak szerokie drzwi i korytarz, jak daleko do wyjścia?",
    `${przelacznik("l-strefa-ew", STREFY_EWAKUACJI.map((s) => [s.nazwa, s.opis]))}
    <div class="l-strefy l-dodatki" id="l-dodatki" style="grid-template-columns:repeat(3,1fr)">${DODATKI_EWAKUACJI.map((d, i) => `<button data-i="${i}"><b>${esc(d[0])}</b><span>${esc(d[1])}</span></button>`).join("")}</div>
    <svg class="l-plan" id="l-plan-ew" viewBox="0 0 340 230" role="img" aria-label="Pomieszczenie, drzwi i korytarz z wymiarami"></svg>
    <label class="l-suwak"><span id="l-osoby-opis">Osób w pomieszczeniu</span><input type="range" id="l-osoby" min="1" max="600" step="1" value="120"></label>
    <div class="l-wynik" id="l-wynik-ew"></div>`,
    "Rysunek poglądowy, nie w skali - liczby z WT: przejście w pomieszczeniu § 237 ust. 1 i 10, powiększenia § 237 ust. 5-7, drzwi § 239 ust. 1 i 2, korytarz § 242 ust. 1-2, urządzenia przeciwpaniczne § 240 ust. 7. W pomieszczeniu zagrożonym wybuchem przejście max 40 m (§ 237 ust. 2). Korytarz liczy się dla wszystkich osób na kondygnacji - tu założono, że to te same osoby.");
}

function podDrogi() {
  let strefa = 0;
  const dodatki = new Set();
  const suwak = document.getElementById("l-osoby");
  const rysuj = () => {
    const n = Number(suwak.value);
    const proporcja = (M_NA_100_OSOB * n) / 100;
    const drzwi = n <= 3 ? DRZWI_DO_3_OSOB_M : Math.max(DRZWI_MIN_M, proporcja);
    const korytarz = n <= 20 ? KORYTARZ_DO_20_OSOB_M : Math.max(KORYTARZ_MIN_M, proporcja);
    const mnoznik = 1 + [...dodatki].reduce((s, i) => s + DODATKI_EWAKUACJI[i][2], 0);
    const dlugosc = Math.round(STREFY_EWAKUACJI[strefa].m * mnoznik);

    // Pomieszczenie po lewej, drzwi w prawej ścianie, korytarz pionowo po prawej.
    const sk = 22;
    const d = Math.min(drzwi, 3) * sk;
    const k = Math.min(korytarz, 3.6) * sk;
    const yD = 115 - d / 2;
    document.getElementById("l-plan-ew").innerHTML = `
      <path d="M230 ${yD} V30 H20 V200 H230 V${yD + d}" class="l-sciana"/>
      <path d="M${230 + k} 14 V216" class="l-sciana"/><path d="M230 14 V30 M230 200 V216" class="l-sciana"/>
      <path d="M36 186 L${222} ${115}" class="l-trasa"/><circle cx="36" cy="186" r="4" class="l-gasnica"/>
      <text x="40" y="178" class="l-wymiar">najdalsze miejsce</text>
      <text x="74" y="136" class="l-wymiar" transform="rotate(-20 74 136)">przejście ≤ ${dlugosc} m</text>
      <path d="M236 ${yD} H244 M236 ${yD + d} H244 M240 ${yD} V${yD + d}" class="l-miara"/>
      <text x="${236 + k + 6}" y="110" class="l-wymiar">korytarz</text><text x="${236 + k + 6}" y="124" class="l-wymiar">${metry(korytarz)} m</text>
      <text x="128" y="${yD - 6}" class="l-wymiar">drzwi ${metry(drzwi)} m</text>
      <text x="30" y="48" class="l-wymiar">${n} ${n === 1 ? "osoba" : n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14) ? "osoby" : "osób"}</text>`;

    const uwagi = [n > 50 ? "ponad 50 osób - drzwi otwierane na zewnątrz (§ 239 ust. 2 pkt 3)" : "do 50 osób - drzwi mogą otwierać się do środka", n > 300 ? "ponad 300 osób - urządzenia przeciwpaniczne (§ 240 ust. 7)" : ""].filter(Boolean);
    document.getElementById("l-wynik-ew").innerHTML = wynik([[metry(drzwi), "m - drzwi (łącznie)"], [metry(korytarz), "m - korytarz"], [dlugosc, "m - najdłuższe przejście"], [metry(drzwi), "m - szerokość przejścia"]],
      `0,6 m na każde 100 osób, ale nie mniej niż minimum. ${uwagi.join("; ")}.`);
  };
  podepnijPrzelacznik("l-strefa-ew", (i) => {
    strefa = i;
    rysuj();
  });
  document.querySelectorAll("#l-dodatki button").forEach((b) => (b.onclick = () => {
    const i = Number(b.dataset.i);
    dodatki.has(i) ? dodatki.delete(i) : dodatki.add(i);
    b.classList.toggle("on", dodatki.has(i));
    rysuj();
  }));
  suwak.addEventListener("input", rysuj);
  rysuj();
}

// ── Dalsze rysunki lekcji (po tabelach): RYSUNKI_DALSZE[id bloku] = [[html(), podepnij()], …] ──

// Ściana w ogniu: co znaczą litery R, E, I i liczba (§ 216 WT, oznaczenia pod tabelą).
const OZNACZENIA_REI = [
  { kod: "R 120", litery: "R", min: 120, co: "słup, belka, konstrukcja", mow: "„Ten słup przez 2 godziny pożaru utrzyma budynek - nie złamie się i nie ugnie.”" },
  { kod: "REI 60", litery: "REI", min: 60, co: "strop, ściana nośna", mow: "„Przez godzinę ten strop się nie zawali, nie przepuści ognia ani dymu na górę, a podłoga piętro wyżej nie nagrzeje się niebezpiecznie.”" },
  { kod: "EI 30", litery: "EI", min: 30, co: "ściana działowa, drzwi ppoż.", mow: "„Przez pół godziny te drzwi zatrzymają ogień i gorący dym, a od Twojej strony nie zrobią się gorące.”" },
  { kod: "E 30", litery: "E", min: 30, co: "np. drzwi przedsionka na klatkę", mow: "„Przez pół godziny ogień i gorące gazy nie przejdą przez te drzwi - ale z drugiej strony mogą się nagrzać.”" },
];
const LITERY_REI = {
  R: ["Nośność", "nie zawali się i dalej niesie ciężar"],
  E: ["Szczelność", "nie przepuści płomieni ani gorących gazów"],
  I: ["Izolacyjność", "z drugiej strony nie nagrzeje się niebezpiecznie"],
};

function rysRei() {
  return sekcjaRysunku("Jak czytać klasę", "Litery mówią CO wytrzyma, liczba - ILE minut",
    `${przelacznik("l-rei", OZNACZENIA_REI.map((o) => [o.kod, o.co]))}
    <svg class="l-plan" id="l-rei-rys" viewBox="0 0 340 200" role="img" aria-label="Ściana w ogniu z kryteriami R, E, I"></svg>
    <div class="l-wynik l-wynik-1" id="l-rei-wynik"></div>`,
    "Oznaczenia z § 216 ust. 1 WT: R - nośność, E - szczelność, I - izolacyjność ogniowa, liczba w minutach. Czytasz: „R-E-I sześćdziesiąt”. Dodatkowo: S - dymoszczelność, W - ograniczenie promieniowania. Stara klasyfikacja F: F1 = 60 minut, F2 = 120 minut (PN-B-02851). Zdania w cudzysłowie to przykład, jak powiedzieć to klientowi.");
}

function podRei() {
  const rysuj = (i) => {
    const o = OZNACZENIA_REI[i];
    const ma = (l) => o.litery.includes(l);
    const plomienie = [0, 1, 2].map((k) => `<path d="M${20 + k * 26} 170 q-14 -40 6 -78 q4 26 14 30 q6 -22 -2 -46 q30 30 14 94 z" class="l-ogien"/>`).join("");
    document.getElementById("l-rei-rys").innerHTML = `${plomienie}
      <rect x="120" y="44" width="40" height="136" class="l-sciana-rei"/>
      <text x="16" y="194" class="l-wymiar">strona pożaru</text><text x="214" y="194" class="l-wymiar">druga strona</text>
      <path d="M110 44 H170 M140 44 V24" class="l-miara"/><text x="146" y="20" class="l-wymiar">${ma("R") ? "R: niesie ciężar" : "R: bez wymagań"}</text>
      ${ma("E") ? `<path d="M166 100 h22" class="l-strzalka-stop"/><text x="192" y="104" class="l-wymiar">E: ogień nie przejdzie</text>` : `<text x="172" y="104" class="l-wymiar">E: bez wymagań</text>`}
      <text x="172" y="144" class="l-wymiar">${ma("I") ? "I: tu się nie nagrzeje" : "I: bez wymagań"}</text>
      <text x="124" y="194" class="l-wymiar">${o.min} min</text>`;
    document.getElementById("l-rei-wynik").innerHTML = wynik([[o.kod, o.co]],
      `${o.litery.split("").map((l) => `${l} - ${LITERY_REI[l][0].toLowerCase()}: ${LITERY_REI[l][1]}`).join("; ")}; ${o.min} - tyle minut pożaru według badania. Jak powiedzieć: ${o.mow}`);
  };
  podepnijPrzelacznik("l-rei", rysuj);
  rysuj(0);
}

// Strefa pożarowa: dopuszczalna powierzchnia (§ 227, § 228, § 229 WT) i porównanie z boiskiem.
const BOISKO_M2 = 105 * 68;
const STREFY_POW = [
  { nazwa: "ZL I, III, IV, V", pow: [10000, 8000, 5000, 2500], zl: true },
  { nazwa: "ZL II", pow: [8000, 5000, 3500, 2000], zl: true },
  { nazwa: "PM do 500", pow: [20000, 10000, 10000, 5000], zl: false },
  { nazwa: "PM 500-1000", pow: [15000, 8000, 8000, 2500], zl: false },
  { nazwa: "PM 1000-2000", pow: [8000, 4000, 4000, 1000], zl: false },
];
const WYSOKOSCI_STREF = ["1 kondygnacja", "N", "SW", "W / WW"];

function rysStrefy() {
  return sekcjaRysunku("Sprawdź na rysunku", "Jak duża może być jedna strefa pożarowa?",
    `${przelacznik("l-strefa-kat", STREFY_POW.map((s) => [s.nazwa, s.zl ? "ludzie" : "MJ/m²"]))}
    ${przelacznik("l-strefa-wys", WYSOKOSCI_STREF.map((w) => [w, ""]))}
    <div class="l-strefy l-dodatki" id="l-strefa-dod" style="grid-template-columns:repeat(2,1fr)"><button data-i="0"><b>Tryskacze</b></button><button data-i="1"><b>Oddymianie</b><span>samoczynne</span></button></div>
    <svg class="l-plan" id="l-strefa-rys" viewBox="0 0 340 220" role="img" aria-label="Powierzchnia strefy w porównaniu z boiskiem"></svg>
    <div class="l-wynik" id="l-strefa-wynik"></div>`,
    "Liczby z § 227 ust. 1 WT (ZL) i § 228 ust. 1 WT (PM bez pomieszczeń zagrożonych wybuchem). Powiększenia (§ 227 ust. 4, § 229 WT): ZL - tryskacze +100%, oddymianie +100%, razem +200% (nie w wielokondygnacyjnych W i WW); PM - tryskacze +100%, oddymianie +50%, razem +150%. Boisko 105 × 68 m = 7140 m² - tylko dla wyobraźni.");
}

function podStrefy() {
  let kat = 0;
  let wys = 0;
  const dod = new Set();
  const rysuj = () => {
    const s = STREFY_POW[kat];
    const baza = s.pow[wys];
    const tryskacze = dod.has(0);
    const oddym = dod.has(1);
    const bezPowiekszen = s.zl && wys === 3;
    const plus = bezPowiekszen ? 0 : s.zl ? (tryskacze ? 1 : 0) + (oddym ? 1 : 0) : (tryskacze ? 1 : 0) + (oddym ? 0.5 : 0);
    const pow = Math.round(baza * (1 + plus));
    const skala = Math.sqrt(9000 / Math.max(pow, BOISKO_M2) ) * 1.6;
    const bok = Math.sqrt(pow) * skala;
    const bw = 105 * skala * 0.9;
    const bh = 68 * skala * 0.9;
    document.getElementById("l-strefa-rys").innerHTML = `
      <rect x="20" y="${200 - bok}" width="${bok}" height="${bok}" class="l-strefa-pole"/>
      <text x="24" y="${214 - bok}" class="l-wymiar">strefa ${pow.toLocaleString("pl-PL")} m²</text>
      <rect x="${Math.min(200, 30 + bok)}" y="${200 - bh}" width="${bw}" height="${bh}" class="l-boisko"/>
      <text x="${Math.min(200, 30 + bok)}" y="${194 - bh}" class="l-wymiar">boisko</text>`;
    const boiska = (pow / BOISKO_M2).toFixed(1).replace(".", ",");
    document.getElementById("l-strefa-wynik").innerHTML = wynik([[pow.toLocaleString("pl-PL"), "m² najwyżej"], [`≈ ${boiska}`, "boiska piłkarskiego"]],
      `${s.nazwa}, ${WYSOKOSCI_STREF[wys]}: z tabeli ${baza.toLocaleString("pl-PL")} m²${plus ? `, powiększenie +${Math.round(plus * 100)}%` : ""}.${bezPowiekszen && (tryskacze || oddym) ? " W wielokondygnacyjnym budynku W i WW strefy ZL nie powiększa się." : ""}`);
  };
  podepnijPrzelacznik("l-strefa-kat", (i) => {
    kat = i;
    rysuj();
  });
  podepnijPrzelacznik("l-strefa-wys", (i) => {
    wys = i;
    rysuj();
  });
  document.querySelectorAll("#l-strefa-dod button").forEach((b) => (b.onclick = () => {
    const i = Number(b.dataset.i);
    dod.has(i) ? dod.delete(i) : dod.add(i);
    b.classList.toggle("on", dod.has(i));
    rysuj();
  }));
  rysuj();
}

// Odległość między budynkami (§ 271 ust. 1, 2, 6, 7 WT).
const RODZAJE_BUD = ["ZL", "IN", "PM ≤ 1000", "PM 1000-4000", "PM > 4000"];
const ODLEGLOSCI_271 = [
  [8, 8, 8, 15, 20],
  [8, 8, 8, 15, 20],
  [8, 8, 8, 15, 20],
  [15, 15, 15, 15, 20],
  [20, 20, 20, 20, 20],
];

function rysOdleglosci() {
  return sekcjaRysunku("Sprawdź na rysunku", "Jak daleko od sąsiada, żeby ogień nie przeskoczył?",
    `<p class="l-podpis-przel">Budynek po lewej</p>${przelacznik("l-bud-a", RODZAJE_BUD.map((x) => [x, ""]))}
    <p class="l-podpis-przel">Budynek po prawej</p>${przelacznik("l-bud-b", RODZAJE_BUD.map((x) => [x, ""]))}
    <div class="l-strefy l-dodatki" id="l-odl-dod" style="grid-template-columns:repeat(2,1fr)"><button data-i="0"><b>Ściana/dach palne</b><span>w jednym budynku</span></button><button data-i="1"><b>Tryskacze</b><span>w obu budynkach</span></button></div>
    <svg class="l-plan" id="l-odl-rys" viewBox="0 0 340 170" role="img" aria-label="Dwa budynki i odległość między nimi"></svg>
    <div class="l-wynik l-wynik-1" id="l-odl-wynik"></div>`,
    "§ 271 ust. 1 WT (tabela), ust. 2 (ściana lub dach rozprzestrzeniające ogień: jeden budynek +50%, oba +100%), ust. 6 (tryskacze we wszystkich przyległych strefach obu budynków: -50%). Pominięte tu dla prostoty: pomieszczenie zagrożone wybuchem - co najmniej 20 m (ust. 3); ściana z klasą E na 30-65% powierzchni +50%, poniżej 30% +100% (ust. 4-5); tryskacze tylko w jednym budynku -25% (ust. 7).");
}

function podOdleglosci() {
  let a = 0;
  let b = 0;
  const dod = new Set();
  const rysuj = () => {
    const baza = ODLEGLOSCI_271[a][b];
    let d = baza * (dod.has(0) ? 1.5 : 1);
    d = d * (dod.has(1) ? 0.5 : 1);
    const px = Math.min(200, d * 6);
    const x2 = 70 + px;
    document.getElementById("l-odl-rys").innerHTML = `
      <rect x="20" y="50" width="50" height="100" class="l-bryla"/><text x="22" y="44" class="l-wymiar">${RODZAJE_BUD[a]}</text>
      <rect x="${x2}" y="70" width="50" height="80" class="l-bryla"/><text x="${x2}" y="64" class="l-wymiar">${RODZAJE_BUD[b]}</text>
      <path d="M70 120 H${x2} M70 114 V126 M${x2} 114 V126" class="l-miara"/>
      <text x="${(70 + x2) / 2 - 14}" y="112" class="l-wymiar">${String(d).replace(".", ",")} m</text>
      <line x1="10" x2="330" y1="150" y2="150" class="l-sciana"/>`;
    document.getElementById("l-odl-wynik").innerHTML = wynik([[`${String(d).replace(".", ",")} m`, "najmniejsza odległość"]],
      `Z tabeli: ${baza} m${dod.has(0) ? ", +50% za palną ścianę lub dach" : ""}${dod.has(1) ? ", -50% za tryskacze w obu" : ""}. Po prostu: im więcej palnych rzeczy w środku, tym dalej trzeba stawiać sąsiada.`);
  };
  podepnijPrzelacznik("l-bud-a", (i) => {
    a = i;
    rysuj();
  });
  podepnijPrzelacznik("l-bud-b", (i) => {
    b = i;
    rysuj();
  });
  document.querySelectorAll("#l-odl-dod button").forEach((x) => (x.onclick = () => {
    const i = Number(x.dataset.i);
    dod.has(i) ? dod.delete(i) : dod.add(i);
    x.classList.toggle("on", dod.has(i));
    rysuj();
  }));
  rysuj();
}

// Budynek, budowla, mała architektura (art. 3 pkt 1-4 Prawa budowlanego).
const OBIEKTY_PB = [
  { nazwa: "Budynek", rys: '<path d="M110 160 V90 L170 50 L230 90 V160 Z" class="l-bryla"/><rect x="158" y="120" width="24" height="40" class="l-okno"/><line x1="90" x2="250" y1="160" y2="160" class="l-sciana"/><rect x="104" y="160" width="132" height="10" class="l-fundament"/>',
    przepis: "trwale związany z gruntem, wydzielony z przestrzeni przegrodami budowlanymi, ma fundamenty i dach", prosto: "Ma ściany, dach i fundament - wchodzisz do środka. Dom, blok, hala, garaż." },
  { nazwa: "Budowla", rys: '<path d="M60 160 Q170 60 280 160" class="l-sciana"/><line x1="40" x2="300" y1="120" y2="120" class="l-sciana"/><line x1="100" x2="100" y1="120" y2="160" class="l-sciana"/><line x1="240" x2="240" y1="120" y2="160" class="l-sciana"/>',
    przepis: "obiekt budowlany niebędący budynkiem ani małą architekturą, np. most, wiadukt, tunel, maszt, zbiornik, wolno stojąca instalacja przemysłowa, budowla sportowa, składowisko odpadów", prosto: "Coś zbudowanego, ale bez „środka” do mieszkania czy pracy: most, maszt, zbiornik, boisko." },
  { nazwa: "Mała architektura", rys: '<rect x="150" y="110" width="40" height="50" class="l-bryla"/><path d="M146 110 L170 86 L194 110 Z" class="l-bryla"/><line x1="90" x2="250" y1="160" y2="160" class="l-sciana"/><path d="M220 160 V128 H250 V160" class="l-sciana"/>',
    przepis: "niewielkie obiekty: kapliczki, krzyże przydrożne, figury, posągi, wodotryski, piaskownice, huśtawki, drabinki, śmietniki", prosto: "Małe rzeczy w ogrodzie czy na placu: kapliczka, huśtawka, śmietnik." },
];

function rysObiekty() {
  return sekcjaRysunku("Rozróżnij", "Budynek, budowla czy mała architektura?",
    `${przelacznik("l-obiekt", OBIEKTY_PB.map((o) => [o.nazwa, ""]))}
    <svg class="l-plan" id="l-obiekt-rys" viewBox="0 0 340 190" role="img" aria-label="Rodzaj obiektu budowlanego"></svg>
    <div class="l-wynik l-wynik-1" id="l-obiekt-wynik"></div>`,
    "Art. 3 pkt 1-4 Prawa budowlanego: obiekt budowlany to budynek, budowla albo obiekt małej architektury - wraz z instalacjami. Zdanie „po prostu” to wyjaśnienie, nie przepis.");
}

function podObiekty() {
  const rysuj = (i) => {
    const o = OBIEKTY_PB[i];
    document.getElementById("l-obiekt-rys").innerHTML = o.rys;
    document.getElementById("l-obiekt-wynik").innerHTML = wynik([[o.nazwa, ""]], `Przepis: ${o.przepis}. Po prostu: ${o.prosto}`);
  };
  podepnijPrzelacznik("l-obiekt", rysuj);
  rysuj(0);
}

// Dojście ewakuacyjne (§ 256 ust. 3-4 WT).
const STREFY_DOJSC = [
  { nazwa: "ZL I, II, V", jedno: 10, dwa: 40, poziomo: false },
  { nazwa: "ZL III", jedno: 30, dwa: 60, poziomo: true },
  { nazwa: "ZL IV", jedno: 60, dwa: 100, poziomo: true },
  { nazwa: "PM > 500", jedno: 30, dwa: 60, poziomo: true },
  { nazwa: "PM ≤ 500", jedno: 60, dwa: 100, poziomo: true },
  { nazwa: "Wybuch", jedno: 10, dwa: 40, poziomo: false },
];

function rysDojscia() {
  return sekcjaRysunku("Sprawdź na rysunku", "Jak daleko korytarzem do bezpiecznego miejsca?",
    `${przelacznik("l-doj-strefa", STREFY_DOJSC.map((s) => [s.nazwa, ""]))}
    ${przelacznik("l-doj-ile", [["Jedno dojście", "jedna klatka"], ["Dwa dojścia", "dwie klatki"]])}
    <div class="l-strefy l-dodatki" id="l-doj-dod" style="grid-template-columns:repeat(2,1fr)"><button data-i="0"><b>Tryskacze</b><span>+50%</span></button><button data-i="1"><b>Oddymianie</b><span>drogi, +50%</span></button></div>
    <svg class="l-plan" id="l-doj-rys" viewBox="0 0 340 150" role="img" aria-label="Korytarz z dojściem do klatki schodowej"></svg>
    <div class="l-wynik l-wynik-1" id="l-doj-wynik"></div>`,
    "§ 256 ust. 3 WT (tabela) i ust. 4 (powiększenia). Przy jednym dojściu w ZL III, ZL IV i PM - w tym najwyżej 20 m poziomej drogi. Przy dwóch dojściach limit dotyczy krótszego, drugie może być o 100% dłuższe; wspólny początek najwyżej 2 m. Bezpieczne miejsce to inna strefa, wyjście na zewnątrz albo obudowana klatka z drzwiami EI 30 chroniona przed dymem (§ 256 ust. 2).");
}

function podDojscia() {
  let st = 0;
  let dwa = false;
  const dod = new Set();
  const rysuj = () => {
    const s = STREFY_DOJSC[st];
    const baza = dwa ? s.dwa : s.jedno;
    const d = Math.round(baza * (1 + (dod.has(0) ? 0.5 : 0) + (dod.has(1) ? 0.5 : 0)));
    const klatka = '<rect x="0" y="0" width="34" height="50" class="l-klatka"/><path d="M6 44 h6 v-8 h6 v-8 h6 v-8 h6" class="l-miara"/>';
    document.getElementById("l-doj-rys").innerHTML = `
      <rect x="40" y="55" width="${dwa ? 260 : 270}" height="30" class="l-korytarz"/>
      <g transform="translate(${dwa ? 300 : 306} 45)">${klatka}</g>${dwa ? `<g transform="translate(6 45)">${klatka}</g>` : ""}
      <rect x="160" y="85" width="40" height="40" class="l-bryla"/><text x="164" y="140" class="l-wymiar">pokój</text>
      <path d="M180 85 V70 H${dwa ? 300 : 306}" class="l-trasa"/>${dwa ? '<path d="M180 70 H40" class="l-trasa"/>' : ""}
      <text x="${dwa ? 214 : 214}" y="48" class="l-wymiar">≤ ${d} m${dwa ? " (krótsze)" : ""}</text>`;
    document.getElementById("l-doj-wynik").innerHTML = wynik([[`${d} m`, dwa ? "krótsze z dwóch dojść" : "jedyne dojście"]],
      `${s.nazwa}: ${dwa ? `z tabeli ${s.dwa} m, drugie dojście może mieć do ${d * 2} m` : `z tabeli ${s.jedno} m${s.poziomo ? ", w tym najwyżej 20 m poziomej drogi" : ""}`}${dod.size ? ` - z powiększeniem +${dod.size * 50}%` : ""}. Po prostu: z jedną klatką schodową droga musi być krótka, bo nie ma drugiej drogi ucieczki.`);
  };
  podepnijPrzelacznik("l-doj-strefa", (i) => {
    st = i;
    rysuj();
  });
  podepnijPrzelacznik("l-doj-ile", (i) => {
    dwa = i === 1;
    rysuj();
  });
  document.querySelectorAll("#l-doj-dod button").forEach((x) => (x.onclick = () => {
    const i = Number(x.dataset.i);
    dod.has(i) ? dod.delete(i) : dod.add(i);
    x.classList.toggle("on", dod.has(i));
    rysuj();
  }));
  rysuj();
}

// Droga pożarowa z góry: szerokość, odcinki przed i za budynkiem, plac, łuk (§ 12-13 rozp. 2009).
function rysDrogaPlan() {
  return sekcjaRysunku("Zobacz z góry", "Droga pożarowa - wszystkie wymiary na jednym planie",
    `<svg class="l-plan" viewBox="0 0 340 230" role="img" aria-label="Plan drogi pożarowej z wymiarami">
      <rect x="90" y="30" width="160" height="70" class="l-bryla"/><text x="140" y="70" class="l-wymiar">budynek</text>
      <rect x="40" y="140" width="260" height="24" class="l-droga"/>
      <path d="M90 100 V140 M250 100 V140" class="l-miara"/><text x="96" y="124" class="l-wymiar">5-15 m (ZL)</text>
      <path d="M40 176 H90 M250 176 H300 M40 170 V182 M90 170 V182 M250 170 V182 M300 170 V182" class="l-miara"/>
      <text x="44" y="194" class="l-wymiar">≥ 10 m</text><text x="254" y="194" class="l-wymiar">≥ 10 m</text>
      <path d="M312 140 V164" class="l-miara"/><text x="304" y="136" class="l-wymiar">≥ 4 m</text>
      <rect x="0" y="120" width="40" height="64" class="l-plac"/><text x="2" y="114" class="l-wymiar">plac 20×20</text>
      <text x="96" y="214" class="l-wymiar">nachylenie do 5% · ślepy odcinek tyłem do 15 m · łuk ≥ 11 m</text>
    </svg>`,
    "§ 12 rozp. 2009: droga wzdłuż dłuższego boku na całej długości (krótszy bok ponad 60 m - z dwóch stron), bliższa krawędź 5-15 m od ściany dla ZL (5-25 m dla innych), szerokość co najmniej 4 m i nachylenie do 5% wzdłuż budynku i 10 m przed i za nim; bez drzew i stałych elementów wyższych niż 3 m między drogą a ścianą. § 13: przejazd bez cofania albo plac 20 × 20 m, ślepy odcinek z wyjazdem tyłem najwyżej 15 m, promień zewnętrznego łuku co najmniej 11 m. Rysunek poglądowy, nie w skali.");
}

// Alarm dwustopniowy - scenariusz krok po kroku (prezentacja MAT-TSZ T-2, slajd 58; § 28 rozp. 2010).
const KROKI_ALARMU = [
  ["Czujka wykrywa dym", "Czujka w pomieszczeniu wyczuwa dym i wysyła sygnał do centrali."],
  ["Centrala - alarm I stopnia", "Centrala pokazuje i drukuje strefę i nazwę pomieszczenia, włącza alarm I stopnia - tylko dla obsługi."],
  ["Obsługa potwierdza", "Pracownik ochrony naciska przycisk przyjęcia alarmu i idzie sprawdzić pomieszczenie."],
  ["3 minuty na sprawdzenie", "Obsługa ma czas, żeby zobaczyć, czy to pożar, czy np. para z czajnika."],
  ["Alarm II stopnia", "Pożar potwierdzony albo brak reakcji obsługi - centrala sama ogłasza alarm II stopnia - dla całego budynku - i uruchamia to, co przewiduje scenariusz pożarowy (np. sygnalizatory lub DSO, sterowania, przekazanie alarmu do straży, jeśli jest monitoring)."],
];

function rysAlarm() {
  return sekcjaRysunku("Przejdź krok po kroku", "Co się dzieje, gdy czujka wyczuje dym?",
    `<ol class="l-kroki" id="l-alarm">${KROKI_ALARMU.map(([t, o], i) => `<li class="${i ? "" : "on"}"><b>${tekst(t)}</b><span>${tekst(o)}</span></li>`).join("")}</ol>
    <div class="btn-row"><button class="l-przycisk" id="l-alarm-dalej">Następny krok</button></div>`,
    "Przykładowy algorytm scenariusza pożarowego ze slajdu 58 prezentacji MAT-TSZ T-2 (CS PSP). Czasy i sterowania ustala się w scenariuszu pożarowym konkretnego budynku. Po prostu: najpierw sprawdza ochrona, a gdy nie zdąży albo potwierdzi pożar - alarm dla wszystkich.");
}

function podAlarm() {
  let k = 0;
  const lista = document.querySelectorAll("#l-alarm li");
  document.getElementById("l-alarm-dalej").onclick = () => {
    k = (k + 1) % lista.length;
    lista.forEach((li, i) => li.classList.toggle("on", i <= k));
    document.getElementById("l-alarm-dalej").textContent = k === lista.length - 1 ? "Od początku" : "Następny krok";
  };
}

// Piramida PSP: kto kogo powołuje i gdzie idzie odwołanie (art. 9, 11a, 13 ustawy o PSP).
function rysPiramida() {
  return sekcjaRysunku("Zobacz", "Piramida straży - od powiatu do kraju",
    `<svg class="l-plan" viewBox="0 0 340 220" role="img" aria-label="Piramida komendantów PSP">
      <path d="M170 14 L240 74 H100 Z" class="l-poziom1"/><text x="170" y="62" text-anchor="middle" class="l-wymiar">Komendant Główny</text>
      <path d="M100 80 H240 L290 140 H50 Z" class="l-poziom2"/><text x="170" y="116" text-anchor="middle" class="l-wymiar">komendanci wojewódzcy (16)</text>
      <path d="M50 146 H290 L330 206 H10 Z" class="l-poziom3"/><text x="170" y="182" text-anchor="middle" class="l-wymiar">komendanci powiatowi (miejscy) - I instancja</text>
    </svg>
    <div class="l-wynik l-wynik-1">${wynik([["↑", "odwołanie idzie piętro wyżej"]], "Decyzję wydaje komendant powiatowy. Odwołujesz się do wojewódzkiego, a od decyzji wojewódzkiego - do Komendanta Głównego. Komendanta Głównego powołuje premier, wojewódzkiego - minister, powiatowego - komendant wojewódzki w porozumieniu ze starostą.")}</div>`,
    "Art. 9, 11a i 13 ustawy o PSP. Liczba 16 = województwa.");
}

// Siły w akcji: ile zastępów (wozów) w pododdziale (§ 6 rozp. o KSRG).
const SILY = [
  ["Zastęp", 1, 1, "2-6 ratowników z dowódcą i pojazdem"],
  ["Sekcja", 2, 2, "2 zastępy"],
  ["Pluton", 3, 4, "3-4 zastępy"],
  ["Kompania", 8, 16, "8-16 zastępów"],
  ["Batalion", 24, 80, "3-5 kompanii (z dowódcą i sztabem)"],
];

function rysSily() {
  return sekcjaRysunku("Zobacz na rysunku", "Ile wozów to pluton, a ile batalion?",
    `${przelacznik("l-sily", SILY.map((s) => [s[0], ""]))}
    <svg class="l-plan" id="l-sily-rys" viewBox="0 0 340 200" role="img" aria-label="Liczba wozów w pododdziale"></svg>
    <div class="l-wynik l-wynik-1" id="l-sily-wynik"></div>`,
    "§ 6 ust. 1 rozp. o KSRG (2026). Rota = 2 ratowników. Batalion: 3-5 kompanii po 8-16 zastępów, czyli od 24 do 80 zastępów - liczba wyliczona z przepisu. Jeden kwadrat = jeden wóz (zastęp).");
}

function podSily() {
  const rysuj = (i) => {
    const [nazwa, od, doo, opis] = SILY[i];
    const n = doo;
    const kol = 10;
    const bok = n > 20 ? 12 : 22;
    const odstep = bok + 6;
    let kw = "";
    for (let j = 0; j < n; j++) {
      const x = 20 + (j % kol) * odstep;
      const y = 20 + Math.floor(j / kol) * odstep;
      kw += `<rect x="${x}" y="${y}" width="${bok}" height="${bok}" rx="3" class="${j < od ? "l-woz" : "l-woz-moze"}"/>`;
    }
    document.getElementById("l-sily-rys").innerHTML = kw;
    document.getElementById("l-sily-wynik").innerHTML = wynik([[od === doo ? String(od) : `${od}-${doo}`, od === 1 && doo === 1 ? "wóz" : "wozów (zastępów)"]], `${nazwa}: ${opis}. Pełne kwadraty - najmniej, jasne - do ilu może urosnąć.`);
  };
  podepnijPrzelacznik("l-sily", rysuj);
  rysuj(0);
}

// Kary z Kodeksu karnego na skali lat (art. 163, 164, 288 KK).
const KARY = [
  ["Pożar umyślnie (art. 163)", 1, 10],
  ["Pożar nieumyślnie", 0.25, 5],
  ["Niebezpieczeństwo pożaru umyślnie (art. 164)", 0.5, 8],
  ["Niebezpieczeństwo pożaru nieumyślnie", 0, 3],
  ["Zniszczenie cudzej rzeczy (art. 288)", 0.25, 5],
];

function rysKary() {
  const lata = (x) => 20 + x * 28;
  return sekcjaRysunku("Zobacz na skali", "Co grozi za pożar - w latach więzienia",
    `<svg class="l-plan" viewBox="0 0 340 230" role="img" aria-label="Kary pozbawienia wolności na skali lat">
      ${[0, 2, 4, 6, 8, 10].map((x) => `<line x1="${lata(x)}" x2="${lata(x)}" y1="18" y2="200" class="l-pietro"/><text x="${lata(x) - 4}" y="216" class="l-wymiar">${x}</text>`).join("")}
      ${KARY.map(([n, od, doo], i) => `<text x="20" y="${30 + i * 38}" class="l-wymiar">${esc(n)}</text><rect x="${lata(od)}" y="${36 + i * 38}" width="${lata(doo) - lata(od)}" height="12" rx="3" class="l-kara"/>`).join("")}
    </svg>`,
    "Art. 163 § 1-2, art. 164 § 1-2 i art. 288 § 1 Kodeksu karnego, kary pozbawienia wolności (lata; 0,25 = 3 miesiące). Ze skutkiem śmierci lub ciężkiego uszczerbku wielu osób - umyślnie 2-15 lat, nieumyślnie 6 miesięcy-8 lat (art. 163 § 3-4). Art. 288 - ściganie na wniosek pokrzywdzonego.");
}

// Hydranty zewnętrzne - rozstawienie (§ 10 rozp. 2009).
function rysHydranty() {
  return sekcjaRysunku("Zobacz z góry", "Gdzie stoją hydranty przy budynku",
    `<svg class="l-plan" viewBox="0 0 340 210" role="img" aria-label="Rozstawienie hydrantów zewnętrznych">
      <rect x="10" y="150" width="320" height="26" class="l-droga"/><text x="14" y="194" class="l-wymiar">jezdnia</text>
      <rect x="120" y="20" width="120" height="70" class="l-bryla"/><text x="150" y="58" class="l-wymiar">budynek</text>
      <circle cx="60" cy="132" r="7" class="l-hydrant"/><circle cx="290" cy="132" r="7" class="l-hydrant"/>
      <path d="M60 116 H290" class="l-miara"/><text x="140" y="112" class="l-wymiar">między hydrantami ≤ 150 m</text>
      <path d="M290 132 V176" class="l-miara"/><text x="296" y="148" class="l-wymiar">≤ 15 m</text>
      <path d="M67 128 L120 70" class="l-trasa"/><text x="14" y="78" class="l-wymiar">do budynku</text><text x="14" y="90" class="l-wymiar">≤ 75 m</text>
      <path d="M240 60 H262" class="l-miara"/><text x="244" y="52" class="l-wymiar">≥ 5 m od ściany</text>
    </svg>`,
    "§ 10 rozp. 2009: hydranty nadziemne DN 80 (10 dm³/s przy 0,2 MPa), odstęp między nimi do 150 m, najbliższy do 75 m od chronionego obiektu, co najmniej 5 m od ściany budynku, do 15 m od krawędzi jezdni; przegląd i konserwacja co najmniej raz w roku przez właściciela sieci. Po prostu: hydrant ma być blisko, ale nie pod samą ścianą, która może się palić. Rysunek nie w skali.");
}

const RYSUNKI_DALSZE = {
  budynki: [[rysObiekty, podObiekty], [rysRei, podRei], [rysStrefy, podStrefy], [rysOdleglosci, podOdleglosci]],
  ewakuacja: [[rysDojscia, podDojscia]],
  woda: [[rysDrogaPlan, () => {}], [rysHydranty, () => {}]],
  sprzet: [[rysAlarm, podAlarm]],
  system: [[rysPiramida, () => {}]],
  akcja: [[rysSily, podSily]],
  przyczyny: [[rysKary, () => {}]],
};

const RYSUNKI = {
  ewakuacja: [rysDrogi, podDrogi],
  obowiazki: [rysObowiazki, podObowiazki],
  ibp: [rysIbp, podIbp],
  organizacja: [rysEwakuacja, podEwakuacja],
  spalanie: [rysSpalanie, podSpalanie],
  budynki: [rysBudynki, podBudynki],
  woda: [rysWoda, podWoda],
  urzadzenia: [rysGasnice, podGasnice],
  instalacje: [rysPwp, podPwp],
  ogrzewanie: [rysInstalacje, podInstalacje],
  prace: [rysPrace, podPrace],
  awarie: [rysAwarie, podAwarie],
  kontrole: [rysKontrole, podKontrole],
};
