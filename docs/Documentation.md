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
- panel administratora (zakładki: aktualności, czat, regulamin, gracze, gry admina, statystyki, gry użytkowników, gry do potwierdzenia),
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
- Kolekcje gier rozdzielone kontekstowo (np. „gry admina”, „gry użytkowników”).
- Dokument gry zawiera m.in.:
  - `gameType`,
  - `gameDate` (format `YYYY-MM-DD`),
  - `name`,
  - `preGameNotes` (tekst notatek planistycznych „Notatki do gry”),
  - `postGameNotes` (tekst notatek rozliczeniowych „Notatki po grze”),
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


## 3.6 Aktualna struktura kolekcji Firestore (stan z Firebase Console)

Poniżej zebrana jest pełna struktura kolekcji widoczna na dostarczonych zrzutach ekranu:

- `Collection1`
  - dokument `document1`
    - pola techniczne/testowe: `field1 ... field20` (puste stringi).

- `Tables`
  - dokumenty gier (ID automatyczne, np. `3RAPSXbOk5Z7aChy94AN`)
    - pola dokumentu gry:
      - `createdAt` (timestamp),
      - `gameDate` (string `YYYY-MM-DD`),
      - `gameType` (np. `Cashout`),
      - `isClosed` (boolean),
      - `name` (nazwa stołu/gry),
      - `preGameNotes` (string),
      - `postGameNotes` (string).
    - podkolekcja:
      - `rows` (wiersze graczy dla danej gry).

- `UserGames`
  - dokumenty gier użytkowników (ID automatyczne, np. `4EsjthCu80Ody96R5k7t`)
    - pola dokumentu gry:
      - `createdAt`,
      - `createdByPlayerId`,
      - `createdByPlayerName`,
      - `gameDate`,
      - `gameType`,
      - `isClosed`,
      - `name`,
      - `preGameNotes` (string),
      - `postGameNotes` (string).
    - podkolekcje:
      - `rows`,
      - `confirmations`.

- `admin_messages`
  - dokument `admin_messages` (stały dokument nadpisywany przy każdej wysyłce)
    - pola:
      - `createdAt`,
      - `message`,
      - `source` (np. `web-admin`).

- `app_settings`
  - dokument `next_game`
    - pola:
      - `pin`.
  - dokument `player_access`
    - pole `players` (tablica obiektów):
      - `id`,
      - `name`,
      - `pin`,
      - `appEnabled`,
      - `permissions` (np. `chatTab`, `confirmationsTab`, `userGamesTab`, `nextGameTab`, `statisticsTab`).
  - dokument `rules`
    - treść regulaminu używana w UI.

- `chat_messages`
  - dokumenty wiadomości czatu
    - pola:
      - `authorId`,
      - `authorName`,
      - `createdAt`,
      - `expireAt`,
      - `source`,
      - `text`.

- `players`
  - dokument `players`
    - pola statystyczne i placeholdery historyczne (m.in. `Name`, `Cash`, `GamesPlayed`, `GamesWon`, `MoneySpend`, `MoneyWon`, `Placeholder1...`).

- `admin_games_stats` (używana przez moduł Statystyki w kodzie)
  - dokumenty roczne (`{year}`)
    - pola:
      - `rows` (tablica pozycji graczy),
      - `visibleColumns` (tablica nazw kolumn widocznych dla użytkownika).

## 3.7 Aktualne Firestore Rules (zaktualizowany stan z Firebase)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /admin_messages/{docId} {
      allow read, write: if true;
    }

    match /app_settings/{docId} {
      allow read, write: if true;
    }

    match /Tables/{tableId} {
      allow read, write: if true;

      match /rows/{rowId} {
        allow read, write: if true;
      }

      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /UserGames/{gameId} {
      allow read, write: if true;

      match /rows/{rowId} {
        allow read, write: if true;
      }

      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /Collection1/{docId} {
      allow read, write: if true;
    }

    match /chat_messages/{docId} {
      allow read, write: if true;
    }

    // zapis statystyk rocznych (checkboxy kolumn)
    match /admin_games_stats/{year} {
      allow read, write: if true;
    }

    // kolekcja legacy/statyczna
    match /players/{docId} {
      allow read, write: if true;
    }
  }
}
```

## 3.8 Wpływ aktualizacji Rules na moduły aplikacji

Po dodaniu jawnych reguł dla kolekcji `admin_games_stats` i `players`:
- moduł Statystyki może zapisywać konfigurację widocznych kolumn (`visibleColumns`) bez błędów `permission-denied`,
- odczyt/zapis danych legacy w `players` pozostaje spójny z aktualnym schematem,
- opis struktury Firestore i polityki dostępu w dokumentacji jest spójny.

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
- odświeża dane aktualności przez odczyt stałego dokumentu `admin_messages/admin_messages`,
- zapisuje wiadomość administracyjną przez `set()` do stałego dokumentu `admin_messages/admin_messages` (bez historii),
- publikuje aktualność do widoku użytkownika.

`initLatestMessage()`:
- nasłuchuje zmian dokumentu `admin_messages/admin_messages`,
- gdy dokument nie istnieje, pokazuje tekst `Brak wiadomości od administratora.`,
- gdy dokument istnieje, wyświetla pole `message` jako aktualne `Najnowsze`.

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

## 6.6 Gry admina
`initAdminGames()`:
- lista lat,
- filtrowanie gier po roku,
- modal szczegółów,
- edycja danych finansowych i punktowych,
- przeliczanie podsumowań i rankingów,
- render sekcji „Podsumowanie gry” zawiera metadane gry w kolejności: ostrzeżenie o rozbieżnościach (jeśli wystąpi), **Rodzaj gry**, **Pula**, następnie tabela graczy.

## 6.7 Gry użytkowników (admin)
`initAdminUserGames()`:
- wykorzystuje wspólną logikę menedżera,
- daje adminowi pełen podgląd i kontrolę zgłoszeń,
- renderuje w „Podsumowanie gry” ten sam układ metadanych co „Gry admina” (Rodzaj gry nad Pulą).

## 6.8 Gry do potwierdzenia
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
> Sekcja historyczna: aktualna logika notatek (rozdzielenie na `preGameNotes`/`postGameNotes`) jest opisana w rozdziale **21**.
- Wspólny kontroler `getSummaryNotesModalController()` (singleton) obsługuje:
  - otwieranie modala z kontekstem (`gameId`, `gameName`),
  - ustawianie wartości `textarea`,
  - zapis (`Zapisz`) i przywracanie szablonu (`Domyślne`),
  - zamykanie (`×`, klik poza modalem, `Esc`).
- Dodano stałą `DEFAULT_GAME_NOTES_TEMPLATE`:
  - `Przewidywani gracze:`
  - `Rebuy:`
  - `Addon:`
  - `Inne:`
- Gdy pole `notes` jest puste, modal automatycznie podstawia szablon domyślny.
- Persistencja: update pola `notes` w dokumencie gry (`Tables`/`UserGames`).
- Ten sam modal jest używany w 4 miejscach:
  - podsumowanie gry (`initAdminGames()`),
  - podsumowanie gry (`initUserGamesManager(...)`),
  - tabela gier przy kolumnie `Nazwa` (`Gry admina` / `Gry użytkowników`),
  - `initUserConfirmations()` w trybie read-only (`canWrite: false`).

### 16.3 Ochrona fokusu i UX
- Zachowano model zapisu wyłącznie po akcji użytkownika (`Zapisz`/`Domyślne`), bez autozapisu podczas pisania.
- Dzięki temu nie występuje re-render wymuszany co znak i nie pojawia się regresja utraty fokusu.
- Po zamknięciu modala fokus wraca do przycisku otwierającego (`triggerButton.focus()`).

### 16.4 Struktura HTML/CSS
- `Main/index.html`: modal `#summaryNotesModal` zawiera:
  - `#summaryNotesInput` (`textarea`),
  - `#summaryNotesSave`, `#summaryNotesClear`, `#summaryNotesClose`,
  - `#summaryNotesStatus` (`aria-live`).
- Etykieta czerwonego przycisku została zmieniona z `Usuń` na `Domyślne`.
- `Main/styles.css`: wykorzystano istniejące klasy wizualne (`secondary`, `danger`, `.admin-textarea`, `.admin-game-summary-heading`) bez dodawania nowych tokenów kolorystycznych.

### 16.5 Inicjalizacja notatek podczas dodawania gry
- W obu miejscach tworzenia gry (`initAdminGames()` i `initUserGamesManager(...)`) nowy dokument gry otrzymuje od razu:
  - `notes: DEFAULT_GAME_NOTES_TEMPLATE`.
- Efekt: każda nowa gra ma gotową strukturę notatki niezależnie od tego, czy pierwszy raz otwieramy notatki z tabeli czy z podsumowania.


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

## 21. Aktualizacja 2026-02-13 — Statystyki: spójność „Strefa Gracza”, trwałość kolumn i zamiana etykiet

### 21.1 Spójność działania „Strefa Gracza” w trybie admin (`?admin=1`)
W `Main/app.js` usunięto wyjątek, który omijał bramkę PIN dla zakładki `statsTab`, gdy aplikacja działała w admin mode.

Zmiany techniczne:
- `updateStatisticsVisibility()` nie traktuje już `getAdminMode()` jako bypassu PIN dla dolnej sekcji „Strefa Gracza”.
- `synchronizeStatisticsAccessState()` działa tak samo niezależnie od parametru `?admin=1`.
- W `initUserTabs()` reset sesji `statsTab` wykonuje się zawsze po wejściu w zakładkę (również w trybie admin), co wymusza testowanie ścieżki identycznej jak u użytkownika.

Efekt:
- „Strefa Gracza” jest funkcjonalnie 1:1 z widokiem bez `?admin=1`.

### 21.2 Trwałość i odtwarzanie stanu checkboxów kolumn Statystyk
W `initStatisticsView(...)` (gałąź `isAdminView`) dodano mapę referencji do checkboxów kolumn (`adminColumnVisibilityCheckboxes`) i synchronizację ich stanu przy każdym `renderStats()`.

Mechanizm:
1. Snapshot z `admin_games_stats/{year}.visibleColumns` ładuje konfigurację kolumn per rok do `state.visibleColumnsByYear`.
2. `renderStats()` odczytuje aktywny rok i ustawia `checkbox.checked` zgodnie z `getVisibleColumnsForYear(state.selectedYear)`.
3. Zmiana checkboxa zapisuje konfigurację przez `persistYearConfig(year)` do Firestore (`set(..., { merge: true })`).

Efekt:
- po restarcie aplikacji checkboxy i widoczność kolumn wracają do zapisanej konfiguracji,
- konfiguracja jest niezależna per rok.

### 21.3 Zamiana nazw kolumn procentowych (bez zmiany obliczeń)
W `STATS_COLUMN_CONFIG` zamieniono wyłącznie etykiety:
- `percentAllGames`: z „% Wszystkich gier” na „% Rozegranych gier”,
- `percentPlayedGames`: z „% Rozegranych gier” na „% Wszystkich gier”.

Równolegle zaktualizowano nagłówki HTML tabel:
- `Gry admina -> Statystyki`,
- `Admin -> zakładka Statystyki`,
- `Strefa Gracza -> Statystyki`.

Formuły obliczeń pozostają bez zmian:
- `percentAllGames = ceil(payoutSum / playedGamesPoolSum * 100)`,
- `percentPlayedGames = ceil(payoutSum / totalPool * 100)`.

### 21.4 Backend/Firebase
Nie była wymagana migracja schematu Firestore.

Nadal wykorzystywany jest dokument per rok:
- kolekcja: `admin_games_stats`,
- dokument: `{year}`,
- pola: `rows`, `visibleColumns`.

Zmiana dotyczy wyłącznie poprawnego odtwarzania i prezentacji już zapisywanego pola `visibleColumns`.

## 22. Aktualizacja 2026-02-13 — Statystyki: trwałe checkboxy kolumn i nowy domyślny zestaw widoczności

### 22.1 Zakres kodu
Zmiany wdrożono w `Main/app.js` w obrębie:
- definicji konfiguracji kolumn statystyk (`STATS_COLUMN_CONFIG`),
- funkcji `getVisibleColumnsForYear(year)`,
- snapshotu `admin_games_stats` w `initStatisticsView(...)`,
- handlera `change` checkboxów `.stats-column-visibility-checkbox`.

### 22.2 Nowy domyślny zestaw kolumn
Dodano stałą:
- `DEFAULT_VISIBLE_STATS_COLUMNS = STATS_COLUMN_CONFIG.filter((column) => !column.weight).map((column) => column.key)`.

Znaczenie:
- domyślnie widoczne są tylko kolumny nieoznaczone jako `weight`,
- kolumny `Waga1..Waga7` (gdzie `weight: true`) są domyślnie ukryte.

### 22.3 Poprawa logiki odtwarzania stanu (`[]` jako poprawna konfiguracja)
W `getVisibleColumnsForYear(year)` usunięto traktowanie pustej tablicy jako „braku danych”.

Nowa logika:
1. `stored` nie jest tablicą → zwracane `DEFAULT_VISIBLE_STATS_COLUMNS`,
2. `stored` jest tablicą (również pustą) → zwracana przefiltrowana lista po znanych kluczach.

Skutek:
- zapis `visibleColumns: []` jest trwały i nie resetuje się do domyślnego „wszystko widoczne”.

### 22.4 Migracja danych legacy podczas snapshotu
W snapshotcie kolekcji `admin_games_stats`:
- jeżeli dokument roku nie ma tablicy `visibleColumns`, runtime ustawia fallback na `DEFAULT_VISIBLE_STATS_COLUMNS`,
- rok jest dopisywany do listy `missingVisibilityConfigYears`,
- wykonywany jest zapis naprawczy `set({ visibleColumns: DEFAULT_VISIBLE_STATS_COLUMNS }, { merge: true })`.

Skutek:
- starsze dokumenty bez pola `visibleColumns` są automatycznie ujednolicane,
- nowe wymaganie domyślne obowiązuje spójnie dla istniejących lat.

### 22.5 Obsługa błędu zapisu checkboxów
W handlerze `checkbox.addEventListener("change", ...)`:
- zapis `persistYearConfig(state.selectedYear)` otrzymał `.catch(...)`,
- w przypadku błędu wyświetlany jest status: „Nie udało się zapisać widoczności kolumn. Spróbuj ponownie.”

Skutek:
- brak cichego błędu UI przy niedostępnym zapisie.

### 22.6 Backend / Firestore
Nadal używany jest ten sam model danych:
- kolekcja: `admin_games_stats`,
- dokument: `{year}`,
- pole `visibleColumns: string[]`.

Zmiana backendowa dotyczy wyłącznie semantyki wartości domyślnej i migracji brakującego pola:
- brak `visibleColumns` => automatyczny zapis domyślnej listy bez wag,
- obecność `visibleColumns: []` => respektowanie pustej konfiguracji jako ważnego stanu biznesowego.

## 23. Aktualizacja 2026-02-13 — Ograniczenie lat statystyk per gracz (Opcja 1: dedykowany modal)

### 23.1 Zakres zmian w kodzie
Zmiany wdrożono w:
- `Main/app.js` (logika danych, renderowanie uprawnień, filtrowanie lat, synchronizacja widoku użytkownika),
- `Main/index.html` (nowy modal `Lata statystyk`),
- `Main/styles.css` (styl przycisku `Lata` w wierszu uprawnień).

### 23.2 Rozszerzenie modelu danych gracza
Dodano normalizację pola:
- `statsYearsAccess: number[]`

Nowe helpery:
- `normalizeStatsYearsAccess(statsYearsAccess)` — normalizuje i sortuje lata malejąco,
- `normalizePlayerRecord(player, index)` — ujednolica rekord gracza i zawsze dopisuje `statsYearsAccess`,
- `getAllowedStatisticsYearsForPlayer(player, availableYears)` — zwraca przecięcie:
  - lat istniejących w danych gier,
  - lat przypisanych graczowi.

### 23.3 Logika „wariant A” dla pustej listy lat
Zastosowano wariant bezpieczeństwa:
- `statsTab = true` + `statsYearsAccess = []` => brak dostępu do danych statystyk (brak lat po lewej stronie + komunikat w UI).

### 23.4 Nowy workflow administracyjny (modal „Lata statystyk”)
W `initAdminPlayers()` dodano:
1. Pobieranie elementów nowego modala (`#playerStatsYearsModal`, `#playerStatsYearsList`, `#playerStatsYearsStatus`).
2. Funkcje:
   - `openYearsModal()`
   - `closeYearsModal()`
   - `renderStatsYearsPermissions()`
3. Integrację z istniejącym modalem uprawnień:
   - przy opcji `Statystyki` renderowany jest przycisk `Lata`,
   - kliknięcie `Lata` otwiera modal checkboxów lat,
   - zmiana checkboxa aktualizuje `player.statsYearsAccess` i zapisuje rekord do Firestore.
4. Dynamiczne źródło lat:
   - nasłuch `onSnapshot` kolekcji gier (`getGamesCollectionName()`),
   - lata budowane z `gameDate` przez `extractYearFromDate(...)` i `normalizeYearList(...)`.

### 23.5 Zmiany w tabeli graczy (admin)
W wizualizacji badge uprawnień:
- dla `statsTab` prezentowany jest licznik przypisanych lat,
- format: `Statystyki (X lat)`.

W tworzeniu nowego gracza domyślnie ustawiane jest:
- `statsYearsAccess: []`.

### 23.6 Filtrowanie lat w widoku „Strefa Gracza” → „Statystyki”
W `initStatisticsView(...)` dodano:
- `getCurrentVisibleYears()`:
  - admin: wszystkie lata z danych gier,
  - użytkownik: tylko lata z `getAllowedStatisticsYearsForPlayer(...)`.
- aktualizację `synchronizeYears()` tak, by zawsze bazować na liście dozwolonych lat.

Efekty:
- panel lat po lewej stronie pokazuje wyłącznie lata dozwolone dla zweryfikowanego gracza,
- `selectedYear` automatycznie przełącza się na pierwszy dostępny rok,
- eksport XLSX działa tylko dla roku, który pozostał w dozwolonej liście.

### 23.7 Synchronizacja zmian uprawnień podczas aktywnej sesji
Dodano event aplikacyjny:
- `statistics-access-updated`

Emitowanie eventu następuje po:
- poprawnej weryfikacji PIN w zakładce Statystyki,
- zmianie listy graczy/uprawnień z Firestore,
- synchronizacji stanu dostępu (np. utrata uprawnienia).

Widok użytkownika (`isAdminView=false`) nasłuchuje event i wywołuje `synchronizeYears()`, dzięki czemu lista lat i wybrany rok odświeżają się bez restartu aplikacji.

### 23.8 Zmiana backendowa (Firestore)
Dokument:
- kolekcja: `app_settings`
- dokument: `player_access`
- pole: `players[]`

Rozszerzenie obiektu `players[]`:
- `statsYearsAccess: number[]`

Zapis wykonywany przez istniejący `savePlayers()` (`set(..., merge domyślny dla całego dokumentu graczy)`).

Brak nowej kolekcji i brak migracji krytycznej:
- starsze rekordy bez `statsYearsAccess` są normalizowane do pustej tablicy.

## 24. Aktualizacja 2026-02-13 — rozdzielenie notatek na „do gry” i „po grze”

### 24.1 Zakres zmiany
- Przycisk przy sekcji **Tworzenie gier** (kolumna `Nazwa`) ma etykietę **„Notatki do gry”**.
- Przycisk przy sekcji **Podsumowanie gry** ma etykietę **„Notatki po grze”**.
- W widoku **Gry do potwierdzenia** przycisk podglądu notatek ma etykietę **„Notatki do gry”** i działa tylko w trybie read-only.

### 24.2 Model danych
- Zastosowano dwa niezależne pola dokumentu gry:
  - `preGameNotes` — notatki planistyczne,
  - `postGameNotes` — notatki po zakończeniu gry.
- Usunięto fallback do legacy pola `notes` — odczyt działa wyłącznie na `preGameNotes` oraz `postGameNotes`.
- Nowo dodawana gra otrzymuje:
  - `preGameNotes: DEFAULT_GAME_NOTES_TEMPLATE`,
  - `postGameNotes: ""`.

### 24.3 Modal notatek
- `getSummaryNotesModalController()` przyjmuje parametry kontekstowe:
  - `notesLabel`,
  - `clearButtonLabel`,
  - `clearToDefault`,
  - `readOnlyMessage`,
  - `textareaPlaceholder`.
- Tryby działania:
  1. **Notatki do gry**: czerwony przycisk `Domyślne` przywraca szablon.
  2. **Notatki po grze**: czerwony przycisk `Usuń` czyści treść do pustego stringa.

### 24.4 Integracje
- `initUserGamesManager(...)` i `initAdminGames()`:
  - notatki „do gry” są obsługiwane w tabeli gier,
  - notatki „po grze” są obsługiwane w podsumowaniu gry.
- `initUserConfirmations()`:
  - odczytuje notatki „do gry” bez możliwości edycji.

### 24.5 Firebase / Firestore Rules
- Aktualne Rules (`allow read, write: if true;` dla `Tables` i `UserGames`) obejmują zapis i odczyt pól `preGameNotes` i `postGameNotes`.
- Przy każdym zapisie notatek aplikacja usuwa legacy pole `notes` (`FieldValue.delete()`), a dodatkowo uruchamia automatyczne czyszczenie `notes` po wykryciu tego pola w snapshotach list gier.
- Wniosek: **nie jest wymagana nowa konfiguracja Firebase ani zmiana Rules** do wdrożenia tej funkcji.

## Aktualizacja techniczna 2026-02-13 — eliminacja podwójnego promptu wag w „Statystyki”

### Zakres zmian
Modyfikacja została wykonana w `Main/app.js`, w module `initAdminGames()`.

### Przyczyna błędu
- W `initAdminGames()` selektor przycisków wag był globalny: `.admin-weight-bulk-button`.
- Ta klasa występuje zarówno w tabeli:
  - **Gry admina → Statystyki**,
  - jak i **Statystyki** (zakładka administracyjna).
- Dodatkowo `initStatisticsView({... isAdminView: true ...})` rejestrował własne nasłuchiwanie kliknięcia dla przycisków wag w zakładce **Statystyki**.
- Skutek: kliknięcie przycisku `Waga1..Waga7` w zakładce **Statystyki** uruchamiało dwa handlery i dwa kolejne `window.prompt(...)`.

### Implementacja poprawki
- W `initAdminGames()` pobierana jest referencja do tabeli sekcji **Gry admina** przez:
  - `playersStatsBody.closest("table")`.
- Lista przycisków wag jest od teraz tworzona wyłącznie w obrębie tej tabeli:
  - `adminGamesPlayersStatsTable?.querySelectorAll(".admin-weight-bulk-button") ?? []`.

### Efekt funkcjonalny
- Przycisk `Waga1..Waga7` w zakładce **Statystyki** ma już tylko jeden aktywny handler (ten z `initStatisticsView`).
- Jedno kliknięcie powoduje jedno wywołanie `window.prompt(...)`.
- Zachowanie przycisków `Waga1..Waga7` w **Gry admina** pozostaje niezmienione.

## 25. Aktualizacja 2026-02-13 — punkty bez wpisowego w „Gry admina” i „Gry użytkowników”

### 25.1 Cel zmiany
Wcześniej logika uwzględniała gracza w podsumowaniach/statystykach głównie przy spełnieniu warunku `Wpisowe > 0`.
Po zmianie gracz jest brany do obliczeń, gdy spełni **co najmniej jeden** warunek:
1. ma dodatnie `Wpisowe`,
2. ma uzupełnione pole `Punkty` (w tym wartości ujemne).

### 25.2 Implementacja w kodzie (`Main/app.js`)
Wprowadzono wspólną regułę logiczną `hasIncludedSummaryOrStatsData(row)` w trzech modułach odpowiadających za:
- podsumowanie i statystyki w „Gry użytkowników”,
- statystyki roczne z wagami,
- podsumowanie i statystyki w „Gry admina”.

Reguła:
- normalizuje `entryFee` i `points` przez `sanitizeIntegerInput`,
- traktuje `entryFee` jako istotne tylko przy wartości dodatniej (`> 0`),
- traktuje `points` jako istotne, gdy pole nie jest puste i nie jest samym znakiem `-`,
- zwraca `true` dla `hasEntryFee || hasPoints`.

### 25.3 Miejsca użycia reguły
1. **Podsumowanie gry** (`getGameSummaryMetrics`) — filtruje wiersze źródłowe przed budową tabeli podsumowania.
2. **Statystyki** (`getPlayersStatistics`) — filtruje:
   - pulę wpłat (`totalPool`, `gamePool`),
   - listę uczestników i agregaty per gracz (`pointsSum`, `plusMinusSum`, `depositsSum`, `meetingsCount`).
3. Obliczanie **Wyników** (`getComputedResultValue`) pozostaje bez zmiany wzoru, ale dostaje pełniejsze dane wejściowe (np. punkty ujemne bez wpisowego), co wpływa na ranking.

### 25.4 Efekt funkcjonalny
- Gracz z pustymi polami finansowymi i wpisanymi punktami pojawia się w:
  - tabeli „Podsumowanie gry”,
  - tabeli „Statystyki”,
  - rankingu zależnym od „Wyniki”.
- Ujemne punkty realnie obniżają wynik końcowy gracza przez składnik `pointsSum * weight3`.
- Wiersze z całkowicie pustymi danymi (brak dodatniego wpisowego i brak punktów) nadal nie są uwzględniane.

### 25.5 Backend / dane
- Nie zmieniono schematu dokumentów Firestore.
- Wykorzystywane są istniejące pola szczegółów gry:
  - `entryFee`,
  - `rebuy`,
  - `payout`,
  - `points`,
  - `championship`.
- Zmiana dotyczy wyłącznie warunku kwalifikacji wiersza do obliczeń po stronie frontendu.

## 26. Aktualizacja 2026-02-13 — reguła „uzupełnione Wpisowe” dla kolumn `Ilość Spotkań` i `Suma z rozegranych gier`

### 26.1 Cel zmiany
Doprecyzowano sposób liczenia dwóch kolumn statystycznych (wspólnych dla:
- sekcji **Gry admina → Statystyki**,
- widoku **Statystyki**).

Nowa zasada:
- gra jest liczona do `meetingsCount` i `playedGamesPoolSum` tylko wtedy, gdy gracz ma **uzupełnione** pole `entryFee` (`Wpisowe`) w szczegółach gry.

Samo zapisanie gracza do gry bez wartości w `entryFee` nie kwalifikuje gry do tych dwóch agregatów.

### 26.2 Implementacja (`Main/app.js`)
W dwóch niezależnych modułach statystyk dodano atrybut pochodny `hasCompletedEntryFee` podczas normalizacji wierszy `getDetailRows(gameId)`:
- wartość oparta o `sanitizeIntegerInput(...)` dla surowego `row.entryFee`,
- `true` gdy pole po normalizacji nie jest puste i nie jest samym `"-"`.

Następnie w `getPlayersStatistics()`:
1. `meetingsCount` jest inkrementowane tylko przy `hasCompletedEntryFee === true`.
2. `playedGamesPoolSum` dodaje `gamePool` tylko gdy:
   - gracz ma `hasCompletedEntryFee === true`,
   - i nie został jeszcze policzony dla tej gry (zachowany mechanizm `Set`, aby uniknąć podwójnego doliczenia).

Pozostałe agregaty (`pointsSum`, `plusMinusSum`, `payoutSum`, `depositsSum`) pozostają liczone według dotychczasowej reguły kwalifikacji wiersza (`hasIncludedSummaryOrStatsData`).

### 26.3 Zakres i kompatybilność
- Brak zmian w HTML/CSS i brak zmian układu kolumn.
- Brak zmian schematu Firestore (frontend-only logic change).
- Brak migracji danych.

### 26.4 Efekt funkcjonalny
- `Ilość Spotkań` odzwierciedla wyłącznie gry z uzupełnionym `Wpisowe` dla danego gracza.
- `Suma z rozegranych gier` dodaje `Pula` tylko z gier spełniających powyższy warunek.
- Tabele w **Gry admina** i **Statystyki** pozostają spójne, bo korzystają z tej samej logiki obliczeń.

## 24. Statystyki: roczny ranking po prawej stronie + wspólna logika z „Gry admina”

### 24.1 Zmiany w HTML (`Main/index.html`)
- W `#adminStatisticsTab` dodano prawy sidebar rankingu (`.admin-games-ranking-sidebar`) z tabelą `#adminStatisticsRankingBody`.
- W `#statsTab` (widok użytkownika) dodano analogiczny prawy sidebar z tabelą `#statisticsRankingBody`.
- Obie tabele używają tego samego układu kolumn: `Miejsce`, `Gracz`, `Wynik`.

### 24.2 Ujednolicenie logiki obliczeń (`Main/app.js`)
Wprowadzono współdzielone funkcje używane przez oba moduły (Statystyki i Gry admina):
- `getDefaultStatsManualFieldValue(...)` — domyślne wartości wag (`1`) i normalizacja ręcznych pól.
- `getComputedStatsResultValue(...)` — wspólny wzór na pole `Wynik`.
- `sortRankingRowsByResult(...)` — jednolite sortowanie rankingu (malejąco po wyniku, potem alfabetycznie po graczu).
- `buildRankingRowsFromStatistics(...)` — budowanie listy rankingowej z tych samych statystyk i tych samych wag rocznych.
- `renderRankingTable(...)` — wspólny renderer tabeli rankingu z tym samym kolorowaniem stref miejsc.

Efekt: dane i kolejność rankingu są spójne pomiędzy zakładkami **Statystyki** i **Gry admina**.

### 24.3 Powiązanie rankingu z rokiem
- `initStatisticsView(...)` przyjmuje teraz `rankingBodySelector` i renderuje ranking dla aktualnie wybranego roku (`state.selectedYear`).
- Po każdej zmianie roku, danych gier, szczegółów wierszy i wag ranking jest przeliczany ponownie dla tego samego roku.

### 24.4 Ograniczenia lat po stronie użytkownika
- Widok użytkownika nadal korzysta z filtracji lat przez uprawnienia gracza (`statsYearsAccess` mapowane z kolumny Uprawnienia w module Gracze).
- Ranking użytkownika jest renderowany wyłącznie dla lat widocznych/dostępnych w tym widoku.

### 24.5 Backend i źródło danych
- Ranking pobiera dane wejściowe z tych samych źródeł co statystyki i „Gry admina”:
  - kolekcja gier (`Tables` / kolekcja skonfigurowana),
  - podkolekcja `rows` z danymi graczy,
  - kolekcja `admin_games_stats` (wagi ręczne `weight1..weight7` na dokument roku).
- Dzięki temu nie powstaje osobna, niezależna ścieżka obliczeń rankingu.
