# Karty — Dokumentacja techniczna (frontend + backend Firebase)

## 1. Cel aplikacji

Aplikacja organizuje rozgrywki karciane w modelu:
- panel administracyjny,
- widoki użytkownika,
- zarządzanie grami, statystykami, czatem, regulaminem,
- autoryzacja sekcji PIN-em gracza,
- zapis i odczyt danych z Firebase (Firestore).

Kod działa jako aplikacja webowa typu SPA w oparciu o:
- `Main/index.html` (struktura),
- `Main/styles.css` (warstwa wizualna),
- `Main/app.js` (logika i integracje),
- `config/firebase-config.js` (konfiguracja Firebase).

---

## 2. Architektura i odpowiedzialność plików

## 2.1 `Main/index.html`
Zawiera wszystkie sekcje interfejsu i kontenery dynamiczne:
- panel administratora (zakładki: aktualności, czat, regulamin, gracze, turnieje, gry admina, statystyki, gry użytkowników, gry do potwierdzenia),
- sekcje użytkownika (najbliższa gra, czat, statystyki, gry użytkowników, regulamin),
- modale szczegółów i formularze wpisów.

Kod HTML deklaruje identyfikatory wykorzystywane przez JS do:
- nasłuchiwania zdarzeń,
- renderowania list,
- aktualizacji statusów,
- sterowania bramkami PIN.

## 2.2 `Main/styles.css`
Definiuje:
- siatkę layoutu (`.grid`, `.card`, `.page`),
- system typografii i wag fontów,
- warianty przycisków (`.primary`, `.secondary`, `.danger`),
- stany aktywne zakładek (`.is-active`),
- style tabel, formularzy, modalów i statusów,
- responsywność (media queries dla mniejszych ekranów).

## 2.3 `Main/app.js`
Główny plik logiki aplikacji:
- inicjalizacja Firebase,
- warstwa dostępu do Firestore,
- renderowanie tabel/list,
- obsługa formularzy i walidacji,
- obliczanie statystyk, rankingów i podsumowań finansowych,
- separacja kontekstów admin/user,
- mechanizmy debouncingu i odświeżania.

## 2.4 `config/firebase-config.js`
Przechowuje konfigurację połączenia Firebase jako globalny obiekt używany podczas `firebase.initializeApp(...)`.

---

## 3. Backend: model danych Firestore

> Poniższy model odzwierciedla sposób użycia kolekcji i dokumentów przez logikę aplikacji.

## 3.1 Ustawienia aplikacji
- Kolekcja: `app_settings`
- Kluczowe dokumenty:
  - `player_access` — lista graczy, PIN-y, uprawnienia, flaga aktywacji,
  - dokumenty konfiguracyjne regulaminu / aktualności (zgodnie z modułami panelu).

## 3.2 Czat
- Kolekcja czatu (dedykowana dla wiadomości użytkowników).
- Rekord wiadomości zawiera m.in.:
  - `playerId`,
  - `playerName`,
  - `message`,
  - `createdAt` (timestamp).
- Administrator ma operacje moderacyjne (odczyt + usuwanie wpisów starszych niż retencja).

## 3.3 Gry administracyjne i turniejowe
- Kolekcje gier rozdzielone kontekstowo (np. „gry admina”, „turnieje”).
- Dokument gry zawiera m.in.:
  - `gameType`,
  - `gameDate` (format `YYYY-MM-DD`),
  - `name`,
  - `notes` (tekst notatek do sekcji „Podsumowanie gry”),
  - `isClosed`,
  - `createdAt`.
- Podkolekcja `rows` dla każdej gry:
  - `playerName`,
  - `entryFee`,
  - `rebuy`,
  - `payout`,
  - `summary` (`+/-`),
  - `points`,
  - `championship`.

## 3.4 Gry użytkowników
- Analogiczny model gry + `rows`, obsługiwany przez wspólny menedżer.
- Dodatkowa warstwa statusów do procesu potwierdzania przez administratora.

## 3.5 Potwierdzenia
- Dane gier aktywnych są agregowane z odpowiednich kolekcji.
- Lista „do potwierdzenia” bazuje na filtrze statusu i kontekście źródła.

---

## 4. Inicjalizacja backendu i obsługa błędów

## 4.1 Firebase bootstrap
`getFirebaseApp()`:
- sprawdza obecność `window.firebase` oraz konfiguracji,
- inicjalizuje aplikację Firebase jednokrotnie,
- zwraca instancję używaną przez moduły aplikacji.

## 4.2 Firestore error mapping
`formatFirestoreError(error)`:
- mapuje techniczne błędy Firestore do komunikatów czytelnych w UI,
- uwzględnia przypadki typu `permission-denied`.

## 4.3 Debounce zapisów
`scheduleDebouncedUpdate(key, callback, delay)`:
- ogranicza liczbę zapisów przy częstej edycji,
- utrzymuje osobne timery dla różnych kluczy logicznych,
- poprawia wydajność i minimalizuje ryzyko konfliktów zapisu.

---

## 5. Kontrola dostępu: PIN i uprawnienia

## 5.1 Model gracza
W `player_access` każdy rekord gracza obejmuje:
- `id`,
- `name`,
- `pin` (5 cyfr),
- `permissions` (lista uprawnień do zakładek),
- `appEnabled` (aktywność konta).

## 5.2 Walidacja PIN
- `sanitizePin(value)` — filtr cyfr i limit długości,
- `isPinValid(value)` — walidacja regex 5-cyfrowego kodu,
- `generateRandomPin()` — generator PIN dla panelu admina.

## 5.3 Egzekwowanie uprawnień
`isPlayerAllowedForTab(player, tabKey)`:
- sprawdza, czy gracz ma dostęp do konkretnej zakładki,
- działa po poprawnej autoryzacji PIN.

## 5.4 Niezależne bramki PIN (stan sesji)
Aplikacja trzyma odrębne stany odblokowania dla sekcji:
- najbliższa gra,
- czat,
- statystyki,
- gry użytkowników,
- gry do potwierdzenia.

Dzięki temu autoryzacja w jednej sekcji nie implikuje automatycznie dostępu do wszystkich.

---

## 6. Moduły administracyjne — logika backendowa

## 6.1 Zakładki i odświeżanie
- `initAdminPanelTabs()` steruje aktywną zakładką i widocznością paneli.
- `initAdminPanelRefresh()` wywołuje dedykowane odświeżenie aktywnego modułu przez mapę handlerów.

## 6.2 Aktualności
`initAdminMessaging()`:
- pobiera i zapisuje wiadomość administracyjną,
- publikuje aktualność do widoku użytkownika.

## 6.3 Czat (moderacja)
`initAdminChat()`:
- pobiera listę wpisów,
- czyści wpisy starsze niż skonfigurowany okres retencji.

## 6.4 Regulamin
`initAdminRules()`:
- odczyt treści regulaminu,
- pełny zapis treści dokumentu po edycji.

## 6.5 Gracze
`initAdminPlayers()`:
- CRUD rekordów graczy,
- walidacja PIN,
- aktywacja/dezaktywacja `appEnabled`,
- edycja listy `permissions` przez modal.

## 6.6 Turnieje
`initAdminTables()`:
- tworzenie gier,
- edycja metadanych gry,
- usuwanie gry,
- zarządzanie wierszami `rows`.

## 6.7 Gry admina
`initAdminGames()`:
- lista lat,
- filtrowanie gier po roku,
- modal szczegółów,
- edycja danych finansowych i punktowych,
- przeliczanie podsumowań i rankingów,
- render sekcji „Podsumowanie gry” zawiera metadane gry w kolejności: ostrzeżenie o rozbieżnościach (jeśli wystąpi), **Rodzaj gry**, **Pula**, następnie tabela graczy.

## 6.8 Gry użytkowników (admin)
`initAdminUserGames()`:
- wykorzystuje wspólną logikę menedżera,
- daje adminowi pełen podgląd i kontrolę zgłoszeń,
- renderuje w „Podsumowanie gry” ten sam układ metadanych co „Gry admina” (Rodzaj gry nad Pulą).

## 6.9 Gry do potwierdzenia
`initAdminConfirmations()`:
- pobiera gry oczekujące,
- obsługuje zmianę statusów potwierdzenia.

---

## 7. Moduły użytkownika — logika backendowa

## 7.1 Najbliższa gra
- `initPinGate()` uruchamia bramkę PIN.
- Po autoryzacji użytkownik dostaje widok danych przypisanych do sekcji.

## 7.2 Czat użytkownika
`initChatTab()`:
- bramka PIN,
- wysyłka wiadomości,
- odświeżanie listy.

## 7.3 Gry użytkowników
`initUserGamesTab()`:
- wybór roku,
- lista gier,
- edycja detali,
- spójne reguły walidacji i obliczeń jak po stronie admina.

## 7.4 Gry do potwierdzenia
`initUserConfirmations()`:
- lista pozycji wymagających interakcji,
- zapis decyzji i aktualizacja statusu.

## 7.5 Statystyki użytkownika
`initStatisticsTab()`:
- autoryzacja,
- filtr roku,
- prezentacja tabeli i rankingu.

---

## 8. Wspólny silnik gier użytkowników

`initUserGamesManager({...})` to warstwa współdzielona przez widoki admin i user.

Zapewnia:
- ujednolicone ładowanie lat,
- listowanie gier,
- otwieranie szczegółów,
- zapis zmian,
- walidację danych,
- wyliczanie podsumowań i agregatów.

To ogranicza duplikację kodu i utrzymuje spójne reguły biznesowe niezależnie od roli.

---

## 9. Silnik statystyk i ranking

## 9.1 Konfiguracja kolumn
`STATS_COLUMN_CONFIG` opisuje dla każdej kolumny:
- typ danych,
- czy pole jest edytowalne,
- czy uczestniczy jako waga,
- wartości domyślne,
- sposób formatowania procentów i wyników.

## 9.2 Obliczenia
`initStatisticsView({...})` liczy m.in.:
- liczbę gier,
- frekwencję,
- sumy wpłat/wypłat,
- bilans `+/-`,
- procenty globalne,
- procenty względem rozegranych gier,
- wynik końcowy do rankingu.

## 9.3 Ranking
Ranking jest sortowany według wyniku końcowego i wyświetlany jako tabela miejsc.

## 9.4 Inicjalizacja wielu widoków
`initStatisticsViews()` uruchamia warianty statystyk dla różnych kontekstów i dba o wspólną konfigurację.

---

## 10. Logika gier: nazewnictwo, daty, sortowanie

- `getFormattedCurrentDate()` — data domyślna nowej gry.
- `getNextGameNameForDate()` — automatyczna propozycja nazwy przy dodawaniu.
- `parseDefaultTableNumber()` + `getNextTableName()` — wyznaczanie kolejnego numeru stołu.
- `compareByGameDateAsc()` — sortowanie po dacie i fallbackach (`createdAt`, nazwa).
- `extractYearFromDate()` — pobranie roku z daty gry.
- `normalizeYearList()` — deduplikacja i sort listy lat.
- `loadSavedSelectedGamesYear(...)` / `saveSelectedGamesYear(...)` — pamięć wyboru roku w storage.

---

## 11. Styl, fonty i zasady interfejsu

Aplikacja korzysta z fontów Google:
- Cinzel,
- Cormorant Garamond,
- Inter,
- Rajdhani.

Warstwa CSS buduje:
- hierarchię nagłówków,
- spójne odstępy i promienie kart,
- jednolite kolory akcji (primary/secondary/danger),
- stany statusów i ostrzeżeń,
- czytelne tabele danych.

Szczegółowe wartości styli i kolorów są rozwijane w `DetaleLayout.md`.

---

## 12. Przepływy końcowe danych (end-to-end)

## 12.1 Dodanie gry przez admina
1. UI zbiera dane formularza.
2. Warstwa JS waliduje pola.
3. Tworzony jest dokument gry w Firestore.
4. W razie potrzeby tworzone są dokumenty `rows`.
5. Widok listy odświeża się i sortuje wg reguł dat.

## 12.2 Edycja wiersza gracza
1. Zmiana wartości finansowych/punktowych w UI.
2. Debounced write do Firestore.
3. Przeliczenie pól pochodnych (`summary`, agregaty, ranking).
4. Render aktualnego stanu w tabeli.

## 12.3 Uwierzytelnienie PIN i praca użytkownika
1. Użytkownik podaje PIN.
2. System porównuje PIN z rekordem `player_access`.
3. Weryfikowane są `appEnabled` i `permissions`.
4. Po sukcesie sekcja zostaje odblokowana i możliwa jest dalsza interakcja.

---

## 13. Wymagania do odtworzenia aplikacji przez innego dewelopera

Aby odtworzyć system 1:1, należy zapewnić:
- identyczną strukturę DOM i identyfikatory z `index.html`,
- te same klasy i semantykę styli z `styles.css`,
- pełny zestaw funkcji inicjalizujących i helperów z `app.js`,
- zgodny model kolekcji/dokumentów Firestore,
- mapowanie błędów i komunikatów statusu,
- obsługę bramek PIN per sekcja,
- reguły obliczeń statystycznych i rankingowych,
- wspólny menedżer gier użytkowników.

Bez tych elementów aplikacja nie zachowa pełnej zgodności funkcjonalnej z bieżącą implementacją.

---

## 14. Aktualizacja 2026-02-12 — Gry admina / Gry użytkowników

### 14.1 `initAdminGames()` — kolumna „Punkty” liczona automatycznie
W module `initAdminGames()` zmieniono agregację statystyk graczy:
- w `getPlayersStatistics()` dodano pole `pointsSum` dla każdego gracza,
- `pointsSum` jest sumą `row.points` z wszystkich rekordów szczegółów gier (`getDetailRows(game.id)`) gracza,
- w `renderStatsTable()` kolumna „Punkty” została przepięta z pola edytowalnego (`createEditableCell(..., "points")`) na komórkę tylko do odczytu (`createReadOnlyCell(row.pointsSum)`).

Efekt: w zakładce **Gry admina → Statystyki** wartość punktów nie pochodzi już z ręcznego wpisu, tylko z realnych danych meczowych gracza.

### 14.2 Utrzymanie poziomego scrolla w „Podsumowanie gry”
W dwóch renderach podsumowań (`initUserGamesManager()` oraz `initAdminGames()`) dodano mechanizm zachowania pozycji scrolla:
1. przed `summariesContainer.innerHTML = ""` zbierane są poprzednie wartości `scrollLeft` z elementów oznaczonych `data-summary-game-id`,
2. nowo tworzone kontenery `.admin-table-scroll` dostają `data-summary-game-id = game.id`,
3. po zbudowaniu tabeli przywracane jest `tableScroll.scrollLeft` z zapamiętanej mapy.

Dzięki temu re-render po snapshot/autozapisie nie resetuje poziomego paska na lewą krawędź.

### 14.3 `initUserGamesManager()` — poprawa przywracania fokusu w modalu „Szczegóły gry”
W `renderModal(gameId)` dodano komplet metadanych fokusu (`data-*`) dla pól wcześniej podatnych na utratę aktywności:
- select gracza: `data-focus-target`, `data-section`, `data-table-id`, `data-row-id`, `data-column-key`,
- wejścia liczbowe (`entryFee`, `rebuy`, `payout`, `points`): ten sam zestaw metadanych,
- checkbox `championship`: ten sam zestaw metadanych.

Metadane są kompatybilne z istniejącymi helperami:
- `getFocusedAdminInputState(container)`,
- `restoreFocusedAdminInputState(container, focusState)`.

Skutek: po debounce + onSnapshot modal jest przebudowywany, ale fokus i pozycja kursora są odtwarzane dla edytowanego pola.

### 14.4 Backend / dane
Zmiana nie wymaga migracji struktury Firestore.
- nadal wykorzystywane są te same kolekcje i pola szczegółów gier,
- `pointsSum` jest wartością wyliczaną runtime na froncie,
- zapis do `ADMIN_GAMES_STATS_COLLECTION` pozostaje zgodny wstecznie.

---

## Aktualizacja techniczna 2026-02-12 — Gry admina / Gry użytkowników / Ranking

### 1) `Main/app.js` — wspólne zarządzanie modalem szczegółów gry (`initUserGamesManager`)
- Do konfiguracji menedżera dodano `modalEntryFeeBulkButtonSelector`.
- Selektor jest mapowany na `modalEntryFeeBulkButton`, który obsługuje masową aktualizację `entryFee`.
- W `createNumericCell` dla kluczy `entryFee` i `payout` dodano domyślne podstawienie `"0"`, gdy źródłowa wartość jest pusta.
- W trakcie wpisywania danych dla `entryFee`/`payout` pusty input jest natychmiast normalizowany do `"0"`.
- W `getGameSummaryMetrics` sortowanie `rows` zmieniono z `% puli` na `profit` malejąco (`b.profit - a.profit`).
- Dodawanie nowego wiersza do szczegółów gry ustawia teraz:
  - `entryFee: "0"`
  - `payout: "0"`
- Dodano masową operację ustawienia wpisowego:
  1. `window.prompt` pobiera wartość,
  2. `sanitizeIntegerInput` normalizuje tekst,
  3. wykonywany jest `Promise.all(...update({ entryFee: normalized }))` dla wszystkich dokumentów w podkolekcji szczegółów gry.

### 2) `Main/app.js` — Gry admina (`initAdminGames`)
- Wyszukiwany jest przycisk bulk w modalu: `#gameDetailsModal .game-entry-fee-bulk-button`.
- Sekcja podsumowań gry (`getGameSummaryMetrics`) sortuje wiersze po `profit` malejąco.
- Dodano obliczanie wyniku statystycznego funkcją `getComputedResultValue(row, manualEntry)` z formułą:
  - `(championshipCount * weight1)`
  - `+ (participationPercent * weight2)`
  - `+ (pointsSum * weight3)`
  - `+ (plusMinusSum * weight4)`
  - `+ (payoutSum * weight5)`
  - `+ (depositsSum * weight6)`
  - `+ (percentAllGames * weight7)`
- Dodano `sortRankingRowsByResult(rows)` do centralnego sortowania rankingu.
- Kolumna końcowa statystyk graczy została zmieniona z edytowalnej (`result`) na read-only (wartość obliczana).
- Ranking po prawej renderuje się zawsze na podstawie obliczonego `resultValue` i sortowania malejącego.
- W reakcji na zmianę wag ranking przeliczany jest natychmiast (bez czekania na pełny rerender).
- Dodawanie wiersza do szczegółów gry ustawia domyślnie `entryFee: "0"` i `payout: "0"`.
- Dodano bulk update wpisowego w modalu admina analogicznie jak w `initUserGamesManager`.

### 3) `Main/index.html` — zmiany semantyki UI
- W nagłówku tabeli statystyk graczy w zakładce „Gry admina” zmieniono etykietę końcowej kolumny z `Wynik` na `Wyniki`.
- W trzech modalach szczegółów gry nagłówek kolumny `Wpisowe` jest teraz przyciskiem:
  - `#userGameDetailsModal`
  - `#playerUserGameDetailsModal`
  - `#gameDetailsModal`
- Każdy przycisk ma klasy:
  - `admin-weight-bulk-button`
  - `game-entry-fee-bulk-button`

### 4) Spójność danych i Firestore
- Zmiany wpisowego z przycisku bulk aktualizują każdy dokument szczegółu gry osobnym `update`.
- Nie zmieniano ścieżek kolekcji ani struktury dokumentów.
- Nie dodawano nowych kolekcji i nie modyfikowano reguł bezpieczeństwa w repozytorium.

### 5) Wpływ na zachowanie UI
- Użytkownik widzi mniej pustych pól liczbowych w modalu szczegółów (domyślne zera).
- Administrator i użytkownik z uprawnieniem edycji mogą wielokrotnie seryjnie ustawiać wpisowe dla całej tabeli gry.
- Podsumowania gier lepiej eksponują liderów po realnym wyniku finansowym (`+/-`).
- Ranking po prawej stronie jest deterministycznie powiązany z bieżącymi wagami i metrykami statystyk.

## Aktualizacja techniczna 2026-02-12 — odświeżanie „Wynik” i spójność tabel Statystyk

### Zakres kodu
Zmiany wykonano w `Main/app.js` w dwóch modułach:
- `initAdminGames()` — tabela **Gry admina → Statystyki** + ranking,
- `initStatisticsView()` — współdzielona logika tabeli **Statystyki** (admin/user).

### 1) Ujednolicenie definicji kolumn statystyk (`STATS_COLUMN_CONFIG`)
- Kolumna `points` została ustawiona jako read-only (`editable: false`) i pobiera wartość z `row.pointsSum`.
- Kolumna `result` została ustawiona jako read-only (`editable: false`) i wylicza się przez przekazany callback `getComputedResultValue(...)`.

Skutek:
- nie ma już ręcznej edycji `Wynik` w tabeli statystyk,
- obie tabele statystyk prezentują wynik z tego samego algorytmu.

### 2) `initStatisticsView()` — usunięcie ręcznego `result`/`points` z warstwy danych manualnych
- `manualStatsFields` zawiera teraz tylko wagi: `weight1..weight7`.
- Dane manualne nie przechowują już ręcznych wartości `points` ani `result`.
- `getPlayersStatistics()` rozszerzono o agregację `pointsSum` z wierszy gry (`row.points`).
- Dodano lokalny kalkulator `getComputedResultValue(row, manualEntry)` z tym samym wzorem jak w `initAdminGames()`.
- Render komórek i eksport XLSX przekazują `getComputedResultValue` do `STATS_COLUMN_CONFIG`, więc kolumna `Wynik` jest wyliczana także w eksporcie.

Skutek:
- zakładka **Statystyki** pokazuje te same wartości `Punkty` i `Wynik` co sekcja statystyk w **Gry admina**.

### 3) `initAdminGames()` — natychmiastowe odświeżanie kolumny „Wynik”
- W `renderStatsTable()` dodano funkcję `updateResultsAndRanking(statisticsRows, yearMap)`.
- Funkcja po każdej zmianie wagi:
  - przelicza `resultValue` dla każdego gracza,
  - aktualizuje komórkę `data-result-player="<playerName>"` w tabeli,
  - ponownie renderuje ranking na podstawie nowych wyników.
- Komórki kolumny wynikowej otrzymały identyfikator przez `dataset.resultPlayer`.

Skutek:
- zmiana np. `Waga7` odświeża kolumnę `Wynik` bez przełączania zakładki,
- ranking i kolumna `Wynik` aktualizują się synchronicznie.

### 4) Obsługa przycisku „Odśwież” dla zakładki „Gry admina”
- `registerAdminRefreshHandler("adminGamesTab", ...)` nie jest już pusty.
- Handler wywołuje kolejno:
  - `renderGamesTable()`,
  - `renderSummaries()`,
  - `renderStatsTable()`.

Skutek:
- kliknięcie **Odśwież** w panelu admina realnie odrysowuje również sekcję statystyk i ranking w zakładce **Gry admina**.

### Backend (Firestore)
- Format dokumentów w `admin_games_stats/{year}` pozostaje kompatybilny:
  - `rows[]` nadal przechowuje `playerName` oraz `weight1..weight7`,
  - brak potrzeby przechowywania ręcznego `result` i `points` (wartości są obliczane po stronie frontendu z danych gier).
- Odczyt legacy danych (gdy dokument ma dodatkowe pola) nie powoduje błędu — pola nieużywane są ignorowane przez aktualny renderer.

## 16. Zmiany logiki: sortowanie statystyk i notatki do podsumowania

### 16.1 Wspólny comparator statystyk
- Dodano funkcję `comparePlayerStatsByPlusMinusDesc(a, b)`.
- Funkcja sortuje rekordy najpierw po `plusMinusSum` malejąco, a przy remisie po `playerName` rosnąco (`localeCompare` dla `pl`).
- Comparator jest używany w dwóch niezależnych miejscach renderowania:
  1. widok „Statystyki” (admin/user),
  2. sekcja „Statystyki” w zakładce „Gry admina”.
- Dzięki temu obie tabele zawsze pokazują ten sam porządek danych, zgodnie z wymaganiem: od najwyższego `(+/-)` do najniższego.

### 16.2 Modal notatek „Podsumowanie gry”
- Dodano globalny kontroler `getSummaryNotesModalController()` (singleton), który obsługuje:
  - otwieranie modala z kontekstem konkretnej gry (`gameId`, `gameName`),
  - ustawienie `textarea`,
  - zapis (`Zapisz`) i czyszczenie (`Usuń`) notatki,
  - zamykanie (`×`, klik poza modalem, `Esc`).
- Persistencja notatki: zapis do dokumentu gry w Firestore przez update pola `notes`.
- Ten sam modal jest wykorzystywany przez:
  - `initAdminGames()` (pełny zapis),
  - `initUserGamesManager(...)` (zależnie od `canWrite`, czyli prawa edycji).

### 16.3 Ochrona fokusu i UX
- W celu uniknięcia problemu opisanego w analizie z folderu `Analizy` przyjęto model zapisu **na akcję przycisku** (`Zapisz`/`Usuń`), bez autozapisu podczas pisania.
- Dodatkowo po zamknięciu modala fokus wraca do przycisku `Notatki`, który otworzył okno (`triggerButton.focus()`), co stabilizuje nawigację klawiaturą i zapobiega „gubieniu” aktywnego elementu.

### 16.4 Struktura HTML/CSS
- `Main/index.html`: nowy modal `#summaryNotesModal` z:
  - `#summaryNotesInput` (`textarea`),
  - `#summaryNotesSave`, `#summaryNotesClear`, `#summaryNotesClose`,
  - `#summaryNotesStatus` (`aria-live`).
- `Main/styles.css`: nowe klasy wizualne:
  - `.admin-game-summary-heading` (przycisk + tytuł w jednej linii),
  - `.admin-textarea` (+ styl `:focus`) dla pola notatek.


## 17. Zmiana logiki pól liczbowych w modalu „Szczegóły gry” (Wpisowe/Wypłata)

### Zakres
Zmiana obejmuje oba miejsca użycia modala „Szczegóły gry”:
- `Gry admina` (`initAdminGames()`),
- `Gry użytkowników` (`initUserGamesManager(...)` — widok admina i użytkownika z uprawnieniem edycji).

### 17.1 Render inputów `entryFee` i `payout`
W obu implementacjach `createNumericCell(key)` usunięto mechanizm wymuszający `0` dla pustych wartości:
- usunięto warunek `requiresZeroDefault` dla `entryFee`/`payout`,
- usunięto podmianę pustego inputu na `"0"` przy renderze,
- usunięto automatyczne przywracanie `"0"` podczas `input` event.

Skutek:
- użytkownik może skasować całą zawartość pola,
- pole pozostaje puste i taka wartość jest zapisywana do dokumentu Firestore.

### 17.2 Tworzenie nowych wierszy (`Dodaj wiersz`)
W payloadzie tworzącym nowy rekord szczegółów gry:
- `entryFee` zmieniono z `"0"` na `""`,
- `payout` zmieniono z `"0"` na `""`.

Skutek:
- nowo dodane wiersze startują z pustymi polami `Wpisowe` i `Wypłata`.

### 17.3 Konsekwencje backendowe (Firestore)
- Kolekcja szczegółów gry nadal przechowuje pola jako stringi (`entryFee`, `rebuy`, `payout`, `points`).
- Po zmianie dopuszczalny jest pusty string `""` w `entryFee` i `payout`.
- Obliczenia (`+/-`, podsumowania, statystyki) pozostają stabilne, ponieważ warstwa obliczeniowa używa parserów typu `parseIntegerOrZero(...)`, które traktują pustą wartość jak `0`.

### 17.4 Kompatybilność danych historycznych
- Istniejące rekordy z wartością `"0"` działają bez zmian.
- Rekordy z pustym stringiem są poprawnie renderowane jako puste pola i poprawnie liczone w agregacjach liczbowych.

## 18. Zmiana logiki obecności gracza (Wpisowe > 0) w podsumowaniach i statystykach

### Zakres
Zmiana została wdrożona w `Main/app.js` w dwóch miejscach:
- `initUserGamesManager(...)` (podsumowanie i statystyki dla „Gry użytkowników”),
- `initAdminGames()` (podsumowanie i statystyki dla „Gry admina”).

### 18.1 Reguła obecności
Wspólna reguła biznesowa:
- gracz jest traktowany jako obecny tylko wtedy, gdy `entryFee` (Wpisowe) po normalizacji jest liczbą **większą od 0**,
- `entryFee` puste (`""`) lub `0` oznacza brak obecności w grze.

Implementacja:
- funkcja `hasCompletedEntryFee(row)` została zaostrzona;
- poza sprawdzeniem, czy wartość istnieje, dodano warunek `parseIntegerOrZero(normalized) > 0`.

### 18.2 Podsumowanie gry (tabela „Podsumowanie gry”)
W obu modułach renderujących podsumowanie:
- `getGameSummaryMetrics(gameId)` filtruje teraz wiersze do agregacji po regule obecności (`Wpisowe > 0`),
- do tabeli podsumowania nie trafiają wiersze graczy z pustym lub zerowym wpisowym,
- `pool`, `payoutSum`, `hasPayoutMismatch` i `% puli` liczone są wyłącznie na podstawie obecnych graczy.

### 18.3 Statystyki graczy
#### a) `initAdminGames()`
- `getPlayersStatistics()` już korzystało z `hasCompletedEntryFee(row)` przy zliczaniu graczy;
- po zmianie reguły funkcji, wpisowe `0` oraz puste nie są wliczane do:
  - `meetingsCount`,
  - `depositsSum`,
  - `plusMinusSum`, `payoutSum`, `pointsSum`,
  - `playedGamesPoolSum`.
- `totalPool` pozostaje spójny, ponieważ jest liczony przez `getGameSummaryMetrics(game.id).pool`, które także filtruje nieobecnych.

#### b) `initUserGamesManager(...)`
- analogicznie zaostrzono `hasCompletedEntryFee(row)` do `Wpisowe > 0`,
- dodatkowo `totalPool` i `gamePool` są liczone tylko po wierszach spełniających regułę obecności,
- dzięki temu procenty (`percentAllGames`, `percentPlayedGames`) i agregaty depozytów nie uwzględniają graczy z pustym/zerowym wpisowym.

### 18.4 Konsekwencje backendowe (Firestore)
- Schemat dokumentów **nie zmienia się**:
  - szczegóły gry nadal używają pól stringowych (`entryFee`, `rebuy`, `payout`, `points`, ...),
  - dozwolone pozostaje `entryFee: ""`.
- Zmiana dotyczy warstwy obliczeniowej po stronie frontendu (filtr obecności podczas agregacji).
- Dane historyczne są kompatybilne; jedyna zmiana to interpretacja rekordów z `entryFee = "0"` lub `""` jako nieobecnych przy podsumowaniu/statystykach.

## 19. Aktualizacja 2026-02-13 — Statystyki (PIN/uprawnienia + widoczność kolumn)

### 19.1 Zakres kodu
Zmiana została wprowadzona w `Main/app.js` i dotyczy modułów:
- `initStatisticsTab()` i `updateStatisticsVisibility()` (bramka dostępu użytkownika),
- `initAdminPlayers()` (reakcja na zmiany uprawnień graczy),
- `initStatisticsView({...})` (widoczność kolumn użytkownika i render nagłówków).

### 19.2 Ochrona dostępu do zakładki „Statystyki”
Dodano funkcję `synchronizeStatisticsAccessState()`.

Logika:
1. Jeśli aktywny jest tryb admina (`getAdminMode() === true`) — panel statystyk jest widoczny zawsze.
2. Jeśli użytkownik nie ma aktywnej sesji PIN (`getStatisticsPinGateState() === false`) — pozostaje bramka PIN.
3. Jeśli sesja PIN jest aktywna, aplikacja pobiera gracza z `sessionStorage` (`STATISTICS_PLAYER_ID_STORAGE_KEY`) i weryfikuje uprawnienie `statsTab` przez `isPlayerAllowedForTab(...)`.
4. Brak gracza lub brak uprawnienia powoduje natychmiastowe wyczyszczenie sesji (`setStatisticsPinGateState(false)`, `setStatisticsVerifiedPlayerId("")`) i ukrycie treści.

Dzięki temu odebranie uprawnienia w zakładce „Gracze” natychmiast blokuje dostęp gracza do statystyk bez przeładowania strony.

### 19.3 Synchronizacja z zakładką „Gracze”
W `initAdminPlayers()` (snapshot dokumentu `app_settings/player_access`) po odświeżeniu listy graczy wykonywane jest `synchronizeStatisticsAccessState()`.

Efekt:
- każda zmiana tablicy `players[].permissions` w Firestore wpływa od razu na aktywną sesję użytkownika w zakładce Statystyki,
- nie ma „starego” dostępu po cofnięciu uprawnienia.

### 19.4 Widoczność kolumn — admin kontra użytkownik
Konfiguracja kolumn jest nadal przechowywana per rok w `admin_games_stats/{year}.visibleColumns`.

Nowy element renderowania:
- w `initStatisticsView({...})` dodano referencję do komórek nagłówka `thead th` dla tabeli graczy,
- dla widoku użytkownika (`isAdminView === false`) każda komórka nagłówka jest pokazywana/ukrywana przez `cell.style.display` zależnie od `visibleColumns`.

Zachowanie:
- **Administrator**: zawsze pełna tabela (wszystkie kolumny), checkboxy służą tylko do konfiguracji widoku użytkownika.
- **Użytkownik**: widzi tylko kolumny z listy `visibleColumns` ustawionej przez admina.
- Gdy brak wierszy danych, `colSpan` komunikatu pustego stanu odpowiada liczbie aktualnie widocznych kolumn.

### 19.5 Dane backendowe (Firestore)
Nie zmieniono schematu dokumentu, utrzymana kompatybilność:
- kolekcja: `admin_games_stats`,
- dokument: rok (`YYYY`),
- pola:
  - `rows` — ręczne ustawienia wag i pól per gracz,
  - `visibleColumns` — `string[]` z kluczami z `STATS_COLUMN_CONFIG`.

Nie dodano migracji ani nowych kolekcji — wykorzystano istniejące pola i aktualny mechanizm `set(..., { merge: true })`.
