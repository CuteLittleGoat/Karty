# Analiza modułu Second — Tournament of Poker / Firebase / wymagania z 2026-03-19

## Prompt użytkownika
> Przeanalizuj moduł Second. Wyniki analizy zapisz w nowym pliku w Analizy/
> Sprawdź poniższe wymagania.
> Sprawdź czy obecna struktura Firebase wspiera wszystkie wymagane funkcje.
> Sprawdź czy jest możliwość wprowadzenia wszystkich tych funkcji.
>
> Zakładka Tournament of Poker.
>
> 1. Panel Wpłaty
> 1.1 TABELA10 kolumna SUMA = Pole obliczalne. Brak możliwości edycji pola w tej tabeli. Wyświetlana wartość to wynik obliczenia: Suma wartości z kolumny BUY-IN z TABELA12 plus suma wartości z kolumny REBUY z TABELA12
>
> 2. Panel Faza Grupowa
> 2.1 TABELA18 kolumny "Stół1", "Stół2" (nazwy wpisane w panelu Losowanie Stołów) itd mają przyjmować wartości będące wynikiem obliczeń: Suma wartości kolumn STACK z TABELA19 plus Suma wartości kolumn REBUY/ADD-ON z TABELA19 dla wierszy, które mają tą samą nazwę stołu do nazwa kolumny.
>
> 3. Panel Półfinał
> 3.1.1 TABELA21 kolumna STACK = Wartość przepisana z TABELA19B kolumna STACK. Brak możliwości edycji pola w tej tabeli.
> 3.1.2 TABELA21 kolumna % = Wartość przepisana z TABELA19B kolumna %. Brak możliwości edycji pola w tej tabeli.
> 3.1.3 TABELA21 kolumna STÓŁ = Ma tu być pole rozwijane z nazwami stołów utworzonych w TABELA22 po naciśnięciu przycisku "Dodaj nowy stół". Funkcjonalność podobna jak w panelu Losowanie Stołów.
>
> 3.2 Tabele tworzące się po naciśnięciu przycisku "Dodaj nowy stół" (TABELA22).
> 3.2.1 Kolumna GRACZ = mają się pojawiać dane z kolumny GRACZ w TABELA21 zgodnie z przypisaniem w kolumnie STÓŁ w TABELA21. Podobna funkcjonalność jest w panelu Losowanie Stołów
> 3.2.2 Kolumna STACK = Wartość przepisana z TABELA21 kolumna STACK do danego gracza. Brak możliwości edycji pola w tej tabeli. 
> 3.2.3 Kolumny ŁĄCZNY STACK = ma to być pole obliczalne. Suma wartości z kolumny STACK z danego stołu. Brak możliwości edycji pola w tej tabeli.
> 3.2.3 Checkbox ELIMINATED = stan zaznaczony/odznaczony musi się zapisywać między sesjami przeglądarki/resetem aplikacji.
>
> 3.3 Tabela TABELA FINAŁOWA
> 3.3.1 Wiersze w tabeli mają być dynamiczne. Mają się tu pojawiać tylko gracze, którzy nie mają zaznaczonego checkboxa ELIMINATED w tabelach tworzących się po naciśnięciu przycisku "Dodaj nowy stół" (TABELA22).
> 3.3.1.1 Jeżeli żaden gracz nie ma zaznaczonego checkboxa to wyświetla się tylko nagłówek tabeli.
> 3.3.1.2 Podobna funkcjonalność istnieje w TABELA19, TABELA19A i TABELA19B
> 3.3.2 Kolumna STACK = Pole liczbowe do uzupełnienia przez użytkownika. Zwróć uwagę, żeby nie pojawiał się problem opisany w Analizy/Wazne_Fokus.md
> 3.3.3. Kolumna STÓŁ = Pole uzupełnia się automatycznie. Wyświetla się nazwa stołu przypisanego do danego gracza (przypisanie w panelu Losowanie Stołów)
> 3.3.4. Kolumna % = Pole obliczalne. Brak możliwości edycji pola w tej tabeli. Wyświetlana wartość jest wynikiem obliczenia:
> Wartość z kolumny STACK w TABELA FINAŁOWA podzielona przez wartość z kolumny ŁĄCZNY STACK w TABELA18.
>
> 4. Panel Wypłaty
> 4.1 TABELA24 kolumna POCZĄTKOWA WYGRANA = Pole liczbowe. Możliwość edycji pola w tej tabeli. Wartość domyślna to:
> 4.1.1 Dla wierszy 1, 2, 3, 4, 5, 6, 7 i 8 przepisuje się wartość z TABELA16 kolumna KWOTA odpowiednio z wierszy 1, 2, 3, 4, 5, 6, 7 i 8.
> 4.1.2 Dla wierszy od 9 do końca wartość domyślna to 0
> 4.1.3 Zwróć uwagę, żeby nie pojawiał się problem opisany w Analizy/Wazne_Fokus.md
> 4.2 TABELA24 kolumna KOŃCOWA WYGRANA = Pole liczbowe. Możliwość edycji pola w tej tabeli. Wartość domyślna to:
> 4.2.1 Dla wierszy 1, 2, 3, 4, 5, 6, 7 i 8 przepisuje się wartość z TABELA16 kolumna SUMA odpowiednio z wierszy 1, 2, 3, 4, 5, 6, 7 i 8.
> 4.2.2 Dla wierszy od 9 do końca wartość domyślna to 0
> 4.2.3  Zwróć uwagę, żeby nie pojawiał się problem opisany w Analizy/Wazne_Fokus.md
>
> 4.3 W panelu Wpłaty są dwa checkboxy:
> 4.3.1 Pokaż kolumnę POCZĄTKOWA WYGRANA = jeżeli checkbox jest zaznaczony to w widoku użytkownika kolumna POCZĄTKOWA WYGRANA jest widoczna. Jeżeli jest odznaczony to kolumna jest ukryta.
> 4.3.2 Pokaż kolumnę KOŃCOWA WYGRANA = jeżeli checkbox jest zaznaczony to w widoku użytkownika kolumna KOŃCOWA WYGRANA jest widoczna. Jeżeli jest odznaczony to kolumna jest ukryta.
> 4.4. Stan zaznaczenia lub odznaczenia checkboxów musi być zapisywany między sesjami przeglądarki/aplikacji.

## Zakres analizy
Przeanalizowano:
- `Second/app.js` — aktualny model stanu, render sekcji `payments`, `group`, `semi`, `payouts`, handlery `input`/`change`/`click`, zapis i odczyt Firestore.
- `Second/docs/Documentation.md` — opis aktualnie wdrożonych funkcji modułu Second.
- `Analizy/Wazne_Fokus.md` — wymagania dotyczące ochrony fokusu przy polach edycyjnych.
- `Analizy/Wazne_firestore-schema.txt` — eksport schematu Firestore, w tym kolekcji `second_tournament`.

## Wniosek główny
**Obecna struktura Firebase wspiera wdrożenie wszystkich opisanych funkcji albo po bardzo małym rozszerzeniu istniejącego dokumentu `second_tournament/state`.**

Nie ma tu blokady architektonicznej po stronie Firestore. Najważniejsze ograniczenia są obecnie w **warstwie UI i logice `Second/app.js`**, nie w modelu danych.

## Jak obecnie działa Firebase w module Second

### 1. Jeden centralny dokument turniejowy
Moduł admina i widok użytkownika pracują na tym samym dokumencie:
- kolekcja: `second_tournament`
- dokument: `state`

Stan ten jest tworzony lokalnie przez `createTournamentDefaultState()` i zapisywany przez `saveState()` jako jeden obiekt z `merge: true`.
To oznacza, że aplikacja już teraz jest przygotowana do dopisywania kolejnych pól/nestowanych struktur bez migracji kolekcji. 

### 2. Aktualny model stanu jest elastyczny
W stanie już istnieją gałęzie:
- `payments`
- `group`
- `semi`
- `finalPlayers`
- `payouts`

To daje naturalne miejsce na dopisanie brakujących danych dla półfinału i wypłat.

### 3. Normalizacja stanu toleruje brak nowych pól
`normalizeTournamentState()` buduje stan od domyślnego obiektu i dopiero potem nakłada dane z Firestore. Dzięki temu brak nowego pola w istniejącym dokumencie nie blokuje odczytu — można je po prostu dodać w kodzie i zacząć zapisywać przy kolejnych zmianach.

## Ocena obecnej struktury Firestore względem wymagań

### A. Co już jest wspierane przez obecną strukturę

#### A1. Wpłaty / TABELA10 / SUMA
To wymaganie jest już zgodne z aktualnym modelem danych.
Aplikacja ma:
- `payments.table10.sum`
- dane `BUY-IN` z metadanych turnieju,
- dane rebuy per gracz w `payments.table12Rebuys[playerId].values[]`.

Z punktu widzenia Firestore niczego nie brakuje.

#### A2. Wypłaty / widoczność kolumn dla użytkownika
To wymaganie także jest już wspierane przez obecny model danych, ponieważ istnieje:
- `payouts.showInitial`
- `payouts.showFinal`

Checkboxy tego typu już zapisują się do Firestore i są odczytywane również po ponownym wejściu do aplikacji.

#### A3. Trwałość checkboxów typu boolean
Dla checkboxów zapisujących się do obiektu stanu (`group.eliminated`, `payouts.showInitial`, `payouts.showFinal`) obecna struktura Firestore jest wystarczająca. Analogicznie można zapisać checkboxy `ELIMINATED` dla półfinału.

### B. Co wymaga tylko rozszerzenia obecnego dokumentu `second_tournament/state`

#### B1. Półfinał — przypisania graczy do stołów półfinałowych
Obecny model ma już:
- `semi.customTables[]`
- `semi.assignments{}`

To jest bardzo dobra baza do wdrożenia:
- wyboru stołu w `TABELA21`,
- dynamicznego renderowania `TABELA22`,
- budowy `TABELA FINAŁOWA` z filtracją po checkboxie `ELIMINATED`.

Najpewniej trzeba tylko rozszerzyć strukturę wpisu w `semi.assignments[playerId]`, np. o:
- `tableId`
- `eliminated`

Opcjonalnie można też dodać osobne mapy w `semi`, np.:
- `semi.eliminated[playerId]`
- `semi.finalStacks[playerId]`

Ale to nie jest wymuszone przez Firebase — to tylko decyzja implementacyjna.

#### B2. Wypłaty — wartości domyślne i nadpisywalne
Obecnie `finalPlayers[]` jest już używane jako lista wierszy wypłat i przechowuje m.in. `initialWin` oraz `finalWin` na poziomie obiektu gracza finałowego. To oznacza, że można wdrożyć wymagania 4.1 i 4.2 na dwa sposoby:
1. dalej trzymać dane bezpośrednio w `finalPlayers[]`, albo
2. dodać dedykowaną sekcję typu `payouts.rows[]`.

Oba warianty są możliwe bez zmian w strukturze kolekcji.

#### B3. Półfinał — trwałość checkboxów ELIMINATED
Najprostsze rozszerzenie to zapis boola do `semi`:
- `semi.eliminated[playerId] = true/false`

Firestore bez problemu obsłuży taki model, a `saveState()` już umie zapisać zagnieżdżone mapy.

## Gdzie obecnie logika nie spełnia wymagań

### 1. Panel Wpłaty — TABELA10 / SUMA
**Status: częściowo zgodne, ale niezgodne z nową definicją.**

Aktualnie dokumentacja i logika wskazują, że `Tabela10.SUMA` jest liczona jako suma BUY-IN przypisanych graczy, a `LICZ. REBUY/ADD-ON` jest tylko licznikiem rebuy. Nowe wymaganie mówi jasno, że `SUMA` ma być:
- suma `BUY-IN` z `Tabela12`
- plus suma `REBUY` z `Tabela12`

To jest zmiana logiki obliczeń, ale **nie wymaga zmiany Firebase**.

### 2. Panel Faza Grupowa — TABELA18
**Status: obecnie niezgodne.**

Aktualnie `Tabela18` liczy wartość stołu jako:
- liczba graczy przy stole × `stack`

Nie dolicza `REBUY/ADD-ON` z `Tabela19`. Nowe wymaganie wymaga dodania do sumy stołu także wartości rebuy/add-on danego stołu. To jest wyłącznie zmiana obliczeń w renderze/logice, bez potrzeby zmiany modelu Firestore.

### 3. Panel Półfinał — TABELA21
**Status: obecnie w dużej mierze niewdrożone.**

Aktualnie:
- `TABELA21.STACK` jest puste,
- `TABELA21.%` jest puste,
- `TABELA21.STÓŁ` nie jest selectem, tylko tekstem z odczytu istniejącego przypisania,
- brak pełnej funkcjonalności podobnej do `Losowanie Stołów`.

To oznacza, że dane źródłowe z `TABELA19B` można wykorzystać, ale kod renderujący sekcję `semi` wymaga przebudowy.

### 4. Panel Półfinał — TABELA22
**Status: obecnie praktycznie niewdrożone.**

Aktualnie tabela dodanego stołu półfinałowego ma tylko jeden pusty wiersz testowy i jedno ręcznie edytowalne pole stack. Nie ma:
- dynamicznego wypełnienia graczami,
- wyliczania łącznego stacka,
- trwałego checkboxa `ELIMINATED`,
- powiązania z `TABELA21`.

To jest główna luka implementacyjna, ale nadal bez blokady po stronie Firestore.

### 5. TABELA FINAŁOWA
**Status: obecnie niewdrożone zgodnie z wymaganiem.**

Aktualna tabela bazuje bezpośrednio na graczach ocalałych z fazy grupowej, a nie na graczach z półfinału po odfiltrowaniu checkboxów `ELIMINATED` z `TABELA22`. Brak też:
- pola `%` liczonego względem `Tabela18.ŁĄCZNY STACK`,
- pełnego zabezpieczenia na dynamiczne wiersze po danych półfinału,
- właściwego zasilenia nazwą stołu półfinałowego.

### 6. Panel Wypłaty — TABELA24
**Status: częściowo wdrożone, ale niezgodne z wymaganiami.**

Aktualnie:
- `Tabela24` tylko wyświetla wartości z `finalPlayers[].initialWin/finalWin`,
- pola nie są edytowalne,
- nie ma domyślnego zasilenia z `Tabela16.KWOTA` oraz `Tabela16.SUMA`.

To również jest brak w logice i renderze, nie w strukturze Firestore.

## Ocena wymaganie po wymaganiu

### 1.1 TABELA10 / SUMA
- **Czy obecna struktura Firebase wspiera?** Tak.
- **Czy da się wdrożyć?** Tak.
- **Uwagi:** wystarczy zmienić wzór obliczeń i nadal zapisywać wartość albo liczyć ją tylko przy renderze.

### 2.1 TABELA18 / suma STACK + REBUY/ADD-ON per stół
- **Czy obecna struktura Firebase wspiera?** Tak.
- **Czy da się wdrożyć?** Tak.
- **Uwagi:** wszystkie dane wejściowe już istnieją: stoły, przypisania, `stack`, liczba rebuy, `rebuyStack`.

### 3.1.1–3.1.3 TABELA21
- **Czy obecna struktura Firebase wspiera?** Tak, po lekkim rozszerzeniu `semi`.
- **Czy da się wdrożyć?** Tak.
- **Uwagi:** `TABELA21` może być w całości pochodną `TABELA19B` + `semi.customTables[]` + `semi.assignments{}`.

### 3.2.1–3.2.3 TABELA22
- **Czy obecna struktura Firebase wspiera?** Tak, po dodaniu trwałego stanu eliminacji półfinałowej.
- **Czy da się wdrożyć?** Tak.
- **Minimalne rozszerzenie:** np. `semi.eliminated[playerId]` albo `semi.assignments[playerId].eliminated`.

### 3.3.1–3.3.4 TABELA FINAŁOWA
- **Czy obecna struktura Firebase wspiera?** Tak.
- **Czy da się wdrożyć?** Tak.
- **Uwagi:**
  - dynamiczna lista może być budowana z `semi` zamiast z trwałej tablicy,
  - edytowalny `STACK` można zapisywać np. w `finalPlayers[]` albo `semi.finalStacks{}`,
  - `%` można liczyć bezpośrednio z aktualnego stanu.

### 4.1–4.2 TABELA24
- **Czy obecna struktura Firebase wspiera?** Tak.
- **Czy da się wdrożyć?** Tak.
- **Uwagi:** domyślne wartości można wyliczać z `Tabela16`, a po ręcznej edycji zapisywać np. do `finalPlayers[].initialWin/finalWin` albo osobnej sekcji `payouts.rows[]`.

### 4.3–4.4 Checkboxy widoczności kolumn
- **Czy obecna struktura Firebase wspiera?** Tak, już wspiera.
- **Czy da się wdrożyć?** Tak, część jest już gotowa.

## Czy eksport aktualnego schematu Firestore pokazuje wszystkie potrzebne pola?
Nie w pełni, ale to **nie jest problem**.

Eksport schematu `second_tournament` pokazuje m.in.:
- `assignments`
- `payments.table10`
- `payments.table11`
- `group.eliminated`
- `group.playerStacks`
- `semi.assignments`
- `semi.customTables`
- `finalPlayers`
- `payouts.showInitial`
- `payouts.showFinal`

Nie widać tam wszystkich nowszych lub opcjonalnych pól, takich jak np.:
- `payments.table12Rebuys`
- `group.eliminatedWins`
- `group.survivorStacks`

Najbardziej prawdopodobna przyczyna: eksport jest schemą próbkowaną z aktualnych danych i nie pokazuje pól, które jeszcze nie wystąpiły w dokumentach albo były puste przy eksporcie.

W praktyce aplikacja i tak używa `merge: true` oraz domyślnego stanu lokalnego, więc brak pola w aktualnym eksporcie **nie blokuje wdrożenia**.

## Ryzyka i pułapki implementacyjne

### 1. Fokus w nowych polach edycyjnych
Dla:
- `TABELA FINAŁOWA.STACK`,
- `TABELA24.POCZĄTKOWA WYGRANA`,
- `TABELA24.KOŃCOWA WYGRANA`

trzeba zachować zasady z `Analizy/Wazne_Fokus.md`:
- dodać komplet metadanych `data-focus-target`,
- dodać identyfikację sekcji/wiersza/kolumny,
- unikać nadpisania aktywnie edytowanego pola przez snapshot.

Mechanizm ochrony fokusu już istnieje w module, więc to nie jest ryzyko architektoniczne — tylko wymóg poprawnego wdrożenia.

### 2. Rozdzielenie danych pochodnych od danych trwałych
Warto rozróżnić:
- dane liczone zawsze na bieżąco (`Tabela18`, `%`, `ŁĄCZNY STACK`),
- dane wpisywane ręcznie i utrwalane (`Tabela finałowa STACK`, `Tabela24` wygrane, półfinałowe checkboxy `ELIMINATED`).

To uprości model i ograniczy ryzyko niespójności.

### 3. Obecne `finalPlayers[]`
Ta sekcja wygląda dziś bardziej jak techniczny placeholder pod starą/wstępną wersję finału i wypłat. Przy wdrażaniu nowych wymagań trzeba zdecydować, czy:
- zachować `finalPlayers[]` jako główne źródło dla finału i wypłat,
- czy zrobić z niej tylko wynik pochodny z `semi`.

Oba warianty są możliwe, ale drugi będzie bardziej spójny z opisanymi wymaganiami.

## Rekomendacja implementacyjna

### Najbezpieczniejszy model danych
Proponowany minimalny kierunek bez przebudowy kolekcji:
- `group`:
  - zostawić jak jest,
  - liczyć `Tabela18` na podstawie `Tabela19`.
- `semi`:
  - `customTables[]` — definicja stołów półfinałowych,
  - `assignments[playerId].tableId` — przypisanie z `TABELA21`,
  - `assignments[playerId].eliminated` albo `semi.eliminated[playerId]` — checkbox półfinału.
- `finalPlayers[]`:
  - przechowywać tylko ręcznie wpisywany `STACK` finałowy i ewentualnie wygrane,
  - budować listę graczy dynamicznie z półfinału.
- `payouts`:
  - zostawić `showInitial` / `showFinal`,
  - ewentualnie dodać `rows[]`, jeśli okaże się wygodniejsze niż trzymanie wygranych w `finalPlayers[]`.

## Ostateczna odpowiedź

### Czy obecna struktura Firebase wspiera wszystkie wymagane funkcje?
**Tak — w sensie architektonicznym tak.**

Już teraz istnieje centralny dokument `second_tournament/state` z sekcjami `payments`, `group`, `semi`, `finalPlayers`, `payouts`, a mechanizm zapisu przez `merge: true` pozwala bezpiecznie dopisywać brakujące pola.

### Czy jest możliwość wprowadzenia wszystkich tych funkcji?
**Tak, jest pełna możliwość wdrożenia wszystkich opisanych funkcji.**

### Co jest prawdziwą barierą?
Nie Firebase, tylko aktualny stan implementacji UI/logiki w `Second/app.js`, zwłaszcza w sekcjach:
- `group` — zły wzór dla `Tabela18`,
- `semi` — bardzo niepełna implementacja `Tabela21` i `Tabela22`,
- `payouts` — brak pól edycyjnych i brak domyślnego zasilenia z `Tabela16`.

### Poziom ingerencji
- **Niski** dla: `Tabela10.SUMA`, `Tabela18`, checkboxów widoczności wypłat.
- **Średni** dla: `Tabela24`.
- **Średnio-duży** dla: całego panelu `Półfinał` i zależnej od niego `Tabela Finałowa`.

## Podsumowanie w jednym zdaniu
**Firebase nie blokuje żadnego z wymagań; wszystkie funkcje da się wdrożyć, ale panel `Półfinał` i część `Wypłat` wymagają realnej przebudowy logiki renderowania oraz zapisu w `Second/app.js`.**

## Zrealizowane zmiany w kodzie po wdrożeniu rekomendacji

Plik Second/app.js
Linia 668-671
Było: brak jawnej normalizacji `semi.assignments`, `semi.customTables` i `finalPlayers` po odczycie stanu.
Jest: dodana normalizacja tych gałęzi, żeby nowe pola półfinału i wypłat zawsze miały poprawny kształt po odczycie z Firebase.

Plik Second/app.js
Linia 1382-1403
Było: `Tabela10.SUMA` liczyła tylko sumę BUY-IN, bez kwot REBUY.
Jest: `Tabela10.SUMA` liczy `suma BUY-IN z Tabela12 + suma REBUY z Tabela12` i dalej zapisuje wynik do `payments.table10.sum`.

Plik Second/app.js
Linia 1423-1492
Było: `Tabela18` liczyła tylko `liczba graczy × stack`, a półfinał/finał nie miał wspólnego przygotowania danych.
Jest: dodane wspólne obliczenia dla `Tabela19`, `Tabela18`, `Tabela21`, `Tabela22` i dynamicznej tabeli finałowej, w tym suma `STACK + REBUY/ADD-ON` per stół oraz dynamiczne budowanie `finalPlayers` z półfinału.

Plik Second/app.js
Linia 1663-1680
Było: `Tabela21` nie kopiowała `STACK` i `%` z `Tabela19B`, `STÓŁ` nie był selectem, a `Tabela22` była placeholderem z ręcznym stackiem.
Jest: `Tabela21` pokazuje readonly `STACK` i `%` z `Tabela19B`, `STÓŁ` jest selectem z nazwami stołów półfinałowych, a `Tabela22` renderuje graczy przypisanych do stołu, readonly `STACK`, liczony `ŁĄCZNY STACK` i trwały checkbox `ELIMINATED`.

Plik Second/app.js
Linia 1683-1694
Było: tabela finałowa w panelu `Półfinał` pokazywała wszystkich ocalałych z fazy grupowej i nie miała logiki dynamicznej zależnej od półfinału.
Jest: tabela finałowa pokazuje tylko graczy przypisanych do stołów półfinałowych bez zaznaczonego `ELIMINATED`, `STACK` jest edytowalny, `STÓŁ` automatyczny, a `%` liczone względem `Tabela18.ŁĄCZNY STACK`.

Plik Second/app.js
Linia 1697-1755
Było: `Tabela24` tylko wyświetlała wartości wygranych i nie miała edytowalnych pól ani domyślnego zasilenia z `Tabela16`.
Jest: `Tabela24` ma edytowalne pola `POCZĄTKOWA WYGRANA` i `KOŃCOWA WYGRANA`, domyślne wartości z `Tabela16` dla miejsc 1-8, `0` od miejsca 9 oraz ukrywanie/pokazywanie kolumn zgodnie z checkboxami zapisanymi w `payouts.showInitial/showFinal`.

Plik Second/app.js
Linia 1763-1849
Było: brak obsługi inputów wypłat, brak trwałego checkboxa `ELIMINATED` w półfinale i pozostałości starej logiki półfinału/finału.
Jest: dodana obsługa `payout-initial`, `payout-final`, `semi-player-eliminated`, uproszczony zapis `semi-assign-table` i zachowane metadane fokusu dla nowych pól liczbowych.

Plik Second/app.js
Linia 1906-1958
Było: usuwanie gracza i stołu półfinałowego nie czyściło powiązanych danych finałowych/półfinałowych, a dodawanie stołów półfinałowych tworzyło pustą nazwę.
Jest: usuwanie gracza czyści też `finalPlayers`, usuwanie stołu półfinałowego odpina przypisania graczy, a nowy stół półfinałowy dostaje domyślną nazwę `StółN`.

Plik Second/app.js
Linia 2173-2223
Było: widok użytkownika w `Wypłatach` zawsze renderował obie kolumny i nie wyliczał domyślnych wartości z `Tabela16`.
Jest: widok użytkownika ukrywa/pokazuje kolumny zgodnie z checkboxami administratora i stosuje te same domyślne wartości wypłat co panel admina.

Plik Second/docs/Documentation.md
Linia 89-111 oraz 163-172
Było: dokumentacja opisywała stare zachowanie `Tabela18`, półfinału i wypłat.
Jest: dokumentacja opisuje nowe obliczenia `Tabela10`, nową logikę `Tabela18`, dynamiczny półfinał, tabelę finałową oraz domyślne i edytowalne wypłaty.

Plik Second/docs/README.md
Linia 51-115 oraz 184-193
Było: instrukcja użytkownika nie opisywała nowych reguł wyliczeń, dynamicznych stołów półfinałowych i nowych zasad widoczności/edycji wypłat.
Jest: README opisuje krok po kroku nową obsługę `Wpłat`, `Fazy grupowej`, `Półfinału`, `Finału` i `Wypłat` z persystencją checkboxów i domyślnymi wartościami z `Tabela16`.
