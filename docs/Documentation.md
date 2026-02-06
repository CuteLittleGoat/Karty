# Dokumentacja techniczna - Karty

## Cel aplikacji
Aplikacja jest szablonem strony do organizacji turnieju karcianego. Udostępnia dwa warianty interfejsu:
- **Widok użytkownika** (domyślny) – uczestnik widzi przypisanie do stołu, wpisowe i saldo wygranych.
- **Widok administratora** (po dodaniu `?admin=1` do URL) – rozszerzony o sekcję zarządzania stołami i graczami.

Interfejs jest utrzymany w stylistyce kasyna (noir, złoto, filcowa zieleń, delikatny neon). Projekt korzysta z tokenów typografii i kolorów opisanych w `DetaleLayout.md`.

## Struktura plików
- `index.html` – szkielet strony, kontenery dla danych i przyciski admina.
- `styles.css` – kompletne style wizualne (tokeny kolorów, fonty, układ, komponenty).
- `app.js` – logika przełączania widoków i renderowania danych przykładowych.
- `config/firebase-config.js` – miejsce na konfigurację Firebase.
- `Firebase.md` – instrukcja konfiguracji Firebase.
- `docs/README.md` – instrukcje obsługi dla użytkownika.
- `DetaleLayout.md` – repozytorium stylów, fontów i wytycznych projektu.
- `Pliki/` – katalog na zasoby graficzne.

## Opis HTML (`index.html`)

### 1. Nagłówek strony
- `<header class="page-header">` zawiera:
  - **Eyebrow** „Turniej karciany” (`.eyebrow`).
  - **Tytuł** `Panel organizacji` i opis działania wariantów (`h1`, `.subtitle`).
  - **Karta widoku** (`.view-card`) z etykietą trybu (`.view-label`), badge trybu (`#viewBadge`) i podpowiedzią (`.view-hint`).

### 2. Sekcje główne (`<main class="grid">`)
Układ korzysta z siatki CSS i składa się z kart:
1. **Stoły i gracze** – kontener `#tablesContainer`.
2. **Lista graczy** – kontener `#playersContainer`.
3. **Rozliczenia** – kontener `#paymentsContainer`.
4. **Panel administratora** – sekcja `.admin-only` (przyciski akcji i notatka).
5. **Co dalej?** – sekcja `.user-only` (lista kroków dla uczestnika).

### 3. Skrypty
- `config/firebase-config.js` – wczytywany przed `app.js`, aby zapewnić dostęp do `window.firebaseConfig`.
- `app.js` – logika przełączeń i renderowania danych przykładowych.

## Opis CSS (`styles.css`)

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
- `.danger` – ruby, jaśniejszy tekst.

### 8. Widoczność sekcji
- `.admin-only` domyślnie ukryta.
- `.user-only` domyślnie widoczna.
- Klasa `.is-admin` na `<body>` przełącza widoczność.

### 9. Responsywność
- `<720px` wiersze tabel przechodzą do dwóch kolumn i resetują wyrównania liczbowych kolumn.

## Opis JavaScript (`app.js`)

### Dane przykładowe
- `sampleTables` – lista stołów z nazwą, statusem, liczbą graczy i kapitanem.
- `samplePlayers` – lista graczy z przypisanym stołem, wpisowym i statusem płatności.
- `samplePayments` – lista rozliczeń z wygranymi i saldem.

### Funkcje
1. **`getAdminMode()`**
   - Odczytuje parametr `admin` z URL.
   - Zwraca `true` tylko, gdy parametr ma wartość `1`.

2. **`updateViewBadge(isAdmin)`**
   - Aktualizuje etykietę w karcie widoku (`#viewBadge`) na „Administrator” lub „Użytkownik”.

3. **`renderTables()`**
   - Czyści kontener `#tablesContainer`.
   - Dodaje nagłówek i wiersze na podstawie `sampleTables`.

4. **`renderPlayers()`**
   - Czyści kontener `#playersContainer`.
   - Dodaje nagłówek i wiersze na podstawie `samplePlayers`.
   - Dla statusu płatności tworzy badge (złoty lub ruby).

5. **`renderPayments()`**
   - Czyści kontener `#paymentsContainer`.
   - Dodaje nagłówek i wiersze na podstawie `samplePayments`.

6. **`bootstrap()`**
   - Funkcja startowa: sprawdza tryb admina, aktualizuje klasę `is-admin` na `<body>`.
   - Wywołuje funkcje renderujące.

### Przepływ działania
1. `bootstrap()` uruchamia się po załadowaniu skryptu.
2. Odczytywany jest tryb admina.
3. Interfejs jest przełączany na podstawie klasy `is-admin`.
4. Dane przykładowe są renderowane do kontenerów.

## Firebase i konfiguracja
- Plik `config/firebase-config.js` udostępnia globalny obiekt `window.firebaseConfig`.
- Po dodaniu SDK Firebase w przyszłości, dane z `window.firebaseConfig` będą przekazywane do inicjalizacji aplikacji.

## Jak odtworzyć aplikację na podstawie dokumentacji
1. Utwórz `index.html` z nagłówkiem, kartami i kontenerami opisanymi wyżej.
2. Dodaj `styles.css` z tokenami kasynowymi, gradientowym tłem noir, filcowymi kartami i tabelami.
3. Dodaj `app.js` z funkcjami `getAdminMode`, `updateViewBadge`, `renderTables`, `renderPlayers`, `renderPayments`, `bootstrap`.
4. Połącz pliki w HTML, pamiętając o wczytaniu `config/firebase-config.js` przed `app.js`.
5. Dodaj `DetaleLayout.md` jako repozytorium stylów i `Firebase.md` z instrukcją konfiguracji.

Dzięki temu można w pełni odtworzyć ten szablon aplikacji.
