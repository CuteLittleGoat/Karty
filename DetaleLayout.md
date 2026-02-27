# Detale layoutu i stylu — aktualny stan (Main + Second)

Ten plik jest **aktualnym źródłem prawdy** dla wspólnych zasad wizualnych modułów **Main** i **Second**.

---

## 1) Fonty i typografia

### 1.1 Fonty ładowane zewnętrznie (Google Fonts)
W obu modułach (`Main/index.html`, `Second/index.html`) ładowane są te same rodziny:
- **Cinzel** (600, 700) — nagłówki główne,
- **Cormorant Garamond** (600) — nagłówki sekcji i tytuły paneli,
- **Inter** (400, 500, 600, 700) — tekst bazowy,
- **Rajdhani** (600) — elementy panelowe, etykiety, przyciski.

### 1.2 Fallbacki i mapowanie fontów przez zmienne CSS
W `:root` (oba moduły):
- `--font-title`: `"Cinzel", "Trajan Pro", "Times New Roman", serif`.
- `--font-subtitle`: `"Cormorant Garamond", "Georgia", serif`.
- `--font-panel`: `"Rajdhani", "Segoe UI", "Noto Sans", sans-serif`.
- `--font-text`: `"Inter", "Segoe UI", "Noto Sans", Arial, sans-serif`.

### 1.3 Rozmiary typografii i rytm
Wspólne skale typograficzne:
- `--fs-title: clamp(26px, 3.2vw, 40px)`.
- `--fs-subtitle: clamp(16px, 1.8vw, 22px)`.
- `--fs-panel: 13px`.
- `--fs-body: 14.5px`.
- `--fs-small: 12px`.

Najważniejsze reguły:
- `h1`: uppercase, `letter-spacing: 0.12em`, font `--font-title`.
- `.eyebrow`: uppercase, `letter-spacing: 0.18em`, font `--font-panel`.
- Treść (`body`, textarea, inputy): font `--font-text`.
- Tytuły kart i modalów (`h2`, `h3`): font `--font-subtitle`.

---

## 2) Kolory, tła, obramowania i cienie

### 2.1 Paleta bazowa (zmienne `:root`)
W obu modułach obowiązuje ta sama paleta:
- Tła:
  - `--bg: #07070a`,
  - `--bg2: #0c0d12`,
  - `--felt: #0f3b2e`,
  - `--felt2: #0a2a21`.
- Tekst:
  - `--ink: #edebe6`,
  - `--muted: rgba(237, 235, 230, 0.72)`.
- Akcenty:
  - `--gold: #d4af37`, `--gold2: #b78c2a`,
  - `--neon: #2be38b`,
  - `--ruby: #b11226`, `--ruby2: #e23a4b`,
  - `--danger: rgba(226, 58, 75, 0.95)`.
- Linie i obramowania:
  - `--border: rgba(255, 255, 255, 0.1)`,
  - `--border2: rgba(255, 255, 255, 0.06)`,
  - `--divider: rgba(255, 255, 255, 0.08)`,
  - `--gold-line: rgba(212, 175, 55, 0.35)`.
- Efekty:
  - `--shadow: 0 12px 34px rgba(0, 0, 0, 0.55)`,
  - `--shadow-inset: inset 0 0 0 1px rgba(255, 255, 255, 0.04)`,
  - `--glow-gold: 0 0 18px rgba(212, 175, 55, 0.22)`,
  - `--glow-neon: 0 0 18px rgba(43, 227, 139, 0.18)`.

### 2.2 Tło globalne i warstwa świetlna
`body` korzysta z wielowarstwowego tła:
- radialny złoty glow,
- radialny zielony glow,
- liniowy gradient pionowy (`--bg2` → `--bg`).

Dodatkowo `body::before` nakłada subtelny świetlny overlay (`opacity: 0.25`) z radialnymi poświatami.

### 2.3 Karty, panele i modale
- Karty (`.card`) mają gradient zielonego „filcu”, cienkie ramki, duży cień i dodatkową złotą linię wewnętrzną przez `::before`.
- Modale (`.modal-card`) trzymają ten sam język wizualny: ciemne tło, złota linia, obwódki i pełnoekranowy overlay.
- Tabele admina i sekcje panelowe bazują na półprzezroczystych ciemnych tłach (`rgba(0,0,0,0.3)` i pochodnych).

---

## 3) System layoutu

### 3.1 Szkielet strony
- Kontener `.page`: `width: min(1720px, 100%)`, centralnie, `padding: 40px 24px 80px`.
- Nagłówek `.page-header`: flex, zawijanie elementów i odstępy oparte na zmiennych `--gap-*`.
- Główna siatka `.grid`: `repeat(auto-fit, minmax(280px, 1fr))`.

### 3.2 Skala spacingu i promieni
- Odstępy: `--gap-1..--gap-5` = `8px, 12px, 16px, 24px, 32px`.
- Promienie: `--radius-sm/md/lg` = `10px, 14px, 18px`.

### 3.3 Tabele i formularze
- Tabele administracyjne: `border-collapse: collapse`, hover wiersza, sticky estetyka panelowa.
- W `Main` główna tabela statystyk graczy (`.admin-games-players-stats-table`) stosuje zebra striping: parzyste wiersze mają tło `rgba(237, 235, 230, 0.04)`, co poprawia czytelność szerokiego zestawu kolumn.
- Inputy, selecty, textarea: spójny ciemny styl, jasny tekst, obwódki i efekty focus (złoto/neon zależnie od kontekstu).
- Przyciski:
  - `.primary` — nacisk na akcent złoty,
  - `.secondary` — neutralny wariant panelowy,
  - `.danger` — czerwony wariant akcji destrukcyjnych.

---

## 4) Style stref funkcjonalnych (wspólne założenia)

- **Panel administratora**: zakładki, sekcje kartowe, tabele danych i formularze w jednym spójnym systemie kolorów.
- W panelu administratora (Main i Second) zakładka **Notatki** korzysta z tego samego układu co **Regulamin**: duży `textarea` (`rows=50`), etykieta nad polem i dolny pasek akcji z przyciskiem `Zapisz` oraz statusem (`.admin-rules-actions`).
- **Strefa gracza**: karty z czytelną hierarchią nagłówków, statusy i formularze czatu/notatek; tabele przewijają się poziomo wewnątrz panelu, gdy brakuje szerokości, również na mobile.
- W sekcji Czat kontener listy wiadomości (`.chat-messages`) ma stałą minimalną wysokość (`260px`, na ekranach do 720px: `180px`), pionowy scrollbar (`overflow-y: auto`) i stylowany uchwyt suwaka dla czytelności historii rozmowy; przy otwieraniu widoku Czat suwak jest domyślnie ustawiany na sam dół listy.
- **Modale funkcjonalne** (logowanie, instrukcja, szczegóły): wspólny layout i zachowanie wizualne.
- **Statusy**: `.status-text` oraz wariant błędu `.status-text-danger` wykorzystują odpowiednio neutralny i „danger” kolor.
- W `Main` w zakładce **Kalkulator → Tournament → Tabela5** pod tabelą może pojawić się czerwony komunikat walidacyjny `Nie sumuje się do 100%` (klasy `.status-text.status-text-danger`), kiedy suma procentów w kolumnie `Podział puli` jest różna od 100.

---

## 5) Responsywność

W obu modułach stosowane są media query, które:
- układają nagłówek i paski narzędzi pionowo na mniejszych szerokościach,
- utrzymują czytelność tabel przez poziome przewijanie (`overflow-x: auto`) w obrębie panelu, bez wychodzenia tabel poza kartę,
- dostosowują sekcje panelowe do małych ekranów bez utraty funkcjonalności.

---

## 6) Różnice między modułami

Większość stylów `Main/styles.css` i `Second/styles.css` jest taka sama. Aktualnie kluczowa różnica układowa dotyczy panelu `#adminGamesTab .admin-games-layout`:
- **Main**: `grid-template-columns: 190px minmax(0, 1fr) 300px`.
- **Second**: `grid-template-columns: 220px minmax(0, 1fr) 260px`.

To oznacza, że w **Second** lewy panel lat jest szerszy, a prawa kolumna rankingu węższa.

### 6.1 Wspólny komunikat testowy przy przycisku Instrukcja
W obu modułach (`Main`, `Second`) obok przycisku **Instrukcja** w pasku `.admin-toolbar` wyświetlany jest czerwony napis:
- `tymczasowo brak potrzeby wpisywania hasła admina`

Parametry stylu tego komunikatu (`.admin-password-bypass-note`):
- kolor: `#ff4d4d`,
- rozmiar: `var(--fs-small)`,
- grubość: `700`.

---

## 7) Zasada aktualizacji

Każda zmiana wizualna (font, kolor, cień, spacing, układ, modal, tabela, formularz) w `Main` lub `Second` powinna być od razu odzwierciedlona w tym pliku, tak aby dokument pozostawał kompletnym i aktualnym opisem layoutu.
