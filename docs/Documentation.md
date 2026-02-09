# Dokumentacja techniczna - Karty

## Cel aplikacji
Aplikacja prezentuje uproszczony panel turnieju karcianego z dwoma wariantami interfejsu:
- **Widok użytkownika** (domyślny) – „Strefa gracza” z zakładkami **Aktualności** i **Najbliższa gra**. Zakładka „Najbliższa gra” jest chroniona PIN-em i po poprawnym wpisie pokazuje komunikat „Strona w budowie”.
- **Widok administratora** (po dodaniu `?admin=1` do URL) – dostęp do sekcji wysyłania wiadomości do graczy oraz ustawiania PIN-u, plus przycisk **Instrukcja** w prawym górnym rogu.

Interfejs utrzymuje styl noir/casino z akcentami złota i zieleni. Tokeny typografii i kolorów są opisane w `DetaleLayout.md`.

## Struktura plików
- `Main/index.html` – szkielet strony, panel admina, strefa użytkownika i modal instrukcji.
- `Main/styles.css` – style wizualne (kolory, fonty, układ, komponenty, modal).
- `Main/app.js` – logika PIN-u, zakładek, wiadomości admina i modala instrukcji.
- `config/firebase-config.js` – konfiguracja Firebase (ładowana z poziomu `Main/index.html`).
- `Firebase.md` – instrukcja konfiguracji Firebase (Firestore + PUSH).
- `PIN.md` – analiza funkcjonalności zakładki „Najbliższa gra” i wymagania PIN.
- `docs/README.md` – instrukcje obsługi dla użytkownika.
- `DetaleLayout.md` – repozytorium stylów, fontów i wytycznych projektu.
- `Pliki/` – katalog na zasoby graficzne.
- `MigracjaAndroid/` – instrukcje i projekt Android (WebView + Firestore).

## Opis HTML (`Main/index.html`)

### 1. Nagłówek strony
- `<header class="page-header">` zawiera:
  - **Blok intro** `.header-intro` z tekstami „TO NIE JEST nielegalny poker” oraz „TO NIE JEST nielegalne kasyno”. Blok jest widoczny tylko w trybie admina.
  - **Przycisk instrukcji** w `.admin-toolbar` (widoczny tylko dla admina). Przycisk posiada `id="adminInstructionButton"` i otwiera modal instrukcji.

### 2. Sekcje główne (`<main class="grid">`)
Układ korzysta z siatki CSS i zawiera:
1. **Sekcja stołów administratora** (`.card.admin-only.admin-tables`):
   - nagłówek z tytułem **Stoły** i przyciskiem `#adminAddTable` (dodawanie kolejnych tabel),
   - kontener `#adminTablesList`, w którym renderowane są karty stołów,
   - tabela **Podsumowanie** z polami `#summaryGameCount` i `#summaryTotalPool`.
   - Każda karta stołu zawiera kolumny: „nazwa gracza”, „% z wszystkich gier”, „% procent z rozegranych gier”,
     „wypłaty”, „suma rozegranych gier”, „podsumowanie (+/-)”, „wpłaty”, „ilość spotkań”, „punkty”, „suma rebuy”.
2. **Panel administratora** (`.card.admin-only`):
   - blok `.admin-message` z polem `#adminMessageInput`, przyciskiem `#adminMessageSend` i statusem `#adminMessageStatus`,
   - blok `.admin-pin` z polem `#adminPinInput`, przyciskami `#adminPinSave` i `#adminPinRandom` oraz statusem `#adminPinStatus`.
3. **Strefa gracza** (`.next-game-card`) widoczna w obu trybach:
   - `.user-panel` z etykietą „Strefa gracza” i zakładkami `.user-tabs`,
   - zakładka **Najbliższa gra** (`#nextGameTab`) zawiera:
     - blok `#nextGamePinGate` z polem `#nextGamePinInput`, przyciskiem `#nextGamePinSubmit` i statusem `#nextGamePinStatus`,
     - treści `#nextGameContent` z komunikatem „Strona w budowie”, widoczne po poprawnym PIN-ie,
   - zakładka **Aktualności** (`#updatesTab`) zawiera pole „Najnowsze” (`#latestMessageOutput`) oraz status `#latestMessageStatus`.

### 3. Modal instrukcji
- `#instructionModal` to modal z treścią instrukcji.
- Zawiera nagłówek `#instructionTitle`, treść `#instructionContent`, status `#instructionStatus` oraz przyciski `#instructionRefresh` i `#instructionCloseFooter`.
- Widoczność sterowana jest przez klasę `.is-visible` i atrybut `aria-hidden`.

### 4. Skrypty
- `../config/firebase-config.js` – udostępnia `window.firebaseConfig`.
- `firebase-app-compat.js` oraz `firebase-firestore-compat.js` – biblioteki Firebase.
- `app.js` – logika PIN-u, zakładek, wiadomości i modala.

## Opis CSS (`Main/styles.css`)

### 1. Tokeny kolorów i efektów
Zdefiniowane w `:root`:
- **Noir i tekst:** `--bg`, `--bg2`, `--ink`, `--muted`.
- **Filc:** `--felt`, `--felt2`, `--felt-glow`.
- **Złoto:** `--gold`, `--gold2`, `--gold-soft`, `--gold-line`.
- **Ruby / danger:** `--ruby`, `--ruby2`, `--danger`.
- **Obramowania:** `--border`, `--border2`, `--divider`.
- **Neon:** `--neon`, `--neon-soft`.
- **Cienie:** `--shadow`, `--shadow-inset`, `--glow-gold`, `--glow-neon`.
- **Radii i odstępy:** `--radius-sm`, `--radius-md`, `--radius-lg`, `--gap-1`…`--gap-5`.

### 2. Typografia
Wykorzystane fonty (Google Fonts) i tokeny:
- `--font-title`: Cinzel – nagłówek główny (uppercase, 0.12em).
- `--font-subtitle`: Cormorant Garamond – nagłówki sekcji.
- `--font-panel`: Rajdhani – etykiety i przyciski uppercase.
- `--font-text`: Inter – tekst bazowy.

Dodatkowo ustawiono: `text-rendering: geometricPrecision`, `-webkit-font-smoothing: antialiased`, `font-kerning: normal`.

### 3. Tło aplikacji
- `body` ma wielowarstwowy gradient noir z delikatnymi spotlightami.
- `body::before` dodaje subtelne rozświetlenie w stylu sali kasyna.

### 4. Karty i układ
- `.page` ogranicza szerokość i ustawia marginesy.
- `.grid` tworzy responsywną siatkę kart.
- `.card` ma filcowy gradient, złotą linię w `::before`, cień `--shadow` i promień `--radius-lg`.
- `.admin-toolbar` wyrównuje przycisk **Instrukcja** do prawej strony nagłówka.

### 5. Przyciski
- `button` to styl „panelowy” (uppercase, `--font-panel`, delikatny glow).
- `.primary` – złoty gradient, `--glow-gold`.
- `.secondary` – neonowa zieleń, `--glow-neon`.
- `.danger` – czerwony wariant dla akcji usuwania (tło ruby, czerwony border, czerwony glow).

### 6. Strefa gracza, zakładki i PIN
- `.next-game-card` zajmuje całą szerokość siatki (`grid-column: 1 / -1`).
- `.user-panel` to pasek z etykietą i zakładkami `.user-tabs`.
- `.tab-button` jest stylizowany na pill, a stan aktywny `.is-active` podbija złoty glow.
- `.tab-panel` przełącza się przez klasę `.is-active`.
- `#nextGamePinGate` używa ramki przerywanej i tła noir, a formularz PIN (`.pin-inputs`) ma spójny styl z innymi polami formularzy.
- `#nextGameContent` jest pokazywany po dodaniu klasy `.is-visible` i centruje komunikat „Strona w budowie”.

### 7. Formularz wiadomości administratora
- `.admin-message` to karta pomocnicza z tłem noir i obramowaniem.
- `textarea` ma styl formularza: tło `rgba(0,0,0,.35)`, obramowanie `--border`, focus w złocie + neonie.
- `.status-text` pokazuje komunikaty o wysyłce wiadomości i ładowaniu instrukcji.

### 8. Pole „Najnowsze” w zakładce Aktualności
- `.latest-message` to karta z tłem noir i obramowaniem `--border2`.
- `textarea` jest tylko do odczytu, bez możliwości resize, z wysokością ~86px.

### 9. Sekcja stołów admina
- `.admin-tables` zajmuje pełną szerokość siatki i zawiera listę kart stołów.
- `.admin-tables-header` układa tytuł oraz przycisk **Dodaj** w jednym wierszu.
- `.admin-table-card` to pojedyncza karta stołu z polami edycyjnymi, tabelą danych i przyciskami akcji.
- `.admin-input` wspólny styl dla wszystkich pól edycji w tabelach (złoty fokus + neon).
- `.admin-data-table` to tabela z nagłówkami uppercase i przewijaniem poziomym w `.admin-table-scroll`.
- `.admin-summary` podkreśla blok **Podsumowanie** ze spójnym tłem noir.
- Przyciski **Usuń** dla tabel i wierszy korzystają z klasy `.danger`, aby wizualnie akcentować akcje destrukcyjne.

### 10. Sekcja PIN w panelu admina
- `.admin-pin` to karta z tłem noir i obramowaniem.
- `.admin-pin-form` używa labeli uppercase, a input ma styl identyczny z polami w PIN gate.
- `.admin-pin-actions` układa przyciski i status w jednym wierszu.

### 11. Modal instrukcji
- `.modal-overlay` to warstwa tła `rgba(0,0,0,.72)` z centrowanym oknem.
- `.modal-card` ma noir gradient, złotą linię w `::before`, cień 0 20px 60px i max-height 82vh.
- `.modal-content` jest przewijalnym kontenerem z `white-space: pre-wrap`.
- `.icon-button` to kompaktowy przycisk „×”.
- `body.modal-open` blokuje przewijanie tła podczas otwartego modala.

### 12. Widoczność sekcji
- `.admin-only` domyślnie ukryta.
- `.user-only` domyślnie widoczna.
- Klasa `.is-admin` na `<body>` przełącza widoczność; dodatkowo `.card.admin-only` jest pokazywana jako flex.

### 13. Responsywność
- `<720px` przyciski w sekcji wiadomości układają się w kolumnie.
- `<720px` modal przechodzi w układ jednokolumnowy.
- `<520px` modal zmniejsza padding.

## Opis JavaScript (`Main/app.js`)

### Stałe i konfiguracja
- `PIN_LENGTH` – długość PIN-u (5).
- `PIN_STORAGE_KEY` – klucz w `sessionStorage` przechowujący informację o weryfikacji PIN-u.
- `currentPin` – domyślny PIN (nadpisywany po pobraniu z Firestore).
- `TABLES_COLLECTION` / `TABLE_ROWS_COLLECTION` – nazwy kolekcji Firestore dla stołów i wierszy.
- `DEFAULT_TABLE_META` – domyślne wartości pól „rodzaj gry” i „data”.
- `TABLE_COLUMNS` – definicja kolumn tabel (klucze i etykiety).

### Funkcje
1. **`getAdminMode()`**
   - Odczytuje parametr `admin` z URL.
   - Zwraca `true`, gdy parametr ma wartość `1`.

2. **`getFirebaseApp()`**
   - Sprawdza dostępność SDK Firebase i konfiguracji (`window.firebaseConfig`).
   - Inicjalizuje Firebase tylko raz i zwraca instancję.

3. **`sanitizePin(value)`**
   - Usuwa znaki niebędące cyframi i przycina wartość do 5 znaków.

4. **`isPinValid(value)`**
   - Sprawdza, czy PIN składa się z dokładnie 5 cyfr (`/^\d{5}$/`).

5. **`getPinGateState()` / `setPinGateState(isVerified)`**
   - Odczytuje i zapisuje stan weryfikacji PIN-u w `sessionStorage`.

6. **`updatePinVisibility({ isAdmin })`**
   - Ukrywa blok PIN gate i pokazuje `#nextGameContent`, jeśli PIN jest poprawny lub użytkownik jest adminem.

7. **`loadPinFromFirestore()`**
   - Pobiera dokument `app_settings/next_game` i aktualizuje `currentPin`.

8. **`initAdminPin()`**
   - Obsługuje pole `#adminPinInput` i zapis PIN-u do Firestore.
   - Waliduje format 5 cyfr i odrzuca wpisy tekstowe.
   - Przycisk `#adminPinRandom` generuje losowy kod 5-cyfrowy.

9. **`initPinGate({ isAdmin })`**
   - Waliduje PIN wpisany przez użytkownika w `#nextGamePinInput`.
   - Po poprawnym PIN-ie zapisuje stan w `sessionStorage` i pokazuje `#nextGameContent`.

10. **`initUserTabs()`**
   - Ustawia domyślną zakładkę „Aktualności”.
   - Przełącza aktywną zakładkę i panel treści po kliknięciu.

11. **`initAdminMessaging()`**
   - Podpina przycisk `#adminMessageSend` do zapisu wiadomości w Firestore (`admin_messages`).
   - Obsługuje walidację pustej treści oraz statusy powodzenia/błędu.

12. **`initLatestMessage()`**
   - Nasłuchuje najnowszej wiadomości w kolekcji `admin_messages`.
   - Aktualizuje pole `#latestMessageOutput` i `#latestMessageStatus` w zakładce „Aktualności”.

13. **`initInstructionModal()`**
   - Spina przycisk `#adminInstructionButton` z modalem `#instructionModal`.
   - Pobiera treść z `https://cutelittlegoat.github.io/Karty/docs/README.md` i wstawia do `#instructionContent`.
   - Obsługuje odświeżanie treści, zamykanie (przyciski, tło, Esc) i blokadę scrolla tła.

14. **`parseDefaultTableNumber(name)`**
   - Rozpoznaje domyślne nazwy w formacie „Gra X” i zwraca numer.

15. **`getNextTableName(tables)`**
   - Wylicza brakujący numer dla nazwy „Gra X” na podstawie istniejących stołów.

16. **`normalizeNumber(value)` / `formatNumber(value)`**
   - Normalizują wartości „wpłaty” do liczb i formatują je do wyświetlania.

17. **`getTablesCollectionName()`**
   - Odczytuje nazwę kolekcji stołów z `window.firebaseConfig.tablesCollection`.
   - Jeśli brak konfiguracji, używa domyślnej nazwy `Tables`.

18. **`formatFirestoreError(error)`**
   - Tworzy opis błędu Firestore z kodem i wiadomością, aby komunikaty w UI były czytelne.

19. **`scheduleDebouncedUpdate(key, callback)`**
   - Debounce zapisów do Firestore, aby nie wysyłać zapytań przy każdym znaku.

20. **`initAdminTables()`**
   - Renderuje listę stołów admina, podpina przycisk **Dodaj** i obsługuje usuwanie stołów.
   - Umożliwia edycję nazwy stołu, pól „rodzaj gry” i „data”.
   - Dodaje/usuwa wiersze z tabeli i zapisuje je w Firestore (subkolekcja `rows`).
   - Oblicza podsumowanie: liczba stołów oraz suma „wpłaty”.
   - Obsługuje błędy uprawnień Firestore (np. `permission-denied`) i pokazuje komunikat o braku dostępu do kolekcji skonfigurowanej w `tablesCollection`.

21. **`bootstrap()`**
   - Funkcja startowa: sprawdza tryb admina, aktualizuje klasę `is-admin` na `<body>`.
   - Uruchamia zakładki, ładuje PIN z Firestore, inicjuje gate PIN-u oraz moduły wiadomości i modala.

### Przepływ działania
1. `bootstrap()` uruchamia się po załadowaniu skryptu.
2. Odczytywany jest tryb admina i ustawiana jest klasa `is-admin`.
3. Zakładki w strefie gracza inicjują się z domyślną zakładką „Aktualności”.
4. Aplikacja próbuje pobrać PIN z Firestore i inicjuje gate PIN-u.
5. Dla admina aktywują się: moduł stołów (dodawanie, edycja, wiersze), wysyłka wiadomości, zapis PIN-u oraz modal instrukcji.

## Analiza funkcji „Najbliższa gra” (PIN)
- W pliku `PIN.md` znajduje się pełna analiza wymaganej funkcji: zakładka „Najbliższa gra”, zabezpieczenie PIN-em oraz zapis PIN-u w Firestore.

## Firebase i konfiguracja
- Plik `config/firebase-config.js` udostępnia globalny obiekt `window.firebaseConfig`.
- W konfiguracji znajduje się pole `tablesCollection`, które pozwala dopasować nazwę kolekcji stołów do reguł Firestore (np. `"Tables"` lub `"tables"`).
- Pole `collection1Name` przechowuje nazwę kolekcji rezerwowej (domyślnie `"Collection1"`), aby łatwo dopasować ją do reguł Firestore w przyszłości.
- `app.js` inicjalizuje Firebase i zapisuje wiadomości w kolekcji `admin_messages`.
- W Firestore wykorzystywane są kolekcje:
  - `Tables` (domyślnie, lub wartość z `tablesCollection`) – kolekcja stołów (rozgrywek). Każdy dokument zawiera pola:
    - `name` (string) – nazwa stołu, np. „Gra 1” lub „Turniej A”,
    - `gameType` (string) – wartość pola „rodzaj gry”,
    - `gameDate` (string) – wartość pola „data”,
    - `createdAt` (timestamp) – czas utworzenia (do sortowania),
    - `Date` (string) – data ustawiana w panelu Firebase (opcjonalne),
    - `PlayersInvited` (string) – liczba/tekst zaproszonych graczy (opcjonalne),
    - `Stakes` (string) – stawka stołu (opcjonalne),
    - `TableNumber` (string) – numer/etykieta stołu (opcjonalne),
    - `Winner` (string) – zwycięzca stołu (opcjonalne),
    - `Placeholder1`-`Placeholder9` (string) – pola rezerwowe na przyszłe dane.
    - Subkolekcja `rows` przechowuje wiersze tabeli z polami:
      - `playerName`, `percentAllGames`, `percentPlayedGames`, `payouts`, `totalGames`,
        `summary`, `deposits`, `meetings`, `points`, `rebuyTotal` (string/number),
      - `createdAt` (timestamp) – czas utworzenia wiersza.
  - `players` – kolekcja graczy. Każdy dokument zawiera pola:
    - `Name` (string) – nazwa gracza,
    - `Cash` (string/number) – aktualna gotówka,
    - `GamesPlayed` (string/number) – liczba rozegranych gier,
    - `GamesWon` (string/number) – liczba wygranych gier,
    - `MoneySpend` (string/number) – suma wydanych środków,
    - `MoneyWon` (string/number) – suma wygranych środków,
    - `Placeholder1`-`Placeholder9` (string) – pola rezerwowe na przyszłe dane.
  - `admin_messages` oraz `app_settings` – dane dla wiadomości i PIN-u.
    - `admin_messages`: pole `content` (string) przechowuje treść wysłanej wiadomości, `createdAt` (timestamp) pozwala sortować najnowszy wpis.
    - `app_settings/next_game`: pole `pin` (string) zawiera 5-cyfrowy PIN do zakładki „Najbliższa gra”, `updatedAt` (timestamp) sygnalizuje zmianę.
  - `Collection1` – rezerwowa kolekcja pod przyszłe pola administratora.
    - Dokument `document1` zawiera pola `field1`-`field20` (string).
    - **Aktualnie żadne z pól `field1`-`field20` nie jest używane przez aplikację** – są przygotowane do przyszłego mapowania danych wpisywanych w panelu admina.
- `app.js` nasłuchuje ostatniej wiadomości i pokazuje ją w polu „Najnowsze”.
- Konfiguracja Firestore i reguł dostępu jest opisana w `Firebase.md`.
- Jeśli reguły Firestore nie pozwalają na zapis do `Tables`, interfejs admina pokaże komunikat o braku uprawnień i podpowie sprawdzenie wielkości liter w nazwie kolekcji.

### Aktualne reguły Firestore (zapisane konfiguracje)
```
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
    }
    match /Collection1/{docId} {
      allow read, write: if true;
    }
  }
}
```

### Konfiguracja Firebase (szczegóły techniczne)
1. Uzupełnij dane w pliku `config/firebase-config.js`.
2. Skonfiguruj Firestore tak, aby web i Android mogły czytać/zapisywać kolekcję `admin_messages` oraz dokument `app_settings/next_game`.
3. Dodaj reguły Firestore dla stołów (pamiętaj o wielkości liter w nazwie `Tables`):
   - kolekcja `Tables` i jej subkolekcja `rows` muszą mieć możliwość zapisu z poziomu panelu admina,
   - w przeciwnym razie aplikacja pokaże komunikat o braku dostępu do kolekcji `Tables`.
4. Kolekcja `Tables` (stoły) jest używana przez panel admina:
   - Kliknij **Start collection** i wpisz nazwę `Tables` (jeśli jeszcze nie istnieje).
   - Dokumenty w tej kolekcji tworzą się automatycznie po kliknięciu **Dodaj** w panelu admina.
   - Każdy dokument zawiera pola:
     - `name` (string) – nazwa stołu („Gra 1”, „Turniej A” itd.),
     - `gameType` (string) – rodzaj gry,
     - `gameDate` (string) – data,
     - `createdAt` (timestamp),
     - `Date`, `PlayersInvited`, `Stakes`, `TableNumber`, `Winner` (string) – pola opcjonalne,
     - `Placeholder1`-`Placeholder9` (string) – pola rezerwowe na przyszłe dane.
   - W każdym dokumencie powstaje subkolekcja `rows`, w której każdy wiersz ma pola:
     - `playerName`, `percentAllGames`, `percentPlayedGames`, `payouts`, `totalGames`,
       `summary`, `deposits`, `meetings`, `points`, `rebuyTotal` (string/number),
     - `createdAt` (timestamp).
5. Kolekcja `players` (gracze) w Firebase Console:
   - Kliknij **Start collection** i wpisz nazwę `players`.
   - Każdy dokument w tej kolekcji powinien zawierać pola:
     - `Name` (string) – nazwa gracza,
     - `Cash`, `GamesPlayed`, `GamesWon`, `MoneySpend`, `MoneyWon` (string/number),
     - `Placeholder1`-`Placeholder9` (string) – pola rezerwowe na przyszłe dane.
6. Kolekcja `Collection1` (pola admina na przyszłość):
   - Kliknij **Start collection** i wpisz nazwę `Collection1`.
   - Dodaj dokument `document1`.
   - Dodaj pola `field1`-`field20` (string).
   - Pola są przygotowane do późniejszego mapowania danych wpisywanych w panelu admina (obecnie nie są jeszcze używane w aplikacji).
7. Szczegółowa instrukcja krok po kroku znajduje się w pliku `Firebase.md`.

### Zasoby graficzne
- Folder `Pliki/` jest przeznaczony na grafiki i zasoby używane w aplikacji.

## Migracja Android (WebView + PUSH/Firestore)

### Struktura projektu Android
W `MigracjaAndroid/AndroidApp/` znajduje się kompletny projekt Android Studio z konfiguracją Gradle, manifestem oraz zasobami:
- `settings.gradle`, `build.gradle`, `gradle.properties` – konfiguracja builda i repozytoriów.
  - `app/build.gradle` – konfiguracja aplikacji, wersje SDK, zależności Firebase Firestore/Material.
- `app/google-services.json` – plik konfiguracyjny Firebase (Firestore).
- `app/src/main/AndroidManifest.xml` – uprawnienia i deklaracja Activity.
  - `app/src/main/java/com/karty/app/*.kt` – logika WebView i PUSH (Firestore listener).
- `app/src/main/res/*` – layouty, kolory, motyw i ikona notyfikacji.

### Opis plików Kotlin
1. **`MainActivity.kt`**
   - Tworzy UI na bazie `activity_main.xml`.
   - Konfiguruje WebView przez `WebViewConfig`.
   - Podpina `KartyWebViewClient`, aby blokować `?admin=1`.
   - Wywołuje `AdminMessageListener`, aby nasłuchiwać Firestore i pokazywać PUSH.
   - Otwiera adres startowy użytkownika (`USER_START_URL`).

2. **`WebViewConfig.kt`**
   - Przechowuje stałą `USER_START_URL` ustawioną na adres publicznej wersji web.
   - Ustawia WebView: JS, DOM storage, tryb szerokiego widoku.

3. **`KartyWebViewClient.kt`**
   - Nadpisuje `shouldOverrideUrlLoading`.
   - Wykrywa parametr `admin=1` i przekierowuje na bezpieczny URL bez tego parametru.

4. **`NotificationHelper.kt`**
   - Tworzy kanał powiadomień `karty_updates`.
   - Buduje notyfikacje z ikoną `ic_notification`.

5. **`AdminMessageListener.kt`**
   - Nasłuchuje kolekcji `admin_messages`.
   - Pokazuje lokalne powiadomienie przez `NotificationHelper.showNotification`.

### Zasoby Android (layout i motyw)
- `activity_main.xml` zawiera pełnoekranowy WebView.
- `colors.xml` definiuje podstawową paletę aplikacji nawiązującą do złota/noir.
- `themes.xml` ustawia motyw `Theme.Karty` (Material 3, bez ActionBar).
- `ic_notification.xml` to wektorowa ikona powiadomień w kolorze złotym.
- `ic_launcher.xml` to wektorowa ikona aplikacji (launcher) zapisana w `res/drawable`, używana przez `AndroidManifest.xml` jako `android:icon`.

### Przepływ działania Android
1. Uruchomienie aplikacji ładuje `MainActivity`.
2. WebView otwiera `https://cutelittlegoat.github.io/Karty/Main/index.html`.
3. Każda próba wejścia w `?admin=1` zostaje zablokowana i zastąpiona bezpiecznym URL.
4. Wiadomości z `admin_messages` wyświetlane są jako lokalne powiadomienia (PUSH).

## Jak odtworzyć aplikację na podstawie dokumentacji
1. Utwórz `Main/index.html` z nagłówkiem, przyciskiem **Instrukcja** w prawym górnym rogu admina, sekcją stołów (przycisk **Dodaj**, lista tabel, blok **Podsumowanie**), panelem admina (wiadomość + PIN) oraz strefą gracza z zakładkami i PIN gate.
2. Dodaj `Main/styles.css` z tokenami kasynowymi, gradientowym tłem noir, filcowymi kartami, stylami zakładek, PIN gate, modala oraz bloków `.admin-tables`, `.admin-table-card`, `.admin-input`, `.admin-data-table`.
3. Dodaj `Main/app.js` z funkcjami `getAdminMode`, `getFirebaseApp`, `initUserTabs`, `initPinGate`, `initAdminPin`, `initAdminMessaging`, `initLatestMessage`, `initInstructionModal`, `initAdminTables`, `bootstrap` oraz logiką numeracji „Gra X”.
4. Połącz pliki w HTML, pamiętając o wczytaniu `../config/firebase-config.js` oraz skryptów Firebase przed `app.js`.
5. Dodaj `DetaleLayout.md` jako repozytorium stylów i `Firebase.md` z instrukcją konfiguracji Firestore oraz PUSH.
6. Jeśli chcesz wersję Android, utwórz projekt na bazie `MigracjaAndroid/AndroidApp` zgodnie z powyższą sekcją.

Dzięki temu można w pełni odtworzyć ten szablon aplikacji.
