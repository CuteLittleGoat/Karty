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

## 5) Nowe elementy UI (zmiana 2026-02)

### 5.1 Zakładki panelu administratora
- `.admin-panel-tabs` — pozioma lista przycisków zakładek.
- `.admin-panel-tab` — styl „pill”, inactive: ciemny.
- `.admin-panel-tab.is-active` — aktywny złoty stan.
- `.admin-panel-content` — kontener treści zakładki (`display: none`),
- `.admin-panel-content.is-active` — aktywna treść (`display: grid`).

### 5.2 Tabela „Gracze”
- `.admin-players` — karta wewnętrzna z tłem noir (`rgba(0,0,0,.32)`), border `--border2`, padding `16px`.
- `.players-table` — minimalna szerokość `700px`.
- `.permissions-tags` — flex-wrap badge’y uprawnień.
- `.permission-badge` — małe etykiety (zielony border/tło, uppercase).
- `.permission-badge.is-empty` — neutralny wariant „Brak dodatkowych uprawnień”.
- `.admin-permissions-edit` — mniejszy przycisk „Edytuj”.

### 5.3 Modal uprawnień
- Używa bazowego `.modal-overlay` i `.modal-card`.
- `.modal-card-sm` zmniejsza szerokość modala do `min(520px, 100%)`.
- `.permissions-list` i `.permissions-item` organizują listę checkboxów.

### 5.4 Sekcja archiwalnego PIN-u
- `.admin-pin` zmieniono na szary wariant:
  - tło `rgba(125, 125, 125, 0.24)`,
  - border `rgba(255, 255, 255, 0.14)`.
- Teksty pomocnicze są lekko rozjaśnione (`rgba(237, 235, 230, 0.8)`).
- Dodano `.admin-pin-legacy-note` dla opisu, że przyciski to pozostałość po usuniętej funkcji.

## 6) Zakładki użytkownika
- `tab-button` zachowuje styl pill.
- `tab-button.is-active` — złoty aktywny stan.
- PIN gate nadal w ramce dashed gold (`.pin-gate`) i z kartą `.pin-card`.

## 7) Responsywność
- `<720px`: przyciski w sekcji wiadomości i elementy modala układają się pionowo.
- `<520px`: mniejszy padding modala.
