# Detale layoutu (casino vibe)

## 1) Fonty i rendering
- Fonty: `Cinzel`, `Cormorant Garamond`, `Inter`, `Rajdhani` (Google Fonts z latin-ext).
- Wymagane ustawienia renderingu:
  - `text-rendering: geometricPrecision;`
  - `-webkit-font-smoothing: antialiased;`
  - `font-kerning: normal;`

## 2) Paleta kolorów
- Tło noir: `--bg #07070a`, `--bg2 #0c0d12`.
- Tekst: `--ink #edebe6`, `--muted rgba(237, 235, 230, 0.72)`.
- Złoto: `--gold #d4af37`, `--gold-line rgba(212, 175, 55, 0.35)`.
- Zieleń neonowa: `--neon #2be38b`.
- Danger: `--danger rgba(226, 58, 75, 0.95)`.

## 3) Globalny układ
- `.page` max-width: `1200px`, padding `40px 24px 80px`.
- `.grid` responsywna siatka kart.
- `.card` gradient filc/noir, złota obwódka (`::before`), cień i zaokrąglenia.

## 4) Przyciski
- Bazowy `button`: uppercase, `Rajdhani`, border + delikatny hover (`translateY(-1px)`).
- `button.primary`: złoty gradient i glow.
- `button.secondary`: zielony neon.
- `button.danger`: czerwony wariant do usuwania.

## 5) Elementy UI po przebudowie panelu administratora

### 5.1 Panel Administratora
- `.admin-panel-card` zajmuje pełną szerokość siatki (`grid-column: 1 / -1`).
- Tytuł panelu: „Panel Administratora”.
- Zakładki: `Aktualności`, `Gracze`, `Turnieje`, `Gry`, `Statystyki`.

### 5.2 Zakładka „Gracze” — PIN i losowanie
- W kolumnie PIN każdy wiersz używa kontenera `.pin-control`:
  - `display: flex`,
  - `gap: 8px`,
  - `align-items: center`.
- Pole PIN (`.pin-control .admin-input`) ma minimalną szerokość `108px`, żeby obok mieścił się przycisk.
- Przycisk `Losuj` ma klasę `.admin-pin-random`:
  - padding `8px 12px`,
  - font-size `11px`,
  - letter-spacing `0.12em`,
  - `flex-shrink: 0` (nie zwęża się przy mniejszej szerokości).

### 5.3 Pozostałe elementy zakładki „Gracze”
- `.admin-players` — karta wewnętrzna z tłem noir (`rgba(0,0,0,.32)`), border `--border2`, padding `16px`.
- `.players-table` — minimalna szerokość `700px`.
- `.permissions-tags`, `.permission-badge`, `.admin-permissions-edit` — wizualizacja i edycja uprawnień.

### 5.4 Nagłówek panelu administratora i odświeżanie
- `.admin-panel-header` ustawia układ flex dla tytułu i przycisku:
  - `display: flex`,
  - `justify-content: space-between`,
  - `align-items: center`,
  - `flex-wrap: wrap` dla małych szerokości.
- Przycisk `Odśwież` znajduje się w prawym górnym rogu karty „Panel Administratora”.
- Obok przycisku widoczny jest komunikat statusu (`#adminPanelRefreshStatus`, klasa `.status-text`) pokazujący etapy ręcznego odświeżenia danych aktywnej zakładki.

### 5.5 Oznaczenia uprawnień graczy
- `.permission-badge` używa złotego stylu jak aktywna zakładka:
  - border `var(--gold-line)`,
  - tło `rgba(212, 175, 55, 0.2)`,
  - kolor tekstu `var(--gold)`,
  - `box-shadow: var(--glow-gold)`.
- `.permission-badge.is-empty` pozostaje neutralny (ciemny), aby odróżnić brak uprawnień od przyznanych dostępów.

### 5.6 Zakładka „Gry”
- `.admin-games-layout`:
  - `display: grid`,
  - kolumny `220px` + `1fr`,
  - odstęp `var(--gap-3)`.
- `.admin-games-sidebar` i `.admin-games-content`:
  - tło noir `rgba(0, 0, 0, 0.32)`,
  - border `1px solid var(--border2)`,
  - zaokrąglenie `var(--radius-md)`,
  - padding `16px`.
- `.admin-games-years-actions` i `.admin-games-years-list` renderują pionowe grupy przycisków.
- `.admin-games-year-button.is-active` używa złotego stanu aktywnego jak zakładki (`--gold-line`, `--gold`, `--glow-gold`).
- `.admin-games-link` (nazwa gry w tabeli):
  - wygląda jak link (brak obramowania i tła),
  - kolor `var(--gold)`,
  - hover: podkreślenie bez transformacji i bez glow.

## 6) Zakładki użytkownika
- `tab-button` zachowuje styl pill.
- `tab-button.is-active` — złoty aktywny stan.
- PIN gate w ramce dashed gold (`.pin-gate`) i z kartą `.pin-card`.
- Sekcja „Strefa gracza” pozostaje na dole strony (`.next-game-card`).

## 7) Responsywność
- `<720px`: przyciski i elementy modalne układają się pionowo; układ zakładki „Gry” przechodzi z 2 kolumn na 1 kolumnę.
- `<520px`: mniejszy padding modala.
