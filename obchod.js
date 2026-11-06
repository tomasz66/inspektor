// Obchód obiektu - lista kontrolna inspektora: co sprawdzić, jaka wartość obowiązuje, który przepis.
// Te same dane pokazuje temat „Wartości przy obchodzie” w Poszerz wiedzę (poszerz.js).
//
//   #/narzedzia/obchod    lista działów z punktami; przy każdym: OK / uwaga / nie dotyczy, na końcu „Do protokołu”
//
// Wartości z przepisów sprawdzone w tekstach aktów 2.11.2026; wartości oznaczone „(norma)” - z Polskich Norm,
// cytowane za materiałami kursu i literaturą (normy są płatne). Stan obchodu: localStorage „insp-obchod”.

const KLUCZ_OBCHODU = "insp-obchod";
const STANY = ["", "ok", "uwaga", "nd"];
const NAZWY_STANOW = { ok: "OK", uwaga: "Uwaga", nd: "Nie dotyczy" };

TRASY.push([/^#\/narzedzia\/obchod$/, () => widokObchodu()]);

// [co sprawdzić, wymagana wartość, przepis, dla kogo (puste = wszyscy)]
const OBCHOD = [
  {
    id: "dok", dzial: "Dokumenty - poproś i obejrzyj", punkty: [
      ["Instrukcja bezpieczeństwa pożarowego", "jest w obiektach użyteczności publicznej, zamieszkania zbiorowego, PM i inwentarskich; zwolnione tylko bez strefy wybuchowej i do 1000 m³ (inwentarskie do 1500 m³, obiekt inny niż budynek do 1000 m²); aktualizacja co najmniej co 2 lata i po zmianie sposobu użytkowania; dostępna dla ekip ratowniczych", "§ 6 ust. 1, 7, 8 i 9 rozp. 2010", ""],
      ["Przeglądy urządzeń ppoż. i gaśnic", "zgodnie z zaleceniem producenta, nie rzadziej niż raz w roku; data na gaśnicy i w protokole", "§ 3 ust. 2 i 3 rozp. 2010", ""],
      ["Próba ciśnieniowa węży hydrantowych", "raz na 5 lat", "§ 3 ust. 4 rozp. 2010", ""],
      ["Praktyczne sprawdzenie ewakuacji", "ponad 50 stałych użytkowników (poza ZL IV) - co 2 lata; szkoły, internaty, akademiki - co rok i do 3 miesięcy od przyjścia nowych; komendant PSP powiadomiony tydzień wcześniej", "§ 17 ust. 1, 2 i 4 rozp. 2010", "ZL"],
      ["Kontrola roczna budynku (instalacje gazowe, przewody kominowe)", "co najmniej raz w roku", "art. 62 ust. 1 pkt 1 Prawa budowlanego", ""],
      ["Badanie instalacji elektrycznej i piorunochronnej", "co najmniej raz na 5 lat", "art. 62 ust. 1 pkt 2 Prawa budowlanego", ""],
      ["Czyszczenie przewodów (protokół kominiarza)", "paliwo stałe - co 3 miesiące; olej i gaz - co 6 miesięcy; gastronomia - co miesiąc; wentylacja - raz w roku", "§ 34 ust. 1 i 2 rozp. 2010", ""],
      ["Ocena zagrożenia wybuchem", "jest, gdy w obiekcie są materiały tworzące mieszaniny wybuchowe; z planem stref", "§ 37 ust. 1-3 rozp. 2010", "PM"],
      ["Wyznaczeni pracownicy do gaszenia pożarów i ewakuacji", "imiennie, przeszkoleni", "art. 209¹ Kodeksu pracy", ""],
      ["Zabezpieczenie prac pożarowo niebezpiecznych (spawanie, cięcie)", "przed pracami: ocena zagrożenia, osoby odpowiedzialne, upoważnieni wykonawcy, sprzęt gaśniczy na miejscu, kontrola po zakończeniu", "§ 36 ust. 1 i 2 rozp. 2010", ""],
    ],
  },
  {
    id: "teren", dzial: "Teren wokół budynku", punkty: [
      ["Droga pożarowa - czy wymagana", "budynki z ZL I lub ZL II; budynki SW, W, WW z ZL III, IV, V; PM o Q ponad 500 i ponad 1000 m² albo z pomieszczeniem zagrożonym wybuchem; PM ponad 20 000 m²; budynek niski z ZL III ponad 1000 m² powyżej parteru lub z ZL V ponad 50 miejsc noclegowych", "§ 12 ust. 1 rozp. 2009", ""],
      ["Droga pożarowa - parametry", "utwardzona, przejezdna cały rok; przy budynku i 10 m przed i za - szerokość min. 4 m i spadek do 5%; dalej min. 3,5 m (miasto i działka PM) lub 3 m; nacisk osi 100 kN w mieście i przy PM, 50 kN poza miastem", "§ 12 ust. 1, § 13 ust. 1-3 rozp. 2009", ""],
      ["Odległość drogi pożarowej od ściany", "5-15 m przy budynkach ZL, 5-25 m przy pozostałych; wzdłuż dłuższego boku, z dwóch stron gdy krótszy bok ponad 60 m", "§ 12 ust. 2 rozp. 2009", ""],
      ["Drzewa, płoty, wiaty między drogą a ścianą", "nic wyższego niż 3 m, co utrudnia dostęp drabiny lub podnośnika", "§ 12 ust. 2 rozp. 2009", ""],
      ["Zawracanie i łuki", "przejazd bez cofania albo plac 20 × 20 m; odcinek z cofaniem do 15 m; zewnętrzny łuk drogi min. 11 m", "§ 12 ust. 9-11 rozp. 2009", ""],
      ["Dojście od wyjść do drogi pożarowej", "utwardzone, szerokość min. 1,5 m, długość do 50 m (przy budynku do 3 kondygnacji i 12 m bez drogi wzdłuż ściany - do 30 m)", "§ 12 ust. 4 i 7 rozp. 2009", ""],
      ["Hydranty zewnętrzne", "najbliższy do 75 m od budynku; kolejne do 150 m; między hydrantami do 150 m; do 15 m od jezdni; min. 5 m od ściany; oznakowane, niezastawione; przegląd raz w roku", "§ 10 ust. 6, 12 i 13 rozp. 2009; § 4 ust. 1 pkt 18 lit. c rozp. 2010", ""],
      ["Wydajność hydrantów", "DN 80 - 10 l/s, nadziemny DN 100 - 15 l/s przy 0,2 MPa; ZL do 5000 m³ i 1000 m² - 10 l/s (1 hydrant), większe - 20 l/s (2 hydranty)", "§ 10 ust. 8, § 5 ust. 1 rozp. 2009", ""],
      ["Odległość od sąsiednich budynków", "zwykle 8 m; 15 m przy PM o Q 1000-4000; 20 m przy Q ponad 4000 lub zagrożeniu wybuchem", "§ 271 ust. 1 i 3 WT", ""],
      ["Materiały palne składowane na zewnątrz", "min. 4 m od granicy działki; pod ścianą - tylko związane z funkcją obiektu, min. 5 m od drogi pożarowej; wokół placów składowych pas 2 m niepalny lub oczyszczony", "§ 4 ust. 1 pkt 6, ust. 3 i 4 rozp. 2010", ""],
      ["Kurek główny gazu", "na zewnątrz, w wentylowanej szafce lub do 10 m od budynku; dostępny i oznakowany", "§ 159 ust. 2 WT; § 4 ust. 2 pkt 4 lit. d rozp. 2010", ""],
      ["Zbiorniki gazu płynnego", "odległości od budynków wg tabeli; min. 5 m od rowów, studzienek, wpustów kanalizacyjnych", "§ 179 ust. 3 i 4 WT", ""],
      ["Miejsce zbiórki do ewakuacji", "wyznaczone i oznakowane", "§ 4 ust. 2 pkt 4 lit. f rozp. 2010", ""],
      ["Okna dla ekip ratowniczych, wjazd na teren", "niezastawione, brama otwierana dla straży", "§ 4 ust. 1 pkt 18 lit. e rozp. 2010", ""],
    ],
  },
  {
    id: "wejscie", dzial: "Wejście, prąd i gaz", punkty: [
      ["Przeciwpożarowy wyłącznik prądu", "w strefach pożarowych ponad 1000 m³ lub ze strefą zagrożoną wybuchem; przy głównym wejściu lub złączu; oznakowany; odcina wszystko poza urządzeniami potrzebnymi w pożarze", "§ 183 ust. 2-4 WT", ""],
      ["Instrukcja postępowania na wypadek pożaru z telefonami alarmowymi", "w widocznym miejscu", "§ 4 ust. 2 pkt 3 rozp. 2010", ""],
      ["Dostęp do rozdzielnic i kurków gazu", "niezastawione", "§ 4 ust. 1 pkt 18 lit. f rozp. 2010", ""],
    ],
  },
  {
    id: "ewak", dzial: "Drogi i wyjścia ewakuacyjne", punkty: [
      ["Liczba wyjść z pomieszczenia", "2 wyjścia min. 5 m od siebie, gdy: ponad 50 osób (ZL II - ponad 30), ZL ponad 300 m², PM o Q ponad 500 i ponad 300 m², PM o Q do 500 i ponad 1000 m², zagrożone wybuchem ponad 100 m²", "§ 238 pkt 1-5 WT", ""],
      ["Przejście w pomieszczeniu (od najdalszego miejsca do drzwi)", "ZL - 40 m; PM wielokondygnacyjny Q ponad 500 - 75 m; pozostałe PM - 100 m; zagrożone wybuchem - 40 m; nie przez więcej niż 3 pomieszczenia; szerokość min. 0,9 m (0,6 m na 100 osób)", "§ 237 ust. 1, 2, 8 i 10 WT", ""],
      ["Dojście (korytarzem do wyjścia lub innej strefy)", "przy 1 / przy 2 dojściach: ZL I, II, V - 10 / 40 m; ZL III - 30 / 60 m; ZL IV - 60 / 100 m; PM Q ponad 500 - 30 / 60 m; PM Q do 500 - 60 / 100 m; z zagrożeniem wybuchem - 10 / 40 m", "§ 256 ust. 3 WT", ""],
      ["Korytarz ewakuacyjny", "szerokość min. 1,4 m (1,2 m dla nie więcej niż 20 osób), 0,6 m na 100 osób; wysokość min. 2,2 m (lokalnie 2 m)", "§ 242 ust. 1-3 WT", ""],
      ["Nic nie zawęża dróg ewakuacyjnych", "zakaz składowania i ustawiania przedmiotów zmniejszających szerokość lub wysokość", "§ 4 ust. 1 pkt 11 i 16 rozp. 2010", ""],
      ["Wykończenie dróg ewakuacyjnych", "bez materiałów łatwo zapalnych; w ZL I, II, III, V bez łatwo zapalnych, bardzo toksycznych lub intensywnie dymiących", "§ 258 ust. 1 i 2 WT", ""],
      ["Drzwi ewakuacyjne - wymiary", "każde min. 0,9 m (do 3 osób 0,8 m), łącznie 0,6 m na 100 osób; wysokość 2 m; próg do 2 cm", "§ 239 ust. 1 i 6, § 62 ust. 1 i 3 WT", ""],
      ["Drzwi ewakuacyjne - otwieranie", "na zewnątrz: z budynku dla ponad 50 osób, z pomieszczeń dla ponad 50 osób, zagrożonych wybuchem lub dla ponad 6 osób o ograniczonej zdolności poruszania się; urządzenia przeciwpaniczne przy ponad 300 osobach; bez zamknięć uniemożliwiających natychmiastowe otwarcie; rozsuwane tylko z otwieraniem na sygnał wykrywania dymu; obrotowe i podnoszone zakazane", "§ 236 ust. 4, § 239 ust. 2, § 240 ust. 3, 4 i 7 WT; § 4 ust. 1 pkt 14 rozp. 2010", ""],
      ["Klatki schodowe", "obudowane, drzwi dymoszczelne, oddymianie z czujkami: ZL II w budynku niskim; ZL I, II, III, V w średniowysokim; PM o Q ponad 500 lub ze strefą wybuchową w N i SW; budynki W i WW - § 246", "§ 245, § 246 WT", ""],
    ],
  },
  {
    id: "znaki", dzial: "Oznakowanie i oświetlenie awaryjne", punkty: [
      ["Znaki ewakuacyjne", "na drogach i wyjściach (poza budynkami mieszkalnymi) i w pomieszczeniach z 2 wyjściami; widoczne z każdego miejsca drogi", "§ 4 ust. 2 pkt 4 lit. a rozp. 2010; PN-EN ISO 7010 (norma)", ""],
      ["Znaki ochrony ppoż.", "gaśnice, hydranty, ROP, PWP, przyciski oddymiania, kurek gazu, drzwi ppoż., drogi pożarowe, strefy wybuchowe, materiały niebezpieczne", "§ 4 ust. 2 pkt 4 lit. b-k rozp. 2010", ""],
      ["Awaryjne oświetlenie ewakuacyjne - czy wymagane", "pomieszczenia: widownie kin i teatrów, sale (konferencyjne, sportowe, lokale rozrywkowe) ponad 200 osób, sale wystawowe muzeów, garaże ponad 1000 m² oświetlone tylko sztucznie, pomieszczenia ponad 2000 m² w budynkach UP, ZZ i PM; drogi ewakuacyjne: z tych pomieszczeń, oświetlone tylko sztucznie, w szpitalach, w budynkach UP i ZZ wysokich i wysokościowych", "§ 181 ust. 3 WT", ""],
      ["Awaryjne oświetlenie - czas działania", "co najmniej 1 godzina od zaniku zasilania", "§ 181 ust. 5 WT", ""],
      ["Awaryjne oświetlenie - natężenie (norma)", "na osi drogi ewakuacyjnej min. 1 lx; w strefie otwartej (antypanicznej) min. 0,5 lx; przy gaśnicach, hydrantach, ROP min. 5 lx; 50% światła w 5 s, 100% w 60 s", "§ 181 ust. 7 WT; PN-EN 1838 (norma)", ""],
      ["Awaryjne oświetlenie - testy (norma)", "test działania co miesiąc, test pełnego czasu pracy raz w roku, zapisy w książce; przegląd jak urządzenie ppoż. - min. raz w roku", "PN-EN 50172 (norma); § 2 ust. 1 pkt 9 i § 3 ust. 3 rozp. 2010", ""],
    ],
  },
  {
    id: "gasnice", dzial: "Gaśnice i koce", punkty: [
      ["Ilość środka gaśniczego", "2 kg (lub 3 dm³) na każde 100 m² w ZL I, II, III, V, PM o Q ponad 500 i przy zagrożeniu wybuchem; na każde 300 m² w pozostałych (bez ZL IV); strefa z tryskaczami - co 300 m²", "§ 32 ust. 3 rozp. 2010", ""],
      ["Rodzaj gaśnic", "dobrany do grup pożarów: A (ciała stałe), B (ciecze), C (gazy), D (metale), F (tłuszcze kuchenne)", "§ 32 ust. 1 i 2 rozp. 2010", ""],
      ["Rozmieszczenie", "z każdego miejsca do gaśnicy najwyżej 30 m; przy wejściach, klatkach, korytarzach, wyjściach; w tych samych miejscach na kondygnacjach; z dala od pieców i grzejników", "§ 33 ust. 1 i 2 pkt 1 rozp. 2010", ""],
      ["Dostęp", "wolne przejście min. 1 m szerokości; nic nie zastawia", "§ 33 ust. 2 pkt 2, § 4 ust. 1 pkt 18 lit. a rozp. 2010", ""],
      ["Stan gaśnicy", "aktualny przegląd (najwyżej rok), plomba, wskazówka manometru w zielonym polu, czytelna instrukcja, znak F001", "§ 3 ust. 3, § 4 ust. 2 pkt 4 lit. b rozp. 2010", ""],
      ["Magazyn butli z gazem płynnym", "magazyn parterowy, otwory wywiewne do 0,15 m nad podłogą; gaśnice proszkowe 9 kg: 1 szt. do 440 kg gazu; 2 szt. od 441 do 5500 kg + 1 na każde 10 000 kg ponad 5500 kg (zamiast 9 kg można 2 × CO₂ 5 kg); ponad 440 kg gazu - hydranty 10 l/s (do 25 000 kg) lub 20 l/s", "§ 81 ust. 1-3 rozp. 2023/1707", "PM"],
      ["Stacja paliw", "2 gaśnice przewoźne po 25 kg, 2 przenośne proszkowe po 6 kg, 3 koce; przy każdym stanowisku gazu - 2 gaśnice 6 kg i koc", "§ 120 rozp. 2023/1707", "PM"],
    ],
  },
  {
    id: "hydr", dzial: "Hydranty wewnętrzne", punkty: [
      ["Czy i jakie są wymagane", "hydrant 25 - ZL: każda kondygnacja budynku W i WW (poza samym ZL IV); w N i SW strefy ZL I, II, V ponad 200 m², ZL III ponad 200 m² w SW i ponad 1000 m² w N; hydrant 33 - garaże zamknięte ponad 10 stanowisk i wielokondygnacyjne; hydrant 52 - PM o Q ponad 500 i ponad 200 m²; zawory 52 - budynki W i WW", "§ 19 rozp. 2010", ""],
      ["Rozmieszczenie i zasięg", "przy wejściach, klatkach, w korytarzach, przy wyjściach z PM; zasięg = wąż + 10 m rzutu (3 m w ZL w budynkach wielokondygnacyjnych) - musi objąć całą powierzchnię", "§ 20 ust. 1 i 3 rozp. 2010", ""],
      ["Wysokość zaworu i miejsce przed hydrantem", "zawór na 1,35 m ± 0,1 m; wolne miejsce do rozwinięcia węża", "§ 21 ust. 1 i 4 rozp. 2010", ""],
      ["Wydajność i ciśnienie", "hydrant 25 - 1,0 l/s; 33 - 1,5 l/s; 52 i zawór 52 - 2,5 l/s; ciśnienie na zaworze min. 0,2 MPa; max. 1,2 MPa (przy hydrantach 33, 52 i zaworze 52 max. 0,7 MPa)", "§ 22 ust. 1, 2 i 4 rozp. 2010", ""],
      ["Przegląd i węże", "przegląd co najmniej raz w roku; próba węży co 5 lat; szafka oznakowana i dostępna", "§ 3 ust. 3 i 4 rozp. 2010", ""],
    ],
  },
  {
    id: "urz", dzial: "Urządzenia przeciwpożarowe", punkty: [
      ["System sygnalizacji pożarowej", "czy wymagany (m.in. handel 1-kondygnacyjny ponad 5000 m², wielokondygnacyjny ponad 2500 m², gastronomia ponad 300 miejsc, hotele ponad 50 miejsc noclegowych, szpitale ponad 200 łóżek, garaże podziemne ponad 1500 m², budynki UP W i WW); centrala bez uszkodzeń i wyłączeń; ROP dostępne; przegląd", "§ 28 ust. 1, § 3 ust. 3 rozp. 2010", ""],
      ["Dźwiękowy system ostrzegawczy", "czy wymagany (m.in. handel 1-kondygnacyjny ZL I ponad 8000 m², kina i teatry ponad 600 miejsc, budynki UP W i WW); sprawny", "§ 29 ust. 1 rozp. 2010", ""],
      ["Drzwi i bramy przeciwpożarowe", "zamykają się samoczynnie (samozamykacz lub trzymacz zwalniany przez SSP); nie podklinowane; oznakowane", "§ 240 ust. 6 WT; § 4 ust. 1 pkt 15 i ust. 2 pkt 4 lit. i rozp. 2010", ""],
      ["Oddymianie", "klapy i okna oddymiające sprawne; przyciski przy wejściach na klatki, oznakowane; napowietrzanie drożne", "§ 245 WT; § 4 ust. 1 pkt 18 lit. d rozp. 2010", ""],
      ["Tryskacze i inne stałe urządzenia gaśnicze", "czy wymagane (tryskacze m.in.: handel 1-kondygnacyjny ZL I ponad 8000 m², wielokondygnacyjny ponad 5000 m², gastronomia ponad 600 miejsc, budynki UP i ZZ wysokościowe); zawory otwarte, przegląd", "§ 27 rozp. 2010", ""],
      ["Klapy odcinające w wentylacji", "w miejscach przejścia przewodów przez ściany i stropy oddzielenia ppoż.; klasa jak oddzielenie", "§ 268 ust. 4 WT", ""],
      ["Dźwig dla ekip ratowniczych", "w ZL z posadzką ponad 25 m i w WW ZL IV; dojście przez przedsionek ppoż.", "§ 253 WT", "ZL"],
    ],
  },
  {
    id: "porzadek", dzial: "Instalacje, porządek i materiały palne", punkty: [
      ["Odległość materiałów palnych od gorących urządzeń", "min. 0,5 m od urządzeń nagrzewających się ponad 100 °C, linii kablowych ponad 1 kV, czynnych rozdzielnic, przewodów odgromowych i gniazd siłowych ponad 400 V", "§ 4 ust. 1 pkt 8 rozp. 2010", ""],
      ["Oświetlenie i osprzęt", "osłony lamp z materiałów palnych tylko trudno zapalne i min. 0,05 m od żarówki; oprawy i gniazda nie na palnym podłożu bez zabezpieczenia; grzejniki elektryczne nie na palnym podłożu", "§ 4 ust. 1 pkt 7, 9 i 10 rozp. 2010", ""],
      ["Urządzenia sprawne", "bez prowizorek, z aktualnymi przeglądami, używane zgodnie z instrukcją", "§ 4 ust. 1 pkt 2 rozp. 2010", ""],
      ["Gdzie nie wolno składować", "materiały palne - nie w pomieszczeniach technicznych, na nieużytkowych poddaszach i strychach, na korytarzach piwnicznych; butle z gazem palnym (także puste) - nie na poddaszach, strychach i w piwnicach; materiały niebezpieczne pożarowo - nie w piwnicach, na klatkach, korytarzach, balkonach i tarasach; na stanowisku pracy najwyżej zapas na dobę", "§ 4 ust. 1 pkt 12 i 13, § 7 ust. 1 pkt 2 i ust. 2 rozp. 2010", ""],
      ["Ciecze palne w budynkach ZL", "strefa nie handlowa: do 10 l cieczy o zapłonie poniżej 21 °C i do 50 l o zapłonie 21-55 °C (w mieszkaniu 5 l i 20 l); sklep: tyle, by Q od cieczy nie przekroczyło 500 MJ/m², szczelne opakowania, bez rozlewania", "§ 8 ust. 1 rozp. 2010", "ZL"],
      ["Ciecze palne w garażach", "garaż ponad 100 m² - tylko w opakowaniach detalicznych, niezbędne do pojazdu; garaż do 100 m² - 20 l (zapłon poniżej 21 °C) lub 60 l (21-100 °C), wolnostojący niepalny - 200 l (poniżej 55 °C); zakaz przelewania i tankowania", "§ 8 ust. 2 rozp. 2010", "PM"],
      ["Kotłownia", "ściany EI 60, strop REI 60, drzwi EI 30 (kotły: stałe ponad 25 kW, olej i gaz ponad 30 kW; budynek N i SW); w W i WW przy gazie EI 120 / REI 120 / EI 60; nie składować w niej materiałów palnych", "§ 220 ust. 1 WT; § 4 ust. 1 pkt 12 rozp. 2010", ""],
      ["Wykończenie wnętrz", "w pomieszczeniach ponad 50 osób i produkcyjnych - bez łatwo zapalnych przegród, wystroju i wykładzin; w ZL II i magazynach - bez łatwo zapalnych wykładzin", "§ 260 ust. 1 i 2 WT", ""],
      ["Strefy zagrożenia wybuchem", "oznakowane; tylko urządzenia w wykonaniu przeciwwybuchowym (Ex); zakaz otwartego ognia i palenia", "§ 4 ust. 1 pkt 1 lit. a i ust. 2 pkt 4 lit. k rozp. 2010", "PM"],
      ["Pyły palne", "regularne sprzątanie miejsc, gdzie pył osiada warstwą", "§ 4 ust. 6 rozp. 2010", "PM"],
      ["Prace pożarowo niebezpieczne w strefie wybuchowej", "dopuszczalne dopiero, gdy stężenie gazów i par nie przekracza 10% DGW (pomiar eksplozymetrem)", "§ 36 ust. 2 pkt 2 rozp. 2010", "PM"],
    ],
  },
];

// ── Widok narzędzia ──

function widokObchodu() {
  ustawNaglowek("Obchód obiektu", "#/narzedzia");
  ustawZakladke("start");
  const st = czytaj(KLUCZ_OBCHODU, {});
  const wszystkie = OBCHOD.reduce((n, d) => n + d.punkty.length, 0);
  const zrobione = Object.values(st).filter(Boolean).length;
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Idź po kolei: dokumenty, teren, wejście, drogi ewakuacyjne, urządzenia. Przy każdym punkcie stuknij OK, Uwaga albo Nie dotyczy. Wymagana wartość i przepis są od razu pod spodem. Na końcu masz listę uwag do protokołu.")}</div></div>
    <div class="btn-row"><button class="pastylka szara" onclick="if(confirm('Wyczyścić zaznaczenia i zacząć nowy obchód?')){zapisz(KLUCZ_OBCHODU,{});widokObchodu()}">Nowy obchód</button>
      <button class="pastylka szara" onclick="document.getElementById('ob-protokol').scrollIntoView({behavior:'smooth'})">Do protokołu ↓</button></div>
    <p class="opis-trybu" id="ob-licznik">${tekst(`Sprawdzone ${zrobione} z ${wszystkie}.`)}</p>
    ${OBCHOD.map((d) => `<div class="section-label">${tekst(d.dzial)}</div><div class="nz-blok">${d.punkty.map(([co, war, prz, dla], i) => {
      const k = `${d.id}-${i}`;
      return `<div class="ob-punkt${st[k] ? " " + st[k] : ""}" data-k="${k}">
        <p class="nz-co">${tekst(co)}${dla ? `<span class="ob-dla">${dla}</span>` : ""}</p>
        <p class="nz-wartosc">${pogrubLiczby(tekst(war))}</p><p class="nz-podstawa">Przepis: ${tekst(prz)}</p>
        <div class="ob-przyciski">${["ok", "uwaga", "nd"].map((s) => `<button class="ob-${s}${st[k] === s ? " on" : ""}" onclick="ustawPunkt('${k}','${s}')">${NAZWY_STANOW[s]}</button>`).join("")}</div></div>`;
    }).join("")}</div>`).join("")}
    <div class="section-label" id="ob-protokol">Do protokołu - punkty z uwagą</div><div class="nz-blok" id="ob-lista"></div>`;
  rysujProtokol();
}

function ustawPunkt(k, s) {
  const st = czytaj(KLUCZ_OBCHODU, {});
  st[k] = st[k] === s ? "" : s;
  zapisz(KLUCZ_OBCHODU, st);
  const el = document.querySelector(`.ob-punkt[data-k="${k}"]`);
  el.className = `ob-punkt${st[k] ? " " + st[k] : ""}`;
  el.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.classList.contains(`ob-${st[k]}`)));
  rysujProtokol();
}

function rysujProtokol() {
  const st = czytaj(KLUCZ_OBCHODU, {});
  const wszystkie = OBCHOD.reduce((n, d) => n + d.punkty.length, 0);
  document.getElementById("ob-licznik").textContent = `Sprawdzone ${Object.values(st).filter(Boolean).length} z ${wszystkie}.`;
  const uwagi = OBCHOD.flatMap((d) => d.punkty.map((p, i) => [d, p, `${d.id}-${i}`])).filter(([, , k]) => st[k] === "uwaga");
  document.getElementById("ob-lista").innerHTML = uwagi.length
    ? uwagi.map(([d, [co, war, prz]]) => wynik(`${d.dzial}: ${co}`, `Wymaganie: ${war}`, prz)).join("")
    : wynik("Brak uwag", "Zaznacz „Uwaga” przy punkcie, który nie spełnia wymagania - pojawi się tutaj z przepisem.", "");
}
