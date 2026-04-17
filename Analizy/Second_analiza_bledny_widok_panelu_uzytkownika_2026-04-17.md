# Analiza: błędne dane w zakładkach panelu bocznego (moduł Second)

## Prompt użytkownika
> Sprawdź moduł Second.
> Jest jakiś problem z widokiem użytkownika.
>
> Kroki jakie wykonuję:
> 1. Otwieram stronę https://cutelittlegoat.github.io/Karty/Second/index.html
> 2. Wpisuję PIN 11111 - PIN ten ma nadane uprawnienia do kilku zakładek (załączam screena)
> 3. Wchodzę w zakładkę "Tournament of Poker". Włącza się zakładka "Wpłaty". Pojawia się komunikat "Brak dostępnych paneli Tournament of Poker dla tego PIN-u."
> 4. Klikam kilka razy po innych zakładkach z panelu bocznego. Za każdym razem jest taki sam komunikat "Brak dostępnych paneli Tournament of Poker dla tego PIN-u."
> 5. Po kilku kliknięciach ponownie przechodzę na zakładkę "Wpłaty" i pojawiają się jakieś dane. (załączam screena).
> 6. Wchodzę w zakładkę "Czat". Ta zakładka działa prawidłowo.
> 7. Następnie klikam na inne zakładki z panelu bocznego i wciąż mam wyświetlane dane z zakładki "Czat". (załączam screena).
>
> Przeprowadź analizę czemu dane w zakładkach z panelu bocznego wyświetlają błędne dane.

## Wniosek główny
Problem jest najpewniej złożony i składa się z **dwóch niezależnych usterek** w logice `Second/app.js`:

1. **Wyścig czasowy (race condition) po wpisaniu PIN-u** – zanim dojdą dane turnieju z Firestore, aplikacja sprawdza PIN na pustym stanie lokalnym i potrafi chwilowo pokazać brak paneli.
2. **Brak pełnej normalizacji kształtu danych turnieju** – część zakładek (niektóre sekcje poza `Wpłaty` i `Czat`) wykonuje operacje typu `.forEach/.map/.find` na polach, które mogą nie być tablicami w starszych/niestandardowych danych. Wtedy render zakładki rzuca wyjątek, a w DOM zostaje ostatni poprawnie wyrenderowany widok (np. `Czat`).

## Szczegóły analizy

### 1) Dlaczego czasami pojawia się „Brak dostępnych paneli...”, mimo że PIN ma uprawnienia
- Po starcie widoku użytkownika `userTournamentState` jest inicjalizowany domyślnie (`createTournamentDefaultState`), czyli bez graczy z bazy.
- Funkcja weryfikacji PIN (`verifyUserPin`) szuka gracza po PIN-ie w aktualnym `userTournamentState`.
- Jeżeli snapshot turnieju z Firestore jeszcze nie przyszedł, gracz nie zostanie znaleziony (lub logika uprawnień nie będzie miała danych) i interfejs potrafi chwilowo pokazać brak dostępnych paneli.
- Po kolejnych kliknięciach (gdy snapshot już dojdzie) dane zaczynają się wyświetlać poprawnie.

To tłumaczy obserwację: najpierw „Brak dostępnych paneli...”, później nagle pojawiają się dane.

### 2) Dlaczego po wejściu w „Czat” inne zakładki mogą dalej pokazywać czat
- Przełączanie aktywnego przycisku w sidebarze jest realizowane oddzielnie od renderowania treści (osobny listener tylko od `is-active`).
- Gdy użytkownik kliknie inną sekcję, `renderUserTournament()` buduje duży blok obliczeń dla części sekcji (pool/group/semi/final/payouts).
- W tym kodzie są miejsca zakładające, że dane mają konkretny typ (np. tablice). Jeśli w Firestore dane mają starszy lub inny format, render może zakończyć się wyjątkiem JS.
- Gdy render rzuci wyjątek, nowa treść nie nadpisuje starej i użytkownik dalej widzi poprzednią zawartość (np. ekran czatu), mimo że aktywny przycisk w sidebarze się zmienił.

To bardzo dobrze pasuje do objawu: „klikam inne zakładki, ale widzę dalej dane z Czat”.

## Porównanie z modułem Main
W module **Main** podobny obszar jest rozwiązany stabilniej i może służyć jako wzorzec dla Second:

1. **W Main sekcje gracza są osobnymi panelami**, a nie jedną sekcją przepisywaną dużym `innerHTML` dla każdej podzakładki. To zmniejsza ryzyko „zostania starego widoku” po błędzie renderu.
2. **W Main dostęp do sekcji opiera się na już zsynchronizowanym stanie graczy** (`adminPlayersState.playerByPin`), co redukuje ryzyko race condition podczas walidacji PIN.
3. **W Main aktywna sekcja jest centralnie ustawiana** przez `setActiveZoneSection`, a nie przez niezależne mechanizmy aktywowania przycisku i renderowania treści.

Wniosek z porównania: obecna architektura Main jest bardziej odporna na objawy zgłoszone w Second.

## Rekomendowane rozwiązania (naprawa)

### A. Naprawa race condition przy PIN
1. Dodać stan gotowości danych turnieju, np. `isTournamentLoaded`.
2. Zablokować przycisk „Otwórz” PIN oraz sekcję TOURNAMENT do czasu pierwszego snapshotu.
3. W `verifyUserPin` zwracać komunikat „Trwa ładowanie danych turnieju...” zamiast walidacji na pustym stanie.
4. Po pierwszym snapshotie dopiero wykonać weryfikację PIN i wyświetlanie dostępnych przycisków.

**Efekt:** brak chwilowych fałszywych komunikatów „Brak dostępnych paneli...”.

### B. Twarda normalizacja i guardy typu
1. W `normalizeTournamentState` wymusić typy dla wszystkich pól używanych dalej przez `.map/.forEach/.find`, m.in.:
   - `players`, `tables`, `finalPlayers` => zawsze tablice,
   - `assignments`, `payments`, `pool`, `group`, `semi`, `final`, `payouts` => zawsze obiekty.
2. Dodać bezpieczne helpery, np. `asArray(value)` i `asObject(value)`.
3. W renderze sekcji nie używać „gołych” wywołań na potencjalnie złym typie.

**Efekt:** kliknięcie zakładki nie powinno nigdy pozostawić starej treści z powodu wyjątku typu.

### C. Ujednolicenie mechanizmu aktywnej zakładki
1. Usunąć dublowanie logiki aktywności przycisków:
   - obecnie `setupTournamentButtons` ustawia `is-active`,
   - osobno `renderTournamentButtonsForPlayer` też ustawia `is-active`.
2. Zostawić jeden punkt decyzyjny (np. tylko `renderTournamentButtonsForPlayer` + `setActiveTournamentSection`).
3. Owinąć render sekcji w bezpieczny „fallback” UI:
   - przy błędzie pokazać komunikat „Nie udało się wyrenderować tej sekcji”,
   - nie zostawiać przypadkowo starego ekranu.

**Efekt:** stan aktywnego przycisku zawsze zgodny z faktycznie wyrenderowaną sekcją.

### D. Migracja zgodności danych (jednorazowa)
1. Wprowadzić wersjonowanie dokumentu turnieju, np. `schemaVersion`.
2. Dla starszych dokumentów wykonać migrację do docelowego kształtu.
3. Dodać log ostrzegawczy jeśli przychodzi dokument w starym formacie.

**Efekt:** redukcja regresji po wdrożeniu i przewidywalność danych.

## Czy wdrożenie rekomendowanych zmian w Second może popsuć coś innego?

### Ocena ryzyka: Niskie / Średnie (kontrolowalne)

#### Ryzyko 1: chwilowo inny UX podczas ładowania
- Po dodaniu `isTournamentLoaded` użytkownik może chwilę widzieć status „ładowanie danych”.
- To zmiana zachowania, ale pozytywna (eliminacja mylących błędów PIN).

#### Ryzyko 2: ukryte zależności od starego formatu danych
- Jeśli admin lub inne fragmenty kodu polegają na nietypowym formacie dokumentu, twarda normalizacja może zmienić wynik obliczeń.
- Mitigacja: wdrożyć migrację `schemaVersion` + testy na snapshotach historycznych.

#### Ryzyko 3: naruszenie działania czatu
- Czat jest logicznie niezależny, ale używa tego samego panelu i wspólnych mechanizmów aktywacji sekcji.
- Po refaktorze aktywnej sekcji trzeba sprawdzić, czy:
  - PIN czatu nadal działa,
  - nasłuch wiadomości nie urywa się przy przejściach między zakładkami,
  - wysyłka wiadomości jest blokowana tylko gdy brak uprawnienia.

#### Ryzyko 4: różnice między widokiem admin i user
- `setupTournamentButtons` używane jest i w adminie i w userze.
- Zmiany w tym obszarze trzeba odseparować, żeby nie naruszyć aktywacji zakładek w panelu administratora.

## Minimalny plan wdrożenia bezpiecznej poprawki
1. Dodać `isTournamentLoaded` + komunikat ładowania + blokadę weryfikacji PIN przed pierwszym snapshotem.
2. Rozszerzyć `normalizeTournamentState` o pełne guardy typów.
3. Dodać fallback `try/catch` tylko wokół renderowania sekcji użytkownika (z komunikatem UI, nie „cichym” błędem).
4. Ujednolicić zarządzanie aktywną zakładką (jeden mechanizm).
5. Testy manualne regresji:
   - poprawny PIN od razu po wejściu,
   - przełączanie wszystkich sekcji po wejściu w Czat,
   - odświeżenie strony z zachowanym sessionStorage,
   - test na starszym dokumencie turnieju.

## Podsumowanie
Najbardziej prawdopodobna przyczyna błędu to kombinacja:
- **chwilowej niespójności stanu przy starcie (PIN vs opóźniony snapshot)**,
- oraz **niewystarczającej walidacji/normalizacji danych przed renderem sekcji turniejowych**.

Porównanie z Main wskazuje, że stabilniejszy model to: centralne sterowanie aktywną sekcją, bardziej defensywny model danych i brak dublowania logiki aktywacji UI.

## Zrealizowane zmiany w kodzie (wdrożenie rekomendowanej naprawy)

Plik `Second/app.js`  
Linia (obszar normalizacji stanu)  
Było: `state.finalPlayers = Array.isArray(state.finalPlayers) ? state.finalPlayers : [];`  
Jest: `state.finalPlayers = asArray(state.finalPlayers);` oraz dodane bezpieczne helpery `asArray` i `asObject` użyte do wymuszenia typów dla `players`, `tables`, `assignments`, `payments`, `pool`, `group`, `semi`, `final`, `payouts`.

Plik `Second/app.js`  
Linia (obszar setupUserView, stan ładowania)  
Było: `let userTournamentSection = "players";`  
Jest: `let userTournamentSection = "players";` + `let isUserTournamentLoaded = false;` oraz blokada `userPinOpenButton.disabled = true` do czasu pierwszego snapshotu.

Plik `Second/app.js`  
Linia (obszar renderUserTournament)  
Było: brak strażnika ładowania i brak fallbacku błędu renderu.  
Jest: wstępny guard `if (!isUserTournamentLoaded) { ... }` oraz osłona `try/catch` z komunikatem: `Nie udało się wyrenderować tej sekcji. Spróbuj odświeżyć dane.`

Plik `Second/app.js`  
Linia (obszar verifyUserPin)  
Było: walidacja PIN wykonywana zawsze po kliknięciu, niezależnie od tego czy snapshot turnieju został już pobrany.  
Jest: weryfikacja PIN jest blokowana do czasu gotowości danych (`isUserTournamentLoaded`) i pokazuje komunikat `Trwa ładowanie danych turnieju. Spróbuj ponownie za chwilę.`

Plik `Second/app.js`  
Linia (obszar onSnapshot dla second_tournament/state)  
Było: po snapshotcie aktualizowany był tylko `userTournamentState`.  
Jest: po snapshotcie ustawiana jest gotowość `isUserTournamentLoaded = true` i odblokowanie przycisku PIN (`userPinOpenButton.disabled = false`).

Plik `Second/docs/README.md`  
Linia (sekcja instrukcji użytkownika dla panelu turniejowego)  
Było: brak informacji o blokadzie przycisku PIN podczas ładowania i brak opisu fallbacku renderowania sekcji.  
Jest: dodane punkty `5a` i `10b` opisujące stan ładowania (`Trwa ładowanie danych turnieju...`) oraz komunikat awaryjny renderowania sekcji.

Plik `Second/docs/Documentation.md`  
Linia (sekcje synchronizacji i renderu widoku użytkownika)  
Było: ogólny opis normalizacji i renderu bez szczegółów o guardach typu / ładowaniu / fallbacku.  
Jest: doprecyzowane wymuszenie typów w `normalizeTournamentState`, dodany opis flagi `isUserTournamentLoaded` oraz fallbacku `try/catch` dla renderowania sekcji użytkownika.
