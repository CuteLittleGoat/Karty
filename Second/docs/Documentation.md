# Second — dokumentacja techniczna

## 1. Struktura modułu
- `Second/index.html` — nagłówek, szablon widoku użytkownika/admina oraz modal instrukcji.
- `Second/styles.css` — wspólny motyw wizualny, layout kart, tabele i style modali.
- `Second/app.js` — logika zakładek, autoryzacji admina, notatek i obsługi instrukcji.

## 2. Obsługa paska narzędzi administratora
- Przycisk odświeżania ma identyfikator `#adminPanelRefresh`.
- Komunikaty statusu odświeżania są wypisywane do `#adminPanelRefreshStatus`.
- Logika odświeżania opiera się o mapę `adminRefreshHandlers` oraz funkcję `registerAdminRefreshHandler(tabId, handler)`.
- `initAdminPanelRefresh`:
  - sprawdza, która zakładka `.admin-panel-content` jest aktywna,
  - uruchamia przypisany handler odświeżania,
  - używa komunikatów zgodnych z modułem Main:
    - `Odświeżanie danych...`,
    - `Dane zostały odświeżone.`,
    - `Nie udało się odświeżyć danych.`,
    - `Ta zakładka nie ma danych do odświeżenia.`,
    - `Nie udało się rozpoznać aktywnej zakładki.`.

## 3. Obsługa modala instrukcji (`initInstructionModal`)
- Pierwsze otwarcie pobiera markdown przez `fetch`.
- Treść jest cachowana lokalnie (`cachedText`) i nie jest pobierana ponownie przy kolejnym otwarciu.
- Modal zamyka się przez:
  - przycisk `✕`,
  - kliknięcie w tło,
  - klawisz `Escape`.
- `body.modal-open` blokuje przewijanie strony podczas otwartego modala.

## 4. Widoki i role
- Parametr `?admin=1` uruchamia panel administratora.
- Notka o pominięciu hasła admina (`#secondAdminPasswordBypassNote`) widoczna tylko w trybie admin.
- Sam przycisk instrukcji pozostaje aktywny i widoczny zawsze.

## 5. Integracja Firebase
- Firebase inicjalizowany warunkowo przez `getFirebaseApp()`.
- Zaimplementowana ochrona usuwania ostatniego dokumentu top-level collection.
- Zakładka notatek admina zapisuje dane do `admin_notes/second`.
- Dla zakładki notatek zarejestrowano handler odświeżania `registerAdminRefreshHandler("adminNotesTab", refreshNotesData)`.
- `refreshNotesData` pobiera dokument notatek z serwera (`get({ source: "server" })`), aktualizuje pole tekstowe i status sekcji notatek.

## 6. Aktualny stan wspólnych danych Firestore (Main + Second)

### 6.1. Firestore Rules
- Aktualne reguły Firestore udostępniają odczyt i zapis (`allow read, write: if true;`) dla kolekcji aplikacyjnych.
- Obejmuje to m.in. `admin_messages`, `admin_notes`, `app_settings`, `players`, `chat_messages`, `admin_games_stats`, `Tables`, `UserGames`, `calculators`, `Nekrolog_config` i `Nekrolog_snapshots`.
- Wyjątek: `Nekrolog_refresh_jobs` ma zapis ograniczony do dokumentu `latest`.

### 6.2. Najważniejsze kolekcje i pola
- `admin_notes`: dokumenty `main` i `second` z polami `module`, `text`, `updatedAt`, `updatedBy`.
- `app_settings`: m.in. dokument `player_access` z listą `players[]` i uprawnieniami (`appEnabled`, `permissions`, `statsYearsAccess`).
- `Tables` oraz `UserGames`: dokument gry + subkolekcje `rows` (wiersze wyników) i `confirmations` (potwierdzenia graczy).
- `calculators/{type}`: dane kalkulatorów oraz subkolekcje `definitions`, `placeholders`, `sessions` (w tym `variables`, `calculationFlags`, `tables/rows`, `snapshots`).
- `Nekrolog_*`: konfiguracja, snapshoty i kolejka odświeżania modułu nekrologu.
