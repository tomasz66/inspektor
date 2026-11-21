// Obchód „gdzie jestem” - wybierasz rodzaj obiektu i miejsce (kotłownia, korytarz, biuro...),
// dostajesz listę tylko dla tego miejsca. Zaznaczenia zostają w telefonie, protokół zbiera uwagi ze wszystkich miejsc.
//
//   #/narzedzia/obchod            rodzaj obiektu + lista miejsc z postępem + protokół
//   #/narzedzia/obchod/m/ID       punkty jednego miejsca
//   #/narzedzia/obchod/lista      dawna lista tematyczna (obchod.js)
//
// Punkt: [poziom, co sprawdzić, wymaganie, przepis] albo [poziom, "@dzial-nr"] = punkt z OBCHOD (obchod.js).
// Poziomy: Z - zawsze sprawdź, W - wymiary i odległości, C - najczęściej jest źle (z praktyki, nie przepis).
// Wartości z przepisów sprawdzone w tekstach aktów 19.11.2026 (WT - Dz.U. 2022 poz. 1225, rozp. 2010 - t.j. 2023 poz. 822 ze zm.).

const KLUCZ_MIEJSC = "insp-obchod-m";
const KLUCZ_OBIEKTU_OBCHODU = "insp-obchod-obiekt";
const Z = "z", W = "w", C = "c";
const POZIOMY = [[Z, "Zawsze sprawdź"], [W, "Wymiary i odległości"], [C, "Najczęściej jest źle - z praktyki"]];
const PRAKTYKA = "z praktyki inspektora, nie przepis";

const R10 = "rozp. 2010";
const MIEJSCA = [
  // ── Na zewnątrz ──
  { id: "dojazd", nazwa: "Dojazd i droga pożarowa", grupa: "Na zewnątrz", punkty: [
    [Z, "@teren-0"], [W, "@teren-1"], [W, "@teren-2"], [W, "@teren-3"], [W, "@teren-4"], [W, "@teren-5"],
    [Z, "Utrzymanie drogi pożarowej", "przejezdna dla wozów straży przez cały rok; brama i szlaban otwierane bez zwłoki", `§ 5 ${R10}`],
    [Z, "Oznakowanie drogi pożarowej", "znaki zgodne z Polską Normą", `§ 4 ust. 2 pkt 4 lit. j ${R10}`],
    [C, "Droga pożarowa zastawiona", "parkujące auta, kontenery, palety, zaspy śniegu", PRAKTYKA],
  ] },
  { id: "teren", nazwa: "Teren wokół budynku", grupa: "Na zewnątrz", punkty: [
    [W, "@teren-6"], [W, "@teren-7"],
    [Z, "Składowanie pod ścianą budynku", "dopuszczalne tylko gdy: nie przekracza strefy pożarowej, zostaje dostęp dla ratowników, zachowane odległości od sąsiadów, min. 5 m od drogi pożarowej; nie dotyczy materiałów niebezpiecznych pożarowo", `§ 4 ust. 4 ${R10}`],
    [W, "Materiały palne przy granicy działki", "min. 4 m od granicy działki sąsiedniej (także gałęzie i chrust)", `§ 4 ust. 1 pkt 6 ${R10}`],
    [W, "Pas ochronny wokół placów składowych i obiektów tymczasowych o palnej konstrukcji", "min. 2 m, nawierzchnia niepalna lub oczyszczony grunt", `§ 4 ust. 3 ${R10}`],
    [Z, "Ognisko, gorący popiół, wypalanie traw", "zakaz tam, skąd ogień może przejść na materiały palne lub budynki", `§ 4 ust. 1 pkt 5 ${R10}`],
    [Z, "Oznakowanie ściany oddzielenia ppoż. na elewacji (handel, produkcja, magazyn)", "gdy strefy po min. 2000 m² i palna elewacja lub dach albo Q ponad 1000 MJ/m²: znak 200 × 200 mm, czerwony pas min. 0,15 m lub czerwone wysunięcie ściany", `§ 4 ust. 2 pkt 6 i zał. nr 1 ${R10}`],
    [Z, "Nasada zasilająca instalację ppoż., zbiorniki wody", "oznakowane i dostępne", `§ 4 ust. 2 pkt 4 lit. d i h, ust. 1 pkt 18 lit. c ${R10}`],
    [C, "Hydrant zewnętrzny niewidoczny", "zasypany, zarośnięty, zastawiony, bez tabliczki", PRAKTYKA],
  ] },
  { id: "parking", nazwa: "Parking, plac, wiata", grupa: "Na zewnątrz", punkty: [
    [W, "Składowanie na placu i pod wiatą", "pas ochronny min. 2 m; 4 m od granicy działki; 5 m od drogi pożarowej", `§ 4 ust. 1 pkt 6, ust. 3 i 4 ${R10}`],
    [Z, "Stacja ładowania aut elektrycznych", "jeśli jest - sprawdź wymagania z rozporządzenia o stacjach ładowania (w aplikacji: Przepisy)", "rozp. 2019/1316"],
    [C, "Auta zasłaniają hydrant albo drogę pożarową", "zwłaszcza wieczorem i w weekendy", PRAKTYKA],
  ] },
  { id: "odpady", nazwa: "Śmietnik, kontenery na odpady", grupa: "Na zewnątrz", punkty: [
    [Z, "Kontenery przy budynku", "nie zastawiają wyjść ewakuacyjnych, okien dla ratowników ani drogi pożarowej; 5 m od drogi pożarowej", `§ 4 ust. 1 pkt 18 lit. e, ust. 4 pkt 4 ${R10}`],
    [Z, "Gorący popiół i żużel", "nie wysypywać tam, gdzie zapali odpady lub budynek", `§ 4 ust. 1 pkt 5 ${R10}`],
    [Z, "Firma zbierająca lub przetwarzająca odpady", "osobne wymagania i operat ppoż. - rozporządzenie o miejscach gospodarowania odpadami", "rozp. 2020/296"],
    [C, "Kontener z kartonami pod oknem albo okapem dachu", "ogień z kontenera łatwo przechodzi na elewację i dach", PRAKTYKA],
  ] },
  { id: "zbiorniki", nazwa: "Zbiorniki gazu i oleju na zewnątrz", grupa: "Na zewnątrz", punkty: [
    [W, "Zbiornik oleju opałowego (klasa III) na własne potrzeby", "naziemny, dwupłaszczowy, do 5 m³; 10 m od budynków mieszkalnych i UP, 5 m od innych obiektów i granicy działki (o połowę mniej za ścianą REI 120)", `§ 11 ${R10}`],
    [W, "Zbiornik gazu płynnego", "nie w zagłębieniu terenu ani w miejscu podmokłym; min. 5 m od rowów, studzienek i wpustów kanalizacji; odległości od budynków wg tabeli w § 179", "§ 179 ust. 3 i 4 WT"],
    [Z, "Instalacja na gaz płynny", "tylko w budynkach niskich; w jednym budynku nie gaz płynny i sieciowy jednocześnie", "§ 157 ust. 5 i 6 WT"],
    [W, "@gasnice-5"],
    [C, "Butle i zbiornik w zagłębieniu, przy studzience, przy wejściu do piwnicy", "propan-butan jest cięższy od powietrza i spływa w dół", PRAKTYKA],
  ] },
  { id: "dach", nazwa: "Dach i fotowoltaika", grupa: "Na zewnątrz", punkty: [
    [W, "Wyjście na dach", "budynki od 2 kondygnacji nadziemnych - z co najmniej 1 klatki (W i WW - z każdej); drzwi 0,8 × 1,9 m albo klapa 0,8 × 0,8 m", "§ 308 ust. 1-3 WT"],
    [Z, "Fotowoltaika ponad 6,5 kW", "projekt wymaga uzgodnienia z rzeczoznawcą ds. zabezpieczeń ppoż. - poproś o projekt", "art. 29 Prawa budowlanego"],
    [Z, "Prace dekarskie z ogniem (papa, smoła)", "podgrzewanie smoły otwartym ogniem min. 5 m od obiektu i materiałów palnych (wyjątek: dach niepalny); prace zabezpieczone jak pożarowo niebezpieczne", `§ 4 ust. 1 pkt 4, § 36 ${R10}`],
    [Z, "Klapy dymowe i świetliki oddymiające", "dostępne i niezasłonięte (śnieg, urządzenia, siatki)", `§ 4 ust. 1 pkt 18 lit. a ${R10}`],
    [C, "Fotowoltaika bez opisu i wyłącznika przy wejściu", "zapytaj, jak straż odłączy panele i gdzie biegną przewody", PRAKTYKA],
    [C, "Materiały palne na dachu, przy kominach i wentylatorach", "", PRAKTYKA],
  ] },

  // ── Wejście i komunikacja ──
  { id: "wejscie", nazwa: "Wejście do budynku", grupa: "Wejście i komunikacja", punkty: [
    [W, "Drzwi wejściowe", "w świetle min. 0,9 × 2 m (dwuskrzydłowe - skrzydło główne min. 0,9 m); próg do 2 cm", "§ 62 ust. 1 i 3 WT"],
    [Z, "@ewak-7"],
    [W, "Schody zewnętrzne", "szerokość min. 1,2 m; najwyżej 10 stopni w biegu; stopnie min. 0,35 m (budynki wielorodzinne i UP)", "§ 68 ust. 3, § 69 ust. 3 i 5 WT"],
    [W, "Poręcze schodów zewnętrznych", "przedłużone o 0,3 m przed i za biegiem; 0,05 m od ściany", "§ 298 ust. 5 i 6 WT"],
    [Z, "Drzwi obrotowe lub wahadłowe", "tylko gdy obok są drzwi rozwierane lub rozsuwane", "§ 62 ust. 2 WT"],
    [Z, "@wejscie-0"], [Z, "@wejscie-1"],
    [Z, "Klucz do wyjścia ewakuacyjnego", "jeśli wyjście zamyka się na klucz - oznakowane miejsce klucza", `§ 4 ust. 2 pkt 4 lit. f ${R10}`],
    [Z, "Punkt schronienia", "jeśli budynek nim jest - oznakowanie najpóźniej do 31.12.2026", `§ 4 ust. 2 pkt 7 ${R10}`],
    [C, "Wycieraczka, stojak, reklama w drzwiach", "skrzydło nie otwiera się do końca, wyjście się zwęża", PRAKTYKA],
  ] },
  { id: "hol", nazwa: "Hol, recepcja, portiernia", grupa: "Wejście i komunikacja", punkty: [
    [Z, "@urz-0"], [Z, "@wejscie-1"], [W, "@gasnice-2"],
    [W, "Liczba osób w holu", "1 m² na osobę (hol, poczekalnia, świetlica), gdy nie wynika z wyposażenia", "§ 236 ust. 6 pkt 1 WT"],
    [Z, "Hol jako poczekalnia przed salą", "droga ewakuacyjna z sali, w której wymienia się publiczność, nie może być miejscem oczekiwania", `§ 4 ust. 1 pkt 17 ${R10}`],
    [Z, "@ewak-5"],
    [Z, "Dekoracje, choinki, stoiska", "nie zawężają drogi; min. 0,5 m od gorących urządzeń", `§ 4 ust. 1 pkt 8 i 16 ${R10}`],
    [C, "Recepcja nie wie, co robić po alarmie", "zapytaj: kto potwierdza alarm, ile ma czasu, kogo powiadamia", PRAKTYKA],
  ] },
  { id: "korytarz", nazwa: "Korytarz", grupa: "Wejście i komunikacja", punkty: [
    [W, "@ewak-3"], [W, "@ewak-2"], [Z, "@ewak-4"], [Z, "@ewak-5"],
    [Z, "@znaki-0"], [Z, "@znaki-2"], [W, "@znaki-4"],
    [W, "@gasnice-2"], [W, "@hydr-1"], [W, "@hydr-2"], [Z, "@urz-2"], [Z, "@urz-5"],
    [C, "Szafki, ksero, automaty z napojami, gabloty", "po ich ustawieniu korytarz często ma mniej niż 1,4 m", PRAKTYKA],
    [C, "Drzwi ppoż. na klinie albo haczyku", "najczęstsza usterka - zapytaj, dlaczego są otwarte", PRAKTYKA],
  ] },
  { id: "klatka", nazwa: "Klatka schodowa", grupa: "Wejście i komunikacja", punkty: [
    [Z, "@ewak-8"],
    [W, "Szerokość biegu i spocznika", "bieg / spocznik: wielorodzinne, ZZ, UP (bez opieki zdrowotnej), produkcyjne, magazynowe i usługowe ponad 10 osób - 1,2 / 1,5 m; przedszkola i żłobki - 1,2 / 1,3 m; opieka zdrowotna - 1,4 / 1,5 m; garaże i usługi do 10 osób - 0,9 / 0,9 m; do piwnic, pomieszczeń technicznych i nieużytkowych poddaszy - 0,8 / 0,8 m", "§ 68 ust. 1 WT"],
    [W, "Szerokość w UP i budynkach produkcyjnych", "łącznie min. 0,6 m na 100 osób z najliczniejszej kondygnacji, nie mniej niż w tabeli; mierzy się między poręczami - nic nie może jej zwężać", "§ 68 ust. 2 i 4 WT"],
    [W, "Wysokość stopni", "najwyżej: 0,175 m (wielorodzinne, ZZ, UP, produkcja ponad 10 osób), 0,15 m (przedszkola, opieka zdrowotna), 0,19 m (garaże, usługi do 10 osób), 0,2 m (piwnice, techniczne); 2h + s = 0,6-0,65 m", "§ 68 ust. 1, § 69 ust. 4 WT"],
    [W, "Liczba stopni w biegu", "najwyżej 17 (opieka zdrowotna - 14)", "§ 69 ust. 1 WT"],
    [W, "Balustrada", "wysokość min. 1,1 m; prześwit najwyżej 0,12 m (wielorodzinne, ZZ, oświata, opieka zdrowotna) lub 0,2 m (inne); gdzie dzieci bez nadzoru - bez możliwości wspinania i zjeżdżania", "§ 298 ust. 2 i 3 WT"],
    [W, "Biegi i spoczniki", "niepalne; R 60 (budynki klasy A, B, C) lub R 30 (D, E)", "§ 249 ust. 3 WT"],
    [Z, "@urz-3"], [Z, "@urz-2"], [Z, "@porzadek-3"],
    [C, "Wózki, rowery, hulajnogi z bateriami pod schodami", "", PRAKTYKA],
    [C, "Drzwi do klatki podparte, samozamykacz odkręcony", "", PRAKTYKA],
  ] },
  { id: "wyjscie", nazwa: "Wyjście ewakuacyjne", grupa: "Wejście i komunikacja", punkty: [
    [W, "@ewak-6"], [Z, "@ewak-7"],
    [Z, "Drzwi nie zamknięte na stałe", "zakaz zamykania w sposób uniemożliwiający natychmiastowe otwarcie", `§ 4 ust. 1 pkt 14 ${R10}`],
    [Z, "Wolny dostęp z obu stron", "nic nie blokuje wyjścia - od środka i od zewnątrz (palety, śnieg, kontener)", `§ 4 ust. 1 pkt 18 lit. e ${R10}`],
    [Z, "@znaki-0"], [W, "@znaki-3"],
    [C, "Wyjście zamknięte „na czas pracy” przed kradzieżą albo zamienione w magazyn", "", PRAKTYKA],
  ] },

  // ── Pomieszczenia dla ludzi ──
  { id: "biuro", nazwa: "Biuro, pokój pracy", grupa: "Pomieszczenia dla ludzi", punkty: [
    [Z, "@porzadek-0"],
    [Z, "Grzejniki elektryczne, czajniki, ekspresy", "sprawne, nie na palnym podłożu, używane zgodnie z instrukcją", `§ 4 ust. 1 pkt 2 i 7 ${R10}`],
    [Z, "@porzadek-1"],
    [W, "Liczba osób", "5 m² na osobę, gdy nie wynika z wyposażenia", "§ 236 ust. 6 pkt 3 WT"],
    [W, "@ewak-1"], [W, "@ewak-0"],
    [C, "Przedłużacze łączone w szereg, listwy w papierach pod biurkiem", "", PRAKTYKA],
    [C, "Kartony z aktami na szafach pod lampami i przy grzejnikach", "", PRAKTYKA],
  ] },
  { id: "klasa", nazwa: "Sala lekcyjna", grupa: "Pomieszczenia dla ludzi", punkty: [
    [W, "@ewak-0"], [W, "@ewak-1"], [Z, "@ewak-7"], [Z, "@dok-3"], [W, "@gasnice-2"], [Z, "@porzadek-1"],
    [Z, "Kraty w oknach", "jeśli są - otwierane od wewnątrz tam, gdzie wymagają tego przepisy budowlane", `§ 4 ust. 1 pkt 18 lit. g ${R10}`],
    [C, "Papierowe dekoracje na lampach, drzwiach i przy wyjściu", "", PRAKTYKA],
    [C, "Ławki i szafki zwężają przejście do drzwi", "", PRAKTYKA],
  ] },
  { id: "pracownia", nazwa: "Pracownia szkolna (chemia, technika, komputery)", grupa: "Pomieszczenia dla ludzi", punkty: [
    [W, "@porzadek-4"], [W, "@gasnice-1"],
    [Z, "Otwarty ogień (palniki)", "nie przy materiałach niebezpiecznych pożarowo; tylko na stanowisku do tego przeznaczonym", `§ 4 ust. 1 pkt 1 lit. b ${R10}`],
    [Z, "@porzadek-0"],
    [C, "Szafa z odczynnikami przy wyjściu, bez wentylacji", "", PRAKTYKA],
    [C, "Pracownia komputerowa: listwy na podłodze, ładowarki pod nogami", "", PRAKTYKA],
  ] },
  { id: "aula", nazwa: "Sala gimnastyczna, aula, sala konferencyjna", grupa: "Pomieszczenia dla ludzi", punkty: [
    [W, "Liczba osób", "1 m² na osobę (sale konferencyjne, świetlice), gdy nie wynika z liczby miejsc", "§ 236 ust. 6 pkt 1 WT"],
    [W, "@ewak-0"], [Z, "@ewak-7"], [Z, "@znaki-2"], [W, "@znaki-3"], [Z, "@urz-1"],
    [Z, "Wymiana publiczności", "droga ewakuacyjna nie może być miejscem oczekiwania na wejście", `§ 4 ust. 1 pkt 17 ${R10}`],
    [W, "Balustrady trybun i galerii", "bezpieczne przy panice; część pionowa może mieć 0,7 m tylko z częścią poziomą - razem min. 1,2 m", "§ 298 ust. 7 WT"],
    [C, "Krzesła dostawione w przejściach na imprezę", "", PRAKTYKA],
    [C, "Scena: kurtyny i dekoracje przy reflektorach", "", PRAKTYKA],
  ] },
  { id: "biblioteka", nazwa: "Biblioteka, czytelnia", grupa: "Pomieszczenia dla ludzi", punkty: [
    [W, "Liczba osób", "7 m² na osobę (biblioteki, archiwa)", "§ 236 ust. 6 pkt 4 WT"],
    [W, "@gasnice-0"], [W, "@porzadek-0"], [Z, "@porzadek-1"], [W, "@ewak-1"],
    [C, "Regały do sufitu przy lampach, książki w przejściach", "", PRAKTYKA],
    [C, "Duże obciążenie ogniowe papieru", "zapytaj, czy policzono gęstość obciążenia ogniowego", PRAKTYKA],
  ] },
  { id: "sklep", nazwa: "Sala sprzedaży", grupa: "Pomieszczenia dla ludzi", punkty: [
    [W, "Liczba osób", "4 m² na osobę w pomieszczeniach handlowo-usługowych", "§ 236 ust. 6 pkt 2 WT"],
    [W, "@porzadek-4"],
    [Z, "Sprzedaż fajerwerków", "tylko na wydzielonym stanowisku, bez samoobsługi; zapas w osobnym pomieszczeniu EI 60 / REI 60", `§ 9 ust. 1 i 2 ${R10}`],
    [W, "@ewak-1"], [Z, "@ewak-7"], [Z, "@urz-0"], [Z, "@urz-4"], [W, "@gasnice-0"], [W, "@gasnice-2"],
    [C, "Palety z towarem w alejkach i przed wyjściem ewakuacyjnym", "", PRAKTYKA],
    [C, "Wyjście ewakuacyjne zamknięte przed kradzieżą", "", PRAKTYKA],
    [C, "Butle gazowe na sprzedaż przy wejściu, w słońcu", "", PRAKTYKA],
  ] },
  { id: "zaplecze", nazwa: "Zaplecze sklepu, magazynek", grupa: "Pomieszczenia dla ludzi", punkty: [
    [W, "@porzadek-0"],
    [Z, "Kartony i folie", "nie w pomieszczeniach technicznych; nie na drodze ewakuacyjnej", `§ 4 ust. 1 pkt 11 i 12 ${R10}`],
    [Z, "@wejscie-2"],
    [C, "Gaśnica schowana za towarem", "", PRAKTYKA],
    [C, "Ładowanie wózków paletowych i skanerów na kartonach", "", PRAKTYKA],
  ] },
  { id: "pokoj", nazwa: "Pokój hotelowy, pensjonat, najem turystyczny", grupa: "Pomieszczenia dla ludzi", punkty: [
    [Z, "Czujka dymu", "min. 1 autonomiczna w każdym pokoju lub jednostce z usługą hotelarską (istniejące - od 30.06.2026); nie dotyczy, gdy chroni SSP lub stałe samoczynne urządzenie gaśnicze", `§ 28a ust. 1 i 2 ${R10}`],
    [Z, "Czujka czadu", "gdy w pomieszczeniu pali się paliwo (piec, kominek, kocioł z otwartą komorą); nie: zamknięta komora, kuchenka gazowa", `§ 28a ust. 3 i 4 ${R10}`],
    [Z, "Konserwacja czujek", "według instrukcji producenta (test, wymiana)", `§ 3 ust. 3a ${R10}`],
    [Z, "@wejscie-1"], [Z, "@porzadek-1"],
    [C, "Grzejnik elektryczny przy zasłonie, czajnik na drewnianej szafce", "", PRAKTYKA],
    [C, "Plan ewakuacji nieaktualny albo go brak na drzwiach", "", PRAKTYKA],
  ] },
  { id: "stolowka", nazwa: "Stołówka, jadalnia, sala restauracji", grupa: "Pomieszczenia dla ludzi", punkty: [
    [W, "Liczba osób", "1 m² na osobę (lokale gastronomiczno-rozrywkowe), gdy nie wynika z liczby miejsc", "§ 236 ust. 6 pkt 1 WT"],
    [Z, "@urz-0"], [Z, "@urz-4"], [W, "@ewak-0"], [Z, "@ewak-7"],
    [C, "Świece i podgrzewacze z płomieniem przy dekoracjach", "", PRAKTYKA],
  ] },
  { id: "szatnia", nazwa: "Szatnia, przebieralnia", grupa: "Pomieszczenia dla ludzi", punkty: [
    [W, "@ewak-1"], [Z, "@porzadek-1"],
    [C, "Odzież suszona na grzejnikach i suszarkach", "", PRAKTYKA],
    [C, "Ładowanie hulajnóg i e-papierosów w szafkach", "", PRAKTYKA],
  ] },
  { id: "socjalny", nazwa: "Pokój socjalny, kuchnia pracownicza", grupa: "Pomieszczenia dla ludzi", punkty: [
    [Z, "Czajnik, mikrofala, toster", "sprawne, nie na palnym podłożu", `§ 4 ust. 1 pkt 2 i 7 ${R10}`],
    [Z, "@porzadek-0"],
    [C, "Lodówka i kuchenka na jednym przedłużaczu", "", PRAKTYKA],
    [C, "Palenie w pomieszczeniu, niedopałki w koszu na śmieci", "", PRAKTYKA],
  ] },
  { id: "mieszkanie", nazwa: "Mieszkanie, lokal w bloku", grupa: "Pomieszczenia dla ludzi", punkty: [
    [Z, "Czujka dymu", "min. 1 w lokalu mieszkalnym; mieszkania użytkowane przed 23.12.2024 - od 1.01.2030, nowsze - od razu", `§ 28a ust. 1 ${R10}; § 2 ust. 2 Dz.U. 2024 poz. 1716`],
    [Z, "Czujka czadu", "w pomieszczeniu ze spalaniem paliwa (nie: zamknięta komora, kuchenka gazowa); istniejące mieszkania od 1.01.2030", `§ 28a ust. 3 i 4 ${R10}; § 2 ust. 3 Dz.U. 2024 poz. 1716`],
    [W, "@porzadek-4"],
    [W, "Butle z gazem w mieszkaniu", "najwyżej 2 butle do 11 kg; poniżej 35 °C; pionowo; 1,5 m od urządzeń grzewczych, 1 m od iskrzących; wąż do 3 m", "§ 177 WT"],
    [W, "Pomieszczenie z piecykiem lub kotłem gazowym", "kubatura min. 8 m³ (6,5 m³ - zamknięta komora); wysokość min. 2,2 m", "§ 172 ust. 3 i 4 WT"],
    [Z, "@dok-4"],
    [C, "Zaklejona kratka wentylacyjna przy piecyku gazowym", "częsta przyczyna zatruć czadem", PRAKTYKA],
    [C, "Hulajnoga lub rower elektryczny ładowany w przedpokoju", "pożar odcina jedyne wyjście", PRAKTYKA],
  ] },

  // ── Pomieszczenia techniczne ──
  { id: "kotlownia", nazwa: "Kotłownia", grupa: "Pomieszczenia techniczne", punkty: [
    [Z, "@porzadek-6", "Ściany, strop i drzwi kotłowni"],
    [W, "Kotły gazowe", "pomieszczenie min. 2,2 m wysokości; kubatura min. 8 m³ (6,5 m³ - zamknięta komora)", "§ 172 ust. 3 i 4 WT"],
    [W, "Kotły olejowe", "wysokość min. 2,2 m; kubatura min. 8 m³", "§ 136 ust. 10 WT"],
    [Z, "Powietrze do spalania (paliwo stałe, olej)", "stały nawiew dla kotłów i nawiew z wywiewem dla wentylacji kotłowni", "§ 136 ust. 11 WT"],
    [W, "@porzadek-0"], [Z, "@dok-6"], [Z, "@dok-4"], [Z, "@wejscie-2"],
    [Z, "Czujka czadu", "gdy kocioł jest w lokalu mieszkalnym albo użytkowym na pobyt ludzi w strefie ZL (poza zamkniętą komorą)", `§ 28a ust. 3 i 4 ${R10}`],
    [C, "Opał, drewno i kartony przy kotle", "", PRAKTYKA],
    [C, "Drzwi bez klasy EI (brak tabliczki) albo bez samozamykacza", "", PRAKTYKA],
  ] },
  { id: "rozdzielnia", nazwa: "Rozdzielnia elektryczna", grupa: "Pomieszczenia techniczne", punkty: [
    [Z, "@wejscie-0"], [Z, "@wejscie-2"],
    [Z, "Składowanie", "zakaz składowania materiałów palnych w pomieszczeniach technicznych", `§ 4 ust. 1 pkt 12 ${R10}`],
    [W, "Materiały palne przy rozdzielnicy", "min. 0,5 m od czynnych rozdzielnic i przewodów siłowych ponad 400 V", `§ 4 ust. 1 pkt 8 lit. b ${R10}`],
    [Z, "@dok-5"],
    [C, "Rozdzielnica jako półka, otwarte drzwiczki, brak zaślepek", "", PRAKTYKA],
    [C, "Ślady przegrzania, zapach spalenizny, prowizoryczne mostki", "", PRAKTYKA],
  ] },
  { id: "serwerownia", nazwa: "Serwerownia, pomieszczenie IT", grupa: "Pomieszczenia techniczne", punkty: [
    [Z, "@urz-4"], [Z, "@urz-0"], [Z, "@dok-1"],
    [Z, "Składowanie", "kartony po sprzęcie - nie w pomieszczeniu technicznym", `§ 4 ust. 1 pkt 12 ${R10}`],
    [C, "Gaszenie gazem: drzwi otwarte na stałe, ludzie nie wiedzą, co robić po alarmie", "", PRAKTYKA],
    [C, "UPS z akumulatorami bez wentylacji, przegrzane listwy", "", PRAKTYKA],
  ] },
  { id: "akumulatory", nazwa: "Ładowanie akumulatorów i wózków, magazyn energii", grupa: "Pomieszczenia techniczne", punkty: [
    [W, "Odległość od materiałów palnych", "min. 0,5 m od urządzeń nagrzewających się ponad 100 °C", `§ 4 ust. 1 pkt 8 ${R10}`],
    [Z, "Prostowniki i ładowarki", "sprawne, używane zgodnie z instrukcją producenta", `§ 4 ust. 1 pkt 2 ${R10}`],
    [Z, "@dok-7"],
    [C, "Ładowanie na drodze ewakuacyjnej albo przy wyjściu", "", PRAKTYKA],
    [C, "Spuchnięte lub uszkodzone baterie leżą przy sprawnych", "", PRAKTYKA],
    [C, "Magazyn energii przy budynku", "zapytaj o dokumentację producenta, wentylację i wykrywanie gazów", PRAKTYKA],
  ] },
  { id: "centrala", nazwa: "Centrala SSP, ochrona, pompownia ppoż.", grupa: "Pomieszczenia techniczne", punkty: [
    [Z, "@urz-0"], [Z, "@urz-1"], [Z, "@urz-4"], [Z, "@dok-1"],
    [Z, "Dostęp do urządzeń uruchamiających i sterujących", "nic go nie ogranicza", `§ 4 ust. 1 pkt 18 lit. d ${R10}`],
    [C, "Wyłączone strefy w centrali, ignorowane uszkodzenia („bo się myli”)", "", PRAKTYKA],
    [C, "Zawór tryskaczowy zamknięty, brak plomby", "", PRAKTYKA],
  ] },
  { id: "wentylatornia", nazwa: "Wentylatornia, maszynownia", grupa: "Pomieszczenia techniczne", punkty: [
    [Z, "@urz-5"],
    [Z, "Składowanie", "zakaz składowania materiałów palnych w pomieszczeniach technicznych", `§ 4 ust. 1 pkt 12 ${R10}`],
    [C, "Zapchane filtry, kurz i tłuszcz w kanałach", "", PRAKTYKA],
  ] },

  // ── Produkcja i magazyny ──
  { id: "hala", nazwa: "Hala produkcyjna", grupa: "Produkcja i magazyny", punkty: [
    [Z, "@dok-7"], [W, "@ewak-0"], [W, "@ewak-1"], [W, "@ewak-2"], [W, "@gasnice-0"], [W, "@gasnice-2"], [W, "@hydr-0"],
    [Z, "@porzadek-3"],
    [Z, "Pyły palne", "regularne sprzątanie miejsc, gdzie pył zalega warstwą", `§ 4 ust. 6 ${R10}`],
    [Z, "@porzadek-2"], [W, "@porzadek-0"], [Z, "@urz-2"],
    [C, "Odpady produkcyjne przy maszynach", "", PRAKTYKA],
    [C, "Wózek widłowy zostawiony w przejściu", "", PRAKTYKA],
    [C, "Kable maszyn po podłodze, prowizorki", "", PRAKTYKA],
  ] },
  { id: "spawanie", nazwa: "Spawanie, cięcie, szlifowanie", grupa: "Produkcja i magazyny", punkty: [
    [Z, "@dok-9"],
    [Z, "Zabezpieczenie materiałów palnych", "w miejscu prac i obok - także konstrukcja budynku i instalacje", `§ 36 ust. 2 pkt 1 ${R10}`],
    [Z, "Sprzęt gaśniczy na miejscu prac", "", `§ 36 ust. 2 pkt 3 ${R10}`],
    [Z, "Kontrola po zakończeniu", "miejsce prac i rejony przyległe", `§ 36 ust. 2 pkt 4 ${R10}`],
    [Z, "Prace przy zagrożeniu wybuchem", "tylko gdy stężenie par i gazów jest bezpieczne - zgodnie z przepisem", `§ 36 ust. 2 pkt 2 ${R10}`],
    [Z, "Butle (acetylen, tlen, propan)", "nie na poddaszach, strychach i w piwnicach", `§ 4 ust. 1 pkt 13 ${R10}`],
    [C, "Spawanie bez pisemnego zezwolenia „bo na chwilę”", "", PRAKTYKA],
    [C, "Iskry ze szlifierki lecą na kartony lub trociny", "", PRAKTYKA],
  ] },
  { id: "lakiernia", nazwa: "Lakiernia, malarnia, mieszalnia farb", grupa: "Produkcja i magazyny", punkty: [
    [Z, "@dok-7"],
    [Z, "Oznakowanie strefy zagrożenia wybuchem", "", `§ 4 ust. 2 pkt 4 lit. k ${R10}`],
    [Z, "Zakaz ognia i palenia", "w strefie zagrożenia wybuchem", `§ 4 ust. 1 pkt 1 lit. a ${R10}`],
    [Z, "Wentylacja wyciągowa", "osobna dla każdego pomieszczenia zagrożonego wybuchem; otwory tam, gdzie zbierają się pary (cięższe od powietrza - nisko)", "§ 269 ust. 2 i 3 WT"],
    [Z, "Wentylatory w pożarze", "wyłączane automatycznie, gdy mogłyby rozprzestrzeniać pożar", "§ 269 ust. 1 WT"],
    [Z, "@ewak-7"], [W, "@ewak-1"], [W, "@ewak-2"], [Z, "@porzadek-3"],
    [C, "Szmaty z rozpuszczalnikiem w zwykłym koszu", "mogą się same zapalić", PRAKTYKA],
    [C, "Zwykłe lampy i gniazdka w strefie", "zapytaj o urządzenia przeciwwybuchowe", PRAKTYKA],
  ] },
  { id: "stolarnia", nazwa: "Stolarnia, obróbka drewna", grupa: "Produkcja i magazyny", punkty: [
    [Z, "Pyły palne", "regularne sprzątanie warstw pyłu", `§ 4 ust. 6 ${R10}`],
    [Z, "@dok-7"],
    [Z, "Wentylacja przy pyłach wybuchowych", "nawiew nie może podnosić osiadłego pyłu; filtry, komory i cyklony w wydzielonym pomieszczeniu albo na zewnątrz", "§ 269 ust. 4 i 5 WT"],
    [W, "@porzadek-0"],
    [C, "Worki z trocinami przy piecu lub „kozie”", "", PRAKTYKA],
    [C, "Odpylacz bez przeglądu, pył na belkach i lampach", "", PRAKTYKA],
  ] },
  { id: "magazyn", nazwa: "Magazyn, regały", grupa: "Produkcja i magazyny", punkty: [
    [W, "Liczba osób", "30 m² na osobę", "§ 236 ust. 6 pkt 5 WT"],
    [W, "@ewak-1"], [W, "@gasnice-0"], [W, "@hydr-0"], [Z, "@urz-4"], [Z, "@urz-2"], [Z, "@ewak-4"], [W, "@porzadek-0"],
    [C, "Towar powyżej tryskaczy i pod lampami", "", PRAKTYKA],
    [C, "Regały zasłaniają hydranty, gaśnice, ROP", "", PRAKTYKA],
    [C, "Palety pod oknami dla ratowników", "", PRAKTYKA],
  ] },
  { id: "chemia", nazwa: "Magazyn chemii, cieczy palnych, farb", grupa: "Produkcja i magazyny", punkty: [
    [Z, "Oznakowanie", "pomieszczenia z materiałami niebezpiecznymi pożarowo", `§ 4 ust. 2 pkt 4 lit. e ${R10}`],
    [Z, "@porzadek-3"], [Z, "@dok-7"],
    [Z, "Zakaz ognia i palenia", "w miejscach z materiałami niebezpiecznymi pożarowo", `§ 4 ust. 1 pkt 1 lit. b ${R10}`],
    [W, "@gasnice-1"],
    [C, "Brak kart charakterystyki, beczki bez wanny wychwytowej", "", PRAKTYKA],
    [C, "Otwarte pojemniki, przelewanie przy grzejniku", "", PRAKTYKA],
  ] },
  { id: "butle", nazwa: "Magazyn butli gazowych", grupa: "Produkcja i magazyny", punkty: [
    [W, "@gasnice-5"],
    [Z, "Butle nie na poddaszu, strychu, w piwnicy", "także puste", `§ 4 ust. 1 pkt 13 ${R10}`],
    [Z, "Napełnianie butli", "zakaz tam, gdzie nie jest to przeznaczone", `§ 4 ust. 1 pkt 19 ${R10}`],
    [C, "Butle leżą, bez łańcucha, pełne zmieszane z pustymi", "", PRAKTYKA],
  ] },
  { id: "rampa", nazwa: "Rampa, dok załadunkowy", grupa: "Produkcja i magazyny", punkty: [
    [Z, "Składowanie przy ścianie", "dostęp dla ratowników; 5 m od drogi pożarowej", `§ 4 ust. 4 ${R10}`],
    [Z, "Wyjścia ewakuacyjne", "nic ich nie zastawia", `§ 4 ust. 1 pkt 18 lit. e ${R10}`],
    [C, "Palety owinięte folią pod daszkiem rampy", "", PRAKTYKA],
    [C, "Wózki ładowane przy bramie", "", PRAKTYKA],
  ] },
  { id: "warsztat", nazwa: "Warsztat samochodowy", grupa: "Produkcja i magazyny", punkty: [
    [Z, "Kanał rewizyjny", "wentylacja mechaniczna sterowana czujkami CO (zawodowa obsługa aut)", "§ 108 ust. 1 pkt 3 WT"],
    [Z, "Auta w pomieszczeniach nieprzeznaczonych do garażowania", "tylko z opróżnionym zbiornikiem paliwa i odłączonym akumulatorem", `§ 4 ust. 1 pkt 3 ${R10}`],
    [Z, "@dok-9"], [W, "@gasnice-1"],
    [C, "Czyściwo z olejem w otwartym koszu", "", PRAKTYKA],
    [C, "Auto elektryczne po wypadku stoi w hali", "zapytaj o miejsce odstawienia na zewnątrz", PRAKTYKA],
  ] },
  { id: "archiwum", nazwa: "Archiwum", grupa: "Produkcja i magazyny", punkty: [
    [W, "Liczba osób", "7 m² na osobę", "§ 236 ust. 6 pkt 4 WT"],
    [W, "@gasnice-0"], [W, "@porzadek-0"], [Z, "@porzadek-1"], [Z, "@urz-2"],
    [Z, "Archiwum w piwnicy", "nie na korytarzach piwnicznych - tam zakaz składowania materiałów palnych", `§ 4 ust. 1 pkt 12 ${R10}`],
    [C, "Akta do sufitu, przy lampach i grzejnikach", "", PRAKTYKA],
  ] },

  // ── Gastronomia ──
  { id: "kuchnia", nazwa: "Kuchnia (stołówka, restauracja)", grupa: "Gastronomia", punkty: [
    [Z, "@dok-6"], [W, "@gasnice-1"],
    [W, "Pomieszczenie z urządzeniami gazowymi", "kubatura min. 8 m³ (6,5 m³ - zamknięta komora); wysokość min. 2,2 m", "§ 172 ust. 3 i 4 WT"],
    [W, "Butle z gazem w lokalu", "najwyżej 2 butle do 11 kg; poniżej 35 °C; pionowo; 1,5 m od urządzeń grzewczych, 1 m od iskrzących; wąż do 3 m", "§ 177 WT"],
    [Z, "@wejscie-2"], [W, "@porzadek-0"],
    [C, "Zatłuszczone filtry okapu, brak protokołu czyszczenia kanału", "", PRAKTYKA],
    [C, "Olej z frytownicy i ścierki przy palnikach", "", PRAKTYKA],
  ] },

  // ── Inne ──
  { id: "garaz", nazwa: "Garaż, hala postojowa", grupa: "Inne", punkty: [
    [Z, "@porzadek-5"],
    [Z, "Auta na LPG w garażu podziemnym", "przy wjeździe informacja, czy wolno parkować", `§ 4 ust. 2 pkt 5 ${R10}`],
    [W, "Wentylacja", "mechaniczna z czujkami CO (większe garaże); z czujkami propan-butanu, gdy LPG dozwolone poniżej terenu", "§ 108 ust. 1 pkt 3 i 4 WT"],
    [W, "@hydr-0"], [W, "@znaki-2"], [Z, "@urz-0"],
    [C, "Opony, kanistry, meble w miejscach postojowych", "", PRAKTYKA],
    [C, "Auto elektryczne ładowane z przedłużacza", "", PRAKTYKA],
  ] },
  { id: "strych", nazwa: "Strych, poddasze nieużytkowe", grupa: "Inne", punkty: [
    [Z, "Składowanie", "zakaz składowania materiałów palnych", `§ 4 ust. 1 pkt 12 ${R10}`],
    [Z, "Butle z gazem", "zakaz - także pustych", `§ 4 ust. 1 pkt 13 ${R10}`],
    [W, "Schody na poddasze nieużytkowe", "min. 0,8 m szerokości; stopień do 0,2 m", "§ 68 ust. 1 WT"],
    [C, "Drewno i śmieci przy kominie", "", PRAKTYKA],
    [C, "Stare instalacje, puszki bez pokryw", "", PRAKTYKA],
  ] },
  { id: "piwnica", nazwa: "Piwnica", grupa: "Inne", punkty: [
    [Z, "Korytarze piwniczne", "bez materiałów palnych", `§ 4 ust. 1 pkt 12 ${R10}`],
    [Z, "Butle z gazem", "zakaz - także pustych", `§ 4 ust. 1 pkt 13 ${R10}`],
    [Z, "@porzadek-3"],
    [W, "Schody do piwnicy", "min. 0,8 m szerokości; stopień do 0,2 m", "§ 68 ust. 1 WT"],
    [C, "Zastawione okienka piwniczne, brak światła", "", PRAKTYKA],
  ] },
  { id: "komorki", nazwa: "Komórki lokatorskie, wózkownia, rowerownia", grupa: "Inne", punkty: [
    [Z, "@porzadek-3"],
    [Z, "Butle z gazem", "zakaz w piwnicach", `§ 4 ust. 1 pkt 13 ${R10}`],
    [C, "Ładowanie rowerów i hulajnóg elektrycznych", "", PRAKTYKA],
    [C, "Kłódki na drzwiach na drogę ewakuacyjną", "", PRAKTYKA],
  ] },
  { id: "dokumenty", nazwa: "Gabinet - dokumenty do obejrzenia", grupa: "Inne", punkty: [
    [Z, "@dok-0"], [Z, "@dok-1"], [Z, "@dok-2"], [Z, "@dok-3"], [Z, "@dok-4"], [Z, "@dok-5"], [Z, "@dok-6"], [Z, "@dok-7"], [Z, "@dok-8"], [Z, "@dok-9"],
  ] },
];

// Jakie miejsca pokazać przy danym rodzaju obiektu (kolejność = naturalna trasa obchodu).
const NA_ZEWNATRZ = ["dojazd", "teren", "parking", "odpady"];
const KOMUNIKACJA = ["wejscie", "hol", "korytarz", "klatka", "wyjscie"];
const TECHNIKA = ["kotlownia", "rozdzielnia"];
const OBIEKTY = [
  ["szkola", "Szkoła", [...NA_ZEWNATRZ, ...KOMUNIKACJA, "klasa", "pracownia", "aula", "biblioteka", "stolowka", "kuchnia", "szatnia", "biuro", "socjalny", "archiwum", ...TECHNIKA, "serwerownia", "centrala", "piwnica", "strych", "dach", "dokumenty"]],
  ["przedszkole", "Przedszkole, żłobek", [...NA_ZEWNATRZ, ...KOMUNIKACJA, "klasa", "aula", "stolowka", "kuchnia", "szatnia", "biuro", "socjalny", ...TECHNIKA, "piwnica", "strych", "dach", "dokumenty"]],
  ["urzad", "Urząd, biurowiec", [...NA_ZEWNATRZ, ...KOMUNIKACJA, "biuro", "aula", "archiwum", "socjalny", "serwerownia", "centrala", ...TECHNIKA, "garaz", "piwnica", "strych", "dach", "dokumenty"]],
  ["kultura", "Biblioteka, dom kultury, świetlica", [...NA_ZEWNATRZ, ...KOMUNIKACJA, "biblioteka", "aula", "biuro", "socjalny", "kuchnia", ...TECHNIKA, "piwnica", "strych", "dach", "dokumenty"]],
  ["sklep-maly", "Sklep spożywczy, mały sklep", ["teren", "parking", "odpady", "wejscie", "wyjscie", "sklep", "zaplecze", "socjalny", ...TECHNIKA, "dach", "dokumenty"]],
  ["sklep-duzy", "Market, duży sklep", [...NA_ZEWNATRZ, "wejscie", "wyjscie", "korytarz", "sklep", "zaplecze", "magazyn", "rampa", "akumulatory", "kuchnia", "socjalny", "szatnia", "biuro", "centrala", "serwerownia", ...TECHNIKA, "zbiorniki", "dach", "dokumenty"]],
  ["uslugi", "Firma usługowa, warsztat", ["teren", "parking", "odpady", "wejscie", "wyjscie", "biuro", "warsztat", "spawanie", "chemia", "butle", "magazyn", "socjalny", "szatnia", ...TECHNIKA, "zbiorniki", "dach", "dokumenty"]],
  ["zaklad-maly", "Mały zakład produkcyjny", [...NA_ZEWNATRZ, "zbiorniki", "wejscie", "korytarz", "wyjscie", "hala", "spawanie", "stolarnia", "lakiernia", "magazyn", "chemia", "butle", "akumulatory", "rampa", "biuro", "socjalny", "szatnia", ...TECHNIKA, "dach", "dokumenty"]],
  ["zaklad-duzy", "Duży zakład produkcyjny", [...NA_ZEWNATRZ, "zbiorniki", ...KOMUNIKACJA, "hala", "spawanie", "stolarnia", "lakiernia", "magazyn", "chemia", "butle", "akumulatory", "rampa", "warsztat", "biuro", "aula", "stolowka", "kuchnia", "socjalny", "szatnia", "archiwum", ...TECHNIKA, "serwerownia", "centrala", "wentylatornia", "garaz", "dach", "dokumenty"]],
  ["magazyn", "Magazyn, centrum logistyczne", [...NA_ZEWNATRZ, "zbiorniki", "wejscie", "korytarz", "wyjscie", "magazyn", "rampa", "akumulatory", "chemia", "butle", "biuro", "socjalny", "szatnia", ...TECHNIKA, "centrala", "serwerownia", "dach", "dokumenty"]],
  ["hotel", "Hotel, pensjonat, agroturystyka", [...NA_ZEWNATRZ, "zbiorniki", ...KOMUNIKACJA, "pokoj", "stolowka", "kuchnia", "aula", "biuro", "socjalny", ...TECHNIKA, "garaz", "piwnica", "strych", "dach", "dokumenty"]],
  ["blok", "Blok mieszkalny", ["dojazd", "teren", "odpady", "wejscie", "klatka", "korytarz", "mieszkanie", "komorki", "piwnica", "strych", "dach", ...TECHNIKA, "garaz", "dokumenty"]],
  ["wszystko", "Wszystkie miejsca", MIEJSCA.map((m) => m.id)],
];

TRASY.unshift(
  [/^#\/narzedzia\/obchod$/, () => widokMiejsc()],
  [/^#\/narzedzia\/obchod\/lista$/, () => widokObchodu()],
  [/^#\/narzedzia\/obchod\/podglad$/, () => widokPodgladu()],
  [/^#\/narzedzia\/obchod\/m\/([\w-]+)$/, (m) => widokMiejsca(m[1])],
);

// ── Dane ──

// Zamienia punkt z odnośnikiem „@dzial-nr” na pełny punkt z OBCHOD (obchod.js).
// Trzeci element przy odnośniku = własny tytuł, np. [Z, "@porzadek-6", "Ściany, strop i drzwi kotłowni"].
function rozwinPunkt([poziom, co, war, prz]) {
  if (!co.startsWith("@")) {
    return { poziom, co, war, prz };
  }
  const [dzial, nr] = co.slice(1).split("-");
  const p = OBCHOD.find((d) => d.id === dzial).punkty[+nr];
  return { poziom, co: war || p[0], war: p[1], prz: p[2] };
}

function punktyMiejsca(m) {
  return m.punkty.map(rozwinPunkt);
}

function miejscaObiektu(idObiektu) {
  const ob = OBIEKTY.find((o) => o[0] === idObiektu) || OBIEKTY[OBIEKTY.length - 1];
  return ob[2].map((id) => MIEJSCA.find((m) => m.id === id));
}

// ── Widok: lista miejsc ──

function widokMiejsc() {
  ustawNaglowek("Obchód obiektu", "#/praca");
  ustawZakladke("start");
  const idObiektu = czytaj(KLUCZ_OBIEKTU_OBCHODU, "wszystko");
  const st = czytaj(KLUCZ_MIEJSC, {});
  const miejsca = miejscaObiektu(idObiektu);

  // Grupy w kolejności pierwszego wystąpienia na trasie obiektu
  const grupy = [];
  miejsca.forEach((m) => {
    if (!grupy.includes(m.grupa)) {
      grupy.push(m.grupa);
    }
  });

  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst("Wybierz rodzaj obiektu i miejsce startu - dalej poprowadzę Cię po kolei przyciskiem „Dalej”. ✓ = w porządku, ⚠ = uwaga do protokołu. Stuknij tekst punktu, żeby zobaczyć pełne wymaganie i przepis. Zaznaczenia zostają w telefonie.")}</div></div>
    <div class="section-label">Jaki obiekt?</div>
    <div class="ob-obiekty">${OBIEKTY.map(([id, nazwa]) => `<button class="ob-chip${id === idObiektu ? " on" : ""}" onclick="zapisz(KLUCZ_OBIEKTU_OBCHODU,'${id}');widokMiejsc()">${tekst(nazwa)}</button>`).join("")}</div>
    <div class="c-dol"><a class="c-dalej" href="#/narzedzia/obchod/podglad">Podgląd całego obiektu ›</a>
      <a class="ob-nagle-btn" href="#/narzedzia/obchod/nagle">+ Zauważyłem nagle</a></div>
    <div class="section-label">Gdzie jestem? Wybierz miejsce startu</div>
    ${grupy.map((g) => `<div class="section-label">${tekst(g)}</div><div class="nz-blok">${miejsca.filter((m) => m.grupa === g).map((m) => wierszMiejsca(m, st)).join("")}</div>`).join("")}
    <div class="btn-row"><button class="pastylka szara" onclick="if(confirm('Wyczyścić zaznaczenia i zacząć nowy obchód?')){zapisz(KLUCZ_MIEJSC,{});zapisz(KLUCZ_NAGLE,[]);widokMiejsc()}">Nowy obchód</button>
      <a class="pastylka szara" href="#/narzedzia/obchod/lista">Cała lista tematami</a></div>
    <div class="section-label">Do protokołu - punkty z uwagą</div><div class="nz-blok">${protokolMiejsc(st)}</div>
    ${protokolNagle()}
    <p class="nz-podstawa ob-stopka">${tekst("Wymiary z WT 2002 - rozporządzenie straciło moc 20.09.2026, nowego jeszcze nie ogłoszono; w okresie przejściowym stosuje się dotychczasowe przepisy, a budynki ocenia się według przepisów, według których je zaprojektowano.")}</p>`;
}

function wierszMiejsca(m, st) {
  const n = m.punkty.length;
  const zrobione = m.punkty.filter((_, i) => st[`${m.id}-${i}`]).length;
  const uwagi = m.punkty.filter((_, i) => st[`${m.id}-${i}`] === "uwaga").length;
  const stan = zrobione === n ? " gotowe" : zrobione ? " w-toku" : "";
  return `<a class="ob-miejsce${stan}" href="#/narzedzia/obchod/m/${m.id}">
    <span class="ob-miejsce-nazwa">${tekst(m.nazwa)}</span>
    <span class="ob-miejsce-stan">${uwagi ? `<b>${uwagi} uw.</b> · ` : ""}${zrobione}/${n}</span></a>`;
}

function protokolMiejsc(st) {
  const uwagi = MIEJSCA.flatMap((m) => punktyMiejsca(m).map((p, i) => [m, p, `${m.id}-${i}`])).filter(([, , k]) => st[k] === "uwaga");
  if (!uwagi.length) {
    return wynik("Brak uwag", "Zaznacz „Uwaga” przy punkcie, który nie spełnia wymagania - pojawi się tutaj z przepisem.", "");
  }
  return uwagi.map(([m, p]) => wynik(`${m.nazwa}: ${p.co}`, p.war ? `Wymaganie: ${p.war}` : "", p.prz === PRAKTYKA ? "" : p.prz)).join("");
}

// ── Widok: jedno miejsce ──

function widokMiejsca(id) {
  const m = MIEJSCA.find((x) => x.id === id);
  if (!m) {
    location.hash = "#/narzedzia/obchod";
    return;
  }
  ustawNaglowek(m.nazwa, "#/narzedzia/obchod");
  ustawZakladke("start");
  const st = czytaj(KLUCZ_MIEJSC, {});

  // Następne miejsce na trasie wybranego obiektu - prowadzenie po kolei
  const trasa = miejscaObiektu(czytaj(KLUCZ_OBIEKTU_OBCHODU, "wszystko"));
  const nr = trasa.findIndex((x) => x.id === m.id);
  const dalej = nr >= 0 && nr < trasa.length - 1 ? trasa[nr + 1] : null;

  widok.innerHTML = `<p class="c-licznik" data-m="${m.id}">${licznikMiejsca(m, st)}</p>`
    + sekcjeMiejsca(m, st)
    + `<div class="c-dol">
      ${dalej ? `<a class="c-dalej" href="#/narzedzia/obchod/m/${dalej.id}">Dalej: ${tekst(dalej.nazwa)} ›</a>` : `<a class="c-dalej" href="#/narzedzia/obchod">Koniec trasy - protokół ›</a>`}
      <a class="ob-nagle-btn" href="#/narzedzia/obchod/nagle/${m.id}">+ Zauważyłem nagle</a>
      <a class="c-lista" href="#/narzedzia/obchod">‹ Lista miejsc</a></div>`;
}

// Punkty miejsca w 3 poziomach (Zawsze / Wymiary / Z praktyki)
function sekcjeMiejsca(m, st) {
  const punkty = punktyMiejsca(m).map((p, i) => ({ ...p, k: `${m.id}-${i}` }));
  return POZIOMY.map(([poziom, etykieta]) => {
    const lista = punkty.filter((p) => p.poziom === poziom);
    if (!lista.length) {
      return "";
    }
    return `<div class="section-label">${etykieta}</div><div class="nz-blok">${lista.map((p) => wierszC(p, st)).join("")}</div>`;
  }).join("");
}

function licznikMiejsca(m, st) {
  const n = m.punkty.length;
  const zrobione = m.punkty.filter((_, i) => st[`${m.id}-${i}`]).length;
  const uwagi = m.punkty.filter((_, i) => st[`${m.id}-${i}`] === "uwaga").length;
  return `Sprawdzone ${zrobione} z ${n}${uwagi ? ` · <b>${uwagi} ⚠</b>` : ""}`;
}

// Krótki dopisek pod tytułem: pierwsza część wymagania (do średnika), najwyżej ok. 70 znaków
const DLUGOSC_DOPISKU = 70;
function dopisek(war) {
  if (!war) {
    return "";
  }
  const pierwsza = war.split(";")[0].trim();
  if (pierwsza.length <= DLUGOSC_DOPISKU) {
    return pierwsza;
  }
  return pierwsza.slice(0, DLUGOSC_DOPISKU).replace(/\s+\S*$/, "") + "…";
}

// Wiersz w układzie C: tytuł + krótki dopisek, po prawej ✓ i ⚠; stuknięcie w tekst rozwija wymaganie i przepis
function wierszC(p, st) {
  const s = st[p.k] || "";
  const zPraktyki = p.prz === PRAKTYKA;
  return `<div class="c-w ${s}" data-k="${p.k}">
    <div class="c-gora">
      <div class="c-t" onclick="this.closest('.c-w').classList.toggle('rozw')">${tekst(p.co)}${p.war ? `<small>${pogrubLiczby(tekst(dopisek(p.war)))}</small>` : ""}</div>
      <button class="c-b ok${s === "ok" ? " on" : ""}" aria-label="OK" onclick="ustawMiejsce('${p.k}','ok')">✓</button>
      <button class="c-b uwaga${s === "uwaga" ? " on" : ""}" aria-label="Uwaga" onclick="ustawMiejsce('${p.k}','uwaga')">⚠</button>
    </div>
    <div class="c-szcz">${p.war ? `<p>${pogrubLiczby(tekst(p.war))}</p>` : ""}<p class="nz-podstawa">${zPraktyki ? "Z praktyki - nie przepis" : "Przepis: " + tekst(p.prz)}</p></div></div>`;
}

function ustawMiejsce(k, s) {
  const st = czytaj(KLUCZ_MIEJSC, {});
  st[k] = st[k] === s ? "" : s;
  zapisz(KLUCZ_MIEJSC, st);
  document.querySelectorAll(`.c-w[data-k="${k}"]`).forEach((el) => {
    el.classList.remove("ok", "uwaga");
    if (st[k]) {
      el.classList.add(st[k]);
    }
    el.querySelector(".c-b.ok").classList.toggle("on", st[k] === "ok");
    el.querySelector(".c-b.uwaga").classList.toggle("on", st[k] === "uwaga");
  });

  // Liczniki miejsc na ekranie (widok miejsca i podgląd obiektu)
  document.querySelectorAll(".c-licznik[data-m]").forEach((el) => {
    const m = MIEJSCA.find((x) => x.id === el.dataset.m);
    el.innerHTML = licznikMiejsca(m, st);
  });
}

// ── Podgląd całego obiektu: wszystkie miejsca i punkty na jednym ekranie ──

function widokPodgladu() {
  ustawNaglowek("Cały obiekt", "#/narzedzia/obchod");
  ustawZakladke("start");
  const idObiektu = czytaj(KLUCZ_OBIEKTU_OBCHODU, "wszystko");
  const ob = OBIEKTY.find((o) => o[0] === idObiektu);
  const st = czytaj(KLUCZ_MIEJSC, {});
  const miejsca = miejscaObiektu(idObiektu);
  widok.innerHTML = `<div class="section-header"><div class="section-sub">${tekst(`${ob ? ob[1] : "Wszystkie miejsca"}: wszystko, co ważne, w kolejności trasy. Możesz zaznaczać tutaj albo wejść w miejsce.`)}</div></div>`
    + miejsca.map((m) => `<a class="c-miejsce-nag" href="#/narzedzia/obchod/m/${m.id}">${tekst(m.nazwa)} ›</a>
      <p class="c-licznik" data-m="${m.id}">${licznikMiejsca(m, st)}</p>${sekcjeMiejsca(m, st)}`).join("")
    + `<div class="c-dol"><a class="c-lista" href="#/narzedzia/obchod">‹ Lista miejsc i protokół</a></div>`;
}

// ── Zauważyłem nagle ──
// Sytuacje chwilowe, które inspektor widzi w trakcie obchodu (prace pożarowo niebezpieczne, zablokowane wyjście, zapach gazu...).
// Każda: co zrobić od razu, przepis, wpis do protokołu z miejscem i godziną.
//
//   #/narzedzia/obchod/nagle         lista sytuacji (bez miejsca)
//   #/narzedzia/obchod/nagle/ID      lista sytuacji, wpis trafi do miejsca ID
//
// Pilność: PILNE - najpierw przerwij albo zgłoś, potem zapisuj; ZAPISZ - wpis do protokołu i rozmowa z zarządcą.

const KLUCZ_NAGLE = "insp-obchod-nagle";
const PILNE = "pilne", ZAPISZ = "zapisz";

// [id, pilność, co widzisz, co zrobić od razu, przepis]
const NAGLE = [
  { grupa: "Prace i działania w toku", sytuacje: [
    ["spawanie", PILNE, "Prace pożarowo niebezpieczne: spawanie, cięcie, szlifowanie, lutowanie, papa na dachu", "zapytaj o pisemne zezwolenie i osobę odpowiedzialną; sprawdź: materiały palne zabezpieczone (także konstrukcja i instalacje), sprzęt gaśniczy na miejscu, sprawny sprzęt, kto skontroluje miejsce po pracy; przy zagrożeniu wybuchem - prace tylko przy bezpiecznym stężeniu par i gazów", `§ 36 ust. 1 i 2 ${R10}`],
    ["remont", PILNE, "Remont w czynnym budynku: czujki zakryte, strefa SSP wyłączona, folie i materiały na drogach", "ustal, kto i na jak długo wyłączył ochronę i jak jest zastąpiona (dozór); przejścia i wyjścia muszą zostać wolne", `§ 4 ust. 2 pkt 1, ust. 1 pkt 11 i 16 ${R10}`],
    ["nagrzewnica", ZAPISZ, "Ogrzewacz tymczasowy: nagrzewnica gazowa, grzejnik elektryczny przy kartonach", "min. 0,5 m od materiałów palnych; urządzenie sprawne, używane zgodnie z instrukcją; elektryczne nie na palnym podłożu", `§ 4 ust. 1 pkt 2, 7 i 8 ${R10}`],
    ["przelewanie", PILNE, "Przelewanie paliwa lub rozpuszczalnika w budynku", "przerwij przy źródłach zapłonu; w garażach przelewanie paliwa i tankowanie jest zakazane; przeładunek produktów naftowych tylko w miejscach do tego przeznaczonych", `§ 8 ust. 2 pkt 2, § 4 ust. 1 pkt 20 ${R10}`],
  ] },
  { grupa: "Ewakuacja zablokowana teraz", sytuacje: [
    ["zamkniete", PILNE, "Wyjście ewakuacyjne zamknięte na klucz lub kłódkę, a w budynku są ludzie", "poproś o natychmiastowe otwarcie; zapisz, kto ma klucz i dlaczego było zamknięte", `§ 4 ust. 1 pkt 14 ${R10}`],
    ["klin", ZAPISZ, "Drzwi przeciwpożarowe na klinie, haczyku, podparte", "poproś o usunięcie blokady; jeśli drzwi mają stać otwarte - tylko na trzymaczu zwalnianym przez SSP", `§ 4 ust. 1 pkt 15 ${R10}`],
    ["zastawione", ZAPISZ, "Zastawione wyjście, korytarz lub klatka schodowa", "zmierz, ile zostało szerokości; poproś o usunięcie", `§ 4 ust. 1 pkt 11 i 16 ${R10}`],
    ["dostep", ZAPISZ, "Zastawiona gaśnica, hydrant, przycisk ROP, wyłącznik prądu, kurek gazu", "poproś o odsłonięcie; przed gaśnicą wolne przejście min. 1 m", `§ 4 ust. 1 pkt 18, § 33 ust. 2 pkt 2 ${R10}`],
  ] },
  { grupa: "Sygnały zagrożenia", sytuacje: [
    ["gaz", PILNE, "Zapach gazu", "nie włączaj i nie wyłączaj światła ani urządzeń, nie dzwoń w strefie zapachu; zakręć kurek główny, jeśli bezpiecznie dostępny, przewietrz, wyprowadź ludzi, wezwij pogotowie gazowe lub 112", "postępowanie ratownicze - nie przepis kontrolny"],
    ["spalenizna", PILNE, "Zapach spalenizny, dym, iskrzenie, nadtopione gniazdko lub listwa", "odłącz zasilanie obwodu, jeśli bezpiecznie; ustal źródło; przy dymie - alarm i 112; urządzenia niesprawne nie mogą być używane", `§ 4 ust. 1 pkt 2 ${R10}`],
    ["wyciek", PILNE, "Wyciek cieczy palnej, otwarte pojemniki z rozpuszczalnikiem", "usuń źródła zapłonu w pobliżu, przewietrz, zabezpiecz wyciek; ogień i palenie w takim miejscu zakazane", `§ 4 ust. 1 pkt 1 lit. b ${R10}`],
    ["butle", ZAPISZ, "Butla z gazem leży, stoi przy grzejniku lub przy iskrzących urządzeniach", "butla w budynku: tylko pionowo, zabezpieczona, 1,5 m od urządzeń grzewczych, 1 m od iskrzących; nie na strychu i w piwnicy", `§ 177 WT; § 4 ust. 1 pkt 13 ${R10}`],
    ["bateria", PILNE, "Spuchnięta lub uszkodzona bateria, hulajnoga ładowana na korytarzu", "odłącz ładowanie; uszkodzoną baterię wynieś z dala od budynku i materiałów palnych, jeśli bezpiecznie; nic nie może zawężać drogi ewakuacyjnej", `§ 4 ust. 1 pkt 11 ${R10}; uszkodzona bateria - z praktyki`],
  ] },
  { grupa: "Urządzenia przeciwpożarowe wyłączone", sytuacje: [
    ["centrala", PILNE, "Centrala SSP z wyłączonymi strefami lub uszkodzeniem", "ustal, od kiedy, kto wyłączył, czy powiadomiono serwis i jak jest zastąpiona ochrona", `§ 4 ust. 2 pkt 1 ${R10}`],
    ["tryskacze", PILNE, "Zamknięty zawór tryskaczowy albo towar tuż pod głowicami", "zawór ma być otwarty i zabezpieczony; towar nie może zasłaniać zraszaczy", `§ 4 ust. 2 pkt 1 ${R10}; odległość od głowic - norma i projekt`],
    ["gasnica", ZAPISZ, "Gaśnica bez plomby, rozładowana, po terminie przeglądu", "do wymiany lub przeglądu; przeglądy co najmniej raz w roku", `§ 3 ust. 3, § 4 ust. 2 pkt 1 ${R10}`],
  ] },
  { grupa: "Ludzie i zachowania", sytuacje: [
    ["palenie", ZAPISZ, "Palenie lub otwarty ogień przy materiałach niebezpiecznych pożarowo albo w strefie zagrożenia wybuchem", "przerwij; zapisz miejsce", `§ 4 ust. 1 pkt 1 ${R10}`],
    ["swiece", ZAPISZ, "Świece i otwarty ogień przy dekoracjach, zasłonach", "wystrój z materiałów palnych min. 0,5 m od gorących urządzeń; ogień przy dekoracjach - poproś o usunięcie", `§ 4 ust. 1 pkt 8 ${R10}; świece - z praktyki`],
    ["tlum", PILNE, "Za dużo ludzi w sali w stosunku do wyjść i dróg ewakuacyjnych", "policz osoby i szerokość wyjść (0,6 m na 100 osób); przy przekroczeniu - zgłoś organizatorowi natychmiast", "§ 236 ust. 6, § 239 WT"],
  ] },
  { grupa: "Na zewnątrz", sytuacje: [
    ["droga", ZAPISZ, "Auto, kontener, palety na drodze pożarowej lub przy hydrancie", "poproś o usunięcie; droga przejezdna cały rok, dostęp do źródeł wody wolny", `§ 5, § 4 ust. 1 pkt 18 lit. c ${R10}`],
    ["ognisko", PILNE, "Ognisko, wypalanie śmieci lub traw przy budynku", "przerwij, jeśli ogień może przejść na materiały palne lub budynki", `§ 4 ust. 1 pkt 5 ${R10}`],
  ] },
];

TRASY.unshift(
  [/^#\/narzedzia\/obchod\/nagle(?:\/([\w-]+))?$/, (m) => widokNagle(m[1] || "")],
);

function sytuacjaNagle(id) {
  for (const g of NAGLE) {
    const s = g.sytuacje.find((x) => x[0] === id);
    if (s) {
      return s;
    }
  }
  return null;
}

function widokNagle(idMiejsca) {
  const m = MIEJSCA.find((x) => x.id === idMiejsca);
  ustawNaglowek("Zauważyłem nagle", m ? `#/narzedzia/obchod/m/${m.id}` : "#/narzedzia/obchod");
  ustawZakladke("start");
  widok.innerHTML = `
    <div class="section-header"><div class="section-sub">${tekst(`Stuknij, co widzisz. ${m ? `Wpis trafi do protokołu z miejscem „${m.nazwa}”. ` : ""}Czerwone = najpierw przerwij albo zgłoś, dopiero potem zapisuj.`)}</div></div>
    ${NAGLE.map((g) => `<div class="section-label">${tekst(g.grupa)}</div><div class="nz-blok">${g.sytuacje.map(([id, pilnosc, co, zrob, prz]) => `
      <details class="ob-nagle${pilnosc === PILNE ? " pilne" : ""}">
        <summary>${pilnosc === PILNE ? '<span class="ob-pilne">PILNE</span> ' : ""}${tekst(co)}</summary>
        <p class="nz-wartosc"><b>Od razu:</b> ${pogrubLiczby(tekst(zrob))}</p>
        <p class="nz-podstawa">Przepis: ${tekst(prz)}</p>
        <div class="ob-przyciski"><button class="ob-uwaga" onclick="dodajNagle('${id}','${idMiejsca}',this)">Dodaj do protokołu</button></div>
      </details>`).join("")}</div>`).join("")}`;
}

function dodajNagle(id, idMiejsca, przycisk) {
  const lista = czytaj(KLUCZ_NAGLE, []);
  const teraz = new Date();
  lista.push({ id, miejsce: idMiejsca, czas: `${teraz.toLocaleDateString("pl-PL")} ${teraz.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` });
  zapisz(KLUCZ_NAGLE, lista);
  przycisk.textContent = "Dodano ✓";
  przycisk.classList.add("on");
}

function usunNagle(i) {
  const lista = czytaj(KLUCZ_NAGLE, []);
  lista.splice(i, 1);
  zapisz(KLUCZ_NAGLE, lista);
  widokMiejsc();
}

function protokolNagle() {
  const lista = czytaj(KLUCZ_NAGLE, []);
  if (!lista.length) {
    return "";
  }
  return `<div class="section-label">Zauważone nagle</div><div class="nz-blok">${lista.map((w, i) => {
    const s = sytuacjaNagle(w.id);
    if (!s) {
      return "";
    }
    const m = MIEJSCA.find((x) => x.id === w.miejsce);
    return `<div class="ob-punkt uwaga"><p class="nz-co">${tekst(s[2])}</p>
      <p class="nz-wartosc">${tekst(`${m ? m.nazwa + " · " : ""}${w.czas}`)}</p>
      <p class="nz-podstawa">Przepis: ${tekst(s[4])}</p>
      <div class="ob-przyciski"><button class="ob-nd" onclick="usunNagle(${i})">Usuń wpis</button></div></div>`;
  }).join("")}</div>`;
}
