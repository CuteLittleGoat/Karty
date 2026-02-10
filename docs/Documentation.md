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
- bramka PIN do zakładki „Najbliższa gra”.

## 2. Struktura plików
- `Main/index.html` — struktura widoków, tabel, zakładek i modali.
- `Main/styles.css` — style layoutu, typografia, komponenty i responsywność.
- `Main/app.js` — pełna logika UI, obsługa Firestore, walidacje, renderowanie.
- `docs/README.md` — instrukcja użytkownika krok po kroku.
- `docs/Documentation.md` — dokumentacja techniczna i opis działania.
- `DetaleLayout.md` — rejestr fontów, kolorów, styli i detali wizualnych.

## 3. HTML (`Main/index.html`)
### 3.1 Układ główny
- Nagłówek strony z tytułami.
- Karta administratora z zakładkami panelu:
  - Aktualności,
  - Gracze,
  - Turnieje,
  - Statystyki.
- Karta „Strefa gracza” (podgląd części użytkownika).
- Modal instrukcji i modal edycji uprawnień gracza.

### 3.2 Zakładka „Gracze”
Tabela zawiera kolumny:
- Nazwa,
- PIN,
- Uprawnienia,
- Akcje.

W kolumnie PIN każdy wiersz renderuje:
- input numeryczny (maks. 5 cyfr),
- przycisk `Losuj` do wygenerowania unikalnego kodu.

## 4. CSS (`Main/styles.css`)
### 4.1 Tokeny i fonty
- Fonty: `Cinzel`, `Cormorant Garamond`, `Rajdhani`, `Inter`.
- Kolory zdefiniowane jako custom properties (`--bg`, `--gold`, `--neon`, `--danger` itd.).

### 4.2 Komponenty
- `button.primary`, `button.secondary`, `button.danger` — trzy warianty akcji.
- `.admin-input` — wspólny styl pól formularzy administratora.
- `.admin-players`, `.players-table`, `.permissions-tags` — layout modułu graczy.
- `.pin-control` — kontener flex łączący pole PIN i przycisk `Losuj`.
- `.admin-pin-random` — styl przycisku losowania PIN (mniejszy, kompaktowy wariant secondary).

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

## 5.3 Bramka PIN użytkownika (`initPinGate`)
- Użytkownik wpisuje PIN i klika `Otwórz`.
- Dostęp zależy od:
  - poprawnego 5-cyfrowego PIN,
  - zgodności PIN -> gracz,
  - uprawnienia `nextGameTab`.

## 5.4 Inne moduły
- `initAdminMessaging()` — wysyłanie wiadomości do graczy (`admin_messages`).
- `initLatestMessage()` — odczyt najnowszej wiadomości i render po stronie gracza.
- `initAdminTables()` — operacje CRUD na turniejach i wierszach tabeli.
- `initAdminPanelTabs()` + `initUserTabs()` — zarządzanie zakładkami.
- `initInstructionModal()` — modal instrukcji z odświeżaniem treści.

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
   - bramkę dostępu po PIN i uprawnieniach.
4. Podłącz konfigurację Firebase (`config/firebase-config.js`) i biblioteki compat.
