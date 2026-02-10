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
- Zakładki: `Aktualności`, `Gracze`, `Turnieje`, `Statystyki`.
- Zakładki używają:
  - `.admin-panel-tabs` (kontener),
  - `.admin-panel-tab` (pill),
  - `.admin-panel-tab.is-active` (złoty aktywny stan),
  - `.admin-panel-content` / `.admin-panel-content.is-active` (ukrywanie/pokazywanie treści).

### 5.2 Zakładka „Aktualności”
- Sekcja `.admin-message` pozostaje wizualnie jak wcześniej.
- Pole wiadomości jest szersze dzięki pełnoszerokiemu panelowi nadrzędnemu.

### 5.3 Zakładka „Gracze”
- `.admin-players` — karta wewnętrzna z tłem noir (`rgba(0,0,0,.32)`), border `--border2`, padding `16px`.
- `.players-table` — minimalna szerokość `700px`.
- `.permissions-tags`, `.permission-badge`, `.admin-permissions-edit` — wizualizacja i edycja uprawnień.

### 5.4 Zakładka „Turnieje”
- Funkcjonalność dawnych „Stołów” umieszczona w `.admin-tournaments`.
- Używa istniejących klas:
  - `.admin-tables-header`,
  - `.admin-tables-list`,
  - `.admin-table-card`,
  - `.admin-summary`.

### 5.5 Zakładka „Statystyki”
- Placeholder `.admin-stats-placeholder`:
  - padding `20px`,
  - border `1px solid var(--border2)`,
  - tło `rgba(0,0,0,.32)`,
  - font `var(--font-subtitle)`, rozmiar `22px`.

### 5.6 Usunięte elementy
- Usunięto cały segment stylów `.admin-pin*` (archiwalny PIN administratora).

## 6) Zakładki użytkownika
- `tab-button` zachowuje styl pill.
- `tab-button.is-active` — złoty aktywny stan.
- PIN gate nadal w ramce dashed gold (`.pin-gate`) i z kartą `.pin-card`.
- Sekcja „Strefa gracza” pozostaje na dole strony (`.next-game-card`).

## 7) Responsywność
- `<720px`: przyciski w sekcji wiadomości i elementy modala układają się pionowo.
- `<520px`: mniejszy padding modala.
