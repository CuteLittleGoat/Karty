# Dokumentacja techniczna — Karty

## 1. Zakres aplikacji
Aplikacja działa jako front-end HTML/CSS/JS z Firebase Firestore. Ma dwa tryby:
- tryb użytkownika (domyślny),
- tryb administratora (`?admin=1`).

Najważniejsze moduły:
- zarządzanie stołami,
- wysyłanie wiadomości do graczy,
- zarządzanie listą graczy (nazwa, PIN, uprawnienia),
- kontrola dostępu do zakładki „Najbliższa gra” po PIN-ie i uprawnieniach,
- modal instrukcji.

## 2. Struktura plików
- `Main/index.html` — struktura UI i modale.
- `Main/styles.css` — pełna warstwa wizualna (kolory, fonty, siatka, formularze, modale, zakładki).
- `Main/app.js` — logika aplikacji, integracja Firestore, render tabel i walidacje.
- `docs/README.md` — instrukcja użytkownika.
- `docs/Documentation.md` — dokumentacja techniczna.
- `DetaleLayout.md` — rejestr stylów i zasad layoutu.

## 3. HTML (`Main/index.html`)
### 3.1 Główne sekcje
1. Sekcja admina **Stoły** z dynamicznie renderowanymi kartami stołów i tabelami wyników.
2. Sekcja **Panel administratora** z zakładkami:
   - `adminSettingsTab` (Wiadomość + archiwalne pole PIN),
   - `adminPlayersTab` (tabela graczy).
3. Sekcja użytkownika (`next-game-card`) z zakładkami:
   - `nextGameTab` (PIN gate + zawartość),
   - `updatesTab` (Aktualności).

### 3.2 Tabela graczy
`#adminPlayersBody` jest renderowana z JS i ma kolumny:
- Nazwa (`input` tekstowy),
- PIN (`input` numeryczny 5 znaków),
- Uprawnienia (lista badge + przycisk **Edytuj**),
- Usuń (przycisk).

### 3.3 Modal uprawnień gracza
`#playerPermissionsModal` pokazuje checkboxy dostępnych zakładek. Aktualnie lista zawiera tylko „Najbliższa gra”. Architektura jest przygotowana do rozszerzenia przez dopisanie kolejnych pozycji w tablicy `AVAILABLE_PLAYER_TABS`.

## 4. CSS (`Main/styles.css`)
### 4.1 Typografia i fonty
Fonty z Google Fonts:
- Cinzel,
- Cormorant Garamond,
- Inter,
- Rajdhani.

Tokeny fontów:
- `--font-title`, `--font-subtitle`, `--font-panel`, `--font-text`.

### 4.2 Kolory i styl
Główna estetyka: ciemne tło + złoto + zieleń neonowa + czerwony akcent błędu.
Najważniejsze tokeny:
- tło/tekst: `--bg`, `--bg2`, `--ink`, `--muted`,
- złoto: `--gold`, `--gold-line`,
- zieleń: `--neon`,
- czerwony alarmowy: `--danger`.

### 4.3 Nowe klasy związane z funkcją graczy
- `.admin-panel-tabs`, `.admin-panel-tab`, `.admin-panel-content` — zakładki w panelu administratora.
- `.admin-players`, `.players-table` — kontener i tabela graczy.
- `.permissions-tags`, `.permission-badge`, `.admin-permissions-edit` — prezentacja uprawnień i akcja edycji.
- `.permissions-list`, `.permissions-item` — lista checkboxów w modalu uprawnień.
- `.modal-card-sm` — mniejszy wariant modala dla uprawnień.
- `.admin-pin` otrzymał szarą kolorystykę (pole archiwalne).

## 5. JavaScript (`Main/app.js`) — logika i funkcje
### 5.1 Stałe
- `PIN_LENGTH = 5` — długość PIN.
- `PLAYER_ACCESS_COLLECTION = "app_settings"` i `PLAYER_ACCESS_DOCUMENT = "player_access"` — lokalizacja listy graczy w Firestore.
- `AVAILABLE_PLAYER_TABS` — słownik zakładek, które można nadać jako uprawnienia (aktualnie `nextGameTab`).

### 5.2 Stan aplikacji
- `adminTablesState` — tabele administratora i subskrypcje wierszy.
- `adminPlayersState`:
  - `players` — lista graczy,
  - `playerByPin` — mapa szybkiego wyszukiwania gracza po PIN,
  - `editingPlayerId` — gracz aktualnie edytowany w modalu.

### 5.3 Główne funkcje dostępu i PIN
- `sanitizePin(value)` — filtruje wejście do cyfr i ucina do 5 znaków.
- `isPinValid(value)` — sprawdza regex `^\d{5}$`.
- `isPlayerAllowedForTab(player, tabKey)` — sprawdza, czy gracz ma daną zakładkę w `permissions`.
- `initPinGate({ isAdmin })`:
  - pobiera wpisany PIN,
  - szuka gracza po PIN w `adminPlayersState.playerByPin`,
  - wpuszcza tylko jeśli PIN istnieje i gracz ma `nextGameTab` w uprawnieniach,
  - w przeciwnym razie pokazuje błąd „Błędny PIN lub brak uprawnień...”.

### 5.4 Funkcje panelu administratora
- `initAdminPanelTabs()` — obsługuje przełączanie zakładek „Ustawienia / Gracze”.
- `initAdminMessaging()` — wysyła wiadomość do kolekcji `admin_messages`.
- `initAdminPin()` — obsługuje archiwalne pole PIN (zapis/losowanie), które nie steruje już dostępem do „Najbliższa gra”.
- `initAdminTables()` — pełna obsługa stołów i wierszy (`Tables` + subkolekcja `rows`).
- `initAdminPlayers()`:
  - subskrybuje `app_settings/player_access`,
  - renderuje tabelę graczy,
  - blokuje duplikaty PIN (unikalność w obrębie tabeli),
  - zapisuje zmiany do Firestore,
  - otwiera modal checkboxów uprawnień,
  - usuwa i dodaje wiersze graczy.

### 5.5 Bootstrap
`bootstrap()` inicjuje moduły i przełącza klasę `is-admin` na `<body>`.

## 6. Firestore — mapowanie danych
## 6.1 Kolekcje używane przez aplikację
1. `admin_messages`
2. `Tables` (lub nazwa z `firebaseConfig.tablesCollection`) + subkolekcja `rows`
3. `app_settings` (dokumenty `next_game` i `player_access`)

## 6.2 Szczegóły pól
### `admin_messages/{docId}`
- `message` (string) — treść komunikatu.
- `createdAt` (timestamp) — czas dodania.
- `source` (string) — źródło (`web-admin`).

### `app_settings/next_game`
- `pin` (string) — archiwalny PIN po usuniętej funkcji.

### `app_settings/player_access`
- `players` (array obiektów), każdy obiekt:
  - `id` (string) — identyfikator wiersza gracza,
  - `name` (string) — nazwa gracza,
  - `pin` (string, 5 cyfr) — unikalny PIN gracza,
  - `permissions` (array stringów) — lista zakładek dostępnych dla gracza (np. `nextGameTab`).
- `updatedAt` (timestamp) — czas ostatniej zmiany listy.

### `Tables/{tableId}`
- `name`, `gameType`, `gameDate`, `createdAt`.

### `Tables/{tableId}/rows/{rowId}`
- `playerName`, `percentAllGames`, `percentPlayedGames`, `payouts`, `totalGames`, `summary`, `deposits`, `meetings`, `points`, `rebuyTotal`, `createdAt`.

## 7. Reguły działania uprawnień
- Zakładka **Aktualności** jest zawsze dostępna bez PIN.
- Zakładka **Najbliższa gra** wymaga:
  1. poprawnego PIN przypisanego do istniejącego gracza,
  2. uprawnienia `nextGameTab` w `permissions` tego gracza.
- Brak któregoś warunku kończy się komunikatem błędu.

## 8. Odtworzenie aplikacji na podstawie dokumentacji
Aby odtworzyć rozwiązanie, trzeba zaimplementować:
1. widoki HTML (admin + user + modale),
2. tokeny CSS i komponenty opisane wyżej,
3. logikę JS: render tabel, walidację PIN, kontrolę uprawnień, synchronizację Firestore,
4. kolekcje Firestore i mapowanie pól zgodnie z sekcją 6.
