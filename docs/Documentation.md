# Dokumentacja techniczna — Karty

## 1. Cel aplikacji
Aplikacja to front-end HTML/CSS/JS oparty o Firebase Firestore. Działa w dwóch trybach:
- użytkownik (domyślnie),
- administrator (`?admin=1`).

System udostępnia moduły:
- Aktualności,
- Gracze (lista, PIN, uprawnienia),
- Turnieje,
- Statystyki (placeholder),
- Gry (lata + tabela turniejów + modal szczegółów),
- bramka PIN do zakładki „Najbliższa gra”.

## 2. Struktura plików
- `Main/index.html` — struktura widoków, tabel, zakładek i modali.
- `Main/styles.css` — style layoutu, typografia, komponenty i responsywność.
- `Main/app.js` — pełna logika UI, obsługa Firestore, walidacje, renderowanie.
- `docs/README.md` — instrukcja użytkownika krok po kroku.
- `docs/Documentation.md` — dokumentacja techniczna i opis działania.
- `DetaleLayout.md` — rejestr fontów, kolorów, styli i detali wizualnych.

## 2.1 Integracje danych (aktualny stan)
- Projekt nie używa importu z plików `.xlsx`.
- W kodzie nie ma aktywnego mechanizmu konwersji arkusza do pliku `data.json`.
- Dane aplikacji są utrzymywane wyłącznie w Firebase Firestore (kolekcje opisane w sekcji 6).

## 3. HTML (`Main/index.html`)
### 3.1 Układ główny
- Nagłówek strony z tytułami.
- Karta administratora z zakładkami panelu:
  - Aktualności,
  - Gracze,
  - Turnieje,
  - Gry,
  - Statystyki.
- Karta „Strefa gracza” (podgląd części użytkownika).
- Modal instrukcji, modal edycji uprawnień gracza i modal szczegółów gry.
- W nagłówku panelu administratora przycisk `Odśwież` oraz pole statusu `#adminPanelRefreshStatus`.

### 3.2 Zakładka „Gracze”
Tabela zawiera kolumny:
- Nazwa,
- PIN,
- Uprawnienia,
- Akcje.

W kolumnie PIN każdy wiersz renderuje:
- input numeryczny (maks. 5 cyfr),
- przycisk `Losuj` do wygenerowania unikalnego kodu.


### 3.3 Zakładka „Gry”
Struktura zakładki składa się z dwóch kolumn:
- lewy panel (`.admin-games-sidebar`) z listą lat (`#adminGamesYearsList`),
- prawa sekcja (`.admin-games-content`) z dwiema tabelami: „Statystyki” i „Tabele Gier”.

Elementy sterujące:
- `#adminGamesAddYear` — przycisk dodawania roku,
- `#adminGamesDeleteYear` — przycisk usuwania aktualnie zaznaczonego roku.

Tabela gier (`#adminGamesTableBody`) pokazuje:
- `Rodzaj gry` (`gameType`),
- `Data` (`gameDate`),
- `Nazwa` (`name`, klikalna).

Kliknięcie nazwy otwiera modal `#gameDetailsModal`, który renderuje wszystkie kolumny z `TABLE_COLUMNS` i wszystkie wiersze z subkolekcji `rows` dla wybranego turnieju.

## 4. CSS (`Main/styles.css`)
### 4.1 Tokeny i fonty
- Fonty: `Cinzel`, `Cormorant Garamond`, `Rajdhani`, `Inter`.
- Kolory zdefiniowane jako custom properties (`--bg`, `--gold`, `--neon`, `--danger` itd.).

### 4.2 Komponenty
- `button.primary`, `button.secondary`, `button.danger` — trzy warianty akcji.
- `.admin-input` — wspólny styl pól formularzy administratora.
- `.admin-players`, `.players-table`, `.permissions-tags` — layout modułu graczy.
- `.admin-panel-header` — poziome ułożenie tytułu „Panel Administratora” i sekcji odświeżania w prawym górnym rogu.
- `.permission-badge` — złote kapsułki uprawnień (border `--gold-line`, kolor `--gold`, glow `--glow-gold`) odpowiadające stylistyce aktywnej zakładki użytkownika.
- `.pin-control` — kontener flex łączący pole PIN i przycisk `Losuj`.
- `.admin-pin-random` — styl przycisku losowania PIN (mniejszy, kompaktowy wariant secondary).
- `.admin-games-layout` — dwukolumnowy układ zakładki „Gry” (sidebar lat + obszar tabel).
- `.admin-games-year-button` i `.admin-games-year-button.is-active` — przyciski lat z podświetleniem aktywnego roku.
- `.admin-games-link` — klikalna nazwa gry w tabeli, wizualnie jako link.


## 5. JavaScript (`Main/app.js`)

## 5.1 Stałe i walidacja
Kluczowe stałe:
- `PIN_LENGTH = 5` — wymagana długość PIN.
- `PLAYER_ACCESS_COLLECTION = "app_settings"` i `PLAYER_ACCESS_DOCUMENT = "player_access"` — źródło listy graczy.

Kluczowe funkcje PIN:
- `sanitizePin(value)` — usuwa znaki nienumeryczne i ucina do 5 znaków.
- `isPinValid(value)` — sprawdza wzorzec dokładnie 5 cyfr (`/^\d{5}$/`).
- `generateRandomPin()` — losuje 5-cyfrowy kod (z zachowaniem zer wiodących).

## 5.2 Moduł Gracze (`initAdminPlayers`)
Moduł obsługuje:
- pobranie i normalizację danych graczy,
- renderowanie tabeli,
- edycję pól nazwa/PIN,
- usuwanie i dodawanie graczy,
- modal uprawnień,
- zapis do Firestore.

Dodatkowe funkcje wewnątrz modułu:
- `getPinOwnerId(pin, excludedId)` — wyszukuje właściciela PIN z pominięciem bieżącego gracza.
- `rebuildPinMap()` — aktualizuje mapę poprawnych PIN-ów do szybkiej weryfikacji dostępu.
- `generateUniquePlayerPin(excludedId)` — losuje kod PIN i ponawia losowanie, dopóki kod nie będzie unikalny.

### 5.2.1 Zasada walidacji PIN po zmianach
W zdarzeniu `input` dla pola PIN:
1. Wartość jest sanitizowana do cyfr i max 5 znaków.
2. Jeżeli PIN ma 1–4 cyfry, pole dostaje walidację „PIN musi mieć dokładnie 5 cyfr.”
3. Jeżeli wpisany PIN jest duplikatem:
   - input jest czyszczony do pustej wartości,
   - pokazuje się walidacja „PIN musi być unikalny.”,
   - stan gracza zapisywany jest z pustym PIN (`""`), aby nie zostawał skrócony kod.
4. PIN zapisywany jest tylko gdy jest pełny (`5 cyfr`) albo gdy użytkownik celowo czyści pole.

Efekt: aplikacja nie utrwala PIN-ów krótszych niż 5 cyfr i eliminuje przypadek skracania kodu po wpisaniu duplikatu.

### 5.2.2 Przycisk „Losuj”
Każdy wiersz gracza ma przycisk `Losuj`:
1. Kliknięcie uruchamia `generateUniquePlayerPin(player.id)`.
2. Kod jest losowany w pętli do uzyskania unikalnej wartości.
3. Wylosowany 5-cyfrowy PIN trafia do inputu i od razu jest zapisywany przez `updatePlayerField`.

## 5.3 Bramka PIN użytkownika (`initPinGate` + `updatePinVisibility`)
- Użytkownik wpisuje PIN i klika `Otwórz`.
- Dostęp zależy od:
  - poprawnego 5-cyfrowego PIN,
  - zgodności PIN -> gracz,
  - uprawnienia `nextGameTab`.
- Funkcja `updatePinVisibility()` opiera widoczność wyłącznie o `sessionStorage` (`PIN_STORAGE_KEY`) i **nie** robi wyjątku dla trybu administratora.
- Efekt: sekcja „Strefa gracza” w trybie administratora odwzorowuje 1:1 zachowanie zwykłego widoku użytkownika (najpierw PIN, potem ewentualny dostęp).
- W `initUserTabs()` przy wejściu na `nextGameTab` stan dostępu jest resetowany (`setPinGateState(false)`), więc każde nowe wejście w zakładkę wymaga ponownej walidacji PIN.

## 5.4 Inne moduły
- `initAdminMessaging()` — wysyłanie wiadomości do graczy (`admin_messages`).
- `initLatestMessage()` — odczyt najnowszej wiadomości i render po stronie gracza.
- `initAdminTables()` — operacje CRUD na turniejach i wierszach tabeli.
- `initAdminGames()` — logika zakładki „Gry”: lista lat, synchronizacja z datami turniejów, tabela „Tabele Gier”, modal szczegółów.
- `initAdminPanelTabs()` + `initUserTabs()` — zarządzanie zakładkami.
- `initAdminPanelRefresh()` — odświeża dane tylko dla aktualnie aktywnej zakładki administratora bez przełączania widoku i bez przeładowania całej strony.
- `initInstructionModal()` — modal instrukcji z odświeżaniem treści.

### 5.5 Mechanizm odświeżania danych w panelu administratora
- `adminRefreshHandlers` (Map) przechowuje funkcje odświeżające przypisane do identyfikatora zakładki (`adminNewsTab`, `adminPlayersTab`, `adminTournamentsTab`, `adminGamesTab`).
- `registerAdminRefreshHandler(tabId, handler)` rejestruje callback odświeżania dla konkretnej zakładki.
- Po kliknięciu `#adminPanelRefresh`:
  1. kod wykrywa aktywny panel (`.admin-panel-content.is-active`),
  2. pobiera odpowiadający mu handler z `adminRefreshHandlers`,
  3. blokuje przycisk na czas odświeżania,
  4. wyświetla status w `#adminPanelRefreshStatus`,
  5. uruchamia odczyt danych z Firestore po stronie serwera (`get({ source: "server" })`).

Rejestrowane handlery:
- `adminNewsTab` (`initAdminMessaging`) — wykonuje odczyt najnowszego dokumentu z `admin_messages`.
- `adminPlayersTab` (`initAdminPlayers`) — pobiera dokument `app_settings/player_access`, normalizuje listę i renderuje tabelę graczy.
- `adminTournamentsTab` (`initAdminTables`) — pobiera wszystkie turnieje i ich wiersze, aktualizuje `adminTablesState`, potem renderuje widok.
- `adminGamesTab` (`initAdminGames`) — wywołuje odświeżenie danych turniejów, a następnie odtwarza listę lat i tabelę gier.

Efekt: przycisk „Odśwież” nie przenosi już użytkownika do „Aktualności”, ponieważ nie wykonuje `window.location.reload()`, tylko odświeża dane w aktualnej zakładce.


### 5.6 Szczegóły modułu „Gry”
- `extractYearFromDate(value)` — wyciąga rok (4 cyfry) z pola daty turnieju; używa ostatniego dopasowania `19xx/20xx`.
- `normalizeYearList(years)` — usuwa duplikaty, waliduje zakres lat i sortuje malejąco.
- `loadSavedGameYears()` / `saveGameYears(years)` — trwałość listy lat w `localStorage` (`adminGamesYears`).
- `registerAdminTablesListener(listener)` + `notifyAdminTablesListeners()` — mechanizm powiadamiania zakładki „Gry” o zmianach w module „Turnieje”.
- `initAdminGames()`:
  1. ładuje listę lat (domyślnie `2026`, `2025`),
  2. scala lata ręczne z latami wykrytymi z dat turniejów,
  3. renderuje panel lat i wybór aktywnego roku,
  4. renderuje tabelę gier dla wybranego roku,
  5. otwiera modal szczegółów gry z pełnym zestawem kolumn i danych graczy,
  6. rejestruje odświeżanie dla zakładki `adminGamesTab`.

## 6. Firestore — model danych
### 6.1 Kolekcje
- `admin_messages`
- `Tables` (oraz subkolekcja `rows`)
- `app_settings/player_access`

### 6.2 Dokumenty
`app_settings/player_access`:
- `players[]`:
  - `id` (string),
  - `name` (string),
  - `pin` (string, dokładnie 5 cyfr lub pusty),
  - `permissions` (array stringów).
- `updatedAt` (timestamp serwera).

## 7. Jak odtworzyć aplikację na podstawie dokumentacji
1. Odtwórz strukturę HTML: panel administratora + karta gracza + modale.
2. W CSS zastosuj wskazane tokeny kolorów, fonty i komponenty.
3. W JS zaimplementuj:
   - tryby admin/użytkownik,
   - moduły zakładek,
   - integrację Firestore,
   - moduł graczy z walidacją PIN (5 cyfr, unikalność, pełne czyszczenie duplikatu),
   - przycisk `Losuj` z pętlą do unikalnego PIN,
   - bramkę dostępu po PIN i uprawnieniach,
   - identyczne działanie bramki PIN w widoku użytkownika i w sekcji „Strefa gracza” podczas trybu administratora (bez bypassu),
   - rejestr handlerów odświeżania dla zakładek panelu administratora,
   - przycisk `Odśwież` działający lokalnie na aktywnej zakładce (bez pełnego reloadu),
   - złote znaczniki nazw uprawnień w tabeli graczy (wizualnie jak aktywna zakładka).
4. Podłącz konfigurację Firebase (`config/firebase-config.js`) i biblioteki compat.
