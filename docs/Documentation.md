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
1. **Panel administratora** (`.card.admin-only`):
   - blok `.admin-message` z polem `#adminMessageInput`, przyciskiem `#adminMessageSend` i statusem `#adminMessageStatus`,
   - blok `.admin-pin` z polem `#adminPinInput`, przyciskami `#adminPinSave` i `#adminPinRandom` oraz statusem `#adminPinStatus`.
2. **Strefa gracza** (`.next-game-card`) widoczna w obu trybach:
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

### 9. Sekcja PIN w panelu admina
- `.admin-pin` to karta z tłem noir i obramowaniem.
- `.admin-pin-form` używa labeli uppercase, a input ma styl identyczny z polami w PIN gate.
- `.admin-pin-actions` układa przyciski i status w jednym wierszu.

### 10. Modal instrukcji
- `.modal-overlay` to warstwa tła `rgba(0,0,0,.72)` z centrowanym oknem.
- `.modal-card` ma noir gradient, złotą linię w `::before`, cień 0 20px 60px i max-height 82vh.
- `.modal-content` jest przewijalnym kontenerem z `white-space: pre-wrap`.
- `.icon-button` to kompaktowy przycisk „×”.
- `body.modal-open` blokuje przewijanie tła podczas otwartego modala.

### 11. Widoczność sekcji
- `.admin-only` domyślnie ukryta.
- `.user-only` domyślnie widoczna.
- Klasa `.is-admin` na `<body>` przełącza widoczność; dodatkowo `.card.admin-only` jest pokazywana jako flex.

### 12. Responsywność
- `<720px` przyciski w sekcji wiadomości układają się w kolumnie.
- `<720px` modal przechodzi w układ jednokolumnowy.
- `<520px` modal zmniejsza padding.

## Opis JavaScript (`Main/app.js`)

### Stałe i konfiguracja
- `PIN_LENGTH` – długość PIN-u (5).
- `PIN_STORAGE_KEY` – klucz w `sessionStorage` przechowujący informację o weryfikacji PIN-u.
- `currentPin` – domyślny PIN (nadpisywany po pobraniu z Firestore).

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

14. **`bootstrap()`**
   - Funkcja startowa: sprawdza tryb admina, aktualizuje klasę `is-admin` na `<body>`.
   - Uruchamia zakładki, ładuje PIN z Firestore, inicjuje gate PIN-u oraz moduły wiadomości i modala.

### Przepływ działania
1. `bootstrap()` uruchamia się po załadowaniu skryptu.
2. Odczytywany jest tryb admina i ustawiana jest klasa `is-admin`.
3. Zakładki w strefie gracza inicjują się z domyślną zakładką „Aktualności”.
4. Aplikacja próbuje pobrać PIN z Firestore i inicjuje gate PIN-u.
5. Dla admina aktywuje się wysyłka wiadomości, zapis PIN-u oraz modal instrukcji.

## Analiza funkcji „Najbliższa gra” (PIN)
- W pliku `PIN.md` znajduje się pełna analiza wymaganej funkcji: zakładka „Najbliższa gra”, zabezpieczenie PIN-em oraz zapis PIN-u w Firestore.

## Firebase i konfiguracja
- Plik `config/firebase-config.js` udostępnia globalny obiekt `window.firebaseConfig`.
- `app.js` inicjalizuje Firebase i zapisuje wiadomości w kolekcji `admin_messages`.
- `app.js` nasłuchuje ostatniej wiadomości i pokazuje ją w polu „Najnowsze”.
- Konfiguracja Firestore i reguł dostępu jest opisana w `Firebase.md`.

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
1. Utwórz `Main/index.html` z nagłówkiem, przyciskiem **Instrukcja** w prawym górnym rogu admina, panelem admina (wiadomość + PIN) oraz strefą gracza z zakładkami i PIN gate.
2. Dodaj `Main/styles.css` z tokenami kasynowymi, gradientowym tłem noir, filcowymi kartami, stylami zakładek, PIN gate i modala.
3. Dodaj `Main/app.js` z funkcjami `getAdminMode`, `getFirebaseApp`, `initUserTabs`, `initPinGate`, `initAdminPin`, `initAdminMessaging`, `initLatestMessage`, `initInstructionModal`, `bootstrap`.
4. Połącz pliki w HTML, pamiętając o wczytaniu `../config/firebase-config.js` oraz skryptów Firebase przed `app.js`.
5. Dodaj `DetaleLayout.md` jako repozytorium stylów i `Firebase.md` z instrukcją konfiguracji Firestore oraz PUSH.
6. Jeśli chcesz wersję Android, utwórz projekt na bazie `MigracjaAndroid/AndroidApp` zgodnie z powyższą sekcją.

Dzięki temu można w pełni odtworzyć ten szablon aplikacji.
