# Analiza 3 — Duplikaty nazw graczy i możliwość przejścia na unikatowy znacznik (AKTUALIZACJA WDROŻENIA)

## Prompt użytkownika (oryginalny kontekst + nowe polecenie)
> Przeczytaj analizę: Analizy/Main_Analiza1_Przycisk_IloscPotwierdzonych.md
>
> Wprowadź funkcjonalność.
> Dodatkowo przeprowadź analizę i zapisz jej wyniki odnośnie punktu: "Duplikaty nazw graczy: obecny system opiera się na playerName, więc gracze o identycznych nazwach będą traktowani łącznie." - Sprawdź wszystkie miejsca w kodzie gdzie coś odnosi się do nazwy gracza i zobacz czy nie można tego zamienić na jakiś unikatowy znacznik. Sprawdź też czy obecne Firebase to umożliwia. Możesz użyć pól "Placeholder" jeżeli są potrzebne.
>
> Przeczytaj analizę: Analizy/Main_Analiza3_DuplikatyNazwGraczy_UniqatowyZnacznik.md
>
> Skoro nie trzeba nic modyfikować w Firebase to wprowadź funkcjonalność i przepnij wszystko na unikatowe id.
> Nie trzeba fallback do archiwalnych danych. Wszystko co jest obecnie traktujemy jako dane testowe. Jak się skasują to nic się nie stanie.
>
> Następnie zaktualizuj wskazaną analizę.
> Zapisz wszystko ultra-dokładnie co robisz. Którą linię kodu zmieniasz. Jaka była wcześniej. Jaka będzie po zmianie.

---

## Co zostało wdrożone
W module `Main` logika identyfikacji graczy została przepięta z `playerName` na `playerId` w obszarach:
1. statusów potwierdzeń,
2. doboru gracza w selectach i blokowania duplikatów wyboru,
3. statystyk i rankingu,
4. ręcznych wag statystyk (`admin_games_stats`),
5. kalkulatora (`table2Rows`, `table9Rows`),
6. dodawania nowych wierszy gier (`rows`).

Założenie z polecenia: brak fallbacku do historycznych rekordów bez `playerId`.

---

## Dziennik zmian (linia / było / jest)

### 1) Wspólne helpery wyboru gracza (Main/app.js)
- **Linie 301-343**
- **Było:** funkcje `getSelectedPlayerNamesForRows` i `getAvailablePlayerNamesForRow`, operacja po `playerName`.
- **Jest:** funkcje `getPlayerLabel`, `getPlayerId`, `getSelectedPlayerIdsForRows`, `getAvailablePlayersForRow` — operacja po `playerId`.
- **Efekt:** selekty graczy od teraz eliminują duplikaty na bazie ID, nie nazwy.

### 2) Ranking + mapa ręcznych wag w rankingu
- **Linie 201-207**
- **Było:** `const manualEntry = yearMap.get(statsRow.playerName) ?? {};`
- **Jest:** `const manualEntry = yearMap.get(statsRow.playerId) ?? {};`
- **Efekt:** ranking pobiera ręczne wagi po `playerId`.

### 3) Potwierdzenia gry (`confirmations`) i licznik X/Y
- **Linie 1633-1650**
- **Było:** zliczanie zapisanych/confirmed po `playerName`.
- **Jest:** zliczanie po `playerId` (`rows.playerId` i `confirmations.playerId`).
- **Efekt:** dwóch graczy o tej samej nazwie nie koliduje.

- **Linie 1652-1685**
- **Było:** `getUniquePlayerNamesFromRows`, `getConfirmedPlayersFromConfirmations` po nazwie.
- **Jest:** `getUniquePlayersFromRows` + potwierdzenia po `playerId`; `playerName` tylko do renderu.

### 4) Modale szczegółów gry (oba miejsca w pliku)
- **Obszary linii ~3276+ i ~8780+**
- **Było:**
  - `playerSelect.dataset.columnKey = "playerName"`
  - zapis update: `{ playerName: playerSelect.value }`
- **Jest:**
  - `playerSelect.dataset.columnKey = "playerId"`
  - zapis update: `{ playerId: playerSelect.value, playerName: selectedPlayer?.name ?? "" }`
- **Efekt:** zapis wiersza gry zawsze niesie ID i snapshot nazwy.

### 5) Dodawanie nowego wiersza do `rows`
- **Linie ~3502+ i ~9059+**
- **Było:** payload startowy zawierał `playerName: ""` bez `playerId`.
- **Jest:** payload zawiera `playerId: ""` oraz `playerName: ""`.
- **Efekt:** nowe rekordy są przygotowane pod model ID-first.

### 6) Lista graczy z `app_settings/player_access`
- **Linie ~3404, ~5767, ~8931**
- **Było:** `state.playerOptions` było tablicą stringów (same nazwy).
- **Jest:** `state.playerOptions` to tablica obiektów `{ id, name }`.
- **Efekt:** wszystkie selekty dostają unikatowy identyfikator i etykietę.

### 7) Kalkulator: struktura stanów
- **Linie 4475 i 4485**
- **Było:**
  - `table2Rows: [{ id, playerName, ... }]`
  - `table9Rows: [{ id, playerName, ... }]`
- **Jest:**
  - `table2Rows: [{ id, playerId, playerName, ... }]`
  - `table9Rows: [{ id, playerId, playerName, ... }]`
- **Efekt:** dane kalkulatora są kluczowane po `playerId`.

### 8) Kalkulator: normalizacja i serializacja Firestore
- **Linie 4548-4554, 4585-4588, 4625-4632, 4643-4648**
- **Było:** odczyt/zapis tylko `playerName`.
- **Jest:** odczyt/zapis `playerId` + `playerName`.
- **Efekt:** trwałość modelu ID w dokumentach `calculators/*`.

### 9) Kalkulator: select gracza w Tabela2 i Tabela9
- **Linie 5165-5187 oraz 5553-5570**
- **Było:**
  - źródło opcji po nazwie,
  - `dataset.columnKey = "playerName"`,
  - `row.playerName = playerSelect.value`.
- **Jest:**
  - źródło opcji po obiekcie `{id,name}`,
  - `dataset.columnKey = "playerId"`,
  - na change: `row.playerId = ...` i `row.playerName = selectedPlayer?.name ?? ""`.
- **Efekt:** kalkulator nie miesza graczy o tej samej nazwie.

### 10) Statystyki: serializacja ręcznych wag i agregacja
- **Linie 7361-7438**
- **Było:** `serializeManualStats` i `ensureYearMapEntry` kluczowane po `playerName`; `playersMap` też po nazwie.
- **Jest:** te same mechanizmy po `playerId` + snapshot `playerName`.
- **Efekt:** ręczne wagi i agregaty trafiają do właściwej osoby.

### 11) Statystyki: parser danych `admin_games_stats`
- **Linie 8058-8073 oraz analogiczne bloki ~6868 i ~7705**
- **Było:** parser pomijał `playerId`, mapa `yearMap.set(playerName, ...)`.
- **Jest:** parser wymaga `playerId`, mapa `yearMap.set(playerId, ...)`.
- **Efekt:** brak fallbacku dla historycznych wpisów bez ID (zgodnie z poleceniem).

### 12) Statystyki: edycja wag i live-ranking
- **Linie 8657-8715**
- **Było:**
  - `data-result-player` i `dataset.rowId` po `playerName`,
  - odczyt/zapis mapy wag po nazwie.
- **Jest:**
  - `data-result-player` i `dataset.rowId` po `playerId`,
  - odczyt/zapis mapy wag po ID.
- **Efekt:** niezależne wpisy wag i wyniki dla graczy o takich samych nazwach.

---

## Brak zmian Firebase Rules / brak migracji wymuszonej
- Nie zmieniano reguł Firebase.
- Nie robiono fallbacku i nie dodawano warstwy kompatybilności wstecz.
- Stare rekordy bez `playerId` mogą nie wejść do nowych agregacji (to było założeniem zadania).

---

## Aktualny status
- Implementacja została wykonana w kodzie modułu `Main`.
- Dokumentacja modułu `Main` (`README.md`, `Documentation.md`) została zaktualizowana pod nowy model ID.
