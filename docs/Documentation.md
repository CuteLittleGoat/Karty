# Dokumentacja techniczna - Karty

## Cel aplikacji
Aplikacja jest szablonem strony do organizacji turnieju karcianego. Udostępnia dwa warianty interfejsu:
- **Widok użytkownika** (domyślny) – uczestnik widzi przypisanie do stołu, wpisowe i saldo wygranych.
- **Widok administratora** (po dodaniu `?admin=1` do URL) – rozszerzony o sekcję zarządzania stołami i graczami.

## Struktura plików
- `index.html` – szkielet strony, kontenery dla danych i przyciski admina.
- `styles.css` – kompletne style wizualne (kolory, układ, komponenty).
- `app.js` – logika przełączania widoków i renderowania danych przykładowych.
- `config/firebase-config.js` – miejsce na konfigurację Firebase.
- `Firebase.md` – instrukcja krok po kroku konfiguracji Firebase.
- `docs/README.md` – instrukcje obsługi dla użytkownika (PL/EN).
- `Pliki/` – katalog na zasoby graficzne.

## Opis HTML (`index.html`)

### 1. Nagłówek strony
- Sekcja `<header class="page-header">` zawiera:
  - **Eyebrow** z napisem „Turniej karciany”.
  - **Tytuł** `Panel organizacji` i opis działania wariantów.
  - **Karta widoku** (`.view-card`) pokazuje aktualny tryb (użytkownik/admin) i informację o automatycznym przełączeniu po parametrze URL.

### 2. Sekcje główne (`<main class="grid">`)
Układ korzysta z siatki CSS i składa się z kilku kart:
1. **Stoły i gracze** – kontener `#tablesContainer` do renderowania tabeli stołów.
2. **Lista graczy** – kontener `#playersContainer` z wpisowym i statusem płatności.
3. **Rozliczenia** – kontener `#paymentsContainer` z informacją o wygranych.
4. **Panel administratora** – sekcja `.admin-only` widoczna tylko w trybie admina.
5. **Co dalej?** – sekcja `.user-only` widoczna tylko w trybie użytkownika.

### 3. Skrypty
- `config/firebase-config.js` – wczytywany przed `app.js`, aby zapewnić dostęp do `window.firebaseConfig`.
- `app.js` – logika przełączeń i renderowania danych przykładowych.

## Opis CSS (`styles.css`)

### 1. Zmienne CSS
W `:root` zdefiniowano paletę kolorów i cienie:
- `--bg`: tło aplikacji (#f5f6fb).
- `--card`: kolor kart (#ffffff).
- `--text`: podstawowy kolor tekstu (#1f2432).
- `--muted`: kolor tekstu pomocniczego (#5d667a).
- `--accent`: kolor akcentu (#4454ff).
- `--accent-soft`: miękkie tło akcentu (#ebedff).
- `--border`: obramowania (#e3e7f0).
- `--success`: zielony status (#22b07d).
- `--danger`: czerwony status (#f2545b).

### 2. Typografia i fonty
- Użyty font: **Inter** z Google Fonts (`400/500/600/700`).
- Teksty nagłówków i akcentów mają zwiększoną wagę (`600-700`).
- `.eyebrow` ma uppercase i większy letter-spacing.

### 3. Układ i karty
- `.page` ogranicza szerokość do 1200 px i dodaje marginesy.
- `.grid` tworzy responsywną siatkę kart (auto-fit).
- `.card` to główny komponent z zaokrągleniami, cieniem i odstępami.

### 4. Tabele danych
- `.table` jest kontenerem z wierszami.
- `.row` to wiersz siatki 4-kolumnowej.
- `.row.header` ma uppercase i mniejszy rozmiar tekstu.

### 5. Badge i statusy
- `.badge` oznacza opłacone wpisowe.
- `.badge.pending` oznacza brak wpłaty.

### 6. Przełączanie widoków
- `.admin-only` domyślnie ma `display: none`.
- `.user-only` domyślnie jest widoczny.
- Klasa `.is-admin` dodana do `<body>` przełącza widoczność obu sekcji.

### 7. Responsywność
- Dla ekranów poniżej 720 px wiersze tabel przechodzą do układu 2-kolumnowego.

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
   - Dla statusu płatności tworzy badge (zielony lub pomarańczowy).

5. **`renderPayments()`**
   - Czyści kontener `#paymentsContainer`.
   - Dodaje nagłówek i wiersze na podstawie `samplePayments`.

6. **`bootstrap()`**
   - Główna funkcja startowa.
   - Sprawdza tryb admina, aktualizuje klasę `is-admin` na `<body>`.
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
2. Dodaj `styles.css` z opisanymi zmiennymi kolorów, fontem Inter i układem kart.
3. Dodaj `app.js` z funkcjami `getAdminMode`, `updateViewBadge`, `renderTables`, `renderPlayers`, `renderPayments`, `bootstrap`.
4. Połącz pliki w HTML, pamiętając o wczytaniu `config/firebase-config.js` przed `app.js`.
5. Dodaj `Firebase.md` z instrukcjami konfiguracji.

Dzięki temu można w pełni odtworzyć ten szablon aplikacji.
