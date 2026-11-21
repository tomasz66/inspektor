// Ocena ryzyka pożarowego instalacji fotowoltaicznej - na podstawie poradnika CNBOP-PIB
// „Ocena ryzyka pożarowego” (J. Kielin, 2024): analiza szkód, analiza ryzyka FMEA, odbiór, kontrola, oznakowanie.
//
//   #/narzedzia/fotowoltaika    lista kontrolna ✓ / ⚠, wynik ryzyka, uwagi do protokołu, wiedza dla strażaka
//
// Punkt: [id, kluczowy, co sprawdzić, jak / dlaczego, źródło]. „Kluczowy” = główna przyczyna pożarów wg analizy szkód.
// Wynik jest orientacyjny (ile kluczowych uwag) - nie zastępuje pomiarów elektrycznych wykonanych przez elektryka.

const KLUCZ_PV = "insp-pv";
const PORADNIK_PV = "https://cnbop.pl/app/uploads/2024/11/Poradnik_ocena-ryzyka-pozarowego_Kielin_J.pdf";
const KLUCZOWY = true, ZWYKLY = false;
const PROG_WYSOKIE = 3;
const PR = "poradnik CNBOP";

const PV_DZIALY = [
  ["Dokumenty i odbiór", [
    ["dok-uzg", ZWYKLY, "Uzgodnienie projektu z rzeczoznawcą ds. zabezpieczeń ppoż.", "obowiązkowe dla instalacji o mocy ponad 6,5 kW", "art. 29 Prawa budowlanego"],
    ["dok-odb", KLUCZOWY, "Protokół odbioru z pomiarami", "pomiary łańcuchów: prąd zwarciowy, napięcie obwodu otwartego, rezystancja izolacji; najlepiej także termografia", `${PR}, rozdz. 5.5.1`],
    ["dok-dokum", ZWYKLY, "Komplet dokumentacji elementów", "karty modułów, falownika, złączy, instrukcje montażu producentów", `${PR}, rozdz. 5.5.1`],
    ["dok-serwis", ZWYKLY, "Regularne kontrole i konserwacja", "instalacja PV nie jest bezobsługowa; kontrola także po burzy, awarii, spadku wydajności", `${PR}, rozdz. 5.5.2`],
  ]],
  ["Złącza i przewody DC", [
    ["dc-para", KLUCZOWY, "Wtyczka i gniazdo DC tego samego producenta", "łączenie złączy różnych producentów (tzw. parowanie krzyżowe) to częsta przyczyna przegrzania", `${PR}, rozdz. 3.3.3.1`],
    ["dc-zacisk", KLUCZOWY, "Złącza zaciśnięte właściwym narzędziem", "zaciskanie kombinerkami i niepełne połączenie styków to typowe wady montażu", `${PR}, rozdz. 3.3.3.1`],
    ["dc-trasa", ZWYKLY, "Przewody DC chronione, bez przetarć i zwisów", "uszkodzenia mechaniczne, ugryzienia kun, ostre krawędzie konstrukcji", `${PR}, rozdz. 3.6.3, 5.5.2`],
  ]],
  ["Falownik", [
    ["fal-stan", KLUCZOWY, "Falownik bez śladów przegrzania i komunikatów o usterkach", "wady falowników są obok błędów montażu główną przyczyną pożarów", `${PR}, rozdz. 3.3.2.6`],
    ["fal-chlod", ZWYKLY, "Czyste żeberka chłodzące i otwory wentylacyjne", "kurz i zastawienie powodują przegrzewanie", `${PR}, rozdz. 5.5.2`],
    ["fal-palne", ZWYKLY, "Wokół falownika nic palnego", "kartony i opał przy nagrzewającym się urządzeniu; przepis ogólny: 0,5 m od urządzeń ponad 100 °C", "z praktyki; § 4 ust. 1 pkt 8 rozp. 2010"],
  ]],
  ["Rozdzielnica AC", [
    ["ac-zaciski", KLUCZOWY, "Zaciski w rozdzielnicy AC bez śladów przegrzania", "awarie zacisków w rozdzielnicach AC wykrywano wielokrotnie; najlepiej kontrola kamerą termowizyjną", `${PR}, rozdz. 3.3.2.6`],
    ["ac-alu", KLUCZOWY, "Przewody aluminiowe prawidłowo zakończone", "nieprawidłowa obróbka przewodów aluminiowych to jedna z wykrytych przyczyn awarii", `${PR}, rozdz. 3.3.2.6`],
  ]],
  ["Moduły i dach", [
    ["mod-stan", ZWYKLY, "Moduły bez pęknięć, przebarwień i gorących punktów", "najlepiej termografia; uszkodzenia prowadzą do miejscowego przegrzania", `${PR}, rozdz. 5.5.1-5.5.2`],
    ["mod-konstr", ZWYKLY, "Konstrukcja montażowa i kotwienie w dobrym stanie", "korozja, luźne elementy, obciążenie śniegiem i wiatrem", `${PR}, rozdz. 5.5.1`],
    ["mod-dach", ZWYKLY, "Rodzaj pokrycia dachu pod modułami", "pokrycia „miękkie” (papa na styropianie) gorzej znoszą ogień pod modułami niż „twarde” (dachówka)", `${PR}, rozdz. 5.4`],
    ["mod-czysto", ZWYKLY, "Pod modułami nie ma liści, gniazd ani roślinności", "palny materiał w szczelinie między modułem a dachem", `${PR}, rozdz. 5.5.2`],
  ]],
  ["Oznakowanie i wyłączanie (dla straży)", [
    ["ozn-znak", KLUCZOWY, "Oznakowanie instalacji PV w punkcie przyłączenia", "znak przy złączu albo rozdzielnicy głównej - w dymie panele na dachu nie zawsze widać", `${PR}, rozdz. 6.1; PN-HD 60364-7-712 pkt 712.514`],
    ["ozn-plan", ZWYKLY, "Plan instalacji dla straży przy punkcie przyłączenia", "przewody pod napięciem, położenie modułów, urządzenia odłączające DC", `${PR}, rozdz. 6.2`],
    ["ozn-wyl", ZWYKLY, "Urządzenia odłączające DC są i są oznaczone", "wyłączenie po stronie AC nie odcina napięcia w modułach i przewodach DC", `${PR}, rozdz. 5.6-5.7`],
    ["ozn-instr", ZWYKLY, "Instrukcja postępowania na wypadek pożaru", "w widocznym miejscu, z telefonami alarmowymi", "§ 4 ust. 2 pkt 3 rozp. 2010"],
  ]],
];

TRASY.unshift([/^#\/narzedzia\/fotowoltaika$/, () => widokPv()]);

function punktyPv() {
  return PV_DZIALY.flatMap(([dzial, lista]) => lista.map(([id, klucz, co, jak, zr]) => ({ id, klucz, co, jak, zr, dzial })));
}

// Orientacyjny poziom ryzyka: liczba kluczowych uwag (wg analizy szkód z poradnika)
function wynikPv(st) {
  const punkty = punktyPv();
  const kluczoweUwagi = punkty.filter((p) => p.klucz && st[p.id] === "uwaga").length;
  const wszystkieUwagi = punkty.filter((p) => st[p.id] === "uwaga").length;
  const sprawdzone = punkty.filter((p) => st[p.id]).length;
  if (!sprawdzone) {
    return { poziom: "", opis: "Zaznaczaj punkty - wynik pojawi się tutaj.", klasa: "" };
  }
  if (kluczoweUwagi >= PROG_WYSOKIE) {
    return { poziom: "Ryzyko wysokie", opis: `${kluczoweUwagi} uwagi w punktach, które są główną przyczyną pożarów PV. Zalecenie: pomiary i termografia przez elektryka, naprawa przed dalszą eksploatacją.`, klasa: "wysokie" };
  }
  if (kluczoweUwagi > 0 || wszystkieUwagi >= PROG_WYSOKIE) {
    return { poziom: "Ryzyko podwyższone", opis: `Uwagi: ${wszystkieUwagi} (w tym kluczowe: ${kluczoweUwagi}). Zalecenie: usunąć wskazane braki i zlecić kontrolę serwisową.`, klasa: "podwyzszone" };
  }
  return { poziom: "Ryzyko niskie (w sprawdzonym zakresie)", opis: `Sprawdzone ${sprawdzone} z ${punkty.length}, bez kluczowych uwag. Pamiętaj o regularnych kontrolach.`, klasa: "niskie" };
}

function widokPv() {
  ustawNaglowek("Fotowoltaika - ryzyko", "back");
  ustawZakladke("start");
  const st = czytaj(KLUCZ_PV, {});
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Ocena ryzyka pożarowego instalacji PV na podstawie poradnika CNBOP-PIB. ✓ = w porządku, ⚠ = uwaga. Punkty oznaczone KLUCZOWE to według analizy szkód główne przyczyny pożarów: wady montażu, złącza DC, falowniki i zaciski w rozdzielnicach.")}</div></div>
    <div id="pv-wynik"></div>
    ${PV_DZIALY.map(([dzial, lista]) => `<div class="section-label">${tekst(dzial)}</div><div class="nz-blok">${lista.map(([id, klucz, co, jak, zr]) => wierszPv(id, klucz, co, jak, zr, st)).join("")}</div>`).join("")}
    <div class="section-label">Dla strażaka - z poradnika</div>
    <div class="nz-blok wd-pad-blok">
      <p><b>Otwieranie dachu z modułami</b> to według poradnika najgroźniejsza czynność (ocena ryzyka 16) - odsłania części pod napięciem, a moduły w świetle dziennym nadal wytwarzają prąd.</p>
      <p><b>Podawanie wody</b> - ryzyko porażenia oceniono jako niskie (4), ale tylko przy zachowaniu odległości, właściwym środku gaśniczym i bez kałuż.</p>
      <p><b>Reflektory nocą wytwarzają napięcie w modułach.</b> Odległość reflektora od pola modułów: min. 10 m przy mocy do 1 kW, powyżej - 10 m + 1,5 m na każdy kW (4 kW → 16 m).</p>
      <p><b>Wyłączenie prądu w budynku nie odcina strony DC</b> - przewody od modułów do falownika mogą być pod napięciem.</p>
      <p class="nz-podstawa">Źródło: poradnik CNBOP-PIB, rozdz. 4.2 i 4.5.2.3</p>
    </div>
    <div class="section-label">Do protokołu</div><div class="nz-blok" id="pv-protokol"></div>
    <div class="btn-row"><button class="pastylka szara" onclick="if(confirm('Wyczyścić zaznaczenia i zacząć nową ocenę?')){zapisz(KLUCZ_PV,{});widokPv()}">Nowa ocena</button></div>
    <p class="nz-podstawa ob-stopka">${tekst("Ocena orientacyjna, oparta na liście kontrolnej - nie zastępuje pomiarów elektrycznych (rezystancja izolacji, termografia) wykonywanych przez uprawnionego elektryka.")} <a href="${PORADNIK_PV}" target="_blank" rel="noopener">Poradnik CNBOP (PDF) ›</a></p>`;
  odswiezPv();
}

function wierszPv(id, klucz, co, jak, zr, st) {
  const s = st[id] || "";
  return `<div class="c-w ${s}" data-k="${id}">
    <div class="c-gora"><div class="c-t" onclick="this.closest('.c-w').classList.toggle('rozw')">${tekst(co)}${klucz ? ' <span class="wd-etyk wd-kluczowy">KLUCZOWE</span>' : ""}<small>${tekst(jak)}</small></div>
      <button class="c-b ok${s === "ok" ? " on" : ""}" aria-label="OK" onclick="ustawPv('${id}','ok')">✓</button>
      <button class="c-b uwaga${s === "uwaga" ? " on" : ""}" aria-label="Uwaga" onclick="ustawPv('${id}','uwaga')">⚠</button></div>
    <div class="c-szcz"><p class="nz-podstawa">Źródło: ${tekst(zr)}</p></div></div>`;
}

function ustawPv(id, s) {
  const st = czytaj(KLUCZ_PV, {});
  st[id] = st[id] === s ? "" : s;
  zapisz(KLUCZ_PV, st);
  const el = document.querySelector(`.c-w[data-k="${id}"]`);
  el.classList.remove("ok", "uwaga");
  if (st[id]) {
    el.classList.add(st[id]);
  }
  el.querySelector(".c-b.ok").classList.toggle("on", st[id] === "ok");
  el.querySelector(".c-b.uwaga").classList.toggle("on", st[id] === "uwaga");
  odswiezPv();
}

function odswiezPv() {
  const st = czytaj(KLUCZ_PV, {});
  const w = wynikPv(st);
  document.getElementById("pv-wynik").innerHTML = `<div class="pv-wynik ${w.klasa}">${w.poziom ? `<b>${w.poziom}</b>` : ""}<p>${tekst(w.opis)}</p></div>`;
  const uwagi = punktyPv().filter((p) => st[p.id] === "uwaga");
  document.getElementById("pv-protokol").innerHTML = uwagi.length
    ? uwagi.map((p) => wynik(`${p.dzial}: ${p.co}`, `Stwierdzono nieprawidłowość. ${p.jak}`, p.zr)).join("") + `<div class="btn-row"><button class="pastylka szara" onclick="kopiujPv()">Kopiuj do protokołu</button></div>`
    : wynik("Brak uwag", "Zaznacz ⚠ przy punkcie, który nie spełnia wymagań - pojawi się tutaj.", "");
}

async function kopiujPv() {
  const st = czytaj(KLUCZ_PV, {});
  const w = wynikPv(st);
  const uwagi = punktyPv().filter((p) => st[p.id] === "uwaga").map((p, i) => `${i + 1}. ${p.co} - ${p.jak} (${p.zr})`);
  const tekstProtokolu = [`Ocena ryzyka pożarowego instalacji fotowoltaicznej: ${w.poziom}.`, w.opis, "", "Stwierdzone nieprawidłowości:", ...uwagi, "", "Podstawa: poradnik CNBOP-PIB „Ocena ryzyka pożarowego” (J. Kielin, 2024)."].join("\n");
  try {
    await navigator.clipboard.writeText(tekstProtokolu);
    alert("Skopiowano do schowka.");
  } catch (e) {
    alert(tekstProtokolu);
  }
}
