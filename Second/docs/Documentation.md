# Second — Dokumentacja techniczna

## 1. Cel modułu
`Second` to niezależny moduł z dwoma trybami renderowania:
- administrator (`?admin=1`),
- użytkownik (bez parametru).

W tej wersji logika danych działa lokalnie w pamięci przeglądarki (bez zapisu trwałego).

## 2. Struktura plików
- `Second/index.html` — struktura UI, szablony administratora i użytkownika.
- `Second/styles.css` — pełny zestaw styli skopiowany z `Main/styles.css` dla 1:1 spójności wizualnej.
- `Second/app.js` — logika przełączania zakładek, formularzy i synchronizacji widoków.

## 3. Frontend — UI i style

### 3.1 Fonty i typografia
W `index.html` ładowane są fonty:
- `Cinzel` (tytuły),
- `Cormorant Garamond` (nagłówki sekcji),
- `Rajdhani` (elementy panelowe),
- `Inter` (treść i pola formularzy).

Po zmianie `Second/styles.css` używa identycznych zmiennych typograficznych i ustawień renderingu jak `Main` (`font-family`, skale font-size, wygładzanie tekstu, kerning).

### 3.2 Kolory, karty, przyciski
`Second/styles.css` zawiera ten sam system tokenów co `Main`:
- gradientowe tło aplikacji,
- zielono-złote karty `.card`,
- identyczne style przycisków `.primary`, `.secondary`, `.danger`,
- takie same stany hover/focus/active,
- te same style zakładek `.admin-panel-tab` i treści `.admin-panel-content`.

Efekt: moduł `Second` ma ten sam wygląd fontów i przycisków co `Main`.

### 3.3 Responsywność
Style mobilne i desktopowe działają wg tych samych reguł media query co w `Main/styles.css`, dzięki czemu zachowanie układu jest spójne między modułami.

## 4. Logika aplikacji (`app.js`)

### 4.1 Stan
Obiekt `state` przechowuje m.in.:
- `news` — treść aktualności,
- `players` — lista graczy z `name`, `pin`, `permissions.chat`,
- `messages` — wiadomości czatu,
- `activeTournamentPage` — aktywna podstrona turnieju.

### 4.2 Tryby renderowania
- Parametr URL `admin=1` montuje widok administratora.
- Brak parametru montuje widok użytkownika.

### 4.3 Zakładki
- Funkcje tabów ustawiają klasę `.is-active` dla przycisku i odpowiadającego panelu.
- Dotyczy zarówno panelu administratora, jak i widoku użytkownika.

### 4.4 Funkcje biznesowe UI
- **Aktualności**: wpis admina synchronizuje się z widokiem użytkownika.
- **Gracze**: walidacja PIN (4 cyfry), dodawanie/usuwanie rekordów tabeli.
- **Czat**: autoryzacja PIN i uprawnienia `chat`, dodawanie wpisów przez użytkownika, usuwanie wpisów przez admina.
- **Turniej**: przyciski panelu bocznego przełączają aktywną treść.

## 5. Dane backendowe
Aktualnie moduł nie wysyła i nie pobiera danych z backendu ani Firebase.
Całość opiera się o lokalny stan JavaScript i renderowanie po stronie klienta.
