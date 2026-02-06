# Dokumentacja techniczna - Karty

## Cel aplikacji
Aplikacja jest szablonem strony do organizacji turnieju karcianego. Udostępnia dwa warianty interfejsu:
- **Widok użytkownika** (domyślny) – strefa uczestnika z zakładką „Najbliższa gra”, blokowaną PIN-em, oraz zakładką „Aktualności”.
- **Widok administratora** (po dodaniu `?admin=1` do URL lub użyciu przycisku „Przełącz widok”) – rozszerzony o sekcję zarządzania stołami i graczami, moduł wiadomości do Androida, ustawianie PIN-u oraz przycisk z instrukcją obsługi.

Interfejs jest utrzymany w stylistyce kasyna (noir, złoto, filcowa zieleń, delikatny neon). Projekt korzysta z tokenów typografii i kolorów opisanych w `DetaleLayout.md`.

## Struktura plików
- `Main/index.html` – szkielet strony, kontenery dla danych, panel admina oraz modal instrukcji.
- `Main/styles.css` – kompletne style wizualne (tokeny kolorów, fonty, układ, komponenty, modal).
- `Main/app.js` – logika przełączania widoków, renderowania danych, obsługa wiadomości admina i modala instrukcji.
- `config/firebase-config.js` – miejsce na konfigurację Firebase (ładowane z poziomu `Main/index.html`).
- `Firebase.md` – instrukcja konfiguracji Firebase.
- `PIN.md` – analiza funkcjonalności zakładki „Najbliższa gra” oraz wymagań dla PIN.
- `docs/README.md` – instrukcje obsługi dla użytkownika.
- `DetaleLayout.md` – repozytorium stylów, fontów i wytycznych projektu.
- `Pliki/` – katalog na zasoby graficzne.
- `MigracjaAndroid/Migracja_Android.md` – pełna instrukcja migracji na Android (WebView + FCM).
- `MigracjaAndroid/AndroidApp/` – gotowy projekt Android Studio z WebView i FCM.

## Opis HTML (`Main/index.html`)

### 1. Nagłówek strony
- `<header class="page-header">` zawiera:
  - **Blok intro** `.header-intro` z eyebrow „TO NIE JEST niekrgalny poker” (`.eyebrow`) oraz tytułem `TO NIE JEST nielegalne kasyno` i opisem (`h1`, `.subtitle`). Blok jest widoczny tylko w trybie admina.
- **Karta widoku** (`.view-card`) z etykietą trybu (`.view-label`), wierszem `.view-status` (badge trybu `#viewBadge` i czerwony przycisk `.view-toggle`) oraz podpowiedzią (`.view-hint`).
  - Podpowiedź `.view-hint` jest widoczna tylko w trybie admina.

### 2. Sekcje główne (`<main class="grid">`)
Układ korzysta z siatki CSS i składa się z kart:
1. **Stoły i gracze** – kontener `#tablesContainer` (sekcja tylko dla admina).
2. **Lista graczy** – kontener `#playersContainer` (sekcja tylko dla admina).
3. **Rozliczenia** – kontener `#paymentsContainer` (sekcja tylko dla admina).
4. **Panel administratora** – sekcja `.admin-only` (przyciski akcji i notatka).
   - Wewnątrz panelu znajduje się blok `.admin-message` z polem `#adminMessageInput`, przyciskiem `#adminMessageSend` i statusem `#adminMessageStatus`.
  - W siatce `.admin-actions` dodany jest przycisk `#dataUpdateButton` („Aktualizuj dane”) oraz `#adminInstructionButton`, który otwiera modal instrukcji.
  - Poniżej przycisków znajduje się `.admin-data-hint` z informacją o wymaganej lokalizacji pliku `Turniej.xlsx`.
  - Dodatkowo występuje blok `.admin-pin` z polem `#adminPinInput`, przyciskiem `#adminPinSave` i statusem `#adminPinStatus` do zapisu PIN-u w Firestore.
5. **Strefa uczestnika / zakładka „Najbliższa gra”** – sekcja `.next-game-card` widoczna w obu trybach:
  - `.user-panel` zawiera etykietę `.user-view-label` („Strefa uczestnika”), czerwony przycisk `.view-toggle` i listę zakładek `.user-tabs`.
  - Zakładka **Najbliższa gra** (`#nextGameTab`) zawiera:
    - blok `#nextGamePinGate` z polem PIN-u `#nextGamePinInput`, przyciskiem `#nextGamePinSubmit` i statusem `#nextGamePinStatus`,
    - treści `#nextGameContent` z układem `.next-game-grid` (informacje, harmonogram, stoły, lista graczy) oraz notatką `.next-game-note`.
  - Zakładka **Aktualności** (`#updatesTab`) zawiera listę `#nextGameUpdates`.

### 3. Modal instrukcji
- Blok `#instructionModal` jest osadzony na końcu `body` i służy do pokazywania instrukcji obsługi.
- Zawiera nagłówek z tytułem `#instructionTitle`, treść w `#instructionContent`, status `#instructionStatus` i przyciski `#instructionRefresh` oraz `#instructionCloseFooter`.
- Modal jest ukrywany/pokazywany poprzez klasę `.is-visible` i atrybut `aria-hidden`.

### 4. Skrypty
- `../config/firebase-config.js` – wczytywany przed `app.js`, aby zapewnić dostęp do `window.firebaseConfig`.
- `firebase-app-compat.js` oraz `firebase-firestore-compat.js` – biblioteki Firebase wymagane do zapisu wiadomości w Firestore.
- `app.js` – logika przełączeń i renderowania danych przykładowych.

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
- `--font-panel`: Rajdhani – etykiety i elementy UI uppercase.
- `--font-text`: Inter – tekst bazowy.
- `--font-nazwisko`: IBM Plex Sans – nazwiska w tabelach.
- `--font-stawka`: Roboto Mono – liczby i stawki (tabular).
- `--font-chip`: Sora – badge/chipy statusów.
- `--font-log`: Fira Code – styl notatek/logów.

Dodatkowo ustawiono: `text-rendering: geometricPrecision`, `-webkit-font-smoothing: antialiased`, `font-kerning: normal`.

### 3. Tło aplikacji
- `body` ma wielowarstwowy gradient noir z delikatnymi spotlightami.
- `body::before` dodaje subtelne rozświetlenie w stylu sali kasyna.

### 4. Karty i układ
- `.page` ogranicza szerokość i ustawia marginesy.
- `.grid` tworzy responsywną siatkę kart.
- `.card` ma filcowy gradient, złotą linię w `::before`, cień `--shadow` i promień `--radius-lg`.
- `.view-card` stylizowana jak mini-karta z złotą ramką.

### 5. Tabele
- `.table` jest kolumnowym kontenerem dla wierszy.
- `.row` ma tło `--table-bg`, obramowanie `--border2`, tabular-nums.
- `.row.header` ma gradient, uppercase i złotą linię dolną.
- Zastosowano zebra rows (`.row:nth-child(even)`) i hover neon (`.row:hover`).
- Wyrównania: 1 kolumna (nazwisko) z `--font-nazwisko`, 3-4 kolumna right-align z `--font-stawka`.

### 6. Badge/chipy
- `.badge` to chipy z fontem `--font-chip`, uppercase i złotym obramowaniem.
- `.badge.pending` używa palety ruby (stan do zapłaty).

### 7. Przyciski
- `button` to styl „panelowy” (uppercase, `--font-panel`, złote i neonowe glowy).
- `.primary` – złoty gradient, `--glow-gold`.
- `.secondary` – neonowa zieleń, delikatny glow, używana przez przycisk „Instrukcja”.
- `.view-toggle` – czerwony przycisk przełączania widoku (ruby tło, wzmocniony border i czerwony glow).
- `.danger` – ruby, jaśniejszy tekst.

### 8. Strefa uczestnika i zakładki
- `.next-game-card` zajmuje całą szerokość siatki (`grid-column: 1 / -1`).
- `.user-panel` stał się paskiem narzędzi z etykietą `Strefa uczestnika`, przyciskiem `.view-toggle` i zestawem zakładek `.user-tabs`.
- `.tab-button` jest stylizowany na pill, a stan aktywny `.is-active` podbija złoty glow.
- `.tab-panel` przełącza się przez `.is-active`.
- `#nextGamePinGate` używa ramki przerywanej i tła noir, a formularz PIN (`.pin-inputs`) ma spójny styl z innymi polami formularzy.
- `#nextGameContent` jest pokazywany po dodaniu klasy `.is-visible`.
- `.next-game-grid` układa karty informacyjne w responsywną siatkę.
- `.next-game-panel` to półprzezroczyste panele z własnymi nagłówkami.
- `.data-list`, `.timeline-list`, `.chip-list`, `.updates-list` to listy danych prezentujące informacje, harmonogram i komunikaty.
- `.next-game-note` podbija wskazówkę złotą obwódką.
- `.row-3` zmienia układ tabel na 3 kolumny.

### 9. Formularz wiadomości administratora
- `.admin-message` to karta pomocnicza z tłem noir i obramowaniem.
- `textarea` ma styl formularza: tło `rgba(0,0,0,.35)`, obramowanie `--border`, font `--font-text`, focus w złocie + neonie.
- `.status-text` pokazuje komunikaty o wysyłce wiadomości i ładowaniu instrukcji.

### 10. Sekcja PIN w panelu admina
- `.admin-pin` to dodatkowa karta z tłem noir i obramowaniem.
- `.admin-pin-form` używa labeli uppercase, a input ma styl identyczny z polami w PIN gate.
- `.admin-pin-actions` układa przycisk i status w jednym wierszu.

### 11. Informacja o aktualizacji danych
- `.admin-data-hint` to wyróżniona notatka pod przyciskami admina: tło `rgba(0,0,0,.25)`, obramowanie przerywane `var(--border2)` i tekst w kolorze `--muted`.

### 12. Modal instrukcji
- `.modal-overlay` to warstwa tła `rgba(0,0,0,.72)` z centrowanym oknem.
- `.modal-card` ma noir gradient, złotą linię w `::before`, cień 0 20px 60px i max-height 82vh.
- `.modal-content` jest przewijalnym kontenerem z `white-space: pre-wrap`, aby zachować formatowanie Markdown.
- `.icon-button` to kompaktowy przycisk „×”.
- `body.modal-open` blokuje przewijanie tła podczas otwartego modala.

### 13. Widoczność sekcji
- `.admin-only` domyślnie ukryta.
- `.user-only` domyślnie widoczna.
- Klasa `.is-admin` na `<body>` przełącza widoczność; dodatkowo `.card.admin-only` jest pokazywana jako flex.

### 14. Responsywność
- `<720px` wiersze tabel przechodzą do dwóch kolumn i resetują wyrównania liczbowych kolumn.
- `<720px` przyciski w sekcji wiadomości układają się w kolumnie.
- `<520px` karta widoku rozciąga się na pełną szerokość, a przyciski admina układają się w jednej kolumnie.
- Modal na mniejszych ekranach zmniejsza padding i przechodzi w układ jednokolumnowy.

## Opis JavaScript (`Main/app.js`)

### Dane przykładowe
- `sampleTables` – lista stołów z nazwą, statusem, liczbą graczy i kapitanem.
- `samplePlayers` – lista graczy z przypisanym stołem, wpisowym i statusem płatności.
- `samplePayments` – lista rozliczeń z wygranymi i saldem.
- `nextGameInfo` – kluczowe informacje o najbliższej grze (data, lokalizacja, wpisowe).
- `nextGameSchedule` – harmonogram wieczoru (godzina + wydarzenie).
- `nextGameTables` – tabela stołów i blindów.
- `nextGamePlayers` – lista potwierdzonych graczy.
- `nextGameUpdates` – komunikaty do zakładki „Aktualności”.
- Stałe `PIN_LENGTH`, `PIN_STORAGE_KEY` i zmienna `currentPin` opisują logikę PIN-u.

### Funkcje
1. **`getAdminMode()`**
   - Odczytuje parametr `admin` z URL.
   - Zwraca `true` tylko, gdy parametr ma wartość `1`.

2. **`updateViewBadge(isAdmin)`**
   - Aktualizuje etykietę w karcie widoku (`#viewBadge`) na „Administrator” lub „Użytkownik”.

3. **`toggleView()`**
   - Przełącza parametr `admin` w URL (usuwa go lub ustawia na `1`).
   - Po zmianie wykonuje przekierowanie na nowy adres.

4. **`initViewToggle()`**
   - Wyszukuje wszystkie przyciski `.view-toggle`.
   - Podpina `click`, aby przełączać widok.

5. **`renderTables()`**
   - Czyści kontener `#tablesContainer`.
   - Dodaje nagłówek i wiersze na podstawie `sampleTables`.

6. **`renderPlayers()`**
   - Czyści kontener `#playersContainer`.
   - Dodaje nagłówek i wiersze na podstawie `samplePlayers`.
   - Dla statusu płatności tworzy badge (złoty lub ruby).

7. **`renderPayments()`**
   - Czyści kontener `#paymentsContainer`.
   - Dodaje nagłówek i wiersze na podstawie `samplePayments`.

8. **`renderNextGame()` + helpery**
   - `renderNextGameInfo()`, `renderNextGameSchedule()`, `renderNextGameTables()`, `renderNextGamePlayers()`, `renderNextGameUpdates()` wypełniają sekcję „Najbliższa gra”.

9. **`getFirebaseApp()`**
   - Sprawdza dostępność SDK Firebase i konfiguracji (`window.firebaseConfig`).
   - Inicjalizuje Firebase tylko raz i zwraca instancję.

10. **`loadPinFromFirestore()`**
   - Pobiera dokument `app_settings/next_game` i aktualizuje `currentPin`.

11. **`initAdminPin()`**
   - Obsługuje pole `#adminPinInput` i zapis PIN-u do Firestore.
   - Waliduje długość 5 cyfr oraz informuje o błędach.

12. **`initPinGate()`**
   - Waliduje PIN wpisany przez użytkownika w `#nextGamePinInput`.
   - Po poprawnym PIN-ie zapisuje stan w `sessionStorage` i pokazuje `#nextGameContent`.

13. **`initUserTabs()`**
   - Przełącza aktywną zakładkę i panel treści w strefie uczestnika.

14. **`initAdminMessaging()`**
   - Podpina przycisk `#adminMessageSend` do zapisu wiadomości w Firestore (`admin_messages`).
   - Obsługuje walidację pustej treści oraz statusy powodzenia/błędu.

15. **`initInstructionModal()`**
   - Spina przycisk `#adminInstructionButton` z modalem `#instructionModal`.
   - Pobiera treść z `https://cutelittlegoat.github.io/Karty/docs/README.md` i wstawia do `#instructionContent`.
   - Obsługuje odświeżanie treści, zamykanie (przyciski, tło, Esc) i blokadę scrolla tła.

16. **`bootstrap()`**
   - Funkcja startowa: sprawdza tryb admina, aktualizuje klasę `is-admin` na `<body>`.
   - Renderuje dane przykładowe i zakładki.
   - Ładuje PIN z Firestore i uruchamia gate.
   - Uruchamia logikę wysyłki wiadomości oraz modala instrukcji.

### Przepływ działania
1. `bootstrap()` uruchamia się po załadowaniu skryptu.
2. Odczytywany jest tryb admina.
3. Interfejs jest przełączany na podstawie klasy `is-admin`.
4. Dane przykładowe są renderowane do kontenerów tabel oraz sekcji „Najbliższa gra”.
5. Aplikacja próbuje pobrać PIN z Firestore i inicjuje gate PIN-u.
6. Dla admina aktywuje się wysyłka wiadomości, zapis PIN-u oraz modal instrukcji.

## Analiza planowanej funkcji „Najbliższa gra” (PIN)
- W pliku `PIN.md` znajduje się pełna analiza wymaganej funkcji: nowa zakładka widoczna w obu trybach, zabezpieczenie PIN-em oraz zapis PIN-u w Firestore.
- Dokument opisuje zmiany w HTML/CSS/JS, sugerowaną strukturę danych (`app_settings/next_game`) oraz wymagane reguły bezpieczeństwa.

## Firebase i konfiguracja
- Plik `config/firebase-config.js` udostępnia globalny obiekt `window.firebaseConfig`.
- `app.js` inicjalizuje Firebase i zapisuje wiadomości w kolekcji `admin_messages`.
- Kliknięcie **Wyślij** wymaga skonfigurowanych Cloud Functions, aby przesyłać powiadomienia FCM do Androida (opis w `Firebase.md`).

## Migracja Android (WebView + FCM)

### Struktura projektu Android
W `MigracjaAndroid/AndroidApp/` znajduje się kompletny projekt Android Studio z konfiguracją Gradle, manifestem oraz zasobami:
- `settings.gradle`, `build.gradle`, `gradle.properties` – konfiguracja builda i repozytoriów.
- `app/build.gradle` – konfiguracja aplikacji, wersje SDK, zależności Firebase/Material.
- `app/google-services.json` – plik konfiguracyjny FCM dla kompilacji (może zostać podmieniony na produkcyjny).
- `app/src/main/AndroidManifest.xml` – uprawnienia, deklaracja Activity i usługi FCM.
- `app/src/main/java/com/karty/app/*.kt` – logika WebView i powiadomień.
- `app/src/main/res/*` – layouty, kolory, motyw i ikona notyfikacji.

### Opis plików Kotlin
1. **`MainActivity.kt`**
   - Tworzy UI na bazie `activity_main.xml`.
   - Konfiguruje WebView przez `WebViewConfig`.
   - Podpina `KartyWebViewClient`, aby blokować `?admin=1`.
   - Wywołuje `NotificationHelper.ensureChannel` dla kanału notyfikacji.
   - Subskrybuje temat FCM `karty-admin` dla wiadomości z panelu admina.
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

5. **`KartyFirebaseMessagingService.kt`**
   - Odbiera powiadomienia FCM.
   - Przekazuje tytuł i treść do `NotificationHelper.showNotification`.

### Zasoby Android (layout i motyw)
- `activity_main.xml` zawiera pełnoekranowy WebView.
- `colors.xml` definiuje podstawową paletę aplikacji nawiązującą do złota/noir.
- `themes.xml` ustawia motyw `Theme.Karty` (Material 3, bez ActionBar).
- `ic_notification.xml` to wektorowa ikona powiadomień w kolorze złotym.

### Przepływ działania Android
1. Uruchomienie aplikacji ładuje `MainActivity`.
2. WebView otwiera `https://cutelittlegoat.github.io/Karty/Main/index.html`.
3. Każda próba wejścia w `?admin=1` zostaje zablokowana i zastąpiona bezpiecznym URL.
4. Wiadomości FCM wyświetlane są jako lokalne powiadomienia.

## Jak odtworzyć aplikację na podstawie dokumentacji
1. Utwórz `Main/index.html` z nagłówkiem, kartami, panelem admina (w tym przyciskiem „Aktualizuj dane” i notatką o pliku `Turniej.xlsx`) oraz modalem instrukcji opisanymi wyżej.
2. Dodaj `Main/styles.css` z tokenami kasynowymi, gradientowym tłem noir, filcowymi kartami i stylami modala.
3. Dodaj `Main/app.js` z funkcjami `getAdminMode`, `updateViewBadge`, `toggleView`, `initViewToggle`, `renderTables`, `renderPlayers`, `renderPayments`, `initInstructionModal`, `bootstrap`.
4. Połącz pliki w HTML, pamiętając o wczytaniu `../config/firebase-config.js` oraz skryptów Firebase przed `app.js`.
5. Dodaj `DetaleLayout.md` jako repozytorium stylów i `Firebase.md` z instrukcją konfiguracji powiadomień.
6. Jeśli chcesz wersję Android, utwórz projekt na bazie `MigracjaAndroid/AndroidApp` zgodnie z powyższą sekcją.

Dzięki temu można w pełni odtworzyć ten szablon aplikacji.
