# Dokumentacja techniczna — Karty

## 1. Zakres aplikacji
Aplikacja to front-end HTML/CSS/JS z Firebase Firestore, działający w dwóch trybach:
- tryb użytkownika (domyślny),
- tryb administratora (`?admin=1`).

Najważniejsze moduły:
- panel administratora z zakładkami: Aktualności, Gracze, Turnieje, Statystyki,
- edycja turniejów (dawna funkcja „Stoły”),
- wysyłanie wiadomości do graczy,
- zarządzanie graczami (nazwa, PIN, uprawnienia),
- kontrola dostępu do zakładki „Najbliższa gra” po PIN i uprawnieniach,
- modal instrukcji.

## 2. Struktura plików
- `Main/index.html` — struktura widoków admin/user i modali.
- `Main/styles.css` — warstwa wizualna: layout, typografia, komponenty, responsive.
- `Main/app.js` — logika UI, Firestore, render list i walidacja danych.
- `docs/README.md` — instrukcja użytkownika (klik po kliku).
- `docs/Documentation.md` — dokumentacja techniczna.
- `DetaleLayout.md` — katalog stylów, fontów, kolorów i zasad layoutu.

## 3. HTML (`Main/index.html`)
### 3.1 Układ widoku administratora
1. Nagłówek z tekstami:
   - „TO NIE JEST nielegalny poker”,
   - „TO NIE JEST nielegalne kasyno”.
2. Przycisk `#adminInstructionButton` („Instrukcja”).
3. Sekcja `.admin-panel-card` na pełną szerokość (`grid-column: 1 / -1`) z tytułem **Panel Administratora**.
4. Zakładki panelu admina (`.admin-panel-tabs`):
   - `adminNewsTab` (Aktualności),
   - `adminPlayersTab` (Gracze),
   - `adminTournamentsTab` (Turnieje),
   - `adminStatsTab` (Statystyki).
5. Karta gracza `.next-game-card` pozostaje na dole strony i zawiera podgląd „Strefa gracza”.

### 3.2 Zawartość zakładek panelu admina
- **Aktualności (`#adminNewsTab`)**: sekcja „Wiadomość do graczy” z textarea `#adminMessageInput`, przyciskiem `#adminMessageSend` i statusem `#adminMessageStatus`.
- **Gracze (`#adminPlayersTab`)**: tabela z `#adminPlayersBody`, przyciskiem `#adminAddPlayer` i statusem `#adminPlayersStatus`.
- **Turnieje (`#adminTournamentsTab`)**: przeniesiona funkcjonalność dawnych „Stołów”, elementy:
  - `#adminAddTable`,
  - `#adminTablesStatus`,
  - `#adminTablesList`,
  - podsumowanie `#summaryGameCount`, `#summaryTotalPool`.
- **Statystyki (`#adminStatsTab`)**: placeholder tekstowy „do zrobienia później”.

### 3.3 Usunięte elementy
Usunięto segment administracyjny „PIN do zakładki ‘Najbliższa gra’” (UI + logika `initAdminPin`).

## 4. CSS (`Main/styles.css`)
### 4.1 Fonty i typografia
Google Fonts:
- Cinzel,
- Cormorant Garamond,
- Inter,
- Rajdhani.

Tokeny:
- `--font-title`, `--font-subtitle`, `--font-panel`, `--font-text`.

### 4.2 Kolory i estetyka
Casino/noir:
- tła: `--bg`, `--bg2`,
- tekst: `--ink`, `--muted`,
- akcent złoty: `--gold`, `--gold-line`,
- akcent neon: `--neon`,
- danger: `--danger`.

### 4.3 Klasy kluczowe po przebudowie
- `.admin-panel-card` — główny panel administratora na pełną szerokość strony.
- `.admin-panel-tabs`, `.admin-panel-tab`, `.admin-panel-content` — mechanika i wygląd zakładek.
- `.admin-tournaments` — kontener funkcji turniejowych (dawnych stołów) wewnątrz zakładki.
- `.admin-stats-placeholder` — wizualny placeholder dla modułu statystyk.
- usunięto style `.admin-pin*`.

## 5. JavaScript (`Main/app.js`)
### 5.1 Stałe i dane
- `PIN_LENGTH = 5` — długość PIN.
- `PLAYER_ACCESS_COLLECTION = "app_settings"`, `PLAYER_ACCESS_DOCUMENT = "player_access"` — lokalizacja danych graczy.
- `AVAILABLE_PLAYER_TABS` — obecnie zawiera tylko `nextGameTab` („Najbliższa gra”).
- `TABLES_COLLECTION` i powiązane stałe — konfiguracja turniejów/stołów.

### 5.2 Obsługa zakładek admina
`initAdminPanelTabs()`:
- nasłuchuje kliknięcia `.admin-panel-tab`,
- aktywuje panel przez zgodność `data-target` z `id` kontenera `.admin-panel-content`,
- domyślnie aktywny panel ustawiany jest w HTML przez klasy `is-active` (Aktualności).

### 5.3 Moduł Aktualności
`initAdminMessaging()`:
- waliduje niepustą wiadomość,
- zapisuje dokument do kolekcji `admin_messages` (`message`, `createdAt`, `source`),
- czyści pole i aktualizuje status.

`initLatestMessage()`:
- nasłuchuje najnowszej wiadomości (`orderBy createdAt desc`, `limit 1`),
- renderuje ją w `#latestMessageOutput` po stronie gracza.

### 5.4 Moduł Gracze
`initAdminPlayers()`:
- subskrypcja `app_settings/player_access`,
- normalizacja graczy (`id`, `name`, `pin`, `permissions`),
- render tabeli, edycja pól, usuwanie i dodawanie,
- kontrola unikalności PIN,
- modal uprawnień na bazie `AVAILABLE_PLAYER_TABS`.

### 5.5 Moduł Turnieje
`initAdminTables()`:
- zarządza listą turniejów (kolekcja `Tables` lub nazwa z configu),
- obsługuje dodawanie/usuwanie turniejów,
- obsługuje dodawanie/usuwanie i edycję wierszy `rows`,
- liczy podsumowanie (`Suma Gier`, `Łączna pula`).

### 5.6 Dostęp PIN w widoku gracza
`initPinGate({ isAdmin })` + funkcje pomocnicze:
- sprawdza 5-cyfrowy PIN,
- mapuje PIN do gracza (`adminPlayersState.playerByPin`),
- wymaga uprawnienia `nextGameTab`.

### 5.7 Bootstrap
`bootstrap()` uruchamia moduły w kolejności:
1. tryb admin (`is-admin`),
2. zakładki admina,
3. zakładki użytkownika,
4. wiadomości admin,
5. turnieje,
6. gracze,
7. gate PIN użytkownika,
8. aktualności użytkownika,
9. modal instrukcji.

## 6. Firestore — mapowanie danych
### 6.1 Kolekcje
1. `admin_messages`
2. `Tables` + subkolekcja `rows`
3. `app_settings/player_access`

### 6.2 Schemat dokumentów
`admin_messages/{docId}`:
- `message` (string),
- `createdAt` (timestamp),
- `source` (string).

`app_settings/player_access`:
- `players` (array):
  - `id`,
  - `name`,
  - `pin` (5 cyfr),
  - `permissions` (np. `nextGameTab`).
- `updatedAt` (timestamp).

`Tables/{tableId}`:
- `name`, `gameType`, `gameDate`, `createdAt`.

`Tables/{tableId}/rows/{rowId}`:
- `playerName`, `percentAllGames`, `percentPlayedGames`, `payouts`, `totalGames`, `summary`, `deposits`, `meetings`, `points`, `rebuyTotal`, `createdAt`.

## 7. Odtworzenie aplikacji na podstawie dokumentacji
Aby odtworzyć system 1:1:
1. zbuduj layout z pełnoszerokim `Panel Administratora` i 4 zakładkami,
2. dodaj dolną kartę „Strefa gracza” z zakładkami „Najbliższa gra” i „Aktualności”,
3. odwzoruj styl z tokenów CSS i komponentów wskazanych w sekcji 4,
4. zaimplementuj logikę JS: zakładki, Firestore, gracze, PIN, turnieje, aktualności,
5. użyj schematów Firestore z sekcji 6.
